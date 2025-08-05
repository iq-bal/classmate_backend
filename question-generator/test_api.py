#!/usr/bin/env python3
"""
Test script for the Question Generator API
This script demonstrates how to use the API endpoints
"""

import requests
import json
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import os

# API base URL
BASE_URL = "http://localhost:8001"

def create_sample_pdf():
    """
    Create a sample PDF file for testing
    """
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # Add some sample content
    p.drawString(100, 750, "Sample Educational Content")
    p.drawString(100, 720, "")
    p.drawString(100, 690, "Python Programming Basics")
    p.drawString(100, 660, "")
    p.drawString(100, 630, "Python is a high-level programming language known for its simplicity")
    p.drawString(100, 600, "and readability. It was created by Guido van Rossum and first released")
    p.drawString(100, 570, "in 1991. Python supports multiple programming paradigms including")
    p.drawString(100, 540, "procedural, object-oriented, and functional programming.")
    p.drawString(100, 510, "")
    p.drawString(100, 480, "Key Features of Python:")
    p.drawString(100, 450, "1. Easy to learn and use")
    p.drawString(100, 420, "2. Extensive standard library")
    p.drawString(100, 390, "3. Cross-platform compatibility")
    p.drawString(100, 360, "4. Large community support")
    p.drawString(100, 330, "5. Versatile applications in web development, data science, AI")
    
    p.save()
    buffer.seek(0)
    return buffer

def test_root_endpoint():
    """
    Test the root endpoint
    """
    print("\n=== Testing Root Endpoint ===")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_health_endpoint():
    """
    Test the health check endpoint
    """
    print("\n=== Testing Health Endpoint ===")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_generate_questions():
    """
    Test the question generation endpoint
    """
    print("\n=== Testing Question Generation Endpoint ===")
    try:
        # Create sample PDF
        pdf_buffer = create_sample_pdf()
        
        # Prepare the request
        files = {
            'file': ('sample.pdf', pdf_buffer, 'application/pdf')
        }
        data = {
            'num_questions': 3,
            'difficulty': 'medium',
            'test_title': 'Python Programming Test'
        }
        
        # Make the request
        response = requests.post(f"{BASE_URL}/generate-questions", files=files, data=data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Test Title: {result.get('testTitle')}")
            print(f"Number of Questions: {len(result.get('questions', []))}")
            print("\nGenerated Questions:")
            for i, question in enumerate(result.get('questions', []), 1):
                print(f"\nQuestion {i}:")
                print(f"  Q: {question.get('question')}")
                print(f"  A: {question.get('options', {}).get('A')}")
                print(f"  B: {question.get('options', {}).get('B')}")
                print(f"  C: {question.get('options', {}).get('C')}")
                print(f"  D: {question.get('options', {}).get('D')}")
                print(f"  Correct Answer: {question.get('answer')}")
            return True
        else:
            print(f"Error Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    """
    Run all tests
    """
    print("Question Generator API Test Suite")
    print("=" * 50)
    
    # Check if reportlab is available for PDF creation
    try:
        import reportlab
    except ImportError:
        print("Warning: reportlab not installed. Installing for PDF creation...")
        os.system("pip install reportlab")
        import reportlab
    
    tests = [
        ("Root Endpoint", test_root_endpoint),
        ("Health Check", test_health_endpoint),
        ("Question Generation", test_generate_questions)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\nRunning {test_name} test...")
        success = test_func()
        results.append((test_name, success))
        print(f"{test_name}: {'✅ PASSED' if success else '❌ FAILED'}")
    
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)
    
    for test_name, success in results:
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The API is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the server logs.")

if __name__ == "__main__":
    main()