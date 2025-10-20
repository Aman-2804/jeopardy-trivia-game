#!/usr/bin/env python3
"""
Authentic Jeopardy GUI - Using Professional CSS Styling
Based on real Jeopardy board CSS
"""
import sys
import sqlite3
import random
import re
from pathlib import Path
from functools import partial
import pygame
import subprocess
from PySide6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                               QHBoxLayout, QGridLayout, QPushButton, QLabel, 
                               QLineEdit, QSpinBox, QMessageBox, QTextEdit, QStackedWidget, QDialog)
from PySide6.QtCore import Qt, QTimer
from PySide6.QtGui import QFont, QPalette, QColor, QPixmap

class AuthenticJeopardyGUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("JEOPARDY!")
        # Start fullscreen for title screen
        self.showFullScreen()
        
        # Initialize pygame for audio
        pygame.mixer.init()
        
        # Game state
        self.current_game_id = None
        self.current_round = 'jeopardy'
        self.score = 0
        self.answered_clues = set()
        self.board_buttons = {}
        self.current_clue_data = None

        
        # Database
        self.db_path = Path(__file__).parent.parent / 'jarchive.sqlite3'
        
        # Create stacked widget to switch between title screen and game
        self.stacked_widget = QStackedWidget()
        self.setCentralWidget(self.stacked_widget)
        
        self.setup_authentic_styling()
        self.create_game_screen()
        
        # Load and start the game immediately with theme music
        self.load_random_game()
        self.play_title_music()
    
    def setup_authentic_styling(self):
        """Setup Jeopardy styling to match Figma template exactly"""
        # Main window styling to match Figma (black background)
        self.setStyleSheet("""
            QMainWindow {
                background: #000000;
                color: #ffffff;
                font-family: 'Swiss 911 BT', sans-serif;
            }
        """)
        
        # Exact colors from Figma template
        self.colors = {
            'jeopardy_blue': '#071277',
            'money_gold': '#FDC065',
            'white': '#FFFFFF',
            'black': '#000000',
            'dark_blue': '#071277',
            'text_white': '#FFFFFF',
            'border_black': '#000000',
            'answered': '#222222',
            'modal_bg': '#071277',
            'daily_double': '#FFD700'
        }

    def play_title_music(self):
        """Play the title screen music"""
        if pygame.mixer.get_init():
            try:
                music_path = Path(__file__).parent.parent / 'assets' / 'audio' / "myinstants.mp3"
                if music_path.exists():
                    pygame.mixer.music.load(str(music_path))
                    pygame.mixer.music.play(-1)  # Loop indefinitely
            except Exception as e:
                print(f"Error playing title music: {e}")
        """Play the title screen music"""
        try:
            music_path = Path(__file__).parent.parent / 'assets' / 'audio' / 'myinstants.mp3'
            if music_path.exists():
                pygame.mixer.music.load(str(music_path))
                pygame.mixer.music.play(-1)  # Loop indefinitely
        except Exception as e:
            print(f"Could not play title music: {e}")
    

    def play_correct_sound(self):
        """Play sound for correct answers"""
        try:
            sound_path = Path(__file__).parent.parent / 'assets' / 'audio' / 'track_07.mp3'
            if sound_path.exists():
                pygame.mixer.Sound(str(sound_path)).play()
        except Exception as e:
            print(f"Could not play correct sound: {e}")
    
    def play_wrong_sound(self):
        """Play sound for wrong answers"""
        try:
            sound_path = Path(__file__).parent.parent / 'assets' / 'audio' / 'wrong.mp3'
            if sound_path.exists():
                pygame.mixer.Sound(str(sound_path)).play()
        except Exception as e:
            print(f"Could not play wrong sound: {e}")
    

    def create_game_screen(self):
        """Create the main game screen"""
        game_widget = QWidget()
        self.game_widget = game_widget
        self.setup_ui(game_widget)
        self.stacked_widget.addWidget(game_widget)
    
    def setup_ui(self, parent_widget=None):
        """Setup the main UI"""
        if parent_widget is None:
            parent_widget = QWidget()
            self.setCentralWidget(parent_widget)
        
        layout = QVBoxLayout(parent_widget)
        layout.setSpacing(0)  # No gaps like real Jeopardy
        layout.setContentsMargins(10, 10, 10, 10)
        
        # Header with game info and score
        self.create_header(layout)
        
        # Main display area (board or clue)
        self.create_display_area(layout)
        
        # Controls
        self.create_controls(layout)
    
    def create_header(self, parent_layout):
        """Create header with authentic styling"""
        header_widget = QWidget()
        header_widget.setFixedHeight(60)
        header_widget.setStyleSheet(f"""
            QWidget {{
                background: {self.colors['border_black']};
                color: {self.colors['text_white']};
            }}
        """)
        
        header_layout = QHBoxLayout(header_widget)
        header_layout.setContentsMargins(20, 10, 20, 10)
        
        # Game info
        self.game_info = QLabel("Loading game...")
        self.game_info.setFont(QFont("Arial", 14, QFont.Bold))
        self.game_info.setStyleSheet("color: white;")
        
        # Title
        title = QLabel("JEOPARDY!")
        title.setFont(QFont("Arial Black", 24, QFont.Bold))
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet(f"""
            color: {self.colors['money_gold']};
            font-weight: bold;
        """)
        
        # Score (.player-score style: Fjalla One font, 150% size)
        self.score_label = QLabel("Score: $0")
        self.score_label.setFont(QFont("Fjalla One", 18, QFont.Bold))
        self.score_label.setAlignment(Qt.AlignRight)
        self.score_label.setStyleSheet(f"""
            color: {self.colors['money_gold']};
            font-family: 'Fjalla One', sans-serif;
            font-size: 150%;
        """)
        
        header_layout.addWidget(self.game_info)
        header_layout.addWidget(title, 1)
        header_layout.addWidget(self.score_label)
        
        parent_layout.addWidget(header_widget)
    
    def create_display_area(self, parent_layout):
        """Create main display area"""
        self.display_widget = QWidget()
        self.display_layout = QVBoxLayout(self.display_widget)
        self.display_layout.setContentsMargins(0, 0, 0, 0)
        self.display_layout.setSpacing(0)
        
        parent_layout.addWidget(self.display_widget, 1)
        
        # Board will be shown after loading a game
    
    def show_board(self):
        """Display the authentic Jeopardy board"""
        # Clear current display but preserve controls
        for i in reversed(range(self.display_layout.count())):
            widget = self.display_layout.itemAt(i).widget()
            if widget:
                widget.setParent(None)
                widget.deleteLater()
        
        # Create board widget with Figma-style spacing
        board_widget = QWidget()
        board_layout = QGridLayout(board_widget)
        board_layout.setSpacing(2)  # Clean spacing like Figma
        board_layout.setContentsMargins(20, 20, 20, 20)  # Clean margins
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get categories for current round
            cursor.execute("""
                SELECT c.position, c.name, c.id
                FROM categories c
                JOIN rounds r ON c.round_id = r.id
                JOIN shows s ON r.show_id = s.id
                WHERE s.id = ? AND r.name = ?
                ORDER BY c.position
                LIMIT 6
            """, (self.current_game_id, self.current_round))
            
            categories = cursor.fetchall()[:6]
            
            if not categories:
                return
            
            # Row 0: Categories (.category-cell: font-size: 200%)
            for col, (pos, cat_name, cat_id) in enumerate(categories):
                cat_label = QLabel(cat_name.upper())
                cat_label.setAlignment(Qt.AlignCenter)
                cat_label.setFont(QFont("Swiss 911 BT", 22, QFont.Black))  # Bigger like Figma
                cat_label.setWordWrap(True)
                
                # Figma-style category cells - bigger white text
                cat_label.setStyleSheet(f"""
                    QLabel {{
                        background: {self.colors['jeopardy_blue']};
                        color: {self.colors['text_white']};
                        border: 3px solid {self.colors['border_black']};
                        padding: 15px 8px;
                        min-height: 100px;
                        font-weight: 900;
                        font-family: 'Swiss 911 BT', sans-serif;
                        font-size: 22px;
                        text-align: center;
                        text-transform: uppercase;
                    }}
                """)
                
                board_layout.addWidget(cat_label, 0, col)
            
            # Rows 1-5: Money amounts (16% height each, 600% font size)
            values = [200, 400, 600, 800, 1000] if self.current_round == 'jeopardy' else [400, 800, 1200, 1600, 2000]
            
            for row, value in enumerate(values, 1):
                for col, (pos, cat_name, cat_id) in enumerate(categories):
                    # Get clue
                    cursor.execute("""
                        SELECT id, question, answer, value, is_daily_double
                        FROM clues
                        WHERE category_id = ? AND row_index = ?
                    """, (cat_id, row - 1))
                    
                    clue_data = cursor.fetchone()
                    
                    if clue_data:
                        clue_id, question, answer, clue_value, is_dd = clue_data
                        
                        # Button state
                        if clue_id in self.answered_clues:
                            btn_text = ""
                            bg_color = self.colors['answered']
                            enabled = False
                        else:
                            btn_text = f"${clue_value or value}"
                            bg_color = self.colors['jeopardy_blue']  # Hide Daily Double - all clues look the same!
                            enabled = True
                        
                        money_btn = QPushButton(btn_text)
                        money_btn.setFont(QFont("Swiss 911 BT", 36, QFont.Black))  # Bigger like Figma
                        money_btn.setEnabled(enabled)
                        
                        # Figma-style money cells - bigger bright gold text
                        money_btn.setStyleSheet(f"""
                            QPushButton {{
                                background: {bg_color};
                                color: {self.colors['money_gold']};
                                border: 3px solid {self.colors['border_black']};
                                min-height: 100px;
                                font-size: 36px;
                                font-weight: 900;
                                font-family: 'Swiss 911 BT', sans-serif;
                                text-align: center;
                            }}
                            QPushButton:hover:enabled {{
                                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                                    stop:0 {bg_color}, stop:1 rgba(255,255,255,0.1));
                                color: #fcd34d;
                            }}
                            QPushButton:disabled {{
                                background: {self.colors['answered']};
                                color: #666666;
                            }}
                        """)
                        
                        if enabled:
                            # Use partial to avoid lambda closure issues
                            money_btn.clicked.connect(
                                partial(self.handle_clue_click, clue_id, question, answer, clue_value or value, is_dd, cat_name)
                            )
                        
                        board_layout.addWidget(money_btn, row, col)
                        self.board_buttons[clue_id] = money_btn
            
            # Set row heights to match CSS (16% each)
            for row in range(6):  # 6 rows total
                board_layout.setRowStretch(row, 16 if row > 0 else 16)
            
            # Set column widths evenly
            for col in range(6):
                board_layout.setColumnStretch(col, 1)
            
            conn.close()
            
        except Exception as e:
            print(f"Error creating board: {e}")
        
        self.display_layout.addWidget(board_widget)
        

    
    def handle_clue_click(self, clue_id, question, answer, value, is_daily_double, category_name):
        """Handle clue button click - fixes lambda closure issues"""
        self.show_clue(clue_id, question, answer, value, is_daily_double, category_name)
    
    def show_clue(self, clue_id, question, answer, value, is_daily_double, category_name):
        """Show clue in modal-style display with category name"""
        # Handle Daily Double wagering BEFORE showing anything
        final_value = value
        if is_daily_double:
            # Show Daily Double screen first - keep it secret!
            wager_dialog = QDialog(self)
            wager_dialog.setWindowTitle("Daily Double!")
            wager_dialog.setModal(True)
            wager_dialog.resize(400, 200)
            
            layout = QVBoxLayout(wager_dialog)
            
            # Daily Double announcement
            dd_label = QLabel("DAILY DOUBLE!")
            dd_label.setAlignment(Qt.AlignCenter)
            dd_label.setFont(QFont("Arial", 24, QFont.Bold))
            dd_label.setStyleSheet(f"color: {self.colors['daily_double']}; padding: 20px;")
            layout.addWidget(dd_label)
            
            # Wager input
            wager_label = QLabel(f"Enter your wager (minimum ${value}):")
            wager_label.setAlignment(Qt.AlignCenter)
            layout.addWidget(wager_label)
            
            wager_input = QSpinBox()
            wager_input.setMinimum(value)
            wager_input.setMaximum(max(self.score if self.score > 0 else 1000, value))
            wager_input.setValue(value)
            wager_input.setAlignment(Qt.AlignCenter)
            layout.addWidget(wager_input)
            
            # Buttons
            button_layout = QHBoxLayout()
            ok_btn = QPushButton("Continue")
            ok_btn.clicked.connect(wager_dialog.accept)
            button_layout.addWidget(ok_btn)
            layout.addLayout(button_layout)
            
            if wager_dialog.exec() == QDialog.Accepted:
                final_value = wager_input.value()
            else:
                final_value = value
        
        # Store clue data
        self.current_clue_data = {
            'id': clue_id,
            'question': question,
            'answer': answer,
            'value': final_value,
            'is_dd': is_daily_double
        }
        
        # Clear display for clue view
        for i in reversed(range(self.display_layout.count())):
            widget = self.display_layout.itemAt(i).widget()
            if widget:
                widget.setParent(None)
                widget.deleteLater()
        
        # Create modal-style clue display with clean styling
        clue_widget = QWidget()
        clue_widget.setStyleSheet(f"""
            QWidget {{
                background: {self.colors['modal_bg']};
                color: {self.colors['text_white']};
            }}
        """)
        
        clue_layout = QVBoxLayout(clue_widget)
        clue_layout.setSpacing(40)  # More spacing for clean look
        clue_layout.setContentsMargins(60, 60, 60, 60)  # More margins for centered look
        
        # Daily Double indicator (only if needed)
        if is_daily_double:
            dd_label = QLabel("DAILY DOUBLE!")
            dd_label.setFont(QFont("Arial Black", 32, QFont.Bold))
            dd_label.setAlignment(Qt.AlignCenter)
            dd_label.setStyleSheet(f"""
                color: {self.colors['daily_double']};
                background: rgba(255,102,0,0.3);
                border: 4px solid {self.colors['daily_double']};
                border-radius: 15px;
                padding: 15px;
                margin: 10px;
            """)
            clue_layout.addWidget(dd_label)

        # Question (main focus - large, centered, prominent)
        # Ensure question is not empty and properly formatted
        display_question = question.strip() if question else "Question text not available"
        
        # Adjust font size based on text length for better readability
        font_size = 36  # Larger base font
        if len(display_question) > 150:
            font_size = 32
        elif len(display_question) > 250:
            font_size = 28
            
        question_label = QLabel(display_question.upper())
        question_label.setFont(QFont("Arial", font_size, QFont.Bold))
        question_label.setAlignment(Qt.AlignCenter)
        question_label.setWordWrap(True)
        question_label.setStyleSheet(f"""
            color: {self.colors['text_white']};
            background: rgba(0,0,0,0.3);
            border-radius: 20px;
            padding: 50px;
            line-height: 1.4;
            font-weight: bold;
            font-family: Arial, sans-serif;
            font-size: {font_size}px;
            text-transform: uppercase;
        """)
        clue_layout.addWidget(question_label, 1)  # Give it most of the space
        
        # Answer input section
        input_section = QWidget()
        input_layout = QVBoxLayout(input_section)
        
        prompt_label = QLabel("What is your answer?")
        prompt_label.setFont(QFont("Arial", 18, QFont.Bold))
        prompt_label.setAlignment(Qt.AlignCenter)
        prompt_label.setStyleSheet(f"color: {self.colors['text_white']};")
        input_layout.addWidget(prompt_label)
        
        self.answer_input = QLineEdit()
        self.answer_input.setFont(QFont("Arial", 20))
        self.answer_input.setAlignment(Qt.AlignCenter)
        self.answer_input.setStyleSheet(f"""
            QLineEdit {{
                padding: 15px;
                border: 4px solid {self.colors['money_gold']};
                border-radius: 10px;
                background: white;
                color: black;
                font-size: 20px;
                text-align: center;
            }}
        """)
        self.answer_input.returnPressed.connect(self.submit_answer)
        input_layout.addWidget(self.answer_input)
        
        clue_layout.addWidget(input_section)
        
        # Control buttons
        button_layout = QHBoxLayout()
        
        submit_btn = QPushButton("SUBMIT ANSWER")
        submit_btn.setFont(QFont("Arial", 16, QFont.Bold))
        submit_btn.setStyleSheet("""
            QPushButton {
                background: #00aa00;
                color: white;
                border: 3px solid #006600;
                border-radius: 10px;
                padding: 15px 30px;
                font-weight: bold;
            }
            QPushButton:hover {
                background: #00cc00;
            }
        """)
        submit_btn.clicked.connect(self.submit_answer)
        
        show_btn = QPushButton("SHOW ANSWER")
        show_btn.setFont(QFont("Arial", 16, QFont.Bold))
        show_btn.setStyleSheet("""
            QPushButton {
                background: #cc3300;
                color: white;
                border: 3px solid #990000;
                border-radius: 10px;
                padding: 15px 30px;
                font-weight: bold;
            }
            QPushButton:hover {
                background: #ff3300;
            }
        """)
        show_btn.clicked.connect(self.show_answer)
        
        back_btn = QPushButton("BACK TO BOARD")
        back_btn.setFont(QFont("Arial", 16, QFont.Bold))
        back_btn.setStyleSheet("""
            QPushButton {
                background: #666666;
                color: white;
                border: 3px solid #333333;
                border-radius: 10px;
                padding: 15px 30px;
                font-weight: bold;
            }
            QPushButton:hover {
                background: #888888;
            }
        """)
        back_btn.clicked.connect(self.back_to_board)
        
        button_layout.addWidget(submit_btn)
        button_layout.addWidget(show_btn)
        button_layout.addWidget(back_btn)
        clue_layout.addLayout(button_layout)
        
        self.display_layout.addWidget(clue_widget)
        
        # Focus on input
        self.answer_input.setFocus()
    
    def create_controls(self, parent_layout):
        """Create control buttons"""
        controls_widget = QWidget()
        controls_widget.setFixedHeight(50)
        controls_widget.setStyleSheet(f"background: {self.colors['border_black']};")
        
        controls_layout = QHBoxLayout(controls_widget)
        controls_layout.setContentsMargins(20, 10, 20, 10)
        
        button_style = f"""
            QPushButton {{
                background: {self.colors['money_gold']};
                color: {self.colors['border_black']};
                border: 2px solid #cc7700;
                border-radius: 8px;
                padding: 8px 16px;
                font-weight: bold;
                font-size: 14px;
            }}
            QPushButton:hover {{
                background: #ffbb77;
            }}
        """
        
        new_game_btn = QPushButton("New Game")
        new_game_btn.setStyleSheet(button_style)
        new_game_btn.clicked.connect(self.load_random_game)
        
        next_round_btn = QPushButton("Next Round")
        next_round_btn.setStyleSheet(button_style)
        next_round_btn.clicked.connect(self.next_round)
        
        switch_btn = QPushButton("Switch Round")
        switch_btn.setStyleSheet(button_style)
        switch_btn.clicked.connect(self.switch_round)
        
        reset_btn = QPushButton("Reset Score")
        reset_btn.setStyleSheet(button_style)
        reset_btn.clicked.connect(self.reset_score)
        
        controls_layout.addStretch()
        controls_layout.addWidget(new_game_btn)
        controls_layout.addWidget(next_round_btn)
        controls_layout.addWidget(switch_btn)
        controls_layout.addWidget(reset_btn)
        controls_layout.addStretch()
        
        parent_layout.addWidget(controls_widget)
    
    def submit_answer(self):
        """Submit answer and check correctness"""
        if not self.current_clue_data:
            return
        
        user_answer = self.answer_input.text().strip()
        correct = self.is_correct_answer(user_answer, self.current_clue_data['answer'])
        value = self.current_clue_data['value']
        
        if correct:
            self.score += value
            msg = f"✅ CORRECT!\n\nYou earned ${value}!"
            self.play_correct_sound()  # Play correct answer sound
        else:
            self.score -= value
            msg = f"❌ INCORRECT!\n\nCorrect answer: {self.current_clue_data['answer']}\n\nYou lost ${value}!"
            self.play_wrong_sound()  # Play wrong answer sound
        
        self.update_score()
        self.mark_answered()
        QMessageBox.information(self, "Result", msg)
        self.back_to_board()
    
    def show_answer(self):
        """Show the correct answer"""
        if not self.current_clue_data:
            return
        
        answer = self.current_clue_data['answer']
        QMessageBox.information(self, "Answer", f"The correct answer was:\n\n{answer}")
        self.mark_answered()
        self.back_to_board()
    
    def back_to_board(self):
        """Return to the game board"""
        self.show_board()
        self.current_clue_data = None
    
    def mark_answered(self):
        """Mark current clue as answered"""
        if self.current_clue_data:
            self.answered_clues.add(self.current_clue_data['id'])
    
    def is_correct_answer(self, user_answer, correct_answer):
        """Check if answer is correct with flexible matching"""
        if not user_answer.strip():
            return False
        
        # Normalize both answers
        user = re.sub(r'[^\w\s]', '', user_answer.lower().strip())
        correct = re.sub(r'[^\w\s]', '', correct_answer.lower().strip())
        
        # Remove question words
        for word in ['what', 'who', 'where', 'when', 'why', 'how', 'is', 'are', 'the', 'a', 'an']:
            user = user.replace(f' {word} ', ' ').replace(f'{word} ', '').replace(f' {word}', '')
            correct = correct.replace(f' {word} ', ' ').replace(f'{word} ', '').replace(f' {word}', '')
        
        user, correct = user.strip(), correct.strip()
        
        # Various matching strategies
        if user == correct:
            return True
        if user in correct or correct in user:
            return True
        
        # Word overlap check
        user_words, correct_words = set(user.split()), set(correct.split())
        if user_words and correct_words:
            overlap = len(user_words.intersection(correct_words))
            if overlap >= min(len(user_words), len(correct_words)) * 0.7:
                return True
        
        return False
    
    def load_random_game(self):
        """Load a random game with complete clue data for both rounds"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Only select games that have complete data for BOTH jeopardy and double rounds
            cursor.execute("""
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
            """)
            
            game = cursor.fetchone()

            # If no complete games, try a fallback: any show in the DB
            if not game:
                cursor.execute("SELECT id, show_number FROM shows ORDER BY RANDOM() LIMIT 1")
                game = cursor.fetchone()

            if game:
                self.current_game_id, show_num = game
                # Calculate approximate year based on show number
                # Show #1 aired in 1984, roughly 230 shows per year
                approx_year = 1984 + (show_num - 1) // 230
                self.game_info.setText(f"Show #{show_num} • ~{approx_year}")
                self.current_round = 'jeopardy'  # ALWAYS start with regular Jeopardy!
                self.answered_clues.clear()
                self.show_board()
                print(f"Loaded complete game: Show #{show_num} from ~{approx_year}")
            else:
                # If there are no shows in DB at all, attempt to auto-run scraper once
                conn.close()
                conn = sqlite3.connect(self.db_path)
                cur2 = conn.cursor()
                cur2.execute("SELECT COUNT(*) FROM shows")
                total_shows = cur2.fetchone()[0]
                conn.close()

                if total_shows == 0:
                    QMessageBox.information(self, "Info", "No shows in DB — running scraper to fetch one random game now.")
                    try:
                        scraper = Path(__file__).parent.parent / 'scrape_jarchive.py'
                        if scraper.exists():
                            subprocess.run([sys.executable, str(scraper)], check=True)
                            # Try loading again after scraper
                            return self.load_random_game()
                    except Exception as e:
                        print('Auto-scrape failed:', e)

                QMessageBox.critical(self, "Error", "No complete games found! Run the scraper to get more data.")
            
            conn.close()
            
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to load game: {e}")
            print(f"Error loading game: {e}")
    
    def next_round(self):
        """Progress to next round: Jeopardy -> Double Jeopardy -> Final Jeopardy"""
        if self.current_round == 'jeopardy':
            self.current_round = 'double'
            self.show_board()
        elif self.current_round == 'double':
            self.show_final_jeopardy()
        else:
            # Already in Final Jeopardy, maybe restart or stay
            QMessageBox.information(self, "Game Complete", "This game is complete! Start a new game to continue playing.")
    
    def switch_round(self):
        """Switch between Jeopardy and Double Jeopardy (for manual control)"""
        if self.current_round in ['jeopardy', 'double']:
            self.current_round = 'double' if self.current_round == 'jeopardy' else 'jeopardy'
            self.show_board()
        else:
            QMessageBox.information(self, "Round Switch", "Cannot switch rounds during Final Jeopardy.")
    
    def show_final_jeopardy(self):
        """Show Final Jeopardy round"""
        self.current_round = 'final'
        
        # Clear current display
        for i in reversed(range(self.display_layout.count())):
            widget = self.display_layout.itemAt(i).widget()
            if widget:
                widget.setParent(None)
                widget.deleteLater()
        
        # Create Final Jeopardy widget
        final_widget = QWidget()
        final_layout = QVBoxLayout(final_widget)
        final_layout.setAlignment(Qt.AlignCenter)
        
        title_label = QLabel("FINAL JEOPARDY!")
        title_label.setFont(QFont("Arial Black", 48, QFont.Bold))
        title_label.setAlignment(Qt.AlignCenter)
        title_label.setStyleSheet(f"""
            color: {self.colors['money_gold']};
            padding: 50px;
            font-weight: bold;
        """)
        final_layout.addWidget(title_label)
        
        info_label = QLabel("Final Jeopardy implementation coming soon!\n\nUse 'New Game' to start a fresh game.")
        info_label.setFont(QFont("Arial", 20))
        info_label.setAlignment(Qt.AlignCenter)
        info_label.setStyleSheet(f"color: {self.colors['text_white']}; padding: 30px;")
        final_layout.addWidget(info_label)
        
        self.display_layout.addWidget(final_widget)
    
    def reset_score(self):
        """Reset score to zero"""
        self.score = 0
        self.update_score()
    
    def update_score(self):
        """Update score display"""
        self.score_label.setText(f"Score: ${self.score:,}")

def main():
    # Ensure at least one game exists by running the single-random-game scraper
    try:
        scraper = Path(__file__).parent.parent / 'scrape_jarchive.py'
        if scraper.exists():
            print('Fetching a random game before launching GUI...')
            subprocess.run([sys.executable, str(scraper)], check=False)
        else:
            print('scrape_jarchive.py not found; skipping auto-fetch')
    except Exception as e:
        print('Auto-fetch failed:', e)

    app = QApplication(sys.argv)
    window = AuthenticJeopardyGUI()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()