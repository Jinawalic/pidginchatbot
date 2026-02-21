# Pidgin English Chatbot for Agricultural Extension Services

This is a full-stack application designed to help farmers with agricultural advice using Pidgin English.

## Project Structure

- **/backend**: Node.js + Express server using JSON files for storage.
- **/frontend**: React.js (Vite) interface for chatting.

## Requirements

- Node.js installed on your machine.

## How to Run

### 1. Setup Backend
Open a terminal and navigate to the backend folder:
```bash
cd backend
npm install
node server.js
```
The server will start on `http://localhost:5000`.

### 2. Setup Frontend
Open a NEW terminal and navigate to the frontend folder:
```bash
cd frontend
npm install
npm run dev
```
The app will start on `http://localhost:3000`.

## Features
- **Simple Login**: Just enter your name to start.
- **Persistent History**: Your chats are saved based on your name.
- **Pidgin Responses**: Agricultural advice delivered in simple Pidgin English.
- **Mobile Friendly**: Designed to work on small screens.

## Logic
The chatbot uses simple keyword matching to find the best answer from `responses.json`. If it doesn't find a match, it will let you know in Pidgin!
