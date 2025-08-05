#!/usr/bin/env python3
"""
JWT Token Generator for Testing
This script generates a test JWT token with teacher role for API testing
"""

import jwt
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def generate_test_token(user_id="test_teacher", role="teacher", expires_in_hours=24):
    """
    Generate a test JWT token with teacher role
    
    Args:
        user_id (str): User identifier
        role (str): User role (should be 'teacher' for API access)
        expires_in_hours (int): Token expiration time in hours
    
    Returns:
        str: JWT token
    """
    
    # Get the secret from environment
    secret = os.getenv("ACCESS_TOKEN_SECRET")
    if not secret:
        raise ValueError("ACCESS_TOKEN_SECRET not found in environment variables")
    
    # Create payload
    now = datetime.utcnow()
    payload = {
        "user_id": user_id,
        "role": role,
        "iat": now,
        "exp": now + timedelta(hours=expires_in_hours)
    }
    
    # Generate token
    token = jwt.encode(payload, secret, algorithm="HS256")
    
    return token

def verify_token(token):
    """
    Verify a JWT token
    
    Args:
        token (str): JWT token to verify
    
    Returns:
        dict: Decoded payload if valid
    """
    
    secret = os.getenv("ACCESS_TOKEN_SECRET")
    if not secret:
        raise ValueError("ACCESS_TOKEN_SECRET not found in environment variables")
    
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        print("Token has expired")
        return None
    except jwt.InvalidTokenError:
        print("Invalid token")
        return None

def main():
    """
    Generate and display test tokens
    """
    print("JWT Token Generator for Question Generator API")
    print("=" * 50)
    
    try:
        # Generate teacher token
        teacher_token = generate_test_token(
            user_id="teacher_123",
            role="teacher",
            expires_in_hours=24
        )
        
        print("\n✅ Teacher Token Generated:")
        print(f"Token: {teacher_token}")
        
        # Verify the token
        payload = verify_token(teacher_token)
        if payload:
            print("\n📋 Token Payload:")
            print(f"User ID: {payload.get('user_id')}")
            print(f"Role: {payload.get('role')}")
            print(f"Issued At: {datetime.fromtimestamp(payload.get('iat'))}")
            print(f"Expires At: {datetime.fromtimestamp(payload.get('exp'))}")
        
        # Generate student token (for testing access denial)
        student_token = generate_test_token(
            user_id="student_456",
            role="student",
            expires_in_hours=24
        )
        
        print("\n❌ Student Token (Should be denied access):")
        print(f"Token: {student_token}")
        
        print("\n" + "=" * 50)
        print("Usage Examples:")
        print("=" * 50)
        
        print("\n1. Test with teacher token (should work):")
        print(f'curl -X POST "http://localhost:8001/generate-questions" \\')
        print(f'  -H "Authorization: Bearer {teacher_token}" \\')
        print(f'  -H "Content-Type: multipart/form-data" \\')
        print(f'  -F "file=@sample.pdf" \\')
        print(f'  -F "num_questions=3"')
        
        print("\n2. Test with student token (should fail):")
        print(f'curl -X POST "http://localhost:8001/generate-questions" \\')
        print(f'  -H "Authorization: Bearer {student_token}" \\')
        print(f'  -H "Content-Type: multipart/form-data" \\')
        print(f'  -F "file=@sample.pdf" \\')
        print(f'  -F "num_questions=3"')
        
        print("\n3. Test without token (should fail):")
        print(f'curl -X POST "http://localhost:8001/generate-questions" \\')
        print(f'  -H "Content-Type: multipart/form-data" \\')
        print(f'  -F "file=@sample.pdf" \\')
        print(f'  -F "num_questions=3"')
        
        print("\n💡 Tips:")
        print("- Copy the teacher token for testing the API")
        print("- The token is valid for 24 hours")
        print("- Use the student token to test access denial")
        print("- Check the API documentation at http://localhost:8001/docs")
        
    except Exception as e:
        print(f"Error: {e}")
        print("\nMake sure:")
        print("1. The .env file exists with ACCESS_TOKEN_SECRET")
        print("2. PyJWT is installed: pip install PyJWT")

if __name__ == "__main__":
    main()