from django.urls import path  # Import the path function from django.urls
from . import views  # Import the views module from the current directory (assuming it contains views.py)

# Define the URL patterns for the application
urlpatterns = [
    path('', views.lobby),  # Map the root URL to the lobby view function
    path('room/', views.room),  # Map the '/room/' URL to the room view function
    path('get_token/', views.getToken),  # Map the '/get_token/' URL to the getToken view function
    path('create_member/', views.createMember),  # Map the '/create_member/' URL to the createMember view function
    path('get_member/', views.getMember),  # Map the '/get_member/' URL to the getMember view function
    path('delete_member/', views.deleteMember),  # Map the '/delete_member/' URL to the deleteMember view function
]
