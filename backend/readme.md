/project-root
│
├── /src
│   ├── /api                # REST API endpoints
│   │   ├── /controllers    # Business logic for REST API
│   │   ├── /routes         # Route definitions for REST API
│   │   ├── /services       # Services for handling logic (e.g., database, external APIs)
│   │   ├── /middleware     # Custom middleware for REST API
│   │   └── /models         # Database models (if using ORM like Sequelize)
│   │
│   ├── /graphql            # GraphQL resolvers, schema, etc.
│   │   ├── /schemas        # GraphQL schemas
│   │   ├── /resolvers     # GraphQL resolvers
│   │   ├── /models         # GraphQL-specific models (if needed)
│   │   └── /services       # Services for GraphQL-specific logic
│   │
│   ├── /config             # Configuration files (e.g., database, environment variables)
│   ├── /utils              # Utility functions (e.g., for logging, error handling)
│   └── /index.js           # Main entry point (e.g., express or apollo server setup)
│
├── /tests                  # Unit and integration tests
│   ├── /api                # Tests for REST API endpoints
│   ├── /graphql            # Tests for GraphQL resolvers
│   └── /utils              # Tests for utilities and helpers
│
├── /public                 # Static assets (for serving frontend if needed)
├── /node_modules           # Installed dependencies
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
└── package.json            # Project dependencies and scripts
