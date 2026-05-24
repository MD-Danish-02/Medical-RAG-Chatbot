from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from dotenv import load_dotenv
from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore
from langchain_core.prompts import PromptTemplate
from langchain_classic.chains import RetrievalQA
from langchain_groq import ChatGroq
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from authlib.integrations.flask_client import OAuth
from src.helper import download_hugging_face_embeddings
from src.prompt import prompt_template
from src.database import db, User, ChatHistory, IssueReport, Bookmark
from sqlalchemy import func
import uuid
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

# Load Groq Model
llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0.0,
    max_tokens=500,
    groq_api_key=os.environ.get("GROQ_API_KEY")
)

# Create Retrieval QA Chain
qa = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=docsearch.as_retriever(
        search_type="mmr",
        search_kwargs={
            "k": 3,
            "fetch_k": 9,
            "lambda_mult": 0.5
        }
    ),
    return_source_documents=True,
    chain_type_kwargs=chain_type_kwargs
)


# Similarity Score Threshold Check
def get_relevant_docs_with_threshold(query, threshold=0.0):
    results = docsearch.similarity_search_with_relevance_scores(query, k=3)
    filtered = [doc for doc, score in results if score >= threshold]
    return filtered


# Medical Query Check via Groq
def is_medical_query_llm(query):
    check_prompt = f"""You are a medical query classifier.

Is the following question related to any medical topic including diseases, infections, symptoms, treatments, drugs, surgery, anatomy, or public health?

Answer ONLY with YES or NO.

Question: {query}

Answer:"""

    result = llm.invoke(check_prompt)
    response_text = result.content.strip().upper()
    return "YES" in response_text


# Clean Response: returns formatted HTML
def clean_response(text):
    # Remove **bold** markdown
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)

    # Remove horizontal rules
    text = re.sub(r'={2,}', '', text)
    text = re.sub(r'-{3,}', '', text)
    text = text.replace("===", "")

    # Split into lines and build HTML
    lines = text.split('\n')
    html_parts = []
    list_type = None   # None | 'ul' | 'ol'

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Bullet line: starts with * or • or - (single dash)
        if re.match(r'^[-\*•]\s+', line):
            if list_type != 'ul':
                if list_type == 'ol':
                    html_parts.append('</ol>')
                html_parts.append('<ul>')
                list_type = 'ul'
            content = re.sub(r'^[-\*•]\s+', '', line)
            html_parts.append(f'<li>{content}</li>')

        # Numbered list: starts with 1. 2. etc.
        elif re.match(r'^\d+\.\s+', line):
            if list_type != 'ol':
                if list_type == 'ul':
                    html_parts.append('</ul>')
                html_parts.append('<ol>')
                list_type = 'ol'
            content = re.sub(r'^\d+\.\s+', '', line)
            html_parts.append(f'<li>{content}</li>')

        # Section heading (e.g. "Causes:", "Symptoms:" — ends with colon)
        elif re.match(r'^[A-Za-z ]{2,40}:\s*$', line):
            if list_type:
                html_parts.append(f'</{list_type}>')
                list_type = None
            html_parts.append(f'<p><strong>{line}</strong></p>')

        # Normal paragraph
        else:
            if list_type:
                html_parts.append(f'</{list_type}>')
                list_type = None
            html_parts.append(f'<p>{line}</p>')

    # Close any open list
    if list_type:
        html_parts.append(f'</{list_type}>')

    return '\n'.join(html_parts)



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
    session_id = request.form.get("session_id", str(uuid.uuid4()))
    print("User Input:", msg)

    # Step 1: Medical query check via Groq
    if not is_medical_query_llm(msg):
        print("Medical check failed — non-medical query")
        return jsonify({
            "answer": "<p>I can only answer medical questions based on the Gale Encyclopedia of Medicine.</p>",
            "sources": []
        })

    # Step 2: Retrieve relevant docs
    relevant_docs = get_relevant_docs_with_threshold(msg, threshold=0.0)
    if not relevant_docs:
        print("No relevant docs found")
        return jsonify({
            "answer": "<p>I could not find enough medical information on this topic.</p>",
            "sources": []
        })

    # Step 3: LLM call
    result = qa.invoke({"query": msg})
    response = result["result"]
    source_docs = result["source_documents"]

    if not source_docs:
        return jsonify({
            "answer": "<p>I could not find enough medical information on this topic.</p>",
            "sources": []
        })

    response = clean_response(response)
    print("Response:", response)

    # Step 4: Refusal check
    REFUSAL_PHRASE = "I can only answer medical questions"
    if REFUSAL_PHRASE in response:
        return jsonify({
            "answer": "<p>I can only answer medical questions based on the Gale Encyclopedia of Medicine.</p>",
            "sources": []
        })

    # Step 5: Extract sources
    sources = []
    for doc in source_docs:
        meta = doc.metadata
        source = {
            "file": meta.get("source", "Gale Encyclopedia of Medicine"),
            "page": int(meta.get("page", 0)) + 1
        }
        if source not in sources:
            sources.append(source)

    # Step 6: Save to DB
    chat_data = ChatHistory(
        user_id=current_user.id,
        session_id=session_id,
        question=msg,
        answer=response,
        sources=sources
    )
    db.session.add(chat_data)
    db.session.commit()

    return jsonify({
        "answer": response,
        "sources": sources
    })


