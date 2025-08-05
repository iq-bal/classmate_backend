from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import tempfile
import json
from typing import Optional
from dotenv import load_dotenv
import google.generativeai as genai
import PyPDF2
from io import BytesIO
from pydantic import BaseModel
from typing import List, Dict
import jwt
from datetime import datetime

# Load environment variables
load_dotenv()

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(
    title="Question Generator Agent",
    description="An AI-powered agent that generates MCQ questions from PDF documents using Google's Gemini AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Security scheme for JWT
security = HTTPBearer()

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
    """
    Middleware to authenticate access token and verify teacher role
    """
    token = credentials.credentials
    
    if not token:
        raise HTTPException(status_code=401, detail="Token required")
    
    try:
        # Verify JWT token
        payload = jwt.decode(token, os.getenv("ACCESS_TOKEN_SECRET"), algorithms=["HS256"])
        
        # Check if user has teacher role
        user_role = payload.get("role")
        if user_role != "teacher":
            raise HTTPException(
                status_code=403, 
                detail="Access denied. Teacher role required."
            )
        
        return payload
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail={
                "tokenExpired": True,
                "message": "Token expired",
                "expiredAt": datetime.utcnow().isoformat()
            }
        )
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=403, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication error: {str(e)}")

# Pydantic models for request/response
class QuestionOption(BaseModel):
    A: str
    B: str
    C: str
    D: str

class Question(BaseModel):
    id: int
    question: str
    options: QuestionOption
    answer: str

class MCQResponse(BaseModel):
    testTitle: str
    questions: List[Question]

class GenerateQuestionsRequest(BaseModel):
    num_questions: Optional[int] = 5
    difficulty: Optional[str] = "medium"
    test_title: Optional[str] = "Generated MCQ Test"

# Helper function to extract text from PDF
def extract_text_from_pdf(pdf_file: bytes) -> str:
    """
    Extract text content from PDF file
    """
    try:
        pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_file))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

# Helper function to generate questions using Gemini AI
def generate_mcq_questions(text: str, num_questions: int = 5, difficulty: str = "medium", test_title: str = "Generated MCQ Test") -> dict:
    """
    Generate MCQ questions from text using Gemini AI
    """
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Based on the following text, generate {num_questions} multiple choice questions with {difficulty} difficulty level.
        
        Text: {text[:4000]}  # Limit text to avoid token limits
        
        Please generate questions that test understanding of the key concepts in the text.
        
        Return the response in the following JSON format exactly:
        {{
            "testTitle": "{test_title}",
            "questions": [
                {{
                    "id": 1,
                    "question": "Your question here?",
                    "options": {{
                        "A": "Option A",
                        "B": "Option B",
                        "C": "Option C",
                        "D": "Option D"
                    }},
                    "answer": "A"
                }}
            ]
        }}
        
        Make sure:
        1. Each question has exactly 4 options (A, B, C, D)
        2. Only one correct answer per question
        3. Questions are relevant to the provided text
        4. Options are plausible but only one is correct
        5. Return valid JSON only, no additional text
        """
        
        response = model.generate_content(prompt)
        
        # Clean the response text
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        # Parse JSON response
        try:
            questions_data = json.loads(response_text)
            return questions_data
        except json.JSONDecodeError as e:
            # If JSON parsing fails, try to extract JSON from the response
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                questions_data = json.loads(json_match.group())
                return questions_data
            else:
                raise HTTPException(status_code=500, detail=f"Failed to parse AI response as JSON: {str(e)}")
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")

@app.get("/")
async def root():
    """
    Root endpoint with API information
    """
    return {
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

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "service": "Question Generator Agent"}

@app.post("/generate-questions", response_model=MCQResponse)
async def generate_questions(
    file: UploadFile = File(..., description="PDF file to extract content from"),
    num_questions: int = Form(5, description="Number of questions to generate (1-20)"),
    difficulty: str = Form("medium", description="Difficulty level: easy, medium, hard"),
    test_title: str = Form("Generated MCQ Test", description="Title for the test"),
    current_user: dict = Depends(authenticate_token)
):
    """
    Generate MCQ questions from uploaded PDF file (Teacher access only)
    
    **Authentication Required**: Bearer token with 'teacher' role
    
    - **file**: PDF file to process (required)
    - **num_questions**: Number of questions to generate (1-20, default: 5)
    - **difficulty**: Difficulty level - easy, medium, or hard (default: medium)
    - **test_title**: Custom title for the generated test (default: "Generated MCQ Test")
    
    Returns a JSON object with the test title and list of MCQ questions.
    
    **Authorization**: Requires valid JWT token with 'teacher' role in Authorization header:
    `Authorization: Bearer <your_jwt_token>`
    """
    return await _generate_questions_internal(file, num_questions, difficulty, test_title, current_user.get("user_id"))

@app.post("/generate-questions-public", response_model=MCQResponse)
async def generate_questions_public(
    file: UploadFile = File(..., description="PDF file to extract content from"),
    num_questions: int = Form(5, description="Number of questions to generate (1-20)"),
    difficulty: str = Form("medium", description="Difficulty level: easy, medium, hard"),
    test_title: str = Form("Generated MCQ Test", description="Title for the test")
):
    """
    Generate MCQ questions from uploaded PDF file (Public endpoint for Streamlit)
    
    **No Authentication Required** - for demo and testing purposes
    
    - **file**: PDF file to process (required)
    - **num_questions**: Number of questions to generate (1-20, default: 5)
    - **difficulty**: Difficulty level - easy, medium, or hard (default: medium)
    - **test_title**: Custom title for the generated test (default: "Generated MCQ Test")
    
    Returns a JSON object with the test title and list of MCQ questions.
    """
    return await _generate_questions_internal(file, num_questions, difficulty, test_title, "streamlit_user")

async def _generate_questions_internal(
    file: UploadFile,
    num_questions: int,
    difficulty: str,
    test_title: str,
    user_id: str = None
):
    """
    Internal function to generate questions (shared by both authenticated and public endpoints).
    """
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Validate number of questions
    if num_questions < 1 or num_questions > 20:
        raise HTTPException(status_code=400, detail="Number of questions must be between 1 and 20")
    
    # Validate difficulty level
    if difficulty.lower() not in ['easy', 'medium', 'hard']:
        raise HTTPException(status_code=400, detail="Difficulty must be 'easy', 'medium', or 'hard'")
    
    try:
        # Read PDF file
        pdf_content = await file.read()
        
        # Extract text from PDF
        extracted_text = extract_text_from_pdf(pdf_content)
        
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="No text content found in the PDF file")
        
        # Generate questions using AI
        questions_data = generate_mcq_questions(
            text=extracted_text,
            num_questions=num_questions,
            difficulty=difficulty.lower(),
            test_title=test_title
        )
        
        return JSONResponse(content=questions_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)