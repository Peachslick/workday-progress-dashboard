/* Workday Journey V8.5.5 — Final Polish & Responsive QA
 * Accessibility/visual helpers only: no changes to Coin, Bank, Exchange, or Cloud logic.
 */
(() => {
  "use strict";
  const VERSION = "8.6.0";
  const $ = id => document.getElementById(id);
  const one = (selector, root = document) => root.querySelector(selector);
  const all = (selector, root = document) => [...root.querySelectorAll(selector)];
  const thai = () => { try { return localStorage.getItem("wp-language") !== "en"; } catch (_) { return true; } };
  const copy = (th, en) => thai() ? th : en;
  const reduceMotion = () => document.body?.classList.contains("no-animations") || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  function addSkipLink() {
    const main = one("main.dashboard");
    if (!main) return;
    main.id ||= "v855Main";
    main.classList.add("v855-main-target");
    if (!main.hasAttribute("tabindex")) main.tabIndex = -1;
    let link = $("v855SkipLink");
    if (!link) {
      link = document.createElement("a");
      link.id = "v855SkipLink";
      link.className = "v855-skip-link";
      link.href = `#${main.id}`;
      // Hash navigation is used for routing, so prevent default anchor hash navigation.
      link.addEventListener("click", event => {
        event.preventDefault();
        main.focus({ preventScroll: true });
        main.scrollIntoView({ behavior: "instant", block: "start" });
      });
      document.body.prepend(link);
    }
    link.textContent = copy("ข้ามเมนูไปยังเนื้อหาหลัก", "Skip to main content");
  }

  function addBackToTop() {
    let button = $("v855BackToTop");
    if (!button) {
      button = document.createElement("button");
      button.id = "v855BackToTop";
      button.className = "v855-back-to-top";
      button.type = "button";
      button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
      button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: reduceMotion() ? "instant" : "smooth" });
        button.blur();
      });
      document.body.appendChild(button);
    }
    const title = copy("กลับขึ้นด้านบน", "Back to top");
    button.setAttribute("aria-label", title);
    button.title = title;
    updateBackToTop();
  }

  function updateBackToTop() {
    const button = $("v855BackToTop");
    if (!button) return;
    const visible = window.scrollY > 650 && !document.body.classList.contains("setup-open");
    button.classList.toggle("is-visible", visible);
    button.tabIndex = visible ? 0 : -1;
    button.setAttribute("aria-hidden", String(!visible));
  }

  function localizeFinanceTabs() {
    const labels = {
      bank: {
        savings: ["เงินออม", "Savings", "ฝาก ถอน และติดตาม Streak", "Deposit, withdraw and track your saving streak"],
        growth: ["การเติบโต", "Growth", "ดอกเบี้ยทบต้น ระดับ Savings และ Achievement", "Compound forecasts, saving tiers and achievements"],
        history: ["ประวัติ", "History", "รายการฝาก ถอน และดอกเบี้ยย้อนหลัง", "Deposit, withdrawal and interest history"]
      },
      exchange: {
        market: ["ตลาด", "Market", "ติดตามราคา เลือกหุ้น และซื้อขาย", "Explore prices, select assets and trade"],
        portfolio: ["พอร์ตของฉัน", "Portfolio", "ดูสินทรัพย์ ผลตอบแทน และความสำเร็จ", "Review holdings, performance and investor milestones"],
        academy: ["เรียนรู้", "Academy", "เรียน 7 บทและทำ Mini Quiz", "Learn through seven lessons and mini quizzes"],
        history: ["ประวัติ", "History", "ตรวจสอบรายการซื้อขายทั้งหมด", "Review every simulated trade"]
      }
    };
    all("[data-v854-tabs]").forEach(nav => {
      const page = nav.dataset.v854Tabs;
      nav.setAttribute("aria-label", page === "bank" ? copy("หมวด Work Bank", "Work Bank sections") : copy("หมวด Work Exchange", "Work Exchange sections"));
      all('[role="tab"]', nav).forEach(tab => {
        const labelsForTab = labels[page]?.[tab.dataset.v854Tab];
        if (!labelsForTab) return;
        const [th, en] = labelsForTab;
        const desktop = one("span:not(.v854-tab-icon)", tab);
        const mobile = one("small", tab);
        if (desktop) desktop.textContent = copy(th, en);
        if (mobile) mobile.textContent = copy(th, en);
        tab.setAttribute("aria-label", copy(th, en));
        const panel = $(tab.getAttribute("aria-controls"));
        const title = one(".v854-panel-heading h3", panel || document.createElement("div"));
        const description = one(".v854-panel-heading p:not(.eyebrow)", panel || document.createElement("div"));
        if (title) title.textContent = copy(th, en);
        if (description) description.textContent = copy(labelsForTab[2], labelsForTab[3]);
      });
    });
  }

  function updateAccessibility() {
    const dock = $("v850MobileDock");
    if (dock) {
      dock.setAttribute("aria-label", copy("เมนูนำทางมือถือ", "Mobile navigation"));
      all("[data-v850-mobile-route]", dock).forEach(btn => {
        const text = one("small", btn)?.textContent.trim();
        if (text) btn.setAttribute("aria-label", text);
      });
    }
    all("[data-v84-watch]").forEach(btn => {
      const selected = btn.classList.contains("on");
      btn.setAttribute("aria-label", copy(selected ? "นำออกจากรายการติดตาม" : "เพิ่มในรายการติดตาม", selected ? "Remove from watchlist" : "Add to watchlist"));
      btn.setAttribute("aria-pressed", String(selected));
    });
    all(".v7-empty, .empty-state").forEach(node => {
      if (!node.hasAttribute("role")) node.setAttribute("role", "note");
    });
  }

  const busyObserved = new WeakSet();
  function watchBusyButtons() {
    ["v8SignIn", "v8SignUp", "v848RedeemSubmit", "v848SaveCode"].forEach(id => {
      const button = $(id);
      if (!button) return;
      const update = () => {
        const pending = button.disabled && /(?:กำลัง|please wait|loading|signing|creating|redeeming|processing|saving|submitting|uploading)/i.test(button.textContent || "");
        if (pending && button.getAttribute("aria-busy") !== "true") button.setAttribute("aria-busy", "true");
        if (!pending && button.hasAttribute("aria-busy")) button.removeAttribute("aria-busy");
      };
      if (!busyObserved.has(button)) {
        busyObserved.add(button);
        new MutationObserver(update).observe(button, { attributes: true, attributeFilter: ["disabled"], childList: true, subtree: true, characterData: true });
      }
      update();
    });
  }

  function activeModal() {
    // Visible, foreground dialog only. Dialogs controlled by the existing app stay in charge of opening/closing.
    return all('[role="dialog"][aria-modal="true"]').reverse().find(dialog => {
      if (dialog.getAttribute("aria-hidden") === "true" || dialog.closest("[hidden]")) return false;
      const box = dialog.getBoundingClientRect();
      const style = getComputedStyle(dialog);
      return box.width > 0 && box.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    });
  }
  document.addEventListener("keydown", event => {
    if (event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey) return;
    const modal = activeModal();
    if (!modal) return;
    const focusable = all('a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])', modal)
      .filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== "hidden");
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (!modal.contains(document.activeElement)) {
      event.preventDefault(); (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }, true);

  function updateVersion() {
    const side = one(".v8472-version-row small");
    if (side && side.textContent !== `V${VERSION}`) side.textContent = `V${VERSION}`;
    const footer = $("footerVersion");
    if (footer && footer.textContent !== `v${VERSION}`) footer.textContent = `v${VERSION}`;
    const footText = one('.footer [data-i18n="footerText"]');
    const summary = `Workday Journey V${VERSION} · Final Polish · Finance Hub · Gamification · Core Pages · Design System`;
    if (footText && footText.textContent !== summary) footText.textContent = summary;
    all(".v7-page-heading .eyebrow, .setup-brand .eyebrow, #v8472ChangelogBackdrop .v8472-changelog-hero .eyebrow").forEach(node => {
      if (/WORKDAY JOURNEY/i.test(node.textContent || "") && node.textContent !== `WORKDAY JOURNEY · V${VERSION}`) node.textContent = `WORKDAY JOURNEY · V${VERSION}`;
    });
    document.body.setAttribute("data-app-version", VERSION);
  }

  function refresh() {
    document.body?.classList.add("v855-polish");
    addSkipLink();
    addBackToTop();
    localizeFinanceTabs();
    updateAccessibility();
    watchBusyButtons();
    updateVersion();
  }
  let scheduled;
  function schedule(delay = 90) { clearTimeout(scheduled); scheduled = setTimeout(refresh, delay); }
  let framePending = false;
  window.addEventListener("scroll", () => {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(() => { framePending = false; updateBackToTop(); });
  }, { passive: true });
  window.addEventListener("hashchange", () => schedule(120));
  window.addEventListener("workday:v7-data-changed", () => schedule(130));
  window.addEventListener("workday:v8-data-changed", () => schedule(130));
  window.addEventListener("workday:v8-auth-complete", () => schedule(170));
  document.addEventListener("click", event => {
    if (event.target.closest?.(".lang-btn,[data-v802-lang],[data-v854-tab],[data-v84-watch],[data-v81-tab],[data-v76-project-view],#v8472WhatsNewBtn")) schedule(160);
  }, true);
  // Only new/replaced sections of the app trigger a refresh; avoid expensive global attribute observation.
  const observer = new MutationObserver(records => {
    if (records.some(record => [...record.addedNodes].some(node => node.nodeType === 1 &&
      (node.matches?.(".v854-tabs,#v850MobileDock,#v7JournalPage,#v7ProjectsPage,#v84ExchangePage,#v83BankPage,#v8472ChangelogBackdrop,.empty-state,.v7-empty,#v848RedeemSubmit") ||
       node.querySelector?.(".v854-tabs,#v850MobileDock,#v8472ChangelogBackdrop,.empty-state,.v7-empty,#v848RedeemSubmit"))))) schedule(100);
  });
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });
  window.WorkdayV855 = { version: VERSION, refresh };
  refresh();
  setTimeout(refresh, 240);
})();
