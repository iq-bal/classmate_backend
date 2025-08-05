# 📁 File-Based Messaging Documentation

## Overview

Your chat server provides comprehensive file and image upload capabilities through Socket.IO real-time messaging. This documentation covers all supported file types, implementation examples, and best practices.

## 🎯 Supported Message Types

The chat server supports the following message types:

- **📝 text** - Regular text messages
- **🖼️ image** - Image files (JPG, PNG, GIF, WebP, etc.)
- **📁 file** - Any file type (PDF, DOC, ZIP, etc.)
- **🎵 voice** - Voice recordings and audio files
- **🎥 video** - Video files (MP4, WebM, AVI, etc.)
- **📍 location** - Location sharing
- **👤 contact** - Contact information

## 🚀 Basic File Upload Structure

### Socket.IO Message Format

```javascript
socket.emit('message', {
  to: 'RECIPIENT_USER_ID',
  content: 'Check out this file!',
  type: 'file', // or 'image', 'video', 'voice'
  file: {
    stream: fileStream,
    name: 'document.pdf',
    size: 1024000,
    type: 'application/pdf',
    duration: null // For voice/video only
  },
  replyTo: null, // Optional: message ID to reply to
  forward: false, // Optional: true if forwarding
  forwardFrom: null // Optional: original sender ID
});
```

## 📸 Image Upload Examples

### JavaScript/React Implementation

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:4002', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

function sendImage(imageFile, recipientId) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const arrayBuffer = e.target.result;
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(arrayBuffer));
        controller.close();
      }
    });

    socket.emit('message', {
      to: recipientId,
      content: 'Shared an image',
      type: 'image',
      file: {
        stream: stream,
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type
      }
    });
  };
  
  reader.readAsArrayBuffer(imageFile);
}

// Usage with file input
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    sendImage(file, 'RECIPIENT_USER_ID');
  }
});
```

### HTML File Input

```html
<input type="file" id="fileInput" accept="image/*" multiple>
<button onclick="sendSelectedImages()">Send Images</button>

<script>
function sendSelectedImages() {
  const fileInput = document.getElementById('fileInput');
  const files = fileInput.files;
  
  for (let i = 0; i < files.length; i++) {
    sendImage(files[i], 'RECIPIENT_USER_ID');
  }
}
</script>
```

## 📁 File Upload Examples

### General File Upload

```javascript
function sendFile(file, recipientId) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const arrayBuffer = e.target.result;
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(arrayBuffer));
        controller.close();
      }
    });

    socket.emit('message', {
      to: recipientId,
      content: `Shared a file: ${file.name}`,
      type: 'file',
      file: {
        stream: stream,
        name: file.name,
        size: file.size,
        type: file.type
      }
    });
  };
  
  reader.readAsArrayBuffer(file);
}
```

### Document Upload with Progress

```javascript
function sendDocumentWithProgress(file, recipientId, progressCallback) {
  const reader = new FileReader();
  
  reader.onprogress = function(e) {
    if (e.lengthComputable) {
      const percentLoaded = Math.round((e.loaded / e.total) * 100);
      progressCallback(percentLoaded);
    }
  };
  
  reader.onload = function(e) {
    const arrayBuffer = e.target.result;
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(arrayBuffer));
        controller.close();
      }
    });

    socket.emit('message', {
      to: recipientId,
      content: `Document: ${file.name}`,
      type: 'file',
      file: {
        stream: stream,
        name: file.name,
        size: file.size,
        type: file.type
      }
    });
    
    progressCallback(100);
  };
  
  reader.readAsArrayBuffer(file);
}

// Usage
sendDocumentWithProgress(file, recipientId, (progress) => {
  console.log(`Upload progress: ${progress}%`);
  document.getElementById('progressBar').style.width = `${progress}%`;
});
```

## 🎵 Voice Message Examples

### Recording and Sending Voice Messages

```javascript
class VoiceRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.startTime = null;
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }

  stopRecording(recipientId) {
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const duration = Math.round((Date.now() - this.startTime) / 1000);
        
        this.sendVoiceMessage(audioBlob, duration, recipientId);
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  }

  sendVoiceMessage(audioBlob, duration, recipientId) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const arrayBuffer = e.target.result;
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(arrayBuffer));
          controller.close();
        }
      });

      socket.emit('message', {
        to: recipientId,
        content: 'Voice message',
        type: 'voice',
        file: {
          stream: stream,
          name: `voice_${Date.now()}.webm`,
          size: audioBlob.size,
          type: audioBlob.type,
          duration: duration
        }
      });
    };
    
    reader.readAsArrayBuffer(audioBlob);
  }
}

