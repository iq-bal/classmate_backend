// Create a simple GraphQL client to test getting sessions
const testGetSessions = async () => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI1NTZkNGY5Ni03YTA1LTQ2OGYtYTQ5Yy0yMTM1YTJlNGQ0Y2QiLCJuYW1lIjoiSXFiYWwiLCJyb2xlIjoidGVhY2hlciIsImVtYWlsIjoiaXFiYWxAZ21haWwuY29tIiwiaWF0IjoxNzU0Mjk4NDYwLCJleHAiOjE3NTU1OTQ0NjB9.Xx-cuwE5_-UHNUMHB5Q17HsX9iIneh_HwEJo5HjHKg0';
  const courseId = '688c897cbc0e48abbbd88fc7';

  try {
    // Make a direct HTTP request to the GraphQL endpoint
    const response = await fetch('http://localhost:4001/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: `
          query GetSessionsByCourse($courseId: ID!) {
            sessionsByCourse(course_id: $courseId) {
              id
              title
              description
              start_time
              end_time
              status
              createdAt
            }
          }
        `,
        variables: {
          courseId: courseId
        }
      })
    });

    const result = await response.json();
    console.log('GraphQL Response:', JSON.stringify(result, null, 2));

    if (result.data && result.data.sessionsByCourse) {
      const sessions = result.data.sessionsByCourse;
      console.log(`\nFound ${sessions.length} sessions for course ${courseId}:`);
      sessions.forEach((session, index) => {
        console.log(`${index + 1}. Session ID: ${session.id}`);
        console.log(`   Title: ${session.title || 'No title'}`);
        console.log(`   Description: ${session.description || 'No description'}`);
        console.log(`   Time: ${session.start_time} - ${session.end_time}`);
        console.log(`   Status: ${session.status}`);
        console.log(`   Created: ${session.createdAt}`);
        console.log('');
      });

      // Test with the first session if available
      if (sessions.length > 0) {
        const testSessionId = sessions[0].id;
        console.log(`\n🧪 Testing Socket.IO with session ID: ${testSessionId}`);
        return testSessionId;
      } else {
        console.log('\n❌ No sessions found for this course. You need to create a session first.');
      }
    } else {
      console.log('\n❌ No sessions data received or error occurred.');
      if (result.errors) {
        console.log('GraphQL Errors:', result.errors);
      }
    }
  } catch (error) {
    console.error('Error fetching sessions:', error.message);
  }
};

testGetSessions();