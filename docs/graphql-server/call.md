# WebRTC Audio & Video Call Documentation 📞🎥

## Overview

The chat server provides **WebRTC-based audio and video calling** functionality using Socket.IO for signaling. The system supports peer-to-peer voice and video calls with real-time communication.

## 🎯 Features

- ✅ **WebRTC-based calling** - Direct peer-to-peer communication
- ✅ **Voice calls** - Audio-only communication
- ✅ **Video calls** - Audio and video communication
- ✅ **Real-time signaling** via Socket.IO
- ✅ **Call management** - Answer, reject, end calls
- ✅ **Online status checking** - Only call online users
- ✅ **Call session tracking** - Server-side call state management
- ✅ **Cross-platform support** - Web, mobile, desktop
- ✅ **Automatic cleanup** - Calls end when users disconnect

## 🔧 WebRTC Architecture

### Signaling Flow
```
Caller                    Server                    Receiver
  |                         |                         |
  |-- callUser ----------->|                         |
  |                         |-- incomingCall -------->|
  |                         |                         |
  |                         |<-- answerCall ----------|
  |<-- callAccepted --------|                         |
  |                         |                         |
  |<====== WebRTC P2P Connection Established ======>|
  |                         |                         |
  |-- endCall ------------->|                         |
  |                         |-- callEnded ----------->|
```

### Current Implementation

The server handles WebRTC signaling through Socket.IO events:

```javascript
// Server-side implementation (chat-server.js)
socket.on('callUser', async ({ to, signalData, callType }) => {
    const recipientSocket = activeUsers.get(to);
    if (!recipientSocket) {
        return socket.emit('error', { message: 'User is offline' });
    }

    const callSession = {
        caller: socket.user._id.toString(),
        receiver: to,
        type: callType,
        startTime: new Date()
    };
    activeCallSessions.set(socket.user._id.toString(), callSession);

    io.to(recipientSocket).emit('incomingCall', {
        from: socket.user._id,
        signalData,
        callType
    });
});

socket.on('answerCall', ({ to, signalData }) => {
    const callerSocket = activeUsers.get(to);
    if (callerSocket) {
        io.to(callerSocket).emit('callAccepted', signalData);
    }
});

socket.on('rejectCall', ({ to }) => {
    const callerSocket = activeUsers.get(to);
    if (callerSocket) {
        io.to(callerSocket).emit('callRejected');
    }
    activeCallSessions.delete(to);
});

socket.on('endCall', ({ to }) => {
    const recipientSocket = activeUsers.get(to);
    if (recipientSocket) {
        io.to(recipientSocket).emit('callEnded');
    }
    activeCallSessions.delete(socket.user._id.toString());
});
```

## 🔌 Socket.IO Events

### Outgoing Events (Client → Server)

#### 1. Initiate Call
```javascript
socket.emit('callUser', {
  to: 'recipient_user_id',
  signalData: offer, // WebRTC offer
  callType: 'voice' // or 'video'
});
```

#### 2. Answer Call
```javascript
socket.emit('answerCall', {
  to: 'caller_user_id',
  signalData: answer // WebRTC answer
});
```

#### 3. Reject Call
```javascript
socket.emit('rejectCall', {
  to: 'caller_user_id'
});
```

#### 4. End Call
```javascript
socket.emit('endCall', {
  to: 'other_user_id'
});
```

### Incoming Events (Server → Client)

#### 1. Incoming Call
```javascript
socket.on('incomingCall', (data) => {
  console.log('Incoming call from:', data.from);
  console.log('Call type:', data.callType); // 'voice' or 'video'
  console.log('Signal data:', data.signalData);
  
  // Show incoming call UI
  showIncomingCallUI(data);
});
```

#### 2. Call Accepted
```javascript
socket.on('callAccepted', (signalData) => {
  console.log('Call accepted');
  // Handle WebRTC answer
  handleCallAccepted(signalData);
});
```

#### 3. Call Rejected
```javascript
socket.on('callRejected', () => {
  console.log('Call rejected');
  // Hide calling UI
  hideCallingUI();
});
```

#### 4. Call Ended
```javascript
socket.on('callEnded', () => {
  console.log('Call ended');
  // Clean up WebRTC connection
  endCall();
});
```

## 💻 Client Implementation

