import google.generativeai as genai
from django.conf import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

def generate_ai_response(message):
    model = genai.GenerativeModel("gemini-2.0-flash-lite", generation_config=genai.types.GenerationConfig(
        temperature=0.7,
        max_output_tokens=50
    ))
    return model.generate_content(message).text.strip()
