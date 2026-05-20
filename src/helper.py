from langchain_community.document_loaders import (
    PyMuPDFLoader,
    DirectoryLoader
)

from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_huggingface import HuggingFaceEmbeddings

import re


# Clean PDF Text
def clean_text(text):
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'([.,])\1+', r'\1', text)
    text = re.sub(r'\b(\w+)( \1\b)+', r'\1', text)
    return text.strip()


# Load PDF Documents
def load_pdf(data):

    loader = DirectoryLoader(
        data,
        glob="*.pdf",
        loader_cls=PyMuPDFLoader
    )

    documents = loader.load()

    # Clean extracted text
    for doc in documents:
        doc.page_content = clean_text(doc.page_content)

    return documents


# Create Text Chunks
def text_split(extracted_data):

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=700,
        chunk_overlap=80
    )

    text_chunks = text_splitter.split_documents(extracted_data)

    return text_chunks


# Download Embedding Model
def download_hugging_face_embeddings():

    embeddings = HuggingFaceEmbeddings(
        model_name="BAAI/bge-small-en-v1.5"
    )

    return embeddings