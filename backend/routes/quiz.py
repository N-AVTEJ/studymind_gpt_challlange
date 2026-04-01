from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.db import db, QuizResult

quiz_bp = Blueprint("quiz", __name__)

@quiz_bp.route("/results", methods=["POST"])
@jwt_required()
def save_result():
    user_id = int(get_jwt_identity())
    data = request.json
    result = QuizResult(user_id=user_id, subject=data.get("subject"),
                        score=data.get("score"), total=data.get("total"),
                        weak_topics=data.get("weak_topics", []))
    db.session.add(result)
    db.session.commit()
    return jsonify({"id": result.id, "score": result.score, "total": result.total}), 201

@quiz_bp.route("/results", methods=["GET"])
@jwt_required()
def get_results():
    user_id = int(get_jwt_identity())
    results = QuizResult.query.filter_by(user_id=user_id).order_by(QuizResult.created_at.desc()).limit(20).all()
    return jsonify([{"id": r.id, "subject": r.subject, "score": r.score,
                     "total": r.total, "weak_topics": r.weak_topics,
                     "created_at": r.created_at.isoformat()} for r in results])
