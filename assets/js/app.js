import { init as initDom, setWaiting, showStimulus, showAnswered, setStatus, resetView, renderStats, refs, setSkipLabel, applyLanguage, setRestartVisible, setStatsVisible, showEndMessage, setThemeLabel } from "./modules/dom.js";
import { StroopTest } from "./modules/stroop.js";
import { post } from "./modules/api.js";
import { checkAuthOnLoad, bindAuth, logoutAndShowAuth } from "./modules/auth.js";
import { fetchAndRenderHistory } from "./modules/history.js";
import { fetchAndRenderGlobalStats } from "./modules/global_stats.js";
import { fetchAndRenderRankings, bindRankingsModal } from "./modules/rankings.js";

function setup() {
  initDom();
  let autoNextEnabled = true;
  let currentLang = "zh";
  applyLanguage(currentLang);
  checkAuthOnLoad();
  bindAuth();
  bindRankingsModal();
  let dark = false;
  const test = new StroopTest({
    onWaiting: () => {
      setWaiting();
    },
    onStimulus: ({ wordCn, wordEn, colorEn }) => {
      const label = currentLang === "zh" ? wordCn : wordEn;
      showStimulus(label, colorEn);
    },
    onAnswered: (record) => {
      if (autoNextEnabled) {
        setTimeout(() => {
          test.proceedNext();
        }, 300);
      }
      showAnswered(record.correct);
    },
    onComplete: ({ totalErrors, results, avgMs }) => {
      setStatus("");
      showEndMessage();
      renderStats(totalErrors, results, avgMs);
      setStatsVisible(true);
      const s = document.getElementById('stats');
      if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' });
      applyLanguage(currentLang);
      setRestartVisible(true);
      // OFFLINE: 不提交后端，不拉取全局统计
    },
  });

  refs.testCard.addEventListener("click", () => {
    const st = test.getStatus();
    if (st === "idle") {
      resetView();
      test.start();
    } else if (!autoNextEnabled && st === "answered") {
      test.proceedNext();
    }
  });

  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (["f", "d", "j", "k"].includes(key)) {
      const accepted = test.submitAnswer(key);
      if (accepted) e.preventDefault();
      return;
    }
    if (e.key === " ") {
      const st = test.getStatus();
      if (st === "idle") {
        e.preventDefault();
        resetView();
        test.start();
      } else if (st === "completed") {
        e.preventDefault();
        setRestartVisible(false);
        resetView();
        test.start();
      } else if (!autoNextEnabled && st === "answered") {
        e.preventDefault();
        test.proceedNext();
      }
    }
  });

  setSkipLabel(true);
  refs.skipBtn.addEventListener("click", () => {
    autoNextEnabled = !autoNextEnabled;
    setSkipLabel(autoNextEnabled);
  });

  setThemeLabel(dark);
  refs.themeBtn.addEventListener("click", () => {
    dark = !dark;
    setThemeLabel(dark);
    document.body.classList.toggle("theme-dark", dark);
  });

  refs.restartBtn.addEventListener("click", () => {
    setRestartVisible(false);
    resetView();
    test.start();
  });

  refs.langBtn.addEventListener("click", () => {
    currentLang = currentLang === "zh" ? "en" : "zh";
    applyLanguage(currentLang);
    setSkipLabel(autoNextEnabled);
    // update current stimulus label if active
    const st = test.getStatus();
    if (st === "active" && test.current) {
      const label = currentLang === "zh" ? test.current.wordCn : test.current.wordEn;
      showStimulus(label, test.current.colorEn);
    } else if (st === "waiting") {
      setWaiting();
    } else if (st === "idle") {
      resetView();
    }
  });

  // OFFLINE: 历史记录按钮在离线模式下已隐藏

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await logoutAndShowAuth();
  });
}

document.addEventListener("DOMContentLoaded", setup);
  document.getElementById('rankBtn').addEventListener('click', () => {
    fetchAndRenderRankings();
  });