// Usage
const recorder = new VoiceRecorder();

// Start recording
document.getElementById('recordBtn').addEventListener('mousedown', () => {
  recorder.startRecording();
});

// Stop recording
document.getElementById('recordBtn').addEventListener('mouseup', () => {
  recorder.stopRecording('RECIPIENT_USER_ID');
});
```

## 🎥 Video Upload Examples

### Video File Upload

```javascript
function sendVideo(videoFile, recipientId) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const arrayBuffer = e.target.result;
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(arrayBuffer));
        controller.close();
      }
    });

    socket.emit('message', {
      to: recipientId,
      content: 'Shared a video',
      type: 'video',
      file: {
        stream: stream,
        name: videoFile.name,
        size: videoFile.size,
        type: videoFile.type,
        duration: null // Will be calculated server-side
      }
    });
  };
  
  reader.readAsArrayBuffer(videoFile);
}

// Video with duration calculation
function sendVideoWithDuration(videoFile, recipientId) {
  const video = document.createElement('video');
  video.preload = 'metadata';
  
  video.onloadedmetadata = function() {
    const duration = Math.round(video.duration);
    
    const reader = new FileReader();
    reader.onload = function(e) {
      const arrayBuffer = e.target.result;
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(arrayBuffer));
          controller.close();
        }
      });

      socket.emit('message', {
        to: recipientId,
        content: 'Shared a video',
        type: 'video',
        file: {
          stream: stream,
          name: videoFile.name,
          size: videoFile.size,
          type: videoFile.type,
          duration: duration
        }
      });
    };
    
    reader.readAsArrayBuffer(videoFile);
  };
  
  video.src = URL.createObjectURL(videoFile);
}
```

## 📱 React Native Implementation

### File Upload for Mobile

```javascript
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { io } from 'socket.io-client';

class MobileFileUploader {
  constructor(socket) {
    this.socket = socket;
  }

  async pickAndSendFile(recipientId) {
    try {
      const file = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const fileData = await RNFS.readFile(file[0].uri, 'base64');
      const buffer = Buffer.from(fileData, 'base64');
      
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(buffer));
          controller.close();
        }
      });

      this.socket.emit('message', {
        to: recipientId,
        content: `Shared: ${file[0].name}`,
        type: this.getMessageType(file[0].type),
        file: {
          stream: stream,
          name: file[0].name,
          size: file[0].size,
          type: file[0].type
        }
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled file picker');
      } else {
        console.error('File picker error:', err);
      }
    }
  }

  async pickAndSendImage(recipientId) {
    try {
      const image = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
      });

      const imageData = await RNFS.readFile(image[0].uri, 'base64');
      const buffer = Buffer.from(imageData, 'base64');
      
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(buffer));
          controller.close();
        }
      });

      this.socket.emit('message', {
        to: recipientId,
        content: 'Shared an image',
        type: 'image',
        file: {
          stream: stream,
          name: image[0].name,
          size: image[0].size,
          type: image[0].type
        }
      });
    } catch (err) {
      console.error('Image picker error:', err);
    }
  }

  getMessageType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'voice';
    return 'file';
  }
}