### JavaScript/React WebRTC Implementation

```javascript
import io from 'socket.io-client';

class WebRTCCallManager {
  constructor(socket, userId) {
    this.socket = socket;
    this.userId = userId;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.isCallActive = false;
    this.callType = null;
    
    this.setupSocketListeners();
    this.setupPeerConnection();
  }

  // WebRTC Configuration
  getPeerConnectionConfig() {
    return {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Add TURN servers for production
        // {
        //   urls: 'turn:your-turn-server.com:3478',
        //   username: 'username',
        //   credential: 'password'
        // }
      ]
    };
  }

  setupPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.getPeerConnectionConfig());
    
    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('Remote stream received');
      this.remoteStream = event.streams[0];
      this.displayRemoteStream(this.remoteStream);
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate generated');
        // Send ICE candidate through Socket.IO if needed
        // For simplicity, we're including candidates in offer/answer
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection.connectionState);
      if (this.peerConnection.connectionState === 'disconnected' || 
          this.peerConnection.connectionState === 'failed') {
        this.endCall();
      }
    };
  }

  setupSocketListeners() {
    this.socket.on('incomingCall', (data) => {
      this.handleIncomingCall(data);
    });

    this.socket.on('callAccepted', (signalData) => {
      this.handleCallAccepted(signalData);
    });

    this.socket.on('callRejected', () => {
      this.handleCallRejected();
    });

    this.socket.on('callEnded', () => {
      this.endCall();
    });
  }

  // Initiate a call
  async initiateCall(recipientId, callType = 'voice') {
    try {
      this.callType = callType;
      
      // Get user media
      const constraints = {
        audio: true,
        video: callType === 'video'
      };
      
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.displayLocalStream(this.localStream);
      
      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
      
      // Create offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      // Send call request
      this.socket.emit('callUser', {
        to: recipientId,
        signalData: offer,
        callType: callType
      });
      
      this.isCallActive = true;
      this.showCallingUI(recipientId, callType);
      
    } catch (error) {
      console.error('Error initiating call:', error);
      this.handleCallError(error);
    }
  }

  // Handle incoming call
  async handleIncomingCall(data) {
    try {
      this.callType = data.callType;
      
      // Show incoming call UI
      const accepted = await this.showIncomingCallUI(data);
      
      if (accepted) {
        await this.answerCall(data);
      } else {
        this.rejectCall(data.from);
      }
    } catch (error) {
      console.error('Error handling incoming call:', error);
      this.rejectCall(data.from);
    }
  }

  // Answer incoming call
  async answerCall(callData) {
    try {
      // Get user media
      const constraints = {
        audio: true,
        video: this.callType === 'video'
      };
      
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.displayLocalStream(this.localStream);
      
      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
      
      // Set remote description (offer)
      await this.peerConnection.setRemoteDescription(callData.signalData);
      
      // Create answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      // Send answer
      this.socket.emit('answerCall', {
        to: callData.from,
        signalData: answer
      });
      
      this.isCallActive = true;
      this.showActiveCallUI(callData.from, this.callType);
      
    } catch (error) {
      console.error('Error answering call:', error);
      this.rejectCall(callData.from);
    }
  }

  // Handle call accepted
  async handleCallAccepted(signalData) {
    try {
      // Set remote description (answer)
      await this.peerConnection.setRemoteDescription(signalData);
      
      console.log('Call connected successfully');
      this.showActiveCallUI(null, this.callType);
      
    } catch (error) {
      console.error('Error handling call accepted:', error);
      this.endCall();
    }
  }

  // Reject call
  rejectCall(callerId) {
    this.socket.emit('rejectCall', { to: callerId });
    this.cleanup();
  }

  // Handle call rejected
  handleCallRejected() {
    console.log('Call was rejected');
    this.hideCallingUI();
    this.cleanup();
  }

  // End call
  endCall(notifyOther = true) {
    if (notifyOther && this.isCallActive) {
      this.socket.emit('endCall', { to: this.currentCallParticipant });
    }
    
    this.cleanup();
    this.hideCallUI();
  }

  // Cleanup resources
  cleanup() {
    this.isCallActive = false;
    this.callType = null;
    
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.setupPeerConnection(); // Reset for next call
    }
  }

  // Toggle mute
  toggleMute() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled; // Return muted state
      }
    }
    return false;
  }

  // Toggle video
  toggleVideo() {
    if (this.localStream && this.callType === 'video') {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return !videoTrack.enabled; // Return video off state
      }
    }
    return false;
  }

  // UI Methods (implement based on your UI framework)
  displayLocalStream(stream) {
    const localVideo = document.getElementById('localVideo');
    if (localVideo) {
      localVideo.srcObject = stream;
    }
  }

  displayRemoteStream(stream) {
    const remoteVideo = document.getElementById('remoteVideo');
    if (remoteVideo) {
      remoteVideo.srcObject = stream;
    }
  }

  showIncomingCallUI(callData) {
    return new Promise((resolve) => {
      // Show incoming call modal/UI
      const modal = document.createElement('div');
      modal.innerHTML = `
        <div class="incoming-call-modal">
          <h3>Incoming ${callData.callType} call</h3>
          <p>From: ${callData.from}</p>
          <button id="acceptCall">Accept</button>
          <button id="rejectCall">Reject</button>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      document.getElementById('acceptCall').onclick = () => {
        document.body.removeChild(modal);
        resolve(true);
      };
      
      document.getElementById('rejectCall').onclick = () => {
        document.body.removeChild(modal);
        resolve(false);
      };
    });
  }

  showCallingUI(recipientId, callType) {
    // Show "Calling..." UI
    console.log(`Calling ${recipientId} (${callType})...`);
  }

  showActiveCallUI(participantId, callType) {
    // Show active call UI with controls
    console.log(`Active ${callType} call with ${participantId}`);
  }

  hideCallingUI() {
    // Hide calling UI
    console.log('Call UI hidden');
  }

  hideCallUI() {
    // Hide all call-related UI
    console.log('All call UI hidden');
  }

  handleCallError(error) {
    console.error('Call error:', error);
    // Show error message to user
  }
}

