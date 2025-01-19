from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chromadb
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAI
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.vectorstores.chroma import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.prompts import PromptTemplate
import google.generativeai as genai
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Configure Google Gemini
genai.configure(api_key=GOOGLE_API_KEY)

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define paths
PDF_PATH = os.path.join("test", "data", "cse-kuet.pdf")  # Update with your PDF filename

# Define custom prompt template
custom_prompt = PromptTemplate(
    template="""You are a helpful AI assistant that answers questions based on the provided context in English. 
    
Context: {context}

Question: {question}

Instructions:
1. Provide a detailed answer based solely on the context if available.
2. If the context is irrelevant, start with: "While this isn't directly addressed in the provided context," and provide your best understanding.
3. Always respond in English and avoid translating the question.
4. Maintain a professional and helpful tone.

Answer:""",
    input_variables=["context", "question"]
)

# Initialize embeddings
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Initialize vector store
vectorstore = None

# Initialize conversation memory
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True,
    output_key="answer"
)

# Initialize Gemini model
llm = GoogleGenerativeAI(
    model="gemini-pro",
    google_api_key=GOOGLE_API_KEY,
    temperature=0.7,
    top_p=0.8,
    top_k=40,
    max_output_tokens=2048,
    language="en"  # Force English
)

# Create conversation chain
conversation_chain = None

class Question(BaseModel):
    question: str

async def initialize_knowledge_base():
    """Initialize the knowledge base from the static PDF"""
    global vectorstore, conversation_chain

    try:
        logging.info(f"Loading PDF from: {PDF_PATH}")
        # Load and process the PDF
        loader = PyPDFLoader(PDF_PATH)
        pages = loader.load()

        if not pages:
            logging.error("No pages were loaded from the PDF.")
            return False

        # Log parsed content for debugging
        for i, page in enumerate(pages):
            logging.info(f"Page {i}: {page.page_content[:500]}")

        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,  # Smaller chunks for better retrieval
            chunk_overlap=200,  # More overlap for context
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        chunks = text_splitter.split_documents(pages)

        if not chunks:
            logging.error("No chunks were created from the document.")
            return False

        # Create vector store
        try:
            vectorstore = Chroma.from_documents(
                documents=chunks,
                embedding=embeddings,
                persist_directory="chroma_db"
            )
            logging.info(f"Number of documents in vector store: {len(vectorstore._collection.get())}")
        except Exception as e:
            logging.error(f"Error initializing vector store: {e}")
            return False

        # Create conversation chain
        conversation_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=vectorstore.as_retriever(search_kwargs={"k": 6}),  # Only 'k' is used
            memory=memory,
            combine_docs_chain_kwargs={"prompt": custom_prompt},
            return_source_documents=True,
            verbose=True,
            output_key="answer"
        )

        logging.info("Knowledge base initialized successfully")
        return True
    except Exception as e:
        logging.error(f"Error initializing knowledge base: {str(e)}", exc_info=True)
        return False

@app.on_event("startup")
async def startup_event():
    """Initialize the knowledge base when the server starts"""
    success = await initialize_knowledge_base()
    if not success:
        logging.warning("Failed to initialize the knowledge base. Please check logs for details.")

@app.post("/ask")
async def ask_question(question: Question):
    logging.info(f"Received question: {question.question}")
    global conversation_chain

    try:
        if not conversation_chain:
            logging.error("Conversation chain not initialized")
            return {
                "answer": "System is not properly initialized. Please try again later.",
                "context": "System error"
            }

        # Get response from conversation chain
        response = conversation_chain({"question": question.question})

        # Extract answer and source documents
        answer = response.get("answer", "No answer found")
        source_docs = response.get("source_documents", [])

        # Log retrieved contexts for debugging
        if source_docs:
            for i, doc in enumerate(source_docs):
                logging.info(f"Source Document {i}: {doc.page_content[:500]}")

        # Process context
        if source_docs:
            contexts = [doc.page_content for doc in source_docs[:2]]
            context = "\n\nRelevant Context:\n" + "\n---\n".join(contexts)
        else:
            context = "No relevant context found in the document."

        if not answer.strip():
            answer = "I'm sorry, but I couldn't find an answer in the provided context."

        logging.info(f"Answer generated: {answer}")
        return {
            "answer": answer,
            "context": context[:300] + "..." if len(context) > 300 else context
        }

    except Exception as e:
        logging.error(f"Error in ask_question: {str(e)}", exc_info=True)
        return {
            "answer": "An error occurred while processing your request. Please try again.",
            "context": "Error details logged"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
