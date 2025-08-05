# 📚 Lecture Plan Generator

An AI-powered lecture plan generator that creates comprehensive, structured lecture plans from PDF knowledge bases using Google Gemini AI. The application provides both a FastAPI backend and a user-friendly Streamlit frontend.

## 🌟 Features

- **PDF Processing**: Upload PDF files containing course material or textbooks
- **AI-Powered Generation**: Uses Google Gemini AI to analyze content and generate structured lecture plans
- **Comprehensive Plans**: Generates detailed plans with topics, subtopics, learning objectives, activities, assignments, and resources
- **RESTful API**: FastAPI backend with comprehensive API documentation
- **User-Friendly Interface**: Streamlit web application for easy interaction
- **JSON Output**: Structured JSON format for easy integration with other systems

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Google Gemini API key

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd lecture-planner
   ```

2. **Create and activate virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   - Copy the `.env` file or create one with your Gemini API key:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=8002
   ```

### Running the Application

#### Option 1: FastAPI Backend Only

```bash
# Activate virtual environment
source venv/bin/activate

# Start the FastAPI server
python main.py
```

The API will be available at: `http://localhost:8002`

#### Option 2: Streamlit Frontend (Recommended)

```bash
# Terminal 1: Start FastAPI backend
source venv/bin/activate
python main.py

# Terminal 2: Start Streamlit frontend
source venv/bin/activate
streamlit run streamlit_app.py
```

The Streamlit app will be available at: `http://localhost:8501`

## 📖 API Documentation

### Base URL
```
http://localhost:8002
```

### Endpoints

#### 1. Root Endpoint
**GET** `/`

Returns API information and available endpoints.

**cURL Example:**
```bash
curl -X GET "http://localhost:8002/"
```

**Response:**
```json
{
  "message": "Lecture Plan Generator API",
  "version": "1.0.0",
  "endpoints": {
    "/generate-lecture-plan": "POST - Generate lecture plan from PDF",
    "/health": "GET - Health check",
    "/docs": "GET - API documentation"
  }
}
```

#### 2. Health Check
**GET** `/health`

Checks the health status of the API.

**cURL Example:**
```bash
curl -X GET "http://localhost:8002/health"
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-27T10:30:00.123456"
}
```

#### 3. Generate Lecture Plan
**POST** `/generate-lecture-plan`

Generates a comprehensive lecture plan from uploaded PDF content.

**Parameters:**
- `pdf_file` (file): PDF file containing course material
- `course_name` (string): Name of the course
- `instructor` (string): Name of the instructor
- `lecture_date` (string): Date of the lecture (YYYY-MM-DD format)
- `lecture_time` (string): Time of the lecture (e.g., "10:00 AM - 12:00 PM")

**cURL Example:**
```bash
curl -X POST "http://localhost:8002/generate-lecture-plan" \
  -F "pdf_file=@/path/to/your/course_material.pdf" \
  -F "course_name=Introduction to Computer Science" \
  -F "instructor=Dr. John Doe" \
  -F "lecture_date=2025-09-01" \
  -F "lecture_time=10:00 AM - 12:00 PM"
```

**Response Example:**
```json
{
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
```

#### 4. Sample Response
**GET** `/sample-response`

Returns a sample lecture plan response format for reference.

**cURL Example:**
```bash
curl -X GET "http://localhost:8002/sample-response"
```

#### 5. Interactive API Documentation
**GET** `/docs`

Access the interactive Swagger UI documentation.

**URL:** `http://localhost:8002/docs`

## 🖥️ Streamlit Interface

The Streamlit interface provides a user-friendly way to interact with the API:

### Features:
- **File Upload**: Drag and drop PDF files
- **Form Input**: Easy-to-use forms for course information
- **Real-time Generation**: Live lecture plan generation with progress indicators
- **Formatted Display**: Beautiful, structured display of generated lecture plans
- **Download Options**: Download generated plans as JSON files
- **API Health Monitoring**: Check API status directly from the interface

### Usage:
1. Upload a PDF file containing course material
2. Fill in the course information (name, instructor, date, time)
3. Click "Generate Lecture Plan"
4. View the generated plan and download if needed

## 📁 Project Structure

```
lecture-planner/
├── main.py                 # FastAPI backend application
├── streamlit_app.py        # Streamlit frontend application
├── requirements.txt        # Python dependencies
├── .env                   # Environment variables (API keys)
├── .gitignore            # Git ignore file
├── README.md             # Project documentation
└── venv/                 # Virtual environment (created after setup)
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8002
```

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env` file

## 🚨 Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid file format, missing parameters, or corrupted PDF
- **500 Internal Server Error**: AI generation errors or server issues
- **Connection Errors**: Handled gracefully in the Streamlit interface

### Common Issues:

1. **"Cannot connect to API server"**
   - Ensure the FastAPI server is running on port 8002
   - Check if the port is available

2. **"Error reading PDF"**
   - Ensure the PDF file is not corrupted
   - Try with a different PDF file

3. **"Error parsing AI response"**
   - The AI response might be malformed
   - Try with a different PDF or simpler content

## 🔒 Security Considerations

- API keys are stored in environment variables
- PDF files are processed in memory and not stored permanently
- CORS is enabled for development (configure appropriately for production)
- Input validation is implemented for all endpoints

## 🚀 Deployment

### Local Development
The application is configured for local development on port 8002.

### Production Deployment
For production deployment:

1. **Update CORS settings** in `main.py`
2. **Use environment-specific configuration**
3. **Implement proper logging and monitoring**
4. **Use a production WSGI server** like Gunicorn
5. **Set up reverse proxy** with Nginx

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues or have questions:

1. Check the error messages in the API response
2. Verify your Gemini API key is valid
3. Ensure all dependencies are installed correctly
4. Check the API documentation at `http://localhost:8002/docs`

## 🔄 Version History

- **v1.0.0**: Initial release with PDF processing, AI generation, and Streamlit interface

---

**Built with ❤️ using FastAPI, Streamlit, and Google Gemini AI**