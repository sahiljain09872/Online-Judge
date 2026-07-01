# CodeArena — Online Judge

A full-stack online judge platform for competitive programming, built with the MERN stack, Docker-based code execution, and BullMQ job queues.

## Features

- **User Authentication**: Secure JWT-based registration and login.
- **Problem Library**: Browse programming challenges of varying difficulties.
- **Advanced Code Editor**: Split-pane layout with syntax highlighting via CodeMirror 6.
- **Isolated Execution**: Sandboxed Docker containers for secure code execution (C++, Python, Java).
- **Asynchronous Queue**: Scalable job processing with Redis and BullMQ.
- **Real-Time Polling**: Get live updates on your code submission verdicts.
- **Global Leaderboard**: Compete with others ranked by unique problems solved.
- **User Profiles**: Track your coding stats, acceptance rate, and recent submissions.

## Tech Stack

- **Frontend**: React, Vite, CodeMirror, Vanilla CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Queue/Cache**: Redis, BullMQ
- **Execution Sandbox**: Docker (`child_process`)

## Prerequisites

To run this project locally or in production, you must have:
- Node.js (v20+)
- Docker & Docker Compose
- MongoDB (or run via docker-compose)
- Redis (or run via docker-compose)

## Quick Start (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/codearena.git
   cd codearena
   ```

2. **Start Database and Redis**
   ```bash
   docker-compose up -d
   ```

3. **Install Dependencies**
   ```bash
   npm run install:all
   ```

4. **Configure Environment Variables**
   ```bash
   cp server/.env.example server/.env
   # Update server/.env with your JWT_SECRET and ports
   ```

5. **Build the Execution Images**
   You MUST build the language containers before running any code.
   ```bash
   cd docker/images/cpp && docker build -t codearena-cpp .
   cd ../python && docker build -t codearena-python .
   cd ../java && docker build -t codearena-java .
   ```

6. **Seed the Database**
   ```bash
   cd server
   node seeds/problems.js
   ```

7. **Run the Application**
   ```bash
   # From the root directory
   npm run dev
   ```
   The client will run on `http://localhost:5173` and the server on `http://localhost:5000`.

## Production Deployment

To run the entire stack (Frontend + Backend + MongoDB + Redis) in production mode:

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```
The application will be served via Nginx on port `3000`.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend API Port | `5000` |
| `NODE_ENV` | Environment (`development` or `production`) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/codearena` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | Secret key for JWT auth | `your_secret_key` |

## License

This project is open-source and available under the MIT License.
