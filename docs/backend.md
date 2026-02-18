# Backend Server

## Description
The main backend server for the Classmate application. It handles core logic for courses, enrollments, assignments, and submissions using both REST and GraphQL APIs.

## Architecture

```mermaid
graph TD
    Client -->|HTTP/GraphQL| ExpressServer
    ExpressServer -->|REST API| AssignmentRoutes
    ExpressServer -->|GraphQL API| GraphQLMiddleware
    GraphQLMiddleware -->|Resolvers| Controllers
    Controllers -->|Data Access| MongoDB[(MongoDB)]
    AssignmentRoutes -->|Data Access| MongoDB
```

## Key Features
- **GraphQL API**: `/graphql` for querying courses, users, etc.
- **REST API**: `/api/v1/` for specific assignment actions.
- **Middleware**: Authentication and role-based access control (Student/Teacher).

## Setup
1. `npm install`
2. `npm run dev`
