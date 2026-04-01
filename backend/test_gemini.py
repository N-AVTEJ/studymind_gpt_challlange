import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"Testing Gemini with key: {api_key[:10]}...")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content("Say 'Hello StudyMind' if you can read this.")
    print(f"Gemini Response: {response.text}")
except Exception as e:
    print(f"GEMINI ERROR: {e}")
