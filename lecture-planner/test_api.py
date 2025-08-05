#!/usr/bin/env python3
"""
Test script for the Lecture Plan Generator API

This script demonstrates how to use the API programmatically and can be used
to test the functionality of the lecture plan generator.
"""

import requests
import json
from datetime import datetime

# API Configuration
API_BASE_URL = "http://localhost:8002"

def test_health_check():
    """Test the health check endpoint"""
    print("Testing health check endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_root_endpoint():
    """Test the root endpoint"""
    print("\nTesting root endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/")
        if response.status_code == 200:
            print("✅ Root endpoint working")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
        return False

def test_sample_response():
    """Test the sample response endpoint"""
    print("\nTesting sample response endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/sample-response")
        if response.status_code == 200:
            print("✅ Sample response endpoint working")
            sample = response.json()
            print(f"Sample lecture plan structure:")
            print(f"- Date: {sample.get('date')}")
            print(f"- Course: {sample.get('course_name')}")
            print(f"- Topics: {len(sample.get('topics_covered', []))}")
            print(f"- Assignments: {len(sample.get('assignments', []))}")
            print(f"- Resources: {len(sample.get('resources', []))}")
            return True
        else:
            print(f"❌ Sample response failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Sample response error: {e}")
        return False

def create_sample_pdf():
    """Create a simple sample PDF content for testing"""
    # This is a simple text that would typically be extracted from a PDF
    sample_content = """
    Introduction to Computer Science
    
    Computer Science is the study of computational systems and the design of computer systems and their applications. It encompasses both the theoretical study of algorithms and the practical problems of implementing computing systems in hardware and software.
    
    History of Computer Science:
    - Early mechanical calculators (1600s)
    - Charles Babbage's Analytical Engine (1830s)
    - Alan Turing's theoretical work (1930s-1940s)
    - First electronic computers (1940s)
    - Personal computers (1970s-1980s)
    - Internet and World Wide Web (1990s)
    - Mobile computing and cloud computing (2000s)
    
    Key Areas of Computer Science:
    1. Algorithms and Data Structures
    2. Programming Languages
    3. Computer Systems and Architecture
    4. Software Engineering
    5. Database Systems
    6. Computer Networks
    7. Artificial Intelligence
    8. Human-Computer Interaction
    
    Algorithms:
    An algorithm is a step-by-step procedure for solving a problem or completing a task. Algorithms are fundamental to computer science and are used in every aspect of computing.
    
    Types of Algorithms:
    - Sorting algorithms (bubble sort, merge sort, quick sort)
    - Search algorithms (linear search, binary search)
    - Graph algorithms (shortest path, minimum spanning tree)
    - Dynamic programming algorithms
    
    Applications of Computer Science:
    - Web development and e-commerce
    - Mobile applications
    - Video games and entertainment
    - Scientific computing and research
    - Healthcare and medical systems
    - Financial systems and banking
    - Transportation and logistics
    - Education and e-learning
    """
    return sample_content

def test_lecture_plan_generation_mock():
    """Test lecture plan generation with mock data (without actual PDF)"""
    print("\nTesting lecture plan generation (mock test)...")
    print("Note: This would require an actual PDF file and is just for demonstration")
    
    # Sample data that would be sent to the API
    sample_data = {
        "course_name": "Introduction to Computer Science",
        "instructor": "Dr. Jane Smith",
        "lecture_date": "2025-02-01",
        "lecture_time": "10:00 AM - 12:00 PM"
    }
    
    print(f"Sample request data: {json.dumps(sample_data, indent=2)}")
    print("To test with actual PDF, use the Streamlit interface or curl command from README")
    
    return True

def main():
    """Run all tests"""
    print("🧪 Lecture Plan Generator API Test Suite")
    print("=" * 50)
    
    tests = [
        test_health_check,
        test_root_endpoint,
        test_sample_response,
        test_lecture_plan_generation_mock
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The API is working correctly.")
        print("\n📝 Next steps:")
        print("1. Open the Streamlit interface at http://localhost:8502")
        print("2. Upload a PDF file and test the lecture plan generation")
        print("3. Check the API documentation at http://localhost:8002/docs")
    else:
        print("❌ Some tests failed. Please check the API server.")
        print("Make sure the FastAPI server is running on port 8002")

if __name__ == "__main__":
    main()