# Medical-RAG-Chatbot

AI-powered Medical Encyclopedia Chatbot using **RAG (Retrieval-Augmented Generation)** architecture with **Llama 2**, **LangChain**, **Pinecone**, and **Flask** for intelligent medical question answering from PDF-based medical knowledge sources.

---

# Project Overview

Medical-RAG-Chatbot is a locally running AI medical assistant trained on **The Gale Encyclopedia of Medicine**.

The chatbot retrieves relevant medical information from PDF documents using vector search and generates context-aware responses using a local Large Language Model (LLM).

This project combines:

* Retrieval-Augmented Generation (RAG)
* Local LLM inference
* Vector databases
* Medical PDF processing
* Modern responsive frontend UI
* Flask backend integration

The system is designed to provide educational medical information in a clean and interactive interface.

---

# Demo

## Light Mode — Home Screen

![Light Mode Home](assets/screenshots/screenshot_1_light_home.png)

## Dark Mode — Home Screen

![Dark Mode Home](assets/screenshots/screenshot_2_dark_home.png)

## Chat in Action — Typing Animation

![Typing Animation](assets/screenshots/screenshot_3_Typing_animation.png)

## RAG Response — Query Response

![Query Response](assets/screenshots/screenshot4_Query_Response.png)

---

# Features

* Medical Question Answering
* RAG-based Response Generation
* Local Llama 2 Inference
* Pinecone Vector Database
* PDF Knowledge Base
* Dark / Light Theme
* Chat History Support
* Typing Animation
* PDF Export
* Medical Category Navigation
* Issue Reporting Modal
* Responsive UI Design
* Educational Medical Disclaimer
* Flask API Backend
* Fully Offline LLM Inference

---

# Tech Stack

## Frontend

* HTML5
* CSS3
* JavaScript
* jQuery

## Backend

* Flask
* Python

## AI / ML

* LangChain
* Llama 2
* CTransformers
* Sentence Transformers

## Vector Database

* Pinecone

## Embedding Model

* sentence-transformers/all-MiniLM-L6-v2

---

# RAG Architecture

```text
User Question
      ↓
Flask Backend
      ↓
Pinecone Vector Search
      ↓
Relevant Chunks Retrieved
      ↓
Context Sent to Llama 2
      ↓
LLM Generates Final Answer
      ↓
Response Displayed in UI
```

---

# LLM Used

## Llama-2-7b-chat

This project uses:

```text
llama-2-7b-chat.Q4_K_M.gguf
```

### Explanation

| Component | Meaning                      |
| --------- | ---------------------------- |
| Llama     | Meta AI model family         |
| 2         | Second generation            |
| 7b        | 7 Billion parameters         |
| chat      | Instruction tuned chat model |
| GGUF      | Optimized local model format |
| Q4_K_M    | 4-bit quantized model        |

---

# Why GGUF?

GGUF models are optimized for:

* CPU inference
* Low RAM usage
* Faster local execution
* Offline AI deployment

---

# Project Structure

```plaintext
Medical-RAG-Chatbot/
│
├── assets/
│   └── screenshots/
│       ├── screenshot_light_home.png
│       ├── screenshot_dark_home.png
│       └── screenshot_endocrine_response.png
│
├── static/
│   ├── style.css
│   └── script.js
│
├── templates/
│   └── chat.html
│
├── src/
│   ├── helper.py
│   ├── prompt.py
│   └── __init__.py
│
├── model/
│   ├── llama-2-7b-chat.Q4_K_M.gguf
│   └── instruction.txt
│
├── pdfs/
│   └── Medical_Book_Gale Encyclopedia.pdf
│
├── research/
│   └── trials.ipynb
│
├── app.py
├── store_index.py
├── setup.py
├── requirements.txt
├── README.md
├── LICENSE
├── .env
└── .gitignore
```

---

# How It Works

## Step 1 — PDF Loading

Medical PDFs are loaded using:

```python
PyPDFLoader
```

---

## Step 2 — Text Chunking

Documents are divided into smaller chunks for efficient retrieval.

---

## Step 3 — Embedding Generation

Text embeddings are generated using:

```text
sentence-transformers/all-MiniLM-L6-v2
```

---

## Step 4 — Pinecone Indexing

Embeddings are stored inside Pinecone vector database.

---

## Step 5 — Retrieval

Relevant chunks are retrieved based on semantic similarity.

---

## Step 6 — Response Generation

Llama 2 generates the final response using retrieved context.

---

# Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/Medical-RAG-Chatbot.git
```

---

## Create Environment

```bash
conda create -p venv python=3.10 -y
```

---

## Activate Environment

### CMD / PowerShell

```bash
conda activate D:\conda_envs\mchatbot
```

### Git Bash

```bash
conda activate /d/conda_envs/mchatbot
```

---

## Install Requirements

```bash
pip install -r requirements.txt
```

---

# Environment Variables

Create `.env`

```env
PINECONE_API_KEY=your_api_key
PINECONE_API_ENV=your_environment
```

---

# Create Pinecone Index

Create index in Pinecone dashboard.

Example:

```text
medical-chatbot
```

---

# Store Vector Embeddings

Run:

```bash
python store_index.py
```

This will:

* Load PDF
* Split chunks
* Generate embeddings
* Upload vectors to Pinecone

---

# Run Application

```bash
python app.py
```

Open:

```text
http://127.0.0.1:8080
```

---

# UI Features

## Medical Categories

* Respiratory
* Cardiac
* Digestive
* Neurological
* Musculoskeletal
* Dermatology
* Endocrine
* Urology
* Ophthalmology

---

## Additional Features

* Sidebar Navigation
* Theme Switching
* Typing Animation
* Report Issue Modal
* Chat Export
* Conversation History

---

# Prompt Engineering

Custom prompt template used to reduce hallucinations and improve context-based responses.

Example:

```text
Only answer from the provided medical context.
If information is unavailable, say you do not know.
Do not generate unsupported medical claims.
```

---

# Current Limitations

* CPU inference can be slow
* Occasional hallucinations
* No authentication system
* Source citations not fully implemented
* Limited conversation memory

---

# Future Improvements

* Streaming Responses
* Source Citations
* Better LLM Models
* Authentication System
* Database-backed Chat History
* Voice Input
* Multi-PDF Support
* Docker Deployment
* GPU Acceleration

---

# Educational Disclaimer

This chatbot provides general medical information for educational purposes only.

It is not intended to replace professional medical advice, diagnosis, or treatment.

Always consult a qualified healthcare professional for medical concerns.

---

# Author

## Muhammad Danish Alam

AI & ML Enthusiast
Medical RAG System Developer

---

# License

This project is licensed under the MIT License.

---

# Acknowledgements

* Meta AI
* LangChain
* Pinecone
* HuggingFace
* Flask
* Gale Encyclopedia of Medicine