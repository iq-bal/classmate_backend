from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import google.generativeai as genai
from dotenv import load_dotenv
import os
import PyPDF2
import io
from datetime import datetime, timedelta
import json
from typing import Optional

# Load environment variables
load_dotenv()

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

# Initialize FastAPI app
app = FastAPI(
    title="Lecture Plan Generator",
    description="An AI-powered lecture plan generator that creates comprehensive lecture plans from PDF knowledge bases",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text_from_pdf(pdf_file) -> str:
    """Extract text content from uploaded PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

def generate_lecture_plan_prompt(pdf_content: str, course_name: str, instructor: str, 
                                lecture_date: str, lecture_time: str) -> str:
    """Generate the prompt for Gemini AI"""
    return f"""
    Based on the following PDF content, generate a comprehensive lecture plan in JSON format.
    
    Course Information:
    - Course Name: {course_name}
    - Instructor: {instructor}
    - Lecture Date: {lecture_date}
    - Lecture Time: {lecture_time}
    
    PDF Content:
    {pdf_content[:8000]}  # Limit content to avoid token limits
    
    Please generate a lecture plan in the following JSON format:
    {{
        "date": "{lecture_date}",
        "day_of_week": "[Day of the week]",
        "lecture_time": "{lecture_time}",
        "course_name": "{course_name}",
        "instructor": "{instructor}",
        "topics_covered": [
            {{
                "topic": "[Main topic name]",
                "subtopics": [
                    "[Subtopic 1]",
                    "[Subtopic 2]",
                    "[Subtopic 3]"
                ],
                "learning_objectives": [
                    "[Learning objective 1]",
                    "[Learning objective 2]",
                    "[Learning objective 3]"
                ],
                "activities": [
                    "[Activity 1]",
                    "[Activity 2]"
                ]
            }}
        ],
        "assignments": [
            {{
                "title": "[Assignment title]",
                "due_date": "[Due date]",
                "details": "[Assignment details]"
            }}
        ],
        "resources": [
            {{
                "type": "[Resource type]",
                "title": "[Resource title]",
                "chapter": "[Chapter if applicable]",
                "link": "[Link if applicable]"
            }}
        ],
        "notes": [
            "[Important note 1]",
            "[Important note 2]"
        ]
    }}
    
    Make sure to:
    1. Extract relevant topics from the PDF content
    2. Create meaningful learning objectives
    3. Suggest appropriate activities and assignments
    4. Include relevant resources
    5. Add helpful notes for the instructor
    6. Return ONLY valid JSON without any additional text or formatting
    """

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Lecture Plan Generator API",
        "version": "1.0.0",
        "endpoints": {
            "/generate-lecture-plan": "POST - Generate lecture plan from PDF",
            "/health": "GET - Health check",
            "/docs": "GET - API documentation"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/generate-lecture-plan")
async def generate_lecture_plan(
    pdf_file: UploadFile = File(..., description="PDF file containing course material"),
    course_name: str = Form(..., description="Name of the course"),
    instructor: str = Form(..., description="Name of the instructor"),
    lecture_date: str = Form(..., description="Date of the lecture (YYYY-MM-DD)"),
    lecture_time: str = Form(..., description="Time of the lecture (e.g., '10:00 AM - 12:00 PM')")
):
    """
    Generate a comprehensive lecture plan from uploaded PDF content.
    
    This endpoint accepts a PDF file and course information, then uses AI to generate
    a structured lecture plan with topics, objectives, activities, and resources.
    """
    
    # Validate file type
    if not pdf_file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Read and extract text from PDF
        pdf_content = await pdf_file.read()
        pdf_file_obj = io.BytesIO(pdf_content)
        extracted_text = extract_text_from_pdf(pdf_file_obj)
        
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="No text content found in PDF")
        
        # Generate prompt for AI
        prompt = generate_lecture_plan_prompt(
            extracted_text, course_name, instructor, lecture_date, lecture_time
        )
        
        # Generate lecture plan using Gemini AI
        response = model.generate_content(prompt)
        
        # Parse the response
        try:
            # Clean the response text
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            lecture_plan = json.loads(response_text)
            
            # Add day of week if not present
            if 'day_of_week' not in lecture_plan or not lecture_plan['day_of_week']:
                try:
                    date_obj = datetime.strptime(lecture_date, '%Y-%m-%d')
                    lecture_plan['day_of_week'] = date_obj.strftime('%A')
                except:
                    lecture_plan['day_of_week'] = 'Monday'
            
            return JSONResponse(content=lecture_plan)
            
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Error parsing AI response: {str(e)}. Response: {response.text[:200]}..."
            )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating lecture plan: {str(e)}")

@app.get("/sample-response")
async def get_sample_response():
    """
    Get a sample lecture plan response format for reference.
    """
    sample = {
        "date": "2025-09-01",
        "day_of_week": "Monday",
        "lecture_time": "10:00 AM - 12:00 PM",
        "course_name": "Introduction to Computer Science",
        "instructor": "Dr. John Doe",
        "topics_covered": [
            {
                "topic": "Introduction to Computer Science",
                "subtopics": [
                    "What is Computer Science?",
                    "Brief history and evolution",
                    "Importance of computer science in today's world"
                ],
                "learning_objectives": [
                    "Understand the definition and scope of computer science",
                    "Learn about the history and evolution of computers",
                    "Identify the impact of computer science in various industries"
                ],
                "activities": [
                    "Lecture on the history and importance of computer science",
                    "Discussion on how computer science affects daily life and various professions"
                ]
            },
            {
                "topic": "Overview of Algorithms",
                "subtopics": [
                    "What is an algorithm?",
                    "Types of algorithms",
                    "Applications of algorithms in real life"
                ],
                "learning_objectives": [
                    "Define what an algorithm is",
                    "Recognize different types of algorithms",
                    "Understand how algorithms are used in daily applications"
                ],
                "activities": [
                    "Lecture on algorithm basics and examples",
                    "Class activity: Group discussion on real-world applications of algorithms"
                ]
            }
        ],
        "assignments": [
            {
                "title": "Read Chapter 1 from the textbook",
                "due_date": "2025-09-08",
                "details": "Focus on the history of computer science and basic concepts of algorithms."
            }
        ],
        "resources": [
            {
                "type": "Textbook",
                "title": "Computer Science Fundamentals",
                "chapter": "Chapter 1: Introduction"
            },
            {
                "type": "Lecture Slides",
                "title": "Week 1: Introduction to Computer Science"
            },
            {
                "type": "Video",
                "title": "The Evolution of Computers",
                "link": "https://example.com/video/evolution"
            }
        ],
        "notes": [
            "Ensure that students understand the importance of algorithms in computer science.",
            "Prepare discussion questions for the next class about real-life algorithm applications."
        ]
    }
    
    return JSONResponse(content=sample)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8002))
    uvicorn.run(app, host="0.0.0.0", port=port)