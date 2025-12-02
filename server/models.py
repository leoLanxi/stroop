from datetime import datetime
from .db import get_conn

def create_user(username, password_hash):
  conn = get_conn()
  cur = conn.cursor()
  try:
    cur.execute("INSERT INTO users(username, password_hash) VALUES(%s,%s)", (username, password_hash))
    conn.commit()
    return cur.lastrowid
  finally:
    cur.close(); conn.close()

def get_user_by_username(username):
  conn = get_conn()
  cur = conn.cursor(dictionary=True)
  try:
    cur.execute("SELECT id, username, password_hash FROM users WHERE username=%s", (username,))
    row = cur.fetchone()
    return row
  finally:
    cur.close(); conn.close()

def insert_game_result(user_id, avg_ms, error_rate, total_rounds):
  conn = get_conn()
  cur = conn.cursor()
  try:
    cur.execute(
      "INSERT INTO game_results(user_id, avg_reaction_time_ms, error_rate, total_rounds) VALUES(%s,%s,%s,%s)",
      (user_id, int(avg_ms), float(error_rate), int(total_rounds))
    )
    conn.commit()
    return cur.lastrowid
  finally:
    cur.close(); conn.close()

def get_user_history(user_id):
  conn = get_conn()
  cur = conn.cursor(dictionary=True)
  try:
    cur.execute("SELECT avg_reaction_time_ms, error_rate, created_at FROM game_results WHERE user_id=%s ORDER BY created_at DESC", (user_id,))
    rows = cur.fetchall()
    return rows
  finally:
    cur.close(); conn.close()

def get_user_aggregates(user_id):
  conn = get_conn()
  cur = conn.cursor()
  try:
    cur.execute("SELECT AVG(avg_reaction_time_ms), AVG(error_rate) FROM game_results WHERE user_id=%s", (user_id,))
    a, e = cur.fetchone()
    return (int(a) if a is not None else 0, float(e) if e is not None else 0.0)
  finally:
    cur.close(); conn.close()

def get_global_stats():
  conn = get_conn()
  cur = conn.cursor()
  try:
    cur.execute("SELECT AVG(avg_reaction_time_ms) FROM game_results")
    avg = cur.fetchone()[0]
    avg_val = int(avg) if avg is not None else 0
    cur.execute("SELECT avg_reaction_time_ms FROM game_results")
    vals = [v[0] for v in cur.fetchall()]
    total = len(vals)
    bins = [(0,200),(200,400),(400,600),(600,800),(801,10**9)]
    dist = []
    for lo,hi in bins:
      count = sum(1 for x in vals if (x>=lo and (x<=hi if hi<10**9 else x>=lo))) if total>0 else 0
      pct = (count/total) if total>0 else 0
      label = f"{lo}-{hi}ms" if hi<10**9 else ">800ms"
      dist.append({"range": label, "count": count, "percentage": round(pct,2)})
    # Percent bins: 0–400ms split into 20 equal bins of 20ms, and a last bin >400ms
    percent_bins = []
    # Define 9 fixed bins
    ranges = [
      (None, 200),        # <200ms
      (200, 300),
      (300, 400),
      (400, 600),
      (600, 800),
      (800, 1000),
      (1000, 1200),
      (1200, 1500),
      (1500, None),       # >1500ms
    ]
    labels = [
      "<200ms", "200-300ms", "300-400ms", "400-600ms", "600-800ms",
      "800-1000ms", "1000-1200ms", "1200-1500ms", ">1500ms"
    ]
    if total > 0:
      for (lo, hi), label in zip(ranges, labels):
        if lo is None and hi is not None:
          count = sum(1 for x in vals if x < hi)
        elif lo is not None and hi is None:
          count = sum(1 for x in vals if x > lo)
        else:
          count = sum(1 for x in vals if (x >= lo and x < hi))
        percent_bins.append({"range": label, "count": count, "percentage": round((count/total) if total>0 else 0, 2)})
    else:
      percent_bins = [{"range": label, "count": 0, "percentage": 0.0} for label in labels]
    return avg_val, dist, percent_bins
  finally:
    cur.close(); conn.close()
def get_fastest_rankings():
  conn = get_conn()
  cur = conn.cursor(dictionary=True)
  try:
    # top 10 fastest game records with accuracy > 50%
    cur.execute(
      """
      SELECT u.username AS username,
             gr.avg_reaction_time_ms AS avg_ms,
             gr.error_rate AS error_rate,
             gr.created_at AS created_at
      FROM game_results gr
      JOIN users u ON u.id = gr.user_id
      WHERE gr.error_rate < 0.5
      ORDER BY gr.avg_reaction_time_ms ASC, gr.created_at DESC
      LIMIT 10
      """
    )
    rows = cur.fetchall() or []
    return [
      {
        "username": r.get("username"),
        "avg_reaction_time_ms": int(r.get("avg_ms") or 0),
        "accuracy": round(1.0 - float(r.get("error_rate") or 0.0), 2),
        "created_at": (r.get("created_at").isoformat() if r.get("created_at") else None),
      }
      for r in rows
    ]
  finally:
    cur.close(); conn.close()
