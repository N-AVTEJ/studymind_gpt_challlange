from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.db import db, Note
from utils.gemini import summarize_note, generate_flashcards, generate_quiz, search_notes_ai
import json

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/summarize/<int:note_id>", methods=["POST"])
@jwt_required()
def summarize(note_id):
    user_id = int(get_jwt_identity())
    language = request.json.get("language", "English")
    note = Note.query.filter_by(id=note_id, user_id=user_id).first_or_404()
    result = summarize_note(note.content, note.title, language)
    note.summary = result.get("summary", "")
    note.key_points = result.get("key_points", [])
    db.session.commit()
    return jsonify(result)

@ai_bp.route("/flashcards/<int:note_id>", methods=["POST"])
@jwt_required()
def create_flashcards(note_id):
    user_id = int(get_jwt_identity())
    language = request.json.get("language", "English")
    note = Note.query.filter_by(id=note_id, user_id=user_id).first_or_404()
    cards = generate_flashcards(note.content, note.title, language)
    from models.db import Flashcard
    for card in cards:
        fc = Flashcard(note_id=note.id, user_id=user_id,
                       question=card["question"], answer=card["answer"])
        db.session.add(fc)
    db.session.commit()
    return jsonify(cards)

@ai_bp.route("/quiz/<int:note_id>", methods=["POST"])
@jwt_required()
def create_quiz(note_id):
    user_id = int(get_jwt_identity())
    language = request.json.get("language", "English")
    note = Note.query.filter_by(id=note_id, user_id=user_id).first_or_404()
    questions = generate_quiz(note.content, note.title, language)
    return jsonify(questions)

@ai_bp.route("/search", methods=["POST"])
@jwt_required()
def semantic_search():
    user_id = int(get_jwt_identity())
    query = request.json.get("query", "")
    notes = Note.query.filter_by(user_id=user_id).all()
    if not notes:
        return jsonify({"answer": "No notes found.", "relevant_notes": []})
    notes_text = [{"id": n.id, "title": n.title, "content": n.content[:500]} for n in notes]
    result = search_notes_ai(query, notes_text)
    return jsonify(result)
