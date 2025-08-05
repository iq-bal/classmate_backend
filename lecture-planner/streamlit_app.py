import streamlit as st
import requests
import json
from datetime import datetime, timedelta
import io

# Configure Streamlit page
st.set_page_config(
    page_title="Lecture Plan Generator",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
.main-header {
    font-size: 3rem;
    color: #1f77b4;
    text-align: center;
    margin-bottom: 2rem;
}
.sub-header {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 1rem;
}
.info-box {
    background-color: #f0f2f6;
    padding: 1rem;
    border-radius: 0.5rem;
    margin: 1rem 0;
}
.success-box {
    background-color: #d4edda;
    color: #155724;
    padding: 1rem;
    border-radius: 0.5rem;
    margin: 1rem 0;
}
.error-box {
    background-color: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 0.5rem;
    margin: 1rem 0;
}
</style>
""", unsafe_allow_html=True)

# API Configuration
API_BASE_URL = "http://localhost:8002"

def call_api(endpoint, method="GET", files=None, data=None):
    """Make API calls to the FastAPI backend"""
    try:
        url = f"{API_BASE_URL}{endpoint}"
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, files=files, data=data)
        
        if response.status_code == 200:
            return True, response.json()
        else:
            return False, response.json() if response.content else {"detail": "Unknown error"}
    except requests.exceptions.ConnectionError:
        return False, {"detail": "Cannot connect to API server. Make sure the FastAPI server is running on port 8002."}
    except Exception as e:
        return False, {"detail": str(e)}

def format_lecture_plan(plan):
    """Format the lecture plan for display"""
    st.markdown("### 📅 Lecture Information")
    col1, col2 = st.columns(2)
    
    with col1:
        st.write(f"**Date:** {plan.get('date', 'N/A')}")
        st.write(f"**Day:** {plan.get('day_of_week', 'N/A')}")
        st.write(f"**Time:** {plan.get('lecture_time', 'N/A')}")
    
    with col2:
        st.write(f"**Course:** {plan.get('course_name', 'N/A')}")
        st.write(f"**Instructor:** {plan.get('instructor', 'N/A')}")
    
    st.markdown("---")
    
    # Topics Covered
    st.markdown("### 📖 Topics Covered")
    for i, topic in enumerate(plan.get('topics_covered', []), 1):
        with st.expander(f"Topic {i}: {topic.get('topic', 'Untitled Topic')}"):
            
            st.markdown("**Subtopics:**")
            for subtopic in topic.get('subtopics', []):
                st.write(f"• {subtopic}")
            
            st.markdown("**Learning Objectives:**")
            for objective in topic.get('learning_objectives', []):
                st.write(f"• {objective}")
            
            st.markdown("**Activities:**")
            for activity in topic.get('activities', []):
                st.write(f"• {activity}")
    
    st.markdown("---")
    
    # Assignments
    st.markdown("### 📝 Assignments")
    if plan.get('assignments'):
        for assignment in plan.get('assignments', []):
            st.markdown(f"**{assignment.get('title', 'Untitled Assignment')}**")
            st.write(f"Due Date: {assignment.get('due_date', 'N/A')}")
            st.write(f"Details: {assignment.get('details', 'No details provided')}")
            st.markdown("")
    else:
        st.write("No assignments specified.")
    
    st.markdown("---")
    
    # Resources
    st.markdown("### 📚 Resources")
    if plan.get('resources'):
        for resource in plan.get('resources', []):
            st.markdown(f"**{resource.get('title', 'Untitled Resource')}**")
            st.write(f"Type: {resource.get('type', 'N/A')}")
            if resource.get('chapter'):
                st.write(f"Chapter: {resource.get('chapter')}")
            if resource.get('link'):
                st.write(f"Link: {resource.get('link')}")
            st.markdown("")
    else:
        st.write("No resources specified.")
    
    st.markdown("---")
    
    # Notes
    st.markdown("### 📌 Notes")
    if plan.get('notes'):
        for note in plan.get('notes', []):
            st.write(f"• {note}")
    else:
        st.write("No notes provided.")

def main():
    # Header
    st.markdown('<h1 class="main-header">📚 Lecture Plan Generator</h1>', unsafe_allow_html=True)
    st.markdown('<p style="text-align: center; font-size: 1.2rem; color: #666;">Generate comprehensive lecture plans from PDF knowledge bases using AI</p>', unsafe_allow_html=True)
    
    # Sidebar
    with st.sidebar:
        st.markdown("### 🔧 Configuration")
        
        # API Health Check
        st.markdown("#### API Status")
        if st.button("Check API Health"):
            success, response = call_api("/health")
            if success:
                st.success("✅ API is healthy")
            else:
                st.error(f"❌ API Error: {response.get('detail', 'Unknown error')}")
        
        st.markdown("---")
        
        # Sample Response
        st.markdown("#### Sample Response")
        if st.button("View Sample Format"):
            success, sample = call_api("/sample-response")
            if success:
                st.json(sample)
            else:
                st.error(f"Error: {sample.get('detail', 'Unknown error')}")
    
    # Main content
    st.markdown("### 📤 Upload Course Material")
    
    # File upload
    uploaded_file = st.file_uploader(
        "Choose a PDF file",
        type="pdf",
        help="Upload a PDF containing course material or textbook content"
    )
    
    # Course information form
    st.markdown("### 📋 Course Information")
    
    col1, col2 = st.columns(2)
    
    with col1:
        course_name = st.text_input(
            "Course Name",
            placeholder="e.g., Introduction to Computer Science",
            help="Enter the name of the course"
        )
        
        instructor = st.text_input(
            "Instructor Name",
            placeholder="e.g., Dr. John Doe",
            help="Enter the instructor's name"
        )
    
    with col2:
        lecture_date = st.date_input(
            "Lecture Date",
            value=datetime.now().date(),
            help="Select the date for the lecture"
        )
        
        lecture_time = st.text_input(
            "Lecture Time",
            placeholder="e.g., 10:00 AM - 12:00 PM",
            help="Enter the time slot for the lecture"
        )
    
    # Generate button
    st.markdown("---")
    
    if st.button("🚀 Generate Lecture Plan", type="primary", use_container_width=True):
        # Validation
        if not uploaded_file:
            st.error("Please upload a PDF file.")
            return
        
        if not all([course_name, instructor, lecture_time]):
            st.error("Please fill in all course information fields.")
            return
        
        # Show loading spinner
        with st.spinner("Generating lecture plan... This may take a few moments."):
            # Prepare data for API call
            files = {"pdf_file": (uploaded_file.name, uploaded_file.getvalue(), "application/pdf")}
            data = {
                "course_name": course_name,
                "instructor": instructor,
                "lecture_date": lecture_date.strftime("%Y-%m-%d"),
                "lecture_time": lecture_time
            }
            
            # Call API
            success, response = call_api("/generate-lecture-plan", method="POST", files=files, data=data)
            
            if success:
                st.success("✅ Lecture plan generated successfully!")
                st.markdown("---")
                
                # Display the lecture plan
                format_lecture_plan(response)
                
                # Download option
                st.markdown("---")
                st.markdown("### 💾 Download")
                
                json_str = json.dumps(response, indent=2)
                st.download_button(
                    label="📥 Download as JSON",
                    data=json_str,
                    file_name=f"lecture_plan_{lecture_date.strftime('%Y%m%d')}.json",
                    mime="application/json"
                )
                
            else:
                st.error(f"❌ Error generating lecture plan: {response.get('detail', 'Unknown error')}")
    
    # Footer
    st.markdown("---")
    st.markdown(
        '<p style="text-align: center; color: #666; font-size: 0.9rem;">'
        'Powered by FastAPI, Streamlit, and Google Gemini AI'
        '</p>',
        unsafe_allow_html=True
    )

if __name__ == "__main__":
    main()