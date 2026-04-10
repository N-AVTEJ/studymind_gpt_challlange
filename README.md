 StudyMind — AI-Powered Smart Study Ecosystem

StudyMind is a full-stack intelligent study platform designed to enhance the learning experience using advanced AI capabilities. Powered by Google Gemini 1.5 Flash, it enables students to convert voice into structured notes, generate personalized study plans, and track learning progress through interactive visual insights.

✨ Core Features
🎙️ Voice-to-Notes (Real-Time)
Live Dictation: Convert lectures or spoken thoughts into structured notes using the Web Speech API.
Interactive UI: Clean and responsive microphone interface with real-time text rendering.

🌍 Multi-Language AI Support
6 Language Support: English, Hindi, Telugu, Tamil, Kannada, and Malayalam.
Context-Aware AI: Generates summaries, flashcards, and quizzes while preserving subject accuracy across languages.

📊 Smart Progress Dashboard
Visual Analytics: Track performance using dynamic charts powered by Chart.js.
Study Streak System: Motivational tracking of daily learning consistency.
Performance Metrics: Monitor notes count, flashcards, and quiz accuracy in real time.

📅 AI-Powered Study Planner
Personalized Scheduling: Generates daily study plans based on exam deadlines.
Note Integration: Plans are built around your existing notes for efficient revision.
🛠 Tech Stack
Frontend
Next.js 14 (App Router)
Tailwind CSS
Chart.js
Typography: Syne & DM Sans
Backend
Python Flask (REST API)
Flask-JWT-Extended (Authentication)
SQLAlchemy (ORM)
Database
MySQL (Local / Cloud-hosted)
AI & Voice
Google Generative AI (Gemini 1.5 Flash)
Web Speech API (Browser-based voice recognition)


🚀 Getting Started
1. Database Setup
CREATE DATABASE studymind;

Update your database credentials in /backend/.env

2. Backend Setup
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
Backend runs at: http://localhost:5000
3. Frontend Setup
cd frontend
npm install
npm run dev
Frontend runs at: http://localhost:3000

🔐 Environment Variables
Backend (/backend/.env)
Variable	Description
DATABASE_URL	MySQL connection string
GEMINI_API_KEY	Google AI API Key
JWT_SECRET_KEY	Authentication token secret
SECRET_KEY	Flask session security key
Frontend (/frontend/.env.local)
Variable	Description
NEXT_PUBLIC_API_URL	Backend API URL

For the best experience with Voice-to-Notes, use:

Google Chrome (v25+)
Microsoft Edge (v79+)

⚠️ Ensure microphone permissions are enabled in your browser.

📝 Developer Notes
Linter warnings like “Could not find import” in VS Code may appear due to environment mismatches.
These can be safely ignored if the backend runs correctly using:
python app.py
