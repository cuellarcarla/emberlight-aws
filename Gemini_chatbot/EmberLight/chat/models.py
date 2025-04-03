from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass

class ChatLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
