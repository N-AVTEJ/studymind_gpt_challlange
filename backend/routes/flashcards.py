from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.db import db, Flashcard

flashcards_bp = Blueprint("flashcards", __name__)

@flashcards_bp.route("/", methods=["GET"])
@jwt_required()
def get_flashcards():
    user_id = int(get_jwt_identity())
    note_id = request.args.get("note_id")
    query = Flashcard.query.filter_by(user_id=user_id)
    if note_id:
        query = query.filter_by(note_id=note_id)
    cards = query.all()
    return jsonify([{"id": c.id, "note_id": c.note_id, "question": c.question,
                     "answer": c.answer} for c in cards])

@flashcards_bp.route("/<int:card_id>", methods=["DELETE"])
@jwt_required()
def delete_flashcard(card_id):
    user_id = int(get_jwt_identity())
    card = Flashcard.query.filter_by(id=card_id, user_id=user_id).first_or_404()
    db.session.delete(card)
    db.session.commit()
    return jsonify({"message": "Deleted"})
