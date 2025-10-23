import express from 'express'
import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import cors from 'cors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 3001

// Enable CORS for React frontend
app.use(cors())
app.use(express.json())

// Path to the database
const dbPath = join(__dirname, '..', 'jarchive.sqlite3')

// Get a random complete game
app.get('/api/random-game', (req, res) => {
  const db = new sqlite3.Database(dbPath)
  
  // Get a random game that has complete data for both rounds
  db.get(`
    SELECT s.id, s.show_number
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
  `, (err, game) => {
    if (err) {
      console.error('Database error:', err)
      db.close()
      return res.status(500).json({ error: 'Database error' })
    }
    
    if (!game) {
      db.close()
      return res.status(404).json({ error: 'No complete games found' })
    }
    
    const showId = game.id
    const showNumber = game.show_number
    const approxYear = 1984 + Math.floor((showNumber - 1) / 230)
    
    // Get categories and clues for jeopardy round
    db.all(`
      SELECT c.position, c.name, c.id
      FROM categories c
      JOIN rounds r ON c.round_id = r.id
      WHERE r.show_id = ? AND r.name = 'jeopardy'
      ORDER BY c.position
      LIMIT 6
    `, [showId], (err, categories) => {
      if (err) {
        console.error('Categories error:', err)
        db.close()
        return res.status(500).json({ error: 'Failed to load categories' })
      }
      
      const categoryPromises = categories.map(cat => {
        return new Promise((resolve, reject) => {
          db.all(`
            SELECT id, question, answer, value, row_index, is_daily_double
            FROM clues
            WHERE category_id = ?
            ORDER BY row_index
          `, [cat.id], (err, clues) => {
            if (err) reject(err)
            else resolve({
              title: cat.name,
              clues: clues.map(c => ({
                id: c.id,
                question: c.question,
                answer: c.answer,
                value: c.value,
                rowIndex: c.row_index,
                isDailyDouble: c.is_daily_double === 1
              }))
            })
          })
        })
      })
      
      Promise.all(categoryPromises)
        .then(categoriesData => {
          db.close()
          res.json({
            showId,
            showNumber,
            approxYear,
            categories: categoriesData
          })
        })
        .catch(err => {
          console.error('Clues error:', err)
          db.close()
          res.status(500).json({ error: 'Failed to load clues' })
        })
    })
  })
})

// Get double jeopardy round
app.get('/api/game/:showId/double', (req, res) => {
  const db = new sqlite3.Database(dbPath)
  const showId = req.params.showId
  
  db.all(`
    SELECT c.position, c.name, c.id
    FROM categories c
    JOIN rounds r ON c.round_id = r.id
    WHERE r.show_id = ? AND r.name = 'double'
    ORDER BY c.position
    LIMIT 6
  `, [showId], (err, categories) => {
    if (err) {
      console.error('Categories error:', err)
      db.close()
      return res.status(500).json({ error: 'Failed to load categories' })
    }
    
    const categoryPromises = categories.map(cat => {
      return new Promise((resolve, reject) => {
        db.all(`
          SELECT id, question, answer, value, row_index, is_daily_double
          FROM clues
          WHERE category_id = ?
          ORDER BY row_index
        `, [cat.id], (err, clues) => {
          if (err) reject(err)
          else resolve({
            title: cat.name,
            clues: clues.map(c => ({
              id: c.id,
              question: c.question,
              answer: c.answer,
              value: c.value,
              rowIndex: c.row_index,
              isDailyDouble: c.is_daily_double === 1
            }))
          })
        })
      })
    })
    
    Promise.all(categoryPromises)
      .then(categoriesData => {
        db.close()
        res.json({ categories: categoriesData })
      })
      .catch(err => {
        console.error('Clues error:', err)
        db.close()
        res.status(500).json({ error: 'Failed to load clues' })
      })
  })
})

// Get final jeopardy
app.get('/api/game/:showId/final', (req, res) => {
  const db = new sqlite3.Database(dbPath)
  const showId = req.params.showId
  
  db.get(`
    SELECT cl.id, cl.question, cl.answer, c.name as category
    FROM rounds r
    JOIN categories c ON c.round_id = r.id
    JOIN clues cl ON cl.category_id = c.id
    WHERE r.show_id = ? AND r.name = 'final'
    LIMIT 1
  `, [showId], (err, clue) => {
    db.close()
    
    if (err) {
      console.error('Final jeopardy error:', err)
      return res.status(500).json({ error: 'Failed to load final jeopardy' })
    }
    
    if (!clue) {
      return res.status(404).json({ error: 'No final jeopardy found' })
    }
    
    res.json({
      id: clue.id,
      question: clue.question,
      answer: clue.answer,
      category: clue.category
    })
  })
})

app.listen(PORT, () => {
  console.log(`🎮 Jeopardy API server running on http://localhost:${PORT}`)
})
