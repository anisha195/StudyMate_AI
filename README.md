# StudyMate AI

A study assistant where you upload PDFs (notes, textbook chapters, past papers) and ask
questions that get answered **using only your uploaded material** — not generic internet
knowledge. Built with React, Node/Express, MongoDB, a Python microservice (PyPDF +
Sentence Transformers + ChromaDB), and Claude for answer generation.

This guide assumes you've never set this kind of project up before. Follow it top to
bottom, in order, and don't skip the "check it worked" steps.

---

## 1. What you need installed first

Install these **before** touching the project. Restart your terminal / VS Code after
each install so it picks up the new PATH entries.

| Tool | Version | Download | Check it's installed |
|---|---|---|---|
| Node.js | 18 or later | https://nodejs.org (LTS) | `node --version` |
| Python | **3.11** (not 3.12/3.13/3.14) | https://www.python.org/downloads/ | `py -3.11 --version` (Windows) or `python3.11 --version` (Mac/Linux) |
| MongoDB | Community Server, or a free Atlas cloud cluster | https://www.mongodb.com/try/download/community or https://www.mongodb.com/cloud/atlas | `mongod --version` (if local) |
| Git (optional but recommended) | any recent version | https://git-scm.com | `git --version` |
| VS Code | any recent version | https://code.visualstudio.com | — |

**Why Python 3.11 specifically?** The AI microservice depends on packages
(`chromadb`, `tokenizers`, `pydantic-core`) that don't yet ship ready-made installers
for the newest Python releases. On 3.11 everything installs in seconds; on 3.13/3.14
pip tries to *compile* those packages from source and fails unless you have Rust and
Visual Studio's C++ build tools installed. Save yourself the trouble — use 3.11.

**Windows users:** when you install Python 3.11, check the box **"Add python.exe to
PATH"** during setup, and check **"py launcher"** stays enabled (it's on by default).

**A Claude API key.** Sign up at https://console.anthropic.com, create an API key, and
keep it handy — you'll paste it into a `.env` file in step 4.

---

## 2. Get the project into VS Code

1. Unzip `studymate-ai.zip` somewhere simple, e.g. `C:\projects\studymate-ai` or
   `~/projects/studymate-ai`.