// Usage Example
const socket = io('http://localhost:4002', {
  auth: { token: 'your_jwt_token' }
});

const callManager = new WebRTCCallManager(socket, 'current_user_id');

// Initiate voice call
document.getElementById('voiceCallBtn').onclick = () => {
  callManager.initiateCall('recipient_user_id', 'voice');
};

// Initiate video call
document.getElementById('videoCallBtn').onclick = () => {
  callManager.initiateCall('recipient_user_id', 'video');
};

// End call
document.getElementById('endCallBtn').onclick = () => {
  callManager.endCall();
};

// Toggle mute
document.getElementById('muteBtn').onclick = () => {
  const isMuted = callManager.toggleMute();
  document.getElementById('muteBtn').textContent = isMuted ? 'Unmute' : 'Mute';
};

// Toggle video
document.getElementById('videoToggleBtn').onclick = () => {
  const isVideoOff = callManager.toggleVideo();
  document.getElementById('videoToggleBtn').textContent = isVideoOff ? 'Turn On Video' : 'Turn Off Video';
};
```

### React Component Example

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { WebRTCCallManager } from './WebRTCCallManager';

function CallInterface({ socket, currentUserId }) {
  const [callManager, setCallManager] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const manager = new WebRTCCallManager(socket, currentUserId);
    
    // Override UI methods to work with React
    manager.displayLocalStream = (stream) => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    };
    
    manager.displayRemoteStream = (stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };
    
    manager.showIncomingCallUI = (callData) => {
      return new Promise((resolve) => {
        setIncomingCall({ ...callData, resolve });
      });
    };
    
    manager.showActiveCallUI = (participantId, type) => {
      setIsCallActive(true);
      setCallType(type);
    };
    
    manager.hideCallUI = () => {
      setIsCallActive(false);
      setCallType(null);
      setIncomingCall(null);
      setIsMuted(false);
      setIsVideoOff(false);
    };
    
    setCallManager(manager);
    
    return () => {
      manager.cleanup();
    };
  }, [socket, currentUserId]);

  const handleAcceptCall = () => {
    if (incomingCall) {
      incomingCall.resolve(true);
      setIncomingCall(null);
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      incomingCall.resolve(false);
      setIncomingCall(null);
    }
  };

  const handleToggleMute = () => {
    if (callManager) {
      const muted = callManager.toggleMute();
      setIsMuted(muted);
    }
  };

  const handleToggleVideo = () => {
    if (callManager) {
      const videoOff = callManager.toggleVideo();
      setIsVideoOff(videoOff);
    }
  };

  const handleEndCall = () => {
    if (callManager) {
      callManager.endCall();
    }
  };

  return (
    <div className="call-interface">
      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="incoming-call-modal">
          <div className="modal-content">
            <h3>Incoming {incomingCall.callType} call</h3>
            <p>From: {incomingCall.from}</p>
            <div className="call-actions">
              <button onClick={handleAcceptCall} className="accept-btn">
                Accept
              </button>
              <button onClick={handleRejectCall} className="reject-btn">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Call Interface */}
      {isCallActive && (
        <div className="active-call">
          <div className="video-container">
            {callType === 'video' && (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="remote-video"
                />
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="local-video"
                />
              </>
            )}
            
            {callType === 'voice' && (
              <div className="voice-call-indicator">
                <h3>Voice Call Active</h3>
              </div>
            )}
          </div>
          
          <div className="call-controls">
            <button
              onClick={handleToggleMute}
              className={`control-btn ${isMuted ? 'active' : ''}`}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            
            {callType === 'video' && (
              <button
                onClick={handleToggleVideo}
                className={`control-btn ${isVideoOff ? 'active' : ''}`}
              >
                {isVideoOff ? '📹' : '📷'}
              </button>
            )}
            
            <button onClick={handleEndCall} className="end-call-btn">
              📞
            </button>
          </div>
        </div>
      )}

      {/* Call Initiation Buttons */}
      {!isCallActive && (
        <div className="call-buttons">
          <button
            onClick={() => callManager?.initiateCall('recipient_id', 'voice')}
            className="voice-call-btn"
          >
            📞 Voice Call
          </button>
          <button
            onClick={() => callManager?.initiateCall('recipient_id', 'video')}
            className="video-call-btn"
          >
            📹 Video Call
          </button>
        </div>
      )}
    </div>
  );
}

export default CallInterface;
```