// Usage
const socket = io('http://localhost:4002', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

const uploader = new MobileFileUploader(socket);

// Pick and send any file
uploader.pickAndSendFile('RECIPIENT_USER_ID');

// Pick and send image specifically
uploader.pickAndSendImage('RECIPIENT_USER_ID');
```

## 📨 Receiving File Messages

### Message Event Handler

```javascript
socket.on('message', (message) => {
  console.log('Received message:', message);
  
  if (message.file_url) {
    handleFileMessage(message);
  } else {
    handleTextMessage(message);
  }
});

function handleFileMessage(message) {
  const fileUrl = `http://localhost:4002${message.file_url}`;
  
  switch (message.message_type) {
    case 'image':
      displayImage(message, fileUrl);
      break;
    case 'file':
      displayFileDownload(message, fileUrl);
      break;
    case 'voice':
      displayAudioPlayer(message, fileUrl);
      break;
    case 'video':
      displayVideoPlayer(message, fileUrl);
      break;
    default:
      console.log('Unknown file type:', message.message_type);
  }
}

function displayImage(message, fileUrl) {
  const imageElement = document.createElement('img');
  imageElement.src = message.thumbnail_url ? 
    `http://localhost:4002${message.thumbnail_url}` : fileUrl;
  imageElement.alt = message.file_name;
  imageElement.style.maxWidth = '300px';
  imageElement.style.cursor = 'pointer';
  
  imageElement.onclick = () => {
    // Open full-size image
    window.open(fileUrl, '_blank');
  };
  
  document.getElementById('messageContainer').appendChild(imageElement);
}

function displayFileDownload(message, fileUrl) {
  const fileContainer = document.createElement('div');
  fileContainer.className = 'file-message';
  
  fileContainer.innerHTML = `
    <div class="file-info">
      <span class="file-name">${message.file_name}</span>
      <span class="file-size">${formatFileSize(message.file_size)}</span>
    </div>
    <a href="${fileUrl}" download="${message.file_name}" class="download-btn">
      Download
    </a>
  `;
  
  document.getElementById('messageContainer').appendChild(fileContainer);
}

function displayAudioPlayer(message, fileUrl) {
  const audioContainer = document.createElement('div');
  audioContainer.className = 'audio-message';
  
  audioContainer.innerHTML = `
    <audio controls>
      <source src="${fileUrl}" type="${message.file_type}">
      Your browser does not support the audio element.
    </audio>
    <span class="duration">${formatDuration(message.duration)}</span>
  `;
  
  document.getElementById('messageContainer').appendChild(audioContainer);
}

function displayVideoPlayer(message, fileUrl) {
  const videoContainer = document.createElement('div');
  videoContainer.className = 'video-message';
  
  videoContainer.innerHTML = `
    <video controls style="max-width: 400px;">
      <source src="${fileUrl}" type="${message.file_type}">
      Your browser does not support the video element.
    </video>
    <div class="video-info">
      <span class="file-name">${message.file_name}</span>
      <span class="duration">${formatDuration(message.duration)}</span>
    </div>
  `;
  
  document.getElementById('messageContainer').appendChild(videoContainer);
}

// Utility functions
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds) {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

## 🔧 Advanced Features

### Reply to File Messages

```javascript
function replyToFileMessage(originalMessageId, replyText, recipientId) {
  socket.emit('message', {
    to: recipientId,
    content: replyText,
    type: 'text',
    replyTo: originalMessageId
  });
}

// Usage
replyToFileMessage('675c123456789abcdef12345', 'Thanks for the document!', 'RECIPIENT_USER_ID');
```

### Forward File Messages

```javascript
function forwardFileMessage(originalMessage, newRecipientIds) {
  newRecipientIds.forEach(recipientId => {
    // Re-upload the file or reference existing URL
    fetch(`http://localhost:4002${originalMessage.file_url}`)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = function(e) {
          const arrayBuffer = e.target.result;
          const stream = new ReadableStream({
            start(controller) {
              controller.enqueue(new Uint8Array(arrayBuffer));
              controller.close();
            }
          });

          socket.emit('message', {
            to: recipientId,
            content: originalMessage.content,
            type: originalMessage.message_type,
            file: {
              stream: stream,
              name: originalMessage.file_name,
              size: originalMessage.file_size,
              type: originalMessage.file_type
            },
            forward: true,
            forwardFrom: originalMessage.sender_id.id
          });
        };
        reader.readAsArrayBuffer(blob);
      });
  });
}
```

### Batch File Upload

```javascript
function sendMultipleFiles(files, recipientId, progressCallback) {
  let completed = 0;
  const total = files.length;
  
  Array.from(files).forEach((file, index) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const arrayBuffer = e.target.result;
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(arrayBuffer));
          controller.close();
        }
      });

      socket.emit('message', {
        to: recipientId,
        content: `File ${index + 1} of ${total}: ${file.name}`,
        type: getFileType(file.type),
        file: {
          stream: stream,
          name: file.name,
          size: file.size,
          type: file.type
        }
      });
      
      completed++;
      progressCallback(completed, total);
    };
    
    reader.readAsArrayBuffer(file);
  });
}

