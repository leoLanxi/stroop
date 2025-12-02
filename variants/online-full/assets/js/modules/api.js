const API_BASES = ['/api', 'http://localhost:5050/api', 'http://127.0.0.1:5050/api'];

export async function get(path) {
  for (let i = 0; i < API_BASES.length; i++) {
    try {
      const r = await fetch(`${API_BASES[i]}${path}`, { credentials: 'include' });
      if (r.status === 501) continue;
      return await r.json();
    } catch (e) {
      continue;
    }
  }
  return { ok: false, error: 'NETWORK' };
}

export async function post(path, data) {
  for (let i = 0; i < API_BASES.length; i++) {
    try {
      const r = await fetch(`${API_BASES[i]}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data||{})
      });
      if (r.status === 501) continue;
      return await r.json();
    } catch (e) {
      continue;
    }
  }
  return { ok: false, error: 'NETWORK' };
}

