(() => {
  "use strict";

  const VERSION = "8.6.0";
  const $ = id => document.getElementById(id);
  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const isThai = () => localStorage.getItem("wp-language") !== "en";

  function addClass(selector, className, root = document) {
    const el = q(selector, root);
    if (el) el.classList.add(className);
    return el;
  }

  function ensureFormHeading(form, id, eyebrow, title, help) {
    if (!form) return;
    let heading = $(`${id}Heading`);
    if (!heading) {
      heading = document.createElement("div");
      heading.id = `${id}Heading`;
      heading.className = "v852-editor-heading";
      const hiddenInput = q('input[type="hidden"]', form);
      if (hiddenInput?.nextSibling) form.insertBefore(heading, hiddenInput.nextSibling);
      else form.prepend(heading);
    }
    heading.innerHTML = `<div><p class="eyebrow">${eyebrow}</p><h3>${title}</h3><p class="muted">${help}</p></div><span class="v852-editor-dot" aria-hidden="true"></span>`;
  }

  function decorateDashboard() {
    addClass(".hero-card", "v852-dashboard-hero");
    addClass(".main-grid", "v852-dashboard-focus-grid");
    addClass(".progress-card", "v852-today-focus");
    addClass(".live-countdown-card", "v852-countdown-focus");
    addClass(".timeline-card", "v852-timeline-focus");
    addClass(".three-grid", "v852-dashboard-overview-grid");
    addClass(".internship-card", "v852-journey-overview");
    addClass(".weekly-card", "v852-weekly-overview");
    addClass(".countdown-card", "v852-end-overview");
    addClass("#v77MascotCard", "v852-dashboard-mascot");
    addClass("#v7DashboardQuick", "v852-dashboard-quick");
    addClass("#v76DashboardInsights", "v852-dashboard-insights");
    addClass("#v6DailyRecap", "v852-dashboard-recap");
  }

  function decorateJournal() {
    const root = $("v7JournalPage");
    if (!root) return;
    root.classList.add("v852-core-page", "v852-journal-page");
    const form = $("v7JournalForm");
    if (form) {
      form.classList.add("v852-editor-surface");
      ensureFormHeading(
        form,
        "v852Journal",
        "ENTRY WORKSPACE",
        isThai() ? "บันทึกงานของวันนี้" : "Today's work note",
        isThai() ? "เขียนสิ่งที่ทำ สิ่งที่เรียนรู้ และเชื่อมโยง Project ในพื้นที่เดียว" : "Capture work, learning and related projects in one focused workspace."
      );
    }
    addClass(".v76-journal-history", "v852-secondary-panel", root);
    addClass(".v761-journal-calendar", "v852-journal-calendar", root);
    addClass(".v76-journal-filters", "v852-filter-bar", root);
    addClass(".v7-recent-list", "v852-history-list", root);
  }

  function decorateProjects() {
    const root = $("v7ProjectsPage");
    if (!root) return;
    root.classList.add("v852-core-page", "v852-projects-page");
    const form = $("v7ProjectForm");
    if (form) {
      form.classList.add("v852-editor-surface", "v852-project-editor");
      const editing = Boolean($("v7ProjectId")?.value);
      ensureFormHeading(
        form,
        "v852Project",
        editing ? "EDIT PROJECT" : "PROJECT EDITOR",
        editing ? (isThai() ? "แก้ไข Project" : "Edit project") : (isThai() ? "สร้าง Project ใหม่" : "Create a new project"),
        isThai() ? "จัดการรายละเอียด Progress และสถานะ จากนั้นบันทึกลง Project Library" : "Manage details, progress and status, then save it to your Project Library."
      );
    }
    addClass(".v7-project-list-section", "v852-project-library", root);
    qa(".v7-project-card", root).forEach(card => card.classList.add("v852-project-card"));
  }

  function decorateReports() {
    const root = $("v7ReportsPage");
    if (root) root.classList.add("v852-core-page", "v852-reports-page");
    addClass(".v7-report-kpis", "v852-kpi-strip", root || document);
    addClass(".v7-monthly-table-card", "v852-detail-surface", root || document);
    addClass(".attendance-card", "v852-report-primary");
    addClass(".smart-journey-grid", "v852-report-analytics");
    addClass(".heatmap-card", "v852-report-heatmap");
  }

  function decorateCalendar() {
    const root = $("v7CalendarIntro");
    if (root) root.classList.add("v852-core-page", "v852-calendar-intro");
    addClass(".v7-calendar-kpis", "v852-kpi-strip", root || document);
    addClass(".calendar-card", "v852-calendar-primary");
  }

  function refreshVersionLabels() {
    const sidebarVersion = q(".v8472-version-row small");
    if (sidebarVersion) sidebarVersion.textContent = `V${VERSION}`;

    const footerVersion = $("footerVersion");
    if (footerVersion) footerVersion.textContent = `v${VERSION}`;

    const footerText = q('.footer [data-i18n="footerText"]');
    if (footerText) footerText.textContent = `Workday Journey V${VERSION} · Final Polish · Finance Hub · Gamification · Core Pages · Design System`;

    qa(".v7-page-heading .eyebrow").forEach(el => {
      if (/WORKDAY JOURNEY/i.test(el.textContent || "")) el.textContent = `WORKDAY JOURNEY · V${VERSION}`;
    });

    const setupEyebrow = q(".setup-brand .eyebrow");
    if (setupEyebrow && /WORKDAY JOURNEY/i.test(setupEyebrow.textContent || "")) setupEyebrow.textContent = `WORKDAY JOURNEY · V${VERSION}`;

    document.body?.setAttribute("data-app-version", VERSION);
  }

  function refresh() {
    document.documentElement.dataset.coreRefresh = "v852";
    document.body?.classList.add("v852-core-refresh");
    decorateDashboard();
    decorateJournal();
    decorateProjects();
    decorateReports();
    decorateCalendar();
    refreshVersionLabels();
  }

  let timer = 0;
  function schedule(delay = 70) {
    clearTimeout(timer);
    timer = setTimeout(refresh, delay);
  }

  window.addEventListener("hashchange", () => schedule(100));
  window.addEventListener("workday:v7-data-changed", () => schedule(120));
  window.addEventListener("workday:v8-auth-state", () => schedule(140));
  window.addEventListener("workday:v8-auth-complete", () => schedule(160));
  document.addEventListener("click", event => {
    if (event.target.closest?.(".lang-btn,[data-v802-lang],#v7ProjectNew,[data-v7-project-edit],[data-v76-project-view]")) schedule(160);
  }, true);

  const observer = new MutationObserver(records => {
    const hasAddedElement = records.some(record => [...record.addedNodes].some(node => node?.nodeType === 1));
    if (hasAddedElement) schedule(80);
  });
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });

  window.WorkdayV852 = { version: VERSION, refresh };
  refresh();
  setTimeout(refresh, 200);
})();
