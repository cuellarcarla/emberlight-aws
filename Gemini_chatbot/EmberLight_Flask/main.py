from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import google.generativeai as genai
import psycopg2
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Configure Google Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Database connection
DB_PARAMS = {
    'dbname': os.getenv("DB_NAME"),
    'user': os.getenv("DB_USER"),
    'password': os.getenv("DB_PASSWORD"),
    'host': os.getenv("DB_HOST")
}

def get_db_connection():
    return psycopg2.connect(**DB_PARAMS)

# Initialize database
with get_db_connection() as conn:
    with conn.cursor() as cursor:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS mood_logs (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                user_input TEXT,
                emotion TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS chat_logs (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                message TEXT,
                response TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        conn.commit()

# Analyze emotion using AI
def analyze_emotion(user_input):
    model = genai.GenerativeModel("gemini-2.0-flash-lite", generation_config=genai.types.GenerationConfig(
        temperature=0.5,
        max_output_tokens=100
    ))
    response = model.generate_content(f"Analyze this text for emotional state: '{user_input}'. Give them advice or make questions to understand their problem")
    return response.text.strip()

# Chat with AI
def chat_with_ai(user_id, message):
    model = genai.GenerativeModel("gemini-2.0-flash-lite", generation_config=genai.types.GenerationConfig(
        temperature=0.7,
        max_output_tokens=50  # Shorter responses
    ))
    response = model.generate_content(message).text.strip()
    
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("INSERT INTO chat_logs (user_id, message, response) VALUES (%s, %s, %s)", (user_id, message, response))
            conn.commit()
    
    return response

# Add Mood Entry
@app.route("/add_mood", methods=["POST"])
def add_mood():
    data = request.json
    user_id = data["user_id"]
    user_input = data["user_input"]
    emotion = analyze_emotion(user_input)
    
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("INSERT INTO mood_logs (user_id, user_input, emotion) VALUES (%s, %s, %s)", (user_id, user_input, emotion))
            conn.commit()
    
    return jsonify({"message": "Mood added successfully", "emotion": emotion})

# Get Mood History
@app.route("/get_moods/<user_id>", methods=["GET"])
def get_moods(user_id):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT user_input, emotion, timestamp FROM mood_logs WHERE user_id = %s ORDER BY timestamp DESC", (user_id,))
            moods = cursor.fetchall()
    
    return jsonify({"moods": moods})

# Correct Mood
@app.route("/correct_mood", methods=["POST"])
def correct_mood():
    data = request.json
    mood_id = data["mood_id"]
    corrected_emotion = data["corrected_emotion"]
    
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE mood_logs SET emotion = %s WHERE id = %s", (corrected_emotion, mood_id))
            conn.commit()
    
    return jsonify({"message": "Mood corrected successfully"})

# Get Mood Trends
@app.route("/mood_trends/<user_id>", methods=["GET"])
def mood_trends(user_id):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT emotion, COUNT(*) FROM mood_logs
                WHERE user_id = %s
                GROUP BY emotion
                ORDER BY COUNT(*) DESC
            """, (user_id,))
            trends = cursor.fetchall()
    
    return jsonify({"trends": trends})

# AI Chat Endpoint
@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_id = data["user_id"]
    message = data["message"]
    response = chat_with_ai(user_id, message)
    return jsonify({"response": response})

# Fetch Chat History
@app.route("/get_chat_history/<user_id>", methods=["GET"])
def get_chat_history(user_id):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT message, response FROM chat_logs WHERE user_id = %s ORDER BY timestamp ASC", (user_id,))
            chat_history = cursor.fetchall()
    
    return jsonify({"chat_history": chat_history})

# Serve Chat Page
@app.route("/")
def chat_page():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
