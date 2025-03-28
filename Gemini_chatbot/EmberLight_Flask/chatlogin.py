from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from flask_cors import CORS
import google.generativeai as genai
import psycopg2
import os
import bcrypt
from dotenv import load_dotenv
from datetime import timedelta
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

# Load environment variables
load_dotenv()

# Configure Google Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Secret key for sessions
app.secret_key = os.getenv("FLASK_SECRET_KEY", "supersecret")

# JWT Configuration
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "supersecret")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)
jwt = JWTManager(app)

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
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS mood_logs (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id),
                user_input TEXT,
                emotion TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS chat_logs (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id),
                message TEXT,
                response TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        conn.commit()

# Default route (Show login page)
@app.route("/")
def home():
    if "user_id" in session:
        return redirect(url_for("chat_page"))
    return render_template("login.html")

# Register User
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data["username"]
    password = data["password"]
    
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
            if cursor.fetchone():
                return jsonify({"error": "Username already exists"}), 400
            cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s) RETURNING id", (username, hashed_password))
            user_id = cursor.fetchone()[0]
            conn.commit()
    
    return jsonify({"message": "User registered successfully", "user_id": user_id})

# Login User
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data["username"]
    password = data["password"]

    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, password FROM users WHERE username = %s", (username,))
            user = cursor.fetchone()
            if not user or not bcrypt.checkpw(password.encode('utf-8'), user[1].encode('utf-8')):
                return jsonify({"error": "Invalid username or password"}), 401

            access_token = create_access_token(identity=user[0])
            session["user_id"] = user[0]  # Store user session
    
    return jsonify({"access_token": access_token, "redirect": url_for("chat_page")})

# Logout
@app.route("/logout")
def logout():
    session.pop("user_id", None)
    return redirect(url_for("home"))

# Analyze emotion using AI
def analyze_emotion(user_input):
    model = genai.GenerativeModel("gemini-2.0-flash-lite", generation_config=genai.types.GenerationConfig(
        temperature=0.5,
        max_output_tokens=100
    ))
    response = model.generate_content(f"Analyze this text for emotional state: '{user_input}'.")
    return response.text.strip()

# Chat with AI
def chat_with_ai(user_id, message):
    model = genai.GenerativeModel("gemini-2.0-flash-lite", generation_config=genai.types.GenerationConfig(
        temperature=0.7,
        max_output_tokens=50
    ))
    response = model.generate_content(message).text.strip()
    
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("INSERT INTO chat_logs (user_id, message, response) VALUES (%s, %s, %s)", (user_id, message, response))
            conn.commit()
    
    return response

# Add Mood Entry (Protected)
@app.route("/add_mood", methods=["POST"])
@jwt_required()
def add_mood():
    user_id = get_jwt_identity()
    data = request.json
    user_input = data["user_input"]
    emotion = analyze_emotion(user_input)
    
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("INSERT INTO mood_logs (user_id, user_input, emotion) VALUES (%s, %s, %s)", (user_id, user_input, emotion))
            conn.commit()
    
    return jsonify({"message": "Mood added successfully", "emotion": emotion})

# Get Mood History (Protected)
@app.route("/get_moods", methods=["GET"])
@jwt_required()
def get_moods():
    user_id = get_jwt_identity()
    
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT user_input, emotion, timestamp FROM mood_logs WHERE user_id = %s ORDER BY timestamp DESC", (user_id,))
            moods = cursor.fetchall()
    
    return jsonify({"moods": moods})

# AI Chat Endpoint (Protected)
@app.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    user_id = get_jwt_identity()
    data = request.json
    message = data["message"]
    response = chat_with_ai(user_id, message)
    return jsonify({"response": response})

# Fetch Chat History (Protected)
@app.route("/get_chat_history", methods=["GET"])
@jwt_required()
def get_chat_history():
    user_id = get_jwt_identity()
    
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT message, response FROM chat_logs WHERE user_id = %s ORDER BY timestamp ASC", (user_id,))
            chat_history = cursor.fetchall()
    
    return jsonify({"chat_history": chat_history})

# Serve Chat Page (Protected)
@app.route("/chat_page")
def chat_page():
    if "user_id" not in session:
        return redirect(url_for("home"))
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
