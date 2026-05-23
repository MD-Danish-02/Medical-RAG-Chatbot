```markdown
# Medical-RAG-Chatbot

AI-powered Medical Encyclopedia Chatbot using **RAG (Retrieval-Augmented Generation)** architecture with **Mistral 7B**, **LangChain**, **Pinecone**, **Flask**, and **PostgreSQL** for intelligent medical question answering from PDF-based medical knowledge sources — with full **Google OAuth authentication**, persistent session-based chat history, and **multi-layer hallucination filtering**.

---

# Project Overview

Medical-RAG-Chatbot is a locally running AI medical assistant trained on **The Gale Encyclopedia of Medicine**.

The chatbot retrieves relevant medical information from PDF documents using vector search and generates context-aware responses using a local Large Language Model (LLM).

This project combines:

* Retrieval-Augmented Generation (RAG)
* Local LLM inference (Mistral 7B)
* Multi-layer hallucination filtering (~95% reduction)
* Vector databases (Pinecone)
* Medical PDF processing
* Modern responsive frontend UI (desktop + mobile)
* Flask backend integration
* Google OAuth 2.0 Authentication
* PostgreSQL persistent storage with session-based chat history
* PostgreSQL-backed bookmarks (per-user)
* Source citation persistence across sessions
* Guest mode with login-on-demand

The system is designed to provide accurate, source-cited educational medical information in a clean and interactive interface.

---

# Demo

### 🌞 Light Mode Desktop Homepage
![Light Mode Desktop Homepage](assets/screenshots/light-mode-desktop-homepage.png)

---

### 🌙 Dark Mode Desktop Homepage
![Dark Mode Desktop Homepage](assets/screenshots/dark-mode-desktop-homepage.png)

---

### 📂 Desktop Sidebar (Guest Mode)
![Desktop Sidebar Guest Mode](assets/screenshots/desktop-sidebar-guest-mode.png)

---

### 👤 Desktop Sidebar (Authenticated User)
![Desktop Sidebar Authenticated](assets/screenshots/desktop-sidebar-authenticated.png)

---

### 💬 Desktop Chat Response
![Desktop Chat Response](assets/screenshots/desktop-chat-response.png)

---

### 📱 Mobile Homepage
![Mobile Homepage](assets/screenshots/mobile-homepage.jpeg)

---

### 📱 Mobile Sidebar (Authenticated)
![Mobile Sidebar Authenticated](assets/screenshots/mobile-sidebar-authenticated.jpeg)

---

### 📱 Mobile Chat Response
![Mobile Chat Response](assets/screenshots/mobile-chat-response.jpeg)

---

# Features

## Core AI Features
* Medical Question Answering with Source Citations
* RAG-based Response Generation
* Local Mistral 7B Inference (GGUF)
* Pinecone Vector Database with MMR Search
* PDF Knowledge Base (Gale Encyclopedia of Medicine)
* Multi-layer Hallucination Filtering (~95% reduction)
* Strict Medical-only Query Enforcement
* Source citations persisted to PostgreSQL — visible after refresh and session reload

## Hallucination Filtering — 3-Layer Pipeline
```text
Layer 1 — LLM Medical Intent Check (Mistral)
          Is this question STRICTLY about human disease,
          medical symptom, drug, surgery, or clinical treatment?
          If NO → Refuse instantly, no DB hit

Layer 2 — Similarity Score Threshold (≥ 0.75)
          Only proceed if Pinecone returns highly relevant docs
          If FAIL → Refuse, no LLM call

Layer 3 — Refusal Phrase Check
          If LLM still generates non-medical content → Clean refuse
          Sources hidden on all refused responses
