import os, re, time, sqlite3
from pathlib import Path
from typing import Optional, Dict, List
import requests
from bs4 import BeautifulSoup

BASE_GAME = "https://www.j-archive.com/showgame.php?game_id="
BASE_SEASON = "https://www.j-archive.com/showseason.php?season=    print("🎯 Starting CONTINUE scrape: Seasons 28-41 (2011-2024)")
    print("🔄 Will skip games already in database!")
    print("⏱️  This will take some time for new games...")CACHE_DIR = Path("cache_html")
CACHE_DIR.mkdir(exist_ok=True)

DB_PATH = "jarchive.sqlite3"
USER_AGENT = "JeopardyStudyBot/1.0 (contact: you@example.com)"


# ---------- fetch helpers ----------
def fetch_url(url: str, cache_name: str, delay_s: float = 1.2) -> Optional[str]:
    """Fetch URL with simple on-disk cache."""
    cache_file = CACHE_DIR / cache_name
    if cache_file.exists():
        return cache_file.read_text(encoding="utf-8", errors="ignore")
    time.sleep(delay_s)
    resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=20)
    if resp.status_code == 404:
        return None
    resp.raise_for_status()
    html = resp.text
    cache_file.write_text(html, encoding="utf-8")
    return html


def fetch_game_html(game_id: int) -> Optional[str]:
    return fetch_url(f"{BASE_GAME}{game_id}", f"game_{game_id}.html")


def fetch_season_html(season_number: int) -> Optional[str]:
    return fetch_url(f"{BASE_SEASON}{season_number}", f"season_{season_number}.html")


# ---------- parsing utilities ----------
def clean_money(val_text: str) -> Optional[int]:
    m = re.search(r"\$?\s*([0-9,]+)", val_text or "")
    return int(m.group(1).replace(",", "")) if m else None


def extract_answer(cell_or_round: BeautifulSoup) -> Optional[str]:
    # Correct response generally in <em class="correct_response"> …
    em = cell_or_round.select_one("em.correct_response")
    if em and em.get_text(strip=True):
        return em.get_text(" ", strip=True)
    for div in cell_or_round.select("div"):
        em = div.find("em", class_="correct_response")
        if em and em.get_text(strip=True):
            return em.get_text(" ", strip=True)
    return None


def round_name_from_id(rid: str) -> str:
    if "double_jeopardy_round" in rid: return "double"
    if "final_jeopardy_round" in rid: return "final"
    if "jeopardy_round" in rid: return "jeopardy"
    return "unknown"


# ---------- DB ----------
def ensure_db():
    if not Path("schema.sql").exists():
        raise SystemExit("schema.sql missing. Create it first.")
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.executescript(Path("schema.sql").read_text(encoding="utf-8"))
    return conn


# ---------- parse one game ----------
def parse_game(html: str) -> Dict:
    soup = BeautifulSoup(html, "html.parser")

    # Header metadata
    title = soup.title.get_text(strip=True) if soup.title else ""
    header = soup.select_one("#game_title, .game_title, .game_header") or soup.find("h1")
    header_text = header.get_text(" ", strip=True) if header else title

    air_date = None
    m_date = re.search(r"Air date:\s*([A-Za-z]+\s+\d{1,2},\s*\d{4}|\d{4}-\d{2}-\d{2})", header_text)
    if m_date: air_date = m_date.group(1)

    show_number = None
    m_num = re.search(r"Show\s*#\s*(\d+)", header_text)
    if m_num: show_number = int(m_num.group(1))

    rounds, categories, clues = [], [], []

    for rsec in soup.select("#jeopardy_round, #double_jeopardy_round, #final_jeopardy_round"):
        rname = round_name_from_id(rsec.get("id",""))
        rounds.append({"name": rname})

        # categories
        cat_names = [c.get_text(" ", strip=True) for c in rsec.select(".category .category_name")]
        cat_comments = [c.get_text(" ", strip=True) for c in rsec.select(".category .category_comments")]
        while len(cat_comments) < len(cat_names):
            cat_comments.append(None)
        for pos, (nm, cm) in enumerate(zip(cat_names, cat_comments)):
            categories.append({"round_name": rname, "position": pos, "name": nm, "comments": cm})

        # clues
        if rname in ("jeopardy", "double"):
            rows = [tr for tr in rsec.select("tr") if tr.select("td.clue")]
            for r_idx, tr in enumerate(rows):
                cells = tr.select("td.clue")
                for c_idx, cell in enumerate(cells):
                    qdiv = cell.select_one(".clue_text")
                    if not qdiv:    # missing/empty cell
                        continue
                    question = qdiv.get_text(" ", strip=True)
                    vdiv = cell.select_one(".clue_value, .clue_value_daily_double")
                    value = clean_money(vdiv.get_text(" ", strip=True) if vdiv else "")
                    is_dd = 1 if (vdiv and 'clue_value_daily_double' in (vdiv.get('class') or [])) else 0
                    answer = extract_answer(cell) or ""
                    clues.append({
                        "round_name": rname,
                        "category_position": c_idx,
                        "row_index": r_idx,
                        "value": value,
                        "is_dd": is_dd,
                        "question": question,
                        "answer": answer
                    })
        else:  # final
            qdiv = rsec.select_one(".clue_text")
            question = qdiv.get_text(" ", strip=True) if qdiv else ""
            answer = extract_answer(rsec) or ""
            clues.append({
                "round_name": rname,
                "category_position": 0,
                "row_index": 0,
                "value": None,
                "is_dd": 0,
                "question": question,
                "answer": answer
            })

    return {
        "title": title,
        "air_date": air_date,
        "show_number": show_number,
        "rounds": rounds,
        "categories": categories,
        "clues": clues
    }


