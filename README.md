# Jeopardy Trivia Game

A web-based Jeopardy! trivia game that uses real historical game data from J! Archive. Play classic Jeopardy! rounds with authentic questions and answers.

## Features

- 🎮 **Authentic Jeopardy Experience**: Play with real questions from historical Jeopardy! games
- 🎨 **Beautiful UI**: Styled to match the classic Jeopardy! board with smooth animations
- 🎵 **Background Music**: Automatic looping Jeopardy! theme music
- 📊 **Score Tracking**: Keep track of your score as you play
- 🔄 **Multiple Rounds**: Play both Jeopardy! and Double Jeopardy! rounds
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- SQLite3 database file (`jarchive.sqlite3`)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Aman-2804/jeopardy-trivia-game.git
cd jeopardy-trivia-game
```

2. Navigate to the web directory:
```bash
cd web
```

3. Install dependencies:
```bash
npm install
```

## Running the Application

To run both the backend server and frontend development server:

```bash
npm run dev:all
```

This will start:
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:5173

Open http://localhost:5173 in your browser to play!

### Running Separately

If you prefer to run them separately:

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run dev
```

## Project Structure

```
jeopardy-trivia-game/
├── web/                    # Web application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── AudioPlayer.jsx
│   │   │   ├── Board.jsx
│   │   │   ├── CategoryTitle.jsx
│   │   │   ├── Score.jsx
│   │   │   └── Tile.jsx
│   │   ├── App.jsx         # Main app component
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── public/             # Static assets
│   │   └── jeopardy-themelq.mp3
│   ├── server.js           # Express backend server
│   └── package.json
├── jarchive.sqlite3        # SQLite database with game data
├── schema.sql              # Database schema
└── scrape_jarchive.py      # Script to populate database
```

## Technologies Used

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express
- **Database**: SQLite3
- **Audio**: HTML5 Audio API

## Gameplay

1. Click on any dollar amount tile to reveal the clue
2. Read the question and type your answer
3. Click "SUBMIT" to check your answer or "PASS" to skip
4. Your score will be updated based on correct/incorrect answers
5. Click "Next Round" to play Double Jeopardy! (after completing Jeopardy!)
6. Click "New Game" to load a random new game

## Database Setup

The game uses a SQLite database (`jarchive.sqlite3`) containing scraped Jeopardy! game data. If you need to populate or update the database, you can use the `scrape_jarchive.py` script (requires Python and the dependencies listed in `requirements.txt`).

## Development

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## License

This project is for educational purposes. Jeopardy! is a trademark of Jeopardy Productions, Inc.

## Acknowledgments

- Game data sourced from [J! Archive](https://j-archive.com/)
- Jeopardy! is a trademark of Jeopardy Productions, Inc.
