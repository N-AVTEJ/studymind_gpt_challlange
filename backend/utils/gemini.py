import google.generativeai as genai
import os, json, re

def get_model():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment!")
    genai.configure(api_key=api_key)
    # Use the stable model directly for better reliability
    return genai.GenerativeModel("models/gemini-flash-latest")

def _parse_json(text):
    text = re.sub(r"```json|```", "", text).strip()
    try:
        return json.loads(text)
    except:
        # If not JSON, return a structured response from plain text
        return {"summary": text, "key_points": []}

def summarize_note(content, title, language="English"):
    prompt = f"""IMPORTANT: You MUST respond entirely in {language} language. 
    All keys in the JSON must remain in English, but ALL values (the summary text and every single key point) MUST be written in {language}.
    
    Task: Summarize this note in {language}.
    Note Title: {title}
    Note Content: {content[:3000]}"""
    try:
        model = get_model()
        resp = model.generate_content(prompt)
        return _parse_json(resp.text)
    except Exception as e:
        print(f"Gemini Summarize Error with primary model: {e}")
        try:
            # Fallback to stable model
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
            fallback_model = genai.GenerativeModel("models/gemini-flash-latest")
            resp = fallback_model.generate_content(prompt)
            return _parse_json(resp.text)
        except Exception as fallback_error:
            print(f"Fallback also failed: {fallback_error}")
            return {"summary": "AI is temporarily unavailable (Quota reached). Please try again in 1 minute.", "key_points": []}

def generate_flashcards(content, title, language="English"):
    try:
        model = get_model()
        prompt = f"""IMPORTANT: You MUST respond entirely in {language} language. 
        All keys in the JSON must remain in English, but ALL values (questions and answers) MUST be written in {language}.
        
        Task: Generate Flashcards in {language} for:
        Note Title: {title}
        Note Content: {content[:3000]}"""
        resp = model.generate_content(prompt)
        return _parse_json(resp.text)
    except Exception as e:
        print(f"Gemini Flashcards Error with primary model: {e}")
        try:
            # Fallback to stable model
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
            fallback_model = genai.GenerativeModel("models/gemini-flash-latest")
            resp = fallback_model.generate_content(prompt)
            return _parse_json(resp.text)
        except Exception as fallback_error:
            print(f"Fallback also failed: {fallback_error}")
            return []

def generate_quiz(content, title, language="English"):
    try:
        model = get_model()
        prompt = f"""IMPORTANT: You MUST respond entirely in {language} language. 
        All keys in the JSON must remain in English, but ALL values (questions, options, and explanations) MUST be written in {language}.
        
        Task: Create a Quiz in {language} based on:
        Note Title: {title}
        Note Content: {content[:3000]}"""
        resp = model.generate_content(prompt)
        return _parse_json(resp.text)
    except Exception as e:
        print(f"Gemini Quiz Error with primary model: {e}")
        try:
            # Fallback to stable model
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
            fallback_model = genai.GenerativeModel("models/gemini-flash-latest")
            resp = fallback_model.generate_content(prompt)
            return _parse_json(resp.text)
        except Exception as fallback_error:
            print(f"Fallback also failed: {fallback_error}")
            return []

def search_notes_ai(query, notes):
    try:
        model = get_model()
        notes_str = "\n\n".join([f"Note {n['id']} - {n['title']}:\n{n['content']}" for n in notes])
        prompt = f"""Search: {query}\nNotes: {notes_str[:4000]}"""
        resp = model.generate_content(prompt)
        return _parse_json(resp.text)
    except Exception as e:
        print(f"Gemini Search Error with primary model: {e}")
        try:
            # Fallback to stable model
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
            fallback_model = genai.GenerativeModel("models/gemini-flash-latest")
            resp = fallback_model.generate_content(prompt)
            return _parse_json(resp.text)
        except Exception as fallback_error:
            print(f"Fallback also failed: {fallback_error}")
            return {"answer": "Search currently unavailable.", "relevant_notes": []}

def generate_study_plan(subject, exam_date, weak_topics, notes=[]):
    try:
        model = get_model()
        notes_context = ""
        if notes:
            notes_context = f"The student has these specific notes: {', '.join(notes)}. You MUST EXPLICITLY mention which of these notes to review in the 'tasks' for specific days."
            
        prompt = f"""Create a highly personalized study plan JSON for {subject} leading up to {exam_date}.
        Weak Areas: {weak_topics}
        {notes_context}
        
        Return JSON with:
        - days: list of {{date, tasks (string mentioning specific notes if possible), focus}}
        - tips: list of study tips"""
        resp = model.generate_content(prompt)
        return _parse_json(resp.text)
    except Exception as e:
        print(f"Gemini Planner Error with primary model: {e}")
        try:
            # Fallback to stable model
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
            fallback_model = genai.GenerativeModel("models/gemini-flash-latest")
            resp = fallback_model.generate_content(prompt)
            return _parse_json(resp.text)
        except Exception as fallback_error:
            print(f"Fallback also failed: {fallback_error}")
            return {"days": [], "tips": ["AI busy. Try again soon."]}
