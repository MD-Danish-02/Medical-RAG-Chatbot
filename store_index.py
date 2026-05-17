from src.helper import (
    load_pdf,
    text_split,
    download_hugging_face_embeddings
)

from langchain_pinecone import PineconeVectorStore

from pinecone import Pinecone

from dotenv import load_dotenv

import os


# Load Environment Variables
load_dotenv()


# Load Pinecone API Key
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")


# Initialize Pinecone
pc = Pinecone(api_key=PINECONE_API_KEY)


# Index Name
index_name = "medical-chatbot"


# Load PDF Documents
extracted_data = load_pdf("pdfs/")


# Create Text Chunks
text_chunks = text_split(extracted_data)


# Load Embedding Model
embeddings = download_hugging_face_embeddings()


# Store Embeddings into Pinecone
docsearch = PineconeVectorStore.from_documents(

    documents=text_chunks,

    embedding=embeddings,

    index_name=index_name
)

print("Pinecone indexing completed successfully")