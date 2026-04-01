from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.db import db, Note, Flashcard, QuizResult
from sqlalchemy import func
from datetime import datetime, timedelta

stats_bp = Blueprint("stats", __name__)

@stats_bp.route("/", methods=["GET"])
@jwt_required()
def get_stats():
    try:
        user_id = int(get_jwt_identity())

        # Quiz history (last 7) - Ordered by created_at ASC for chart
        quizzes = QuizResult.query.filter_by(user_id=user_id).order_by(QuizResult.created_at.desc()).limit(7).all()
        quizzes.reverse() 
        
        quiz_history = []
        for q in quizzes:
            # Formula: round((score / total) * 100) as percentage
            perc = round((q.score / q.total) * 100) if q.total > 0 else 0
            quiz_history.append({
                "date": q.created_at.strftime("%b %d"),
                "score": perc
            })

        # Notes by subject - Top 5
        subjects_data = db.session.query(
            Note.subject, func.count(Note.id).label("count")
        ).filter_by(user_id=user_id).group_by(Note.subject).order_by(func.count(Note.id).desc()).limit(5).all()
        
        notes_by_subject = []
        for s, count in subjects_data:
            label = s if s and s.strip() else "General"
            notes_by_subject.append({"subject": label, "count": count})

        # Metric totals
        total_notes = Note.query.filter_by(user_id=user_id).count()
        total_flashcards = Flashcard.query.filter_by(user_id=user_id).count()
        total_quizzes = QuizResult.query.filter_by(user_id=user_id).count()
        
        # Average quiz score
        all_quizzes = QuizResult.query.filter_by(user_id=user_id).all()
        avg_score = 0
        if all_quizzes:
            total_perc = sum([round((q.score / q.total) * 100) if q.total > 0 else 0 for q in all_quizzes])
            avg_score = round(total_perc / len(all_quizzes))

        # Study Streak
        streak = 0
        today = datetime.utcnow().date()
        current_day = today
        
        while True:
            # Check for activity on current_day
            has_activity = Note.query.filter(
                Note.user_id == user_id,
                func.date(Note.created_at) == current_day
            ).first() or QuizResult.query.filter(
                QuizResult.user_id == user_id,
                func.date(QuizResult.created_at) == current_day
            ).first()
            
            if has_activity:
                streak += 1
                current_day -= timedelta(days=1)
            else:
                break

        return jsonify({
            "success": True,
            "data": {
                "quiz_history": quiz_history,
                "notes_by_subject": notes_by_subject,
                "total_notes": total_notes,
                "total_flashcards": total_flashcards,
                "total_quizzes": total_quizzes,
                "avg_quiz_score": avg_score,
                "streak": streak
            }
        })
    except Exception as e:
        print(f"Stats Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
