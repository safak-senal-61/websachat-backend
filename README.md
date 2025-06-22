# WebSaChat Backend

This is the backend service for the WebSaChat application, built with Node.js and Express.

## Project Structure

```
websachat-backend/
├── src/
│   ├── app.js                # Express application setup
│   ├── server.js             # Server startup script
│   ├── config/               # Configuration files (DB, environment)
│   ├── models/               # Database models (e.g., Sequelize)
│   ├── controllers/          # Request handlers
│   ├── services/             # Business logic layer
│   ├── routes/               # API routes
│   ├── middlewares/          # Custom middlewares
│   └── utils/                # Utility functions
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn
- A relational database (e.g., PostgreSQL, MySQL)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd websachat-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   # yarn install
   ```

3. Create a `.env` file in the root directory and add your environment variables (see `.env.example` if provided).
   Example:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=websachat_db
   DB_DIALECT=postgres
   ```

## Running the Application

- To start the server:
  ```bash
  npm start
  ```

- To start the server in development mode (with nodemon for auto-restarts):
  ```bash
  npm run dev
  ```

The server will typically run on `http://localhost:PORT` (e.g., `http://localhost:3000`).

## API Endpoints

(To be documented as they are developed)

## Database Schema

(Refer to the provided dbdiagram.io schema)





Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue


Stop-Process -Id 11348 -Force

npx prisma migrate reset
kill -9 $(lsof -t -i :3000)


