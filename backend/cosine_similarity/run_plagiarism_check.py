import sys
import os
import re
import PyPDF2
import nltk
import ssl
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Configure SSL for NLTK downloads
ssl._create_default_https_context = ssl._create_unverified_context

# Download required NLTK data
nltk.download('punkt')
nltk.download('stopwords')
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

def extract_text_from_pdf(file_path):
    """Extract text from a PDF file.
    
    Args:
        file_path (str): Path to the PDF file
        
    Returns:
        str: Extracted text from the PDF
    """
    try:
        if not os.path.exists(file_path):
            print(f"Error: PDF file not found at path: {file_path}")
            return ""
        
        if not file_path.lower().endswith('.pdf'):
            print(f"Error: File {file_path} is not a PDF file")
            return ""
            
        with open(file_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            
            if len(reader.pages) == 0:
                print(f"Error: PDF file {file_path} has no pages")
                return ""
                
            text = ""
            for page_num, page in enumerate(reader.pages):
                try:
                    page_text = page.extract_text()
                    text += page_text + "\n"
                except Exception as e:
                    print(f"Error extracting text from page {page_num + 1}: {str(e)}")
                    continue
            
            return text
            
    except PyPDF2.PdfReadError as e:
        print(f"Error reading PDF file {file_path}: {str(e)}")
        return ""
    except Exception as e:
        print(f"Unexpected error processing PDF file {file_path}: {str(e)}")
        return ""

def preprocess_text(text):
    """Preprocess the extracted text for similarity comparison.
    
    Args:
        text (str): Raw text to preprocess
        
    Returns:
        str: Preprocessed text
    """
    # Lowercase and remove special characters
    text = re.sub(r"[^a-zA-Z0-9\s]", "", text.lower())
    # Tokenize and remove stopwords
    tokens = word_tokenize(text)
    tokens = [word for word in tokens if word not in stopwords.words("english")]
    return " ".join(tokens)

def check_similarity(text1, text2):
    """Calculate cosine similarity between two texts.
    
    Args:
        text1 (str): First text for comparison
        text2 (str): Second text for comparison
        
    Returns:
        float: Similarity score between 0 and 1
    """
    # Validate inputs and provide detailed logging
    if not text1 or not text2:
        print("Warning: Null text provided for similarity check")
        return 0.0
    
    text1, text2 = str(text1).strip(), str(text2).strip()
    if not text1 or not text2:
        print("Warning: Empty text provided for similarity check")
        return 0.0
        
    try:
        # Create TF-IDF vectors
        vectorizer = TfidfVectorizer(min_df=1, stop_words='english')
        vectors = vectorizer.fit_transform([text1, text2])
        
        # Check if vectors are valid for similarity calculation
        if vectors.shape[1] == 0:
            print("Warning: No valid terms found in texts after vectorization")
            print(f"Text1 length: {len(text1)}, Text2 length: {len(text2)}")
            print(f"Sample text1: {text1[:100]}")
            print(f"Sample text2: {text2[:100]}")
            return 0.0
            
        similarity = cosine_similarity(vectors[0], vectors[1])
        similarity_score = float(similarity[0][0])
        return similarity_score
    except Exception as e:
        print(f"Error calculating similarity: {str(e)}")
        return 0.0

def check_plagiarism_for_submission(new_submission_path, previous_submissions):
    """Check plagiarism for a new submission against previous submissions.
    
    Args:
        new_submission_path (str): Path to the new submission PDF
        previous_submissions (list): List of paths to previous submission PDFs
        
    Returns:
        float: Plagiarism score as a percentage
    """
    # Extract and preprocess text from new submission
    print(f"Processing new submission: {new_submission_path}")
    new_text = extract_text_from_pdf(new_submission_path)
    print(f"Extracted text length: {len(new_text)} characters")
    print(f"Sample of extracted text: {new_text[:200]}...")
    
    new_text_processed = preprocess_text(new_text)
    print(f"Processed text length: {len(new_text_processed)} characters")
    print(f"Sample of processed text: {new_text_processed[:200]}...")
    
    # If no previous submissions, return 0
    if not previous_submissions:
        return 0
    
    # Calculate similarity with each previous submission
    max_similarity = 0
    for submission_path in previous_submissions:
        try:
            # Extract and preprocess text from previous submission
            prev_text = extract_text_from_pdf(submission_path)
            prev_text_processed = preprocess_text(prev_text)
            
            # Calculate similarity
            print(f"\nComparing with submission: {submission_path}")
            print(f"Previous submission processed text length: {len(prev_text_processed)} characters")
            print(f"Previous submission sample: {prev_text_processed[:200]}...")
            
            similarity = check_similarity(new_text_processed, prev_text_processed)
            print(f"Calculated similarity score: {similarity}")
            
            max_similarity = max(max_similarity, similarity)
        except Exception as e:
            print(f"Error processing submission {submission_path}: {str(e)}")
            continue
    
    # Convert similarity to percentage
    return round(max_similarity * 100, 2)

def validate_file_paths(paths):
    """Validate that all provided file paths exist and are PDF files."""
    invalid_paths = []
    for path in paths:
        if not os.path.exists(path):
            invalid_paths.append(f"File not found: {path}")
        elif not path.lower().endswith('.pdf'):
            invalid_paths.append(f"Not a PDF file: {path}")
    return invalid_paths

def main():
    if len(sys.argv) < 2:
        print("Error: No submission paths provided", file=sys.stderr)
        sys.exit(1)
    
    # First argument is the new submission
    new_submission_path = sys.argv[1]
    
    # Remaining arguments are previous submissions
    previous_submissions = sys.argv[2:] if len(sys.argv) > 2 else []
    
    # Validate all file paths
    all_paths = [new_submission_path] + previous_submissions
    invalid_paths = validate_file_paths(all_paths)
    
    if invalid_paths:
        print("Error: Invalid file paths detected:", file=sys.stderr)
        for error in invalid_paths:
            print(f"  {error}", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Run plagiarism check
        plagiarism_score = check_plagiarism_for_submission(new_submission_path, previous_submissions)
        
        # Print score to stdout (will be captured by Node.js)
        # Format the output as a single line with just the score
        print(f"{plagiarism_score}", flush=True)
        sys.exit(0)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()