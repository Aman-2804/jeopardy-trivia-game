# Jeopardy Web App

Browser-based Jeopardy game built with React + Vite that pulls real questions from the j-archive.com database.

## Setup

1. **Install dependencies:**
   ```bash
   cd web
   npm install
   ```

2. **Make sure you have scraped at least one game:**
   ```bash
   # From the root jeopardy folder
   python scrape_jarchive.py
   ```

3. **Start the app:**
   ```bash
   npm run dev:all
   ```

   This starts:
   - API server on `http://localhost:3001` (serves data from `jarchive.sqlite3`)
   - Vite dev server on `http://localhost:5173` (React frontend)

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## Features

- **Authentic Jeopardy UI**: Full-screen question reveals with TV-style animations
- **Real J-Archive Data**: Questions pulled directly from scraped database
- **Score Tracking**: Earn/lose money based on correct/incorrect answers
- **Two Rounds**: Jeopardy ($200-$1000) and Double Jeopardy ($400-$2000)
- **Answer Validation**: Flexible answer checking with feedback
- **Pass Option**: Skip questions and see the answer without losing points

## API Endpoints

- `GET /api/random-game` - Get a random complete game from database
- `GET /api/game/:gameId/:round` - Get categories and clues for a specific round (jeopardy/double)
- `GET /api/game/:gameId/final` - Get Final Jeopardy clue

## Development

- **Frontend only:** `npm run dev`
- **Backend only:** `npm run server`
- **Both:** `npm run dev:all`
