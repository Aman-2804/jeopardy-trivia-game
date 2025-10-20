#!/usr/bin/env python3#!/usr/bin/env python3#!/usr/bin/env python3

"""

Command Line Jeopardy Game"""import sqlite3

Simple text-based interface for playing Jeopardy

"""Command Line Jeopardy Gameimport random

import sqlite3

import randomSimple text-based interface for playing Jeopardyimport sys

import re

from pathlib import Path"""from pathlib import Path



class JeopardyCLI:import sqlite3

    def __init__(self):

        self.db_path = Path(__file__).parent / 'jarchive.sqlite3'import randomdef get_random_game():

        self.current_game_id = None

        self.current_round = 'jeopardy'import re    """Gets a random game from the database"""

        self.score = 0

        self.answered_clues = set()from pathlib import Path    conn = sqlite3.connect('jarchive.sqlite3')

        

    def connect_db(self):    cursor = conn.cursor()

        """Connect to the SQLite database"""

        return sqlite3.connect(self.db_path)class JeopardyCLI:    

    

    def load_random_game(self):    def __init__(self):    cursor.execute("SELECT id, show_number, air_date, title FROM shows ORDER BY RANDOM() LIMIT 1")

        """Load a random game from the database"""

        with self.connect_db() as conn:        self.db_path = Path(__file__).parent / 'jarchive.sqlite3'    game = cursor.fetchone()

            cursor = conn.cursor()

            cursor.execute("SELECT id FROM shows ORDER BY RANDOM() LIMIT 1")        self.current_game_id = None    

            result = cursor.fetchone()

            if result:        self.current_round = 'jeopardy'    if not game:

                self.current_game_id = result[0]

                print(f"🎯 Loaded Game #{self.current_game_id}")        self.score = 0        print("❌ No games found in database! Run the scraper first.")

                return True

            return False        self.answered_clues = set()        return None

    

    def get_categories(self):            

        """Get categories for the current round"""

        with self.connect_db() as conn:    def connect_db(self):    game_id, show_number, air_date, title = game

            cursor = conn.cursor()

            cursor.execute("""        """Connect to the SQLite database"""    conn.close()

                SELECT c.id, c.name, c.position 

                FROM categories c        return sqlite3.connect(self.db_path)    return game_id, show_number, air_date, title

                JOIN rounds r ON c.round_id = r.id

                WHERE r.show_id = ? AND r.name = ?    

                ORDER BY c.position

            """, (self.current_game_id, self.current_round))    def load_random_game(self):def display_game_board(game_id):

            return cursor.fetchall()

            """Load a random game from the database"""    """Display the full game board for a specific game"""

    def get_clues_for_category(self, category_id):

        """Get all clues for a category"""        with self.connect_db() as conn:    conn = sqlite3.connect('jarchive.sqlite3')

        with self.connect_db() as conn:

            cursor = conn.cursor()            cursor = conn.cursor()    cursor = conn.cursor()

            cursor.execute("""

                SELECT id, question, answer, value, is_daily_double, row_index            cursor.execute("SELECT id FROM shows ORDER BY RANDOM() LIMIT 1")    

                FROM clues

                WHERE category_id = ?            result = cursor.fetchone()    cursor.execute("SELECT show_number, air_date, title FROM shows WHERE id = ?", (game_id,))

                ORDER BY row_index

            """, (category_id,))            if result:    show_info = cursor.fetchone()

            return cursor.fetchall()

                    self.current_game_id = result[0]    if not show_info:

    def display_board(self):

        """Display the current game board"""                print(f"🎯 Loaded Game #{self.current_game_id}")        print(f"❌ Game {game_id} not found!")

        categories = self.get_categories()

        if not categories:                return True        return

            print("❌ No categories found for this round!")

            return False            return False    

        

        print(f"\n{'='*80}")        show_number, air_date, title = show_info

        print(f"🎮 JEOPARDY! - {self.current_round.upper()} ROUND")

        print(f"💰 Current Score: ${self.score}")    def get_categories(self):    

        print(f"{'='*80}")

                """Get categories for the current round"""    print("="*80)

        # Print category headers

        print("\nCATEGORIES:")        with self.connect_db() as conn:    print(f"🎮 JEOPARDY! - Show #{show_number}")

        for i, (cat_id, cat_name, pos) in enumerate(categories, 1):

            print(f"{i}. {cat_name.upper()}")            cursor = conn.cursor()    print(f"📅 Air Date: {air_date or 'Unknown'}")

        

        print(f"\n{'-'*80}")            cursor.execute("""    print("="*80)

        

        # Print the board grid                SELECT c.id, c.name, c.position     

        values = [200, 400, 600, 800, 1000] if self.current_round == 'jeopardy' else [400, 800, 1200, 1600, 2000]

                        FROM categories c    # Display each round

        # Header row

        header = "ROW  "                JOIN rounds r ON c.round_id = r.id    for round_name in ['jeopardy', 'double', 'final']:

        for i, (_, cat_name, _) in enumerate(categories, 1):

            header += f"  {i:^8}"                WHERE r.show_id = ? AND r.name = ?        display_round(cursor, game_id, round_name)

        print(header)

        print("-" * len(header))                ORDER BY c.position    

        

        # Value rows            """, (self.current_game_id, self.current_round))    conn.close()

        for row_idx, value in enumerate(values, 1):

            row_str = f" {row_idx}   "            return cursor.fetchall()

            

            for cat_id, _, _ in categories:    def display_round(cursor, game_id, round_name):

                clues = self.get_clues_for_category(cat_id)

                if row_idx <= len(clues):    def get_clues_for_category(self, category_id):    """Display a specific round"""

                    clue_id = clues[row_idx - 1][0]

                    if clue_id in self.answered_clues:        """Get all clues for a category"""    cursor.execute("""

                        row_str += f"  {'---':^8}"

                    else:        with self.connect_db() as conn:        SELECT c.position, c.name

                        row_str += f"  ${value:^7}"

                else:            cursor = conn.cursor()        FROM categories c

                    row_str += f"  {'N/A':^8}"

                        cursor.execute("""        JOIN rounds r ON c.round_id = r.id

            print(row_str)

                        SELECT id, question, answer, value, is_daily_double, row_index        WHERE r.show_id = ? AND r.name = ?

        print(f"\n{'-'*80}")

        return True                FROM clues        ORDER BY c.position

    

    def select_clue(self):                WHERE category_id = ?    """, (game_id, round_name))

        """Let user select a clue to answer"""

        categories = self.get_categories()                ORDER BY row_index    

        

        try:            """, (category_id,))    categories = cursor.fetchall()

            cat_choice = input("\nEnter category number (1-6): ").strip()

            row_choice = input("Enter row number (1-5): ").strip()            return cursor.fetchall()    if not categories:

            

            cat_idx = int(cat_choice) - 1            return

            row_idx = int(row_choice) - 1

                def display_board(self):    

            if not (0 <= cat_idx < len(categories)) or not (0 <= row_idx < 5):

                print("❌ Invalid selection!")        """Display the current game board"""    round_titles = {

                return None

                    categories = self.get_categories()        'jeopardy': '🔵 JEOPARDY! ROUND',

            cat_id = categories[cat_idx][0]

            clues = self.get_clues_for_category(cat_id)        if not categories:        'double': '🔴 DOUBLE JEOPARDY! ROUND', 

            

            if row_idx >= len(clues):            print("❌ No categories found for this round!")        'final': '🏆 FINAL JEOPARDY!'

                print("❌ No clue available in that position!")

                return None            return False    }

            

            clue_data = clues[row_idx]            

            clue_id = clue_data[0]

                    print(f"\n{'='*80}")    print(f"\n{round_titles[round_name]}")

            if clue_id in self.answered_clues:

                print("❌ You've already answered this clue!")        print(f"🎮 JEOPARDY! - {self.current_round.upper()} ROUND")    print("-" * 80)

                return None

                    print(f"💰 Current Score: ${self.score}")    

            return clue_data

                    print(f"{'='*80}")    if round_name == 'final':

        except (ValueError, IndexError):

            print("❌ Invalid input! Please enter numbers only.")                cat_name = categories[0][1] if categories else "FINAL JEOPARDY"

            return None

            # Print category headers        print(f"Category: {cat_name}")

    def play_clue(self, clue_data):

        """Play a single clue"""        print("\nCATEGORIES:")        

        clue_id, question, answer, value, is_daily_double, row_index = clue_data

                for i, (cat_id, cat_name, pos) in enumerate(categories, 1):        cursor.execute("""

        print(f"\n{'='*60}")

        if is_daily_double:            print(f"{i}. {cat_name.upper()}")            SELECT c.question, c.answer

            print("🎲 DAILY DOUBLE! 🎲")

            try:                    FROM clues c

                wager = int(input(f"Enter your wager (minimum ${value}): $"))

                value = max(wager, value)        print(f"\n{'-'*80}")            JOIN rounds r ON c.round_id = r.id

            except ValueError:

                print(f"Invalid wager, using minimum ${value}")                    WHERE r.show_id = ? AND r.name = 'final'

        

        print(f"💰 Value: ${value}")        # Print the board grid            LIMIT 1

        print(f"❓ CLUE: {question}")

        print(f"{'='*60}")        values = [200, 400, 600, 800, 1000] if self.current_round == 'jeopardy' else [400, 800, 1200, 1600, 2000]        """, (game_id,))

        

        user_answer = input("\n🤔 What is your answer? ").strip()                

        

        # Simple answer checking (remove common words and punctuation)        # Header row        clue = cursor.fetchone()

        def normalize_answer(ans):

            ans = re.sub(r'[^\w\s]', '', ans.lower())        header = "ROW  "        if clue:

            ans = re.sub(r'\b(what|who|where|when|why|how|is|are|the|a|an)\b', '', ans)

            return re.sub(r'\s+', ' ', ans).strip()        for i, (_, cat_name, _) in enumerate(categories, 1):            question, answer = clue

        

        correct_answer = normalize_answer(answer)            header += f"  {i:^8}"            print(f"\n❓ {question}")

        user_normalized = normalize_answer(user_answer)

                print(header)            input("\nPress Enter to see the answer...")

        is_correct = correct_answer in user_normalized or user_normalized in correct_answer

                print("-" * len(header))            print(f"✅ {answer}")

        if is_correct:

            print(f"✅ CORRECT! You earned ${value}!")            else:

            self.score += value

        else:        # Value rows        play_clues_interactive(cursor, game_id, round_name, categories)

            print(f"❌ INCORRECT! The correct answer was: {answer}")

            self.score -= value        for row_idx, value in enumerate(values, 1):

        

        self.answered_clues.add(clue_id)            row_str = f" {row_idx}   "def play_clues_interactive(cursor, game_id, round_name, categories):

        print(f"💰 Your score: ${self.score}")

        input("\nPress Enter to continue...")                """Interactive clue playing with live board updates"""

    

    def check_round_complete(self):            for cat_id, _, _ in categories:    player_score = 0

        """Check if the current round is complete"""

        categories = self.get_categories()                clues = self.get_clues_for_category(cat_id)    used_clues = set()

        total_clues = 0

        answered_clues = 0                if row_idx <= len(clues):    

        

        for cat_id, _, _ in categories:                    clue_id = clues[row_idx - 1][0]    # Get all clues for this round

            clues = self.get_clues_for_category(cat_id)

            total_clues += len(clues)                    if clue_id in self.answered_clues:    cursor.execute("""

            for clue in clues:

                if clue[0] in self.answered_clues:                        row_str += f"  {'---':^8}"        SELECT c.question, c.answer, c.value, c.is_daily_double, cat.name, cat.position, c.row_index

                    answered_clues += 1

                            else:        FROM clues c

        return answered_clues >= total_clues * 0.8  # 80% completion

                            row_str += f"  ${value:^7}"        JOIN categories cat ON c.category_id = cat.id

    def switch_round(self):

        """Switch to the next round"""                else:        JOIN rounds r ON c.round_id = r.id

        if self.current_round == 'jeopardy':

            self.current_round = 'double_jeopardy'                    row_str += f"  {'N/A':^8}"        WHERE r.show_id = ? AND r.name = ?

            print("\n🚀 Moving to DOUBLE JEOPARDY!")

            return True                    ORDER BY cat.position, c.row_index

        elif self.current_round == 'double_jeopardy':

            self.current_round = 'final_jeopardy'            print(row_str)    """, (game_id, round_name))

            print("\n🏆 Time for FINAL JEOPARDY!")

            return True            

        return False

            print(f"\n{'-'*80}")    all_clues = cursor.fetchall()

    def play_final_jeopardy(self):

        """Play Final Jeopardy"""        return True    

        with self.connect_db() as conn:

            cursor = conn.cursor()        while True:

            cursor.execute("""

                SELECT c.question, c.answer, cat.name    def select_clue(self):        # Clear screen and show updated board

                FROM clues c

                JOIN categories cat ON c.category_id = cat.id        """Let user select a clue to answer"""        print("\n" * 50)  # Clear screen

                JOIN rounds r ON cat.round_id = r.id

                WHERE r.show_id = ? AND r.name = 'final_jeopardy'        categories = self.get_categories()        display_regular_board(cursor, game_id, round_name, categories, used_clues)

                LIMIT 1

            """, (self.current_game_id,))                

            

            result = cursor.fetchone()        try:        print(f"\n💰 Current Score: ${player_score}")

            if not result:

                print("❌ No Final Jeopardy clue found!")            cat_choice = input("\nEnter category number (1-6): ").strip()        print(f"📝 Select a clue:")

                return

                        row_choice = input("Enter row number (1-5): ").strip()        print("   Format: column row (e.g., '1 3' for column 1, row 3)")

            question, answer, category = result

                                print("   Type 'q' to quit")

            print(f"\n{'='*60}")

            print("🏆 FINAL JEOPARDY! 🏆")            cat_idx = int(cat_choice) - 1        

            print(f"Category: {category.upper()}")

            print(f"{'='*60}")            row_idx = int(row_choice) - 1        choice = input("➤ ").strip().lower()

            

            try:                    

                wager = int(input(f"Enter your wager (you have ${self.score}): $"))

                wager = max(0, min(wager, abs(self.score)))            if not (0 <= cat_idx < len(categories)) or not (0 <= row_idx < 5):        if choice == 'q':

            except ValueError:

                wager = 0                print("❌ Invalid selection!")            break

                print("Invalid wager, betting $0")

                            return None            

            print(f"\n❓ CLUE: {question}")

            print("⏰ Think about your answer...")                    try:

            

            user_answer = input("\n🤔 What is your final answer? ").strip()            cat_id = categories[cat_idx][0]            col, row = choice.split()

            

            def normalize_answer(ans):            clues = self.get_clues_for_category(cat_id)            col, row = int(col) - 1, int(row) - 1  # Convert to 0-based

                ans = re.sub(r'[^\w\s]', '', ans.lower())

                ans = re.sub(r'\b(what|who|where|when|why|how|is|are|the|a|an)\b', '', ans)                        

                return re.sub(r'\s+', ' ', ans).strip()

                        if row_idx >= len(clues):            if not (0 <= col <= 5 and 0 <= row <= 4):

            correct_answer = normalize_answer(answer)

            user_normalized = normalize_answer(user_answer)                print("❌ No clue available in that position!")                print("❌ Invalid position! Use columns 1-6, rows 1-5")

            

            is_correct = correct_answer in user_normalized or user_normalized in correct_answer                return None                input("Press Enter to continue...")

            

            if is_correct:                            continue

                print(f"✅ CORRECT! You won ${wager}!")

                self.score += wager            clue_data = clues[row_idx]            

            else:

                print(f"❌ INCORRECT! The correct answer was: {answer}")            clue_id = clue_data[0]            if (col, row) in used_clues:

                print(f"You lost ${wager}")

                self.score -= wager                            print("❌ That clue has already been played!")

    

    def play_game(self):            if clue_id in self.answered_clues:                input("Press Enter to continue...")

        """Main game loop"""

        print("🎮 Welcome to Command Line Jeopardy! 🎮")                print("❌ You've already answered this clue!")                continue

        

        if not self.load_random_game():                return None                

            print("❌ Could not load a game!")

            return                        clue = next((c for c in all_clues if c[5] == col and c[6] == row), None)

        

        while True:            return clue_data            

            if not self.display_board():

                break                        if not clue:

            

            print("\nOptions:")        except (ValueError, IndexError):                print("❌ No clue at that position!")

            print("1. Select a clue")

            print("2. Switch to next round")            print("❌ Invalid input! Please enter numbers only.")                input("Press Enter to continue...")

            print("3. Play Final Jeopardy")

            print("4. New game")            return None                continue

            print("5. Quit")

                            

            choice = input("\nEnter your choice (1-5): ").strip()

                def play_clue(self, clue_data):            used_clues.add((col, row))

            if choice == '1':

                clue_data = self.select_clue()        """Play a single clue"""            question, answer, value, is_dd, cat_name, _, _ = clue

                if clue_data:

                    self.play_clue(clue_data)        clue_id, question, answer, value, is_daily_double, row_index = clue_data            

                    

                    if self.check_round_complete():                    if is_dd:

                        if self.switch_round():

                            continue        print(f"\n{'='*60}")                print(f"\n🎉 DAILY DOUBLE! 🎉")

                        else:

                            break        if is_daily_double:                print(f"🎯 Category: {cat_name}")

            

            elif choice == '2':            print("🎲 DAILY DOUBLE! 🎲")                

                if not self.switch_round():

                    print("❌ Cannot switch rounds!")            try:                max_wager = max(player_score, 1000)

            

            elif choice == '3':                wager = int(input(f"Enter your wager (minimum ${value}): $"))                print(f"💵 You can wager up to ${max_wager}")

                self.play_final_jeopardy()

                break                value = max(wager, value)                

            

            elif choice == '4':            except ValueError:                while True:

                self.__init__()

                if not self.load_random_game():                print(f"Invalid wager, using minimum ${value}")                    try:

                    print("❌ Could not load a new game!")

                    break                                wager_input = input(f"💰 How much do you want to wager? $").strip()

            

            elif choice == '5':        print(f"💰 Value: ${value}")                        wager = int(wager_input)

                break

                    print(f"❓ CLUE: {question}")                        

            else:

                print("❌ Invalid choice!")        print(f"{'='*60}")                        if wager < 5:

        

        print(f"\n🎯 Final Score: ${self.score}")                                    print("❌ Minimum wager is $5")

        print("Thanks for playing Jeopardy! 👋")

        user_answer = input("\n🤔 What is your answer? ").strip()                            continue