```

## Authentication & User Management
* Google OAuth 2.0 Login
* Guest Mode — browse freely without login
* Login-on-demand — modal appears on first message
* Persistent user profiles (name, email, avatar, joined date)
* Secure logout
* Account deletion with full data wipe (chats + bookmarks)
* Per-user data isolation via user_id

## Chat & History
* PostgreSQL-backed session-based chat history
* Per-user chat history isolation
* Session-grouped history — one conversation = one sidebar entry
* Click session to reload full conversation with source citations
* Delete entire session with one click
* New chat session support
* Source citations hidden on refused responses
* Source citations persisted — visible on page refresh and session reload

## Bookmarks
* PostgreSQL-backed per-user bookmark storage
* Save any bot response with one click
* Copy full bookmark text to clipboard
* Delete individual bookmarks
* Clear all bookmarks at once
* Bookmark badge count in header
* No localStorage dependency — fully server-side

## UI & Experience
* Dark / Light Theme Toggle
* Typing Animation
* Medical Category Navigation Chips (book-based topics)
* Responsive layout — desktop and mobile optimized
* PDF Export of chat as HTML
* Report Issue Modal with Email support
* Character counter on input
* Toast notifications
* Source citation display under each response
* Copy, Listen (TTS), Save buttons on each message

## Backend & Infrastructure
* Flask REST API
* PostgreSQL database (users + session-based chat history + bookmarks + issue reports)
* Flask-Login session management
* Authlib OAuth integration
* SQLAlchemy ORM
* UUID-based session tracking

---

# Tech Stack

## Frontend
* HTML5
* CSS3
* JavaScript
* jQuery

## Backend
* Flask
* Python 3.10
* Flask-Login
* Authlib
* SQLAlchemy

## Database
* PostgreSQL 17

## AI / ML
* LangChain
* Mistral 7B Instruct v0.2 (GGUF)
* llama-cpp-python
* Sentence Transformers

## Vector Database
* Pinecone

## Embedding Model
* BAAI/bge-small-en-v1.5

## Authentication
* Google OAuth 2.0

---

# RAG Architecture

```text
User Question
      ↓
Flask Backend (Auth Check)
      ↓
Layer 1 — Mistral Medical Intent Check
      ↓ (YES)
Layer 2 — Pinecone Similarity Score Threshold (≥ 0.75)
      ↓ (PASS)
Layer 3 — LLM Answer + Refusal Phrase Check
      ↓
Response + Sources Saved to PostgreSQL (with session_id)
      ↓
Response + Source Citations Displayed in UI
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

## Mistral-7B-Instruct-v0.2

This project uses:

```text
mistral-7b-instruct-v0.2.Q4_K_M.gguf
```

### Explanation

