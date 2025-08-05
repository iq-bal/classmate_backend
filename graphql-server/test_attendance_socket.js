import { io } from 'socket.io-client';

// Test credentials from user
const TEACHER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI1NTZkNGY5Ni03YTA1LTQ2OGYtYTQ5Yy0yMTM1YTJlNGQ0Y2QiLCJuYW1lIjoiSXFiYWwiLCJyb2xlIjoidGVhY2hlciIsImVtYWlsIjoiaXFiYWxAZ21haWwuY29tIiwiaWF0IjoxNzU0Mjk4NDYwLCJleHAiOjE3NTU1OTQ0NjB9.Xx-cuwE5_-UHNUMHB5Q17HsX9iIneh_HwEJo5HjHKg0';
const COURSE_ID = '688c897cbc0e48abbbd88fc7';

console.log('🧪 Testing Socket.IO Attendance Events');
console.log('=====================================');

// Connect to the Socket.IO server
const socket = io('http://localhost:4002', {
  transports: ['websocket'],
  auth: { token: TEACHER_TOKEN }
});

socket.on('connect', () => {
  console.log('✅ Connected to Socket.IO server');
  console.log('Socket ID:', socket.id);
  
  // Test 1: Try with courseId (what user is sending)
  console.log('\n🧪 Test 1: Sending startAttendanceSession with courseId (incorrect format)');
  socket.emit('startAttendanceSession', {
    courseId: COURSE_ID,
    topic: 'Test Session with courseId'
  });
  
  // Test 2: Try with session_id (correct format based on server code)
  setTimeout(() => {
    console.log('\n🧪 Test 2: Sending startAttendanceSession with session_id (correct format)');
    socket.emit('startAttendanceSession', {
      session_id: '6890a2908f7aea88fa27ff86',  // Valid session ID from created test session
      topic: 'Test Session with session_id'
    });
  }, 2000);
  
  // Test 3: Try joinAttendanceSession
  setTimeout(() => {
    console.log('\n🧪 Test 3: Testing joinAttendanceSession');
    socket.emit('joinAttendanceSession', {
      session_id: '6890a2908f7aea88fa27ff86', // Valid session ID from created test session
      student_name: 'Test Student'
    });
  }, 4000);
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection Error:', error.message);
});

// Listen for all attendance-related events
socket.on('attendanceSessionStarted', (data) => {
  console.log('\n✅ SUCCESS: attendanceSessionStarted event received!');
  console.log('Data:', JSON.stringify(data, null, 2));
});

socket.on('attendanceError', (error) => {
  console.log('\n⚠️ attendanceError event received:');
  console.log('Error:', JSON.stringify(error, null, 2));
});

socket.on('attendanceSessionJoined', (data) => {
  console.log('\n✅ attendanceSessionJoined event received!');
  console.log('Data:', JSON.stringify(data, null, 2));
});

socket.on('studentJoinedAttendance', (data) => {
  console.log('\n📢 studentJoinedAttendance event received!');
  console.log('Data:', JSON.stringify(data, null, 2));
});

// Catch all other events
socket.onAny((eventName, ...args) => {
  if (!['connect', 'disconnect'].includes(eventName)) {
    console.log(`\n📡 Event '${eventName}' received:`, args);
  }
});

socket.on('disconnect', (reason) => {
  console.log('\n🔌 Disconnected:', reason);
});

// Auto-disconnect after 10 seconds
setTimeout(() => {
  console.log('\n⏰ Test complete - disconnecting');
  socket.disconnect();
  process.exit(0);
}, 10000);

console.log('⏳ Connecting to Socket.IO server...');