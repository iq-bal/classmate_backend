#!/usr/bin/env python3
"""
Test script for the PDF Knowledge Base AI Agent API

This script demonstrates how to interact with the FastAPI endpoints:
1. Upload a PDF document
2. Ask questions about the document
3. List knowledge bases
4. Get knowledge base details
5. Delete knowledge bases

Usage:
    python test_api.py

Note: Make sure the FastAPI server is running on http://localhost:8000
"""

import requests
import json
import time
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

BASE_URL = "http://localhost:8000"

def create_sample_pdf():
    """Create a sample PDF for testing"""
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # Add content to the PDF
    p.drawString(100, 750, "Sample Document for Testing")
    p.drawString(100, 720, "This is a test document created for the PDF Knowledge Base AI Agent.")
    p.drawString(100, 690, "")
    p.drawString(100, 660, "Key Information:")
    p.drawString(120, 630, "• This document contains information about artificial intelligence")
    p.drawString(120, 600, "• AI agents can process and understand text documents")
    p.drawString(120, 570, "• Machine learning enables intelligent question answering")
    p.drawString(120, 540, "• Natural language processing helps extract meaning from text")
    p.drawString(100, 510, "")
    p.drawString(100, 480, "Conclusion:")
    p.drawString(100, 450, "This sample document demonstrates the capabilities of PDF processing")
    p.drawString(100, 420, "and AI-powered question answering systems.")
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return buffer

def test_health_check():
    """Test the health check endpoint"""
    print("\n=== Testing Health Check ===")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed")
            print(f"   Status: {data['status']}")
            print(f"   Gemini AI: {data['gemini_ai_status']}")
            print(f"   Knowledge bases: {data['knowledge_bases_count']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_upload_pdf():
    """Test PDF upload endpoint"""
    print("\n=== Testing PDF Upload ===")
    try:
        # Create a sample PDF
        pdf_buffer = create_sample_pdf()
        
        # Upload the PDF
        files = {"file": ("sample_document.pdf", pdf_buffer, "application/pdf")}
        response = requests.post(f"{BASE_URL}/upload-pdf", files=files)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ PDF uploaded successfully")
            print(f"   ID: {data['id']}")
            print(f"   Filename: {data['filename']}")
            print(f"   Text length: {data['text_length']} characters")
            print(f"   Status: {data['status']}")
            return data['id']
        else:
            print(f"❌ PDF upload failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
    except Exception as e:
        print(f"❌ PDF upload error: {e}")
        return None

def test_ask_question(kb_id, question):
    """Test question asking endpoint"""
    print(f"\n=== Testing Question: '{question}' ===")
    try:
        data = {
            "question": question,
            "knowledge_base_id": kb_id
        }
        response = requests.post(f"{BASE_URL}/ask", json=data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Question answered successfully")
            print(f"   Question: {result['question']}")
            print(f"   Answer: {result['answer']}")
            return True
        else:
            print(f"❌ Question failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Question error: {e}")
        return False

def test_list_knowledge_bases():
    """Test listing knowledge bases"""
    print("\n=== Testing List Knowledge Bases ===")
    try:
        response = requests.get(f"{BASE_URL}/knowledge-bases")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Knowledge bases listed successfully")
            print(f"   Total count: {len(data)}")
            for kb in data:
                print(f"   - {kb['filename']} (ID: {kb['id'][:8]}..., {kb['text_length']} chars)")
            return data
        else:
            print(f"❌ List failed: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ List error: {e}")
        return []

def test_get_knowledge_base(kb_id):
    """Test getting knowledge base details"""
    print(f"\n=== Testing Get Knowledge Base Details ===")
    try:
        response = requests.get(f"{BASE_URL}/knowledge-bases/{kb_id}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Knowledge base details retrieved")
            print(f"   ID: {data['id']}")
            print(f"   Filename: {data['filename']}")
            print(f"   Upload time: {data['upload_time']}")
            print(f"   Text length: {data['text_length']}")
            print(f"   Status: {data['status']}")
            return True
        else:
            print(f"❌ Get details failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get details error: {e}")
        return False

def test_get_preview(kb_id):
    """Test getting knowledge base preview"""
    print(f"\n=== Testing Get Knowledge Base Preview ===")
    try:
        response = requests.get(f"{BASE_URL}/knowledge-bases/{kb_id}/preview?chars=200")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Knowledge base preview retrieved")
            print(f"   Preview length: {data['preview_length']} chars")
            print(f"   Total length: {data['total_length']} chars")
            print(f"   Preview: {data['preview'][:100]}...")
            return True
        else:
            print(f"❌ Get preview failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get preview error: {e}")
        return False

def test_delete_knowledge_base(kb_id):
    """Test deleting knowledge base"""
    print(f"\n=== Testing Delete Knowledge Base ===")
    try:
        response = requests.delete(f"{BASE_URL}/knowledge-bases/{kb_id}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Knowledge base deleted successfully")
            print(f"   Message: {data['message']}")
            return True
        else:
            print(f"❌ Delete failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Delete error: {e}")
        return False

def main():
    """Run all API tests"""
    print("🚀 Starting PDF Knowledge Base AI Agent API Tests")
    print(f"📡 Base URL: {BASE_URL}")
    
    # Test health check
    if not test_health_check():
        print("\n❌ Health check failed. Make sure the server is running.")
        return
    
    # Test PDF upload
    kb_id = test_upload_pdf()
    if not kb_id:
        print("\n❌ PDF upload failed. Cannot continue with other tests.")
        return
    
    # Test listing knowledge bases
    test_list_knowledge_bases()
    
    # Test getting knowledge base details
    test_get_knowledge_base(kb_id)
    
    # Test getting preview
    test_get_preview(kb_id)
    
    # Test asking questions
    questions = [
        "What is this document about?",
        "What information does this document contain about AI?",
        "What is mentioned about machine learning?",
        "What is the conclusion of this document?"
    ]
    
    for question in questions:
        test_ask_question(kb_id, question)
        time.sleep(1)  # Small delay between questions
    
    # Test deleting knowledge base
    test_delete_knowledge_base(kb_id)
    
    # Verify deletion
    print("\n=== Verifying Deletion ===")
    final_list = test_list_knowledge_bases()
    
    print("\n🎉 All API tests completed!")
    print("\n📚 API Documentation available at:")
    print(f"   Swagger UI: {BASE_URL}/docs")
    print(f"   ReDoc: {BASE_URL}/redoc")

if __name__ == "__main__":
    main()