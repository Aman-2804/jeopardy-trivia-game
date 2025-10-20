# Jeopardy! Scraper Project

## Overview
This project builds a local database of Jeopardy! games by scraping J! Archive, storing shows, rounds, categories, and clues with values and Daily Double information.

## Project Status ✅
- **Database Schema**: Complete and working
- **Web Scraper**: Functional with caching
- **Data Parsing**: Fixed and tested
- **Database Queries**: All verification queries working
- **Sample Data**: 10 games from Season 42 successfully scraped

## Fixed Issues
- **Round Detection Bug**: Fixed the `round_name_from_id()` function that was incorrectly mapping all rounds as "jeopardy". Now properly detects:
  - Regular Jeopardy Round
  - Double Jeopardy Round  
  - Final Jeopardy Round

## Current Database Stats
- **Total Games**: 10 (Season 42, games 9263-9272)
- **Total Categories**: 130 unique categories
- **Total Clues**: ~600 clues across all rounds
- **Daily Doubles**: Properly detected and marked

## File Structure
```
jeopardy/
├── .venv/              # Python virtual environment
├── cache_html/         # Cached HTML pages (10 games + 1 season)
├── jarchive.sqlite3    # SQLite database
├── requirements.txt    # Dependencies: requests, beautifulsoup4
├── schema.sql          # Database schema
├── scrape_jarchive.py  # Main scraper script
└── README.md           # This file
```

## Usage Examples

### Scraping Data
```python
# Scrape a single game
scrape_single_game(9272)

# Scrape multiple games from a season (with rate limiting)
scrape_season(42, limit=10)
```

### Database Queries

#### Count games
```sql
SELECT COUNT(*) FROM shows;
```

#### List categories for a specific game
```sql
SELECT r.name, c.position, c.name
FROM rounds r
JOIN categories c ON r.id=c.round_id
WHERE r.show_id=9272
ORDER BY r.name, c.position;
```

#### Find Daily Doubles
```sql
SELECT r.name, COUNT(*) AS dd_count
FROM clues c 
JOIN rounds r ON r.id=c.round_id
WHERE r.show_id=9272 AND c.is_daily_double=1
GROUP BY r.name;
```

#### Sample clues from a round
```sql
SELECT r.name, c2.name AS category, c.value, c.is_daily_double, c.question, c.answer
FROM clues c
JOIN categories c2 ON c.category_id=c2.id
JOIN rounds r ON r.id=c.round_id
WHERE r.show_id=9272 AND r.name='jeopardy'
LIMIT 10;
```

## Example Game Data (Game 9272)

### Game Info
- **Show Number**: #9395
- **Air Date**: 2025-09-19
- **Daily Doubles**: 3 total (1 in Jeopardy, 2 in Double Jeopardy)

### Categories
**Jeopardy Round**:
- U.S. TERRITORIES
- QUICK CHEM
- FROM THE VIDEO GAME MANUAL
- ANCIENT EATING
- SWAP A LETTER
- BROADWAY

**Double Jeopardy Round**:
- THE BRONZE AGE
- VILLAINS IN LIT
- 14-LETTER WORDS
- LET'S GO TO THE PARK
- ALBUM TITLE ADJECTIVES
- YOUR PRIME NUMBER'S UP

**Final Jeopardy**:
- SLOGANS

### Daily Double Locations
- **Jeopardy**: QUICK CHEM, $1000 (Row 4, Column 1)
- **Double Jeopardy**: LET'S GO TO THE PARK, $4000 (Row 3, Column 3)
- **Double Jeopardy**: YOUR PRIME NUMBER'S UP, $2000 (Row 4, Column 5)

## Key Parsing Rules
- **Categories**: `.category .category_name` inside each round
- **Questions**: `.clue_text` inside `td.clue`
- **Answers**: `<em class="correct_response">` (extracted with BeautifulSoup)
- **Daily Doubles**: Value div with class `.clue_value_daily_double`
- **Values**: "$600" → 600 (parsed to int)
- **Grid Position**: `category_position` = column (0-5), `row_index` = row (0-4)

## Features for Custom Jeopardy Boards
The database enables creating custom Jeopardy boards by:
- Selecting categories by theme/topic
- Filtering clues by difficulty (value ranges)
- Ensuring proper Daily Double distribution
- Creating themed games (e.g., all science categories)

## Next Steps
1. **Expand Data**: Scrape more seasons for better category variety
2. **Custom Board Generator**: Complete the custom board creation feature
3. **Web Interface**: Build a simple web app to browse/play games
4. **Analysis Tools**: Add statistics on category frequency, difficulty patterns
5. **Air Date Parsing**: Fix air date extraction from game headers

## Technical Notes
- **Rate Limiting**: 1.2 second delay between requests to be respectful
- **Caching**: All HTML cached locally to avoid re-downloading
- **Error Handling**: Graceful handling of missing/malformed games
- **Foreign Keys**: Database enforces referential integrity
- **Indexing**: Optimized for common query patterns

## Dependencies
```
requests>=2.25.1
beautifulsoup4>=4.9.3
```

## Environment
- Python 3.9+
- SQLite 3
- Virtual environment recommended