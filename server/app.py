import os
import logging
from pathlib import Path
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import bcrypt
from .db import ensure_database_and_tables
from .models import create_user, get_user_by_username, insert_game_result, get_user_history, get_user_aggregates, get_global_stats, get_fastest_rankings

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY','dev-secret')
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": ["http://localhost:8000","http://127.0.0.1:8000","http://[::1]:8000"]}})
ensure_database_and_tables()

Path('logs').mkdir(exist_ok=True)
access_logger = logging.getLogger('access')
error_logger = logging.getLogger('error')
access_logger.setLevel(logging.INFO)
error_logger.setLevel(logging.WARNING)
fh1 = logging.FileHandler('logs/access.log')
fh2 = logging.FileHandler('logs/error.log')
fmt = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
fh1.setFormatter(fmt)
fh2.setFormatter(fmt)
access_logger.addHandler(fh1)
error_logger.addHandler(fh2)

@app.post('/api/register')
def register():
  data = request.get_json(silent=True) or {}
  u = (data.get('username') or '').strip()
  p = data.get('password') or ''
  if not u or not p:
    error_logger.error(f"register BAD_REQUEST ip={request.remote_addr} username={u}")
    return jsonify({"ok": False, "error": "BAD_REQUEST"}), 400
  if len(u) < 2:
    error_logger.error(f"register BAD_USERNAME ip={request.remote_addr} username={u}")
    return jsonify({"ok": False, "error": "BAD_USERNAME"}), 400
  if len(p) < 2:
    error_logger.error(f"register BAD_PASSWORD ip={request.remote_addr} username={u}")
    return jsonify({"ok": False, "error": "BAD_PASSWORD"}), 400
  if get_user_by_username(u):
    error_logger.error(f"register USERNAME_TAKEN ip={request.remote_addr} username={u}")
    return jsonify({"ok": False, "error": "USERNAME_TAKEN"}), 409
  ph = bcrypt.hashpw(p.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
  create_user(u, ph)
  access_logger.info(f"register ok ip={request.remote_addr} username={u}")
  return jsonify({"ok": True})

@app.post('/api/login')
def login():
  data = request.get_json(silent=True) or {}
  u = (data.get('username') or '').strip()
  p = data.get('password') or ''
  user = get_user_by_username(u)
  if not user:
    error_logger.error(f"login INVALID_CREDENTIALS ip={request.remote_addr} username={u}")
    return jsonify({"ok": False, "error": "INVALID_CREDENTIALS"}), 401
  if not bcrypt.checkpw(p.encode('utf-8'), user['password_hash'].encode('utf-8')):
    error_logger.error(f"login INVALID_CREDENTIALS ip={request.remote_addr} username={u}")
    return jsonify({"ok": False, "error": "INVALID_CREDENTIALS"}), 401
  session['uid'] = user['id']
  session['username'] = user['username']
  access_logger.info(f"login ok ip={request.remote_addr} username={u}")
  return jsonify({"ok": True, "user": {"id": user['id'], "username": user['username']}})

@app.post('/api/logout')
def logout():
  session.clear()
  access_logger.info(f"logout ok ip={request.remote_addr}")
  return jsonify({"ok": True})

@app.get('/api/me')
def me():
  uid = session.get('uid')
  if not uid:
    return jsonify({"ok": False}), 200
  return jsonify({"ok": True, "user": {"id": uid, "username": session.get('username')}})

def require_login():
  uid = session.get('uid')
  return uid

@app.post('/api/game/submit')
def submit_game():
  uid = require_login()
  if not uid:
    error_logger.error(f"submit UNAUTHORIZED ip={request.remote_addr}")
    return jsonify({"ok": False, "error": "UNAUTHORIZED"}), 401
  data = request.get_json(silent=True) or {}
  avg = int(data.get('avg_reaction_time_ms') or 0)
  err = float(data.get('error_rate') or 0)
  rounds = int(data.get('total_rounds') or 0)
  gid = insert_game_result(uid, avg, err, rounds)
  access_logger.info(f"submit ok ip={request.remote_addr} uid={uid} gid={gid} avg={avg} err={err} rounds={rounds}")
  return jsonify({"ok": True, "id": gid})

@app.get('/api/game/history')
def history():
  uid = require_login()
  if not uid:
    return jsonify({"ok": False, "error": "UNAUTHORIZED"}), 401
  rows = get_user_history(uid)
  overall_avg, overall_err = get_user_aggregates(uid)
  return jsonify({"ok": True, "records": rows, "aggregates": {"overall_avg_reaction_time_ms": overall_avg, "overall_error_rate": overall_err}})

@app.get('/api/game/stats/global')
def global_stats():
  avg, dist, percent_bins = get_global_stats()
  return jsonify({"ok": True, "global_avg_reaction_time_ms": avg, "distribution": dist, "percent_bins": percent_bins})

@app.get('/api/game/rankings')
def rankings():
  data = get_fastest_rankings()
  return jsonify({"ok": True, "rankings": data})

if __name__ == '__main__':
  app.run(host='127.0.0.1', port=int(os.environ.get('PORT','5050')))
