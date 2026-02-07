# Pokémon Battle Platform

A full-stack, real-time competitive Pokémon battle simulator built with Next.js, NestJS, and WebSockets.

## 🚀 Features

- **Real-Time Combat**: Instant state synchronization between players using Socket.IO.
- **Deterministic Engine**: Server-authoritative logic ensures fair play and prevents cheating.
- **Dynamic Battlegrounds**: Randomly generated terrains (Volcano, Ocean, Forest) that impact type effectiveness.
- **Modern UI**: Sleek, responsive interface built with Tailwind CSS and Framer Motion.

## 🛠 Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Lucide React, Zustand (State Management).
- **Backend**: NestJS, Socket.IO, TypeORM.
- **Database**: PostgreSQL (Data), Redis (Battle Cache/Queue).
- **Infrastructure**: Docker & Docker Compose.

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## ⚡ Quick Start

### 1. Start Infrastructure
Run the database and cache services using Docker:
```bash
docker-compose up -d
```
*Port mappings: Postgres (5433), Redis (6379)*

### 2. Start the Backend (Server)
Navigate to the server directory:
```bash
cd server
npm install
npm run start:dev
```
The server will start on **http://localhost:4000**.

### 3. Start the Frontend (Client)
Open a new terminal and navigate to the client directory:
```bash
cd client
npm install
npm run dev
```
The client will start on **http://localhost:3000**.

### 4. Play!
Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Guest Method**: Click "Try Demo" to jump straight into a battle.
- **Multiplayer**: Open a second browser window (Incognito) with the same URL to simulate the opponent.

## 🏗 Architecture

### Battle Engine (`/server/src/battle`)
- **BattleService**: Core logic handler. Calculates damage, turn order, and win conditions.
- **BattleGateway**: WebSocket entry point. Handles `JOIN_MATCH`, `SELECT_ACTION` events.
- **BattleStore**: In-memory state storage (Redis backed in production) for active matches.

### Client syncing
- **SocketProvider**: Global singleton socket connection.
- **BattleStore (Zustand)**: Client-side replica of the battle state. Updates immediately upon receiving `MATCH_STATE` events.

## 🧪 Testing

Refer to [TESTING_PLAN.md](./TESTING_PLAN.md) for a detailed step-by-step guide to verify the application features.

## ⚠️ Current Status & Limitations (MVP)

- **Mock Teams**: Currently, all players start with a fixed team (Charizard + Gengar) for testing.
- **Moves**: Only basic "Tackle" logic is implemented for the prototype.
- **Auth**: Clerk integration is set up but optional for the Demo mode.

## 📄 License
MIT
