import { STRINGS } from "./i18n.js";

let STR = STRINGS.zh;

const els = {
  testCard: null,
  colorWord: null,
  statusText: null,
  skipBtn: null,
  langBtn: null,
  themeBtn: null,
  stats: null,
  statsSummary: null,
  statsList: null,
  guideSubtitle: null,
  restartBtn: null,
};

export function init() {
  els.testCard = document.getElementById("testCard");
  els.colorWord = document.getElementById("colorWord");
  els.statusText = document.getElementById("statusText");
  els.skipBtn = document.getElementById("skipBtn");
  els.langBtn = document.getElementById("langBtn");
  els.themeBtn = document.getElementById("themeBtn");
  els.stats = document.getElementById("stats");
  els.statsSummary = document.getElementById("statsSummary");
  els.statsList = document.getElementById("statsList");
  els.guideSubtitle = document.getElementById("guideSubtitle");
  els.restartBtn = document.getElementById("restartBtn");
}

export function setWaiting() {
  els.testCard.classList.add("test-card--waiting");
  els.colorWord.style.color = "";
  els.colorWord.textContent = STR.waitingMessage;
  setStatus(STR.waitingStatus);
}

export function showStimulus(wordCn, colorEn) {
  els.testCard.classList.remove("test-card--waiting");
  els.colorWord.textContent = wordCn;
  els.colorWord.style.color = `var(--${colorEn}-soft)`;
  setStatus(STR.promptStatus);
}

export function showAnswered(correct) {
  const clsCorrect = "test-card__status--correct";
  const clsIncorrect = "test-card__status--incorrect";
  els.statusText.classList.remove(clsCorrect, clsIncorrect);
  if (correct) {
    els.statusText.classList.add(clsCorrect);
    els.statusText.textContent = STR.correctText;
  } else {
    els.statusText.classList.add(clsIncorrect);
    els.statusText.textContent = STR.incorrectText;
  }
}

export function setStatus(text) {
  els.statusText.classList.remove("test-card__status--correct", "test-card__status--incorrect");
  els.statusText.textContent = text;
}


export function resetView() {
  els.colorWord.textContent = STR.startPrompt;
  els.colorWord.style.color = "";
  setStatus("");
  renderStats(null, []);
  setStatsVisible(false);
}

export function renderStats(totalErrors, results, avgMs) {
  els.statsList.innerHTML = "";
  if (totalErrors == null) {
    els.statsSummary.textContent = "";
    return;
  }
  els.statsSummary.textContent = STR.statsSummary(totalErrors, avgMs);
  results.forEach((r) => {
    const li = document.createElement("li");
    li.className = "stats__item";
    const left = document.createElement("span");
    left.textContent = STR.statsItemLeft(r.round);
    const right = document.createElement("span");
    right.textContent = STR.statsItemRight(r);
    right.className = r.correct ? "stats__value--correct" : "stats__value--incorrect";
    li.appendChild(left);
    li.appendChild(right);
    els.statsList.appendChild(li);
  });
  setStatsVisible(true);
}

export const refs = els;

export function setStatsVisible(visible) {
  if (!els.stats) return;
  els.stats.classList.toggle("stats--visible", !!visible);
  if (visible) {
    els.stats.classList.remove("is-hidden");
  } else {
    els.stats.classList.add("is-hidden");
  }
}

export function setSkipLabel(enabled) {
  if (!els.skipBtn) return;
  els.skipBtn.textContent = STR.skipLabel(enabled);
}

export function setRestartVisible(visible) {
  if (!els.restartBtn) return;
  els.restartBtn.classList.toggle("is-hidden", !visible);
}

export function setThemeLabel(enabled) {
  if (!els.themeBtn) return;
  els.themeBtn.textContent = `夜间模式：${enabled ? "开启" : "关闭"}`;
}

export function applyLanguage(lang) {
  STR = STRINGS[lang] || STRINGS.zh;
  if (els.testCard) {
    const title = els.testCard.querySelector(".test-card__title");
    if (title) title.textContent = STR.title;
  }
  if (els.langBtn) els.langBtn.textContent = STR.langButton;
  if (els.guideSubtitle) els.guideSubtitle.textContent = STR.subtitle;
  const hints = document.querySelectorAll(".kbd-hints__item");
  hints.forEach((el) => {
    if (el.classList.contains("kbd-hints__item--red")) el.textContent = STR.kbdHints.red;
    else if (el.classList.contains("kbd-hints__item--yellow")) el.textContent = STR.kbdHints.yellow;
    else if (el.classList.contains("kbd-hints__item--blue")) el.textContent = STR.kbdHints.blue;
    else if (el.classList.contains("kbd-hints__item--green")) el.textContent = STR.kbdHints.green;
  });
}

export function showEndMessage() {
  els.colorWord.style.color = "";
  els.colorWord.textContent = STR.endMessage;
}

export function setUserName(name) {
  const b = document.getElementById("userBadge");
  if (!b) return;
  b.textContent = name ? `用户名：${name}` : "未登录";
}
