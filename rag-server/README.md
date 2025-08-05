# PDF Knowledge Base AI Agent

A comprehensive AI agent that allows users to upload PDF documents and ask questions about their content using Google's Gemini AI. Available in both **Streamlit** (web UI) and **FastAPI** (REST API) versions.

## 🚀 Features

- 📄 **PDF Text Extraction**: Automatic text extraction from uploaded PDF documents
- 🤖 **AI-Powered Q&A**: Intelligent question answering using Google Gemini AI
- 📖 **Document Preview**: View extracted content before asking questions
- 💾 **Knowledge Base Management**: Create, list, and delete knowledge bases
- 🎨 **Dual Interface**: Both web UI (Streamlit) and REST API (FastAPI)
- 📚 **Comprehensive Documentation**: Interactive API docs with Swagger UI
- 🔍 **Health Monitoring**: Built-in health checks and status monitoring

## 📦 Installation & Setup

### 1. Virtual Environment

The virtual environment is already created. To activate it:

```bash
source venv/bin/activate
```

### 2. Install Dependencies

Dependencies are already installed, but if you need to reinstall:

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

Copy the example environment file and configure your API key:

```bash
cp .env.example .env
```

Then edit `.env` and add your Google Gemini AI API key:

```bash
GEMINI_API_KEY=your_actual_api_key_here
```

**Get your API key from**: https://makersuite.google.com/app/apikey

## 🖥️ Running the Applications

### Option 1: Streamlit Web Interface

```bash
# Activate virtual environment
source venv/bin/activate

# Run Streamlit app
streamlit run app.py
```

**Access at**: http://localhost:8501

**Features**:
- Drag-and-drop PDF upload
- Interactive question interface
- Real-time document preview
- Session-based knowledge storage

### Option 2: FastAPI REST API

```bash
# Activate virtual environment
source venv/bin/activate

# Run FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Access at**: 
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📖 Usage

### Streamlit Interface

1. **Upload PDF**: Use the sidebar to upload your PDF document
2. **Process**: Click "Process PDF" to extract text from the document
3. **Ask Questions**: Enter questions about the PDF content in the main area
4. **Get Answers**: The AI will provide answers based on the document content

### FastAPI Interface

#### Quick Start with cURL

**Note**: All endpoints except `/` and `/health` require JWT authentication.

```bash
# 1. Upload a PDF
curl -X POST "http://localhost:8000/upload-pdf" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@your_document.pdf"

# Response: {"id": "kb_id", "filename": "your_document.pdf", ...}

# 2. Ask a question
curl -X POST "http://localhost:8000/ask" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is this document about?",
    "knowledge_base_id": "kb_id"
  }'

# 3. List knowledge bases
curl -X GET "http://localhost:8000/knowledge-bases" \
  -H "Authorization: Bearer <your_jwt_token>"
```

#### Python Client Example

```python
import requests

base_url = "http://localhost:8000"
jwt_token = "your_jwt_token_here"

# Headers with authentication
headers = {
    "Authorization": f"Bearer {jwt_token}"
}

# Upload PDF
with open("document.pdf", "rb") as f:
    files = {"file": f}
    response = requests.post(f"{base_url}/upload-pdf", files=files, headers=headers)
    kb_id = response.json()["id"]

# Ask question
question_data = {
    "question": "What is the main topic?",
    "knowledge_base_id": kb_id
}
response = requests.post(f"{base_url}/ask", json=question_data, headers=headers)
print(response.json()["answer"])
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Activate virtual environment
source venv/bin/activate

# Make sure FastAPI server is running
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &

# Run tests
python test_api.py
```

The test script will:
- Create a sample PDF document
- Test all API endpoints
- Demonstrate complete workflow
- Verify functionality

## 📁 Project Structure

```
rag-server/
├── venv/                    # Virtual environment
├── app.py                   # Streamlit web interface
├── main.py                  # FastAPI REST API
├── test_api.py             # API testing script
├── requirements.txt        # Python dependencies
├── README.md              # This documentation
└── API_DOCUMENTATION.md   # Comprehensive API docs
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| POST | `/upload-pdf` | Upload PDF document |
| POST | `/ask` | Ask question about document |
| GET | `/knowledge-bases` | List all knowledge bases |
| GET | `/knowledge-bases/{id}` | Get knowledge base details |
| GET | `/knowledge-bases/{id}/preview` | Get content preview |
| DELETE | `/knowledge-bases/{id}` | Delete knowledge base |
| GET | `/health` | Health check |

## 📚 Documentation

- **API Documentation**: See `API_DOCUMENTATION.md` for comprehensive API reference
- **Interactive Docs**: http://localhost:8000/docs (when FastAPI is running)
- **ReDoc**: http://localhost:8000/redoc (alternative API documentation)

## 🔑 API Configuration

The application uses Google's Gemini AI API. The API key is securely configured using environment variables.

**Setup**:
1. Copy `.env.example` to `.env`
2. Add your Gemini API key to the `.env` file
3. The `.env` file is automatically ignored by git for security

**Environment Variables**:
- `GEMINI_API_KEY` (Required): Your Google Gemini AI API key
- `ACCESS_TOKEN_SECRET` (Required): JWT secret for token authentication

## 📦 Dependencies

- **FastAPI**: Modern web framework for building APIs
- **Uvicorn**: ASGI server for FastAPI
- **Streamlit**: Web interface framework
- **PyPDF2**: PDF text extraction
- **google-generativeai**: Google Gemini AI integration
- **python-dotenv**: Environment variable management
- **python-multipart**: File upload support
- **PyJWT**: JWT token authentication
- **reportlab**: PDF generation for testing

## 🚀 Production Deployment

### Using Gunicorn (Recommended)

```bash
# Install Gunicorn
pip install gunicorn

# Run with multiple workers
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Using Docker

```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🔒 Security Considerations

- **API Key**: ✅ Now uses environment variables (`.env` file)
- **Git Security**: ✅ `.env` file is ignored by git to prevent key exposure
- **Authentication**: ✅ JWT Bearer token authentication implemented
- **JWT Secret**: ✅ Uses environment variable for token signing secret
- **Protected Endpoints**: ✅ All endpoints except root and health require authentication
- **Token Validation**: ✅ Proper token expiration and error handling
- **CORS**: Currently allows all origins (restrict in production)
- **File Upload**: Consider adding file size limits
- **Rate Limiting**: Implement rate limiting for production use
- **Environment**: Use `.env.example` as template for secure setup

## 🐛 Troubleshooting

### Common Issues

1. **Gemini API Error**: Ensure API key is valid and has sufficient quota
2. **PDF Upload Fails**: Check file format and size
3. **Server Won't Start**: Ensure port 8000/8501 is available
4. **Dependencies Missing**: Run `pip install -r requirements.txt`

### Health Check

```bash
curl http://localhost:8000/health
```

## 📝 Notes

- The application processes PDF files by extracting text content
- Questions are answered based on the uploaded document content
- The AI will indicate if information is not found in the document
- Knowledge bases are stored in memory (consider persistent storage for production)
- Both interfaces can run simultaneously on different ports