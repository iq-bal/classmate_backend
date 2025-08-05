import streamlit as st
import requests
import json
import os
from typing import Optional
import time

# Configure Streamlit page
st.set_page_config(
    page_title="Question Generator",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
.main-header {
    font-size: 2.5rem;
    color: #1f77b4;
    text-align: center;
    margin-bottom: 2rem;
}
.success-box {
    padding: 1rem;
    border-radius: 0.5rem;
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
    margin: 1rem 0;
}
.error-box {
    padding: 1rem;
    border-radius: 0.5rem;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
    margin: 1rem 0;
}
.question-card {
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border-left: 4px solid #007bff;
    margin: 1rem 0;
}
</style>
""", unsafe_allow_html=True)

# Configuration
API_BASE_URL = "http://localhost:8001"

def check_api_health():
    """Check if the API server is running"""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False

def generate_questions_api(file, num_questions: int, difficulty: str, test_title: str):
    """Call the API to generate questions from PDF"""
    try:
        files = {"file": (file.name, file.getvalue(), "application/pdf")}
        data = {
            "num_questions": num_questions,
            "difficulty": difficulty,
            "test_title": test_title
        }
        
        # Using the public endpoint that doesn't require authentication
        response = requests.post(
            f"{API_BASE_URL}/generate-questions-public",
            files=files,
            data=data,
            timeout=60
        )
        
        if response.status_code == 200:
            return response.json(), None
        else:
            return None, f"API Error: {response.status_code} - {response.text}"
            
    except requests.exceptions.RequestException as e:
        return None, f"Connection Error: {str(e)}"

def display_question(question_data, index):
    """Display a single question in a formatted card"""
    with st.container():
        st.markdown(f'<div class="question-card">', unsafe_allow_html=True)
        
        # Question header
        st.markdown(f"**Question {index + 1}:**")
        st.markdown(f"*{question_data.get('question', 'N/A')}*")
        
        # Options
        st.markdown("**Options:**")
        options = question_data.get('options', {})
        for key, value in options.items():
            st.markdown(f"- **{key.upper()}:** {value}")
        
        # Correct answer
        correct_answer = question_data.get('correct_answer', 'N/A')
        st.markdown(f"**✅ Correct Answer:** {correct_answer}")
        
        # Explanation if available
        if 'explanation' in question_data and question_data['explanation']:
            st.markdown(f"**💡 Explanation:** {question_data['explanation']}")
        
        st.markdown('</div>', unsafe_allow_html=True)
        st.markdown("---")

def main():
    # Header
    st.markdown('<h1 class="main-header">📚 Question Generator</h1>', unsafe_allow_html=True)
    st.markdown("Generate multiple-choice questions from PDF documents using AI")
    
    # Sidebar for configuration
    with st.sidebar:
        st.header("⚙️ Configuration")
        
        # API Health Check
        st.subheader("🔍 API Status")
        if st.button("Check API Health"):
            if check_api_health():
                st.success("✅ API is running")
            else:
                st.error("❌ API is not accessible")
                st.info(f"Make sure the API server is running at {API_BASE_URL}")
        
        st.markdown("---")
        
        # Question Generation Settings
        st.subheader("📝 Question Settings")
        num_questions = st.slider(
            "Number of Questions",
            min_value=1,
            max_value=20,
            value=5,
            help="How many questions to generate"
        )
        
        difficulty = st.selectbox(
            "Difficulty Level",
            options=["easy", "medium", "hard"],
            index=1,
            help="Choose the difficulty level for questions"
        )
        
        test_title = st.text_input(
            "Test Title",
            value="Generated Quiz",
            help="Title for the generated test"
        )
        
        st.markdown("---")
        
        # Export Options
        st.subheader("💾 Export Options")
        export_format = st.selectbox(
            "Export Format",
            options=["JSON", "Text"],
            help="Choose format for downloading results"
        )
    
    # Main content area
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("📄 Upload PDF")
        uploaded_file = st.file_uploader(
            "Choose a PDF file",
            type="pdf",
            help="Upload a PDF document to generate questions from"
        )
        
        if uploaded_file is not None:
            st.success(f"✅ File uploaded: {uploaded_file.name}")
            st.info(f"File size: {len(uploaded_file.getvalue())} bytes")
            
            # Generate button
            if st.button("🚀 Generate Questions", type="primary"):
                if not check_api_health():
                    st.error("❌ API server is not running. Please start the API server first.")
                    st.code("python main.py", language="bash")
                else:
                    with st.spinner("🤖 Generating questions... This may take a moment."):
                        result, error = generate_questions_api(
                            uploaded_file, num_questions, difficulty, test_title
                        )
                        
                        if result:
                            st.session_state['questions'] = result
                            st.success("✅ Questions generated successfully!")
                        else:
                            st.error(f"❌ Failed to generate questions: {error}")
                            if "401" in str(error) or "403" in str(error):
                                st.info("💡 Note: This Streamlit app bypasses authentication for demo purposes.")
    
    with col2:
        st.subheader("📋 Generated Questions")
        
        if 'questions' in st.session_state:
            questions_data = st.session_state['questions']
            
            # Display test info
            if 'test_title' in questions_data:
                st.markdown(f"**Test Title:** {questions_data['test_title']}")
            if 'difficulty' in questions_data:
                st.markdown(f"**Difficulty:** {questions_data['difficulty'].title()}")
            if 'total_questions' in questions_data:
                st.markdown(f"**Total Questions:** {questions_data['total_questions']}")
            
            st.markdown("---")
            
            # Display questions
            questions = questions_data.get('questions', [])
            if questions:
                for i, question in enumerate(questions):
                    display_question(question, i)
                
                # Export functionality
                st.subheader("💾 Export Results")
                
                if export_format == "JSON":
                    json_str = json.dumps(questions_data, indent=2)
                    st.download_button(
                        label="📥 Download as JSON",
                        data=json_str,
                        file_name=f"{test_title.replace(' ', '_')}_questions.json",
                        mime="application/json"
                    )
                else:
                    # Text format
                    text_content = f"Test Title: {questions_data.get('test_title', 'N/A')}\n"
                    text_content += f"Difficulty: {questions_data.get('difficulty', 'N/A')}\n"
                    text_content += f"Total Questions: {len(questions)}\n\n"
                    
                    for i, q in enumerate(questions):
                        text_content += f"Question {i + 1}: {q.get('question', 'N/A')}\n"
                        options = q.get('options', {})
                        for key, value in options.items():
                            text_content += f"  {key.upper()}: {value}\n"
                        text_content += f"Correct Answer: {q.get('correct_answer', 'N/A')}\n"
                        if q.get('explanation'):
                            text_content += f"Explanation: {q.get('explanation')}\n"
                        text_content += "\n" + "-"*50 + "\n\n"
                    
                    st.download_button(
                        label="📥 Download as Text",
                        data=text_content,
                        file_name=f"{test_title.replace(' ', '_')}_questions.txt",
                        mime="text/plain"
                    )
            else:
                st.info("No questions found in the response.")
        else:
            st.info("👆 Upload a PDF file and click 'Generate Questions' to get started!")
            
            # Sample usage instructions
            with st.expander("📖 How to use this app"):
                st.markdown("""
                1. **Start the API Server**: Make sure the FastAPI server is running:
                   ```bash
                   python main.py
                   ```
                
                2. **Upload PDF**: Choose a PDF file containing the content you want to generate questions from.
                
                3. **Configure Settings**: Use the sidebar to set:
                   - Number of questions (1-20)
                   - Difficulty level (easy/medium/hard)
                   - Test title
                
                4. **Generate Questions**: Click the "Generate Questions" button and wait for the AI to process your document.
                
                5. **Review & Export**: Review the generated questions and export them in JSON or text format.
                
                **Note**: This Streamlit interface provides a user-friendly way to interact with the Question Generator API without requiring authentication tokens.
                """)
    
    # Footer
    st.markdown("---")
    st.markdown(
        "<div style='text-align: center; color: #666;'>"  
        "🤖 Powered by Gemini AI | Built with Streamlit & FastAPI"  
        "</div>", 
        unsafe_allow_html=True
    )

if __name__ == "__main__":
    main()