## 📱 Flutter/Dart Implementation

```dart
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter_webrtc/flutter_webrtc.dart';

class WebRTCCallManager {
  late IO.Socket socket;
  RTCPeerConnection? peerConnection;
  MediaStream? localStream;
  MediaStream? remoteStream;
  bool isCallActive = false;
  String? callType;
  
  // WebRTC configuration
  final Map<String, dynamic> configuration = {
    'iceServers': [
      {'urls': 'stun:stun.l.google.com:19302'},
      {'urls': 'stun:stun1.l.google.com:19302'},
    ]
  };

  WebRTCCallManager(this.socket) {
    _setupSocketListeners();
  }

  void _setupSocketListeners() {
    socket.on('incomingCall', (data) {
      _handleIncomingCall(data);
    });

    socket.on('callAccepted', (signalData) {
      _handleCallAccepted(signalData);
    });

    socket.on('callRejected', (_) {
      _handleCallRejected();
    });

    socket.on('callEnded', (_) {
      endCall();
    });
  }

  Future<void> _createPeerConnection() async {
    peerConnection = await createPeerConnection(configuration);
    
    peerConnection!.onTrack = (RTCTrackEvent event) {
      remoteStream = event.streams[0];
      // Update UI with remote stream
    };

    peerConnection!.onIceCandidate = (RTCIceCandidate candidate) {
      // Handle ICE candidates if needed
    };
  }

  Future<void> initiateCall(String recipientId, String callType) async {
    try {
      this.callType = callType;
      
      await _createPeerConnection();
      
      // Get user media
      final Map<String, dynamic> constraints = {
        'audio': true,
        'video': callType == 'video',
      };
      
      localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Add local stream to peer connection
      localStream!.getTracks().forEach((track) {
        peerConnection!.addTrack(track, localStream!);
      });
      
      // Create offer
      RTCSessionDescription offer = await peerConnection!.createOffer();
      await peerConnection!.setLocalDescription(offer);
      
      // Send call request
      socket.emit('callUser', {
        'to': recipientId,
        'signalData': offer.toMap(),
        'callType': callType
      });
      
      isCallActive = true;
      
    } catch (error) {
      print('Error initiating call: $error');
    }
  }

  Future<void> _handleIncomingCall(dynamic data) async {
    // Show incoming call UI and get user response
    bool accepted = await _showIncomingCallDialog(data);
    
    if (accepted) {
      await _answerCall(data);
    } else {
      _rejectCall(data['from']);
    }
  }

  Future<void> _answerCall(dynamic callData) async {
    try {
      callType = callData['callType'];
      
      await _createPeerConnection();
      
      // Get user media
      final Map<String, dynamic> constraints = {
        'audio': true,
        'video': callType == 'video',
      };
      
      localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Add local stream to peer connection
      localStream!.getTracks().forEach((track) {
        peerConnection!.addTrack(track, localStream!);
      });
      
      // Set remote description
      await peerConnection!.setRemoteDescription(
        RTCSessionDescription(
          callData['signalData']['sdp'],
          callData['signalData']['type']
        )
      );
      
      // Create answer
      RTCSessionDescription answer = await peerConnection!.createAnswer();
      await peerConnection!.setLocalDescription(answer);
      
      // Send answer
      socket.emit('answerCall', {
        'to': callData['from'],
        'signalData': answer.toMap()
      });
      
      isCallActive = true;
      
    } catch (error) {
      print('Error answering call: $error');
      _rejectCall(callData['from']);
    }
  }

  Future<void> _handleCallAccepted(dynamic signalData) async {
    try {
      await peerConnection!.setRemoteDescription(
        RTCSessionDescription(
          signalData['sdp'],
          signalData['type']
        )
      );
      
      print('Call connected successfully');
      
    } catch (error) {
      print('Error handling call accepted: $error');
      endCall();
    }
  }

  void _rejectCall(String callerId) {
    socket.emit('rejectCall', {'to': callerId});
    _cleanup();
  }

  void _handleCallRejected() {
    print('Call was rejected');
    _cleanup();
  }

  void endCall({bool notifyOther = true}) {
    if (notifyOther && isCallActive) {
      socket.emit('endCall', {'to': 'other_user_id'});
    }
    
    _cleanup();
  }

  void _cleanup() {
    isCallActive = false;
    callType = null;
    
    localStream?.dispose();
    localStream = null;
    
    remoteStream?.dispose();
    remoteStream = null;
    
    peerConnection?.close();
    peerConnection = null;
  }

  Future<bool> _showIncomingCallDialog(dynamic callData) async {
    // Implement incoming call dialog
    // Return true if accepted, false if rejected
    return true; // Placeholder
  }

  void toggleMute() {
    if (localStream != null) {
      final audioTrack = localStream!.getAudioTracks().first;
      audioTrack.enabled = !audioTrack.enabled;
    }
  }

  void toggleVideo() {
    if (localStream != null && callType == 'video') {
      final videoTrack = localStream!.getVideoTracks().first;
      videoTrack.enabled = !videoTrack.enabled;
    }
  }
}

// Flutter Widget for Call Interface
class CallScreen extends StatefulWidget {
  final IO.Socket socket;
  final String currentUserId;

  const CallScreen({
    Key? key,
    required this.socket,
    required this.currentUserId,
  }) : super(key: key);

  @override
  _CallScreenState createState() => _CallScreenState();
}

class _CallScreenState extends State<CallScreen> {
  late WebRTCCallManager callManager;
  final RTCVideoRenderer _localRenderer = RTCVideoRenderer();
  final RTCVideoRenderer _remoteRenderer = RTCVideoRenderer();
  bool _isMuted = false;
  bool _isVideoOff = false;

  @override
  void initState() {
    super.initState();
    _initRenderers();
    callManager = WebRTCCallManager(widget.socket);
  }

  Future<void> _initRenderers() async {
    await _localRenderer.initialize();
    await _remoteRenderer.initialize();
  }

  @override
  void dispose() {
    _localRenderer.dispose();
    _remoteRenderer.dispose();
    callManager._cleanup();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Video Call'),
      ),
      body: Column(
        children: [
          Expanded(
            child: Stack(
              children: [
                // Remote video (full screen)
                RTCVideoView(_remoteRenderer),
                
                // Local video (small overlay)
                Positioned(
                  top: 20,
                  right: 20,
                  width: 120,
                  height: 160,
                  child: RTCVideoView(_localRenderer, mirror: true),
                ),
              ],
            ),
          ),
          
          // Call controls
          Container(
            padding: EdgeInsets.all(20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                // Mute button
                FloatingActionButton(
                  onPressed: () {
                    callManager.toggleMute();
                    setState(() {
                      _isMuted = !_isMuted;
                    });
                  },
                  child: Icon(_isMuted ? Icons.mic_off : Icons.mic),
                  backgroundColor: _isMuted ? Colors.red : Colors.blue,
                ),
                
                // End call button
                FloatingActionButton(
                  onPressed: () {
                    callManager.endCall();
                    Navigator.pop(context);
                  },
                  child: Icon(Icons.call_end),
                  backgroundColor: Colors.red,
                ),
                
                // Video toggle button
                FloatingActionButton(
                  onPressed: () {
                    callManager.toggleVideo();
                    setState(() {
                      _isVideoOff = !_isVideoOff;
                    });
                  },
                  child: Icon(_isVideoOff ? Icons.videocam_off : Icons.videocam),
                  backgroundColor: _isVideoOff ? Colors.red : Colors.blue,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
```

