from django.contrib import admin  # Import the admin module
from .models import RoomMember  # Import the RoomMember model from your application

# Register your models here.
admin.site.register(RoomMember)  # Register the RoomMember model with the admin site
