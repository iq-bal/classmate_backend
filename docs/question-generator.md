# Question Generator

## Description
A FastAPI service for generating Multiple Choice Questions (MCQs) from PDF documents.

## Architecture

```mermaid
graph TD
    Client -->|PDF + params| FastAPI
    FastAPI -->|Auth| JWTValidation
    FastAPI -->|Extract Text| PyPDF2
    FastAPI -->|Generate MCQs| GeminiAI[Google Gemini]
```

## Key Features
- **Role-Based Access**: Teachers can generate questions efficiently.
- **difficulty levels**: Easy, Medium, Hard.
