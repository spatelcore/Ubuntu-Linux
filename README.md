# Ubuntu-Linux

Learning Ubuntu for the Canonical **sys admin** exam.

## Ubuntu Terminal Exam Trainer

A self-contained, browser-based study app for clearing the **Using Linux Terminal**
section of the [Canonical sysadmin exam](https://canonical.com/academy/exam-content).
No build step, no dependencies — just open `index.html`.

### Features

- **Dashboard** — progress tracking (saved in your browser via `localStorage`).
- **Study** — structured notes covering every objective in the exam outline.
- **Cheatsheet** — searchable command reference.
- **Flashcards** — flip-card drilling with Known / Review marking.
- **Quiz** — multiple-choice questions with instant feedback and explanations.
- **Terminal Practice** — a safe, simulated Ubuntu shell (virtual filesystem,
  pipes, redirection, grep/sed/find, etc.). Nothing touches your real system.

### Exam coverage

1. **Navigating Files & Filesystems** — navigation, regex, pipes, redirection, search/compare/modify.
2. **Managing System Resources** — logs & log rotation, `fdisk`/`fsck`/`parted`, crontab, log troubleshooting.
3. **Securing Filesystem Access** — SSH keys, security settings, password complexity/expiry, sudo policies, users/groups, ownership & permissions.

### Run it

Just open the file:

```bash
open index.html          # macOS
```

Or serve it locally:

```bash
python3 -m http.server 8123
# then visit http://localhost:8123
```

### Project structure

```
.
├── index.html                 # app shell + tab UI
├── css/styles.css             # styling (light/dark aware)
├── js/app.js                  # routing, quiz engine, progress
├── js/terminal.js             # simulated shell + virtual filesystem
└── data/
    ├── topics.js              # study notes
    ├── quiz.js                # question bank
    ├── flashcards.js          # flashcard deck
    └── commands.js            # cheatsheet
```

> Not affiliated with Canonical. Built for self-study.
