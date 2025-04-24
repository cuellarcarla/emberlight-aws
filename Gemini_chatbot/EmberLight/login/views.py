from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from .serializers import RegisterSerializer, LoginSerializer
from django.contrib.auth.models import User

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            refresh = RefreshToken.for_user(user)
            response = Response({
                "access_token": str(refresh.access_token),
                "username": user.username,
            })
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                httponly=True,
                secure=False,
                samesite='Lax',
                path='/'
            )
            return response

            """
            return Response({
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "username": user.username
            })
            """
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = JsonResponse({"message": "Logged out successfully"}, status=200)
        # Clear the HttpOnly cookie by setting an expired refresh token
        response.delete_cookie(
            key='refresh_token', 
            samesite='Lax',  # Match your frontend setup
            secure=False,    # Set to True if using HTTPS
            path='/'
        )
        return response

class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # Read refresh token from cookie if not provided in request body
        if not request.data.get("refresh"):
            refresh_token = request.COOKIES.get("refresh_token")
            if refresh_token:
                request.data._mutable = True  # Make request.data writable
                request.data["refresh"] = refresh_token
        return super().post(request, *args, **kwargs)
