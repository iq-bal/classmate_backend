#!/usr/bin/env python3
"""
Example usage of the Question Generator API
This script shows how to integrate the API into your applications
"""

import requests
import json

def generate_questions_from_pdf(pdf_path, num_questions=5, difficulty="medium", test_title="Generated Test"):
    """
    Generate MCQ questions from a PDF file
    
    Args:
        pdf_path (str): Path to the PDF file
        num_questions (int): Number of questions to generate (1-20)
        difficulty (str): Difficulty level (easy, medium, hard)
        test_title (str): Title for the test
    
    Returns:
        dict: Generated questions in the specified format
    """
    url = "http://localhost:8001/generate-questions"
    
    try:
        # Open and read the PDF file
        with open(pdf_path, 'rb') as pdf_file:
            files = {'file': (pdf_path, pdf_file, 'application/pdf')}
            data = {
                'num_questions': num_questions,
                'difficulty': difficulty,
                'test_title': test_title
            }
            
            # Make the API request
            response = requests.post(url, files=files, data=data)
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error: {response.status_code} - {response.text}")
                return None
                
    except FileNotFoundError:
        print(f"Error: PDF file '{pdf_path}' not found")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def display_questions(questions_data):
    """
    Display the generated questions in a readable format
    
    Args:
        questions_data (dict): Questions data from the API
    """
    if not questions_data:
        print("No questions to display")
        return
    
    print(f"\n{'='*60}")
    print(f"TEST: {questions_data.get('testTitle', 'Unknown')}")
    print(f"{'='*60}")
    
    for question in questions_data.get('questions', []):
        print(f"\nQuestion {question.get('id')}: {question.get('question')}")
        print("-" * 50)
        
        options = question.get('options', {})
        for option_key in ['A', 'B', 'C', 'D']:
            print(f"{option_key}. {options.get(option_key, 'N/A')}")
        
        print(f"\nCorrect Answer: {question.get('answer')}")
        print()

def save_questions_to_file(questions_data, filename="generated_questions.json"):
    """
    Save the generated questions to a JSON file
    
    Args:
        questions_data (dict): Questions data from the API
        filename (str): Output filename
    """
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(questions_data, f, indent=2, ensure_ascii=False)
        print(f"Questions saved to {filename}")
    except Exception as e:
        print(f"Error saving file: {e}")

def check_api_health():
    """
    Check if the API is running and healthy
    
    Returns:
        bool: True if API is healthy, False otherwise
    """
    try:
        response = requests.get("http://localhost:8001/health")
        if response.status_code == 200:
            health_data = response.json()
            print(f"API Status: {health_data.get('status')}")
            return health_data.get('status') == 'healthy'
        else:
            print(f"API health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("Error: Cannot connect to API. Make sure the server is running on http://localhost:8001")
        return False
    except Exception as e:
        print(f"Error checking API health: {e}")
        return False

def main():
    """
    Example usage of the Question Generator API
    """
    print("Question Generator API - Example Usage")
    print("=" * 50)
    
    # Check if API is running
    if not check_api_health():
        print("\nPlease start the API server first:")
        print("python -c \"import uvicorn; uvicorn.run('main:app', host='0.0.0.0', port=8001, reload=True)\"")
        return
    
    # Example 1: Generate questions from a PDF file
    print("\nExample 1: Generate questions from PDF")
    print("-" * 40)
    
    # You would replace this with your actual PDF file path
    pdf_path = "sample_document.pdf"
    
    # For demonstration, we'll show how to use the function
    print(f"Usage: generate_questions_from_pdf('{pdf_path}', num_questions=3, difficulty='easy')")
    print("\nNote: Replace 'sample_document.pdf' with your actual PDF file path")
    
    # Example 2: Different difficulty levels
    print("\nExample 2: Different difficulty levels")
    print("-" * 40)
    
    difficulties = ['easy', 'medium', 'hard']
    for difficulty in difficulties:
        print(f"For {difficulty} questions: difficulty='{difficulty}'")
    
    # Example 3: Custom test titles
    print("\nExample 3: Custom test titles")
    print("-" * 40)
    
    examples = [
        ("Chapter 1 Quiz", 5, "easy"),
        ("Midterm Exam", 10, "medium"),
        ("Final Assessment", 15, "hard")
    ]
    
    for title, num_q, diff in examples:
        print(f"Title: '{title}', Questions: {num_q}, Difficulty: {diff}")
    
    # Example 4: Complete workflow
    print("\nExample 4: Complete workflow")
    print("-" * 40)
    print("""
# Complete example workflow:

# 1. Generate questions
questions = generate_questions_from_pdf(
    pdf_path="your_document.pdf",
    num_questions=5,
    difficulty="medium",
    test_title="My Custom Test"
)

# 2. Display questions
if questions:
    display_questions(questions)
    
    # 3. Save to file
    save_questions_to_file(questions, "my_test.json")
    
    # 4. Access individual questions
    for question in questions['questions']:
        print(f"Q: {question['question']}")
        print(f"Answer: {question['answer']}")
""")
    
    print("\nAPI Documentation:")
    print("- Swagger UI: http://localhost:8001/docs")
    print("- ReDoc: http://localhost:8001/redoc")
    print("\nFor more examples, check the test_api.py file")

if __name__ == "__main__":
    main()