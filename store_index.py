from src.helper import (
    text_split,
    download_hugging_face_embeddings
)

from langchain_community.document_loaders import PyMuPDFLoader
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

# Load ONLY Gale Encyclopedia PDF (not entire folder)
print("Loading Gale Encyclopedia of Medicine...")
loader = PyMuPDFLoader("pdfs/Medical_Book_Gale Encyclopedia.pdf")
extracted_data = loader.load()
print(f"Total pages loaded: {len(extracted_data)}")

# Create Text Chunks
text_chunks = text_split(extracted_data)
print(f"Total chunks created: {len(text_chunks)}")

# Load Embedding Model
embeddings = download_hugging_face_embeddings()

# Store Embeddings into Pinecone
print("Uploading to Pinecone...")
docsearch = PineconeVectorStore.from_documents(
    documents=text_chunks,
    embedding=embeddings,
    index_name=index_name
)

print("✅ Pinecone indexing completed successfully")
print(f"✅ Only Gale Encyclopedia indexed — citations will be accurate (max ~637 pages)")