from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import PyPDF2
import google.generativeai as genai
import uuid
import io
from typing import Dict, List, Optional
from datetime import datetime
import os
import jwt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is required")
genai.configure(api_key=api_key)

# Configure JWT
access_token_secret = os.getenv("ACCESS_TOKEN_SECRET")
if not access_token_secret:
    raise ValueError("ACCESS_TOKEN_SECRET environment variable is required")

# Security scheme
security = HTTPBearer()

app = FastAPI(
    title="PDF Knowledge Base AI Agent",
    description="A FastAPI-based AI agent for PDF document analysis and question answering using Google Gemini AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication middleware
def authenticate_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Authenticate JWT token from Authorization header"""
    token = credentials.credentials
    
    if not token:
        raise HTTPException(status_code=401, detail="Token required")
    
    try:
        # Verify the token
        payload = jwt.decode(token, access_token_secret, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail={
                "tokenExpired": True,
                "message": "Token expired",
                "expiredAt": None  # JWT doesn't provide expiredAt in the exception
            }
        )
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=403, detail="Invalid token")

# In-memory storage for knowledge bases
knowledge_bases: Dict[str, Dict] = {}

# Pydantic models
class QuestionRequest(BaseModel):
    question: str
    knowledge_base_id: str

class QuestionResponse(BaseModel):
    answer: str
    knowledge_base_id: str
    question: str
    timestamp: datetime

class KnowledgeBaseInfo(BaseModel):
    id: str
    filename: str
    upload_time: datetime
    text_length: int
    status: str

class KnowledgeBaseResponse(BaseModel):
    id: str
    filename: str
    upload_time: datetime
    text_length: int
    status: str
    message: str

class ErrorResponse(BaseModel):
    error: str
    detail: str
    timestamp: datetime

# Helper functions
def extract_text_from_pdf(pdf_content: bytes) -> str:
    """Extract text from PDF bytes"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

def get_ai_response(question: str, context: str) -> str:
    """Get response from Gemini AI based on the question and PDF context"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Based on the following document content, please answer the question.
        If the answer is not found in the document, please say so clearly.
        
        Document Content:
        {context}
        
        Question: {question}
        
        Answer:
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting AI response: {str(e)}")

# API Endpoints

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "PDF Knowledge Base AI Agent API",
        "version": "1.0.0",
        "authentication": "JWT Bearer token required for all endpoints except root and health",
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

@app.post("/upload-pdf", response_model=KnowledgeBaseResponse, tags=["Knowledge Base"])
async def upload_pdf(file: UploadFile = File(...), user: dict = Depends(authenticate_token)):
    """
    Upload a PDF file and create a knowledge base.
    
    - **file**: PDF file to upload (multipart/form-data)
    
    Returns:
    - **id**: Unique identifier for the knowledge base
    - **filename**: Original filename of the uploaded PDF
    - **upload_time**: Timestamp of upload
    - **text_length**: Number of characters extracted from PDF
    - **status**: Processing status
    - **message**: Success message
    """
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Read file content
        content = await file.read()
        
        # Extract text from PDF
        text = extract_text_from_pdf(content)
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from the PDF")
        
        # Generate unique ID
        kb_id = str(uuid.uuid4())
        
        # Store knowledge base
        knowledge_bases[kb_id] = {
            "id": kb_id,
            "filename": file.filename,
            "text": text,
            "upload_time": datetime.now(),
            "text_length": len(text),
            "status": "ready"
        }
        
        return KnowledgeBaseResponse(
            id=kb_id,
            filename=file.filename,
            upload_time=datetime.now(),
            text_length=len(text),
            status="ready",
            message="PDF uploaded and processed successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/ask", response_model=QuestionResponse, tags=["Question Answering"])
async def ask_question(request: QuestionRequest, user: dict = Depends(authenticate_token)):
    """
    Ask a question about a specific knowledge base.
    
    - **question**: The question to ask about the document
    - **knowledge_base_id**: ID of the knowledge base to query
    
    Returns:
    - **answer**: AI-generated answer based on the document
    - **knowledge_base_id**: ID of the queried knowledge base
    - **question**: The original question
    - **timestamp**: When the question was answered
    """
    # Check if knowledge base exists
    if request.knowledge_base_id not in knowledge_bases:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    
    kb = knowledge_bases[request.knowledge_base_id]
    
    # Check if knowledge base is ready
    if kb["status"] != "ready":
        raise HTTPException(status_code=400, detail="Knowledge base is not ready")
    
    try:
        # Get AI response
        answer = get_ai_response(request.question, kb["text"])
        
        return QuestionResponse(
            answer=answer,
            knowledge_base_id=request.knowledge_base_id,
            question=request.question,
            timestamp=datetime.now()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

@app.get("/knowledge-bases", response_model=List[KnowledgeBaseInfo], tags=["Knowledge Base"])
async def list_knowledge_bases(user: dict = Depends(authenticate_token)):
    """
    List all available knowledge bases.
    
    Returns a list of all uploaded knowledge bases with their metadata.
    """
    return [
        KnowledgeBaseInfo(
            id=kb["id"],
            filename=kb["filename"],
            upload_time=kb["upload_time"],
            text_length=kb["text_length"],
            status=kb["status"]
        )
        for kb in knowledge_bases.values()
    ]

@app.get("/knowledge-bases/{kb_id}", response_model=KnowledgeBaseInfo, tags=["Knowledge Base"])
async def get_knowledge_base(kb_id: str, user: dict = Depends(authenticate_token)):
    """
    Get information about a specific knowledge base.
    
    - **kb_id**: ID of the knowledge base
    
    Returns detailed information about the knowledge base.
    """
    if kb_id not in knowledge_bases:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    
    kb = knowledge_bases[kb_id]
    return KnowledgeBaseInfo(
        id=kb["id"],
        filename=kb["filename"],
        upload_time=kb["upload_time"],
        text_length=kb["text_length"],
        status=kb["status"]
    )

@app.get("/knowledge-bases/{kb_id}/preview", tags=["Knowledge Base"])
async def get_knowledge_base_preview(kb_id: str, chars: int = 1000, user: dict = Depends(authenticate_token)):
    """
    Get a preview of the knowledge base content.
    
    - **kb_id**: ID of the knowledge base
    - **chars**: Number of characters to preview (default: 1000)
    
    Returns a preview of the extracted text content.
    """
    if kb_id not in knowledge_bases:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    
    kb = knowledge_bases[kb_id]
    text = kb["text"]
    
    preview = text[:chars]
    if len(text) > chars:
        preview += "..."
    
    return {
        "knowledge_base_id": kb_id,
        "filename": kb["filename"],
        "preview": preview,
        "total_length": len(text),
        "preview_length": len(preview)
    }

@app.delete("/knowledge-bases/{kb_id}", tags=["Knowledge Base"])
async def delete_knowledge_base(kb_id: str, user: dict = Depends(authenticate_token)):
    """
    Delete a knowledge base.
    
    - **kb_id**: ID of the knowledge base to delete
    
    Returns confirmation of deletion.
    """
    if kb_id not in knowledge_bases:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    
    filename = knowledge_bases[kb_id]["filename"]
    del knowledge_bases[kb_id]
    
    return {
        "message": f"Knowledge base '{filename}' deleted successfully",
        "deleted_id": kb_id
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    
    Returns the current status of the API and its dependencies.
    """
    try:
        # Test Gemini AI connection
        model = genai.GenerativeModel('gemini-1.5-flash')
        test_response = model.generate_content("Hello")
        gemini_status = "healthy" if test_response else "unhealthy"
    except:
        gemini_status = "unhealthy"
    
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "knowledge_bases_count": len(knowledge_bases),
        "gemini_ai_status": gemini_status,
        "version": "1.0.0"
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)