2. Open VS Code → **File → Open Folder** → select the unzipped `studymate-ai` folder.
3. Open a terminal inside VS Code: **Terminal → New Terminal** (or `` Ctrl+` ``).
4. You'll run three services, each in its own terminal tab. Click the **split
   terminal** icon (or `` Ctrl+Shift+5 ``) twice so you have three side by side. Label
   them mentally: **AI service**, **Backend**, **Frontend**.

You will start them in this exact order, because each one depends on the previous
one being reachable:

```
1. MongoDB running  →  2. AI service (port 8001)  →  3. Backend (port 5000)  →  4. Frontend (port 5173)
```

---

## 3. Start MongoDB

**Option A — local install:** open a separate terminal (or let it run as a background
service, which the Windows/Mac installers usually set up automatically) and run:

```bash
mongod
```

Leave it running. If it's already running as a system service you can skip this —
test with `mongo` or `mongosh` in a terminal; if it connects, it's already up.

**Option B — MongoDB Atlas (no local install, easier for beginners):**
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Click **Connect → Drivers**, copy the connection string
   (looks like `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/`)
3. You'll paste this into `backend/.env` in the next step instead of the local URI.

---

## 4. Start the AI microservice (Python — PDF processing, embeddings, ChromaDB)

In your **first terminal tab**:

```bash
cd ai-service
```

Create a virtual environment using Python 3.11 specifically:

```bash
# Windows
py -3.11 -m venv venv
venv\Scripts\activate

# Mac/Linux
python3.11 -m venv venv
source venv/bin/activate
```

Your terminal prompt should now show `(venv)` at the start of the line. Then install
dependencies:

```bash

pip install --upgrade pip
pip install -r requirements.txtcd
```

This step downloads PyTorch and a small embedding model, so it can take a few minutes
and a few hundred MB the first time. Let it finish.

Run the service:
```bash
uvicorn main:app --reload --port 8001
```

**Check it worked:** open http://localhost:8001/health in a browser. You should see:
```json
{"status":"ok","service":"studymate-ai-processing"}
```

Leave this terminal running. Don't close it.

---

## 5. Start the backend (Node/Express — auth, MongoDB, orchestration, Claude)

In your **second terminal tab**:

```bash
cd backend
```

Copy the example environment file:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Open the new `backend/.env` file in VS Code and fill in:

```env
MONGO_URI=mongodb://localhost:27017/studymate_ai
# or, if using Atlas: mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/studymate_ai

JWT_SECRET=any_long_random_string_you_make_up_here
ANTHROPIC_API_KEY=sk-ant-your-real-key-here
CLAUDE_MODEL=claude-sonnet-4-6
AI_SERVICE_URL=http://localhost:8001
CLIENT_URL=http://localhost:5173
PORT=5000
```

Install dependencies and run:

```bash
npm install
npm run dev
```

**Check it worked:** open http://localhost:5000/api/health. You should see:
```json
{"status":"ok","service":"studymate-ai-backend"}
```

If you see a MongoDB connection error in the terminal instead, double check
`MONGO_URI` — that's almost always the cause.

Leave this terminal running too.

---

## 6. Start the frontend (React — the claymorphic UI)

In your **third terminal tab**:

```bash
cd frontend
```

Copy the example environment file:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

The default value is already correct for local development:
```env
VITE_API_URL=http://localhost:5000/api
```

Install dependencies and run:

```bash
npm install
npm run dev
```

Vite will print a local URL — open **http://localhost:5173** in your browser.

---

## 7. Use the app

1. You'll land on the login page — click **Create an account** and register.
2. On the **Dashboard**, drag a PDF into the upload box (or click to browse). Give it
   a subject name if you like.
3. Wait for its status pill to change from **Processing** to **Ready** (this runs
   PyPDF extraction + embedding + ChromaDB indexing in the background — a few seconds
   for a short PDF, longer for a big textbook).
4. Click **Ask** on that document, or go to **Study Chat** and pick it from the
   dropdown.
5. Ask a question about the content. The answer is generated by Claude using only
   the chunks retrieved from that PDF, and each answer shows which page(s) it drew
   from.

---

## 8. Stopping and restarting later

To stop everything: go to each of the three terminals and press `Ctrl+C`.

To start again next time, you only need to repeat the **run** command in each folder
(not the install steps, unless you changed dependencies):

```bash
# Terminal 1
cd ai-service && venv\Scripts\activate   (or source venv/bin/activate on Mac/Linux)
uvicorn main:app --reload --port 8001

# Terminal 2
cd backend
npm run dev

# Terminal 3
cd frontend
npm run dev
```

Plus make sure MongoDB is running (Option A or B from step 3).

---

## 9. Troubleshooting

**`pip install` fails trying to compile `tokenizers`/`pydantic-core`/`chroma-hnswlib`,
mentions `link.exe not found` or Rust/Cargo**
→ You're on the wrong Python version (3.12+). Redo step 4 with Python 3.11. Delete the
`venv` folder first (`rmdir /s venv` on Windows, `rm -rf venv` on Mac/Linux) before
recreating it.

**Backend terminal shows `MongoDB connection error`**
→ MongoDB isn't running, or `MONGO_URI` in `backend/.env` is wrong. Confirm step 3.

**Uploading a PDF gets stuck on "Processing" or flips to "Failed"**
→ Check the AI service terminal (tab 1) for the actual error. Common cause: the PDF
is scanned images with no real text layer (PyPDF can't extract text from a picture of
a page — it would need OCR, which this project doesn't include).

**"Failed to process the PDF" or 502 error on upload**
→ The backend can't reach the AI service. Confirm tab 1 is still running and
`AI_SERVICE_URL` in `backend/.env` matches its port (8001 by default).

**Claude answers say it has no information / everything is "not covered"**
→ The document status must be **Ready**, and you must have it selected in the Study
Chat dropdown (not "All materials") for retrieval to search it.

**`ANTHROPIC_API_KEY` errors (401/403) when asking a question**
→ Double-check the key in `backend/.env` is correct and active on
https://console.anthropic.com, and that you saved the file and restarted `npm run dev`
(env files are only read on startup).

**Port already in use (`EADDRINUSE`)**
→ Something else is already using 5000, 5173, or 8001. Either stop that process, or
change the port in the relevant `.env`/`vite.config.js` and update the other
service's URL to match.

---

## 10. Project structure

```
studymate-ai/
├── ai-service/     → Python/FastAPI: PDF text extraction, embeddings, ChromaDB
├── backend/        → Node/Express: auth, MongoDB, orchestration, Claude calls
└── frontend/       → React/Vite: claymorphic UI
```

See each folder's code for inline comments explaining what each file does. If you get
stuck, re-read step 9 first — most first-time setup issues are covered there.
