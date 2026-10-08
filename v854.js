/* Workday Journey V8.5.4 — Finance Hub Refresh
 * Presentation layer only: moves existing DOM nodes without cloning them.
 * All existing Bank, Exchange, Academy and transaction handlers remain attached.
 */
(() => {
  "use strict";

  const VERSION = "8.6.0.1";
  const $ = id => document.getElementById(id);
  const q = (selector, root = document) => root.querySelector(selector);
  const isThai = () => localStorage.getItem("wp-language") !== "en";
  const copy = (th, en) => isThai() ? th : en;
  const ST = { bank: "wdj-v854-bank-tab", exchange: "wdj-v854-exchange-tab" };
  const CONFIG = {
    bank: [
      ["savings", "💳", "Savings", "เงินออม", "ฝาก ถอน และติดตาม Streak", "Deposit, withdraw and track your saving streak"],
      ["growth", "📈", "Growth", "การเติบโต", "ดอกเบี้ยทบต้น ระดับ Savings และ Achievement", "Compound forecasts, saving tiers and achievements"],
      ["history", "🧾", "History", "ประวัติ", "รายการฝาก ถอน และดอกเบี้ยย้อนหลัง", "Deposit, withdrawal and interest history"]
    ],
    exchange: [
      ["market", "📊", "Market", "ตลาด", "ติดตามราคา เลือกหุ้น และซื้อขาย", "Explore prices, select assets and trade"],
      ["portfolio", "💼", "Portfolio", "พอร์ตของฉัน", "ดูสินทรัพย์ ผลตอบแทน และความสำเร็จ", "Review holdings, performance and investor milestones"],
      ["academy", "🎓", "Academy", "เรียนรู้", "เรียน 7 บทและทำ Mini Quiz", "Learn through seven lessons and mini quizzes"],
      ["history", "🕒", "History", "ประวัติ", "ตรวจสอบรายการซื้อขายทั้งหมด", "Review every simulated trade"]
    ]
  };

  function selectedTab(page) {
    const valid = CONFIG[page].map(item => item[0]);
    try {
      const stored = sessionStorage.getItem(ST[page]);
      if (valid.includes(stored)) return stored;
    } catch (_) {}
    return valid[0];
  }
  function storeTab(page, tab) {
    try { sessionStorage.setItem(ST[page], tab); } catch (_) {}
  }

  function setTab(root, page, tab, focus = false) {
    const nav = q(`[data-v854-tabs="${page}"]`, root);
    if (!nav || !CONFIG[page].some(item => item[0] === tab)) return;
    storeTab(page, tab);
    nav.querySelectorAll('[role="tab"]').forEach(btn => {
      const active = btn.dataset.v854Tab === tab;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
      btn.tabIndex = active ? 0 : -1;
      if (active && focus) btn.focus();
    });
    root.querySelectorAll(`.v854-panel[data-v854-panel]`).forEach(panel => {
      if (panel.dataset.v854Panel !== page) return;
      const active = panel.dataset.v854Section === tab;
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    });
  }

  function makeNav(root, page, anchor) {
    const nav = document.createElement("nav");
    nav.className = "v854-tabs";
    nav.dataset.v854Tabs = page;
    nav.setAttribute("role", "tablist");
    nav.setAttribute("aria-label", page === "bank" ? "Work Bank sections" : "Work Exchange sections");
    CONFIG[page].forEach(([id, icon, en, th]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "v854-tab";
      btn.id = `v854-${page}-tab-${id}`;
      btn.dataset.v854Tab = id;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-controls", `v854-${page}-panel-${id}`);
      btn.setAttribute("aria-selected", "false");
      btn.tabIndex = -1;
      const art = document.createElement("span"); art.className = "v854-tab-icon"; art.textContent = icon;
      const label = document.createElement("span"); label.textContent = en;
      const mobile = document.createElement("small"); mobile.textContent = isThai() ? th : en;
      btn.append(art, label, mobile);
      btn.addEventListener("click", () => setTab(root, page, id));
      nav.appendChild(btn);
    });
    nav.addEventListener("keydown", event => {
      const allowed = ["ArrowRight", "ArrowLeft", "Home", "End"];
      if (!allowed.includes(event.key)) return;
      const buttons = [...nav.querySelectorAll('[role="tab"]')];
      const index = buttons.indexOf(document.activeElement);
      if (index === -1) return;
      event.preventDefault();
      const n = buttons.length;
      const next = event.key === "Home" ? 0 : event.key === "End" ? n - 1 :
        event.key === "ArrowRight" ? (index + 1) % n : (index - 1 + n) % n;
      setTab(root, page, buttons[next].dataset.v854Tab, true);
    });
    anchor.insertAdjacentElement("afterend", nav);
    return nav;
  }

  function makePanel(root, page, info) {
    const [id, , en, th, helpTh, helpEn] = info;
    const panel = document.createElement("section");
    panel.id = `v854-${page}-panel-${id}`;
    panel.className = `v854-panel v854-${page}-${id}`;
    panel.dataset.v854Panel = page;
    panel.dataset.v854Section = id;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", `v854-${page}-tab-${id}`);
    panel.hidden = true;
    const heading = document.createElement("div");
    heading.className = "v854-panel-heading";
    const left = document.createElement("div");
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = page === "bank" ? "WORK BANK" : "WORK EXCHANGE";
    const title = document.createElement("h3"); title.textContent = copy(th, en);
    const subtitle = document.createElement("p"); subtitle.textContent = copy(helpTh, helpEn);
    left.append(eyebrow, title, subtitle);
    const count = document.createElement("span");
    count.className = "v854-section-chip";
    count.textContent = en.toUpperCase();
    heading.append(left, count);
    panel.append(heading);
    root.append(panel);
    return panel;
  }

  function move(panel, root, selector) {
    const node = q(selector, root);
    if (!node || node === panel || panel.contains(node)) return false;
    panel.append(node);
    return true;
  }

  function financeSwitcher(root, page) {
    const heading = q(".v7-page-heading", root);
    if (!heading || q(".v854-hub-switch", root)) return;
    const bar = document.createElement("div");
    bar.className = "v854-hub-switch";
    const text = document.createElement("span");
    text.className = "v854-hub-label";
    text.textContent = copy("FINANCE HUB · Work Coins จำลอง", "FINANCE HUB · simulated Work Coins");
    const links = document.createElement("div");
    [["bank", "🏦 Work Bank"], ["exchange", "📈 Work Exchange"]].forEach(([dest, label]) => {
      const link = document.createElement("a");
      link.href = `#/${dest}`;
      link.textContent = label;
      link.className = dest === page ? "active" : "";
      if (dest === page) link.setAttribute("aria-current", "page");
      links.append(link);
    });
    bar.append(text, links);
    heading.insertAdjacentElement("afterend", bar);
  }

  function decorateBank() {
    const root = $("v83BankPage");
    if (!root || !q(".v83-bank-hero", root) || q('[data-v854-tabs="bank"]', root)) return;
    root.classList.add("v854-finance-page", "v854-bank-page");
    financeSwitcher(root, "bank");
    const hero = q(".v83-bank-hero", root);
    makeNav(root, "bank", hero);
    const panels = Object.fromEntries(CONFIG.bank.map(info => [info[0], makePanel(root, "bank", info)]));
    [".v83-bank-actions", ".v844-bank-boost"].forEach(sel => move(panels.savings, root, sel));
    [".v83-bank-growth", ".v846-bank-achievements"].forEach(sel => move(panels.growth, root, sel));
    move(panels.history, root, ".v83-bank-history");
    setTab(root, "bank", selectedTab("bank"));
  }

  function decorateExchange() {
    const root = $("v84ExchangePage");
    if (!root || !q(".v84-market-grid", root) || q('[data-v854-tabs="exchange"]', root)) return;
    root.classList.add("v854-finance-page", "v854-exchange-page");
    financeSwitcher(root, "exchange");
    const anchor = q(".v84-kpis", root);
    if (!anchor) return;
    makeNav(root, "exchange", anchor);
    const panels = Object.fromEntries(CONFIG.exchange.map(info => [info[0], makePanel(root, "exchange", info)]));
    [".v84-event-card", ".v84-movers", ".v84-market-grid"].forEach(sel => move(panels.market, root, sel));
    [".v84-lower-grid", ".v84-finale"].forEach(sel => move(panels.portfolio, root, sel));
    ["#v841Academy", ".v841-beginner-tip"].forEach(sel => move(panels.academy, root, sel));
    move(panels.history, root, ".v84-history-card");
    setTab(root, "exchange", selectedTab("exchange"));
  }

  // Trading Academy exercises scroll to other sections. Switch the panel first,
  // then let the original v81.js click listener handle focus and effects.
  document.addEventListener("click", event => {
    const root = $("v84ExchangePage");
    if (!root || !root.contains(event.target)) return;
    const practice = event.target.closest("[data-v841-practice]");
    if (practice) {
      const action = practice.dataset.v841Practice;
      const dest = action === "portfolio" ? "portfolio" : "market";
      setTab(root, "exchange", dest);
      return;
    }
    const row = event.target.closest(".v84-portfolio-row");
    if (row) setTab(root, "exchange", "market");
  }, true);

  function refreshVersion() {
    const sidebar = q(".v8472-version-row small");
    if (sidebar && sidebar.textContent !== `V${VERSION}`) sidebar.textContent = `V${VERSION}`;
    const footer = $("footerVersion");
    if (footer && footer.textContent !== `v${VERSION}`) footer.textContent = `v${VERSION}`;
    const footText = q('.footer [data-i18n="footerText"]');
    if (footText) {
      const value = `Workday Journey V${VERSION} · Final Polish · Finance Hub · Gamification · Core Pages · Design System`;
      if (footText.textContent !== value) footText.textContent = value;
    }
    document.querySelectorAll(".v7-page-heading .eyebrow, .setup-brand .eyebrow, #v8472ChangelogBackdrop .v8472-changelog-hero .eyebrow").forEach(node => {
      if (/WORKDAY JOURNEY/i.test(node.textContent || "")) {
        const value = `WORKDAY JOURNEY · V${VERSION}`;
        if (node.textContent !== value) node.textContent = value;
      }
    });
    document.body?.setAttribute("data-app-version", VERSION);
  }

  function refresh() {
    decorateBank();
    decorateExchange();
    refreshVersion();
  }
  let timer;
  function schedule(delay = 50) {
    clearTimeout(timer);
    timer = setTimeout(refresh, delay);
  }
  // Bank and Exchange both reconstruct root.innerHTML when their data changes.
  // Observe direct child replacement and re-group the newly created nodes.
  const watched = new WeakSet();
  function installObservers() {
    ["v83BankPage", "v84ExchangePage"].forEach(id => {
      const root = $(id);
      if (!root || watched.has(root)) return;
      watched.add(root);
      const observer = new MutationObserver(records => {
        if (records.some(record => [...record.addedNodes].some(n => n.nodeType === 1 &&
            (n.matches?.(".v7-page-heading,.v83-bank-hero,.v84-market-grid") ||
             n.querySelector?.(".v83-bank-hero,.v84-market-grid"))))) schedule(10);
      });
      observer.observe(root, { childList: true });
    });
  }
  function boot() { installObservers(); refresh(); }
  window.addEventListener("hashchange", () => schedule(70));
  window.addEventListener("workday:v7-data-changed", () => schedule(100));
  window.addEventListener("workday:v8-auth-complete", () => schedule(140));
  document.addEventListener("click", e => {
    if (e.target.closest?.(".lang-btn,[data-v802-lang]")) schedule(130);
  }, true);
  document.addEventListener("keydown", e => {
    // Do not interfere with the global keyboard shortcuts.
    if (e.key !== "Escape") return;
    const root = $("v84ExchangePage");
    if (root?.contains(document.activeElement) && document.activeElement?.matches?.(".v854-tab")) document.activeElement.blur();
  });
  window.WorkdayV854 = { version: VERSION, refresh, select: (page, tab) => {
    const root = page === "bank" ? $("v83BankPage") : $("v84ExchangePage");
    if (root) setTab(root, page, tab);
  }};
  boot();
  setTimeout(boot, 200);
})();
