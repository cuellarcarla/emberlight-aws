import google.generativeai as genai
from django.conf import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """
You are a mental health assistant. The user has shared some journal entries with you.
Use this context to provide personalized advice. Be empathetic and supportive.
"""

def generate_ai_response(prompt):
    model = genai.GenerativeModel("gemini-2.0-flash-lite", 
        system_instruction=SYSTEM_PROMPT,
        generation_config=genai.types.GenerationConfig(
            temperature=0.7,
            max_output_tokens=150
        ))
    return model.generate_content(prompt).text.strip()