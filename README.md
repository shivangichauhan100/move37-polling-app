# move37-polling-app
Real-time polling application
<br/>

# Project Description
This project is a backend service for a real-time polling application built as part of the Move37 Ventures Backend Developer Challenge. The service allows users to create polls, add options, and vote. Votes are broadcast instantly to connected clients via WebSockets, ensuring live poll results.

The project demonstrates skills in:

Database Design (PostgreSQL + Prisma ORM)

Backend Development (Node.js + Express.js)

Real-Time Communication (Socket.io WebSockets)

API Development (RESTful CRUD operations)

The system models clear relationships:

One-to-Many → A User can create many Polls. A Poll can have many Options.

Many-to-Many → Users can vote on many PollOptions, and each PollOption can be voted on by many Users, managed via the Vote join table.

This application is designed to be functional, scalable, and extensible. It includes:

Secure user creation (password hashing)

Poll creation with multiple options

Voting with uniqueness enforcement (a user can’t vote twice on the same option)

Real-time poll result updates via WebSockets

🚀 Tech Stack
Backend Framework: Node.js with Express.js

Database: PostgreSQL

ORM: Prisma

Real-time Communication: Socket.io (WebSockets)

Authentication: Placeholder (bcrypt password hashing; JWT optional)

✨ Features
RESTful API for Users, Polls, and Votes

WebSocket live updates for poll results

Prisma schema with explicit relationships

Easy project setup with clear instructions

📖 Setup & Run
Clone the repository:

git clone <repo-url>
cd move37-polling-backend
Install dependencies:

npm install
Configure database in .env:

DATABASE_URL="postgresql://user:password@localhost:5432/move37_polling"
Run migrations:

npx prisma migrate dev --name init
Start development server:

npm run dev
Open Prisma Studio (optional):

npx prisma studio
📡 API Endpoints
Users
POST /api/users → Create user

GET /api/users/:id → Get user by ID

Polls
POST /api/polls → Create poll with options

GET /api/polls/:id → Get poll with options and votes

GET /api/polls → List polls

PATCH /api/polls/:id/publish → Publish/unpublish poll

Votes
POST /api/votes → Cast a vote (userId, pollOptionId)

🔌 WebSocket Events
joinPoll → Join a poll room

leavePoll → Leave a poll room

pollResults → Receive live poll results broadcast when a vote is cast

🧪 Example
# Create a poll
curl -X POST http://localhost:4000/api/polls -H "Content-Type: application/json" \
-d '{"question":"Best color?","options":["Red","Blue"],"creatorId":1}'

# Cast a vote
curl -X POST http://localhost:4000/api/votes -H "Content-Type: application/json" \
-d '{"userId":1,"pollOptionId":2}'
🏗️ Future Improvements
JWT authentication middleware

Redis cache for scalable live result handling

Unit & integration tests (Jest + Supertest)

Docker & docker-compose for PostgreSQL + app