def main():

    game = JeopardyCLI()                                elif wager > max_wager:

    game.play_game()

        # Simple answer checking (remove common words and punctuation)                            print(f"❌ Maximum wager is ${max_wager}")

if __name__ == "__main__":

    main()        def normalize_answer(ans):                            continue

            ans = re.sub(r'[^\w\s]', '', ans.lower())                        else:

            ans = re.sub(r'\b(what|who|where|when|why|how|is|are|the|a|an)\b', '', ans)                            break

            return re.sub(r'\s+', ' ', ans).strip()                    except ValueError:

                                print("❌ Please enter a valid number")

        correct_answer = normalize_answer(answer)                

        user_normalized = normalize_answer(user_answer)                print(f"\n💰 Wagered: ${wager}")

                        print(f"❓ {question}")

        is_correct = correct_answer in user_normalized or user_normalized in correct_answer                

                        user_answer = input("\n🎯 Your answer (in Jeopardy format - 'What is...', 'Who is...', etc.): ").strip()

        if is_correct:                print(f"✅ Correct answer: {answer}")

            print(f"✅ CORRECT! You earned ${value}!")                

            self.score += value                if check_answer(user_answer, answer):

        else:                    player_score += wager

            print(f"❌ INCORRECT! The correct answer was: {answer}")                    print(f"🎉 Correct! +${wager}")

            self.score -= value                else:

                            player_score -= wager

        self.answered_clues.add(clue_id)                    print(f"❌ Incorrect! -${wager}")

        print(f"💰 Your score: ${self.score}")                    print(f"💡 You said: {user_answer}")

        input("\nPress Enter to continue...")            else:

                    print(f"\n🎯 {cat_name}")

    def check_round_complete(self):                print(f"💵 ${value}")

        """Check if the current round is complete"""                print(f"❓ {question}")

        categories = self.get_categories()                

        total_clues = 0                user_answer = input("\n🎯 Your answer (in Jeopardy format - 'What is...', 'Who is...', etc.): ").strip()

        answered_clues = 0                print(f"✅ Correct answer: {answer}")

                        

        for cat_id, _, _ in categories:                if check_answer(user_answer, answer):

            clues = self.get_clues_for_category(cat_id)                    player_score += value

            total_clues += len(clues)                    print(f"🎉 Correct! +${value}")

            for clue in clues:                else:

                if clue[0] in self.answered_clues:                    player_score -= value

                    answered_clues += 1                    print(f"❌ Incorrect! -${value}")

                            print(f"💡 You said: {user_answer}")

        return answered_clues >= total_clues * 0.8  # 80% completion            

                input("\nPress Enter to continue...")

    def switch_round(self):            

        """Switch to the next round"""        except (ValueError, IndexError):

        if self.current_round == 'jeopardy':            print("❌ Invalid format! Use: column row (e.g., '1 3')")

            self.current_round = 'double_jeopardy'            input("Press Enter to continue...")

            print("\n🚀 Moving to DOUBLE JEOPARDY!")    

            return True    print(f"\n🏁 Final Score: ${player_score}")

        elif self.current_round == 'double_jeopardy':

            self.current_round = 'final_jeopardy'def display_regular_board(cursor, game_id, round_name, categories, used_clues=None):

            print("\n🏆 Time for FINAL JEOPARDY!")    """Display the regular Jeopardy board layout - CLEAN TABLE FORMAT"""

            return True    

        return False    if not categories:

            return

    def play_final_jeopardy(self):    

        """Play Final Jeopardy"""    if used_clues is None:

        with self.connect_db() as conn:        used_clues = set()

            cursor = conn.cursor()    

            cursor.execute("""    # Create the board with proper box formatting

                SELECT c.question, c.answer, cat.name    print(f"\n{round_name.upper().replace('_', ' ')} ROUND BOARD")

                FROM clues c    print("=" * 90)

                JOIN categories cat ON c.category_id = cat.id    

                JOIN rounds r ON cat.round_id = r.id    # Top border

                WHERE r.show_id = ? AND r.name = 'final_jeopardy'    print("┌" + "─" * 14 + "┬" + "─" * 14 + "┬" + "─" * 14 + "┬" + "─" * 14 + "┬" + "─" * 14 + "┬" + "─" * 14 + "┐")

                LIMIT 1    

            """, (self.current_game_id,))    # Category headers - first line

                print("│", end="")

            result = cursor.fetchone()    for pos, cat_name in categories[:6]:  # Ensure max 6 categories

            if not result:        # Split long category names into two lines

                print("❌ No Final Jeopardy clue found!")        words = cat_name.split()

                return        line1, line2 = "", ""

                    

            question, answer, category = result        for word in words:

                        if len(line1 + " " + word) <= 14 and line1:

            print(f"\n{'='*60}")                line1 += " " + word

            print("🏆 FINAL JEOPARDY! 🏆")            elif len(line1 + word) <= 14:

            print(f"Category: {category.upper()}")                line1 += word

            print(f"{'='*60}")            else:

                            line2 += word + " " if not line2 else " " + word

            try:        

                wager = int(input(f"Enter your wager (you have ${self.score}): $"))        print(f"{line1[:14]:^14}│", end="")

                wager = max(0, min(wager, abs(self.score)))    print()

            except ValueError:    

                wager = 0    # Category headers - second line (for wrapped text)

                print("Invalid wager, betting $0")    has_wrapped = any(len(cat_name) > 14 for _, cat_name in categories[:6])

                if has_wrapped:

            print(f"\n❓ CLUE: {question}")        print("│", end="")

            print("⏰ Think about your answer...")        for pos, cat_name in categories[:6]:

                        words = cat_name.split()

            user_answer = input("\n🤔 What is your final answer? ").strip()            line1, line2 = "", ""

                        

            def normalize_answer(ans):            for word in words:

                ans = re.sub(r'[^\w\s]', '', ans.lower())                if len(line1 + " " + word) <= 14 and line1:

                ans = re.sub(r'\b(what|who|where|when|why|how|is|are|the|a|an)\b', '', ans)                    line1 += " " + word

                return re.sub(r'\s+', ' ', ans).strip()                elif len(line1 + word) <= 14:

                                line1 += word

            correct_answer = normalize_answer(answer)                else:

            user_normalized = normalize_answer(user_answer)                    line2 += word + " " if not line2 else " " + word

                        

            is_correct = correct_answer in user_normalized or user_normalized in correct_answer            line2 = line2.strip()[:14]

                        print(f"{line2:^14}│", end="")

            if is_correct:        print()

                print(f"✅ CORRECT! You won ${wager}!")    

                self.score += wager    # Separator between categories and values

            else:    print("├" + "─" * 14 + "┼" + "─" * 14 + "┼" + "─" * 14 + "┼" + "─" * 14 + "┼" + "─" * 14 + "┼" + "─" * 14 + "┤")

                print(f"❌ INCORRECT! The correct answer was: {answer}")    

                print(f"You lost ${wager}")    # Dollar value rows

                self.score -= wager    for row in range(5):

            print("│", end="")

    def play_game(self):        

        """Main game loop"""        for pos, cat_name in categories[:6]:

        print("🎮 Welcome to Command Line Jeopardy! 🎮")            cursor.execute("""

                        SELECT c.value, c.is_daily_double

        if not self.load_random_game():                FROM clues c

            print("❌ Could not load a game!")                JOIN categories cat ON c.category_id = cat.id

            return                JOIN rounds r ON c.round_id = r.id

                        WHERE r.show_id = ? AND r.name = ? AND cat.position = ? AND c.row_index = ?

        while True:            """, (game_id, round_name, pos, row))

            if not self.display_board():            

                break            clue_data = cursor.fetchone()

                        if clue_data:

            print("\nOptions:")                value, is_dd = clue_data

            print("1. Select a clue")                # Check if this clue has been used

            print("2. Switch to next round")                if (pos, row) in used_clues:

            print("3. Play Final Jeopardy")                    # Gray out used clues

            print("4. New game")                    print("   [USED]   ".center(14), end="│")

            print("5. Quit")                else:

                                # Show available clues

            choice = input("\nEnter your choice (1-5): ").strip()                    print(f"${value:,}".center(14), end="│")

                        else:

            if choice == '1':                print("---".center(14), end="│")

                clue_data = self.select_clue()        print()

                if clue_data:        

                    self.play_clue(clue_data)        # Add horizontal separator between rows (except after last row)

                            if row < 4:

                    if self.check_round_complete():            print("├" + "─" * 14 + "┼" + "─" * 14 + "┼" + "─" * 14 + "┼" + "─" * 14 + "┼" + "─" * 14 + "┼" + "─" * 14 + "┤")

                        if self.switch_round():    

                            continue    # Bottom border

                        else:    print("└" + "─" * 14 + "┴" + "─" * 14 + "┴" + "─" * 14 + "┴" + "─" * 14 + "┴" + "─" * 14 + "┴" + "─" * 14 + "┘")

                            break

            def check_answer(user_answer, correct_answer):

            elif choice == '2':    """Check if user's answer matches the correct answer (flexible matching)"""

                if not self.switch_round():    import re

                    print("❌ Cannot switch rounds!")    

                # Clean both answers - remove extra whitespace, parentheses, and normalize

            elif choice == '3':    def clean_answer(ans):

                self.play_final_jeopardy()        # Remove parentheses and contents

                break        ans = re.sub(r'\([^)]*\)', '', ans)

                    # Remove common prefixes/suffixes

            elif choice == '4':        ans = re.sub(r'^(the|a|an)\s+', '', ans, flags=re.IGNORECASE)

                self.__init__()        ans = re.sub(r'\s+(the|a|an)$', '', ans, flags=re.IGNORECASE)

                if not self.load_random_game():        # Remove punctuation and extra spaces

                    print("❌ Could not load a new game!")        ans = re.sub(r'[^\w\s]', '', ans)

                    break        ans = re.sub(r'\s+', ' ', ans).strip().lower()

                    return ans

            elif choice == '5':    

                break    user_clean = clean_answer(user_answer)

                correct_clean = clean_answer(correct_answer)

            else:    

                print("❌ Invalid choice!")    # Extract the main answer part (remove jeopardy question words)

            user_main = re.sub(r'^(what|who|where|when|why|how|which)\s+(is|are|was|were|did|do|does)\s+', '', user_clean)

        print(f"\n🎯 Final Score: ${self.score}")    

        print("Thanks for playing Jeopardy! 👋")    # Check for match

    return user_main == correct_clean or user_clean in correct_clean or correct_clean in user_clean

