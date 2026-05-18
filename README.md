# Medical-RAG-Chatbot

AI-powered Medical Encyclopedia Chatbot using **RAG (Retrieval-Augmented Generation)** architecture with **Llama 2**, **LangChain**, **Pinecone**, **Flask**, and **PostgreSQL** for intelligent medical question answering from PDF-based medical knowledge sources — with full **Google OAuth authentication** and persistent chat history.

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
* Google OAuth 2.0 Authentication
* PostgreSQL persistent storage
* Guest mode with login-on-demand

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

## Guest Mode — Login Modal on Message Send

![Login Modal](assets/screenshots/screenshot_5_login_modal.png)

## Logged In — Profile Dropdown

![Profile Dropdown](assets/screenshots/screenshot_6_profile_dropdown.png)

---

# Features

## Core AI Features
* Medical Question Answering
* RAG-based Response Generation
* Local Llama 2 Inference
* Pinecone Vector Database
* PDF Knowledge Base
* Related Topic Suggestions

## Authentication & User Management
* Google OAuth 2.0 Login
* Guest Mode — browse freely without login
* Login-on-demand — modal appears on first message
* Persistent user profiles (name, email, avatar, joined date)
* Secure logout
* Account deletion with full data wipe

## Chat & History
* PostgreSQL-backed chat history
* Per-user chat history isolation
* Delete individual chats
* New chat session support
* Sidebar history navigation with jump-to-message

## UI & Experience
* Dark / Light Theme Toggle
* Typing Animation
* Medical Category Navigation chips
* Bookmarks — save any bot response
* PDF Export of chat
* Report Issue Modal with Email support
* Character counter on input
* Toast notifications
* Responsive layout with icon rail sidebar

## Backend & Infrastructure
* Flask REST API
* PostgreSQL database (users + chat history)
* Flask-Login session management
* Authlib OAuth integration
* SQLAlchemy ORM

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
* Flask-Login
* Authlib
* SQLAlchemy

## Database
* PostgreSQL

## AI / ML
* LangChain
* Llama 2
* CTransformers
* Sentence Transformers

## Vector Database
* Pinecone

## Embedding Model
* sentence-transformers/all-MiniLM-L6-v2

## Authentication
* Google OAuth 2.0

---

# RAG Architecture

```text
User Question
      ↓
Flask Backend (Auth Check)
      ↓
Pinecone Vector Search
      ↓
Relevant Chunks Retrieved
      ↓
Context Sent to Llama 2
      ↓
LLM Generates Final Answer
      ↓
Response Saved to PostgreSQL
      ↓
Response Displayed in UI
```

---

# Authentication Flow

```text
User visits /
      ↓
Guest Mode — can browse freely
      ↓
User sends a message
      ↓
Login Modal appears
      ↓
"Continue with Google" clicked
      ↓
Google OAuth 2.0 redirect
      ↓
Callback → user created/fetched from PostgreSQL
      ↓
Flask-Login session created
      ↓
Redirected back to chat
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
│       ├── screenshot_1_light_home.png
│       ├── screenshot_2_dark_home.png
│       ├── screenshot_3_Typing_animation.png
│       ├── screenshot4_Query_Response.png
│       ├── screenshot_5_login_modal.png
│       └── screenshot_6_profile_dropdown.png
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
│   ├── database.py
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

## Step 2 — Text Chunking

Documents are divided into smaller chunks for efficient retrieval.

## Step 3 — Embedding Generation

Text embeddings are generated using:

```text
sentence-transformers/all-MiniLM-L6-v2
```

## Step 4 — Pinecone Indexing

Embeddings are stored inside Pinecone vector database.

## Step 5 — Retrieval

Relevant chunks are retrieved based on semantic similarity.

## Step 6 — Response Generation

Llama 2 generates the final response using retrieved context.

## Step 7 — Storage

Response and question are saved to PostgreSQL under the authenticated user.

---

# Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/Medical-RAG-Chatbot.git
```

