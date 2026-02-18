# PDF Knowledge Base AI Agent - API Documentation

A comprehensive FastAPI-based AI agent for PDF document analysis and question answering using Google Gemini AI.

## Base URL
```
http://localhost:8000
```

## Interactive Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Authentication

**JWT Bearer Token Required**: All endpoints except `/` and `/health` require a valid JWT token in the Authorization header.

### Authorization Header Format
```
Authorization: Bearer <your_jwt_token>
```

### Token Requirements
- **Algorithm**: HS256
- **Secret**: Configured via `ACCESS_TOKEN_SECRET` environment variable
- **Format**: Standard JWT token

### Authentication Errors
- **401 Unauthorized**: Missing or expired token
- **403 Forbidden**: Invalid token

### Example Token Error Responses

**Missing Token:**
```json
{
  "detail": "Not authenticated"
}
```

**Expired Token:**
```json
{
  "detail": {
    "tokenExpired": true,
    "message": "Token expired",
    "expiredAt": null
  }
}
```

**Invalid Token:**
```json
{
  "detail": "Invalid token"
}
```

## Endpoints Overview

### 1. Root Information
**GET** `/`

Returns basic API information and available endpoints.

**Response:**
```json
{
  "message": "PDF Knowledge Base AI Agent API",
  "version": "1.0.0",
  "docs": "/docs",
  "redoc": "/redoc",
  "endpoints": {
    "upload_pdf": "/upload-pdf",
    "ask_question": "/ask",
    "list_knowledge_bases": "/knowledge-bases",
    "get_knowledge_base": "/knowledge-bases/{kb_id}",
    "delete_knowledge_base": "/knowledge-bases/{kb_id}"
  }
}
```

### 2. Upload PDF Document
**POST** `/upload-pdf`

Upload a PDF file and create a knowledge base for question answering.

**Request:**
- **Content-Type**: `multipart/form-data`
- **Body**: PDF file

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/upload-pdf" \
  -H "accept: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@document.pdf"
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "filename": "document.pdf",
  "upload_time": "2024-01-15T10:30:00.123456",
  "text_length": 5420,
  "status": "ready",
  "message": "PDF uploaded and processed successfully"
}
```

**Error Responses:**
- `400`: Invalid file type or no text extracted
- `500`: Internal server error

### 3. Ask Question
**POST** `/ask`

Ask a question about a specific knowledge base.

**Request Body:**
```json
{
  "question": "What is the main topic of this document?",
  "knowledge_base_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/ask" \
  -H "accept: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the main topic of this document?",
    "knowledge_base_id": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

**Response:**
```json
{
  "answer": "Based on the document content, the main topic is...",
  "knowledge_base_id": "123e4567-e89b-12d3-a456-426614174000",
  "question": "What is the main topic of this document?",
  "timestamp": "2024-01-15T10:35:00.123456"
}
```

**Error Responses:**
- `404`: Knowledge base not found
- `400`: Knowledge base not ready
- `500`: Error processing question

### 4. List Knowledge Bases
**GET** `/knowledge-bases`

Retrieve a list of all uploaded knowledge bases.

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/knowledge-bases" \
  -H "accept: application/json" \
  -H "Authorization: Bearer <your_jwt_token>"
```

**Response:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "filename": "document1.pdf",
    "upload_time": "2024-01-15T10:30:00.123456",
    "text_length": 5420,
    "status": "ready"
  },
  {
    "id": "987fcdeb-51a2-43d7-8f9e-123456789abc",
    "filename": "document2.pdf",
    "upload_time": "2024-01-15T11:00:00.654321",
    "text_length": 3280,
    "status": "ready"
  }
]
```

### 5. Get Knowledge Base Details
**GET** `/knowledge-bases/{kb_id}`

Retrieve detailed information about a specific knowledge base.

**Parameters:**
- `kb_id` (path): Knowledge base ID

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/knowledge-bases/123e4567-e89b-12d3-a456-426614174000" \
  -H "accept: application/json" \
  -H "Authorization: Bearer <your_jwt_token>"
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "filename": "document.pdf",
  "upload_time": "2024-01-15T10:30:00.123456",
  "text_length": 5420,
  "status": "ready"
}
```

**Error Responses:**
- `404`: Knowledge base not found

### 6. Get Knowledge Base Preview
**GET** `/knowledge-bases/{kb_id}/preview`

Get a preview of the extracted text content from a knowledge base.

**Parameters:**
- `kb_id` (path): Knowledge base ID
- `chars` (query, optional): Number of characters to preview (default: 1000)

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/knowledge-bases/123e4567-e89b-12d3-a456-426614174000/preview?chars=500" \
  -H "accept: application/json" \
  -H "Authorization: Bearer <your_jwt_token>"
```

