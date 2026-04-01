from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.db import db, Note
from werkzeug.utils import secure_filename
import os
from utils.file_processor import extract_text_from_file, get_file_title

notes_bp = Blueprint("notes", __name__)

@notes_bp.route("/", methods=["GET"])
@jwt_required()
def get_notes():
    user_id = int(get_jwt_identity())
    subject = request.args.get("subject")
    query = Note.query.filter_by(user_id=user_id)
    if subject:
        query = query.filter_by(subject=subject)
    notes = query.order_by(Note.updated_at.desc()).all()
    return jsonify([_serialize(n) for n in notes])

@notes_bp.route("/", methods=["POST"])
@jwt_required()
def create_note():
    user_id = int(get_jwt_identity())
    data = request.json
    note = Note(user_id=user_id, title=data.get("title", "Untitled"),
                content=data.get("content", ""), subject=data.get("subject", "General"))
    db.session.add(note)
    db.session.commit()
    return jsonify(_serialize(note)), 201

@notes_bp.route("/<int:note_id>", methods=["GET"])
@jwt_required()
def get_note(note_id):
    user_id = int(get_jwt_identity())
    note = Note.query.filter_by(id=note_id, user_id=user_id).first_or_404()
    return jsonify(_serialize(note))

@notes_bp.route("/<int:note_id>", methods=["PUT"])
@jwt_required()
def update_note(note_id):
    user_id = int(get_jwt_identity())
    note = Note.query.filter_by(id=note_id, user_id=user_id).first_or_404()
    data = request.json
    note.title = data.get("title", note.title)
    note.content = data.get("content", note.content)
    note.subject = data.get("subject", note.subject)
    db.session.commit()
    return jsonify(_serialize(note))

@notes_bp.route("/<int:note_id>", methods=["DELETE"])
@jwt_required()
def delete_note(note_id):
    user_id = int(get_jwt_identity())
    note = Note.query.filter_by(id=note_id, user_id=user_id).first_or_404()
    db.session.delete(note)
    db.session.commit()
    return jsonify({"message": "Deleted"})

@notes_bp.route("/subjects", methods=["GET"])
@jwt_required()
def get_subjects():
    user_id = int(get_jwt_identity())
    subjects = db.session.query(Note.subject).filter_by(user_id=user_id).distinct().all()
    return jsonify([s[0] for s in subjects])

@notes_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_file():
    user_id = int(get_jwt_identity())
    
    # Check if file is present
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    # Check file extension
    allowed_extensions = {'.pdf', '.docx', '.doc'}
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        return jsonify({"error": "Unsupported file type. Please upload PDF or DOCX files"}), 400
    
    # Create upload directory if it doesn't exist
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    # Save the file
    filename = secure_filename(file.filename)
    file_path = os.path.join(upload_dir, filename)
    file.save(file_path)
    
    try:
        # Extract text from file
        content = extract_text_from_file(file_path, filename)
        
        if content is None:
            os.remove(file_path)  # Clean up uploaded file
            return jsonify({"error": "Failed to extract text from file"}), 400
        
        # Create note from extracted content
        title = get_file_title(filename)
        subject = request.form.get('subject', 'General')
        
        note = Note(
            user_id=user_id,
            title=title,
            content=content.strip(),
            subject=subject
        )
        
        db.session.add(note)
        db.session.commit()
        
        # Clean up uploaded file
        os.remove(file_path)
        
        return jsonify(_serialize(note)), 201
        
    except Exception as e:
        # Clean up uploaded file on error
        if os.path.exists(file_path):
            os.remove(file_path)
        print(f"Error processing file: {e}")
        return jsonify({"error": "Failed to process file"}), 500

def _serialize(n):
    return {"id": n.id, "title": n.title, "content": n.content,
            "subject": n.subject, "summary": n.summary, "key_points": n.key_points,
            "created_at": n.created_at.isoformat(), "updated_at": n.updated_at.isoformat()}
