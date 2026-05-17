from flask import Flask, render_template, request

from dotenv import load_dotenv

from pinecone import Pinecone

from langchain_pinecone import PineconeVectorStore

from langchain_core.prompts import PromptTemplate

from langchain_classic.chains import RetrievalQA

from langchain_community.llms import CTransformers

from src.helper import download_hugging_face_embeddings

from src.prompt import prompt_template

import os


# Load Environment Variables
load_dotenv()


# Flask App
app = Flask(__name__)


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


# Load Llama 2 Model
llm = CTransformers(
    model="model/llama-2-7b-chat.Q4_K_M.gguf",
    model_type="llama",
    config={
        "max_new_tokens": 512,
        "temperature": 0.5
    }
)


# Create Retrieval QA Chain
qa = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=docsearch.as_retriever(
        search_kwargs={"k": 2}
    ),
    return_source_documents=True,
    chain_type_kwargs=chain_type_kwargs
)


# Home Route
@app.route("/")
def index():
    return render_template("chat.html")


# Chat Route
@app.route("/get", methods=["POST"])
def chat():

    msg = request.form["msg"]

    print("User Input:", msg)

    result = qa.invoke({"query": msg})

    response = result["result"]

    print("Response:", response)

    return str(response)


# Run Flask App
if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=8080,
        debug=True
    )