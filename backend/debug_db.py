from flask import Flask
import os
from dotenv import load_dotenv
from models.db import db, User

load_dotenv()

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

with app.app_context():
    try:
        users = User.query.all()
        print(f"Database connected! Found {len(users)} users.")
        for u in users:
            print(f"- {u.name} ({u.email})")
        
        demo = User.query.filter_by(email="demo@studymind.app").first()
        if demo:
            print("DEMO USER EXISTS!")
        else:
            print("DEMO USER NOT FOUND!")
    except Exception as e:
        print(f"DATABASE ERROR: {e}")
