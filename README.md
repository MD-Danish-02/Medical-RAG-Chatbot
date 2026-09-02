# Medical-RAG-Chatbot

AI-powered Medical Encyclopedia Chatbot using **RAG (Retrieval-Augmented Generation)** architecture with **Groq (LLaMA 3.1 8B)**, **LangChain**, **Pinecone**, **Flask**, and **PostgreSQL** for intelligent medical question answering from PDF-based medical knowledge sources — with full **Google OAuth authentication**, persistent session-based chat history, **multi-layer hallucination filtering**, and **live production deployment on AWS**.

> 🌐 **Live Demo:** [https://medencyclo.duckdns.org/](https://medencyclo.duckdns.org/)

---

## Project Overview

Medical-RAG-Chatbot is a fully deployed AI medical assistant trained on **The Gale Encyclopedia of Medicine**.

The chatbot retrieves relevant medical information from PDF documents using vector search and generates context-aware responses using **Groq's cloud-hosted LLaMA 3.1 8B Instant** — enabling fast, low-latency inference without local GPU requirements.

This project combines:

- Retrieval-Augmented Generation (RAG)
- Cloud LLM inference via Groq API (LLaMA 3.1 8B Instant)
- Multi-layer hallucination filtering (~95% reduction)
- Vector databases (Pinecone)
- Medical PDF processing
- Modern responsive frontend UI (desktop + mobile)
- Flask backend integration
- Google OAuth 2.0 Authentication
- PostgreSQL persistent storage with session-based chat history
- PostgreSQL-backed bookmarks (per-user)
- Source citation persistence across sessions
- Guest mode with login-on-demand
- **Full production deployment: Docker + AWS EC2 + Nginx + SSL**

The system is designed to provide accurate, source-cited educational medical information in a clean and interactive interface.

---

## Live Demo

**Production URL:** [https://medencyclo.duckdns.org/](https://medencyclo.duckdns.org/)

| Environment | Status |
|-------------|--------|
| Status | 🟢 LIVE |
| Environment | Production |
| Version | V1.0.0 |
| Domain | https://medencyclo.duckdns.org/ |

---

## Screenshots

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

## Features

### Core AI Features
- Medical Question Answering with Source Citations
- RAG-based Response Generation
- **Cloud LLM via Groq API** — LLaMA 3.1 8B Instant (fast, no GPU required)
- Pinecone Vector Database with MMR Search
- PDF Knowledge Base (Gale Encyclopedia of Medicine)
- Multi-layer Hallucination Filtering (~95% reduction)
- Strict Medical-only Query Enforcement
- Source citations persisted to PostgreSQL — visible after refresh and session reload

### Hallucination Filtering — 3-Layer Pipeline

```text
Layer 1 — LLM Medical Intent Check (Groq / LLaMA)
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

### Authentication & User Management
- Google OAuth 2.0 Login
- Guest Mode — browse freely without login
- Login-on-demand — modal appears on first message
- Persistent user profiles (name, email, avatar, joined date)
- Secure logout
- Account deletion with full data wipe (chats + bookmarks)
- Per-user data isolation via user_id

### Chat & History
- PostgreSQL-backed session-based chat history
- Per-user chat history isolation
- Session-grouped history — one conversation = one sidebar entry
- Click session to reload full conversation with source citations
- Delete entire session with one click
- New chat session support
- Source citations hidden on refused responses
- Source citations persisted — visible on page refresh and session reload

### Bookmarks
- PostgreSQL-backed per-user bookmark storage
- Save any bot response with one click
- Copy full bookmark text to clipboard
- Delete individual bookmarks
- Clear all bookmarks at once
- Bookmark badge count in header
- No localStorage dependency — fully server-side

### UI & Experience
- Dark / Light Theme Toggle
- Typing Animation
- Medical Category Navigation Chips (book-based topics)
- Responsive layout — desktop and mobile optimized
- PDF Export of chat as HTML
- Report Issue Modal with Email support
- Character counter on input
- Toast notifications
- Source citation display under each response
- Copy, Listen (TTS), Save buttons on each message

### Backend & Infrastructure
- Flask REST API
- PostgreSQL database (users + session-based chat history + bookmarks + issue reports)
- Flask-Login session management
- Authlib OAuth integration
- SQLAlchemy ORM
- UUID-based session tracking
- **Docker containerization for deployment consistency**
- **AWS EC2 Ubuntu Free Tier cloud hosting**
- **Nginx reverse proxy with HTTPS/SSL**
- **DuckDNS free domain with public accessibility**

---

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript, jQuery

### Backend
- Flask, Python 3.10, Flask-Login, Authlib, SQLAlchemy

### Database
- PostgreSQL 17

### AI / ML
- LangChain
- **Groq API — LLaMA 3.1 8B Instant** (cloud inference)
- Sentence Transformers

### Vector Database
- Pinecone (MMR Search)

### Embedding Model
- BAAI/bge-small-en-v1.5

### Authentication
- Google OAuth 2.0

### Deployment
- Docker
- AWS EC2 (Ubuntu Free Tier)
- Nginx (Reverse Proxy)
- DuckDNS (Free Domain)
- Certbot / Let's Encrypt (SSL)

---

## RAG Architecture

```text
User Question
      ↓
Flask Backend (Auth Check)
      ↓
Layer 1 — Groq LLM Medical Intent Check
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

## Production Architecture

![Production Architecture](assets/screenshots/Production_Architecture.jpeg)

---

## Authentication Flow

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

## LLM Used

### Groq API — LLaMA 3.1 8B Instant

This project uses Groq's hosted inference for fast, production-grade LLM responses:

```python
llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0.0,
    max_tokens=500,
    groq_api_key=os.environ.get("GROQ_API_KEY")
)
```

| Component | Detail |
|-----------|--------|
| Provider | Groq Cloud API |
| Model | LLaMA 3.1 8B Instant |
| Inference | Cloud-hosted (no local GPU needed) |
| Latency | Low — optimized for speed |
| Integration | `langchain-groq` |

**Why Groq over local GGUF?**

| Factor | Local Mistral (GGUF) | Groq API (LLaMA 3.1) |
|--------|---------------------|----------------------|
| Response time | 60–90 seconds | 2–5 seconds |
| GPU requirement | None (CPU only) | None (cloud) |
| Deployment | Model file (~4GB) | API key only |
| Scalability | Limited by host RAM | Scales automatically |
| Production fit | Dev/local only | Production-ready ✅ |

---

## Project Structure

```plaintext
Medical-RAG-Chatbot/
│
├── assets/
│   └── screenshots/
│       ├── Production_Architecture.jpeg
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
├── pdfs/
│   └── Medical_Book_Gale Encyclopedia.pdf
│
├── research/
│   └── trials.ipynb
│
├── app.py
├── store_index.py
├── Dockerfile
├── setup.py
├── requirements.txt
├── README.md
├── LICENSE
├── .env
└── .gitignore
```

---

## How It Works

### Step 1 — PDF Loading
Medical PDFs are loaded using `PyMuPDFLoader`.

### Step 2 — Text Chunking
Documents are divided into chunks of 700 characters with 80 character overlap for efficient retrieval.

### Step 3 — Embedding Generation
Text embeddings are generated using `BAAI/bge-small-en-v1.5`.

### Step 4 — Pinecone Indexing
Embeddings are stored inside Pinecone vector database with MMR (Maximum Marginal Relevance) search.

### Step 5 — Multi-layer Filtering
```text
1. Groq LLM medical intent check
2. Similarity score threshold (≥ 0.75)
3. Refusal phrase check
```

### Step 6 — Response Generation
Groq LLaMA 3.1 8B Instant generates the final response using retrieved context only.

### Step 7 — Storage
Response, question, and source citations are saved to PostgreSQL under the authenticated user with a unique session_id.

---

## Installation (Local Development)

### Clone Repository

```bash
git clone https://github.com/MD-Danish-02/Medical-RAG-Chatbot.git
cd Medical-RAG-Chatbot
```

### Create Environment

```bash
conda create -p venv python=3.10 -y
```

### Activate Environment

```bash
# CMD / PowerShell
conda activate venv/

# Git Bash
conda activate ./venv
```

### Install Requirements

```bash
pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=medical-chatbot
HUGGINGFACEHUB_API_TOKEN=your_huggingface_token
DATABASE_URL=postgresql://username:password@localhost/dbname
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SECRET_KEY=your_flask_secret_key
```

Get your Groq API key at [console.groq.com](https://console.groq.com/).

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google+ API** / **Google Identity**
4. Go to **Credentials** → Create **OAuth 2.0 Client ID**
5. Add Authorized redirect URIs:

```text
# Local
http://127.0.0.1:8080/login/callback

# Production
https://medencyclo.duckdns.org/login/callback
```

6. Copy **Client ID** and **Client Secret** to `.env`

---

## PostgreSQL Setup

```sql
CREATE DATABASE rag_db;
```

If upgrading from an older version, run migrations manually:

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

## Create Pinecone Index

Create index in [Pinecone Dashboard](https://app.pinecone.io/):

```text
Index name: medical-chatbot
Dimensions: 384
Metric: cosine
```

---

## Store Vector Embeddings

```bash
python store_index.py
```

This will:
- Load PDF using PyMuPDFLoader
- Clean and split text into chunks (700 chars, 80 overlap)
- Generate embeddings using BAAI/bge-small-en-v1.5
- Upload vectors to Pinecone

---

## Run Locally

```bash
python app.py
```

Open: [http://127.0.0.1:8080](http://127.0.0.1:8080)

---

## Production Deployment (Docker + AWS + Nginx)

### Prerequisites
- AWS EC2 Ubuntu instance (Free Tier t2.micro works)
- Docker installed on EC2
- Nginx installed on EC2
- DuckDNS account with a subdomain configured to EC2 public IP

### Step 1 — Build Docker Image

```bash
docker build -t medical-rag .
```

### Step 2 — Run Docker Container

```bash
docker run -d -p 8080:8080 --env-file .env --name medical-rag-container medical-rag
```

### Step 3 — Configure Nginx Reverse Proxy

Edit `/etc/nginx/sites-available/default`:

```nginx
server {
    listen 80;
    server_name medencyclo.duckdns.org;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 4 — Setup SSL (HTTPS)

```bash
sudo certbot --nginx -d medencyclo.duckdns.org
```

Certbot will automatically configure HTTPS and redirect HTTP → HTTPS.

### Step 5 — Verify Deployment

```bash
docker ps                          # Confirm container is running
docker logs -f medical-rag-container  # Monitor logs
```

### Updating Production (Docker Rebuild Workflow)

```bash
docker stop medical-rag-container
docker rm medical-rag-container
docker build -t medical-rag .
docker run -d -p 8080:8080 --env-file .env --name medical-rag-container medical-rag
```

---

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/` | No | Main chat UI (guest allowed) |
| GET | `/login` | No | Trigger Google OAuth |
| GET | `/login/callback` | No | OAuth callback handler |
| GET | `/logout` | No | Logout user |
| POST | `/get` | Yes | Send message, get RAG answer |
| GET | `/history` | No | Get session-grouped chat history |
| GET | `/session/<session_id>` | Yes | Load full session messages with sources |
| DELETE | `/delete_chat/<session_id>` | Yes | Delete entire session |
| GET | `/profile` | Yes | Get user profile info |
| DELETE | `/delete_account` | Yes | Delete account + all data |
| POST | `/report` | No | Submit issue report |
| GET | `/bookmarks` | Yes | Get user bookmarks |
| POST | `/bookmarks` | Yes | Save a bookmark |
| DELETE | `/bookmarks/<id>` | Yes | Delete a bookmark |
| DELETE | `/bookmarks/clear` | Yes | Clear all bookmarks |

---

## UI Features

### Medical Category Chips
All · Asthma · Diabetes · Hypertension · Alzheimer · Cancer · Tuberculosis · Arthritis · Anemia · Malaria · AIDS/HIV

### User Features
- Guest Mode — no login required to browse
- Login Modal — appears on first message send
- Profile Dropdown — avatar, name, email, chat count, joined date
- Session-based Chat History Sidebar — click to reload conversation with citations
- Bookmarks — PostgreSQL-backed per-user storage, copy & delete support
- HTML Export — download full chat with source citations
- Report Issue — modal with email support
- Theme Toggle — dark / light mode
- Copy, Listen (TTS), Save buttons on each message
- Source citations persist across page refresh and session reload

---

## Prompt Engineering

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

## Hallucination Reduction Results

Extensively tested with 35+ non-medical queries across multiple categories. All correctly refused after multi-layer filtering implementation.

### Technology & Computing — All Refused ✅

| Query | Result |
|-------|--------|
| `What is quantum computing?` | ✅ Clean refuse |
| `Explain blockchain consensus mechanism` | ✅ Clean refuse |
| `Explain Kubernetes architecture` | ✅ Clean refuse |
| `What is machine learning?` | ✅ Clean refuse |
| `What is React JS?` | ✅ Clean refuse |
| `Explain AI agents` | ✅ Clean refuse |

### General Knowledge — All Refused ✅

| Query | Result |
|-------|--------|
| `Who won FIFA World Cup 2022?` | ✅ Clean refuse |
| `Capital of Turkey?` | ✅ Clean refuse |
| `Explain Newton's laws of motion` | ✅ Clean refuse |
| `How to make biryani?` | ✅ Clean refuse |

### Medical Queries — All Answered Accurately ✅

| Query | Result |
|-------|--------|
| `What is Asthma and how is it treated?` | ✅ Accurate + Page 250, 397 |
| `What is Alzheimer disease?` | ✅ Accurate + Page 148, 151 |
| `What causes Hypertension?` | ✅ Accurate + Page 216, 58 |
| `What is Cancer and its types?` | ✅ Accurate + Page 607, 588 |
| `What is Diabetes mellitus?` | ✅ Accurate + Page 543, 544 |

### Overall Stats

| Metric | Value |
|--------|-------|
| Non-medical queries tested | 35+ |
| Correctly refused | 35/35 (100%) |
| Medical queries tested | 15+ |
| Accurate responses | 15/15 (100%) |
| Source citations accuracy | 100% manually verified |
| Hallucination reduction | ~95%+ |

---

## Current Limitations

- No streaming responses
- BAAI/bge-small-en-v1.5 is general purpose, not medical-specific
- Single PDF knowledge source
- Free tier EC2 — limited concurrency

---

## Future Improvements

- Streaming Responses
- PubMedBERT medical-specific embeddings
- Voice Input
- Multi-PDF Support
- Rate limiting per user
- Admin dashboard
- Conversation memory across sessions
- GPU-accelerated EC2 for higher throughput

---

## Educational Disclaimer

This chatbot provides general medical information for **educational purposes only**.

It is not intended to replace professional medical advice, diagnosis, or treatment.

Always consult a qualified healthcare professional for medical concerns.

**In a medical emergency, call 112 immediately.**

---

## Author

### Muhammad Danish Alam

AI & ML Engineer | Generative AI Developer | Medical RAG System Developer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?logo=linkedin)](https://linkedin.com/in/md-danish-bb922324b)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?logo=github)](https://github.com/MD-Danish-02)

---

## License

This project is licensed under the [MIT License](https://github.com/MD-Danish-02/Medical-RAG-Chatbot?tab=MIT-1-ov-file).

---

## Acknowledgements

- [Groq](https://groq.com/) — LLaMA 3.1 8B Instant API
- [LangChain](https://langchain.com/) — RAG framework
- [Pinecone](https://pinecone.io/) — Vector database
- [HuggingFace](https://huggingface.co/) — BAAI/bge-small-en-v1.5 embeddings
- [Flask](https://flask.palletsprojects.com/) — Backend framework
- [Google OAuth](https://developers.google.com/identity) — Authentication
- [PostgreSQL](https://www.postgresql.org/) — Persistent storage
- [AWS EC2](https://aws.amazon.com/ec2/) — Cloud hosting
- [Docker](https://www.docker.com/) — Containerization
- [Nginx](https://nginx.org/) — Reverse proxy
- [DuckDNS](https://www.duckdns.org/) — Free domain
- [Let's Encrypt / Certbot](https://letsencrypt.org/) — SSL certificate
- Gale Encyclopedia of Medicine — Knowledge base