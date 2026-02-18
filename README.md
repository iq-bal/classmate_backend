# Classmate Backend

Welcome to the Classmate Backend repository. This project consists of multiple microservices handling various aspects of the Classmate educational platform, including authentication, course management, real-time chat, and AI-powered features.

## 📂 Project Structure

This repository is organized into the following independent servers:

| Server | Directory | Description | Port |
| :--- | :--- | :--- | :--- |
| **Authentication** | `authentication-server/` | Handles user registration, login, and JWT management. | 6000 |
| **Backend (Core)** | `backend/` | Main REST & GraphQL API for courses, assignments, and users. | 4000 |
| **GraphQL/Chat** | `graphql-server/` | Real-time chat, attendance, and forum features. | 4001, 4002 |
| **Lecture Planner** | `lecture-planner/` | AI-powered lecture plan generator (FastAPI). | 8002 |
| **Question Generator**| `question-generator/`| AI-powered MCQ generator (FastAPI). | 8001 |
| **RAG Server** | `rag-server/` | RAG service for querying PDF knowledge bases (FastAPI). | 8000 |

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+
- **Python**: v3.9+
- **MongoDB**: Running instance
- **Redis**: Running instance
- **Firebase**: Service account credentials

### Installation

Each server handles its own dependencies. Please refer to the `README.md` within each directory or the `docs/` folder for specific setup instructions.

**General Setup:**
1.  Clone the repository.
2.  Set up environment variables by copying `.env.example` (if available) or creating `.env` files in each server directory.
3.  Install dependencies for the services you need to run.

## 📚 Documentation

Detailed documentation for each service and feature can be found in the `docs/` directory:

- **[Architecture Overview](docs/graphql-server/architecture-overview.md)**: High-level system design and database schema.
- **[Authentication Server](docs/authentication-server.md)**
- **[Backend Server](docs/backend.md)**
- **[GraphQL & Chat Server](docs/graphql-server.md)**
    - [Chat System Guide](docs/graphql-server/chat-system-guide.md)
    - [Attendance System Guide](docs/graphql-server/attendance-system-guide.md)
    - [Forum System Guide](docs/graphql-server/forum-system-guide.md)
- **[Lecture Planner](docs/lecture-planner.md)**
- **[Question Generator](docs/question-generator.md)**
- **[RAG Server](docs/rag-server.md)**

## 🤝 Contributing

Please ensure you follow the established code style and update documentation when making changes.
