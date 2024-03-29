// Define constants for Agora App ID, channel, and token
const APP_ID = 'cd175129f05449cf8ebcf25c2deaf54d';
const CHANNEL = sessionStorage.getItem('room');
const TOKEN = sessionStorage.getItem('token');

// Parse UID from sessionStorage and convert it to a number
let UID = Number(sessionStorage.getItem('UID'));

// Get the user's name from sessionStorage
let NAME = sessionStorage.getItem('name');

// Create an AgoraRTC client
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

// Initialize variables for local and remote tracks, and remote users
let localTracks = [];
let remoteUsers = {};

// Function to join the channel and display the local stream
let joinAndDisplayLocalStream = async () => {
    // Set the room name in the UI
    document.getElementById('room-name').innerText = CHANNEL;

    // Set up event handlers for when users join and leave
    client.on('user-published', handleUserJoined);
    client.on('user-left', handleUserLeft);

    try {
        // Join the channel with the provided App ID, channel name, token, and UID
        UID = await client.join(APP_ID, CHANNEL, TOKEN, UID);
    } catch (error) {
        console.error(error);
        // Redirect to the homepage if an error occurs
        window.open('/', '_self');
    }

    // Create local audio and video tracks
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

    // Create a member for the local user
    let member = await createMember();

    // Generate HTML for the local video player
    let player = `<div class="video-container" id="user-container-${UID}">
                        <div class="user-name-wrapper"> <span class="user-name"> ${member.name}</span></div>
                            <div class="video-player" id="user-${UID}"></div>
                    </div>`;

    // Insert the local video player into the UI
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player);

    // Play the local video track
    localTracks[1].play(`user-${UID}`);

    // Publish the local tracks to the channel
    await client.publish([localTracks[0], localTracks[1]]);
};

// Function to handle when a user joins the channel
let handleUserJoined = async (user, mediaType) => {
    // Store the remote user
    remoteUsers[user.uid] = user;
    // Subscribe to the remote user's tracks
    await client.subscribe(user, mediaType);

    // If the media type is video, display the user's video
    if (mediaType === 'video') {
        let player = document.getElementById(`user-container-${user.uid}`);
        if (player != null) {
            player.remove();
        }

        // Get the member information for the remote user
        let member = await getMember(user);

        // Generate HTML for the remote video player
        player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="user-name-wrapper"> <span class="user-name">${member.name}</span></div>
                            <div class="video-player" id="user-${user.uid}"></div>
                    </div>`;

        // Insert the remote video player into the UI
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player);

        // Play the remote user's video track
        user.videoTrack.play(`user-${user.uid}`);
    }

    // If the media type is audio, play the user's audio
    if (mediaType === 'audio') {
        user.audioTrack.play();
    }
};

// Function to handle when a user leaves the channel
let handleUserLeft = async (user) => {
    // Remove the remote user from the list
    delete remoteUsers[user.uid];
    // Remove the remote user's video player from the UI
    document.getElementById(`user-container-${user.uid}`).remove();
};

// Function to leave the channel and remove the local stream
let leaveAndRemoveLocalStream = async () => {
    // Stop and close local tracks
    for (let i = 0; localTracks.length > i; i++) {
        localTracks[i].stop();
        localTracks[i].close();
    }

    // Leave the channel
    await client.leave();

    // Delete the local member from the server
    await deleteMemberFromServer();

    // Redirect to the homepage
    window.open('/', '_self');
};

// Function to toggle the camera on and off
let toggleCamera = async (e) => {
    if (localTracks[1].muted) {
        await localTracks[1].setMuted(false);
        e.target.style.backgroundColor = '#fff';
    } else {
        await localTracks[1].setMuted(true);
        e.target.style.backgroundColor = 'rgb(255,80,80,1)';
    }
};

// Function to toggle the microphone on and off
let toggleMicrophone = async (e) => {
    if (localTracks[0].muted) {
        await localTracks[0].setMuted(false);
        e.target.style.backgroundColor = '#fff';
    } else {
        await localTracks[0].setMuted(true);
        e.target.style.backgroundColor = 'rgb(255,80,80,1)';
    }
};

// Function to create a member on the server
let createMember = async () => {
    let response = await fetch('/create_member/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'name': NAME, 'room_name': CHANNEL, 'UID': UID })
    });

    let member = await response.json();
    return member;
};

// Function to delete a member from the server
let deleteMemberFromServer = async () => {
    let response = await fetch('/delete_member/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'name': NAME, 'room_name': CHANNEL, 'UID': UID })
    });
};

// Function to get member information from the server
let getMember = async (user) => {
    let response = await fetch(`/get_member/?UID=${user.uid}&room_name=${CHANNEL}`);
    let member = await response.json();
    return member;
};

// Call the function to join and display the local stream when the page loads
joinAndDisplayLocalStream();

// Add event listeners for leave button, camera button, and microphone button
window.addEventListener('beforeunload', deleteMemberFromServer);
document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream);
document.getElementById('camera-btn').addEventListener('click', toggleCamera);
document.getElementById('mic-btn').addEventListener('click', toggleMicrophone);
