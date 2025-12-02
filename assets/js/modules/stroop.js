import { Timer } from "./timer.js";
import { COLORS, KEY_MAP, ROUNDS, WAIT_MIN_MS, WAIT_MAX_MS } from "./constants.js";
import { randomChoice, randomInt } from "./utils.js";

export class StroopTest {
  constructor(hooks = {}) {
    this.rounds = ROUNDS;
    this.index = 0;
    this.results = [];
    this.current = null;
    this.status = "idle";
    this.timer = new Timer();
    this.onWaiting = hooks.onWaiting;
    this.onStimulus = hooks.onStimulus;
    this.onAnswered = hooks.onAnswered;
    this.onComplete = hooks.onComplete;
  }
  start() {
    this.reset();
    this.nextRound();
  }
  nextRound() {
    if (this.index >= this.rounds) {
      this.status = "completed";
      if (this.onComplete) this.onComplete(this.getResults());
      return;
    }
    this.status = "waiting";
    const waitMs = randomInt(WAIT_MIN_MS, WAIT_MAX_MS);
    if (this.onWaiting) this.onWaiting(waitMs);
    setTimeout(() => {
      this._showStimulus();
    }, waitMs);
  }
  _showStimulus() {
    const wordIndex = randomInt(0, COLORS.cn.length - 1);
    const colorIndex = randomInt(0, COLORS.en.length - 1);
    const wordCn = COLORS.cn[wordIndex];
    const wordEn = COLORS.en[wordIndex];
    const colorEn = COLORS.en[colorIndex];
    this.current = { wordCn, wordEn, colorEn, wordIndex, colorIndex };
    this.status = "active";
    if (this.onStimulus) this.onStimulus(this.current);
    this.timer.start();
  }
  submitAnswer(key) {
    if (this.status !== "active") return false;
    const mapped = KEY_MAP[key.toLowerCase()];
    if (!mapped) return false;
    const correct = mapped === this.current.colorEn;
    const measured = this.timer.stop();
    const reactionMs = correct ? measured : null;
    const record = {
      round: this.index + 1,
      correct,
      reactionMs,
      wordCn: this.current.wordCn,
      colorEn: this.current.colorEn,
      input: mapped,
    };
    this.results.push(record);
    this.status = "answered";
    if (this.onAnswered) this.onAnswered(record);
    return true;
  }
  proceedNext() {
    if (this.status !== "answered") return false;
    this.index += 1;
    this.nextRound();
    return true;
  }
  getResults() {
    const totalErrors = this.results.filter((r) => !r.correct).length;
    const corrects = this.results.filter((r) => r.correct && typeof r.reactionMs === "number");
    const avgMs = corrects.length
      ? Math.round(corrects.reduce((sum, r) => sum + r.reactionMs, 0) / corrects.length)
      : 0;
    return { totalErrors, results: this.results.slice(), avgMs };
  }
  reset() {
    this.index = 0;
    this.results = [];
    this.current = null;
    this.status = "idle";
  }
  getStatus() {
    return this.status;
  }
}