| Component | Meaning |
| --------- | ------- |
| Mistral | Mistral AI model family |
| 7B | 7 Billion parameters |
| Instruct | Instruction tuned model |
| v0.2 | Version 0.2 |
| GGUF | Optimized local model format |
| Q4_K_M | 4-bit quantized — balanced quality/speed |

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
│       ├── light-mode-desktop-homepage.png
│       ├── dark-mode-desktop-homepage.png
│       ├── desktop-sidebar-guest-mode.png
│       ├── desktop-sidebar-authenticated.png
│       ├── desktop-chat-response.png
│       ├── mobile-homepage.jpeg
│       ├── mobile-sidebar-authenticated.jpeg
│       └── mobile-chat-response.jpeg
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
│   ├── mistral-7b-instruct-v0.2.Q4_K_M.gguf
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
PyMuPDFLoader
```

## Step 2 — Text Chunking

Documents are divided into chunks of 700 characters with 80 character overlap for efficient retrieval.

## Step 3 — Embedding Generation

Text embeddings are generated using:

```text
BAAI/bge-small-en-v1.5
```

## Step 4 — Pinecone Indexing

Embeddings are stored inside Pinecone vector database with MMR (Maximum Marginal Relevance) search.

## Step 5 — Multi-layer Filtering

```text
1. Mistral medical intent check
2. Similarity score threshold (≥ 0.75)
3. Refusal phrase check
```

## Step 6 — Response Generation

Mistral 7B generates the final response using retrieved context only.

## Step 7 — Storage

Response, question, and source citations are saved to PostgreSQL under the authenticated user with a unique session_id.

---

# Installation

## Clone Repository

```bash
git clone https://github.com/MD-Danish-02/Medical-RAG-Chatbot.git
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
PINECONE_INDEX_NAME=medical-chatbot
HUGGINGFACEHUB_API_TOKEN=your_huggingface_token
DATABASE_URL=postgresql://username:password@localhost/dbname
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SECRET_KEY=your_flask_secret_key
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
CREATE DATABASE rag_db;
```

If upgrading from an older version, run these migrations manually:

```sql
ALTER TABLE chat_history ADD COLUMN session_id VARCHAR(100);
ALTER TABLE chat_history ADD COLUMN sources JSON;
```

Tables are auto-created on first run via SQLAlchemy:

```text
users
chat_history
issue_reports
bookmarks
```

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
* Load PDF using PyMuPDFLoader
* Clean and split text into chunks (700 chars, 80 overlap)
* Generate embeddings using BAAI/bge-small-en-v1.5
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

| Method | Endpoint | Auth Required | Description |
| ------ | -------- | ------------- | ----------- |
| GET | / | No | Main chat UI (guest allowed) |
| GET | /login | No | Trigger Google OAuth |
| GET | /login/callback | No | OAuth callback handler |
| GET | /logout | No | Logout user |
| POST | /get | Yes | Send message, get RAG answer |
| GET | /history | No | Get session-grouped chat history |
| GET | /session/\<session_id\> | Yes | Load full session messages with sources |
| DELETE | /delete_chat/\<session_id\> | Yes | Delete entire session |
| GET | /profile | Yes | Get user profile info |
| DELETE | /delete_account | Yes | Delete account + all data |
| POST | /report | No | Submit issue report |
| GET | /bookmarks | Yes | Get user bookmarks |
| POST | /bookmarks | Yes | Save a bookmark |
| DELETE | /bookmarks/\<id\> | Yes | Delete a bookmark |
| DELETE | /bookmarks/clear | Yes | Clear all bookmarks |

---

# UI Features

## Medical Category Chips
* All
* Asthma
* Diabetes
* Hypertension
* Alzheimer
* Cancer
* Tuberculosis
* Arthritis
* Anemia
* Malaria
* AIDS/HIV

## User Features
* Guest Mode — no login required to browse
* Login Modal — appears on first message send
* Profile Dropdown — avatar, name, email, chat count, joined date
* Session-based Chat History Sidebar — click to reload conversation with citations
* Bookmarks — PostgreSQL-backed per-user storage, copy & delete support
* HTML Export — download full chat with source citations
* Report Issue — modal with email support
* Theme Toggle — dark / light mode
* Copy, Listen (TTS), Save buttons on each message
* Source citations persist across page refresh and session reload

---

# Prompt Engineering

Strict prompt template used to enforce medical-only responses:

```text
<s>[INST] You are a strict medical encyclopedia assistant.
You ONLY use the context below to answer.
If the topic is not medical or not in the context,
respond with exactly:
"I can only answer medical questions based on the encyclopedia."
NEVER use outside knowledge.
NEVER define technology, computers, geography,
or non-medical subjects. [/INST]
```

Combined with LLM-based pre-check:

```text
Is this question STRICTLY about human disease, medical symptom,
drug, surgery, or clinical treatment?
Answer only YES or NO. If unsure, answer NO.
```

---

# Hallucination Reduction Results

Extensively tested with 35+ non-medical queries across multiple categories.
All correctly refused after multi-layer filtering implementation.

## Technology & Computing — All Refused ✅

| Query | Result |
| ----- | ------ |
| `What is quantum computing?` | ✅ Clean refuse |
| `Explain blockchain consensus mechanism` | ✅ Clean refuse |
| `Difference between CPU and GPU` | ✅ Clean refuse |
| `Explain operating system scheduling` | ✅ Clean refuse |
| `What is cloud computing?` | ✅ Clean refuse |
| `Explain machine learning lifecycle` | ✅ Clean refuse |
| `What is machine learning?` | ✅ Clean refuse |
| `Explain Kubernetes architecture` | ✅ Clean refuse |
| `What is React JS?` | ✅ Clean refuse |
| `What is DevOps?` | ✅ Clean refuse |
| `Explain data structures` | ✅ Clean refuse |
| `What is a database index?` | ✅ Clean refuse |
| `Explain networking protocols` | ✅ Clean refuse |
| `Difference between Java and Python` | ✅ Clean refuse |
| `Write a Python sorting algorithm` | ✅ Clean refuse |
| `What is ethical hacking?` | ✅ Clean refuse |
| `Explain SEO optimization` | ✅ Clean refuse |
| `Explain AI agents` | ✅ Clean refuse |

## General Knowledge & Other — All Refused ✅

| Query | Result |
| ----- | ------ |
| `Who won FIFA World Cup 2022?` | ✅ Clean refuse |
| `Capital of Turkey?` | ✅ Clean refuse |
| `Explain Newton's laws of motion` | ✅ Clean refuse |
| `Explain black holes in space` | ✅ Clean refuse |
| `Explain World War 2` | ✅ Clean refuse |
| `Define photosynthesis` | ✅ Clean refuse |
| `What is civil engineering?` | ✅ Clean refuse |
| `What is graphic design?` | ✅ Clean refuse |
| `Tell me about Istanbul history` | ✅ Clean refuse |
| `What is stock market trading?` | ✅ Clean refuse |
| `How does cryptocurrency mining work?` | ✅ Clean refuse |
| `What is Islamic banking?` | ✅ Clean refuse |
| `What is digital marketing?` | ✅ Clean refuse |
| `Who is Elon Musk?` | ✅ Clean refuse |
| `Tell me about Virat Kohli` | ✅ Clean refuse |
| `Tell me about Tesla company` | ✅ Clean refuse |
| `How to make biryani?` | ✅ Clean refuse |