## 🔧 Production Considerations

### TURN Servers

For production deployment, you'll need TURN servers for NAT traversal:

```javascript
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'your-username',
      credential: 'your-password'
    }
  ]
};
```

### TURN Server Options
- **Coturn** - Open source TURN server
- **Twilio TURN** - Managed TURN service
- **AWS TURN** - Amazon's TURN service
- **Google Cloud TURN** - Google's TURN service

### Security Considerations

1. **Authentication**: Ensure all call participants are authenticated
2. **TURN Credentials**: Use time-limited TURN credentials
3. **Encryption**: WebRTC provides built-in encryption (DTLS-SRTP)
4. **Rate Limiting**: Prevent call spam
5. **Access Control**: Verify users can call each other

### Performance Optimization

1. **Codec Selection**: Prefer efficient codecs (VP8, H.264)
2. **Bandwidth Adaptation**: Implement adaptive bitrate
3. **Connection Monitoring**: Monitor connection quality
4. **Fallback Mechanisms**: Handle connection failures gracefully

## 🐛 Troubleshooting

### Common Issues

1. **No Audio/Video**
   - Check microphone/camera permissions
   - Verify getUserMedia constraints
   - Check device availability

2. **Connection Failed**
   - Verify STUN/TURN server configuration
   - Check firewall settings
   - Ensure both peers are online

