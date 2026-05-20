from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from dotenv import load_dotenv
from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore
from langchain_core.prompts import PromptTemplate
from langchain_classic.chains import RetrievalQA
from langchain_community.llms import LlamaCpp
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from authlib.integrations.flask_client import OAuth
from src.helper import download_hugging_face_embeddings
from src.prompt import prompt_template
from src.database import db, User, ChatHistory, IssueReport
import re
import os

# Load Environment Variables
load_dotenv()

# Flask App
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

# PostgreSQL Config
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize Database
db.init_app(app)

# Login Manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# OAuth Setup
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# Pinecone API Key
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
os.environ["PINECONE_API_KEY"] = PINECONE_API_KEY

# Initialize Pinecone
pc = Pinecone(api_key=PINECONE_API_KEY)

# Embedding Model
embeddings = download_hugging_face_embeddings()

# Pinecone Index Name
index_name = "medical-chatbot"

# Load Existing Pinecone Index
docsearch = PineconeVectorStore.from_existing_index(
    index_name=index_name,
    embedding=embeddings
)

# Prompt Template
PROMPT = PromptTemplate(
    template=prompt_template,
    input_variables=["context", "question"]
)
chain_type_kwargs = {"prompt": PROMPT}

# Load Mistral Model
llm = LlamaCpp(
    model_path="model/mistral-7b-instruct-v0.2.Q4_K_M.gguf",
    temperature=0.0,
    max_tokens=350,
    top_p=0.9,
    repeat_penalty=1.15,
    n_ctx=2048,
    n_threads=2,
    n_batch=64,
    stop=["Question:", "User:"],
    verbose=False
)

# Create Retrieval QA Chain
qa = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=docsearch.as_retriever(
        search_type="mmr",
        search_kwargs={
            "k": 2,
            "fetch_k": 6,
            "lambda_mult": 0.5
        }
    ),
    return_source_documents=True,
    chain_type_kwargs=chain_type_kwargs
)


# Similarity Score Threshold Check
def get_relevant_docs_with_threshold(query, threshold=0.75):
    results = docsearch.similarity_search_with_relevance_scores(query, k=2)
    filtered = [doc for doc, score in results if score >= threshold]
    return filtered


# ✅ FIXED: Medical Query Check via Mistral
def is_medical_query_llm(query):
    check_prompt = f"""<s>[INST] Is this question STRICTLY about human disease, medical symptom, drug, surgery, or clinical treatment? Answer only YES or NO. If unsure, answer NO.
Question: {query} [/INST]"""
    result = llm.invoke(check_prompt, max_tokens=5, temperature=0.0)
    return "YES" in result.strip().upper()


# Clean Response Helper
def clean_response(text):
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[-=*]{2,}', '', text)
    text = text.replace("•", "\n•")
    text = text.replace("*", "\n•")
    text = text.replace("===", "")
    text = re.sub(r'\n+', '\n', text)
    return text.strip()


# Home Route
@app.route("/")
def index():
    return render_template("chat.html")


# Google Login Route
@app.route("/login")
def login():
    redirect_uri = url_for("auth_callback", _external=True)
    return google.authorize_redirect(redirect_uri)


# Google OAuth Callback
@app.route("/login/callback")
def auth_callback():
    token = google.authorize_access_token()
    user_info = token["userinfo"]
    user = User.query.filter_by(email=user_info["email"]).first()
    if not user:
        user = User(
            google_id=user_info["sub"],
            name=user_info["name"],
            email=user_info["email"],
            profile_pic=user_info["picture"]
        )
        db.session.add(user)
        db.session.commit()
    login_user(user)
    return redirect("/")


# Logout Route
@app.route("/logout")
def logout():
    if current_user.is_authenticated:
        logout_user()
    return redirect("/")


