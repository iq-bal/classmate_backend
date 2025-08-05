#!/bin/bash

# Lecture Plan Generator Startup Script
# This script starts both the FastAPI backend and Streamlit frontend

echo "🚀 Starting Lecture Plan Generator..."
echo "======================================"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup first:"
    echo "   python3 -m venv venv"
    echo "   source venv/bin/activate"
    echo "   pip install -r requirements.txt"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create it with your Gemini API key:"
    echo "   GEMINI_API_KEY=your_api_key_here"
    echo "   PORT=8002"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Function to cleanup background processes
cleanup() {
    echo "\n🛑 Shutting down services..."
    kill $FASTAPI_PID 2>/dev/null
    kill $STREAMLIT_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "📡 Starting FastAPI backend on port 8002..."
python main.py &
FASTAPI_PID=$!

# Wait a moment for FastAPI to start
sleep 3

echo "🌐 Starting Streamlit frontend..."
streamlit run streamlit_app.py &
STREAMLIT_PID=$!

# Wait a moment for Streamlit to start
sleep 5

echo "\n✅ Services started successfully!"
echo "📖 FastAPI Documentation: http://localhost:8002/docs"
echo "🖥️  Streamlit Interface: http://localhost:8501"
echo "\n📝 To test the API:"
echo "   python test_api.py"
echo "\n⏹️  Press Ctrl+C to stop all services"

# Wait for background processes
wait