## Medical Queries — All Answered Accurately ✅

| Query | Result |
| ----- | ------ |
| `What is Asthma and how is it treated?` | ✅ Accurate + Page 250, 397 |
| `What is Alzheimer disease?` | ✅ Accurate + Page 148, 151 |
| `What causes Hypertension?` | ✅ Accurate + Page 216, 58 |
| `What is Cancer and its types?` | ✅ Accurate + Page 607, 588 |
| `What is Anemia?` | ✅ Accurate + Page 194, 196 |
| `What is Diabetes mellitus?` | ✅ Accurate + Page 543, 544 |
| `What is AIDS and its treatment?` | ✅ Accurate + Page 87, 94 |
| `What is Tuberculosis?` | ✅ Accurate + Page 323, 618 |
| `What is Malaria?` | ✅ Accurate + sources |
| `Define Biopsy` | ✅ Accurate + sources |
| `General Anesthesia definition` | ✅ Accurate + Page 199, 203 |
| `define blood banking` | ✅ Accurate + Page 538, 545 |
| `Treatment of Anemia` | ✅ Accurate + Page 197, 199 |
| `How breast cancer grows in females?` | ✅ Accurate + Page 597, 592 |
| `Who is Deepak Chopra?` | ✅ Accurate |

## Overall Stats

| Metric | Value |
| ------ | ----- |
| Non-medical queries tested | 35+ |
| Correctly refused | 35/35 (100%) |
| Medical queries tested | 15+ |
| Accurate responses | 15/15 (100%) |
| Source citations accuracy | 100% manually verified |
| Hallucination reduction | ~95%+ |

---

# Current Limitations

* CPU inference — response time 60-90 seconds per query
* BAAI/bge-small-en-v1.5 is general purpose, not medical-specific
* No streaming responses
* Single PDF knowledge source

---

# Future Improvements

* Streaming Responses
* GPU Acceleration
* PubMedBERT medical-specific embeddings
* Voice Input
* Multi-PDF Support
* Docker Deployment
* Rate limiting per user
* Admin dashboard
* Conversation memory across sessions

---

# Educational Disclaimer

This chatbot provides general medical information for educational purposes only.

It is not intended to replace professional medical advice, diagnosis, or treatment.

Always consult a qualified healthcare professional for medical concerns.

In a medical emergency, call **112** immediately.

---

# Author

## Muhammad Danish Alam

AI & ML Enthusiast | Medical RAG System Developer

[LinkedIn](https://linkedin.com/in/md-danish-bb922324b) · [GitHub](https://github.com/MD-Danish-02)

---

# License

This project is licensed under the [MIT License](https://github.com/MD-Danish-02/Medical-RAG-Chatbot?tab=MIT-1-ov-file).

---

# Acknowledgements

* Mistral AI — Mistral 7B
* LangChain
* Pinecone
* HuggingFace — BAAI/bge-small-en-v1.5
* llama-cpp-python
* Flask
* Google OAuth
* PostgreSQL
* Gale Encyclopedia of Medicine
```