def main():

    game = JeopardyCLI()def play_clues(cursor, game_id, round_name, categories):

    game.play_game()    """Let user select and play individual clues"""

    

if __name__ == "__main__":    player_score = 0

    main()    used_clues = set()
    
    cursor.execute("""
        SELECT c.question, c.answer, c.value, c.is_daily_double, cat.name, cat.position, c.row_index
        FROM clues c
        JOIN categories cat ON c.category_id = cat.id
        JOIN rounds r ON c.round_id = r.id
        WHERE r.show_id = ? AND r.name = ?
        ORDER BY cat.position, c.row_index
    """, (game_id, round_name))
    
    all_clues = cursor.fetchall()
    
    while True:
        print(f"\n💰 Current Score: ${player_score}")
        print(f"📝 Select a clue:")
        print("   Format: column row (e.g., '1 3' for column 1, row 3)")
        print("   Type 'q' to quit")
        
        choice = input("➤ ").strip().lower()
        
        if choice == 'q':
            break
            
        try:
            col, row = choice.split()
            col, row = int(col) - 1, int(row) - 1  # Convert to 0-based
            
            if not (0 <= col <= 5 and 0 <= row <= 4):
                print("❌ Invalid position! Use columns 1-6, rows 1-5")
                continue
            
            if (col, row) in used_clues:
                print("❌ That clue has already been played!")
                continue
                
            clue = next((c for c in all_clues if c[5] == col and c[6] == row), None)
            
            if not clue:
                print("❌ No clue at that position!")
                continue
            
            used_clues.add((col, row))
            question, answer, value, is_dd, cat_name, _, _ = clue
            
            if is_dd:
                print(f"\n🎉 DAILY DOUBLE! 🎉")
                print(f"🎯 Category: {cat_name}")
                
                max_wager = max(player_score, 1000)
                print(f"💵 You can wager up to ${max_wager}")
                
                while True:
                    try:
                        wager_input = input(f"💰 How much do you want to wager? $").strip()
                        wager = int(wager_input)
                        
                        if wager < 5:
                            print("❌ Minimum wager is $5")
                            continue
                        elif wager > max_wager:
                            print(f"❌ Maximum wager is ${max_wager}")
                            continue
                        else:
                            break
                    except ValueError:
                        print("❌ Please enter a valid number")
                
                print(f"\n💰 Wagered: ${wager}")
                print(f"❓ {question}")
                
                user_answer = input("\n🎯 Your answer (in Jeopardy format - 'What is...', 'Who is...', etc.): ").strip()
                print(f"✅ Correct answer: {answer}")
                
                if check_answer(user_answer, answer):
                    player_score += wager
                    print(f"🎉 Correct! +${wager}")
                else:
                    player_score -= wager
                    print(f"❌ Incorrect! -${wager}")
                    print(f"💡 You said: {user_answer}")
            else:
                print(f"\n🎯 {cat_name}")
                print(f"💵 ${value}")
                print(f"❓ {question}")
                
                user_answer = input("\n🎯 Your answer (in Jeopardy format - 'What is...', 'Who is...', etc.): ").strip()
                print(f"✅ Correct answer: {answer}")
                
                if check_answer(user_answer, answer):
                    player_score += value
                    print(f"🎉 Correct! +${value}")
                else:
                    player_score -= value
                    print(f"❌ Incorrect! -${value}")
                    print(f"💡 You said: {user_answer}")
            
        except (ValueError, IndexError):
            print("❌ Invalid format! Use: column row (e.g., '1 3')")
    
    print(f"\n🏁 Final Score: ${player_score}")

def main():
    """Main function"""
    if not Path('jarchive.sqlite3').exists():
        print("❌ Database not found! Run the scraper first:")
        print("   python scrape_jarchive.py")
        sys.exit(1)
    
    print("🎮 Welcome to Command Line Jeopardy!")
    print("🎲 Loading a random game...")
    
    game_data = get_random_game()
    if not game_data:
        sys.exit(1)
    
    game_id, show_number, air_date, title = game_data
    print(f"\n🎯 Selected: Game {game_id} (Show #{show_number})")
    
    while True:
        print(f"\nWhat would you like to do?")
        print("1. 🎮 View full game board")
        print("2. 🎲 Get another random game")
        print("3. 🚪 Quit")
        
        choice = input("➤ ").strip()
        
        if choice == '1':
            display_game_board(game_id)
        elif choice == '2':
            game_data = get_random_game()
            if game_data:
                game_id, show_number, air_date, title = game_data
                print(f"\n🎯 New game: Game {game_id} (Show #{show_number})")
        elif choice == '3':
            print("👋 Thanks for playing Jeopardy!")
            break
        else:
            print("❌ Invalid choice! Pick 1, 2, or 3")

if __name__ == "__main__":
    main()