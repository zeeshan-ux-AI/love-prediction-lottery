from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import sqlite3
import os
import time
from typing import Optional

app = FastAPI(title="LoveLottery Database API", version="1.0.0")

DB_FILE = "/tmp/lovelottery.db"
ADMIN_SECRET = os.environ.get("ADMIN_SECRET", "admin123")

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS love_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_name TEXT NOT NULL,
            lover_name TEXT NOT NULL,
            relation_type TEXT,
            compatibility_score INTEGER,
            verdict TEXT,
            prediction TEXT,
            created_at TEXT
        )
    """)
    conn.commit()
    conn.close()

# Initialize DB on startup
init_db()

class SpinRequest(BaseModel):
    user_name: str
    lover_name: str
    relation_type: Optional[str] = "Crush"
    compatibility_score: int
    verdict: str
    prediction: str

@app.get("/")
def read_root():
    return {"status": "online", "app": "LoveLottery Backend Database API", "version": "1.0.0"}

@app.post("/api/spin")
def record_spin(req: SpinRequest):
    if not req.user_name or not req.lover_name:
        raise HTTPException(status_code=400, detail="User name and lover name are required")

    created_at = time.strftime("%Y-%m-%d %H:%M:%S")
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO love_entries (user_name, lover_name, relation_type, compatibility_score, verdict, prediction, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (req.user_name, req.lover_name, req.relation_type, req.compatibility_score, req.verdict, req.prediction, created_at))
    
    conn.commit()
    entry_id = cursor.lastrowid
    conn.close()

    return {
        "status": "success",
        "message": "Love lottery entry logged into database successfully",
        "entry_id": entry_id
    }

@app.get("/api/admin/entries")
def get_admin_entries(secret: str = Query(...)):
    if secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Invalid admin password")

    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM love_entries ORDER BY id DESC LIMIT 200")
    rows = cursor.fetchall()
    conn.close()

    entries = [dict(r) for r in rows]
    return {
        "status": "success",
        "total": len(entries),
        "entries": entries
    }
