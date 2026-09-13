# SachKai

Autonomous multi-agent misinformation verification for text, image, and audio claims.

## Docker Setup

Create a local `.env` file:

```bash
cp .env.example .env
```

Fill these values in `.env`:

```bash
GROQ_API_KEY=your_groq_key
TAVILY_API_KEY=your_tavily_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Then start the full app:

```bash
docker compose up --build
```

Or use Make:

```bash
make start
make status
make stop
```

Open:

```txt
http://localhost:3000
```

Backend API:

```txt
http://localhost:8000
```

## What Docker Runs

- `frontend`: Next.js production server on port `3000`
- `backend`: FastAPI server on port `8000`
- Tesseract OCR is installed inside the backend image for image uploads
- `faster-whisper` runs locally inside the backend container for audio uploads
- Hugging Face model cache is persisted in a Docker volume named `whisper-cache`

## Useful Commands

```bash
docker compose ps
docker compose logs -f
docker compose down
docker compose build
```

## Supabase

Run the SQL in `supabase_schema.sql` inside the Supabase SQL Editor before testing persistent feed/cache behavior.

## Local Development Without Docker

Backend:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

```bash
npm install
npm run dev -- --port 3000
```
