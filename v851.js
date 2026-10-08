(() => {
  "use strict";

  const VERSION = "8.5.5";
  const $ = id => document.getElementById(id);
  const q = (selector, root = document) => root.querySelector(selector);

  function applyDesignSystem() {
    document.documentElement.dataset.designSystem = "v851";
    document.body?.classList.add("v851-design-system");
  }

  function refreshVersionLabels() {
    const sidebarVersion = q(".v8472-version-row small");
    if (sidebarVersion) sidebarVersion.textContent = `V${VERSION}`;

    const footerVersion = $("footerVersion");
    if (footerVersion) footerVersion.textContent = `v${VERSION}`;

    const setupEyebrow = q(".setup-brand .eyebrow");
    if (setupEyebrow && /WORKDAY JOURNEY/i.test(setupEyebrow.textContent || "")) {
      setupEyebrow.textContent = `WORKDAY JOURNEY · V${VERSION}`;
    }

    const footerText = q('.footer [data-i18n="footerText"]');
    if (footerText) {
      footerText.textContent = localStorage.getItem("wp-language") === "en"
        ? `Workday Journey V${VERSION} · Final Polish · Finance Hub · Gamification · Core Pages · Design System`
        : `Workday Journey V${VERSION} · Final Polish · Finance Hub · Gamification · Core Pages · Design System`;
    }

    document.body?.setAttribute("data-app-version", VERSION);
  }

  function refresh() {
    applyDesignSystem();
    refreshVersionLabels();
  }

  let refreshTimer = 0;
  function schedule(delay = 80) {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refresh, delay);
  }

  window.addEventListener("hashchange", () => schedule(120));
  window.addEventListener("workday:v7-data-changed", () => schedule(140));
  window.addEventListener("workday:v8-auth-state", () => schedule(140));
  window.addEventListener("workday:v8-auth-complete", () => schedule(160));
  document.addEventListener("click", event => {
    if (event.target.closest?.(".lang-btn,[data-v802-lang],.font-picker-option")) schedule(180);
  }, true);

  const observer = new MutationObserver(records => {
    if (records.some(record => [...record.addedNodes].some(node => node?.nodeType === 1))) schedule(90);
  });
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });

  window.WorkdayV851 = { version: VERSION, refresh };
  refresh();
  setTimeout(refresh, 180);
})();
