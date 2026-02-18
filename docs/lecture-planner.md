# Lecture Planner

## Description
A FastAPI service that generates comprehensive lecture plans from PDF course materials using Gemini AI.

## Architecture

```mermaid
graph TD
    Client -->|PDF + params| FastAPI
    FastAPI -->|Extract Text| PyPDF2
    FastAPI -->|Generate Plan| GeminiAI[Google Gemini]
    GeminiAI -->|JSON| FastAPI
```

## Key Features
- **PDF Extraction**: Extracts text from uploaded course materials.
- **AI Planning**: Generates structured lecture plans with topics, objectives, and activities.
