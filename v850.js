(() => {
  "use strict";

  const VERSION = "8.5.2";
  const $ = id => document.getElementById(id);
  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => [...root.querySelectorAll(sel)];
  const lang = () => localStorage.getItem("wp-language") === "en" ? "en" : "th";

  const ROUTE_GROUPS = [
    { id: "work", label: "WORK", routes: ["dashboard", "journal", "projects", "calendar", "reports"] },
    { id: "journey", label: "JOURNEY", routes: ["achievements", "missions"] },
    { id: "economy", label: "ECONOMY", routes: ["rewards", "bank", "exchange"] },
    { id: "system", label: "SYSTEM", routes: ["developer", "settings"] }
  ];

  const ROUTE_LABELS = {
    th: {
      dashboard: "แดชบอร์ด", journal: "บันทึก", projects: "โปรเจกต์", calendar: "ปฏิทิน",
      reports: "รายงาน", achievements: "ความสำเร็จ", missions: "ภารกิจ", rewards: "รางวัล",
      bank: "Work Bank", exchange: "Exchange", developer: "Developer", settings: "ตั้งค่า", more: "เพิ่มเติม"
    },
    en: {
      dashboard: "Home", journal: "Journal", projects: "Projects", calendar: "Calendar",
      reports: "Reports", achievements: "Achievements", missions: "Missions", rewards: "Rewards",
      bank: "Work Bank", exchange: "Exchange", developer: "Developer", settings: "Settings", more: "More"
    }
  };

  const ICONS = {
    dashboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 10.8 12 3.7l8.5 7.1"/><path d="M5.5 9.8v10.1h13V9.8"/><path d="M9.4 19.9v-6.2h5.2v6.2"/></svg>',
    journal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 4.2h10.6a2 2 0 0 1 2 2v13.2H8.2a3 3 0 0 1-3-3V5.2a1 1 0 0 1 1-1Z"/><path d="M8.2 4.2v15.2"/><path d="M11 8h4.8M11 11.7h4.8"/></svg>',
    projects: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 7.4h6l1.5 1.9h9.5v9.2a1.8 1.8 0 0 1-1.8 1.8H5.3a1.8 1.8 0 0 1-1.8-1.8Z"/><path d="M3.5 7.4V5.8A1.8 1.8 0 0 1 5.3 4h3.6l1.5 1.8h4.1"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.6" y="5.2" width="16.8" height="15" rx="2"/><path d="M7.6 3.5v3.4M16.4 3.5v3.4M3.6 9.2h16.8"/><path d="M8 13h.01M12 13h.01M16 13h.01M8 16.7h.01M12 16.7h.01"/></svg>',
    reports: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 20V10.8h4V20M10 20V4.8h4V20M15.5 20v-7.2h4V20"/><path d="M3.2 20.2h17.6"/></svg>',
    achievements: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4.5h8v3.3a4 4 0 0 1-8 0Z"/><path d="M8 6H4.5v1.5A4 4 0 0 0 8.2 11M16 6h3.5v1.5a4 4 0 0 1-3.7 3.5M12 12v4.2M8.7 20h6.6M10 16.2h4v3.8"/></svg>',
    missions: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.3"/><circle cx="12" cy="12" r="4.6"/><path d="m12 12 6.6-6.6M16.2 5.4h2.4v2.4"/></svg>',
    rewards: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16v10H4Z"/><path d="M3.2 7.2h17.6V10H3.2ZM12 7.2V20"/><path d="M12 7.2H8.1a2.1 2.1 0 1 1 2.1-2.1c0 1.2 1.8 2.1 1.8 2.1ZM12 7.2h3.9a2.1 2.1 0 1 0-2.1-2.1c0 1.2-1.8 2.1-1.8 2.1Z"/></svg>',
    bank: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3.5 9 8.5-5 8.5 5"/><path d="M5.2 9h13.6M6.7 9v7.6M10.2 9v7.6M13.8 9v7.6M17.3 9v7.6M4.2 16.6h15.6M3.5 20h17"/></svg>',
    exchange: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18.5 9 13l3.2 2.8 6.8-8"/><path d="M15.2 7.8H19V11.6"/><path d="M4 5v13.5h16"/></svg>',
    developer: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.7 5.1 4.2 4.2M12.8 7l4.2 4.2M4.1 19.9l4.4-1 9.8-9.8a2 2 0 0 0-2.8-2.8l-9.8 9.8Z"/><path d="m13.4 4.6 2-2 6 6-2 2"/></svg>',
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M19.3 13.2a7.8 7.8 0 0 0 0-2.4l2-1.5-2-3.5-2.5 1a8 8 0 0 0-2.1-1.2L14.4 3h-4.1L10 5.6a8 8 0 0 0-2.1 1.2l-2.5-1-2 3.5 2 1.5a7.8 7.8 0 0 0 0 2.4l-2 1.5 2 3.5 2.5-1a8 8 0 0 0 2.1 1.2l.3 2.6h4.1l.3-2.6a8 8 0 0 0 2.1-1.2l2.5 1 2-3.5Z"/></svg>',
    more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>'
  };

  function activeRoute() {
    const route = location.hash.replace(/^#\/?/, "").split(/[?&]/)[0].toLowerCase();
    return Object.prototype.hasOwnProperty.call(ICONS, route) ? route : "dashboard";
  }

  function label(route) {
    return ROUTE_LABELS[lang()]?.[route] || ROUTE_LABELS.en[route] || route;
  }

  function icon(route) {
    return ICONS[route] || ICONS.dashboard;
  }

  function ensureNavGroups() {
    const nav = q(".v7-nav");
    if (!nav) return;

    qa(".v850-nav-group-label", nav).forEach(el => el.remove());
    ROUTE_GROUPS.forEach(group => {
      const first = q(`[data-v7-route="${group.routes[0]}"]`, nav);
      if (!first) return;
      const labelEl = document.createElement("div");
      labelEl.className = "v850-nav-group-label";
      labelEl.dataset.v850Group = group.id;
      labelEl.textContent = group.label;
      first.insertAdjacentElement("beforebegin", labelEl);
    });

    qa("[data-v7-route]", nav).forEach(btn => {
      const route = btn.dataset.v7Route;
      const iconHost = btn.firstElementChild;
      if (iconHost && iconHost.dataset.v850Icon !== route) {
        iconHost.dataset.v850Icon = route;
        iconHost.innerHTML = icon(route);
      }
      const text = q(`[data-v7-nav-label="${route}"]`, btn)?.textContent?.trim() || label(route);
      btn.dataset.v850Tip = text;
      btn.setAttribute("aria-label", text);
      btn.title = text;
      const group = ROUTE_GROUPS.find(item => item.routes.includes(route));
      if (group) btn.dataset.v850Group = group.id;
    });
  }

  function refreshTopbar() {
    const route = activeRoute();
    const host = $("v802TopContext");
    const iconHost = $("v802ContextIcon");
    const title = $("v802ContextTitle");
    const subtitle = $("v802ContextEyebrow");
    if (host) host.dataset.v850Route = route;
    if (iconHost) {
      iconHost.dataset.v850Icon = route;
      iconHost.innerHTML = icon(route);
    }
    if (title && subtitle && title.nextElementSibling !== subtitle) title.insertAdjacentElement("afterend", subtitle);
    if (subtitle) subtitle.classList.add("v850-context-subtitle");
  }

  function refreshPageHeading() {
    const route = activeRoute();
    const visible = q(`[data-v7-page="${route}"]:not(.v7-route-hidden)`) || q(`[data-v7-page="${route}"]`);
    const heading = q(".v7-page-heading", visible || document);
    if (!heading) return;
    heading.dataset.v850Route = route;
    const titleIcon = q(".v7-page-title > span:first-child", heading);
    if (titleIcon && titleIcon.dataset.v850Icon !== route) {
      titleIcon.dataset.v850Icon = route;
      titleIcon.innerHTML = icon(route);
    }
  }

  function ensureMobileDock() {
    if ($("v850MobileDock")) return;
    const dock = document.createElement("nav");
    dock.id = "v850MobileDock";
    dock.className = "v850-mobile-dock";
    dock.setAttribute("aria-label", "Mobile navigation");
    const items = ["dashboard", "journal", "projects", "rewards", "more"];
    dock.innerHTML = items.map(route => `<button type="button" data-v850-mobile-route="${route}"><span>${icon(route)}</span><small data-v850-mobile-label="${route}">${label(route)}</small></button>`).join("");
    document.body.appendChild(dock);
    qa("[data-v850-mobile-route]", dock).forEach(btn => {
      btn.addEventListener("click", () => {
        const route = btn.dataset.v850MobileRoute;
        if (route === "more") {
          $("v7MenuBtn")?.click();
          return;
        }
        q(`.v7-nav [data-v7-route="${route}"]`)?.click();
      });
    });
  }

  function refreshMobileDock() {
    const route = activeRoute();
    qa("[data-v850-mobile-route]").forEach(btn => {
      const key = btn.dataset.v850MobileRoute;
      const active = key === route || (key === "more" && !["dashboard", "journal", "projects", "rewards"].includes(route));
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-current", active ? "page" : "false");
      const txt = q(`[data-v850-mobile-label="${key}"]`, btn);
      if (txt) txt.textContent = label(key);
    });
  }

  function refreshProfileAndVersion() {
    const version = q(".v8472-version-row small");
    if (version) version.textContent = `V${VERSION}`;
    const shell = q(".v7-shell");
    if (shell) shell.dataset.v850Ready = "true";
  }

  function refresh() {
    document.body.classList.add("v850-shell-refresh");
    ensureNavGroups();
    ensureMobileDock();
    refreshTopbar();
    refreshPageHeading();
    refreshMobileDock();
    refreshProfileAndVersion();
  }

  let timer = 0;
  function schedule(delay = 80) {
    clearTimeout(timer);
    timer = setTimeout(refresh, delay);
  }

  const main = q("main.dashboard");
  if (main) {
    const observer = new MutationObserver(records => {
      const headingChanged = records.some(record => [...record.addedNodes].some(node =>
        node?.nodeType === 1 && (node.matches?.(".v7-page-heading") || node.querySelector?.(".v7-page-heading"))
      ));
      if (headingChanged) schedule(40);
    });
    observer.observe(main, { childList: true, subtree: true });
  }

  window.addEventListener("hashchange", () => { schedule(100); setTimeout(refresh, 180); });
  window.addEventListener("workday:v7-data-changed", () => schedule(80));
  window.addEventListener("workday:v8-auth-complete", () => schedule(120));
  document.addEventListener("click", event => {
    if (event.target.closest?.(".lang-btn,[data-v802-lang]")) setTimeout(refresh, 160);
  }, true);
  window.addEventListener("resize", () => schedule(70));

  window.WorkdayV850 = { version: VERSION, refresh };
  refresh();
  setTimeout(refresh, 140);
})();
