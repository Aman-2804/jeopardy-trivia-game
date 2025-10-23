import express from 'express'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

// Open database connection
let db

async function initDB() {
  db = await open({
    filename: path.join(__dirname, '..', 'jarchive.sqlite3'),
    driver: sqlite3.Database
  })
}

// Get a random complete game with both jeopardy and double jeopardy rounds
app.get('/api/random-game', async (req, res) => {
  try {
    // Find a game with complete jeopardy and double jeopardy rounds (6 categories, 30 clues each)
    const game = await db.get(`
      SELECT s.id, s.show_number, s.air_date
      FROM shows s
      WHERE s.id IN (
        -- Games with complete jeopardy round (6 categories, 30 clues)
        SELECT r1.show_id
        FROM rounds r1
        JOIN categories c1 ON r1.id = c1.round_id
        JOIN clues cl1 ON c1.id = cl1.category_id
        WHERE r1.name = 'jeopardy'
        GROUP BY r1.show_id
        HAVING COUNT(cl1.id) >= 30 AND COUNT(DISTINCT c1.id) = 6
      ) AND s.id IN (
        -- Games with complete double jeopardy round (6 categories, 30 clues)
        SELECT r2.show_id
        FROM rounds r2
        JOIN categories c2 ON r2.id = c2.round_id
        JOIN clues cl2 ON c2.id = cl2.category_id
        WHERE r2.name = 'double'
        GROUP BY r2.show_id
        HAVING COUNT(cl2.id) >= 30 AND COUNT(DISTINCT c2.id) = 6
      )
      ORDER BY RANDOM()
      LIMIT 1
    `)

    if (!game) {
      return res.status(404).json({ error: 'No complete games found in database' })
    }

    // Calculate approximate year
    const approxYear = 1984 + Math.floor((game.show_number - 1) / 230)

    res.json({
      id: game.id,
      showNumber: game.show_number,
      airDate: game.air_date,
      approxYear
    })
  } catch (error) {
    console.error('Error fetching random game:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get game data for a specific round
app.get('/api/game/:gameId/:round', async (req, res) => {
  try {
    const { gameId, round } = req.params

    // Get categories for this round
    const categories = await db.all(`
      SELECT c.id, c.position, c.name
      FROM categories c
      JOIN rounds r ON c.round_id = r.id
      WHERE r.show_id = ? AND r.name = ?
      ORDER BY c.position
      LIMIT 6
    `, [gameId, round])

    if (!categories.length) {
      return res.status(404).json({ error: 'Round not found' })
    }

    // Get clues for each category
    const categoriesWithClues = await Promise.all(
      categories.map(async (cat) => {
        const clues = await db.all(`
          SELECT id, row_index, value, is_daily_double, question, answer
          FROM clues
          WHERE category_id = ?
          ORDER BY row_index
        `, [cat.id])

        return {
          title: cat.name,
          clues: clues.map(clue => ({
            id: clue.id,
            value: clue.value,
            isDailyDouble: clue.is_daily_double === 1,
            question: clue.question,
            answer: clue.answer
          }))
        }
      })
    )

    res.json({ categories: categoriesWithClues })
  } catch (error) {
    console.error('Error fetching game data:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get final jeopardy for a game
app.get('/api/game/:gameId/final', async (req, res) => {
  try {
    const { gameId } = req.params

    const finalClue = await db.get(`
      SELECT cl.id, cl.question, cl.answer, c.name as category
      FROM rounds r
      JOIN categories c ON c.round_id = r.id
      JOIN clues cl ON cl.category_id = c.id
      WHERE r.show_id = ? AND r.name = 'final'
      LIMIT 1
    `, [gameId])

    if (!finalClue) {
      return res.status(404).json({ error: 'Final Jeopardy not found' })
    }

    res.json({
      category: finalClue.category,
      question: finalClue.question,
      answer: finalClue.answer
    })
  } catch (error) {
    console.error('Error fetching final jeopardy:', error)
    res.status(500).json({ error: error.message })
  }
})

const PORT = 3001

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🎮 Jeopardy API server running on http://localhost:${PORT}`)
  })
}).catch(err => {
  console.error('Failed to initialize database:', err)
  process.exit(1)
})
