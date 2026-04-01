from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.db import db, StudyPlan, QuizResult, Note
from utils.gemini import generate_study_plan
from datetime import date

planner_bp = Blueprint("planner", __name__)

@planner_bp.route("/", methods=["GET"])
@jwt_required()
def get_plans():
    user_id = int(get_jwt_identity())
    plans = StudyPlan.query.filter_by(user_id=user_id).all()
    return jsonify([_s(p) for p in plans])

@planner_bp.route("/generate", methods=["POST"])
@jwt_required()
def create_plan():
    user_id = int(get_jwt_identity())
    data = request.json
    subject = data.get("subject")
    exam_date = data.get("exam_date")

    if not subject or not exam_date:
        return jsonify({"error": "Subject and exam date are required"}), 400
    
    try:
        dt = date.fromisoformat(exam_date)
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    weak = [r.weak_topics for r in QuizResult.query.filter_by(
        user_id=user_id, subject=subject).order_by(QuizResult.created_at.desc()).limit(3).all()]
    flat_weak = [t for sub in weak if sub for t in sub]

    # Fetch note titles for this subject to personalize the plan
    notes = Note.query.filter_by(user_id=user_id, subject=subject).all()
    note_titles = [n.title for n in notes]

    plan_data = generate_study_plan(subject, exam_date, flat_weak, note_titles)
    plan = StudyPlan(user_id=user_id, subject=subject, exam_date=dt, plan=plan_data)
    db.session.add(plan)
    db.session.commit()
    return jsonify(_s(plan)), 201

@planner_bp.route("/<int:plan_id>", methods=["DELETE"])
@jwt_required()
def delete_plan(plan_id):
    user_id = int(get_jwt_identity())
    plan = StudyPlan.query.filter_by(id=plan_id, user_id=user_id).first_or_404()
    db.session.delete(plan)
    db.session.commit()
    return jsonify({"message": "Deleted"})

def _s(p):
    return {"id": p.id, "subject": p.subject,
            "exam_date": p.exam_date.isoformat() if p.exam_date else None,
            "plan": p.plan, "created_at": p.created_at.isoformat()}
