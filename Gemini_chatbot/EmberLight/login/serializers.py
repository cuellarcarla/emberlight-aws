from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User
import re

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)  # Ensure email format

    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}  # Hide password in API responses

    def validate_password(self, value):
        """
        Validate password format:
        - At least 8 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one symbol
        """
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r"[\W_]", value):  # \W matches non-word characters (symbols)
            raise serializers.ValidationError("Password must contain at least one symbol (e.g., @, $, !).")

        return value

    def validate_email(self, value):
        """
        Ensure email is unique.
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        """
        Create a new user with the validated data.
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        """
        Authenticate user with username and password.
        """
        user = authenticate(username=data["username"], password=data["password"])
        if not user:
            raise serializers.ValidationError("Invalid username or password.")
        return {"user": user}
