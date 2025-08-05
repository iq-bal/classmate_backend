// Create a test session for the course
const createTestSession = async () => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI1NTZkNGY5Ni03YTA1LTQ2OGYtYTQ5Yy0yMTM1YTJlNGQ0Y2QiLCJuYW1lIjoiSXFiYWwiLCJyb2xlIjoidGVhY2hlciIsImVtYWlsIjoiaXFiYWxAZ21haWwuY29tIiwiaWF0IjoxNzU0Mjk4NDYwLCJleHAiOjE3NTU1OTQ0NjB9.Xx-cuwE5_-UHNUMHB5Q17HsX9iIneh_HwEJo5HjHKg0';
  const courseId = '688c897cbc0e48abbbd88fc7';

  try {
    console.log('Creating a test session for course:', courseId);
    
    const response = await fetch('http://localhost:4001/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: `
          mutation CreateSession($sessionInput: SessionInput!) {
        createSession(sessionInput: $sessionInput) {
          id
          title
          description
          date
          start_time
          end_time
          status
          createdAt
        }
      }
        `,
        variables: {
          sessionInput: {
            course_id: "688c897cbc0e48abbbd88fc7",
            title: "Test Session for Attendance",
            description: "A test session to verify attendance functionality",
            date: "2024-01-15",
            start_time: "10:00",
            end_time: "11:00",
            meeting_link: "https://zoom.us/test-meeting"
          }
        }
      })
    });

    const result = await response.json();
    console.log('Session Creation Response:', JSON.stringify(result, null, 2));

    if (result.data && result.data.createSession) {
      const session = result.data.createSession;
      console.log('\n✅ Session created successfully!');
      console.log(`Session ID: ${session.id}`);
      console.log(`Title: ${session.title}`);
      console.log(`Description: ${session.description}`);
      console.log(`Time: ${session.start_time} - ${session.end_time}`);
      console.log(`Status: ${session.status}`);
      
      return session.id;
    } else {
      console.log('\n❌ Failed to create session.');
      if (result.errors) {
        console.log('GraphQL Errors:', result.errors);
      }
    }
  } catch (error) {
    console.error('Error creating session:', error.message);
  }
};

createTestSession();