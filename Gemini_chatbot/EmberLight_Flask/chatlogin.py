from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from flask_cors import CORS
import google.generativeai as genai
import psycopg2
import os
from dotenv import load_dotenv
from datetime import timedelta

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
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=7)

# Database connection parameters
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
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                message TEXT NOT NULL,
                response TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        conn.commit()

# Home/Login Page
@app.route("/")
def home():
    if "user_id" in session:
        return redirect(url_for("chat_page"))
    return render_template("login.html")

# Register User
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
            if cursor.fetchone():
                return jsonify({"error": "Username already exists"}), 400
            
            cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s) RETURNING id", (username, password))
            user_id = cursor.fetchone()[0]
            conn.commit()

    return jsonify({"message": "User registered successfully", "user_id": user_id})

# Login User
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE username = %s AND password = %s", (username, password))
            user = cursor.fetchone()
            if not user:
                return jsonify({"error": "Invalid username or password"}), 401

            session["user_id"] = user[0]
            session.permanent = True
    
    return jsonify({"message": "Login successful", "redirect": url_for("chat_page")})

# Logout
@app.route("/logout")
def logout():
    session.pop("user_id", None)
    return redirect(url_for("home"))

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

# Fetch Chat History
@app.route("/get_chat_history", methods=["GET"])
def get_chat_history():
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    user_id = session["user_id"]

    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT message, response FROM chat_logs WHERE user_id = %s ORDER BY timestamp ASC", (user_id,))
            chat_history = cursor.fetchall()

    return jsonify({"chat_history": chat_history})

# Chat with AI
@app.route("/chat", methods=["POST"])
def chat():
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    user_id = session["user_id"]
    data = request.json
    message = data.get("message")

    response = chat_with_ai(user_id, message)
    
    return jsonify({"response": response})

# Serve Chat Page
@app.route("/chat_page")
def chat_page():
    if "user_id" not in session:
        return redirect(url_for("home"))
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
