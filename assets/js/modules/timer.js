export class Timer {
  constructor() {
    this._start = 0;
    this._running = false;
  }
  start() {
    this._start = performance.now();
    this._running = true;
  }
  stop() {
    if (!this._running) return 0;
    const e = performance.now() - this._start;
    this._running = false;
    return Math.round(e);
  }
  elapsedMs() {
    if (!this._running) return 0;
    return Math.round(performance.now() - this._start);
  }
}

