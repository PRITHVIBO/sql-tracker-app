# QueryQuest — SQL Practice Tracker

QueryQuest is a local-first SQL preparation app for tracking questions, attempts, saved queries, optimized solutions, and revision notes across several practice platforms.

## Run the app

1. Extract `sql-tracker-app.zip` to a folder.
2. Open `index.html` in Chrome or Edge.
3. Choose a question, open its original practice link, then return to QueryQuest to save your work.

Optional: run `start-app.bat` on Windows with Python installed, or start a local server in this folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Included question bank

The bundled catalogue currently contains **478 curated tracker entries** across six source labels. Each entry has a topic, an Easy/Medium/Hard label, and a practice link. The catalogue is designed to provide broad coverage; it is **not a claim that every live question from every platform has been mirrored**. Platform libraries change, some lists are account-specific, and some source catalogues expose a general practice page instead of a unique public problem URL.

| Source label | Entries | Easy | Medium | Hard |
|---|---:|---:|---:|---:|
| LeetCode | 240 | 99 | 98 | 43 |
| TakeUForward (TUF) | 49 | 36 | 13 | 0 |
| GeeksforGeeks (GFG) | 60 | 23 | 24 | 13 |
| HackerRank | 59 | 38 | 16 | 5 |
| DataLemur | 62 | 22 | 26 | 14 |
| SQLPractice | 8 | 6 | 2 | 0 |
| **Total** | **478** | **224** | **179** | **75** |

LeetCode, HackerRank, and DataLemur entries are based on named public SQL problem catalogues. TUF entries combine named questions from its SQL practice list and public SQL index sources. GFG contains public exercise/tutorial-based practice prompts linked to its SQL exercises page; those prompts are not represented as a one-to-one scrape of every GFG article. SQLPractice entries are a small topic-based supplement.

## What you can do

- Search all questions and filter by source, topic, difficulty, and progress status.
- Add, open, edit, and delete questions (CRUD).
- Track status: Not Started, In Progress, Solved, or Review.
- Save separate **Brute Force SQL** and **Optimized SQL** queries, approach explanations, time/space complexity, attempt counts, and revision notes.
- Use a practice queue and resume unfinished questions.
- Export a single problem or all saved SQL work to plain-text `.txt` files.
- Import/export question banks through CSV and export/restore a full JSON backup.
- Keep working offline after the app files are downloaded (external links need an internet connection).

## Import the full catalogue

`full-question-bank.csv` is the complete import-ready CSV that matches the bundled seed bank. It contains the 478 entries and these columns:

`title, platform, topic, difficulty, url, status, attempts, statement, bruteQuery, optimizedQuery, explanation, complexityTime, complexitySpace, notes, lastPracticed`

You can use **Manage Data → Import CSV** to import it into the app. Existing rows with the same source label and question title are skipped, so re-importing the same catalogue will not create duplicate rows. `sample-questions.csv` is only a small template/sample.

## Official and public practice sources

- [LeetCode SQL 50](https://leetcode.com/studyplan/top-sql-50/)
- [LeetCode Database problem index](https://www.stealthinterview.ai/leetcode/sql)
- [TakeUForward SQL Practice Set](https://takeuforward.org/practice/sql)
- [TUF SQL 75 Prep Hub](https://takeuforward.org/prep-hub/sql---75-frequently-asked-interview-questions)
- [GeeksforGeeks SQL Exercises](https://www.geeksforgeeks.org/sql/sql-exercises/)
- [HackerRank SQL domain](https://www.hackerrank.com/domains/sql)
- [DataLemur SQL questions](https://datalemur.com/questions?category=SQL)
- [SQLPractice](https://www.sqlpractice.in/sql75)

## Data and privacy notes

- QueryQuest is a static client-side application. It does **not** execute SQL against a database, scrape platform pages, authenticate to the practice sites, or submit answers to them. Open each problem on its source platform, then save your query here.
- Progress and query notes are saved in this browser's local storage; they are not synced to an account or another device.
- The app keeps existing saved progress when a newer bundled catalogue is loaded and adds newly introduced seed questions. Export a JSON backup regularly, especially before clearing browser data or moving the app to another computer.
- Use the JSON backup to move progress and saved SQL between browsers/devices.

## Responsive layout update

The desktop layout is tuned to the 1800px-wide reference: a 234px sidebar, matched content margins, and fixed question-table columns so the topic, difficulty, status, and actions remain aligned without clipping. On smaller screens, the sidebar and table keep their mobile behavior. The starter catalogue is exposed to the app on first load so a fresh browser can initialize the 478-question bank.