**Response:**
```json
{
  "knowledge_base_id": "123e4567-e89b-12d3-a456-426614174000",
  "filename": "document.pdf",
  "preview": "This is the beginning of the document content...",
  "total_length": 5420,
  "preview_length": 500
}
```

### 7. Delete Knowledge Base
**DELETE** `/knowledge-bases/{kb_id}`

Delete a specific knowledge base.

**Parameters:**
- `kb_id` (path): Knowledge base ID

**cURL Example:**
```bash
curl -X DELETE "http://localhost:8000/knowledge-bases/123e4567-e89b-12d3-a456-426614174000" \
  -H "accept: application/json" \
  -H "Authorization: Bearer <your_jwt_token>"
```

**Response:**
```json
{
  "message": "Knowledge base 'document.pdf' deleted successfully",
  "deleted_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Error Responses:**
- `404`: Knowledge base not found

### 8. Health Check
**GET** `/health`

Check the health status of the API and its dependencies.

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/health" \
  -H "accept: application/json"
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:40:00.123456",
  "knowledge_bases_count": 2,
  "gemini_ai_status": "healthy",
  "version": "1.0.0"
}
```

## Data Models

### QuestionRequest
```json
{
  "question": "string",
  "knowledge_base_id": "string"
}
```

### QuestionResponse
```json
{
  "answer": "string",
  "knowledge_base_id": "string",
  "question": "string",
  "timestamp": "2024-01-15T10:35:00.123456"
}
```

### KnowledgeBaseInfo
```json
{
  "id": "string",
  "filename": "string",
  "upload_time": "2024-01-15T10:30:00.123456",
  "text_length": 0,
  "status": "string"
}
```

### KnowledgeBaseResponse
```json
{
  "id": "string",
  "filename": "string",
  "upload_time": "2024-01-15T10:30:00.123456",
  "text_length": 0,
  "status": "string",
  "message": "string"
}
```

## Error Handling

All endpoints return structured error responses:

```json
{
  "error": "Error description",
  "status_code": 400,
  "timestamp": "2024-01-15T10:40:00.123456"
}
```

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request (invalid input, file type, etc.)
- `404`: Not Found (knowledge base doesn't exist)
- `500`: Internal Server Error

## Usage Examples

### Python Client Example
```python
import requests
import json

base_url = "http://localhost:8000"
jwt_token = "your_jwt_token_here"

# Headers with authentication
headers = {
    "Authorization": f"Bearer {jwt_token}"
}

# Upload a PDF
with open("document.pdf", "rb") as f:
    files = {"file": f}
    response = requests.post(f"{base_url}/upload-pdf", files=files, headers=headers)
    kb_data = response.json()
    kb_id = kb_data["id"]

# Ask a question
question_data = {
    "question": "What is the main topic of this document?",
    "knowledge_base_id": kb_id
}
response = requests.post(f"{base_url}/ask", json=question_data, headers=headers)
answer = response.json()
print(f"Answer: {answer['answer']}")

# List all knowledge bases
response = requests.get(f"{base_url}/knowledge-bases", headers=headers)
kb_list = response.json()
print(f"Total knowledge bases: {len(kb_list)}")
```

### JavaScript/Node.js Example
```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const baseUrl = 'http://localhost:8000';
const jwtToken = 'your_jwt_token_here';

// Common headers with authentication
const authHeaders = {
  'Authorization': `Bearer ${jwtToken}`
};

// Upload a PDF
async function uploadPDF() {
  const form = new FormData();
  form.append('file', fs.createReadStream('document.pdf'));
  
  const response = await axios.post(`${baseUrl}/upload-pdf`, form, {
    headers: {
      ...form.getHeaders(),
      ...authHeaders
    }
  });
  
  return response.data.id;
}

// Ask a question
async function askQuestion(kbId, question) {
  const response = await axios.post(`${baseUrl}/ask`, {
    question: question,
    knowledge_base_id: kbId
  }, {
    headers: authHeaders
  });
  
  return response.data.answer;
}

// Usage
(async () => {
  const kbId = await uploadPDF();
  const answer = await askQuestion(kbId, 'What is this document about?');
  console.log('Answer:', answer);
})();
```

## Rate Limiting
Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## Security Considerations
- API key is hardcoded (consider using environment variables)
- No authentication/authorization implemented
- CORS is set to allow all origins (restrict in production)
- File upload size limits should be considered

## Deployment

### Local Development
```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Deployment
```bash
# Run with Gunicorn (recommended for production)
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Environment Variables
Consider setting these environment variables for production:
- `GEMINI_API_KEY`: Google Gemini AI API key
- `MAX_FILE_SIZE`: Maximum PDF file size
- `CORS_ORIGINS`: Allowed CORS origins
- `LOG_LEVEL`: Logging level

## Monitoring and Logging
The API includes basic error handling and health checks. Consider adding:
- Structured logging
- Metrics collection
- Request/response logging
- Performance monitoring