def upsert_game(conn: sqlite3.Connection, game_id: int, parsed: Dict):
    cur = conn.cursor()

    cur.execute("""
        INSERT OR REPLACE INTO shows(id, show_number, air_date, title)
        VALUES(?, ?, ?, ?)
    """, (game_id, parsed.get("show_number"), parsed.get("air_date"), parsed.get("title")))

    # rounds
    round_ids = {}
    for r in parsed["rounds"]:
        cur.execute("INSERT OR IGNORE INTO rounds(show_id, name) VALUES(?, ?)", (game_id, r["name"]))
        cur.execute("SELECT id FROM rounds WHERE show_id=? AND name=?", (game_id, r["name"]))
        round_ids[r["name"]] = cur.fetchone()[0]

    # categories
    cat_ids = {}
    for c in parsed["categories"]:
        rid = round_ids[c["round_name"]]
        cur.execute("""
            INSERT OR REPLACE INTO categories(round_id, position, name, comments)
            VALUES(?, ?, ?, ?)
        """, (rid, c["position"], c["name"], c["comments"]))
        cur.execute("SELECT id FROM categories WHERE round_id=? AND position=?", (rid, c["position"]))
        cat_ids[(c["round_name"], c["position"])] = cur.fetchone()[0]

    # clues
    for cl in parsed["clues"]:
        rid = round_ids[cl["round_name"]]
        cat_id = cat_ids.get((cl["round_name"], cl["category_position"]))
        if cat_id is None and cl["round_name"] == "final":
            # synthesize final category if missing
            cur.execute("INSERT OR IGNORE INTO categories(round_id, position, name) VALUES(?, 0, 'FINAL JEOPARDY')", (rid,))
            cur.execute("SELECT id FROM categories WHERE round_id=? AND position=0", (rid,))
            cat_id = cur.fetchone()[0]
        if cat_id is None:
            continue
        cur.execute("""
            INSERT OR REPLACE INTO clues(round_id, category_id, row_index, value, is_daily_double, question, answer)
            VALUES(?, ?, ?, ?, ?, ?, ?)
        """, (rid, cat_id, cl["row_index"], cl["value"], cl["is_dd"], cl["question"], cl["answer"]))

    conn.commit()


# ---------- season → list of game_ids ----------
def get_game_ids_from_season(season_number: int) -> List[int]:
    html = fetch_season_html(season_number)
    if not html: return []
    soup = BeautifulSoup(html, "html.parser")
    game_ids = []
    for a in soup.find_all("a", href=True):
        m = re.search(r"showgame\.php\?game_id=(\d+)", a["href"])
        if m:
            game_ids.append(int(m.group(1)))
    # unique & sorted newest→oldest or oldest→newest as you like
    game_ids = sorted(set(game_ids))
    return game_ids


# ---------- driver ----------
def scrape_season(season_number: int, limit: Optional[int] = None):
    conn = ensure_db()
    game_ids = get_game_ids_from_season(season_number)
    if limit: game_ids = game_ids[:limit]
    
    # Check which games already exist in database
    cur = conn.cursor()
    cur.execute("SELECT id FROM shows WHERE id IN ({})".format(','.join('?' * len(game_ids))), game_ids)
    existing_games = {row[0] for row in cur.fetchall()}
    
    new_games = [gid for gid in game_ids if gid not in existing_games]
    
    print(f"Season {season_number}: {len(game_ids)} games detected, {len(existing_games)} already exist, {len(new_games)} new to scrape")
    
    if not new_games:
        print(f"Season {season_number}: All games already scraped! Skipping...")
        conn.close()
        return

    for gid in new_games:
        try:
            html = fetch_game_html(gid)
            if html is None:
                print(f"[{gid}] 404/missing")
                continue
            parsed = parse_game(html)
            upsert_game(conn, gid, parsed)
            print(f"[{gid}] OK")
        except requests.HTTPError as e:
            print(f"[{gid}] HTTP error: {e}")
        except Exception as e:
            print(f"[{gid}] FAIL: {e}")

    conn.close()


def scrape_single_game(game_id: int):
    conn = ensure_db()
    html = fetch_game_html(game_id)
    if not html:
        print(f"Game {game_id} missing/404")
        return
    parsed = parse_game(html)
    upsert_game(conn, game_id, parsed)
    print(f"[{game_id}] OK")
    conn.close()


if __name__ == "__main__":
    # FRESH SCRAPE: ALL SEASONS FROM 2000-2024
    # Season 17 (2000) through Season 41 (2024)
    
    print("🎯 Starting FRESH comprehensive scrape: 2000-2024 (Seasons 17-41)")
    print("�️  Database cleared - starting from scratch!")
    print("⏱️  This will take several hours! Be patient...")
    
    for season in range(28, 42):  # Seasons 17-41 (2000-2024)
        print(f"\n{'='*60}")
        print(f"🎮 SCRAPING SEASON {season}")
        print(f"📅 Approximate year: {1983 + season}")  # Jeopardy started in 1984
        print(f"{'='*60}")
        
        try:
            scrape_season(season, limit=None)  # No limit - get all games
            print(f"✅ COMPLETED Season {season}")
        except Exception as e:
            print(f"❌ ERROR in Season {season}: {e}")
            print("⏩ Continuing with next season...")
            continue
    
    print("\n🎉 CONTINUE SCRAPE COMPLETE! Seasons 28-41 processed.")