# History — session wise group
@app.route("/history")
def history():
    if not current_user.is_authenticated:
        return jsonify([])

    sessions = db.session.query(
        ChatHistory.session_id,
        func.min(ChatHistory.question).label("first_question"),
        func.count(ChatHistory.id).label("msg_count")
    ).filter_by(
        user_id=current_user.id
    ).group_by(
        ChatHistory.session_id
    ).order_by(
        func.max(ChatHistory.id).desc()
    ).all()

    return jsonify([{
        "session_id": s.session_id,
        "question": s.first_question,
        "msg_count": s.msg_count
    } for s in sessions])


# All messages from one session
@app.route("/session/<session_id>")
@login_required
def get_session(session_id):
    chats = ChatHistory.query.filter_by(
        user_id=current_user.id,
        session_id=session_id
    ).order_by(ChatHistory.id.asc()).all()

    return jsonify([{
        "id": chat.id,
        "question": chat.question,
        "answer": chat.answer,
        "sources": chat.sources or []
    } for chat in chats])


# Delete entire session
@app.route("/delete_chat/<session_id>", methods=["DELETE"])
@login_required
def delete_chat(session_id):
    deleted = ChatHistory.query.filter_by(
        session_id=session_id,
        user_id=current_user.id
    ).delete()

    if not deleted:
        return jsonify({"error": "Session not found"}), 404

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
    Bookmark.query.filter_by(user_id=user_id).delete()
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


# Get Bookmarks
@app.route("/bookmarks")
@login_required
def get_bookmarks():
    bookmarks = Bookmark.query.filter_by(
        user_id=current_user.id
    ).order_by(Bookmark.created_at.desc()).all()

    return jsonify([{
        "id": b.id,
        "text": b.text
    } for b in bookmarks])


# Add Bookmark
@app.route("/bookmarks", methods=["POST"])
@login_required
def add_bookmark():
    data = request.get_json()
    bookmark = Bookmark(
        user_id=current_user.id,
        text=data.get("text", "")
    )
    db.session.add(bookmark)
    db.session.commit()
    return jsonify({"id": bookmark.id, "message": "Saved"})


# Delete Bookmark
@app.route("/bookmarks/<int:bookmark_id>", methods=["DELETE"])
@login_required
def delete_bookmark_db(bookmark_id):
    bookmark = Bookmark.query.filter_by(
        id=bookmark_id,
        user_id=current_user.id
    ).first()
    if not bookmark:
        return jsonify({"error": "Not found"}), 404
    db.session.delete(bookmark)
    db.session.commit()
    return jsonify({"message": "Deleted"})


# Clear All Bookmarks
@app.route("/bookmarks/clear", methods=["DELETE"])
@login_required
def clear_bookmarks():
    Bookmark.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()
    return jsonify({"message": "Cleared"})


# Run Flask App
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("✅ Users, Chat History, Issue Reports & Bookmark Tables Created!")
    app.run(
        host="0.0.0.0",
        port=8080,
        debug=False,
        use_reloader=False
    )