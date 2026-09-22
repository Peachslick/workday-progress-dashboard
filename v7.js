(() => {
  "use strict";

  const API = window.WorkdayJourneyAPI;
  if (!API) return;

  const VERSION = "7.2.0";
  const $ = id => document.getElementById(id);
  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const read = (key, fallback) => { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  const lang = () => localStorage.getItem("wp-language") === "en" ? "en" : "th";
  const isDemo = () => (API.getState().privacyMode || localStorage.getItem("wp-privacy-mode") || "personal") === "demo";
  const dateKey = date => API.dateKey(date);
  const dateFromKey = key => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key || "")); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(); };
  const formatDate = date => new Intl.DateTimeFormat(lang() === "th" ? "th-TH" : "en-GB", { day:"2-digit", month:"short", year:"numeric" }).format(date);
  const formatMonth = date => new Intl.DateTimeFormat(lang() === "th" ? "th-TH" : "en-US", { month:"long", year:"numeric" }).format(date);
  const fmt = minutes => API.formatDuration(Math.max(0, Number(minutes) || 0), true);

  const KEYS = {
    journal: "wp-v6-journal",
    projects: "wp-v6-projects",
    lastBackup: "wp-v6-last-backup-at",
    backupDays: "wp-v6-backup-reminder-days",
    sidebarCollapsed: "wp-v7-sidebar-collapsed"
  };

  const TEXT = {
    th: {
      dashboard:"แดชบอร์ด", journal:"บันทึกประจำวัน", projects:"โปรเจกต์", achievements:"ความสำเร็จ", reports:"รายงานและการวิเคราะห์", calendar:"ปฏิทินและการเข้างาน", settings:"ตั้งค่า",
      dashboardSub:"ภาพรวมวันนี้และ Journey", journalSub:"บันทึกสิ่งที่ทำและสิ่งที่เรียนรู้", projectsSub:"ติดตามงานและความคืบหน้าของ Project", achievementsSub:"Milestones, Trophy Room และ Journey Story", reportsSub:"Attendance, Heatmap และรายงานสรุป", calendarSub:"วันลา วันหยุดบริษัท และวันทำงานชดเชย", settingsSub:"โปรไฟล์ รูปแบบการแสดงผล และข้อมูล",
      privateLocal:"Private · Local data", menu:"เมนู", quickActions:"ทางลัด", addJournal:"เพิ่ม Journal วันนี้", manageProjects:"จัดการ Projects", openReports:"ดู Reports", openCalendar:"เปิด Calendar",
      journalTitle:"Daily Work Journal", journalHelp:"บันทึกว่าวันนี้ทำอะไร เรียนรู้อะไร และ Project ที่เกี่ยวข้อง", journalDate:"วันที่", workDone:"วันนี้ทำอะไร", learned:"สิ่งที่ได้เรียนรู้", mood:"ความรู้สึกวันนี้", relatedProjects:"Project ที่เกี่ยวข้อง", saveJournal:"บันทึก Journal", deleteJournal:"ลบบันทึก", recentEntries:"บันทึกล่าสุด", noEntries:"ยังไม่มีบันทึก", demoLocked:"Journal ถูกซ่อนใน Public Demo Mode", journalSaved:"บันทึก Journal แล้ว", journalDeleted:"ลบบันทึกแล้ว", journalDateInvalid:"กรุณาใส่วันที่ให้ถูกต้องในรูปแบบ DD/MM/YYYY",
      projectsTitle:"Project Tracker", projectsHelp:"ติดตาม Project, Status และ Progress พร้อมเชื่อมกับ Daily Journal", projectName:"ชื่อ Project", category:"หมวดหมู่", progress:"Progress (%)", status:"สถานะ", description:"รายละเอียด", active:"กำลังทำ", paused:"พักไว้", completed:"เสร็จแล้ว", saveProject:"บันทึก Project", newProject:"Project ใหม่", noProjects:"ยังไม่มี Project", journalDays:"วันที่มี Journal", projectSaved:"บันทึก Project แล้ว", projectDeleted:"ลบ Project แล้ว",
      achievementsTitle:"Achievement Center", achievementsHelp:"รวม Badge, Milestone และเรื่องราวสำคัญของ Journey", unlocked:"ปลดล็อกแล้ว", locked:"ยังไม่ปลดล็อก", achievementProgress:"ปลดล็อก {n}/{total} Achievement",
      reportsTitle:"Reports & Analytics", reportsHelp:"ดูภาพรวม Attendance, Monthly Statistics, Heatmap และ Final Journey Report", monthlyReport:"Monthly Report", detailedStats:"Detailed Statistics", finalReport:"Final Journey Report", snapshot:"Journey Snapshot", month:"เดือน", planned:"ตามแผน", actual:"ทำงานจริง", leave:"ลา", holidays:"วันหยุด", comp:"ชดเชย", journals:"Journal", projectsMentioned:"Projects",
      calendarTitle:"Calendar & Attendance", calendarHelp:"จัดการวันลา วันหยุดบริษัท วันทำงานชดเชย และ Calendar Preset", presetImport:"Preset / Import", companyHoliday:"วันหยุดบริษัท", personalLeave:"วันลา", compWork:"วันทำงานชดเชย", specialDates:"วันพิเศษ",
      settingsTitle:"ตั้งค่า", settingsHelp:"ปรับโปรไฟล์ ธีม แบบอักษร ภาษา การสำรองข้อมูล และการแสดงผล", profileJourney:"โปรไฟล์และข้อมูลการเดินทาง", editJourney:"แก้ไขข้อมูลการเดินทาง", appearance:"การแสดงผล", theme:"ธีม", font:"แบบอักษร", fontSize:"ขนาดตัวอักษร", density:"ความหนาแน่นของหน้าจอ", timezone:"เขตเวลา", locale:"รูปแบบวันที่", behavior:"การทำงาน", seconds:"แสดงวินาที", animation:"แอนิเมชัน", moodSetting:"บรรยากาศตามเวลา", notifications:"การแจ้งเตือน", dataBackup:"ข้อมูลและการสำรอง", exportBackup:"ส่งออกข้อมูลสำรอง", importBackup:"นำเข้าข้อมูลสำรอง", newJourney:"เริ่มการเดินทางใหม่", resetData:"ล้างข้อมูลทั้งหมด", dashboardLayout:"จัดรูปแบบแดชบอร์ด", openFullSettings:"เปิดการตั้งค่าขั้นสูง", light:"สว่าง", dark:"มืด", system:"ตามระบบ", compact:"กะทัดรัด", comfortable:"สบายตา", small:"เล็ก", medium:"กลาง", large:"ใหญ่", profileSection:"โปรไฟล์", displaySection:"การแสดงผล", regionSection:"ภูมิภาคและเวลา", behaviorSection:"การทำงาน", dataSection:"ข้อมูล", publicDemo:"โหมดสาธารณะ", myJourney:"การเดินทางของฉัน", collapseSidebar:"ซ่อน Sidebar", expandSidebar:"แสดง Sidebar",
      backupStatus:"Backup ล่าสุด", never:"ยังไม่เคย Backup", today:"วันนี้", daysAgo:"{n} วันที่แล้ว", appVersion:"Workday Journey V7.2 · Toast & Journal Date Update", localPrivacy:"ข้อมูลทั้งหมดเก็บใน Browser ของผู้ใช้แต่ละคน",
      overview:"ภาพรวม", workTime:"เวลาสะสม", attendance:"Attendance", achievementsCount:"Achievements", workdaysLeft:"วันทำงานที่เหลือ", goTo:"เปิดหน้า",
      deleteConfirm:"ยืนยันการลบรายการนี้?", projectNameRequired:"กรุณาใส่ชื่อ Project", noData:"ยังไม่มีข้อมูล", todayLabel:"วันนี้"
    },
    en: {
      dashboard:"Dashboard", journal:"Daily Journal", projects:"Projects", achievements:"Achievements", reports:"Reports & Analytics", calendar:"Calendar & Attendance", settings:"Settings",
      dashboardSub:"Today and journey overview", journalSub:"Record your work and learning", projectsSub:"Track project status and progress", achievementsSub:"Milestones, Trophy Room and Journey Story", reportsSub:"Attendance, heatmap and journey reports", calendarSub:"Leave, company holidays and compensatory days", settingsSub:"Profile, appearance and data tools",
      privateLocal:"Private · Local data", menu:"Menu", quickActions:"Quick Actions", addJournal:"Add Today's Journal", manageProjects:"Manage Projects", openReports:"View Reports", openCalendar:"Open Calendar",
      journalTitle:"Daily Work Journal", journalHelp:"Record what you worked on, what you learned, and the related projects", journalDate:"Date", workDone:"What did you work on?", learned:"What did you learn?", mood:"Today's mood", relatedProjects:"Related Projects", saveJournal:"Save Journal", deleteJournal:"Delete Entry", recentEntries:"Recent Entries", noEntries:"No entries yet", demoLocked:"Journal is hidden in Public Demo Mode", journalSaved:"Journal saved", journalDeleted:"Journal deleted", journalDateInvalid:"Enter a valid date in DD/MM/YYYY format",
      projectsTitle:"Project Tracker", projectsHelp:"Track project status and progress and connect it with Daily Journal", projectName:"Project Name", category:"Category", progress:"Progress (%)", status:"Status", description:"Description", active:"Active", paused:"Paused", completed:"Completed", saveProject:"Save Project", newProject:"New Project", noProjects:"No projects yet", journalDays:"Journal Days", projectSaved:"Project saved", projectDeleted:"Project deleted",
      achievementsTitle:"Achievement Center", achievementsHelp:"Badges, milestones and memorable moments from your journey", unlocked:"Unlocked", locked:"Locked", achievementProgress:"{n}/{total} achievements unlocked",
      reportsTitle:"Reports & Analytics", reportsHelp:"Review attendance, monthly statistics, heatmap and the final journey report", monthlyReport:"Monthly Report", detailedStats:"Detailed Statistics", finalReport:"Final Journey Report", snapshot:"Journey Snapshot", month:"Month", planned:"Planned", actual:"Actual", leave:"Leave", holidays:"Holidays", comp:"Comp", journals:"Journals", projectsMentioned:"Projects",
      calendarTitle:"Calendar & Attendance", calendarHelp:"Manage leave, company holidays, compensatory workdays and calendar presets", presetImport:"Preset / Import", companyHoliday:"Company Holidays", personalLeave:"Personal Leave", compWork:"Compensatory Workdays", specialDates:"Special Dates",
      settingsTitle:"Settings", settingsHelp:"Manage profile, theme, font, language, backups and display preferences", profileJourney:"Profile & Journey", editJourney:"Edit Journey", appearance:"Appearance", theme:"Theme", font:"Font", fontSize:"Font Size", density:"Layout Density", timezone:"Timezone", locale:"Date Format", behavior:"Behavior", seconds:"Show Seconds", animation:"Animation", moodSetting:"Dynamic Mood", notifications:"Notifications", dataBackup:"Data & Backup", exportBackup:"Export Backup", importBackup:"Import Backup", newJourney:"Start New Journey", resetData:"Reset All Data", dashboardLayout:"Dashboard Layout", openFullSettings:"Open Advanced Settings", light:"Light", dark:"Dark", system:"System", compact:"Compact", comfortable:"Comfortable", small:"Small", medium:"Medium", large:"Large", profileSection:"PROFILE", displaySection:"DISPLAY", regionSection:"REGION", behaviorSection:"BEHAVIOR", dataSection:"DATA", publicDemo:"Public Demo", myJourney:"My Journey", collapseSidebar:"Hide sidebar", expandSidebar:"Show sidebar",
      backupStatus:"Last Backup", never:"Never", today:"Today", daysAgo:"{n} days ago", appVersion:"Workday Journey V7.2 · Toast & Journal Date Update", localPrivacy:"All data is stored locally in each user's browser",
      overview:"Overview", workTime:"Work Time", attendance:"Attendance", achievementsCount:"Achievements", workdaysLeft:"Workdays Left", goTo:"Open",
      deleteConfirm:"Delete this item?", projectNameRequired:"Enter a project name", noData:"No data yet", todayLabel:"Today"
    }
  };
  const t = (key, vars={}) => {
    let out = TEXT[lang()][key] || TEXT.en[key] || key;
    Object.entries(vars).forEach(([k,v]) => out = out.replaceAll(`{${k}}`, String(v)));
    return out;
  };

  const NAV = [
    ["dashboard","🏠"], ["journal","📓"], ["projects","🧩"], ["achievements","🏆"], ["reports","📊"], ["calendar","📅"], ["settings","⚙"]
  ];

  function toastType(icon, message="") {
    const text=String(message||"").toLowerCase();
    if(["✓","✅","↓","📸"].includes(icon)) return "success";
    if(icon==="!" || icon==="✕" || /required|invalid|กรุณา|ไม่ถูกต้อง|ผิดพลาด/.test(text)) return "error";
    if(["⚠","⚠️","🔕","💾"].includes(icon)) return "warning";
    return "info";
  }
  function toast(icon, message, type="") {
    const stack = $("toastStack");
    if (!stack) return;
    const tone=type||toastType(icon,message);
    const node = document.createElement("div");
    node.className = `app-toast v7-toast toast-${tone}`;
    node.setAttribute("role",tone==="error"?"alert":"status");
    node.innerHTML = `<span>${icon}</span><div><strong>${esc(message)}</strong></div>`;
    stack.appendChild(node);
    setTimeout(() => { node.classList.add("out"); setTimeout(() => node.remove(), 250); }, 3200);
  }

  function formatJournalDateKey(key) {
    const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key||""));
    return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
  }
  function parseJournalDateText(value) {
    const text=String(value||"").trim();
    const m=/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/.exec(text);
    if(!m) return "";
    const d=Number(m[1]),mo=Number(m[2]),y=Number(m[3]);
    if(y<1900||y>2200||mo<1||mo>12||d<1||d>31) return "";
    const dt=new Date(y,mo-1,d);
    if(dt.getFullYear()!==y||dt.getMonth()!==mo-1||dt.getDate()!==d) return "";
    return `${String(y).padStart(4,"0")}-${String(mo).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  }
  function maskJournalDate(value) {
    const digits=String(value||"").replace(/\D/g,"").slice(0,8);
    if(digits.length<=2) return digits;
    if(digits.length<=4) return `${digits.slice(0,2)}/${digits.slice(2)}`;
    return `${digits.slice(0,2)}/${digits.slice(2,4)}/${digits.slice(4)}`;
  }
  function openJournalPicker(textInput,picker) {
    if(!picker) return;
    const parsed=parseJournalDateText(textInput?.value);
    if(parsed) picker.value=parsed;
    try { if(typeof picker.showPicker==="function") picker.showPicker(); else picker.click(); } catch { picker.click(); }
  }

  function currentRoute() {
    const value = location.hash.replace(/^#\/?/, "").split("?")[0];
    return NAV.some(([key]) => key === value) ? value : "dashboard";
  }

  function setupShell() {
    const shell = q(".app-shell");
    if (!shell || q(".v7-sidebar", shell)) return;
    shell.classList.add("v7-shell");
    const workspace = document.createElement("div");
    workspace.className = "v7-workspace";
    [$("updateBanner"), q(".topbar", shell), q("main.dashboard", shell), q(".footer", shell)].filter(Boolean).forEach(el => workspace.appendChild(el));

    const sidebar = document.createElement("aside");
    sidebar.className = "v7-sidebar";
    sidebar.innerHTML = `
      <div class="v7-sidebar-brand"><div class="v7-sidebar-brand-main"><div class="brand-mark">%</div><div><strong>Workday Journey</strong><small>V7.2 · App Layout</small></div></div><button id="v7CollapseBtn" class="v7-collapse-btn" type="button" aria-label="Hide sidebar" title="Hide sidebar">‹</button></div>
      <nav class="v7-nav" aria-label="Workday Journey navigation">${NAV.map(([key,icon]) => `<button type="button" data-v7-route="${key}"><span>${icon}</span><div><strong data-v7-nav-label="${key}"></strong><small data-v7-nav-sub="${key}"></small></div></button>`).join("")}</nav>
      <div class="v7-sidebar-profile"><span class="v7-avatar">👤</span><div><strong id="v7SideName">My Journey</strong><small id="v7SideRange">—</small></div></div>
      <div class="v7-private-chip">🔐 <span id="v7PrivateLabel"></span></div>`;

    const backdrop = document.createElement("div");
    backdrop.id = "v7SidebarBackdrop";
    backdrop.className = "v7-sidebar-backdrop";
    backdrop.hidden = true;
    shell.append(sidebar, workspace, backdrop);

    const topbarActions = q(".topbar-actions");
    if (topbarActions && !$("v7MenuBtn")) {
      const btn = document.createElement("button");
      btn.id = "v7MenuBtn"; btn.className = "icon-btn v7-menu-btn"; btn.type = "button"; btn.setAttribute("aria-label","Menu"); btn.textContent = "☰";
      topbarActions.prepend(btn);
      btn.addEventListener("click", () => {
        if (isDesktopNav()) setDesktopSidebarCollapsed(false);
        else toggleSidebar(true);
      });
    }
    $("v7CollapseBtn")?.addEventListener("click", () => {
      if (isDesktopNav()) setDesktopSidebarCollapsed(true);
      else toggleSidebar(false);
    });
    backdrop.addEventListener("click", () => toggleSidebar(false));
    qa("[data-v7-route]", sidebar).forEach(btn => btn.addEventListener("click", () => navigate(btn.dataset.v7Route)));
    syncSidebarMode();
  }

  function isDesktopNav() { return window.matchMedia("(min-width: 981px)").matches; }

  function setDesktopSidebarCollapsed(collapsed, persist = true) {
    const shell = q(".v7-shell");
    if (!shell) return;
    const next = isDesktopNav() && !!collapsed;
    shell.classList.toggle("v7-sidebar-collapsed", next);
    if (persist) localStorage.setItem(KEYS.sidebarCollapsed, next ? "1" : "0");
    const btn = $("v7CollapseBtn");
    if (btn) { btn.textContent = "‹"; btn.setAttribute("aria-label", t("collapseSidebar")); btn.title = t("collapseSidebar"); }
    const menuBtn = $("v7MenuBtn");
    if (menuBtn && next) { menuBtn.setAttribute("aria-label", t("expandSidebar")); menuBtn.title = t("expandSidebar"); }
  }

  function syncSidebarMode() {
    if (isDesktopNav()) {
      toggleSidebar(false);
      setDesktopSidebarCollapsed(localStorage.getItem(KEYS.sidebarCollapsed) === "1", false);
    } else {
      q(".v7-shell")?.classList.remove("v7-sidebar-collapsed");
    }
  }

  function toggleSidebar(open) {
    q(".v7-sidebar")?.classList.toggle("open", !!open);
    if ($("v7SidebarBackdrop")) $("v7SidebarBackdrop").hidden = !open;
    document.body.classList.toggle("v7-nav-open", !!open);
  }

  function pageHeader(icon, title, help, actions="") {
    return `<div class="v7-page-heading"><div class="v7-page-title"><span>${icon}</span><div><p class="eyebrow">WORKDAY JOURNEY · V7.2</p><h2>${esc(title)}</h2><p class="muted">${esc(help)}</p></div></div>${actions ? `<div class="v7-page-actions">${actions}</div>` : ""}</div>`;
  }

  function injectPages() {
    const main = q("main.dashboard");
    if (!main || $("v7JournalPage")) return;

    const dashQuick = document.createElement("section");
    dashQuick.id = "v7DashboardQuick"; dashQuick.className = "card v7-dashboard-quick"; dashQuick.dataset.v7Page = "dashboard";
    dashQuick.innerHTML = `<div class="section-heading"><div><p class="eyebrow">WORKDAY JOURNEY</p><h3 id="v7QuickTitle"></h3></div></div><div class="v7-quick-grid">${[["journal","📓"],["projects","🧩"],["reports","📊"],["calendar","📅"]].map(([r,i])=>`<button type="button" data-v7-go="${r}"><span>${i}</span><strong data-v7-quick="${r}"></strong><small>→</small></button>`).join("")}</div></section>`;
    const overview = q(".three-grid", main);
    overview?.insertAdjacentElement("afterend", dashQuick);

    const journal = document.createElement("section"); journal.id="v7JournalPage"; journal.className="v7-page-panel"; journal.dataset.v7Page="journal"; main.appendChild(journal);
    const projects = document.createElement("section"); projects.id="v7ProjectsPage"; projects.className="v7-page-panel"; projects.dataset.v7Page="projects"; main.appendChild(projects);
    const ach = document.createElement("section"); ach.id="v7AchievementsPage"; ach.className="v7-page-panel"; ach.dataset.v7Page="achievements"; q(".journey-overview-card",main)?.insertAdjacentElement("beforebegin",ach);
    const reports = document.createElement("section"); reports.id="v7ReportsPage"; reports.className="v7-page-panel"; reports.dataset.v7Page="reports"; q(".attendance-card",main)?.insertAdjacentElement("beforebegin",reports);
    const cal = document.createElement("section"); cal.id="v7CalendarIntro"; cal.className="v7-page-panel"; cal.dataset.v7Page="calendar"; q(".calendar-card",main)?.insertAdjacentElement("beforebegin",cal);
    const settings = document.createElement("section"); settings.id="v7SettingsPage"; settings.className="v7-page-panel"; settings.dataset.v7Page="settings"; main.appendChild(settings);

    assignExistingPages();
    q("#v6WorkHub")?.setAttribute("hidden", "");
    qa("[data-v7-go]").forEach(btn => btn.addEventListener("click",()=>navigate(btn.dataset.v7Go)));
  }

  function assignExistingPages() {
    const groups = {
      dashboard:[".hero-card","#completionBanner","#v6DailyRecap",".main-grid",".timeline-card",".three-grid","#v7DashboardQuick"],
      achievements:[".journey-overview-card",".journey-timeline-card",".journey-story-card","#v7AchievementsPage"],
      reports:[".attendance-card",".smart-journey-grid",".heatmap-card","#v7ReportsPage"],
      calendar:[".calendar-card","#v7CalendarIntro"],
      journal:["#v7JournalPage"], projects:["#v7ProjectsPage"], settings:["#v7SettingsPage"]
    };
    Object.entries(groups).forEach(([page, selectors]) => selectors.forEach(sel => q(sel)?.setAttribute("data-v7-page",page)));
    [".journey-overview-card",".journey-timeline-card",".journey-story-card",".attendance-card",".smart-journey-grid",".heatmap-card",".calendar-card"].forEach(sel => q(sel)?.classList.remove("v6-section-hidden"));
  }

  function navigate(route) {
    if (!NAV.some(([key]) => key === route)) route = "dashboard";
    if (location.hash !== `#/${route}`) location.hash = `#/${route}`;
    else applyRoute();
    toggleSidebar(false);
  }

  function applyRoute() {
    const route = currentRoute();
    document.body.dataset.v7Route = route;
    qa("[data-v7-page]").forEach(el => el.classList.toggle("v7-route-hidden", el.dataset.v7Page !== route));
    qa(".v7-nav [data-v7-route]").forEach(btn => btn.classList.toggle("active", btn.dataset.v7Route === route));
    renderSidebar();
    renderPage(route);
    window.scrollTo({top:0,behavior:"instant"});
    document.title = `${t(route)} · Workday Journey`;
  }

  function renderSidebar() {
    NAV.forEach(([key]) => {
      const label = q(`[data-v7-nav-label="${key}"]`); const sub = q(`[data-v7-nav-sub="${key}"]`);
      if (label) label.textContent = t(key); if (sub) sub.textContent = t(`${key}Sub`);
    });
    const cfg = API.getConfig();
    if ($("v7SideName")) $("v7SideName").textContent = isDemo() ? t("publicDemo") : (cfg.profileName || t("myJourney"));
    if ($("v7SideRange")) $("v7SideRange").textContent = `${API.formatCompactDate(cfg.startDate)} → ${API.formatCompactDate(cfg.endDate)}`;
    if ($("v7PrivateLabel")) $("v7PrivateLabel").textContent = t("privateLocal");
    const collapseBtn = $("v7CollapseBtn");
    if (collapseBtn) { collapseBtn.setAttribute("aria-label", t("collapseSidebar")); collapseBtn.title = t("collapseSidebar"); }
    const menuBtn = $("v7MenuBtn");
    if (menuBtn && isDesktopNav()) { menuBtn.setAttribute("aria-label", t("expandSidebar")); menuBtn.title = t("expandSidebar"); }
    if ($("v7QuickTitle")) $("v7QuickTitle").textContent = t("quickActions");
    [["journal","addJournal"],["projects","manageProjects"],["reports","openReports"],["calendar","openCalendar"]].forEach(([id,key]) => { const el=q(`[data-v7-quick="${id}"]`); if(el)el.textContent=t(key); });
  }

  function renderPage(route) {
    if (route === "dashboard") renderDashboardExtras();
    if (route === "journal") renderJournalPage();
    if (route === "projects") renderProjectsPage();
    if (route === "achievements") renderAchievementsPage();
    if (route === "reports") renderReportsPage();
    if (route === "calendar") renderCalendarIntro();
    if (route === "settings") renderSettingsPage();
  }

  function renderDashboardExtras() {
    if ($("v7QuickTitle")) $("v7QuickTitle").textContent = t("quickActions");
  }

  function getProjects() { const value = read(KEYS.projects, []); return Array.isArray(value) ? value : []; }
  function getJournals() { const value = read(KEYS.journal, {}); return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }
  function signalDataChanged() { window.dispatchEvent(new CustomEvent("workday:v7-data-changed")); }

  function clampTodayKey() {
    const cfg = API.getConfig(); const today = dateKey(API.getNow());
    return today < cfg.startDate ? cfg.startDate : today > cfg.endDate ? cfg.endDate : today;
  }

  function renderJournalPage(selectedKey) {
    const root = $("v7JournalPage"); if (!root) return;
    const cfg=API.getConfig(), journals=getJournals(), projects=getProjects();
    const key = selectedKey || root.dataset.selectedDate || clampTodayKey(); root.dataset.selectedDate = key;
    const entry = journals[key] || {work:"",learned:"",mood:"productive",projectIds:[]};
    const recent = Object.entries(journals).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,12);
    if (isDemo()) {
      root.innerHTML = `${pageHeader("📓",t("journalTitle"),t("journalHelp"))}<div class="card v7-privacy-lock"><span>🔐</span><h3>${esc(t("demoLocked"))}</h3><p class="muted">${esc(t("privateLocal"))}</p></div>`; return;
    }
    root.innerHTML = `${pageHeader("📓",t("journalTitle"),t("journalHelp"))}
      <div class="v7-journal-grid">
        <form id="v7JournalForm" class="card v7-form-card">
          <label><span>${esc(t("journalDate"))}</span><div class="journal-date-control"><input id="v7JournalDate" class="journal-date-text" type="text" inputmode="numeric" autocomplete="off" maxlength="10" placeholder="DD/MM/YYYY" value="${esc(formatJournalDateKey(key))}"><button id="v7JournalDateBtn" class="journal-date-picker-btn" type="button" aria-label="Calendar" title="Calendar">🗓</button><input id="v7JournalDatePicker" class="journal-date-native" type="date" tabindex="-1" aria-hidden="true" min="${esc(cfg.startDate)}" max="${esc(cfg.endDate)}" value="${esc(key)}"></div></label>
          <label><span>${esc(t("workDone"))}</span><textarea id="v7JournalWork" rows="5">${esc(entry.work||"")}</textarea></label>
          <label><span>${esc(t("learned"))}</span><textarea id="v7JournalLearned" rows="5">${esc(entry.learned||"")}</textarea></label>
          <div class="v7-two-col"><label><span>${esc(t("mood"))}</span><select id="v7JournalMood">${[["productive","😊 Productive"],["good","🙂 Good"],["neutral","😐 Normal"],["tired","😴 Tired"],["challenging","💪 Challenging"]].map(([v,l])=>`<option value="${v}" ${entry.mood===v?"selected":""}>${l}</option>`).join("")}</select></label><div><span class="v7-field-label">${esc(t("relatedProjects"))}</span><div class="v7-project-checks">${projects.length?projects.map(p=>`<label><input type="checkbox" value="${esc(p.id)}" ${entry.projectIds?.includes(p.id)?"checked":""}><span>${esc(p.name)}</span></label>`).join(""):`<p class="muted">${esc(t("noProjects"))}</p>`}</div></div></div>
          <div class="v7-form-actions"><button id="v7JournalDelete" class="danger-btn" type="button" ${journals[key]?"":"disabled"}>${esc(t("deleteJournal"))}</button><button class="primary-btn" type="submit">${esc(t("saveJournal"))}</button></div>
        </form>
        <aside class="card v7-list-card"><div class="v7-card-title"><div><p class="eyebrow">JOURNAL HISTORY</p><h3>${esc(t("recentEntries"))}</h3></div><span class="percentage-chip subtle">${recent.length}</span></div><div class="v7-recent-list">${recent.length?recent.map(([d,e])=>`<button type="button" data-v7-journal-date="${d}"><div><strong>${esc(formatDate(dateFromKey(d)))}</strong><span>${esc(e.work||e.learned||t("noData"))}</span></div><small>${esc((e.projectIds||[]).map(id=>projects.find(p=>p.id===id)?.name).filter(Boolean).join(" · "))}</small></button>`).join(""):`<div class="v7-empty">📓 ${esc(t("noEntries"))}</div>`}</div></aside>
      </div>`;
    const journalText=$("v7JournalDate"), journalPicker=$("v7JournalDatePicker"), journalPickerBtn=$("v7JournalDateBtn");
    journalText?.addEventListener("input",()=>{journalText.value=maskJournalDate(journalText.value);});
    const loadJournalDate=()=>{
      const parsed=parseJournalDateText(journalText?.value);
      if(!parsed || parsed<cfg.startDate || parsed>cfg.endDate){ toast("!",t("journalDateInvalid"),"error"); journalText?.focus(); return; }
      if(journalPicker) journalPicker.value=parsed;
      renderJournalPage(parsed);
    };
    journalText?.addEventListener("change",loadJournalDate);
    journalText?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();loadJournalDate();}});
    journalPicker?.addEventListener("change",()=>{if(journalPicker.value){journalText.value=formatJournalDateKey(journalPicker.value);renderJournalPage(journalPicker.value);}});
    journalPickerBtn?.addEventListener("click",()=>openJournalPicker(journalText,journalPicker));
    qa("[data-v7-journal-date]",root).forEach(btn=>btn.addEventListener("click",()=>renderJournalPage(btn.dataset.v7JournalDate)));
    $("v7JournalForm")?.addEventListener("submit",e=>{ e.preventDefault(); const all=getJournals(); const k=parseJournalDateText($("v7JournalDate").value); if(!k || k<cfg.startDate || k>cfg.endDate){toast("!",t("journalDateInvalid"),"error");return;} all[k]={date:k,work:$("v7JournalWork").value.trim(),learned:$("v7JournalLearned").value.trim(),mood:$("v7JournalMood").value,projectIds:qa(".v7-project-checks input:checked").map(x=>x.value),updatedAt:new Date().toISOString()}; write(KEYS.journal,all); signalDataChanged(); toast("✓",t("journalSaved"),"success"); renderJournalPage(k); });
    $("v7JournalDelete")?.addEventListener("click",()=>{ if(!confirm(t("deleteConfirm")))return; const all=getJournals(); delete all[key]; write(KEYS.journal,all); signalDataChanged(); toast("🗑",t("journalDeleted")); renderJournalPage(key); });
  }

  function renderProjectsPage(editId="") {
    const root=$("v7ProjectsPage"); if(!root)return; const projects=getProjects(), journals=getJournals();
    const edit=projects.find(p=>p.id===editId)||{id:"",name:"",category:"",progress:0,status:"active",description:""};
    const cards=projects.length?projects.map(p=>{ const days=Object.values(journals).filter(j=>j.projectIds?.includes(p.id)).length; return `<article class="card v7-project-card"><div class="v7-project-head"><div><span class="v7-status-dot ${esc(p.status)}"></span><strong>${esc(p.name)}</strong><small>${esc(p.category||"")}</small></div><b>${Math.round(p.progress||0)}%</b></div><div class="v7-project-progress"><i style="width:${Math.max(0,Math.min(100,Number(p.progress)||0))}%"></i></div><p>${esc(p.description||t("noData"))}</p><small>${days} ${esc(t("journalDays"))}</small><div class="v7-card-actions"><button class="small-text-btn" data-v7-project-edit="${esc(p.id)}" type="button">✎</button><button class="small-text-btn danger-text" data-v7-project-delete="${esc(p.id)}" type="button">🗑</button></div></article>`; }).join(""):`<div class="card v7-empty">🧩 ${esc(t("noProjects"))}</div>`;
    root.innerHTML=`${pageHeader("🧩",t("projectsTitle"),t("projectsHelp"))}<div class="v7-project-layout"><form id="v7ProjectForm" class="card v7-form-card"><input id="v7ProjectId" type="hidden" value="${esc(edit.id)}"><div class="v7-two-col"><label><span>${esc(t("projectName"))}</span><input id="v7ProjectName" maxlength="60" value="${esc(edit.name)}"></label><label><span>${esc(t("category"))}</span><input id="v7ProjectCategory" maxlength="40" value="${esc(edit.category)}" placeholder="Web / Power BI / Learning"></label></div><div class="v7-two-col"><label><span>${esc(t("progress"))}</span><input id="v7ProjectProgress" type="number" min="0" max="100" step="5" value="${Math.round(edit.progress||0)}"></label><label><span>${esc(t("status"))}</span><select id="v7ProjectStatus"><option value="active" ${edit.status==="active"?"selected":""}>${esc(t("active"))}</option><option value="paused" ${edit.status==="paused"?"selected":""}>${esc(t("paused"))}</option><option value="completed" ${edit.status==="completed"?"selected":""}>${esc(t("completed"))}</option></select></label></div><label><span>${esc(t("description"))}</span><textarea id="v7ProjectDescription" rows="4">${esc(edit.description)}</textarea></label><div class="v7-form-actions"><button id="v7ProjectNew" class="secondary-btn" type="button">＋ ${esc(t("newProject"))}</button><button class="primary-btn" type="submit">${esc(t("saveProject"))}</button></div></form><div class="v7-project-cards">${cards}</div></div>`;
    $("v7ProjectNew")?.addEventListener("click",()=>renderProjectsPage());
    $("v7ProjectForm")?.addEventListener("submit",e=>{e.preventDefault();const name=$("v7ProjectName").value.trim();if(!name){toast("!",t("projectNameRequired"),"error");return;}const list=getProjects(),id=$("v7ProjectId").value||`p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`,old=list.find(p=>p.id===id);const item={id,name,category:$("v7ProjectCategory").value.trim(),progress:Math.max(0,Math.min(100,Number($("v7ProjectProgress").value)||0)),status:$("v7ProjectStatus").value,description:$("v7ProjectDescription").value.trim(),createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};const next=list.filter(p=>p.id!==id);next.push(item);next.sort((a,b)=>(a.status==="completed")-(b.status==="completed")||a.name.localeCompare(b.name));write(KEYS.projects,next);signalDataChanged();toast("✓",t("projectSaved"),"success");renderProjectsPage();});
    qa("[data-v7-project-edit]",root).forEach(btn=>btn.addEventListener("click",()=>renderProjectsPage(btn.dataset.v7ProjectEdit)));
    qa("[data-v7-project-delete]",root).forEach(btn=>btn.addEventListener("click",()=>{if(!confirm(t("deleteConfirm")))return;const id=btn.dataset.v7ProjectDelete;write(KEYS.projects,getProjects().filter(p=>p.id!==id));const js=getJournals();Object.values(js).forEach(j=>{if(Array.isArray(j.projectIds))j.projectIds=j.projectIds.filter(x=>x!==id);});write(KEYS.journal,js);signalDataChanged();toast("🗑",t("projectDeleted"));renderProjectsPage();}));
  }

  function renderAchievementsPage() {
    const root=$("v7AchievementsPage");if(!root)return;const stats=API.getStats(),ach=API.getAchievements(stats),unlocked=ach.filter(a=>a.unlocked).length;
    root.innerHTML=`${pageHeader("🏆",t("achievementsTitle"),t("achievementsHelp"))}<div class="card v7-achievement-summary"><div><span>${esc(t("achievementsCount"))}</span><strong>${unlocked}/${ach.length}</strong><small>${esc(t("achievementProgress",{n:unlocked,total:ach.length}))}</small></div><div class="v7-achievement-meter"><i style="width:${ach.length?unlocked/ach.length*100:0}%"></i></div></div><div class="v7-achievement-grid">${ach.map(a=>`<article class="card v7-achievement-card ${a.unlocked?"unlocked":"locked"}"><span class="v7-trophy">${a.icon}</span><div><strong>${esc(API.translate(a.titleKey))}</strong><p>${esc(API.translate(a.descKey))}</p><small>${a.unlocked?"✓ "+esc(t("unlocked")):"🔒 "+esc(t("locked"))}</small></div></article>`).join("")}</div>`;
  }

  function renderReportsPage() {
    const root=$("v7ReportsPage");if(!root)return;const stats=API.getStats(),months=API.getMonthlyStats(),journals=getJournals(),projects=getProjects();
    const rows=months.map(m=>{const ym=`${m.date.getFullYear()}-${String(m.date.getMonth()+1).padStart(2,"0")}`,journalCount=Object.keys(journals).filter(k=>k.startsWith(ym)).length,projectIds=new Set();Object.entries(journals).filter(([k])=>k.startsWith(ym)).forEach(([,j])=>(j.projectIds||[]).forEach(id=>projectIds.add(id)));return `<tr><td>${esc(formatMonth(m.date))}</td><td>${esc(fmt(m.planned))}</td><td>${esc(fmt(m.worked))}</td><td>${esc(fmt(m.leave))}</td><td>${m.holidays}</td><td>${esc(fmt(m.comp))}</td><td>${journalCount}</td><td>${projectIds.size}</td></tr>`;}).join("");
    root.innerHTML=`${pageHeader("📊",t("reportsTitle"),t("reportsHelp"),`<button id="v7DetailedStats" class="outline-btn" type="button">${esc(t("detailedStats"))}</button><button id="v7FinalReport" class="primary-btn" type="button">🎓 ${esc(t("finalReport"))}</button>`)}<div class="v7-report-kpis"><div class="card"><span>${esc(t("workTime"))}</span><strong>${esc(fmt(stats.elapsedMinutes))}</strong></div><div class="card"><span>${esc(t("attendance"))}</span><strong>${stats.attendancePercent.toFixed(1)}%</strong></div><div class="card"><span>${esc(t("personalLeave"))}</span><strong>${esc(fmt(stats.leaveMinutesLost))}</strong></div><div class="card"><span>${esc(t("workdaysLeft"))}</span><strong>${stats.futureWorkdays}</strong></div></div><div class="card v7-monthly-table-card"><div class="v7-card-title"><div><p class="eyebrow">MONTHLY BREAKDOWN</p><h3>${esc(t("monthlyReport"))}</h3></div><button id="v7OpenMonthly" class="outline-btn" type="button">${esc(t("monthlyReport"))} →</button></div><div class="v7-table-wrap"><table><thead><tr><th>${esc(t("month"))}</th><th>${esc(t("planned"))}</th><th>${esc(t("actual"))}</th><th>${esc(t("leave"))}</th><th>${esc(t("holidays"))}</th><th>${esc(t("comp"))}</th><th>${esc(t("journals"))}</th><th>${esc(t("projectsMentioned"))}</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
    $("v7DetailedStats")?.addEventListener("click",()=>$("statsOpen")?.click());
    $("v7FinalReport")?.addEventListener("click",()=>$("v6FinalReport")?.click());
    $("v7OpenMonthly")?.addEventListener("click",()=>$("v6MonthOpen")?.click());
  }

  function renderCalendarIntro() {
    const root=$("v7CalendarIntro");if(!root)return;const overrides=API.getDayOverrides(),vals=Object.values(overrides),hol=vals.filter(x=>x.type==="holiday").length,leave=vals.filter(x=>x.type==="leave").length,work=vals.filter(x=>x.type==="work").length;
    root.innerHTML=`${pageHeader("📅",t("calendarTitle"),t("calendarHelp"),`<button id="v7CalendarPresets" class="outline-btn" type="button">⚙ ${esc(t("presetImport"))}</button>`)}<div class="v7-calendar-kpis"><div class="card"><span>🏢 ${esc(t("companyHoliday"))}</span><strong>${hol}</strong></div><div class="card"><span>🏖 ${esc(t("personalLeave"))}</span><strong>${leave}</strong></div><div class="card"><span>🔄 ${esc(t("compWork"))}</span><strong>${work}</strong></div><div class="card"><span>📌 ${esc(t("specialDates"))}</span><strong>${hol+leave+work}</strong></div></div>`;
    $("v7CalendarPresets")?.addEventListener("click",()=>$("v6CalendarPresets")?.click());
  }

  function mirrorSelect(id, sourceId, options) {
    const src=$(sourceId), el=$(id); if(!src||!el)return;
    el.innerHTML=options.map(([v,l])=>`<option value="${esc(v)}">${esc(l)}</option>`).join("");el.value=src.value;
    el.addEventListener("change",()=>{src.value=el.value;src.dispatchEvent(new Event("change",{bubbles:true}));setTimeout(()=>renderSettingsPage(),20);});
  }
  function mirrorToggle(id, sourceId) {
    const src=$(sourceId),el=$(id);if(!src||!el)return;el.checked=src.checked;el.addEventListener("change",()=>{src.checked=el.checked;src.dispatchEvent(new Event("change",{bubbles:true}));});
  }

  function backupLabel() {
    const stamp=localStorage.getItem(KEYS.lastBackup);if(!stamp)return t("never");const diff=Math.max(0,Math.floor((Date.now()-new Date(stamp).getTime())/86400000));return diff===0?t("today"):t("daysAgo",{n:diff});
  }

  function renderSettingsPage() {
    const root=$("v7SettingsPage");if(!root)return;const cfg=API.getConfig(),state=API.getState();
    root.innerHTML=`${pageHeader("⚙",t("settingsTitle"),t("settingsHelp"))}
      <div class="v7-settings-grid">
        <section class="card v7-settings-card"><div class="v7-card-title"><div><p class="eyebrow">${esc(t("profileSection"))}</p><h3>${esc(t("profileJourney"))}</h3></div><button id="v7EditJourney" class="outline-btn" type="button">${esc(t("editJourney"))}</button></div><div class="v7-profile-summary"><strong>${esc(isDemo()?t("publicDemo"):(cfg.profileName||t("myJourney")))}</strong><span>${esc(API.formatCompactDate(cfg.startDate))} → ${esc(API.formatCompactDate(cfg.endDate))}</span><small>${esc(cfg.workdayStart)} – ${esc(cfg.workdayEnd)} · ${esc(state.timezone)}</small></div></section>
        <section class="card v7-settings-card"><p class="eyebrow">${esc(t("displaySection"))}</p><h3>${esc(t("appearance"))}</h3><div class="v7-settings-fields"><label><span>${esc(t("theme"))}</span><select id="v7Theme"></select></label><label><span>${esc(t("font"))}</span><select id="v7Font"></select></label><label><span>${esc(t("fontSize"))}</span><select id="v7FontSize"></select></label><label><span>${esc(t("density"))}</span><select id="v7Density"></select></label></div></section>
        <section class="card v7-settings-card"><p class="eyebrow">${esc(t("regionSection"))}</p><h3>${esc(t("regionSection"))}</h3><div class="v7-settings-fields"><label><span>${esc(t("timezone"))}</span><select id="v7Timezone"></select></label><label><span>${esc(t("locale"))}</span><select id="v7Locale"></select></label></div></section>
        <section class="card v7-settings-card"><p class="eyebrow">${esc(t("behaviorSection"))}</p><h3>${esc(t("behavior"))}</h3><div class="v7-toggle-list"><label><span>${esc(t("seconds"))}</span><input id="v7Seconds" type="checkbox"></label><label><span>${esc(t("animation"))}</span><input id="v7Animation" type="checkbox"></label><label><span>${esc(t("moodSetting"))}</span><input id="v7Mood" type="checkbox"></label><label><span>${esc(t("notifications"))}</span><input id="v7Notifications" type="checkbox"></label></div></section>
        <section class="card v7-settings-card v7-settings-wide"><div class="v7-card-title"><div><p class="eyebrow">${esc(t("dataSection"))}</p><h3>${esc(t("dataBackup"))}</h3></div><span class="mini-chip">${esc(t("backupStatus"))}: ${esc(backupLabel())}</span></div><div class="v7-settings-actions"><button id="v7ExportBackup" class="outline-btn" type="button">↓ ${esc(t("exportBackup"))}</button><button id="v7ImportBackup" class="outline-btn" type="button">↑ ${esc(t("importBackup"))}</button><button id="v7Customize" class="outline-btn" type="button">⚙ ${esc(t("dashboardLayout"))}</button><button id="v7OpenAdvanced" class="outline-btn" type="button">${esc(t("openFullSettings"))}</button><button id="v7NewJourney" class="secondary-btn" type="button">${esc(t("newJourney"))}</button><button id="v7ResetData" class="danger-btn" type="button">${esc(t("resetData"))}</button></div><p class="muted v7-privacy-text">🔐 ${esc(t("localPrivacy"))}</p></section>
      </div>`;
    mirrorSelect("v7Theme","themeSelect",[["light",t("light")],["dark",t("dark")],["system",t("system")]]);
    mirrorSelect("v7Font","fontFamilySelect",[["sarabun","Sarabun"],["system","System UI"],["noto","Noto Sans Thai"],["ibm","IBM Plex Sans Thai"],["leelawadee","Leelawadee UI"],["tahoma","Tahoma"]]);
    mirrorSelect("v7FontSize","fontSizeSelect",[["small",t("small")],["medium",t("medium")],["large",t("large")]]);
    mirrorSelect("v7Density","densitySelect",[["comfortable",t("comfortable")],["compact",t("compact")]]);
    mirrorSelect("v7Timezone","timezoneSelect",qa("#timezoneSelect option").map(o=>[o.value,o.textContent]));
    mirrorSelect("v7Locale","localeSelect",qa("#localeSelect option").map(o=>[o.value,o.textContent]));
    mirrorToggle("v7Seconds","showSecondsToggle");mirrorToggle("v7Animation","animationToggle");mirrorToggle("v7Mood","dynamicMoodToggle");mirrorToggle("v7Notifications","notificationToggle");
    $("v7EditJourney")?.addEventListener("click",()=>$("editJourneyBtn")?.click());$("v7ExportBackup")?.addEventListener("click",()=>$("exportBackupBtn")?.click());$("v7ImportBackup")?.addEventListener("click",()=>$("importBackupBtn")?.click());$("v7Customize")?.addEventListener("click",()=>$("v6SettingsCustomize")?.click());$("v7OpenAdvanced")?.addEventListener("click",()=>$("settingsOpen")?.click());$("v7NewJourney")?.addEventListener("click",()=>$("startNewJourneyBtn")?.click());$("v7ResetData")?.addEventListener("click",()=>$("resetAllDataBtn")?.click());
  }

  function renderVersion() {
    if ($("footerVersion")) $("footerVersion").textContent=`v${VERSION}`;
    const ft=q(".footer [data-i18n='footerText']"); if(ft)ft.textContent=t("appVersion");
  }

  function bindGlobal() {
    window.addEventListener("hashchange",applyRoute);
    let sidebarResizeTimer;
    window.addEventListener("resize",()=>{ clearTimeout(sidebarResizeTimer); sidebarResizeTimer=setTimeout(syncSidebarMode,120); });
    qa(".lang-btn").forEach(btn=>btn.addEventListener("click",()=>setTimeout(()=>{renderSidebar();renderPage(currentRoute());},30)));
    window.addEventListener("workday:v7-data-changed",()=>renderPage(currentRoute()));
    window.addEventListener("workday:journey-cleared",()=>setTimeout(()=>navigate("dashboard"),20));
  }

  function init() {
    setupShell(); injectPages(); renderVersion(); bindGlobal();
    if (!location.hash || !NAV.some(([key]) => location.hash.includes(key))) history.replaceState(null,"","#/dashboard");
    applyRoute();
    setInterval(()=>{ if(["dashboard","achievements","reports","calendar","settings"].includes(currentRoute())) renderPage(currentRoute()); renderSidebar(); }, 60000);
  }

  init();
})();
