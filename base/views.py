from django.shortcuts import render  # Import render function from django.shortcuts
from agora_token_builder import RtcTokenBuilder  # Import RtcTokenBuilder from agora_token_builder
from django.http import JsonResponse  # Import JsonResponse from django.http to send JSON responses
import time  # Import time module for handling time-related operations
import random  # Import random module for generating random numbers
import json  # Import json module for handling JSON data

from .models import RoomMember  # Import RoomMember model from the current directory (assuming it contains models.py)

from django.views.decorators.csrf import csrf_exempt  # Import csrf_exempt decorator to exempt views from CSRF checks

# Define the view functions

# View function to generate a token for Agora RTC
def getToken(request):
    # Define Agora credentials and other necessary parameters
    appId = 'cd175129f05449cf8ebcf25c2deaf54d'
    appCertificate = '850b173bcde24d74b5fcb47be5efd501'
    channelName = request.GET.get('channel')
    uid = random.randint(1, 230)
    expirationTimeInSeconds = 3600 * 24
    currentTimeStamp = time.time()
    privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds
    role = 1

    # Generate token using RtcTokenBuilder
    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)

    # Return the token and UID as a JSON response
    return JsonResponse({'token': token, 'uid': uid}, safe=False)


# View function to render the lobby page
def lobby(request):
    return render(request, 'base/lobby.html')


# View function to render the room page
def room(request):
    return render(request, 'base/room.html')


# View function to create a room member
@csrf_exempt
def createMember(request):
    data = json.loads(request.body)  # Parse JSON data from the request body
    # Get or create a RoomMember object based on the provided data
    member, created = RoomMember.objects.get_or_create(
        name=data['name'],
        uid=data['UID'],
        room_name=data['room_name']
    )
    # Return the name of the created member as a JSON response
    return JsonResponse({'name': data['name']}, safe=False)


# View function to retrieve a room member
def getMember(request):
    uid = request.GET.get('UID')  # Get UID from the request parameters
    room_name = request.GET.get('room_name')  # Get room_name from the request parameters
    # Retrieve the RoomMember object based on UID and room_name
    member = RoomMember.objects.get(uid=uid, room_name=room_name)
    # Return the name of the member as a JSON response
    return JsonResponse({'name': member.name}, safe=False)


# View function to delete a room member
@csrf_exempt
def deleteMember(request):
    data = json.loads(request.body)  # Parse JSON data from the request body
    # Get the RoomMember object to delete based on provided data
    member = RoomMember.objects.get(
        name=data['name'],
        uid=data['UID'],
        room_name=data['room_name']
    )
    member.delete()  # Delete the member from the database
    return JsonResponse('Member was deleted', safe=False)  # Return a success message as a JSON response
