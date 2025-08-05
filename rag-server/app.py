import streamlit as st
import PyPDF2
import google.generativeai as genai
import os
from io import BytesIO
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    st.error("GEMINI_API_KEY environment variable is required. Please check your .env file.")
    st.stop()
genai.configure(api_key=api_key)

def extract_text_from_pdf(pdf_file):
    """Extract text from uploaded PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        st.error(f"Error reading PDF: {str(e)}")
        return None

def get_ai_response(question, context):
    """Get response from Gemini AI based on the question and PDF context"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Based on the following document content, please answer the question.
        If the answer is not found in the document, please say so.
        
        Document Content:
        {context}
        
        Question: {question}
        
        Answer:
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        st.error(f"Error getting AI response: {str(e)}")
        return None

def main():
    st.set_page_config(
        page_title="PDF Knowledge Base AI Agent",
        page_icon="📚",
        layout="wide"
    )
    
    st.title("📚 PDF Knowledge Base AI Agent")
    st.markdown("Upload a PDF document and ask questions about its content!")
    
    # Initialize session state
    if 'pdf_text' not in st.session_state:
        st.session_state.pdf_text = None
    if 'pdf_name' not in st.session_state:
        st.session_state.pdf_name = None
    
    # Sidebar for PDF upload
    with st.sidebar:
        st.header("📄 Upload PDF")
        uploaded_file = st.file_uploader(
            "Choose a PDF file",
            type="pdf",
            help="Upload a PDF document to use as your knowledge base"
        )
        
        if uploaded_file is not None:
            if st.button("Process PDF", type="primary"):
                with st.spinner("Extracting text from PDF..."):
                    pdf_text = extract_text_from_pdf(uploaded_file)
                    if pdf_text:
                        st.session_state.pdf_text = pdf_text
                        st.session_state.pdf_name = uploaded_file.name
                        st.success(f"✅ Successfully processed: {uploaded_file.name}")
                        st.info(f"Extracted {len(pdf_text)} characters")
    
    # Main content area
    if st.session_state.pdf_text:
        st.success(f"📖 Knowledge Base: {st.session_state.pdf_name}")
        
        # Question input
        st.header("❓ Ask a Question")
        question = st.text_input(
            "Enter your question about the PDF content:",
            placeholder="What is this document about?"
        )
        
        if st.button("Get Answer", type="primary") and question:
            with st.spinner("Thinking..."):
                answer = get_ai_response(question, st.session_state.pdf_text)
                if answer:
                    st.header("💡 Answer")
                    st.write(answer)
        
        # Display PDF preview (first 1000 characters)
        with st.expander("📋 PDF Content Preview"):
            preview_text = st.session_state.pdf_text[:1000]
            if len(st.session_state.pdf_text) > 1000:
                preview_text += "..."
            st.text_area(
                "Content Preview",
                value=preview_text,
                height=200,
                disabled=True
            )
    else:
        st.info("👈 Please upload a PDF file from the sidebar to get started!")
        
        # Instructions
        st.header("📋 How to Use")
        st.markdown("""
        1. **Upload PDF**: Use the sidebar to upload your PDF document
        2. **Process**: Click "Process PDF" to extract text from the document
        3. **Ask Questions**: Enter questions about the PDF content
        4. **Get Answers**: The AI will provide answers based on the document
        
        **Features:**
        - 📄 PDF text extraction
        - 🤖 AI-powered question answering
        - 📖 Document preview
        - 💾 Session-based knowledge base
        """)

if __name__ == "__main__":
    main()