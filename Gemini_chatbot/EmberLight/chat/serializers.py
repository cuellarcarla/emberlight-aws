from rest_framework import serializers
from .models import ChatLog

class ChatLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatLog
        fields = ["id", "user", "message", "response", "timestamp"]
        read_only_fields = ["id", "user", "response", "timestamp"]