3. **One-way Audio/Video**
   - Check track addition to peer connection
   - Verify remote stream handling
   - Check codec compatibility

### Debug Tips

```javascript
// Enable WebRTC debugging
peerConnection.addEventListener('iceconnectionstatechange', () => {
  console.log('ICE connection state:', peerConnection.iceConnectionState);
});

peerConnection.addEventListener('connectionstatechange', () => {
  console.log('Connection state:', peerConnection.connectionState);
});

// Log ICE candidates
peerConnection.addEventListener('icecandidate', (event) => {
  if (event.candidate) {
    console.log('ICE candidate:', event.candidate);
  }
});
```

## 📊 API Summary

### Socket.IO Events

| Event | Direction | Purpose |
|-------|-----------|----------|
| `callUser` | Client → Server | Initiate call |
| `answerCall` | Client → Server | Answer incoming call |
| `rejectCall` | Client → Server | Reject incoming call |
| `endCall` | Client → Server | End active call |
| `incomingCall` | Server → Client | Notify of incoming call |
| `callAccepted` | Server → Client | Notify call was accepted |
| `callRejected` | Server → Client | Notify call was rejected |
| `callEnded` | Server → Client | Notify call was ended |

### Call States

- **Idle**: No active call
- **Calling**: Outgoing call initiated
- **Ringing**: Incoming call received
- **Connected**: Call in progress
- **Ended**: Call terminated

## 🌐 Browser Support

- **Chrome**: Full WebRTC support
- **Firefox**: Full WebRTC support
- **Safari**: WebRTC support (iOS 11+)
- **Edge**: Full WebRTC support
- **Mobile**: React Native WebRTC, Flutter WebRTC

---

**The WebRTC calling system provides robust peer-to-peer audio and video communication with real-time signaling through Socket.IO!** 📞✨