# Chat Route
@app.route("/get", methods=["POST"])
def chat():
    if not current_user.is_authenticated:
        return jsonify({"error": "login_required"}), 401

    msg = request.form["msg"]
    print("User Input:", msg)

    # ✅ Step 1: Medical query check via Mistral — sabse pehle
    if not is_medical_query_llm(msg):
        print("Medical check failed — non-medical query")
        return jsonify({
            "answer": "I can only answer medical questions based on the Gale Encyclopedia of Medicine.",
            "sources": []
        })

    # Step 2: Similarity threshold check
    relevant_docs = get_relevant_docs_with_threshold(msg, threshold=0.75)
    if not relevant_docs:
        print("Threshold check failed — no relevant docs found")
        return jsonify({
            "answer": "I can only answer medical questions based on the Gale Encyclopedia of Medicine.",
            "sources": []
        })

    # Step 3: LLM call
    result = qa.invoke({"query": msg})
    response = result["result"]
    source_docs = result["source_documents"]

    if not source_docs:
        return jsonify({
            "answer": "I could not find enough medical information on this topic.",
            "sources": []
        })

    response = clean_response(response)
    print("Response:", response)

    # Step 4: Agar LLM ne refuse kiya toh sources mat dikhao
    REFUSAL_PHRASE = "I can only answer medical questions"
    if REFUSAL_PHRASE in response:
        return jsonify({
            "answer": "I can only answer medical questions based on the Gale Encyclopedia of Medicine.",
            "sources": []
        })

    # Step 5: Sources extract karo (sirf valid medical answer pe)
    sources = []
    for doc in source_docs:
        meta = doc.metadata
        source = {
            "file": meta.get("source", "Gale Encyclopedia of Medicine"),
            "page": int(meta.get("page", 0)) + 1
        }
        if source not in sources:
            sources.append(source)

    # Step 6: Save Chat History
    chat_data = ChatHistory(
        user_id=current_user.id,
        question=msg,
        answer=response
    )
    db.session.add(chat_data)
    db.session.commit()

    return jsonify({
        "answer": response,
        "sources": sources
    })


# Get Chat History
@app.route("/history")
def history():
    if not current_user.is_authenticated:
        return jsonify([])
    chats = ChatHistory.query.filter_by(user_id=current_user.id).all()
    data = []
    for chat in chats:
        data.append({
            "id": chat.id,
            "question": chat.question,
            "answer": chat.answer
        })
    return jsonify(data)


# Delete Chat
@app.route("/delete_chat/<int:chat_id>", methods=["DELETE"])
@login_required
def delete_chat(chat_id):
    chat = ChatHistory.query.filter_by(
        id=chat_id,
        user_id=current_user.id
    ).first()
    if not chat:
        return jsonify({"error": "Chat not found"}), 404
    db.session.delete(chat)
    db.session.commit()
    return jsonify({"message": "Chat deleted successfully"})


# Get Profile Info
@app.route("/profile")
@login_required
def profile():
    chat_count = ChatHistory.query.filter_by(user_id=current_user.id).count()
    return jsonify({
        "name": current_user.name,
        "email": current_user.email,
        "profile_pic": current_user.profile_pic,
        "chat_count": chat_count,
        "joined": current_user.created_at.strftime("%B %d, %Y")
    })


# Delete Account
@app.route("/delete_account", methods=["DELETE"])
@login_required
def delete_account():
    user_id = current_user.id
    logout_user()
    ChatHistory.query.filter_by(user_id=user_id).delete()
    User.query.filter_by(id=user_id).delete()
    db.session.commit()
    return jsonify({"message": "Account deleted successfully"})


# Report an Issue Route
@app.route("/report", methods=["POST"])
def report():
    data = request.get_json()
    issue = IssueReport(
        user_id=current_user.id if current_user.is_authenticated else None,
        issue_type=data.get("type", ""),
        description=data.get("description", ""),
        email=data.get("email", "")
    )
    db.session.add(issue)
    db.session.commit()
    print(f"📩 Report saved: [{issue.issue_type}] by user_id={issue.user_id}")
    return jsonify({"message": "Report received"}), 200


# Run Flask App
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("✅ Users, Chat History & Issue Reports Tables Created!")
    app.run(
        host="0.0.0.0",
        port=8080,
        debug=False,
        use_reloader=False
    )