## Create Environment

```bash
conda create -p venv python=3.10 -y
```

## Activate Environment

### CMD / PowerShell

```bash
conda activate D:\conda_envs\mchatbot
```

### Git Bash

```bash
conda activate /d/conda_envs/mchatbot
```

## Install Requirements

```bash
pip install -r requirements.txt
```

---

# Environment Variables

Create `.env` file:

```env
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_API_ENV=your_pinecone_environment
SECRET_KEY=your_flask_secret_key
DATABASE_URL=postgresql://username:password@localhost/dbname
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

# Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google+ API** / **Google Identity**
4. Go to **Credentials** → Create **OAuth 2.0 Client ID**
5. Add Authorized redirect URI:

```text
http://127.0.0.1:8080/login/callback
```

6. Copy **Client ID** and **Client Secret** to `.env`

---

# PostgreSQL Setup

Create database:

```sql
CREATE DATABASE medical_chatbot;
```

Tables are auto-created on first run via SQLAlchemy.

---

# Create Pinecone Index

Create index in Pinecone dashboard:

```text
Index name: medical-chatbot
Dimensions: 384
Metric: cosine
```

---

# Store Vector Embeddings

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

# API Endpoints

| Method | Endpoint                  | Auth Required | Description                  |
| ------ | ------------------------- | ------------- | ---------------------------- |
| GET    | /                         | No            | Main chat UI (guest allowed) |
| GET    | /login                    | No            | Trigger Google OAuth         |
| GET    | /login/callback           | No            | OAuth callback handler       |
| GET    | /logout                   | No            | Logout user                  |
| POST   | /get                      | Yes           | Send message, get RAG answer |
| GET    | /history                  | No            | Get chat history (guest: []) |
| DELETE | /delete_chat/<id>         | Yes           | Delete specific chat         |
| GET    | /profile                  | Yes           | Get user profile info        |
| DELETE | /delete_account           | Yes           | Delete account + all data    |

---

# UI Features

## Medical Categories
* All
* Respiratory
* Cardiac
* Digestive
* Neurological
* Musculoskeletal
* Dermatology
* Endocrine
* Urology
* Ophthalmology
* Diabetes
* Hypertension

## User Features
* Guest Mode — no login required to browse
* Login Modal — appears on first message send
* Profile Dropdown — avatar, name, email, stats
* Chat History Sidebar — with delete support
* Bookmarks — save any response locally
* PDF Export — download full chat as HTML/PDF
* Report Issue — sends pre-filled email report
* Theme Toggle — dark / light mode

---

# Prompt Engineering

Custom prompt template used to reduce hallucinations and improve context-based responses:

```text
Only answer from the provided medical context.
If information is unavailable, say you do not know.
Do not generate unsupported medical claims.
```

---

# Current Limitations

* CPU inference can be slow
* Occasional hallucinations
* Source citations not fully implemented
* Limited conversation memory
* No streaming responses yet

---

# Future Improvements

* Streaming Responses
* Source Citations
* Better LLM Models (Mistral, Llama 3)
* Database-backed Bookmarks
* Voice Input
* Multi-PDF Support
* Docker Deployment
* GPU Acceleration
* Rate limiting per user
* Admin dashboard

---

# Educational Disclaimer

This chatbot provides general medical information for educational purposes only.

It is not intended to replace professional medical advice, diagnosis, or treatment.

Always consult a qualified healthcare professional for medical concerns.

In a medical emergency, call **112** immediately.

---

# Author

## Muhammad Danish Alam

AI & ML Enthusiast
Medical RAG System Developer
[LinkedIn](linkedin.com/in/md-danish-bb922324b) · [GitHub](https://github.com/MD-Danish-02)

---

# License

This project is licensed under the MIT License.

---

# Acknowledgements

* Meta AI — Llama 2
* LangChain
* Pinecone
* HuggingFace
* Flask
* Google OAuth
* PostgreSQL
* Gale Encyclopedia of Medicine