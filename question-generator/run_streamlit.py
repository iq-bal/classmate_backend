#!/usr/bin/env python3
"""
Streamlit App Runner for Question Generator

This script starts the Streamlit web interface for the Question Generator.
Make sure the FastAPI server is running before starting this app.
"""

import subprocess
import sys
import os
import time
import requests

def check_api_server():
    """Check if the FastAPI server is running"""
    try:
        response = requests.get("http://localhost:8001/health", timeout=5)
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False

def main():
    print("🚀 Starting Question Generator Streamlit App...")
    print("="*50)
    
    # Check if API server is running
    print("🔍 Checking API server status...")
    if check_api_server():
        print("✅ API server is running at http://localhost:8001")
    else:
        print("⚠️  API server is not running!")
        print("")
        print("Please start the API server first:")
        print("  python main.py")
        print("")
        print("Or run both servers with:")
        print("  # Terminal 1:")
        print("  python main.py")
        print("")
        print("  # Terminal 2:")
        print("  python run_streamlit.py")
        print("")
        
        choice = input("Do you want to continue anyway? (y/N): ").lower().strip()
        if choice != 'y':
            print("Exiting...")
            return
    
    print("")
    print("🌐 Starting Streamlit web interface...")
    print("📱 The app will open in your default browser")
    print("🔗 URL: http://localhost:8501")
    print("")
    print("💡 Tips:")
    print("  - Upload a PDF file to generate questions")
    print("  - Adjust settings in the sidebar")
    print("  - Export results in JSON or text format")
    print("  - Press Ctrl+C to stop the server")
    print("="*50)
    
    try:
        # Run Streamlit
        subprocess.run([
            sys.executable, "-m", "streamlit", "run", 
            "streamlit_app.py",
            "--server.port=8501",
            "--server.address=localhost",
            "--browser.gatherUsageStats=false"
        ])
    except KeyboardInterrupt:
        print("\n👋 Streamlit app stopped.")
    except Exception as e:
        print(f"❌ Error starting Streamlit: {e}")
        print("")
        print("Make sure Streamlit is installed:")
        print("  pip install streamlit")

if __name__ == "__main__":
    main()