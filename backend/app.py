from flask import Flask, request, Blueprint, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from dotenv import load_dotenv
from models.db import db, Note
from utils.gemini import summarize_note, generate_flashcards, generate_quiz, search_notes_ai
import json
import os

load_dotenv()

app = Flask(__name__)
# Allow both localhost and 127.0.0.1 for maximum compatibility during development
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Origin"])
@app.route("/health")
def health():
    return {"status": "ok", "message": "Backend is connected!"}

@app.before_request
def log_request_info():
    app.logger.debug('Headers: %s', request.headers)
    app.logger.debug('Body: %s', request.get_data())
    print(f"Request: {request.method} {request.path}")

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")

db.init_app(app)
jwt = JWTManager(app)

from routes.auth import auth_bp
from routes.notes import notes_bp
from routes.ai import ai_bp
from routes.quiz import quiz_bp
from routes.flashcards import flashcards_bp
from routes.planner import planner_bp
from routes.stats import stats_bp

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(notes_bp, url_prefix="/api/notes")
app.register_blueprint(ai_bp, url_prefix="/api/ai")
app.register_blueprint(quiz_bp, url_prefix="/api/quiz")
app.register_blueprint(flashcards_bp, url_prefix="/api/flashcards")
app.register_blueprint(planner_bp, url_prefix="/api/planner")
app.register_blueprint(stats_bp, url_prefix="/api/stats")

with app.app_context():
    db.create_all()
    # Create demo user if doesn't exist
    from models.db import User
    import bcrypt
    if not User.query.filter_by(email="demo@studymind.app").first():
        hashed = bcrypt.hashpw("demo123".encode(), bcrypt.gensalt()).decode()
        demo_user = User(name="Demo Student", email="demo@studymind.app", password_hash=hashed)
        db.session.add(demo_user)
        db.session.commit()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
