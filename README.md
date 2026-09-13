<div align="center">

# ⚡ SachKai AI (Sach-Kya AI)
### *Autonomous Multi-Agent Fact Verification Platform*

![Deployment Status](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Build Status](https://img.shields.io/badge/Build-Passing-2ea44f?style=for-the-badge&logo=github-actions&logoColor=white)
![Python Version](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.style=for-the-badge)

<p align="center">
  <b>Real-Time Claim Verification • Multi-Agent Autonomous Telemetry • Bilingual Fact Checking</b>
  <br />
  <a href="https://your-vercel-deployment-link.vercel.app"><strong>🌐 View Live Demo »</strong></a>
</p>

---

</div>

## 📌 Executive Summary

**SachKai AI** is an autonomous, multi-agent misinformation detection platform designed to combat viral fake news, unverified social media claims, and media manipulation in real time. 

By orchestration of specialized AI agents working sequentially—from claim normalization and live web research to LLM reasoning and DB telemetry caching—SachKai provides transparent confidence scoring alongside bilingual executive summaries (English & Urdu).

---

## 🚀 Key Features

* 🧠 **Autonomous Multi-Agent Architecture:** Four independent AI micro-agents handling distinct tasks in the pipeline.
* 🔎 **Real-Time Web Telemetry:** Live ground-truth verification powered by search indexers.
* 🌐 **Bilingual Output Engine:** Generates dual-language verdicts (English & Urdu) for hyper-local context.
* 📊 **Transparent Confidence Scoring:** Calculates real-time 0–100 credibility index based on official source pass-throughs.
* ⚡ **Zero-Latency Response Caching:** Duplicate detection powered by Supabase vector database caching.
* 🎯 **Multi-Modal Ready:** Built to ingest text claims, audio transcription, and image OCR pipelines.

---

## 🛠 Tech Stack & Badges

### **Frontend & Interface**
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### **Backend & AI Engine**
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_LLM-F05032?style=for-the-badge&logo=cpu&logoColor=white)
![Tavily](https://img.shields.io/badge/Tavily_Search-4A90E2?style=for-the-badge&logo=google-chrome&logoColor=white)

### **Database & Infrastructure**
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## ⚙️ Multi-Agent Telemetry Architecture
                   ┌─────────────────────────┐
                   │   User Query Input      │
                   └───────────┬─────────────┘
                               │
                               ▼
                   ┌─────────────────────────┐
                   │  1. Claim Agent         │
                   │  (Normalize & Hash)     │
                   └───────────┬─────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
 [ Cache Hit: Supabase ]             [ Cache Miss: Live Search ]
                               |
 
 (Instant Verified Response)    
▼
┌─────────────────────────┐
│  2. Search Agent        │
│  (Tavily Live Indexing) │
└───────────┬─────────────┘
│
▼
┌─────────────────────────┐
│  3. Reasoning Agent     │
│  (Groq Deep Inference)  │
└───────────┬─────────────┘
│
▼
┌─────────────────────────┐
│  4. Cache Agent         │
│  (DB Store & Telemetry) │
└───────────┬─────────────┘
│
▼
┌─────────────────────────┐
│  Verdict UI Response    │
└─────────────────────────┘

| Agent Name | Primary Responsibility | Service / Engine |
| :--- | :--- | :--- |
| 🛡️ **Claim Agent** | Normalizes raw user claims and generates lookup hashes. | Python Core |
| 🔍 **Search Agent** | Scrapes live global news indices for real-time validation. | Tavily Search API |
| 🧠 **Reasoning Agent** | Performs cross-evidential analysis & calculates confidence score. | Groq Llama3 LLM |
| 💾 **Cache Agent** | Logs telemetry metrics and caches dual-language payloads. | Supabase PostgreSQL |

---

## 📂 Repository Structure

```directory
sach-kai/
├── public/                 # Static assets & brand media
├── src/                    # Next.js Frontend (App Router)
│   ├── app/                # UI Pages, API routes, layout styling
│   └── components/         # Telemetry badges, search cards, confidence meters
├── cache.py                # Supabase database integration & caching layer
├── query_transform.py      # Input text normalization pipeline
├── search.py               # Tavily search agent integration
├── reasoning.py            # Groq reasoning agent & prompt synthesis
├── main.py                 # FastAPI backend entry point
├── schemas.py              # Pydantic data schemas & response interfaces
├── supabase_schema.sql     # Database table configurations & policies
├── requirements.txt        # Backend dependencies
├── package.json            # Frontend dependencies
├── vercel.json             # Fullstack serverless build orchestration
└── README.md               # Documentation

🔑 Environment Variables Configuration
# AI Models & Web Search APIs
TAVILY_API_KEY=tvly-your_tavily_key_here
GROQ_API_KEY=gsk_your_groq_key_here

# Database Telemetry & Storage (Supabase)
SUPABASE_URL=[https://your-project-id.supabase.co](https://your-project-id.supabase.co)
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

🚦 Local Development Setup
1. Clone the repository
git clone [https://github.com/zappierRabbit/SachKai-MisInformation-Detector.git](https://github.com/zappierRabbit/SachKai-MisInformation-Detector.git)
cd SachKai-MisInformation-Detector

2. Install dependencies & Run Frontend
npm install
npm run dev

3. Install Python virtual environment & Run Backend
python -m venv .venv
source .venv/bin/activate # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

🌐 Live Deployment
This repository is optimized for one-click deployment via Vercel serverless environments:
