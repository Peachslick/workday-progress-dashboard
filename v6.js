(() => {
  "use strict";

  const API = window.WorkdayJourneyAPI;
  if (!API) return;

  const V6_VERSION = "7.2.0";
  const KEYS = {
    journal: "wp-v6-journal",
    projects: "wp-v6-projects",
    calendarPresets: "wp-v6-calendar-presets",
    lastBackup: "wp-v6-last-backup-at",
    backupDays: "wp-v6-backup-reminder-days",
    layout: "wp-v6-dashboard-layout",
    recapDismissed: "wp-v6-recap-dismissed"
  };

  const TEXT = {
    th: {
      hubEyebrow: "WORK & JOURNEY HUB", hubTitle: "บันทึกงานและวิเคราะห์ Journey", hubHelp: "จดบันทึกงาน ติดตาม Project ดูรายงานรายเดือน และดูแล Backup จากจุดเดียว",
      dailyJournal: "Daily Work Journal", journalSaved: "บันทึกวันนี้แล้ว", journalEmpty: "วันนี้ยังไม่มีบันทึก", openJournal: "เขียนบันทึก", journalTitle: "บันทึกงานประจำวัน", journalDate: "วันที่",
      whatDid: "วันนี้ทำอะไร", whatDidPh: "เช่น แก้ WIP Monitor, ตรวจข้อมูล Power BI...", learned: "สิ่งที่ได้เรียนรู้", learnedPh: "สิ่งที่ได้เรียนรู้ ปัญหาที่แก้ หรือสิ่งที่อยากจำไว้...",
      mood: "ความรู้สึกวันนี้", relatedProjects: "Project ที่เกี่ยวข้อง", noProjectsYet: "ยังไม่มี Project — สร้าง Project ก่อนหรือบันทึกโดยไม่เลือกก็ได้", recentEntries: "บันทึกล่าสุด",
      saveJournal: "บันทึก Journal", deleteEntry: "ลบบันทึกวันนี้", journalDeleted: "ลบบันทึกแล้ว", journalSavedToast: "บันทึก Daily Journal แล้ว", journalDateInvalid: "กรุณาใส่วันที่ให้ถูกต้องในรูปแบบ DD/MM/YYYY", privateJournal: "Journal เป็นข้อมูลส่วนตัวและจะถูกซ่อนใน Demo Mode",
      projectTracker: "Project Tracker", projects: "Projects", activeProjects: "กำลังทำ", completedProjects: "เสร็จแล้ว", manageProjects: "จัดการ Project", projectTitle: "Project Tracker",
      projectName: "ชื่อ Project", projectCategory: "หมวดหมู่", projectProgress: "Progress (%)", projectStatus: "สถานะ", active: "กำลังทำ", paused: "พักไว้", completedProject: "เสร็จแล้ว", projectDescription: "รายละเอียด",
      addProject: "เพิ่ม Project", saveProject: "บันทึก Project", updateProject: "อัปเดต Project", edit: "แก้ไข", delete: "ลบ", projectSaved: "บันทึก Project แล้ว", projectDeleted: "ลบ Project แล้ว", projectNameRequired: "กรุณาใส่ชื่อ Project",
      monthlyReport: "Monthly Report", currentMonth: "เดือนนี้", monthlyHours: "ชั่วโมงทำงาน", journalDays: "วันที่มี Journal", openReport: "ดูรายงาน", monthlyReportTitle: "รายงานประจำเดือน",
      chooseMonth: "เลือกเดือน", plannedHours: "ชั่วโมงตามแผน", actualHours: "เวลาทำงานจริง", attendance: "Attendance", leaveTime: "เวลาลา", holidays: "วันหยุดบริษัท", compensatory: "วันทำงานชดเชย",
      journalEntries: "Journal Entries", projectMentions: "Project ที่มีการบันทึก", journalHighlights: "Journal Highlights", noJournalMonth: "เดือนนี้ยังไม่มี Daily Journal", printSavePdf: "พิมพ์ / Save PDF",
      calendarPresets: "Calendar Preset / Import", calendarPresetsShort: "Preset / Import", calendarPresetHelp: "โหลดวันหยุดบริษัท บันทึกชุดปฏิทินของตัวเอง หรือ Import/Export เป็น JSON",
      builtInCompanyCalendar: "Company Calendar ค่าเริ่มต้น", loadDefaults: "เพิ่มวันหยุดบริษัทค่าเริ่มต้น", defaultsLoaded: "เพิ่ม Company Holidays ค่าเริ่มต้นแล้ว", currentCalendar: "ปฏิทินปัจจุบัน",
      savePreset: "บันทึกเป็น Preset", presetName: "ชื่อ Preset", savedPresets: "Preset ที่บันทึกไว้", noPresets: "ยังไม่มี Preset ที่บันทึก", load: "โหลด", replaceCalendarConfirm: "แทนที่ Calendar ปัจจุบันด้วย Preset นี้หรือไม่?",
      exportCalendar: "Export Calendar JSON", importCalendar: "Import Calendar JSON", clearSpecialDates: "ล้างวันพิเศษทั้งหมด", clearCalendarConfirm: "ลบ Company Holiday, Leave และ Compensatory Workday ทั้งหมดหรือไม่?", calendarImported: "Import Calendar สำเร็จ", calendarExported: "Export Calendar แล้ว", invalidCalendar: "ไฟล์ Calendar ไม่ถูกต้อง",
      backupHealth: "Backup Health", backupNever: "ยังไม่เคย Backup", backupToday: "Backup วันนี้", backupAgo: "Backup ล่าสุด {days} วันที่แล้ว", backupDue: "ควร Backup แล้ว", backupGood: "Backup ยังใหม่อยู่", backupNow: "Backup ตอนนี้", backupReminder: "Backup Reminder", reminderOff: "ปิด", everyDays: "ทุก {days} วัน", backupReminderHelp: "ระบบจะแจ้งเตือนเมื่อ Backup เก่ากว่าระยะเวลาที่กำหนด",
      recapEyebrow: "SMART DAILY RECAP", recapTitle: "สรุปวันทำงานของคุณ", recapText: "วันนี้ทำงาน {today} · สะสมทั้งหมด {total} · Attendance {attendance}%", recapJournalDone: "มี Journal วันนี้แล้ว ✓", recapJournalMissing: "ยังไม่ได้เขียน Journal วันนี้", addTodayJournal: "เพิ่ม Journal วันนี้", dismissToday: "ซ่อนวันนี้",
      customizeDashboard: "Dashboard Customization", customizeHelp: "ซ่อน/แสดง Section และจัดลำดับ Dashboard ตามที่คุณอยากเห็น", customize: "ปรับ Dashboard", visible: "แสดง", moveUp: "ขึ้น", moveDown: "ลง", saveLayout: "บันทึก Layout", resetLayout: "คืน Layout เริ่มต้น", layoutSaved: "บันทึก Dashboard Layout แล้ว",
      sectionToday: "Today Progress", sectionTimeline: "Today Timeline", sectionOverview: "Internship Overview", sectionJourney: "Journey Achievements", sectionAttendance: "Attendance & Time Balance", sectionJourneyLine: "Journey Timeline", sectionSmart: "Smart Journey Tools", sectionHeatmap: "Heatmap", sectionStory: "Journey Story", sectionHub: "Work & Journey Hub", sectionCalendar: "Calendar",
      finalReport: "Final Journey Report", finalReportHelp: "สรุป Journey ทั้งช่วง พร้อม Attendance, Projects, Journal และข้อมูลรายเดือน", openFinalReport: "เปิด Final Report", finalReportTitle: "Final Journey Report", livePreview: "LIVE PREVIEW", completedBadge: "JOURNEY COMPLETE",
      reportJourney: "Journey", reportWork: "Work & Attendance", reportProjects: "Projects", reportJournal: "Journal", reportMonthly: "Monthly Breakdown", reportGenerated: "สร้างรายงานเมื่อ", totalProjects: "Projects ทั้งหมด", completedProjectsLabel: "Projects ที่เสร็จ", totalJournals: "Journal ทั้งหมด", journalCoverage: "วันที่ทำงานที่มี Journal",
      privacyHidden: "ซ่อนใน Demo Mode", close: "ปิด", cancel: "ยกเลิก", save: "บันทึก", noData: "ยังไม่มีข้อมูล", confirmDelete: "ยืนยันการลบรายการนี้?", demoJournalBlocked: "Daily Journal ถูกซ่อนใน Public Demo Mode", reportName: "Workday Journey Report",
      backupToast: "ถึงเวลาสำรองข้อมูล Workday Journey แล้ว", dashboardTools: "เครื่องมือ Dashboard", calendarPresetSettings: "Calendar Presets", finalReportSettings: "Final Journey Report",
      projectDays: "{days} วันมีบันทึก", projectProgressAvg: "Progress เฉลี่ย {percent}%", projectNone: "ยังไม่มี Project", monthSummary: "{hours} · {entries} Journal", journalProjectLink: "Journal เชื่อมกับ Project เพื่อดูย้อนหลังในรายงานรายเดือน",
      moodProductive: "😊 Productive", moodGood: "🙂 Good", moodNeutral: "😐 Normal", moodTired: "😴 Tired", moodChallenging: "💪 Challenging"
    },
    en: {
      hubEyebrow: "WORK & JOURNEY HUB", hubTitle: "Journal & Personal Analytics", hubHelp: "Write daily notes, track projects, review monthly reports, and keep backups healthy from one place",
      dailyJournal: "Daily Work Journal", journalSaved: "Today's entry is saved", journalEmpty: "No entry for today yet", openJournal: "Write Journal", journalTitle: "Daily Work Journal", journalDate: "Date",
      whatDid: "What did you work on?", whatDidPh: "e.g. Updated WIP Monitor, checked Power BI data...", learned: "What did you learn?", learnedPh: "A lesson, solved problem, or something worth remembering...",
      mood: "Today's mood", relatedProjects: "Related Projects", noProjectsYet: "No projects yet — create one first or save without selecting a project", recentEntries: "Recent Entries",
      saveJournal: "Save Journal", deleteEntry: "Delete Today's Entry", journalDeleted: "Journal entry deleted", journalSavedToast: "Daily Journal saved", journalDateInvalid: "Enter a valid date in DD/MM/YYYY format", privateJournal: "Journal content is private and hidden in Demo Mode",
      projectTracker: "Project Tracker", projects: "Projects", activeProjects: "Active", completedProjects: "Completed", manageProjects: "Manage Projects", projectTitle: "Project Tracker",
      projectName: "Project Name", projectCategory: "Category", projectProgress: "Progress (%)", projectStatus: "Status", active: "Active", paused: "Paused", completedProject: "Completed", projectDescription: "Description",
      addProject: "Add Project", saveProject: "Save Project", updateProject: "Update Project", edit: "Edit", delete: "Delete", projectSaved: "Project saved", projectDeleted: "Project deleted", projectNameRequired: "Enter a project name",
      monthlyReport: "Monthly Report", currentMonth: "This Month", monthlyHours: "Working Hours", journalDays: "Journal Days", openReport: "View Report", monthlyReportTitle: "Monthly Report",
      chooseMonth: "Choose Month", plannedHours: "Planned Hours", actualHours: "Actual Work", attendance: "Attendance", leaveTime: "Leave Time", holidays: "Company Holidays", compensatory: "Compensatory Days",
      journalEntries: "Journal Entries", projectMentions: "Projects Mentioned", journalHighlights: "Journal Highlights", noJournalMonth: "No Daily Journal entries this month", printSavePdf: "Print / Save PDF",
      calendarPresets: "Calendar Preset / Import", calendarPresetsShort: "Preset / Import", calendarPresetHelp: "Load company holidays, save your own calendar preset, or import/export JSON",
      builtInCompanyCalendar: "Built-in Company Calendar", loadDefaults: "Add Default Company Holidays", defaultsLoaded: "Default company holidays added", currentCalendar: "Current Calendar",
      savePreset: "Save as Preset", presetName: "Preset Name", savedPresets: "Saved Presets", noPresets: "No saved presets yet", load: "Load", replaceCalendarConfirm: "Replace the current calendar with this preset?",
      exportCalendar: "Export Calendar JSON", importCalendar: "Import Calendar JSON", clearSpecialDates: "Clear All Special Dates", clearCalendarConfirm: "Remove all company holidays, leave days, and compensatory workdays?", calendarImported: "Calendar imported", calendarExported: "Calendar exported", invalidCalendar: "Invalid calendar file",
      backupHealth: "Backup Health", backupNever: "No backup yet", backupToday: "Backed up today", backupAgo: "Last backup {days} days ago", backupDue: "Backup recommended", backupGood: "Backup is up to date", backupNow: "Backup Now", backupReminder: "Backup Reminder", reminderOff: "Off", everyDays: "Every {days} days", backupReminderHelp: "The app reminds you when your latest backup is older than this interval",
      recapEyebrow: "SMART DAILY RECAP", recapTitle: "Your workday recap", recapText: "Today {today} · Total {total} · Attendance {attendance}%", recapJournalDone: "Today's Journal is saved ✓", recapJournalMissing: "Today's Journal is still empty", addTodayJournal: "Add Today's Journal", dismissToday: "Dismiss Today",
      customizeDashboard: "Dashboard Customization", customizeHelp: "Show/hide sections and arrange the dashboard in the order you prefer", customize: "Customize Dashboard", visible: "Visible", moveUp: "Up", moveDown: "Down", saveLayout: "Save Layout", resetLayout: "Reset Layout", layoutSaved: "Dashboard layout saved",
      sectionToday: "Today Progress", sectionTimeline: "Today Timeline", sectionOverview: "Internship Overview", sectionJourney: "Journey Achievements", sectionAttendance: "Attendance & Time Balance", sectionJourneyLine: "Journey Timeline", sectionSmart: "Smart Journey Tools", sectionHeatmap: "Heatmap", sectionStory: "Journey Story", sectionHub: "Work & Journey Hub", sectionCalendar: "Calendar",
      finalReport: "Final Journey Report", finalReportHelp: "A whole-journey summary covering attendance, projects, journal and monthly data", openFinalReport: "Open Final Report", finalReportTitle: "Final Journey Report", livePreview: "LIVE PREVIEW", completedBadge: "JOURNEY COMPLETE",
      reportJourney: "Journey", reportWork: "Work & Attendance", reportProjects: "Projects", reportJournal: "Journal", reportMonthly: "Monthly Breakdown", reportGenerated: "Generated", totalProjects: "Total Projects", completedProjectsLabel: "Completed Projects", totalJournals: "Journal Entries", journalCoverage: "Workdays with Journal",
      privacyHidden: "Hidden in Demo Mode", close: "Close", cancel: "Cancel", save: "Save", noData: "No data yet", confirmDelete: "Delete this item?", demoJournalBlocked: "Daily Journal is hidden in Public Demo Mode", reportName: "Workday Journey Report",
      backupToast: "It is time to back up your Workday Journey data", dashboardTools: "Dashboard Tools", calendarPresetSettings: "Calendar Presets", finalReportSettings: "Final Journey Report",
      projectDays: "{days} journal days", projectProgressAvg: "Average progress {percent}%", projectNone: "No projects yet", monthSummary: "{hours} · {entries} Journals", journalProjectLink: "Link Journal entries to projects so monthly reports can tell the story of your work",
      moodProductive: "😊 Productive", moodGood: "🙂 Good", moodNeutral: "😐 Normal", moodTired: "😴 Tired", moodChallenging: "💪 Challenging"
    }
  };

  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? "").replace(/[&<>'"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[c]));
  const read = (key, fallback) => { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  const lang = () => localStorage.getItem("wp-language") === "en" ? "en" : "th";
  const tr = (key, vars = {}) => {
    let text = TEXT[lang()][key] || TEXT.en[key] || key;
    for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
    return text;
  };
  const keyFromDate = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  const dateFromKey = key => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key||"")); return m ? new Date(+m[1], +m[2]-1, +m[3]) : new Date(); };
  const addDays = (date, days) => { const d = new Date(date); d.setDate(d.getDate()+days); return d; };
  const minutesOfDay = date => date.getHours()*60 + date.getMinutes() + date.getSeconds()/60;
  const formatDuration = minutes => {
    const safe = Math.max(0, Math.round(Number(minutes)||0));
    const h = Math.floor(safe/60), m = safe%60;
    return `${h}h ${String(m).padStart(2,"0")}m`;
  };
  const formatDate = date => new Intl.DateTimeFormat(lang()==="th" ? "th-TH" : "en-GB", { day:"2-digit", month:"short", year:"numeric" }).format(date);
  const formatMonth = date => new Intl.DateTimeFormat(lang()==="th" ? "th-TH" : "en-US", { month:"long", year:"numeric" }).format(date);
  const config = () => API.getConfig();
  const now = () => API.getNow();
  const privacyMode = () => (API.getState().privacyMode || localStorage.getItem("wp-privacy-mode") || "personal");

  const initialJournals = read(KEYS.journal, {});
  const initialProjects = read(KEYS.projects, []);
  const initialPresets = read(KEYS.calendarPresets, []);
  const initialRecapDismissed = read(KEYS.recapDismissed, {});
  let journals = initialJournals && typeof initialJournals === "object" && !Array.isArray(initialJournals) ? initialJournals : {};
  let projects = Array.isArray(initialProjects) ? initialProjects : [];
  let calendarPresets = Array.isArray(initialPresets) ? initialPresets : [];
  let recapDismissed = initialRecapDismissed && typeof initialRecapDismissed === "object" && !Array.isArray(initialRecapDismissed) ? initialRecapDismissed : {};
  let modalType = null;

  // V7 keeps Dashboard Customization focused on the Dashboard page only.
  const SECTION_DEFS = [
    ["today", ".main-grid", "sectionToday"],
    ["timeline", ".timeline-card", "sectionTimeline"],
    ["overview", ".three-grid", "sectionOverview"]
  ];
  const defaultLayout = () => ({ order: SECTION_DEFS.map(x=>x[0]), hidden: [] });
  let layout = normalizeLayout(read(KEYS.layout, defaultLayout()));

  function normalizeLayout(raw) {
    const allowed = SECTION_DEFS.map(x=>x[0]);
    const seen = [];
    for (const key of Array.isArray(raw?.order) ? raw.order : []) if (allowed.includes(key) && !seen.includes(key)) seen.push(key);
    for (const key of allowed) if (!seen.includes(key)) seen.push(key);
    const hidden = Array.isArray(raw?.hidden) ? raw.hidden.filter(k=>allowed.includes(k)) : [];
    return { order: seen, hidden };
  }

  function setupCompleted() { return localStorage.getItem("wp-setup-completed") === "true"; }

  function injectUI() {
    const main = document.querySelector("main.dashboard");
    if (!main || $("v6WorkHub")) return;

    const recap = document.createElement("section");
    recap.id = "v6DailyRecap";
    recap.className = "card v6-recap-card";
    recap.hidden = true;
    recap.innerHTML = `<div class="v6-recap-icon">🌙</div><div class="v6-recap-copy"><p class="eyebrow" id="v6RecapEyebrow"></p><h3 id="v6RecapTitle"></h3><p class="muted" id="v6RecapText"></p><small id="v6RecapJournal"></small></div><div class="v6-recap-actions"><button id="v6RecapJournalBtn" class="primary-btn" type="button"></button><button id="v6RecapDismissBtn" class="secondary-btn" type="button"></button></div>`;
    const hero = main.querySelector(".hero-card");
    const completion = main.querySelector("#completionBanner");
    (completion || hero).insertAdjacentElement("afterend", recap);

    const hub = document.createElement("section");
    hub.id = "v6WorkHub";
    hub.className = "card v6-work-hub";
    hub.innerHTML = `
      <div class="section-heading v6-hub-heading"><div><p class="eyebrow" id="v6HubEyebrow"></p><h3 id="v6HubTitle"></h3><p class="muted section-subtitle" id="v6HubHelp"></p></div><button id="v6CustomizeQuick" class="outline-btn" type="button">⚙ <span></span></button></div>
      <div class="v6-hub-grid">
        <article class="v6-hub-item journal"><span class="v6-hub-icon">📓</span><div><span class="v6-hub-label" id="v6JournalLabel"></span><strong id="v6JournalStatus"></strong><small id="v6JournalProjectHint"></small></div><button id="v6JournalOpen" class="small-text-btn" type="button"></button></article>
        <article class="v6-hub-item projects"><span class="v6-hub-icon">🧩</span><div><span class="v6-hub-label" id="v6ProjectLabel"></span><strong id="v6ProjectStatus"></strong><small id="v6ProjectHint"></small></div><button id="v6ProjectOpen" class="small-text-btn" type="button"></button></article>
        <article class="v6-hub-item monthly"><span class="v6-hub-icon">📊</span><div><span class="v6-hub-label" id="v6MonthLabel"></span><strong id="v6MonthStatus"></strong><small id="v6MonthHint"></small></div><button id="v6MonthOpen" class="small-text-btn" type="button"></button></article>
        <article class="v6-hub-item backup" id="v6BackupHubCard"><span class="v6-hub-icon">💾</span><div><span class="v6-hub-label" id="v6BackupLabel"></span><strong id="v6BackupStatus"></strong><small id="v6BackupHint"></small></div><button id="v6BackupNow" class="small-text-btn" type="button"></button></article>
      </div>
      <div class="v6-hub-actions"><button id="v6CalendarPresets" class="outline-btn" type="button">📅 <span></span></button><button id="v6FinalReport" class="outline-btn" type="button">🎓 <span></span></button></div>`;
    const calendar = main.querySelector(".calendar-card");
    main.insertBefore(hub, calendar || null);

    const calendarNav = document.querySelector(".calendar-nav");
    if (calendarNav && !$("v6CalendarPresetNav")) {
      const btn = document.createElement("button"); btn.id="v6CalendarPresetNav"; btn.className="small-text-btn v6-calendar-preset-nav"; btn.type="button"; btn.innerHTML=`⚙ <span></span>`;
      calendarNav.prepend(btn);
    }

    const journeyActions = document.querySelector(".journey-actions");
    if (journeyActions && !$("v6JourneyReportBtn")) {
      const btn = document.createElement("button"); btn.id="v6JourneyReportBtn"; btn.className="outline-btn"; btn.type="button"; btn.innerHTML=`🎓 <span></span>`; journeyActions.prepend(btn);
    }

    const settingsContent = document.querySelector(".settings-content");
    const dataTools = document.querySelector(".data-tools-setting");
    if (settingsContent && dataTools && !$("v6SettingsTools")) {
      const section = document.createElement("section"); section.id="v6SettingsTools"; section.className="setting-group v6-settings-tools";
      section.innerHTML=`<strong id="v6SettingsToolsTitle"></strong><div class="data-tools-grid"><button id="v6SettingsCustomize" class="outline-btn" type="button">⚙ <span></span></button><button id="v6SettingsCalendar" class="outline-btn" type="button">📅 <span></span></button><button id="v6SettingsReport" class="outline-btn" type="button">🎓 <span></span></button></div><label class="v6-backup-reminder-row"><span><strong id="v6BackupReminderLabel"></strong><small id="v6BackupReminderHelp"></small></span><select id="v6BackupReminderSelect"><option value="0"></option><option value="7"></option><option value="14"></option><option value="30"></option></select></label>`;
      dataTools.insertAdjacentElement("afterend", section);
    }

    const completionModal = $("completionModal");
    if (completionModal && !$("v6CompletionReportBtn")) {
      const btn=document.createElement("button"); btn.id="v6CompletionReportBtn"; btn.className="outline-btn completion-snapshot-btn"; btn.type="button"; btn.innerHTML=`📄 <span></span>`; completionModal.appendChild(btn);
    }

    const overlay = document.createElement("div");
    overlay.id = "v6ModalBackdrop";
    overlay.className = "modal-backdrop v6-modal-backdrop";
    overlay.hidden = true;
    overlay.innerHTML = `<section id="v6Modal" class="v6-modal" role="dialog" aria-modal="true" aria-hidden="true"><div class="modal-header sticky-modal-header"><div><p id="v6ModalEyebrow" class="eyebrow">WORKDAY JOURNEY · V7</p><h2 id="v6ModalTitle"></h2></div><button id="v6ModalClose" class="icon-btn" type="button" aria-label="Close">×</button></div><div id="v6ModalContent" class="v6-modal-content"></div></section>`;
    document.body.appendChild(overlay);

    const file = document.createElement("input"); file.id="v6CalendarFileInput"; file.type="file"; file.accept="application/json,.json"; file.hidden=true; document.body.appendChild(file);
  }

  function openModal(type, title, html) {
    modalType = type;
    $("v6ModalTitle").textContent = title;
    $("v6ModalContent").innerHTML = html;
    $("v6ModalBackdrop").hidden = false;
    requestAnimationFrame(() => $("v6Modal").classList.add("open"));
    $("v6Modal").setAttribute("aria-hidden","false");
  }
  function closeModal() {
    modalType = null;
    $("v6Modal")?.classList.remove("open");
    $("v6Modal")?.setAttribute("aria-hidden","true");
    setTimeout(()=>{ if ($("v6Modal") && !$("v6Modal").classList.contains("open")) $("v6ModalBackdrop").hidden=true; },180);
  }
  function toastType(icon,message="") {
    const text=String(message||"").toLowerCase();
    if(["✓","✅","↓"].includes(icon)) return "success";
    if(icon==="!" || icon==="✕" || /required|invalid|กรุณา|ไม่ถูกต้อง|ผิดพลาด/.test(text)) return "error";
    if(["⚠","⚠️","🔕","💾"].includes(icon)) return "warning";
    return "info";
  }
  function toast(icon, message, type="") {
    const stack = $("toastStack"); if (!stack) return;
    const tone=type||toastType(icon,message);
    const node=document.createElement("div"); node.className=`app-toast v6-toast toast-${tone}`; node.setAttribute("role",tone==="error"?"alert":"status"); node.innerHTML=`<span>${icon}</span><div><strong>${esc(message)}</strong></div>`; stack.appendChild(node); setTimeout(()=>{node.classList.add("out");setTimeout(()=>node.remove(),250);},3200);
  }
  function formatJournalDateKey(key){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key||""));return m?`${m[3]}/${m[2]}/${m[1]}`:"";}
  function parseJournalDateText(value){const m=/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/.exec(String(value||"").trim());if(!m)return"";const d=+m[1],mo=+m[2],y=+m[3],dt=new Date(y,mo-1,d);if(y<1900||y>2200||mo<1||mo>12||d<1||d>31||dt.getFullYear()!==y||dt.getMonth()!==mo-1||dt.getDate()!==d)return"";return`${String(y).padStart(4,"0")}-${String(mo).padStart(2,"0")}-${String(d).padStart(2,"0")}`;}
  function maskJournalDate(value){const d=String(value||"").replace(/\D/g,"").slice(0,8);if(d.length<=2)return d;if(d.length<=4)return`${d.slice(0,2)}/${d.slice(2)}`;return`${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4)}`;}
  function openJournalPicker(textInput,picker){const parsed=parseJournalDateText(textInput?.value);if(parsed)picker.value=parsed;try{if(typeof picker.showPicker==="function")picker.showPicker();else picker.click();}catch{picker.click();}}

  function saveJournals() { write(KEYS.journal, journals); renderHub(); }
  function saveProjects() { write(KEYS.projects, projects); renderHub(); }

  function projectMap() { return Object.fromEntries(projects.map(p=>[p.id,p])); }
  function journalForDate(key) { return journals[key] || null; }
  function journalProjectNames(entry) { const map=projectMap(); return (entry?.projectIds||[]).map(id=>map[id]?.name).filter(Boolean); }

  function journalFormHtml(dateKey) {
    const entry = journalForDate(dateKey) || { work:"", learned:"", mood:"productive", projectIds:[] };
    const projectOptions = projects.length ? projects.map(p=>`<label class="v6-project-check"><input type="checkbox" value="${esc(p.id)}" ${entry.projectIds?.includes(p.id)?"checked":""}><span><strong>${esc(p.name)}</strong><small>${esc(p.category||p.status||"")}</small></span></label>`).join("") : `<p class="v6-empty">${esc(tr("noProjectsYet"))}</p>`;
    const recent = Object.entries(journals).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,5).map(([key,item])=>`<button class="v6-recent-entry" data-journal-date="${key}" type="button"><strong>${esc(formatDate(dateFromKey(key)))}</strong><span>${esc((item.work||item.learned||tr("noData")).slice(0,80))}</span></button>`).join("") || `<p class="v6-empty">${esc(tr("noData"))}</p>`;
    return `<div class="v6-journal-layout"><div class="v6-form-stack"><label><span>${esc(tr("journalDate"))}</span><div class="journal-date-control"><input id="v6JournalDate" class="journal-date-text" type="text" inputmode="numeric" autocomplete="off" maxlength="10" placeholder="DD/MM/YYYY" value="${esc(formatJournalDateKey(dateKey))}"><button id="v6JournalDateBtn" class="journal-date-picker-btn" type="button" aria-label="Calendar" title="Calendar">🗓</button><input id="v6JournalDatePicker" class="journal-date-native" type="date" tabindex="-1" aria-hidden="true" min="${esc(config().startDate)}" max="${esc(config().endDate)}" value="${esc(dateKey)}"></div></label><label><span>${esc(tr("whatDid"))}</span><textarea id="v6JournalWork" rows="4" placeholder="${esc(tr("whatDidPh"))}">${esc(entry.work||"")}</textarea></label><label><span>${esc(tr("learned"))}</span><textarea id="v6JournalLearned" rows="4" placeholder="${esc(tr("learnedPh"))}">${esc(entry.learned||"")}</textarea></label><label><span>${esc(tr("mood"))}</span><select id="v6JournalMood">${["productive","good","neutral","tired","challenging"].map(v=>`<option value="${v}" ${entry.mood===v?"selected":""}>${esc(tr(`mood${v[0].toUpperCase()+v.slice(1)}`))}</option>`).join("")}</select></label><div><span class="v6-field-title">${esc(tr("relatedProjects"))}</span><div id="v6JournalProjects" class="v6-project-check-grid">${projectOptions}</div><small class="muted">${esc(tr("journalProjectLink"))}</small></div><div class="v6-modal-actions"><button id="v6JournalDelete" class="danger-btn" type="button" ${journalForDate(dateKey)?"":"disabled"}>${esc(tr("deleteEntry"))}</button><button id="v6JournalSave" class="primary-btn" type="button">${esc(tr("saveJournal"))}</button></div><p class="v6-private-note">🔐 ${esc(tr("privateJournal"))}</p></div><aside class="v6-recent-panel"><h3>${esc(tr("recentEntries"))}</h3>${recent}</aside></div>`;
  }

  function openJournal(dateKey = keyFromDate(now())) {
    if (privacyMode() === "demo") { toast("🔐", tr("demoJournalBlocked")); return; }
    const safeKey = dateKey < config().startDate ? config().startDate : dateKey > config().endDate ? config().endDate : dateKey;
    openModal("journal", tr("journalTitle"), journalFormHtml(safeKey));
    bindJournalModal(safeKey);
  }
  function bindJournalModal(dateKey) {
    const textDate=$("v6JournalDate"), picker=$("v6JournalDatePicker"), pickerBtn=$("v6JournalDateBtn");
    textDate?.addEventListener("input",()=>{textDate.value=maskJournalDate(textDate.value);});
    const loadDate=()=>{const parsed=parseJournalDateText(textDate?.value);if(!parsed||parsed<config().startDate||parsed>config().endDate){toast("!",tr("journalDateInvalid"),"error");textDate?.focus();return;}openJournal(parsed);};
    textDate?.addEventListener("change",loadDate);
    textDate?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();loadDate();}});
    picker?.addEventListener("change",()=>{if(picker.value)openJournal(picker.value);});
    pickerBtn?.addEventListener("click",()=>openJournalPicker(textDate,picker));
    document.querySelectorAll("[data-journal-date]").forEach(btn=>btn.addEventListener("click",()=>openJournal(btn.dataset.journalDate)));
    $("v6JournalSave")?.addEventListener("click",()=>{
      const key=parseJournalDateText($("v6JournalDate").value);
      if(!key||key<config().startDate||key>config().endDate){toast("!",tr("journalDateInvalid"),"error");return;}
      const work=$("v6JournalWork").value.trim(), learned=$("v6JournalLearned").value.trim(), mood=$("v6JournalMood").value;
      const projectIds=[...document.querySelectorAll("#v6JournalProjects input:checked")].map(x=>x.value);
      journals[key]={ work, learned, mood, projectIds, updatedAt:new Date().toISOString(), createdAt:journals[key]?.createdAt||new Date().toISOString() };
      saveJournals(); toast("✓",tr("journalSavedToast"),"success"); openJournal(key);
    });
    $("v6JournalDelete")?.addEventListener("click",()=>{
      if (!journals[dateKey] || !confirm(tr("confirmDelete"))) return;
      delete journals[dateKey]; saveJournals(); toast("🗑",tr("journalDeleted")); openJournal(dateKey);
    });
  }

  function projectFormHtml(editId="") {
    const edit = projects.find(p=>p.id===editId) || { id:"", name:"", category:"", progress:0, status:"active", description:"" };
    const cards = projects.length ? projects.map(p=>{
      const days=Object.values(journals).filter(j=>j.projectIds?.includes(p.id)).length;
      return `<article class="v6-project-card"><div class="v6-project-card-head"><div><span class="v6-status-dot ${esc(p.status)}"></span><strong>${esc(p.name)}</strong><small>${esc(p.category||"")}</small></div><b>${Math.round(p.progress||0)}%</b></div><div class="v6-project-progress"><i style="width:${Math.max(0,Math.min(100,Number(p.progress)||0))}%"></i></div><p>${esc(p.description||tr("noData"))}</p><small>${esc(tr("projectDays",{days}))}</small><div class="v6-card-actions"><button class="small-text-btn" data-project-edit="${esc(p.id)}" type="button">${esc(tr("edit"))}</button><button class="small-text-btn danger-text" data-project-delete="${esc(p.id)}" type="button">${esc(tr("delete"))}</button></div></article>`;
    }).join("") : `<p class="v6-empty">${esc(tr("projectNone"))}</p>`;
    return `<div class="v6-project-layout"><form id="v6ProjectForm" class="v6-project-form"><input id="v6ProjectId" type="hidden" value="${esc(edit.id)}"><div class="v6-two-col"><label><span>${esc(tr("projectName"))}</span><input id="v6ProjectName" maxlength="60" value="${esc(edit.name)}"></label><label><span>${esc(tr("projectCategory"))}</span><input id="v6ProjectCategory" maxlength="40" value="${esc(edit.category)}" placeholder="Web / Power BI / Learning"></label></div><div class="v6-two-col"><label><span>${esc(tr("projectProgress"))}</span><input id="v6ProjectProgress" type="number" min="0" max="100" step="5" value="${Math.round(edit.progress||0)}"></label><label><span>${esc(tr("projectStatus"))}</span><select id="v6ProjectStatus"><option value="active" ${edit.status==="active"?"selected":""}>${esc(tr("active"))}</option><option value="paused" ${edit.status==="paused"?"selected":""}>${esc(tr("paused"))}</option><option value="completed" ${edit.status==="completed"?"selected":""}>${esc(tr("completedProject"))}</option></select></label></div><label><span>${esc(tr("projectDescription"))}</span><textarea id="v6ProjectDescription" rows="3">${esc(edit.description)}</textarea></label><div class="v6-modal-actions"><button id="v6ProjectClear" class="secondary-btn" type="button">${esc(tr("addProject"))}</button><button class="primary-btn" type="submit">${esc(edit.id?tr("updateProject"):tr("saveProject"))}</button></div></form><div class="v6-project-list">${cards}</div></div>`;
  }
  function openProjects(editId="") {
    openModal("projects",tr("projectTitle"),projectFormHtml(editId));
    $("v6ProjectForm")?.addEventListener("submit",e=>{ e.preventDefault(); const name=$("v6ProjectName").value.trim(); if(!name){toast("!",tr("projectNameRequired"),"error");return;} const id=$("v6ProjectId").value||`p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`; const existing=projects.find(p=>p.id===id); const item={id,name,category:$("v6ProjectCategory").value.trim(),progress:Math.max(0,Math.min(100,Number($("v6ProjectProgress").value)||0)),status:$("v6ProjectStatus").value,description:$("v6ProjectDescription").value.trim(),createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()}; projects=projects.filter(p=>p.id!==id); projects.push(item); projects.sort((a,b)=>(a.status==="completed")-(b.status==="completed")||a.name.localeCompare(b.name)); saveProjects(); toast("✓",tr("projectSaved"),"success"); openProjects(); });
    $("v6ProjectClear")?.addEventListener("click",()=>openProjects());
    document.querySelectorAll("[data-project-edit]").forEach(btn=>btn.addEventListener("click",()=>openProjects(btn.dataset.projectEdit)));
    document.querySelectorAll("[data-project-delete]").forEach(btn=>btn.addEventListener("click",()=>{ if(!confirm(tr("confirmDelete")))return; const id=btn.dataset.projectDelete; projects=projects.filter(p=>p.id!==id); for(const entry of Object.values(journals)) if(Array.isArray(entry.projectIds)) entry.projectIds=entry.projectIds.filter(x=>x!==id); saveProjects(); saveJournals(); toast("🗑",tr("projectDeleted")); openProjects(); }));
  }

  function monthKeys() {
    const cfg=config(), start=dateFromKey(cfg.startDate), end=dateFromKey(cfg.endDate), out=[];
    let cur=new Date(start.getFullYear(),start.getMonth(),1), last=new Date(end.getFullYear(),end.getMonth(),1);
    while(cur<=last){out.push(`${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,"0")}`);cur=new Date(cur.getFullYear(),cur.getMonth()+1,1);} return out;
  }
  function clampMonthKey(key) { const keys=monthKeys(); return keys.includes(key)?key:(keys.includes(keyFromDate(now()).slice(0,7))?keyFromDate(now()).slice(0,7):keys[Math.max(0,keys.length-1)]); }
  function monthMetrics(ym) {
    const cfg=config(), [y,m]=ym.split("-").map(Number), start=new Date(y,m-1,1), end=new Date(y,m,0), current=now();
    let planned=0,actual=0,expected=0,leave=0,holidays=0,comp=0,scheduledDays=0;
    for(let d=new Date(start);d<=end;d=addDays(d,1)){
      const key=keyFromDate(d); if(key<cfg.startDate||key>cfg.endDate) continue;
      const scheduled=API.getScheduledMinutes(d), type=API.getDayType(d), override=API.getDayOverrides()[key];
      if(type==="holiday") holidays++;
      if(type==="leave") leave+=API.getLeaveMinutes(d);
      if(override?.type==="work") comp++;
      if(scheduled>0){scheduledDays++;planned+=scheduled;actual+=API.getWorkedMinutes(d,current);expected+=API.getNormalScheduleElapsedMinutes(d,current);}
    }
    const entries=Object.entries(journals).filter(([key])=>key.startsWith(ym));
    const projectIds=new Set(entries.flatMap(([,e])=>e.projectIds||[]));
    return {ym,start,planned,actual,expected,leave,holidays,comp,scheduledDays,entries,projectIds,attendance:expected>0?Math.min(100,actual/expected*100):100};
  }
  function monthlyReportHtml(ym) {
    const metrics=monthMetrics(ym), pmap=projectMap();
    const monthOptions=monthKeys().map(key=>`<option value="${key}" ${key===ym?"selected":""}>${esc(formatMonth(new Date(+key.slice(0,4),+key.slice(5)-1,1)))}</option>`).join("");
    const projectNames=[...metrics.projectIds].map(id=>pmap[id]?.name).filter(Boolean);
    const highlights=privacyMode()==="demo" ? `<p class="v6-empty">🔐 ${esc(tr("privacyHidden"))}</p>` : (metrics.entries.length?metrics.entries.sort((a,b)=>b[0].localeCompare(a[0])).map(([key,e])=>`<article class="v6-report-note"><strong>${esc(formatDate(dateFromKey(key)))}</strong><p>${esc(e.work||e.learned||tr("noData"))}</p><small>${esc(journalProjectNames(e).join(" · "))}</small></article>`).join(""):`<p class="v6-empty">${esc(tr("noJournalMonth"))}</p>`);
    return `<div id="v6MonthlyPrintable"><div class="v6-report-toolbar"><label><span>${esc(tr("chooseMonth"))}</span><select id="v6MonthSelect">${monthOptions}</select></label><button id="v6MonthPrint" class="outline-btn" type="button">🖨 ${esc(tr("printSavePdf"))}</button></div><div class="v6-report-hero"><div><span>${esc(formatMonth(metrics.start))}</span><strong>${esc(formatDuration(metrics.actual))}</strong><small>${esc(tr("actualHours"))}</small></div><div><span>${esc(tr("attendance"))}</span><strong>${metrics.attendance.toFixed(1)}%</strong><small>${esc(tr("plannedHours"))} ${esc(formatDuration(metrics.planned))}</small></div></div><div class="v6-report-kpis"><div><span>${esc(tr("leaveTime"))}</span><strong>${esc(formatDuration(metrics.leave))}</strong></div><div><span>${esc(tr("holidays"))}</span><strong>${metrics.holidays}</strong></div><div><span>${esc(tr("compensatory"))}</span><strong>${metrics.comp}</strong></div><div><span>${esc(tr("journalEntries"))}</span><strong>${metrics.entries.length}</strong></div></div><section class="v6-report-section"><h3>${esc(tr("projectMentions"))}</h3><div class="v6-chip-list">${projectNames.length?projectNames.map(n=>`<span>${esc(n)}</span>`).join(""):`<span>${esc(tr("noData"))}</span>`}</div></section><section class="v6-report-section"><h3>${esc(tr("journalHighlights"))}</h3><div class="v6-report-notes">${highlights}</div></section></div>`;
  }
  function openMonthlyReport(ym=clampMonthKey(keyFromDate(now()).slice(0,7))) {
    ym=clampMonthKey(ym); openModal("monthly",tr("monthlyReportTitle"),monthlyReportHtml(ym));
    $("v6MonthSelect")?.addEventListener("change",e=>openMonthlyReport(e.target.value));
    $("v6MonthPrint")?.addEventListener("click",()=>printHtml(`${tr("monthlyReportTitle")} · ${formatMonth(monthMetrics(ym).start)}`, $("v6MonthlyPrintable").innerHTML));
  }

  function openCalendarPresets() {
    const defaults=API.defaultCompanyHolidays.map(key=>`<span class="v6-date-chip">${esc(formatDate(dateFromKey(key)))}</span>`).join("");
    const saved=calendarPresets.length?calendarPresets.map(p=>`<article class="v6-preset-card"><div><strong>${esc(p.name)}</strong><small>${Object.keys(p.overrides||{}).length} dates</small></div><div><button class="small-text-btn" data-preset-load="${esc(p.id)}" type="button">${esc(tr("load"))}</button><button class="small-text-btn danger-text" data-preset-delete="${esc(p.id)}" type="button">${esc(tr("delete"))}</button></div></article>`).join(""):`<p class="v6-empty">${esc(tr("noPresets"))}</p>`;
    openModal("calendar",tr("calendarPresets"),`<div class="v6-calendar-tools-modal"><section class="v6-tool-panel"><h3>${esc(tr("builtInCompanyCalendar"))}</h3><div class="v6-date-chip-list">${defaults}</div><button id="v6LoadDefaults" class="primary-btn" type="button">${esc(tr("loadDefaults"))}</button></section><section class="v6-tool-panel"><h3>${esc(tr("savePreset"))}</h3><div class="v6-inline-form"><input id="v6PresetName" maxlength="50" placeholder="${esc(tr("presetName"))}"><button id="v6SavePreset" class="outline-btn" type="button">${esc(tr("savePreset"))}</button></div><div class="v6-preset-list"><h4>${esc(tr("savedPresets"))}</h4>${saved}</div></section><section class="v6-tool-panel"><h3>${esc(tr("currentCalendar"))}</h3><div class="v6-tool-actions"><button id="v6ExportCalendar" class="outline-btn" type="button">↓ ${esc(tr("exportCalendar"))}</button><button id="v6ImportCalendar" class="outline-btn" type="button">↑ ${esc(tr("importCalendar"))}</button><button id="v6ClearCalendar" class="danger-btn" type="button">${esc(tr("clearSpecialDates"))}</button></div></section></div>`);
    $("v6LoadDefaults")?.addEventListener("click",()=>{ const o=API.getDayOverrides(); for(const key of API.defaultCompanyHolidays) o[key]={type:"holiday",note:""}; API.setDayOverrides(o); toast("✓",tr("defaultsLoaded")); openCalendarPresets(); });
    $("v6SavePreset")?.addEventListener("click",()=>{ const name=$("v6PresetName").value.trim(); if(!name)return; calendarPresets.push({id:`c_${Date.now().toString(36)}`,name,overrides:API.getDayOverrides(),createdAt:new Date().toISOString()}); write(KEYS.calendarPresets,calendarPresets); openCalendarPresets(); });
    document.querySelectorAll("[data-preset-load]").forEach(btn=>btn.addEventListener("click",()=>{ const p=calendarPresets.find(x=>x.id===btn.dataset.presetLoad); if(!p||!confirm(tr("replaceCalendarConfirm")))return; API.setDayOverrides(p.overrides||{}); closeModal(); toast("✓",p.name); }));
    document.querySelectorAll("[data-preset-delete]").forEach(btn=>btn.addEventListener("click",()=>{ if(!confirm(tr("confirmDelete")))return; calendarPresets=calendarPresets.filter(x=>x.id!==btn.dataset.presetDelete); write(KEYS.calendarPresets,calendarPresets); openCalendarPresets(); }));
    $("v6ExportCalendar")?.addEventListener("click",exportCalendar);
    $("v6ImportCalendar")?.addEventListener("click",()=>$("v6CalendarFileInput").click());
    $("v6ClearCalendar")?.addEventListener("click",()=>{ if(!confirm(tr("clearCalendarConfirm")))return; API.setDayOverrides({}); closeModal(); });
  }
  function exportCalendar() {
    const payload={type:"workday-calendar-preset",version:V6_VERSION,exportedAt:new Date().toISOString(),journey:{startDate:config().startDate,endDate:config().endDate},overrides:API.getDayOverrides()};
    downloadJson(payload,`workday-calendar-${keyFromDate(now())}.json`); toast("↓",tr("calendarExported"));
  }
  async function importCalendarFile(file) {
    try { const payload=JSON.parse(await file.text()); const overrides=payload?.type==="workday-calendar-preset"?payload.overrides:(payload?.overrides||payload); if(!overrides||typeof overrides!=="object"||Array.isArray(overrides))throw new Error(); const clean={}; for(const [key,value] of Object.entries(overrides)){ if(!/^\d{4}-\d{2}-\d{2}$/.test(key)||!value||!["holiday","leave","work"].includes(value.type))continue; clean[key]={...value}; } if(!Object.keys(clean).length && Object.keys(overrides).length)throw new Error(); if(!confirm(tr("replaceCalendarConfirm")))return; API.setDayOverrides(clean); toast("✓",tr("calendarImported")); if(modalType==="calendar")openCalendarPresets(); } catch { toast("!",tr("invalidCalendar")); } finally { $("v6CalendarFileInput").value=""; }
  }
  function downloadJson(payload, filename) { const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}), url=URL.createObjectURL(blob), a=document.createElement("a"); a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000); }

  function backupReminderDays() { const raw=localStorage.getItem(KEYS.backupDays); if(raw===null) return 14; const n=Number(raw); return Number.isFinite(n)?n:14; }
  function backupStatus() {
    const stamp=localStorage.getItem(KEYS.lastBackup), days=backupReminderDays();
    if(!stamp) return { due:days>0, text:tr("backupNever"), daysAgo:null };
    const diff=Math.max(0,Math.floor((Date.now()-new Date(stamp).getTime())/86400000));
    return {due:days>0&&diff>=days,text:diff===0?tr("backupToday"):tr("backupAgo",{days:diff}),daysAgo:diff};
  }
  function markBackupNow() { localStorage.setItem(KEYS.lastBackup,new Date().toISOString()); renderHub(); }
  function doBackup() { markBackupNow(); API.exportBackup(); }

  function shouldShowRecap() {
    if(!setupCompleted()) return false;
    const d=now(), key=keyFromDate(d), cfg=config(); if(key<cfg.startDate||key>cfg.endDate||recapDismissed[key])return false;
    if(API.getScheduledMinutes(d)<=0)return false;
    const end=Number(cfg.workdayEnd.slice(0,2))*60+Number(cfg.workdayEnd.slice(3,5)); return minutesOfDay(d)>=end;
  }
  function renderRecap() {
    const el=$("v6DailyRecap"); if(!el)return;
    if(!shouldShowRecap()){el.hidden=true;return;}
    const d=now(), stats=API.getStats(d), key=keyFromDate(d), has=!!journals[key];
    $("v6RecapEyebrow").textContent=tr("recapEyebrow"); $("v6RecapTitle").textContent=tr("recapTitle");
    $("v6RecapText").textContent=tr("recapText",{today:formatDuration(API.getWorkedMinutes(d,d)),total:formatDuration(stats.elapsedMinutes),attendance:stats.attendancePercent.toFixed(1)});
    $("v6RecapJournal").textContent=has?tr("recapJournalDone"):tr("recapJournalMissing"); $("v6RecapJournalBtn").textContent=tr("addTodayJournal"); $("v6RecapJournalBtn").hidden=privacyMode()==="demo"; $("v6RecapDismissBtn").textContent=tr("dismissToday"); el.hidden=false;
  }

  function applyLayout() {
    const main=document.querySelector("main.dashboard"); if(!main)return;
    layout=normalizeLayout(layout);
    for(const key of layout.order){ const def=SECTION_DEFS.find(x=>x[0]===key), el=def?document.querySelector(def[1]):null; if(el) main.appendChild(el); }
    for(const [key,selector] of SECTION_DEFS){ const el=document.querySelector(selector); if(el)el.classList.toggle("v6-section-hidden",layout.hidden.includes(key)); }
  }
  function customizeHtml() {
    const rows=layout.order.map(key=>{ const def=SECTION_DEFS.find(x=>x[0]===key); return `<li class="v6-layout-row" draggable="true" data-layout-key="${key}"><span class="v6-drag-handle">⋮⋮</span><label><input type="checkbox" ${layout.hidden.includes(key)?"":"checked"}><strong>${esc(tr(def[2]))}</strong></label><div><button class="small-icon-btn" data-layout-up type="button" title="${esc(tr("moveUp"))}">↑</button><button class="small-icon-btn" data-layout-down type="button" title="${esc(tr("moveDown"))}">↓</button></div></li>`; }).join("");
    return `<p class="muted">${esc(tr("customizeHelp"))}</p><ul id="v6LayoutList" class="v6-layout-list">${rows}</ul><div class="v6-modal-actions"><button id="v6LayoutReset" class="secondary-btn" type="button">${esc(tr("resetLayout"))}</button><button id="v6LayoutSave" class="primary-btn" type="button">${esc(tr("saveLayout"))}</button></div>`;
  }
  function openCustomize() {
    openModal("customize",tr("customizeDashboard"),customizeHtml());
    const list=$("v6LayoutList"); let dragging=null;
    list.querySelectorAll(".v6-layout-row").forEach(row=>{
      row.addEventListener("dragstart",()=>{dragging=row;row.classList.add("dragging");}); row.addEventListener("dragend",()=>{row.classList.remove("dragging");dragging=null;});
      row.addEventListener("dragover",e=>{e.preventDefault();if(!dragging||dragging===row)return;const rect=row.getBoundingClientRect();list.insertBefore(dragging,e.clientY<rect.top+rect.height/2?row:row.nextSibling);});
      row.querySelector("[data-layout-up]").addEventListener("click",()=>{const prev=row.previousElementSibling;if(prev)list.insertBefore(row,prev);});
      row.querySelector("[data-layout-down]").addEventListener("click",()=>{const next=row.nextElementSibling;if(next)list.insertBefore(next,row);});
    });
    $("v6LayoutSave").addEventListener("click",()=>{const rows=[...list.querySelectorAll(".v6-layout-row")];layout={order:rows.map(r=>r.dataset.layoutKey),hidden:rows.filter(r=>!r.querySelector("input").checked).map(r=>r.dataset.layoutKey)};write(KEYS.layout,layout);applyLayout();closeModal();toast("✓",tr("layoutSaved"));});
    $("v6LayoutReset").addEventListener("click",()=>{layout=defaultLayout();write(KEYS.layout,layout);applyLayout();openCustomize();});
  }

  function journalCoverage() {
    const stats=API.getStats(), workedDates=[]; const cfg=config(), end=now();
    for(let d=dateFromKey(cfg.startDate); keyFromDate(d)<=cfg.endDate && d<=end; d=addDays(d,1)) if(API.getWorkedMinutes(d,end)>0)workedDates.push(keyFromDate(d));
    const withJournal=workedDates.filter(key=>!!journals[key]).length; return {withJournal,total:workedDates.length,percent:workedDates.length?withJournal/workedDates.length*100:0};
  }
  function finalReportHtml() {
    const stats=API.getStats(), cfg=config(), achievements=API.getAchievements(stats), unlocked=achievements.filter(x=>x.unlocked).length, coverage=journalCoverage(), monthly=API.getMonthlyStats(), completed=projects.filter(p=>p.status==="completed").length;
    const profile=privacyMode()==="demo"?tr("privacyHidden"):(cfg.profileName||"My Journey");
    const projectRows=projects.length?projects.map(p=>`<tr><td>${esc(p.name)}</td><td>${esc(p.category||"—")}</td><td>${esc(tr(p.status==="completed"?"completedProject":p.status==="paused"?"paused":"active"))}</td><td>${Math.round(p.progress||0)}%</td></tr>`).join(""):`<tr><td colspan="4">${esc(tr("noData"))}</td></tr>`;
    const monthRows=monthly.map(m=>`<tr><td>${esc(formatMonth(m.date))}</td><td>${esc(formatDuration(m.worked))}</td><td>${esc(formatDuration(m.leave))}</td><td>${m.holidays}</td><td>${esc(formatDuration(m.comp))}</td></tr>`).join("");
    const journalPreview=privacyMode()==="demo"?`<p class="v6-empty">🔐 ${esc(tr("privacyHidden"))}</p>`:(Object.entries(journals).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,8).map(([key,e])=>`<article class="v6-report-note"><strong>${esc(formatDate(dateFromKey(key)))}</strong><p>${esc(e.work||e.learned||tr("noData"))}</p><small>${esc(journalProjectNames(e).join(" · "))}</small></article>`).join("")||`<p class="v6-empty">${esc(tr("noData"))}</p>`);
    return `<div id="v6FinalPrintable" class="v6-final-report"><header class="v6-final-header"><div><p class="eyebrow">WORKDAY JOURNEY · V7</p><h2>${esc(profile)}</h2><p>${esc(formatDate(dateFromKey(cfg.startDate)))} → ${esc(formatDate(dateFromKey(cfg.endDate)))}</p></div><span class="v6-report-badge">${esc(stats.journeyComplete?tr("completedBadge"):tr("livePreview"))}</span></header><section class="v6-report-section"><h3>${esc(tr("reportJourney"))}</h3><div class="v6-report-kpis v6-report-kpis-4"><div><span>Journey</span><strong>${stats.percent.toFixed(1)}%</strong></div><div><span>${esc(tr("actualHours"))}</span><strong>${esc(formatDuration(stats.elapsedMinutes))}</strong></div><div><span>${esc(tr("attendance"))}</span><strong>${stats.attendancePercent.toFixed(1)}%</strong></div><div><span>Achievements</span><strong>${unlocked}/${achievements.length}</strong></div></div></section><section class="v6-report-section"><h3>${esc(tr("reportWork"))}</h3><div class="v6-report-kpis"><div><span>${esc(tr("leaveTime"))}</span><strong>${esc(formatDuration(stats.leaveMinutesLost))}</strong></div><div><span>${esc(tr("holidays"))}</span><strong>${stats.totalCompanyHolidayCount}</strong></div><div><span>${esc(tr("compensatory"))}</span><strong>${stats.totalCompWorkdayCount}</strong></div><div><span>Time Balance</span><strong>${stats.timeBalanceMinutes>=0?"+":"−"}${esc(formatDuration(Math.abs(stats.timeBalanceMinutes)))}</strong></div></div></section><section class="v6-report-section"><h3>${esc(tr("reportProjects"))}</h3><div class="v6-report-kpis"><div><span>${esc(tr("totalProjects"))}</span><strong>${projects.length}</strong></div><div><span>${esc(tr("completedProjectsLabel"))}</span><strong>${completed}</strong></div><div><span>${esc(tr("totalJournals"))}</span><strong>${Object.keys(journals).length}</strong></div><div><span>${esc(tr("journalCoverage"))}</span><strong>${coverage.percent.toFixed(0)}%</strong></div></div><div class="v6-table-wrap"><table class="v6-report-table"><thead><tr><th>Project</th><th>Category</th><th>Status</th><th>Progress</th></tr></thead><tbody>${projectRows}</tbody></table></div></section><section class="v6-report-section"><h3>${esc(tr("reportMonthly"))}</h3><div class="v6-table-wrap"><table class="v6-report-table"><thead><tr><th>Month</th><th>${esc(tr("actualHours"))}</th><th>${esc(tr("leaveTime"))}</th><th>${esc(tr("holidays"))}</th><th>${esc(tr("compensatory"))}</th></tr></thead><tbody>${monthRows}</tbody></table></div></section><section class="v6-report-section"><h3>${esc(tr("reportJournal"))}</h3><div class="v6-report-notes">${journalPreview}</div></section><footer class="v6-report-footer">${esc(tr("reportGenerated"))}: ${esc(new Date().toLocaleString(lang()==="th"?"th-TH":"en-GB"))}</footer></div><div class="v6-modal-actions"><button id="v6FinalPrint" class="primary-btn" type="button">🖨 ${esc(tr("printSavePdf"))}</button></div>`;
  }
  function openFinalReport() { openModal("final",tr("finalReportTitle"),finalReportHtml()); $("v6FinalPrint")?.addEventListener("click",()=>printHtml(tr("reportName"),$("v6FinalPrintable").innerHTML)); }

  function printHtml(title, html) {
    const win=window.open("","_blank"); if(!win)return;
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>body{font-family:Arial,'Noto Sans Thai',sans-serif;color:#172033;padding:32px;line-height:1.45}h1,h2,h3{margin:0 0 12px}.eyebrow{font-size:12px;font-weight:700;letter-spacing:.12em;color:#356ae6}.v6-final-header,.v6-report-hero{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #e7ecf4;padding-bottom:20px}.v6-report-section{margin:26px 0}.v6-report-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.v6-report-kpis>div{border:1px solid #dfe6f0;border-radius:12px;padding:12px}.v6-report-kpis span,.v6-report-kpis small{display:block;color:#65748b;font-size:12px}.v6-report-kpis strong{font-size:20px}.v6-report-table{width:100%;border-collapse:collapse}.v6-report-table th,.v6-report-table td{padding:9px;border-bottom:1px solid #e5e9f0;text-align:left}.v6-report-note{border-left:3px solid #356ae6;padding:8px 12px;margin:10px 0}.v6-report-note p{margin:4px 0}.v6-report-note small{color:#65748b}.v6-chip-list span{display:inline-block;padding:5px 9px;border-radius:999px;background:#edf3ff;margin:3px}.v6-report-badge{padding:8px 12px;border-radius:999px;background:#edf3ff;color:#356ae6;font-weight:700;height:max-content}.v6-report-footer{color:#65748b;font-size:12px;border-top:1px solid #e5e9f0;padding-top:12px}@media print{body{padding:0}}</style></head><body>${html}</body></html>`); win.document.close(); setTimeout(()=>{win.focus();win.print();},300);
  }

  function renderHub() {
    if(!$("v6WorkHub"))return;
    updateVersionLabels();
    $("v6HubEyebrow").textContent=tr("hubEyebrow"); $("v6HubTitle").textContent=tr("hubTitle"); $("v6HubHelp").textContent=tr("hubHelp"); $("v6CustomizeQuick").querySelector("span").textContent=tr("customize");
    const todayKey=keyFromDate(now()), entry=journals[todayKey]; $("v6JournalLabel").textContent=tr("dailyJournal"); $("v6JournalStatus").textContent=privacyMode()==="demo"?tr("privacyHidden"):(entry?tr("journalSaved"):tr("journalEmpty")); $("v6JournalProjectHint").textContent=entry?journalProjectNames(entry).join(" · ")||tr("privateJournal"):tr("journalProjectLink"); $("v6JournalOpen").textContent=tr("openJournal");
    const active=projects.filter(p=>p.status==="active").length, completed=projects.filter(p=>p.status==="completed").length, avg=projects.length?projects.reduce((s,p)=>s+(Number(p.progress)||0),0)/projects.length:0; $("v6ProjectLabel").textContent=tr("projectTracker"); $("v6ProjectStatus").textContent=`${active} ${tr("activeProjects")} · ${completed} ${tr("completedProjects")}`; $("v6ProjectHint").textContent=projects.length?tr("projectProgressAvg",{percent:avg.toFixed(0)}):tr("projectNone"); $("v6ProjectOpen").textContent=tr("manageProjects");
    const ym=clampMonthKey(todayKey.slice(0,7)), mm=monthMetrics(ym); $("v6MonthLabel").textContent=tr("monthlyReport"); $("v6MonthStatus").textContent=formatMonth(mm.start); $("v6MonthHint").textContent=tr("monthSummary",{hours:formatDuration(mm.actual),entries:mm.entries.length}); $("v6MonthOpen").textContent=tr("openReport");
    const bs=backupStatus(); $("v6BackupLabel").textContent=tr("backupHealth"); $("v6BackupStatus").textContent=bs.due?tr("backupDue"):tr("backupGood"); $("v6BackupHint").textContent=bs.text; $("v6BackupNow").textContent=tr("backupNow"); $("v6BackupHubCard").classList.toggle("backup-due",bs.due);
    $("v6CalendarPresets").querySelector("span").textContent=tr("calendarPresetsShort"); $("v6FinalReport").querySelector("span").textContent=tr("finalReport");
    $("v6CalendarPresetNav")?.querySelector("span") && ($("v6CalendarPresetNav").querySelector("span").textContent=tr("calendarPresetsShort"));
    $("v6JourneyReportBtn")?.querySelector("span") && ($("v6JourneyReportBtn").querySelector("span").textContent=tr("finalReport"));
    $("v6CompletionReportBtn")?.querySelector("span") && ($("v6CompletionReportBtn").querySelector("span").textContent=tr("finalReport"));
    renderSettingsV6(); renderRecap();
  }

  function renderSettingsV6() {
    if(!$("v6SettingsTools"))return;
    $("v6SettingsToolsTitle").textContent=tr("dashboardTools"); $("v6SettingsCustomize").querySelector("span").textContent=tr("customizeDashboard"); $("v6SettingsCalendar").querySelector("span").textContent=tr("calendarPresetSettings"); $("v6SettingsReport").querySelector("span").textContent=tr("finalReportSettings"); $("v6BackupReminderLabel").textContent=tr("backupReminder"); $("v6BackupReminderHelp").textContent=tr("backupReminderHelp");
    const sel=$("v6BackupReminderSelect"), days=backupReminderDays(); sel.options[0].textContent=tr("reminderOff"); [7,14,30].forEach((d,i)=>sel.options[i+1].textContent=tr("everyDays",{days:d})); sel.value=String(days);
  }

  function maybeBackupToast() {
    if(!setupCompleted())return; const bs=backupStatus(); if(!bs.due||sessionStorage.getItem("wp-v6-backup-toast"))return; sessionStorage.setItem("wp-v6-backup-toast","1"); setTimeout(()=>toast("💾",tr("backupToast"),"warning"),1200);
  }

  function bindUI() {
    $("v6ModalClose")?.addEventListener("click",closeModal); $("v6ModalBackdrop")?.addEventListener("click",e=>{if(e.target===$("v6ModalBackdrop"))closeModal();});
    $("v6JournalOpen")?.addEventListener("click",()=>openJournal()); $("v6ProjectOpen")?.addEventListener("click",()=>openProjects()); $("v6MonthOpen")?.addEventListener("click",()=>openMonthlyReport()); $("v6BackupNow")?.addEventListener("click",doBackup); $("v6CalendarPresets")?.addEventListener("click",openCalendarPresets); $("v6FinalReport")?.addEventListener("click",openFinalReport); $("v6CustomizeQuick")?.addEventListener("click",openCustomize);
    $("v6CalendarPresetNav")?.addEventListener("click",openCalendarPresets); $("v6JourneyReportBtn")?.addEventListener("click",openFinalReport); $("v6CompletionReportBtn")?.addEventListener("click",openFinalReport);
    $("v6SettingsCustomize")?.addEventListener("click",openCustomize); $("v6SettingsCalendar")?.addEventListener("click",openCalendarPresets); $("v6SettingsReport")?.addEventListener("click",openFinalReport);
    $("v6BackupReminderSelect")?.addEventListener("change",e=>{localStorage.setItem(KEYS.backupDays,String(Number(e.target.value)||0));renderHub();});
    $("v6CalendarFileInput")?.addEventListener("change",e=>{const file=e.target.files?.[0];if(file)importCalendarFile(file);});
    $("v6RecapJournalBtn")?.addEventListener("click",()=>openJournal()); $("v6RecapDismissBtn")?.addEventListener("click",()=>{const key=keyFromDate(now());recapDismissed[key]=true;write(KEYS.recapDismissed,recapDismissed);renderRecap();});
    $("exportBackupBtn")?.addEventListener("click",markBackupNow,true);
    document.querySelectorAll(".lang-btn").forEach(btn=>btn.addEventListener("click",()=>setTimeout(()=>{renderHub();if(modalType){closeModal();}},40)));
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&modalType)closeModal();});
    window.addEventListener("workday:journey-cleared",()=>{ journals={}; projects=[]; recapDismissed={}; saveJournals(); saveProjects(); write(KEYS.recapDismissed,recapDismissed); renderHub(); });
    window.addEventListener("workday:v7-data-changed",()=>{
      const nextJournals=read(KEYS.journal,{}), nextProjects=read(KEYS.projects,[]);
      journals=nextJournals && typeof nextJournals==="object" && !Array.isArray(nextJournals) ? nextJournals : {};
      projects=Array.isArray(nextProjects) ? nextProjects : [];
      renderHub();
    });
  }

  function updateVersionLabels() {
    const footer=$("footerVersion"); if(footer)footer.textContent=`v${V6_VERSION}`;
    const footText=document.querySelector('.footer [data-i18n="footerText"]'); if(footText)footText.textContent=lang()==="th"?"Workday Journey V7.2 · Toast & Journal Date Update · ข้อมูลเก็บใน Browser":"Workday Journey V7.2 · Toast & Journal Date Update · Local browser data";
    const eyebrow=document.querySelector(".setup-brand .eyebrow"); if(eyebrow)eyebrow.textContent="WORKDAY JOURNEY · V7";
  }

  function init() {
    injectUI(); updateVersionLabels(); applyLayout(); bindUI(); renderHub(); maybeBackupToast();
    setInterval(()=>{renderHub();},60000);
  }

  init();
})();
