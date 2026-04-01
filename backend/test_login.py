from flask import Flask
import os
from dotenv import load_dotenv
from models.db import db, User
import bcrypt

load_dotenv()

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

with app.app_context():
    try:
        user = User.query.filter_by(email="demo@studymind.app").first()
        if not user:
            print("ERROR: User not found!")
            exit(1)
            
        password_to_test = "demo123"
        is_match = bcrypt.checkpw(password_to_test.encode(), user.password_hash.encode())
        print(f"Password 'demo123' match check: {is_match}")
        
    except Exception as e:
        print(f"DATABASE ERROR: {e}")
