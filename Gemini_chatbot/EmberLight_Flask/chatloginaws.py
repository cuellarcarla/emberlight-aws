import os
import boto3
import json
from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from dotenv import load_dotenv
import google.generativeai as genai

import base64
import hmac
import hashlib

# Load environment variables
load_dotenv()

# AWS Setup
AWS_REGION = os.getenv("AWS_REGION")
DYNAMODB_MOOD_TABLE = os.getenv("DYNAMODB_MOOD_TABLE")
DYNAMODB_CHAT_TABLE = os.getenv("DYNAMODB_CHAT_TABLE")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")
COGNITO_CLIENT_SECRET = os.getenv("COGNITO_CLIENT_SECRET")

def generate_secret_hash(client_id, secret, username):
    message = username + client_id
    secret_hash = base64.b64encode(
        hmac.new(bytes(secret, 'utf-8'), bytes(message, 'utf-8'), hashlib.sha256).digest()
    ).decode('utf-8')
    return secret_hash

# Initialize AWS clients
dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
cognito = boto3.client("cognito-idp", region_name=AWS_REGION)

mood_table = dynamodb.Table(DYNAMODB_MOOD_TABLE)
chat_table = dynamodb.Table(DYNAMODB_CHAT_TABLE)

# Configure Google Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "supersecret")
jwt = JWTManager(app)

# Default route (Show login page)
@app.route("/")
def home():
    return render_template("login.html")

# User Registration (with Cognito)
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data["username"]
    email = data["email"]
    password = data["password"]

    try:
        secret_hash = generate_secret_hash(COGNITO_CLIENT_ID, COGNITO_CLIENT_SECRET, email)
        cognito.sign_up(
            ClientId=COGNITO_CLIENT_ID,
            SecretHash=secret_hash,
            Username=email,
            Password=password,
            UserAttributes=[{"Name": "email", "Value": email},{"Name": "name", "Value": username}]
        )
        return jsonify({"message": "User registered successfully. Please verify your email."})
    except cognito.exceptions.UsernameExistsException:
        return jsonify({"error": "User already exists"}), 400

# Confirm Email Verification
@app.route("/confirm_email", methods=["POST"])
def confirm_email():
    data = request.json
    email = data["email"]
    code = data["code"]

    try:
        secret_hash = generate_secret_hash(COGNITO_CLIENT_ID, COGNITO_CLIENT_SECRET, email)
        cognito.confirm_sign_up(ClientId=COGNITO_CLIENT_ID,SecretHash=secret_hash, Username=email, ConfirmationCode=code)
        return jsonify({"message": "Email confirmed successfully!"})
    except cognito.exceptions.CodeMismatchException:
        return jsonify({"error": "Invalid verification code"}), 400

# Login with Cognito
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data["email"]
    password = data["password"]

    try:
        response = cognito.initiate_auth(
            ClientId=COGNITO_CLIENT_ID,
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={"USERNAME": email, "PASSWORD": password}
        )
        access_token = response["AuthenticationResult"]["AccessToken"]
        session["user_email"] = email
        return jsonify({"access_token": access_token, "redirect": url_for("chat_page")})
    except cognito.exceptions.NotAuthorizedException:
        return jsonify({"error": "Invalid username or password"}), 401
    except cognito.exceptions.UserNotConfirmedException:
        return jsonify({"error": "Please verify your email first"}), 403

# Logout
@app.route("/logout")
def logout():
    session.pop("user_email", None)
    return redirect(url_for("home"))

# AI-powered Emotion Analysis
def analyze_emotion(user_input):
    model = genai.GenerativeModel("gemini-2.0-flash-lite")
    response = model.generate_content(f"Analyze this text for emotion: '{user_input}'.")
    return response.text.strip()

# Store Mood Entry (Protected)
@app.route("/add_mood", methods=["POST"])
@jwt_required()
def add_mood():
    user_email = get_jwt_identity()
    data = request.json
    user_input = data["user_input"]
    emotion = analyze_emotion(user_input)

    mood_table.put_item(Item={"email": user_email, "user_input": user_input, "emotion": emotion})
    
    return jsonify({"message": "Mood added successfully", "emotion": emotion})

# Get Mood History (Protected)
@app.route("/get_moods", methods=["GET"])
@jwt_required()
def get_moods():
    user_email = get_jwt_identity()
    response = mood_table.scan(FilterExpression="email = :e", ExpressionAttributeValues={":e": user_email})
    
    return jsonify({"moods": response.get("Items", [])})

# AI Chat Endpoint (Protected)
@app.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    user_email = get_jwt_identity()
    data = request.json
    message = data["message"]
    
    model = genai.GenerativeModel("gemini-2.0-flash-lite")
    response_text = model.generate_content(message).text.strip()
    
    chat_table.put_item(Item={"email": user_email, "message": message, "response": response_text})
    
    return jsonify({"response": response_text})

# Get Chat History (Protected)
@app.route("/get_chat_history", methods=["GET"])
@jwt_required()
def get_chat_history():
    user_email = get_jwt_identity()
    response = chat_table.scan(FilterExpression="email = :e", ExpressionAttributeValues={":e": user_email})
    
    return jsonify({"chat_history": response.get("Items", [])})

# Serve Chat Page (Protected)
@app.route("/chat_page")
def chat_page():
    if "user_email" not in session:
        return redirect(url_for("home"))
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