function getFileType(mimeType) {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'voice';
  return 'file';
}

// Usage
const fileInput = document.getElementById('multiFileInput');
fileInput.addEventListener('change', (e) => {
  const files = e.target.files;
  sendMultipleFiles(files, 'RECIPIENT_USER_ID', (completed, total) => {
    console.log(`Uploaded ${completed}/${total} files`);
  });
});
```

## 📊 File Message Response Structure

### Complete Message Object

```json
{
  "id": "675c123456789abcdef12345",
  "sender_id": {
    "id": "675a987654321fedcba09876",
    "name": "John Doe",
    "email": "john@example.com",
    "profile_picture": "http://localhost:4002/uploads/profile.jpg"
  },
  "receiver_id": {
    "id": "675b123456789abcdef09876",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "profile_picture": "http://localhost:4002/uploads/jane.jpg"
  },
  "content": "Check out this document!",
  "message_type": "file",
  "file_url": "/uploads/1754152114471-document.pdf",
  "file_name": "document.pdf",
  "file_size": 1024000,
  "file_type": "application/pdf",
  "thumbnail_url": null,
  "duration": null,
  "reply_to": null,
  "forwarded": false,
  "forwarded_from": null,
  "reactions": [],
  "deleted_for": [],
  "read": false,
  "read_at": null,
  "delivered": true,
  "delivered_at": "2024-01-15T10:30:00.000Z",
  "edited": false,
  "edited_at": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## 🔐 Security & Best Practices

### File Validation

```javascript
function validateFile(file) {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/avi',
    'audio/mp3', 'audio/wav', 'audio/webm',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'text/csv'
  ];
  
  if (file.size > maxSize) {
    throw new Error('File size exceeds 50MB limit');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not allowed');
  }
  
  return true;
}

// Usage
function sendFileWithValidation(file, recipientId) {
  try {
    validateFile(file);
    sendFile(file, recipientId);
  } catch (error) {
    alert(error.message);
  }
}
```

### Error Handling

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  
  switch (error.type) {
    case 'FILE_TOO_LARGE':
      alert('File is too large. Maximum size is 50MB.');
      break;
    case 'INVALID_FILE_TYPE':
      alert('File type not supported.');
      break;
    case 'UPLOAD_FAILED':
      alert('File upload failed. Please try again.');
      break;
    default:
      alert('An error occurred while sending the file.');
  }
});
```

## 🔧 File Storage Details

### Storage Configuration

- **Storage Location:** `/uploads/` directory in the server
- **File Naming:** `TIMESTAMP-ORIGINAL_FILENAME`
- **Access URL:** `http://localhost:4002/uploads/FILENAME`
- **Thumbnail Generation:** Automatic for images and videos
- **Duration Calculation:** Automatic for audio and video files

### File Processing Features

1. **Images:**
   - Automatic thumbnail generation
   - Support for JPEG, PNG, GIF, WebP
   - Metadata preservation

2. **Videos:**
   - Thumbnail generation from first frame
   - Duration calculation
   - Support for MP4, WebM, AVI

3. **Audio/Voice:**
   - Duration calculation
   - Support for MP3, WAV, WebM
   - Waveform generation (if implemented)

4. **Documents:**
   - File type detection
   - Size optimization
   - Preview generation (if implemented)

## 🚀 Available Endpoints

- **Socket.IO Chat Server:** `http://localhost:4002`
- **File Access:** `http://localhost:4002/uploads/FILENAME`
- **GraphQL API:** `http://localhost:4003/graphql`
- **File Upload via GraphQL:** `http://localhost:4003/upload`

## 📱 Platform Support

- **Web Browsers:** Chrome, Firefox, Safari, Edge
- **Mobile:** React Native, Ionic, Cordova
- **Desktop:** Electron, Tauri
- **Server-Side:** Node.js, Python (with socket.io client)

## 🎯 Performance Tips

1. **Compress files before upload** for faster transmission
2. **Use progressive upload** for large files
3. **Implement file caching** on the client side
4. **Use WebP format** for images when possible
5. **Implement lazy loading** for file previews
6. **Use CDN** for file delivery in production

---

*This documentation covers the complete file-based messaging system. For additional features or customizations, refer to the source code or contact the development team.*