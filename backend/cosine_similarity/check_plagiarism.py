import os
from PdfToText import extract_text_from_pdf
from TextPreprocess import preprocess_text
from check_similarity import check_similarity

def check_plagiarism_for_submission(new_submission_path, previous_submissions):
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