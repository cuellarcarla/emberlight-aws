from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ChatLog
from .serializers import ChatLogSerializer
from .utils import generate_ai_response

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_chat_history(request):
    logs = ChatLog.objects.filter(user=request.user).order_by("timestamp")
    serializer = ChatLogSerializer(logs, many=True)
    return Response({"chat_history": serializer.data})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat(request):
    message = request.data.get("message")
    if not message:
        return Response({"error": "Message is required"}, status=400)

    response = generate_ai_response(message)
    chat_log = ChatLog.objects.create(user=request.user, message=message, response=response)
    return Response({"response": response})