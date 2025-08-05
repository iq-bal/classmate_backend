# Question Generator Agent 🤖📚

An AI-powered FastAPI application that generates Multiple Choice Questions (MCQ) from PDF documents using Google's Gemini AI. Upload any PDF file and get intelligently crafted questions with four options each.

## 🌟 Features

- **PDF Processing**: Extract text content from uploaded PDF files
- **AI-Powered Question Generation**: Uses Google's Gemini AI to create relevant MCQ questions
- **JWT Authentication**: Secure access with JSON Web Tokens
- **Role-Based Access Control**: Teacher role required for question generation
- **Streamlit Web Interface**: User-friendly web app for easy question generation
- **Dual Access Modes**: Authenticated API for production, public interface for demos
- **Customizable Parameters**: Control number of questions, difficulty level, and test title
- **RESTful API**: Clean and well-documented API endpoints
- **Interactive Documentation**: Built-in Swagger UI and ReDoc documentation
- **Export Options**: Download questions in JSON or text format
- **CORS Support**: Cross-origin resource sharing enabled
- **Error Handling**: Comprehensive error handling and validation
- **Environment Configuration**: Secure API key management with .env files

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Google Gemini API key (get one from [Google AI Studio](https://makersuite.google.com/app/apikey))
- JWT token with 'teacher' role for accessing protected endpoints

### Option 1: Streamlit Web Interface (Recommended for Testing)

1. **Setup**:
   ```bash
   git clone <repository-url>
   cd question-generator
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env and add your Gemini API key
   ```

2. **Start the API Server**:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8001
   ```

3. **Start the Streamlit App** (in a new terminal):
   ```bash
   python run_streamlit.py
   ```
   Or manually:
   ```bash
   streamlit run streamlit_app.py
   ```

4. **Access the Web Interface**:
   - Streamlit App: http://localhost:8501
   - Upload PDFs and generate questions with a user-friendly interface

### Option 2: API Only

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd question-generator
   ```

2. **Create and activate virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file and add your Gemini API key
   ```

   Or create a `.env` file with:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ACCESS_TOKEN_SECRET=your_access_token_secret_here
   ```

5. **Run the application**
   ```bash
    uvicorn main:app --reload --host 0.0.0.0 --port 8001
   ```

   The API will be available at `http://localhost:8001`

## 🌐 Streamlit Web Interface

The Question Generator includes a user-friendly Streamlit web interface that provides an intuitive way to generate questions without dealing with API authentication.

### Features
- **📁 Drag & Drop PDF Upload**: Easy file upload interface
- **⚙️ Interactive Settings**: Adjust question count, difficulty, and test title
- **📋 Real-time Preview**: View generated questions immediately
- **💾 Export Options**: Download results in JSON or text format
- **🔍 API Health Check**: Monitor API server status
- **📱 Responsive Design**: Works on desktop and mobile devices

### How to Use

1. **Start both servers**:
   ```bash
   # Terminal 1: API Server
   python main.py
   
   # Terminal 2: Streamlit App
   python run_streamlit.py
   ```

2. **Open your browser** to http://localhost:8501

3. **Upload a PDF** using the file uploader

4. **Configure settings** in the sidebar:
   - Number of questions (1-20)
   - Difficulty level (easy/medium/hard)
   - Test title

5. **Generate questions** and review the results

6. **Export** your questions in your preferred format

### Screenshots
The Streamlit interface provides:
- Clean, modern UI with intuitive controls
- Real-time feedback and error handling
- Professional question formatting
- Easy export functionality

---

## 📖 API Documentation

### Interactive Documentation

- **Swagger UI**: `http://localhost:8001/docs`
- **ReDoc**: `http://localhost:8001/redoc`

### Endpoints

#### 1. Root Endpoint
```http
GET /
```
Returns API information and available endpoints.

**cURL Example:**
```bash
curl -X GET "http://localhost:8001/" \
  -H "accept: application/json"
```

**Response:**
```json
{
  "message": "Question Generator Agent API",
  "version": "1.0.0",
  "description": "Upload PDF files to generate MCQ questions using AI",
  "endpoints": {
    "/docs": "Interactive API documentation",
    "/redoc": "Alternative API documentation",
    "/generate-questions": "POST - Upload PDF and generate MCQ questions",
    "/health": "GET - Health check endpoint"
  }
}
```

#### 2. Health Check
```http
GET /health
```
Health check endpoint to verify service status.

**cURL Example:**
```bash
curl -X GET "http://localhost:8001/health" \
  -H "accept: application/json"
```

**Response:**
```json
{
  "status": "healthy",
  "service": "Question Generator Agent"
}
```

#### 3. Generate Questions (Protected) 🔒
```http
POST /generate-questions
```
Generates MCQ questions from uploaded PDF file.

**🔐 Authentication Required**: Bearer token with 'teacher' role

**Parameters:**
- `file` (required): PDF file to process
- `num_questions` (optional): Number of questions to generate (1-20, default: 5)
- `difficulty` (optional): Difficulty level - "easy", "medium", or "hard" (default: "medium")
- `test_title` (optional): Custom title for the test (default: "Generated MCQ Test")

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)
- `Content-Type: multipart/form-data`

**cURL Example:**
```bash
curl -X POST "http://localhost:8001/generate-questions" \
  -H "accept: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample.pdf" \
  -F "num_questions=3" \
  -F "difficulty=medium" \
  -F "test_title=Sample Test"
```

#### 4. Generate Questions (Public) 🌐
```http
POST /generate-questions-public
```
Generates MCQ questions from uploaded PDF file without authentication.

**🌐 No Authentication Required**: Used by Streamlit web interface

**Parameters:**
- `file` (required): PDF file to process
- `num_questions` (optional): Number of questions to generate (1-20, default: 5)
- `difficulty` (optional): Difficulty level - "easy", "medium", or "hard" (default: "medium")
- `test_title` (optional): Custom title for the test (default: "Generated MCQ Test")

**Headers:**
- `Content-Type: multipart/form-data`

**cURL Example:**
```bash
curl -X POST "http://localhost:8001/generate-questions-public" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample.pdf" \
  -F "num_questions=3" \
  -F "difficulty=medium" \
  -F "test_title=Sample Test"
```

**Note**: This endpoint is intended for demo purposes and the Streamlit interface. For production use, use the protected `/generate-questions` endpoint.

**Example Response:**
```json
{
  "testTitle": "Sample Test",
  "questions": [
    {
      "id": 1,
      "question": "What is the capital of France?",
      "options": {
        "A": "Berlin",
        "B": "Madrid",
        "C": "Paris",
        "D": "Rome"
      },
      "answer": "C"
    },
    {
      "id": 2,
      "question": "Which planet is known as the Red Planet?",
      "options": {
        "A": "Earth",
        "B": "Mars",
        "C": "Jupiter",
        "D": "Saturn"
      },
      "answer": "B"
    },
    {
      "id": 3,
      "question": "Who wrote 'Hamlet'?",
      "options": {
        "A": "Charles Dickens",
        "B": "William Shakespeare",
        "C": "Mark Twain",
        "D": "Leo Tolstoy"
      },
      "answer": "B"
    }
  ]
}
```

## 🔐 Authentication

### JWT Token Requirements

The `/generate-questions` endpoint requires authentication with a valid JWT token that includes:

- **Algorithm**: HS256
- **Required Claims**:
  - `role`: Must be set to "teacher"
  - Standard JWT claims (iat, exp, etc.)

### Token Format

Your JWT payload should include:
```json
{
  "role": "teacher",
  "user_id": "your_user_id",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Authentication Errors

- **401 Unauthorized**: Missing or expired token
- **403 Forbidden**: Invalid token or insufficient permissions (non-teacher role)

**Example Error Responses:**
```json
// Missing token
{
  "detail": "Token required"
}

// Expired token
{
  "detail": {
    "tokenExpired": true,
    "message": "Token expired",
    "expiredAt": "2024-01-01T12:00:00"
  }
}

// Invalid role
{
  "detail": "Access denied. Teacher role required."
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here
ACCESS_TOKEN_SECRET=your_access_token_secret_here

# Optional (with defaults)
APP_HOST=0.0.0.0
APP_PORT=8001
APP_DEBUG=False
```

### Difficulty Levels

- **Easy**: Basic comprehension questions
- **Medium**: Moderate analysis and understanding
- **Hard**: Complex reasoning and critical thinking

## 🛠️ Development

### Project Structure
```
question-generator/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── .env                # Environment variables (not in git)
├── .env.example        # Environment template
├── .gitignore          # Git ignore rules
├── README.md           # This file
└── venv/               # Virtual environment (not in git)
```

### Running in Development Mode
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

### Testing the API

1. **Using the Interactive Documentation**
   - Go to `http://localhost:8001/docs`
   - Click on the `/generate-questions` endpoint
   - Click "Try it out"
   - Upload a PDF file and set parameters
   - Click "Execute"

2. **Using Python requests**
   ```python
   import requests
   
   url = "http://localhost:8001/generate-questions"
   headers = {
       "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
   }
   files = {"file": open("sample.pdf", "rb")}
   data = {
       "num_questions": 5,
       "difficulty": "medium",
       "test_title": "My Test"
   }
   
   response = requests.post(url, headers=headers, files=files, data=data)
   print(response.json())
   ```

3. **Using JavaScript/Fetch**
   ```javascript
   const formData = new FormData();
   formData.append('file', pdfFile);
   formData.append('num_questions', '5');
   formData.append('difficulty', 'medium');
   formData.append('test_title', 'My Test');
   
   fetch('http://localhost:8001/generate-questions', {
       method: 'POST',
       headers: {
           'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
       },
       body: formData
   })
   .then(response => response.json())
   .then(data => console.log(data));
   ```

## 📝 Error Handling

The API provides detailed error messages for various scenarios:

- **400 Bad Request**: Invalid file type, parameters out of range, empty PDF
- **401 Unauthorized**: Missing or expired JWT token
- **403 Forbidden**: Invalid token or insufficient permissions (non-teacher role)
- **422 Unprocessable Entity**: Invalid request format or missing required fields
- **500 Internal Server Error**: AI service errors, PDF processing errors

**Example Error Responses:**
```json
// File type error
{
  "detail": "Only PDF files are supported"
}

// Authentication error
{
  "detail": "Token required"
}

// Role permission error
{
  "detail": "Access denied. Teacher role required."
}
```

## 🔒 Security Considerations

- **JWT Authentication**: Secure token-based authentication with role validation
- **Role-Based Access**: Only teachers can access question generation endpoints
- **Environment Variables**: API keys and secrets stored securely in .env files
- **Token Validation**: Comprehensive JWT verification with expiration handling
- **File Upload Security**: PDF uploads are validated for type and content
- **CORS Configuration**: Cross-origin requests properly configured (adjust origins for production)
- **Input Validation**: All parameters validated to prevent malicious requests
- **No Sensitive Logging**: Tokens and sensitive data are not logged

## 🚀 Deployment

### Using Docker (Recommended)

1. **Create Dockerfile**
   ```dockerfile
   FROM python:3.9-slim
   
   WORKDIR /app
   
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   
   COPY . .
   
   EXPOSE 8001
   
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
   ```

2. **Build and run**
   ```bash
   docker build -t question-generator .
   docker run -p 8001:8001 --env-file .env question-generator
   ```

### Using Production ASGI Server

```bash
# Install production server
pip install gunicorn

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [API documentation](http://localhost:8001/docs)
2. Review the error messages in the response
3. Ensure your Gemini API key is valid and has sufficient quota
4. Verify the PDF file is readable and contains text content

## 🔄 Changelog

### Version 1.2.0 (Latest)
- **NEW**: Streamlit Web Interface with user-friendly UI
- **NEW**: Public API endpoint `/generate-questions-public` for demo access
- **NEW**: Dual access modes (authenticated API + public interface)
- **NEW**: Export functionality (JSON/text format downloads)
- **NEW**: Interactive drag & drop PDF upload
- **NEW**: Real-time settings configuration
- **NEW**: Startup script `run_streamlit.py` for easy launching
- **UPDATED**: Enhanced documentation with Streamlit guide

### Version 1.1.0
- **NEW**: JWT Authentication with Bearer token support
- **NEW**: Role-based access control (teacher role required)
- **NEW**: Comprehensive authentication error handling
- **UPDATED**: API documentation with authentication examples
- **UPDATED**: Security enhancements and token validation
- **UPDATED**: cURL examples with Authorization headers

### Version 1.0.0
- Initial release
- PDF text extraction
- Gemini AI integration
- MCQ question generation
- FastAPI REST API
- Interactive documentation
- Error handling and validation

---

