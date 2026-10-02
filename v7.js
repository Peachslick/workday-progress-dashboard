(() => {
  "use strict";

  const API = window.WorkdayJourneyAPI;
  if (!API) return;

  const VERSION = "8.3.0";
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
    sidebarCollapsed: "wp-v7-sidebar-collapsed",
    selectedTitle: "wp-v7-selected-title",
    journalFilters: "wp-v76-journal-filters",
    projectView: "wp-v76-project-view",
    avatarMode: "wp-profile-avatar-mode",
    avatarPhoto: "wp-profile-avatar-image"
  };

  const TEXT = {
    th: {
      dashboard:"แดชบอร์ด", journal:"บันทึกประจำวัน", projects:"โปรเจกต์", achievements:"ความสำเร็จ", reports:"รายงานและการวิเคราะห์", calendar:"ปฏิทินและการเข้างาน", missions:"ภารกิจรายวัน", bank:"Work Bank", rewards:"รางวัล", settings:"ตั้งค่า",
      dashboardSub:"ภาพรวมวันนี้และ Journey", journalSub:"บันทึกสิ่งที่ทำและสิ่งที่เรียนรู้", projectsSub:"ติดตามงานและความคืบหน้าของ Project", achievementsSub:"Milestones, Trophy Room และ Journey Story", reportsSub:"Attendance, Heatmap และรายงานสรุป", calendarSub:"วันลา วันหยุดบริษัท และวันทำงานชดเชย", missionsSub:"ภารกิจสุ่มใหม่ทุกวัน พร้อม Daily / Weekly Chest", bankSub:"ฝาก Work Coins รับดอกเบี้ยรายวัน และถอนกลับ Wallet", rewardsSub:"Mascot, Theme, Effect และ Work Coins", settingsSub:"โปรไฟล์ รูปแบบการแสดงผล และข้อมูล", fontPreview:"ตัวอย่างแบบอักษร", fontPreviewText:"ภาษาไทย · Workday Journey · ABC 123", fontPreviewHelp:"แบบอักษรที่เลือกจะใช้กับทั้งแอป",
      privateLocal:"Private · Local data", menu:"เมนู", quickActions:"ทางลัด", addJournal:"เพิ่ม Journal วันนี้", manageProjects:"จัดการ Projects", openReports:"ดู Reports", openCalendar:"เปิด Calendar",
      journalTitle:"Daily Work Journal", journalHelp:"บันทึกว่าวันนี้ทำอะไร เรียนรู้อะไร และ Project ที่เกี่ยวข้อง", journalDate:"วันที่", workDone:"วันนี้ทำอะไร", learned:"สิ่งที่ได้เรียนรู้", mood:"ความรู้สึกวันนี้", relatedProjects:"Project ที่เกี่ยวข้อง", saveJournal:"บันทึก Journal", deleteJournal:"ลบบันทึก", recentEntries:"บันทึกล่าสุด", noEntries:"ยังไม่มีบันทึก", demoLocked:"Journal ถูกซ่อนใน Public Demo Mode", journalSaved:"บันทึก Journal แล้ว", journalDeleted:"ลบบันทึกแล้ว", journalDateInvalid:"กรุณาใส่วันที่ให้ถูกต้องในรูปแบบ DD/MM/YYYY", journalCalendar:"สถานะการบันทึกประจำวัน", journalCalendarHelp:"✓ = บันทึกแล้ว · ช่องว่างสีอ่อน = วันทำงานที่ยังไม่ได้บันทึก", pendingJournals:"ค้าง {n} วัน", journalAllCaughtUp:"บันทึกครบแล้ว", previousMonth:"เดือนก่อนหน้า", nextMonth:"เดือนถัดไป", summaryLive:"อัปเดตจากข้อมูลล่าสุดของคุณ",
      projectsTitle:"Project Tracker", projectsHelp:"ติดตาม Project, Status และ Progress พร้อมเชื่อมกับ Daily Journal", projectName:"ชื่อ Project", category:"หมวดหมู่", progress:"Progress (%)", status:"สถานะ", description:"รายละเอียด", active:"กำลังทำ", paused:"พักไว้", completed:"เสร็จแล้ว", saveProject:"บันทึก Project", newProject:"Project ใหม่", noProjects:"ยังไม่มี Project", journalDays:"วันที่มี Journal", projectSaved:"บันทึก Project แล้ว", projectDeleted:"ลบ Project แล้ว", projectList:"รายการ Project",
      achievementsTitle:"Achievement Center", achievementsHelp:"รวม Badge, Milestone และเรื่องราวสำคัญของ Journey", unlocked:"ปลดล็อกแล้ว", locked:"ยังไม่ปลดล็อก", achievementProgress:"ปลดล็อก {n}/{total} Achievement",
      reportsTitle:"Reports & Analytics", reportsHelp:"ดูภาพรวม Attendance, Monthly Statistics, Heatmap และ Final Journey Report", monthlyReport:"Monthly Report", detailedStats:"Detailed Statistics", finalReport:"Final Journey Report", snapshot:"Journey Snapshot", month:"เดือน", planned:"ตามแผน", actual:"ทำงานจริง", leave:"ลา", holidays:"วันหยุด", comp:"ชดเชย", journals:"Journal", projectsMentioned:"Projects",
      calendarTitle:"Calendar & Attendance", calendarHelp:"จัดการวันลา วันหยุดบริษัท วันทำงานชดเชย และ Calendar Preset", presetImport:"Preset / Import", companyHoliday:"วันหยุดบริษัท", personalLeave:"วันลา", compWork:"วันทำงานชดเชย", specialDates:"วันพิเศษ",
      settingsTitle:"ตั้งค่า", settingsHelp:"ปรับโปรไฟล์ ธีม แบบอักษร ภาษา การสำรองข้อมูล และการแสดงผล", profileJourney:"โปรไฟล์และข้อมูลการเดินทาง", editJourney:"แก้ไขข้อมูลการเดินทาง", appearance:"การแสดงผล", theme:"ธีม", font:"แบบอักษร", fontSize:"ขนาดตัวอักษร", density:"ความหนาแน่นของหน้าจอ", timezone:"เขตเวลา", locale:"รูปแบบวันที่", behavior:"การทำงาน", seconds:"แสดงวินาที", animation:"แอนิเมชัน", moodSetting:"บรรยากาศตามเวลา", notifications:"การแจ้งเตือน", dataBackup:"ข้อมูลและการสำรอง", exportBackup:"ส่งออกข้อมูลสำรอง", importBackup:"นำเข้าข้อมูลสำรอง", newJourney:"เริ่มการเดินทางใหม่", resetData:"ล้างข้อมูลทั้งหมด", dashboardLayout:"จัดรูปแบบแดชบอร์ด", openFullSettings:"เปิดการตั้งค่าขั้นสูง", light:"สว่าง", dark:"มืด", system:"ตามระบบ", compact:"กะทัดรัด", comfortable:"สบายตา", small:"เล็ก", medium:"กลาง", large:"ใหญ่", profileSection:"โปรไฟล์", displaySection:"การแสดงผล", regionSection:"ภูมิภาคและเวลา", behaviorSection:"การทำงาน", dataSection:"ข้อมูล", publicDemo:"โหมดสาธารณะ", myJourney:"การเดินทางของฉัน", collapseSidebar:"ซ่อน Sidebar", expandSidebar:"แสดง Sidebar",
      backupStatus:"Backup ล่าสุด", never:"ยังไม่เคย Backup", today:"วันนี้", daysAgo:"{n} วันที่แล้ว", appVersion:"Workday Journey V8.3 · Work Bank & Economy", perfectMonthAchievedMonth:"เดือนที่ทำสำเร็จ", perfectMonthJourneyPeriod:"ช่วง Journey ที่ตรวจ", localPrivacy:"Local เป็นค่าเริ่มต้น · Login เพื่อ Sync ข้ามอุปกรณ์",
      overview:"ภาพรวม", workTime:"เวลาสะสม", attendance:"Attendance", achievementsCount:"Achievements", workdaysLeft:"วันทำงานที่เหลือ", goTo:"เปิดหน้า",
      challenges:"Challenges", challengeCenter:"Challenge Center", challengeHelp:"ทำ Challenge จากเวลา Project Journal และ Attendance เพื่อปลดล็อก Badge และฉายา", allTiers:"ทุกระดับ", common:"Common", rare:"Rare", epic:"Epic", legendary:"Legendary", inProgress:"กำลังทำ", challengeComplete:"สำเร็จ", rewardTitle:"รางวัลฉายา", noTitle:"ไม่ใช้ฉายา", titleSystem:"ฉายาและเกียรติยศ", titleHelp:"เลือกฉายาที่ปลดล็อกจาก Achievement เพื่อแสดงบน Profile", selectedTitle:"ฉายาที่ใช้", titleUnlockedCount:"ปลดล็อกฉายา {n}/{total}", lockedTitle:"ยังไม่ปลดล็อก", titleSaved:"เปลี่ยนฉายาแล้ว", categoryJourney:"Journey", categoryTime:"เวลา", categoryProjects:"Project", categoryJournal:"Journal", categoryAttendance:"Attendance", categoryExploration:"Explorer", tierMastery:"รางวัลพิชิตระดับ", masteryComplete:"พิชิตระดับสำเร็จ", masteryLocked:"ทำ Challenge ระดับนี้ให้ครบเพื่อปลดล็อกรางวัล", masteryReward:"รางวัล Mastery", masteryTitle:"ฉายาพิเศษ", masteryEffect:"เอฟเฟกต์โปรไฟล์", tierMasteries:"UX & Quality", masteryProgress:"พิชิตแล้ว {n}/4 ระดับ",
      journalSearch:"ค้นหาบันทึก", journalFilterProject:"ทุก Project", journalFilterMood:"ทุก Mood", journalFilterMonth:"ทุกเดือน", clearFilters:"ล้างตัวกรอง", entriesFound:"พบ {n} บันทึก", projectActiveTab:"กำลังใช้งาน", projectCompletedTab:"เสร็จแล้ว", projectArchivedTab:"เก็บถาวร", archiveProject:"เก็บถาวร", restoreProject:"นำกลับมา", projectArchived:"เก็บ Project แล้ว", projectRestored:"นำ Project กลับมาแล้ว", confirmTitle:"ยืนยันการทำรายการ", confirmDeleteJournal:"ต้องการลบบันทึกประจำวันนี้หรือไม่?", confirmDeleteProject:"ต้องการลบ Project นี้หรือไม่? Journal ที่เชื่อมอยู่จะถูกถอด Project ออก", cancel:"ยกเลิก", confirm:"ยืนยัน", undo:"ย้อนกลับ", undone:"ย้อนกลับรายการแล้ว", achievementDetail:"รายละเอียด Achievement", condition:"เงื่อนไข", progressNow:"ความคืบหน้า", unlockedDate:"วันที่ปลดล็อก", stillLocked:"ยังไม่ปลดล็อก", close:"ปิด", titlePreview:"ตัวอย่างฉายา", applyTitle:"ใช้ฉายานี้", titlePreviewHelp:"เลือกฉายาเพื่อดูก่อน แล้วกดใช้ฉายานี้", achievementNear:"Achievement ใกล้สำเร็จ", activeProjects:"Project ที่กำลังทำ", journalStreak:"Journal ต่อเนื่อง", backupHealth:"สถานะ Backup", days:"วัน", dashboardInsights:"สรุปด่วน", archived:"เก็บถาวร", updateReady:"มีเวอร์ชันใหม่พร้อมใช้งาน", refreshNow:"อัปเดตตอนนี้", calendarUpdated:"อัปเดตปฏิทินแล้ว", projectArchiveConfirm:"เก็บ Project นี้ไว้ใน Archive?", delete:"ลบ", schemaVersion:"เวอร์ชันข้อมูล", confirmResetData:"ต้องการล้างข้อมูล Workday Journey ทั้งหมดใน Browser นี้หรือไม่? การทำรายการนี้ไม่สามารถย้อนกลับได้",      deleteConfirm:"ยืนยันการลบรายการนี้?", projectNameRequired:"กรุณาใส่ชื่อ Project", noData:"ยังไม่มีข้อมูล", todayLabel:"วันนี้", mascotTitle:"Progress Mascot", mascotName:"Default Chick", mascotBefore:"ยังไม่ถึงเวลาเริ่มงาน พักอีกนิดนะ 💤", mascotStart:"เพิ่งเริ่มเอง ค่อย ๆ ลุยไปด้วยกัน!", mascotWork:"กำลังไปได้สวย ลุยกันต่อ!", mascotHalf:"ผ่านครึ่งทางแล้ว! เก่งมาก ☕", mascotAlmost:"อีกนิดเดียววว เตรียมตัวฉลอง!", mascotBreak:"พักก่อนนะ เดี๋ยวค่อยกลับมาลุยต่อ ☕", mascotDone:"วันนี้สำเร็จแล้ว กลับบ้านได้! 🎉", mascotRest:"วันนี้เป็นวันพัก เติมพลังให้เต็มที่ 🌿", mascotHoliday:"วันหยุดบริษัท วันนี้พักให้เต็มที่ 🏡", mascotLeave:"วันนี้เป็นวันลา พักผ่อนให้เต็มที่ 🌿", mascotJourneyDone:"Journey สำเร็จแล้ว! ลูกเจี๊ยบภูมิใจมาก 🏆", mascotProgress:"ความคืบหน้าวันนี้", avatarTitle:"รูปโปรไฟล์", avatarHelp:"เลือกใช้ Mascot หรือรูปของคุณเองใน Profile", avatarMascot:"ใช้ Mascot", avatarPhoto:"ใช้รูปของฉัน", avatarUpload:"อัปโหลดรูป", avatarChange:"เปลี่ยนรูป", avatarRemove:"ลบรูป", avatarStoredLocal:"รูปจะถูกย่อขนาดและเก็บไว้ใน Browser นี้ รวมอยู่ในไฟล์ Backup ด้วย", avatarUploaded:"อัปโหลดรูปโปรไฟล์แล้ว", avatarRemoved:"ลบรูปโปรไฟล์แล้ว", avatarInvalid:"กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง", avatarTooLarge:"ไฟล์รูปใหญ่เกินไป กรุณาเลือกไฟล์ไม่เกิน 12 MB", avatarRemoveConfirm:"ต้องการลบรูปโปรไฟล์ที่อัปโหลดไว้หรือไม่?", avatarMascotDemo:"Public Demo Mode จะแสดง Mascot แทนรูปส่วนตัว"
    },
    en: {
      dashboard:"Dashboard", journal:"Daily Journal", projects:"Projects", achievements:"Achievements", reports:"Reports & Analytics", calendar:"Calendar & Attendance", missions:"Daily Missions", bank:"Work Bank", rewards:"Rewards", settings:"Settings",
      dashboardSub:"Today and journey overview", journalSub:"Record your work and learning", projectsSub:"Track project status and progress", achievementsSub:"Milestones, Trophy Room and Journey Story", reportsSub:"Attendance, heatmap and journey reports", calendarSub:"Leave, company holidays and compensatory days", missionsSub:"Fresh daily missions with Daily / Weekly Chests", bankSub:"Save Work Coins, earn daily interest, and withdraw to Wallet", rewardsSub:"Mascots, themes, effects and Work Coins", settingsSub:"Profile, appearance and data tools", fontPreview:"Font Preview", fontPreviewText:"ภาษาไทย · Workday Journey · ABC 123", fontPreviewHelp:"The selected font is applied across the app",
      privateLocal:"Private · Local data", menu:"Menu", quickActions:"Quick Actions", addJournal:"Add Today's Journal", manageProjects:"Manage Projects", openReports:"View Reports", openCalendar:"Open Calendar",
      journalTitle:"Daily Work Journal", journalHelp:"Record what you worked on, what you learned, and the related projects", journalDate:"Date", workDone:"What did you work on?", learned:"What did you learn?", mood:"Today's mood", relatedProjects:"Related Projects", saveJournal:"Save Journal", deleteJournal:"Delete Entry", recentEntries:"Recent Entries", noEntries:"No entries yet", demoLocked:"Journal is hidden in Public Demo Mode", journalSaved:"Journal saved", journalDeleted:"Journal deleted", journalDateInvalid:"Enter a valid date in DD/MM/YYYY format", journalCalendar:"Journal Calendar", journalCalendarHelp:"✓ = saved · softly highlighted blank = working day still missing a journal", pendingJournals:"{n} days pending", journalAllCaughtUp:"All caught up", previousMonth:"Previous month", nextMonth:"Next month", summaryLive:"Updated from your latest data",
      projectsTitle:"Project Tracker", projectsHelp:"Track project status and progress and connect it with Daily Journal", projectName:"Project Name", category:"Category", progress:"Progress (%)", status:"Status", description:"Description", active:"Active", paused:"Paused", completed:"Completed", saveProject:"Save Project", newProject:"New Project", noProjects:"No projects yet", journalDays:"Journal Days", projectSaved:"Project saved", projectDeleted:"Project deleted", projectList:"Project List",
      achievementsTitle:"Achievement Center", achievementsHelp:"Badges, milestones and memorable moments from your journey", unlocked:"Unlocked", locked:"Locked", achievementProgress:"{n}/{total} achievements unlocked",
      reportsTitle:"Reports & Analytics", reportsHelp:"Review attendance, monthly statistics, heatmap and the final journey report", monthlyReport:"Monthly Report", detailedStats:"Detailed Statistics", finalReport:"Final Journey Report", snapshot:"Journey Snapshot", month:"Month", planned:"Planned", actual:"Actual", leave:"Leave", holidays:"Holidays", comp:"Comp", journals:"Journals", projectsMentioned:"Projects",
      calendarTitle:"Calendar & Attendance", calendarHelp:"Manage leave, company holidays, compensatory workdays and calendar presets", presetImport:"Preset / Import", companyHoliday:"Company Holidays", personalLeave:"Personal Leave", compWork:"Compensatory Workdays", specialDates:"Special Dates",
      settingsTitle:"Settings", settingsHelp:"Manage profile, theme, font, language, backups and display preferences", profileJourney:"Profile & Journey", editJourney:"Edit Journey", appearance:"Appearance", theme:"Theme", font:"Font", fontSize:"Font Size", density:"Layout Density", timezone:"Timezone", locale:"Date Format", behavior:"Behavior", seconds:"Show Seconds", animation:"Animation", moodSetting:"Dynamic Mood", notifications:"Notifications", dataBackup:"Data & Backup", exportBackup:"Export Backup", importBackup:"Import Backup", newJourney:"Start New Journey", resetData:"Reset All Data", dashboardLayout:"Dashboard Layout", openFullSettings:"Open Advanced Settings", light:"Light", dark:"Dark", system:"System", compact:"Compact", comfortable:"Comfortable", small:"Small", medium:"Medium", large:"Large", profileSection:"PROFILE", displaySection:"DISPLAY", regionSection:"REGION", behaviorSection:"BEHAVIOR", dataSection:"DATA", publicDemo:"Public Demo", myJourney:"My Journey", collapseSidebar:"Hide sidebar", expandSidebar:"Show sidebar",
      backupStatus:"Last Backup", never:"Never", today:"Today", daysAgo:"{n} days ago", appVersion:"Workday Journey V8.3 · Work Bank & Economy", perfectMonthAchievedMonth:"Perfect month", perfectMonthJourneyPeriod:"Journey period checked", localPrivacy:"Local by default · Sign in to sync across devices",
      overview:"Overview", workTime:"Work Time", attendance:"Attendance", achievementsCount:"Achievements", workdaysLeft:"Workdays Left", goTo:"Open",
      challenges:"Challenges", challengeCenter:"Challenge Center", challengeHelp:"Complete challenges across time, projects, journals and attendance to unlock badges and titles", allTiers:"All Tiers", common:"Common", rare:"Rare", epic:"Epic", legendary:"Legendary", inProgress:"In Progress", challengeComplete:"Complete", rewardTitle:"Title Reward", noTitle:"No title", titleSystem:"Titles & Honors", titleHelp:"Choose an unlocked achievement title to display on your profile", selectedTitle:"Selected Title", titleUnlockedCount:"{n}/{total} titles unlocked", lockedTitle:"Locked", titleSaved:"Title updated", categoryJourney:"Journey", categoryTime:"Time", categoryProjects:"Projects", categoryJournal:"Journal", categoryAttendance:"Attendance", categoryExploration:"Explorer", tierMastery:"UX & Quality Reward", masteryComplete:"Tier mastered", masteryLocked:"Complete every challenge in this tier to unlock the reward", masteryReward:"Mastery Reward", masteryTitle:"Exclusive Title", masteryEffect:"Profile Effect", tierMasteries:"UX & Quality", masteryProgress:"{n}/4 tiers mastered",
      journalSearch:"Search journal", journalFilterProject:"All Projects", journalFilterMood:"All Moods", journalFilterMonth:"All Months", clearFilters:"Clear filters", entriesFound:"{n} entries found", projectActiveTab:"Active", projectCompletedTab:"Completed", projectArchivedTab:"Archived", archiveProject:"Archive", restoreProject:"Restore", projectArchived:"Project archived", projectRestored:"Project restored", confirmTitle:"Confirm action", confirmDeleteJournal:"Delete this journal entry?", confirmDeleteProject:"Delete this project? Linked journal entries will keep their notes but lose this project link.", cancel:"Cancel", confirm:"Confirm", undo:"Undo", undone:"Action undone", achievementDetail:"Achievement Details", condition:"Condition", progressNow:"Progress", unlockedDate:"Unlocked", stillLocked:"Still locked", close:"Close", titlePreview:"Title Preview", applyTitle:"Use This Title", titlePreviewHelp:"Choose a title to preview it, then apply when ready", achievementNear:"Achievements close", activeProjects:"Active projects", journalStreak:"Journal streak", backupHealth:"Backup health", days:"days", dashboardInsights:"Quick Summary", archived:"Archived", updateReady:"A new version is ready", refreshNow:"Update now", calendarUpdated:"Calendar updated", projectArchiveConfirm:"Archive this project?", delete:"Delete", schemaVersion:"Data schema", confirmResetData:"Reset all Workday Journey data stored in this browser? This action cannot be undone.",      deleteConfirm:"Delete this item?", projectNameRequired:"Enter a project name", noData:"No data yet", todayLabel:"Today", mascotTitle:"Progress Mascot", mascotName:"Default Chick", mascotBefore:"Work has not started yet. A little more rest 💤", mascotStart:"Just getting started. Let’s ease into the day!", mascotWork:"Looking good — keep going!", mascotHalf:"Halfway there! Nice work ☕", mascotAlmost:"Almost there — celebration is close!", mascotBreak:"Take a break. We’ll get back to it soon ☕", mascotDone:"100% — today is complete! 🎉", mascotRest:"Rest day today. Recharge your energy 🌿", mascotHoliday:"Company holiday — enjoy the day off 🏡", mascotLeave:"Leave day today. Get some good rest 🌿", mascotJourneyDone:"Journey complete! Your chick is proud 🏆", mascotProgress:"Today’s progress", avatarTitle:"Profile Picture", avatarHelp:"Choose the current Mascot or your own uploaded photo for your profile", avatarMascot:"Use Mascot", avatarPhoto:"Use My Photo", avatarUpload:"Upload Photo", avatarChange:"Change Photo", avatarRemove:"Remove Photo", avatarStoredLocal:"Your photo is resized and stored in this browser and is included in exported backups", avatarUploaded:"Profile photo uploaded", avatarRemoved:"Profile photo removed", avatarInvalid:"Please choose a valid image file", avatarTooLarge:"This image is too large. Please choose a file under 12 MB", avatarRemoveConfirm:"Remove the uploaded profile photo?", avatarMascotDemo:"Public Demo Mode shows the Mascot instead of your personal photo"
    }
  };
  const t = (key, vars={}) => {
    let out = TEXT[lang()][key] || TEXT.en[key] || key;
    Object.entries(vars).forEach(([k,v]) => out = out.replaceAll(`{${k}}`, String(v)));
    return out;
  };

  const NAV = [
    ["dashboard","🏠"], ["journal","📓"], ["projects","🧩"], ["achievements","🏆"], ["reports","📊"], ["calendar","📅"], ["missions","🎯"], ["bank","🏦"], ["rewards","🎁"], ["settings","⚙"]
  ];


  const TITLE_DEFS = [
    {id:"journey-initiate",achievement:"first-day",tier:"common",th:"ผู้เริ่มต้นแห่งเส้นทาง",en:"Journey Initiate"},
    {id:"project-pioneer",achievement:"first-project",tier:"common",th:"ผู้บุกเบิกโครงการ",en:"Project Pioneer"},
    {id:"daily-scribe",achievement:"first-journal",tier:"common",th:"ผู้จารึกวันวาน",en:"Daily Scribe"},
    {id:"steady-voyager",achievement:"streak-10",tier:"rare",th:"นักเดินทางผู้มั่นคง",en:"Steady Voyager"},
    {id:"project-conqueror",achievement:"project-finisher",tier:"rare",th:"ผู้พิชิตโครงการ",en:"Project Conqueror"},
    {id:"chronicle-keeper",achievement:"journals-7",tier:"rare",th:"ผู้รักษาบันทึก",en:"Chronicle Keeper"},
    {id:"five-hundred-guardian",achievement:"500-hours",tier:"epic",th:"ผู้พิทักษ์ห้าร้อยชั่วโมง",en:"Guardian of Five Hundred"},
    {id:"three-quarter-conqueror",achievement:"75-percent",tier:"epic",th:"ผู้พิชิตสามในสี่เส้นทาง",en:"Three-Quarter Conqueror"},
    {id:"unbroken-vanguard",achievement:"streak-20",tier:"epic",th:"แนวหน้าไร้รอยร้าว",en:"Unbroken Vanguard"},
    {id:"achievement-architect",achievement:"projects-complete-3",tier:"epic",th:"สถาปนิกแห่งความสำเร็จ",en:"Architect of Achievement"},
    {id:"chronicle-warden",achievement:"journals-30",tier:"epic",th:"ผู้พิทักษ์พงศาวดาร",en:"Warden of Chronicles"},
    {id:"eight-hundred-master",achievement:"800-hours",tier:"epic",th:"จ้าวแห่งแปดร้อยชั่วโมง",en:"Master of Eight Hundred"},
    {id:"discipline-guardian",achievement:"perfect-month",tier:"epic",th:"ผู้พิทักษ์วินัย",en:"Guardian of Discipline"},
    {id:"nine-hundred-sovereign",achievement:"900-hours",tier:"legendary",th:"จักรพรรดิแห่งเก้าร้อยชั่วโมง",en:"Sovereign of Nine Hundred"},
    {id:"final-gate-sovereign",achievement:"90-percent",tier:"legendary",th:"ผู้ครองประตูสุดท้าย",en:"Sovereign of the Final Gate"},
    {id:"grand-chronicler",achievement:"journals-60",tier:"legendary",th:"มหาปราชญ์แห่งพงศาวดาร",en:"Grand Chronicler"},
    {id:"thousand-hour-monarch",achievement:"1000-hours",tier:"legendary",th:"ราชันแห่งพันชั่วโมง",en:"Thousand-Hour Monarch"},
    {id:"eternal-vanguard",achievement:"streak-30",tier:"legendary",th:"ผู้ยืนหยัดนิรันดร์",en:"Eternal Vanguard"},
    {id:"journey-legend",achievement:"completed",tier:"legendary",th:"ตำนานแห่งการเดินทาง",en:"Legend of the Journey"}
  ];
  const TIER_MASTERY_DEFS = [
    {id:"mastery-common",masteryTier:"common",tier:"common",th:"ผู้เบิกทางแห่งรุ่งอรุณ",en:"Dawn Pathfinder",effectTh:"ประกายคราม · Azure Pulse",effectEn:"Azure Pulse"},
    {id:"mastery-rare",masteryTier:"rare",tier:"rare",th:"อัศวินแห่งดารา",en:"Astral Knight",effectTh:"รัศมีม่วง · Violet Halo",effectEn:"Violet Halo"},
    {id:"mastery-epic",masteryTier:"epic",tier:"epic",th:"จอมทัพแห่งความเพียร",en:"Vanguard of Resolve",effectTh:"ออโรราเพลิง · Aurora Flame",effectEn:"Aurora Flame"},
    {id:"mastery-legendary",masteryTier:"legendary",tier:"legendary",th:"จักรพรรดิแห่งนิรันดร์",en:"Eternal Sovereign",effectTh:"รัศมีราชันสีทอง · Sovereign Aura",effectEn:"Golden Sovereign Aura"}
  ];
  const ALL_TITLE_DEFS = [...TITLE_DEFS, ...TIER_MASTERY_DEFS];
  const titleName = item => item ? item[lang()] : "";
  const masteryEffectName = item => item ? (lang()==="th" ? item.effectTh : item.effectEn) : "";
  function achievementMap() { return new Map(API.getAchievements(API.getStats()).map(a=>[a.id,a])); }
  function tierMasteryStates(achievements=API.getAchievements(API.getStats())) {
    return ["common","rare","epic","legendary"].map(tier=>{
      const items=achievements.filter(a=>(a.tier||"common")===tier);
      const done=items.filter(a=>a.unlocked).length;
      const reward=TIER_MASTERY_DEFS.find(x=>x.masteryTier===tier);
      return {tier,items,done,total:items.length,unlocked:items.length>0&&done===items.length,reward};
    });
  }
  function titleStates() {
    const map=achievementMap();
    const mastery=new Map(tierMasteryStates([...map.values()]).map(x=>[x.tier,x]));
    return ALL_TITLE_DEFS.map(item=>{
      if(item.masteryTier){const st=mastery.get(item.masteryTier);return {...item,unlocked:!!st?.unlocked,achievementData:null,masteryData:st||null};}
      return {...item,unlocked:!!map.get(item.achievement)?.unlocked,achievementData:map.get(item.achievement)||null};
    });
  }
  function selectedTitle() {
    const id=localStorage.getItem(KEYS.selectedTitle)||"";
    return titleStates().find(x=>x.id===id&&x.unlocked)||null;
  }
  function titleRewardForAchievement(id) { return TITLE_DEFS.find(x=>x.achievement===id)||null; }
  function setSelectedTitle(id) {
    const item=titleStates().find(x=>x.id===id&&x.unlocked);
    if(id && !item) return;
    if(id) localStorage.setItem(KEYS.selectedTitle,id); else localStorage.removeItem(KEYS.selectedTitle);
    renderSidebar(); renderSettingsPage(); toast("👑",t("titleSaved"),"success");
  }

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


  let journalFilterState = read(KEYS.journalFilters,{q:"",project:"",mood:"",month:""});
  let projectViewState = localStorage.getItem(KEYS.projectView) || "active";
  let confirmResolver = null;

  function deepClone(value){ try{return JSON.parse(JSON.stringify(value));}catch{return value;} }
  function debounce(fn,wait=180){let timer;return(...args)=>{clearTimeout(timer);timer=setTimeout(()=>fn(...args),wait);};}

  function showUndoToast(message, undoFn, timeout=8000) {
    const stack=$("toastStack"); if(!stack)return;
    const node=document.createElement("div"); node.className="app-toast v7-toast toast-info v76-undo-toast"; node.setAttribute("role","status");
    node.innerHTML=`<span>↶</span><div><strong>${esc(message)}</strong></div><button type="button" class="v76-undo-btn">${esc(t("undo"))}</button>`;
    stack.appendChild(node);
    let active=true;
    const remove=()=>{if(!active)return;active=false;node.classList.add("out");setTimeout(()=>node.remove(),250);};
    node.querySelector("button")?.addEventListener("click",()=>{if(!active)return;try{undoFn?.();}finally{remove();toast("✓",t("undone"),"success");}});
    setTimeout(remove,timeout);
  }

  function ensureQualityUi(){
    if(!$("v76ConfirmBackdrop")){
      const wrap=document.createElement("div"); wrap.id="v76ConfirmBackdrop"; wrap.className="v76-modal-backdrop"; wrap.hidden=true;
      wrap.innerHTML=`<section class="v76-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="v76ConfirmTitle"><div class="v76-confirm-icon">⚠</div><h3 id="v76ConfirmTitle">${esc(t("confirmTitle"))}</h3><p id="v76ConfirmMessage"></p><div class="v76-confirm-actions"><button id="v76ConfirmCancel" class="secondary-btn" type="button">${esc(t("cancel"))}</button><button id="v76ConfirmOk" class="danger-btn" type="button">${esc(t("confirm"))}</button></div></section>`;
      document.body.appendChild(wrap);
      $("v76ConfirmCancel")?.addEventListener("click",()=>resolveConfirm(false));
      $("v76ConfirmOk")?.addEventListener("click",()=>resolveConfirm(true));
      wrap.addEventListener("click",e=>{if(e.target===wrap)resolveConfirm(false);});
    }
    if(!$("v76AchievementBackdrop")){
      const wrap=document.createElement("div");wrap.id="v76AchievementBackdrop";wrap.className="v76-modal-backdrop";wrap.hidden=true;
      wrap.innerHTML=`<section class="v76-ach-modal" role="dialog" aria-modal="true" aria-labelledby="v76AchTitle"><button id="v76AchClose" class="v76-modal-close" type="button" aria-label="${esc(t("close"))}">×</button><div id="v76AchBody"></div></section>`;
      document.body.appendChild(wrap); $("v76AchClose")?.addEventListener("click",closeAchievementDetail); wrap.addEventListener("click",e=>{if(e.target===wrap)closeAchievementDetail();});
    }
  }

  function askConfirm(message, danger=true){
    ensureQualityUi(); const wrap=$("v76ConfirmBackdrop");
    $("v76ConfirmTitle").textContent=t("confirmTitle"); $("v76ConfirmMessage").textContent=message;
    const ok=$("v76ConfirmOk");ok.textContent=t("confirm");ok.className=danger?"danger-btn":"primary-btn";$("v76ConfirmCancel").textContent=t("cancel");
    wrap.hidden=false; requestAnimationFrame(()=>wrap.classList.add("open")); ok.focus();
    return new Promise(resolve=>{confirmResolver=resolve;});
  }
  function resolveConfirm(value){const wrap=$("v76ConfirmBackdrop");if(!wrap)return;wrap.classList.remove("open");setTimeout(()=>wrap.hidden=true,160);const fn=confirmResolver;confirmResolver=null;fn?.(!!value);}

  function closeAchievementDetail(){const el=$("v76AchievementBackdrop");if(!el)return;el.classList.remove("open");setTimeout(()=>el.hidden=true,160);}
  function openAchievementDetail(id){
    ensureQualityUi(); const a=API.getAchievements(API.getStats()).find(x=>x.id===id);if(!a)return;
    const reward=titleRewardForAchievement(id), tier=a.tier||"common"; const date=a.unlockedAt?formatDate(new Date(a.unlockedAt)):t("stillLocked");
    const perfectMonthMeta = id === "perfect-month" && a.perfectMonthKey ? (() => {
      const [y,m] = a.perfectMonthKey.split("-").map(Number);
      const monthText = formatMonth(new Date(y, (m || 1) - 1, 1));
      const range = a.perfectMonthStart && a.perfectMonthEnd ? `${formatDate(dateFromKey(a.perfectMonthStart))} → ${formatDate(dateFromKey(a.perfectMonthEnd))}` : "";
      return `<div class="v76-ach-reward" data-tier="epic"><span>🌟</span><div><small>${esc(t("perfectMonthAchievedMonth"))}</small><strong>${esc(monthText)}</strong>${range?`<p>${esc(t("perfectMonthJourneyPeriod"))}: ${esc(range)}</p>`:""}</div></div>`;
    })() : "";
    const body=$("v76AchBody"); body.innerHTML=`<div class="v76-ach-hero" data-tier="${esc(tier)}"><span class="v76-ach-icon">${a.unlocked?a.icon:"🔒"}</span><div><span class="v7-tier-badge" data-tier="${esc(tier)}">${esc(tierLabel(tier))}</span><h2 id="v76AchTitle">${esc(API.translate(a.titleKey))}</h2><p>${esc(API.translate(a.descKey))}</p></div></div><div class="v76-ach-stats"><div><span>${esc(t("condition"))}</span><strong>${esc(challengeProgressText({...a,current:a.target}))}</strong></div><div><span>${esc(t("progressNow"))}</span><strong>${esc(challengeProgressText(a))}</strong></div><div><span>${esc(t("unlockedDate"))}</span><strong>${esc(date)}</strong></div></div><div class="v76-ach-progress"><i style="width:${Math.max(0,Math.min(100,Number(a.percent)||0))}%"></i></div>${perfectMonthMeta}${reward?`<div class="v76-ach-reward" data-tier="${esc(reward.tier)}"><span>👑</span><div><small>${esc(t("rewardTitle"))}</small><strong>${esc(titleName(reward))}</strong></div></div>`:""}`;
    const wrap=$("v76AchievementBackdrop");wrap.hidden=false;requestAnimationFrame(()=>wrap.classList.add("open"));$("v76AchClose")?.focus();
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
      <div class="v7-sidebar-brand"><div class="v7-sidebar-brand-main"><div class="brand-mark">%</div><div><strong>Workday Journey</strong><small>V8.3 · Work Bank & Economy</small></div></div><button id="v7CollapseBtn" class="v7-collapse-btn" type="button" aria-label="Hide sidebar" title="Hide sidebar">‹</button></div>
      <nav class="v7-nav" aria-label="Workday Journey navigation">${NAV.map(([key,icon]) => `<button type="button" data-v7-route="${key}"><span>${icon}</span><div><strong data-v7-nav-label="${key}"></strong><small data-v7-nav-sub="${key}"></small></div></button>`).join("")}</nav>
      <div class="v7-sidebar-profile"><span id="v7SideAvatar" class="v7-avatar v771-avatar-slot">🐣</span><div><strong id="v7SideName">My Journey</strong><em id="v7SideTitle" class="v7-profile-title" hidden></em><small id="v7SideRange">—</small></div></div>
      <div class="v7-private-chip">🔐 <span id="v7PrivateLabel"></span></div>`;

    const backdrop = document.createElement("div");
    backdrop.id = "v7SidebarBackdrop";
    backdrop.className = "v7-sidebar-backdrop";
    backdrop.hidden = true;
    shell.append(sidebar, workspace, backdrop);

    const profileBtn=$("profileQuickBtn"), profileName=$("profileQuickName");
    const quickAvatar=profileBtn?.querySelector("span"); if(quickAvatar){ quickAvatar.id="profileQuickAvatar"; quickAvatar.classList.add("v771-avatar-slot"); }
    if(profileBtn&&profileName&&!$("v7TopTitle")){ const wrap=document.createElement("span");wrap.className="v7-top-profile-copy";profileName.parentNode.insertBefore(wrap,profileName);wrap.appendChild(profileName);const title=document.createElement("small");title.id="v7TopTitle";title.className="v7-top-profile-title";title.hidden=true;wrap.appendChild(title); }

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
    ensureQualityUi();
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
    return `<div class="v7-page-heading"><div class="v7-page-title"><span>${icon}</span><div><p class="eyebrow">WORKDAY JOURNEY · V8.3</p><h2>${esc(title)}</h2><p class="muted">${esc(help)}</p></div></div>${actions ? `<div class="v7-page-actions">${actions}</div>` : ""}</div>`;
  }

  function injectPages() {
    const main = q("main.dashboard");
    if (!main || $("v7JournalPage")) return;

    const dashQuick = document.createElement("section");
    dashQuick.id = "v7DashboardQuick"; dashQuick.className = "card v7-dashboard-quick"; dashQuick.dataset.v7Page = "dashboard";
    dashQuick.innerHTML = `<div class="section-heading"><div><p class="eyebrow">WORKDAY JOURNEY</p><h3 id="v7QuickTitle"></h3></div></div><div class="v7-quick-grid">${[["journal","📓"],["projects","🧩"],["reports","📊"],["calendar","📅"]].map(([r,i])=>`<button type="button" data-v7-go="${r}"><span>${i}</span><strong data-v7-quick="${r}"></strong><small>→</small></button>`).join("")}</div></section>`;
    const mascot = document.createElement("section");
    mascot.id = "v77MascotCard"; mascot.className = "card v77-mascot-card"; mascot.dataset.v7Page = "dashboard";
    mascot.innerHTML = `<div class="v77-mascot-stage" aria-hidden="true"><div id="v77MascotEmoji" class="v77-mascot-emoji">🐣</div><span id="v77MascotAccessory" class="v77-mascot-accessory">💤</span></div><div class="v77-mascot-copy"><div class="v77-mascot-head"><div><p class="eyebrow" id="v77MascotEyebrow"></p><h3 id="v77MascotName"></h3></div><span id="v77MascotPercent" class="percentage-chip subtle">0%</span></div><div id="v77MascotBubble" class="v77-mascot-bubble"></div><div class="v77-mascot-progress"><i id="v77MascotBar"></i></div><small id="v77MascotStatus" class="muted"></small></div>`;
    q("#completionBanner", main)?.insertAdjacentElement("afterend", mascot);

    const overview = q(".three-grid", main);
    overview?.insertAdjacentElement("afterend", dashQuick);
    const insights=document.createElement("section");insights.id="v76DashboardInsights";insights.className="card v76-dashboard-insights";insights.dataset.v7Page="dashboard";dashQuick.insertAdjacentElement("afterend",insights);

    const journal = document.createElement("section"); journal.id="v7JournalPage"; journal.className="v7-page-panel"; journal.dataset.v7Page="journal"; main.appendChild(journal);
    const projects = document.createElement("section"); projects.id="v7ProjectsPage"; projects.className="v7-page-panel"; projects.dataset.v7Page="projects"; main.appendChild(projects);
    const ach = document.createElement("section"); ach.id="v7AchievementsPage"; ach.className="v7-page-panel"; ach.dataset.v7Page="achievements"; q(".journey-overview-card",main)?.insertAdjacentElement("beforebegin",ach);
    const reports = document.createElement("section"); reports.id="v7ReportsPage"; reports.className="v7-page-panel"; reports.dataset.v7Page="reports"; q(".attendance-card",main)?.insertAdjacentElement("beforebegin",reports);
    const cal = document.createElement("section"); cal.id="v7CalendarIntro"; cal.className="v7-page-panel"; cal.dataset.v7Page="calendar"; q(".calendar-card",main)?.insertAdjacentElement("beforebegin",cal);
    const missions = document.createElement("section"); missions.id="v82MissionsPage"; missions.className="v7-page-panel"; missions.dataset.v7Page="missions"; main.appendChild(missions);
    const bank = document.createElement("section"); bank.id="v83BankPage"; bank.className="v7-page-panel"; bank.dataset.v7Page="bank"; main.appendChild(bank);
    const rewards = document.createElement("section"); rewards.id="v81RewardsPage"; rewards.className="v7-page-panel"; rewards.dataset.v7Page="rewards"; main.appendChild(rewards);
    const settings = document.createElement("section"); settings.id="v7SettingsPage"; settings.className="v7-page-panel"; settings.dataset.v7Page="settings"; main.appendChild(settings);

    assignExistingPages();
    q("#v6WorkHub")?.setAttribute("hidden", "");
    qa("[data-v7-go]").forEach(btn => btn.addEventListener("click",()=>navigate(btn.dataset.v7Go)));
  }

  function assignExistingPages() {
    const groups = {
      dashboard:[".hero-card","#v77MascotCard","#completionBanner","#v6DailyRecap",".main-grid",".timeline-card",".three-grid","#v7DashboardQuick","#v76DashboardInsights"],
      achievements:[".journey-overview-card",".journey-timeline-card",".journey-story-card","#v7AchievementsPage"],
      reports:[".attendance-card",".smart-journey-grid",".heatmap-card","#v7ReportsPage"],
      calendar:[".calendar-card","#v7CalendarIntro"],
      missions:["#v82MissionsPage"],
      bank:["#v83BankPage"],
      rewards:["#v81RewardsPage"],
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
  }

  function renderSidebar() {
    NAV.forEach(([key]) => {
      const label = q(`[data-v7-nav-label="${key}"]`); const sub = q(`[data-v7-nav-sub="${key}"]`);
      if (label) label.textContent = t(key); if (sub) sub.textContent = t(`${key}Sub`);
    });
    const cfg = API.getConfig();
    if ($("v7SideName")) $("v7SideName").textContent = isDemo() ? t("publicDemo") : (cfg.profileName || t("myJourney"));
    const activeTitle=selectedTitle();
    const masteryTier=activeTitle?.masteryTier||"";
    const sideTitle=$("v7SideTitle"); if(sideTitle){sideTitle.hidden=!activeTitle;sideTitle.textContent=activeTitle?`✦ ${titleName(activeTitle)}`:"";sideTitle.dataset.tier=activeTitle?.tier||"";sideTitle.dataset.mastery=masteryTier;}
    const topTitle=$("v7TopTitle"); if(topTitle){topTitle.hidden=!activeTitle;topTitle.textContent=activeTitle?titleName(activeTitle):"";topTitle.dataset.tier=activeTitle?.tier||"";topTitle.dataset.mastery=masteryTier;}
    const sideProfile=q(".v7-sidebar-profile"); if(sideProfile)sideProfile.dataset.mastery=masteryTier;
    const topProfile=$("profileQuickBtn"); if(topProfile)topProfile.dataset.mastery=masteryTier;
    if ($("v7SideRange")) $("v7SideRange").textContent = `${API.formatCompactDate(cfg.startDate)} → ${API.formatCompactDate(cfg.endDate)}`;
    if ($("v7PrivateLabel")) $("v7PrivateLabel").textContent = t("privateLocal");
    renderProfileAvatars();
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
    if (route === "missions") window.WorkdayRewards?.renderMissions?.();
    if (route === "bank") window.WorkdayRewards?.renderBank?.();
    if (route === "rewards") window.WorkdayRewards?.renderShop?.();
    if (route === "settings") renderSettingsPage();
  }

  function journalStreakCount(){
    const journals=getJournals(),cfg=API.getConfig(),today=dateFromKey(clampTodayKey());let streak=0,seen=0;
    for(let d=new Date(today);d>=dateFromKey(cfg.startDate)&&seen<90;d.setDate(d.getDate()-1)){
      const key=dateKey(d),scheduled=API.getScheduledMinutes(d)>0;if(!scheduled)continue;seen++;if(journals[key])streak++;else break;
    }return streak;
  }
  function parseClockMinutes(value) {
    const [h,m] = String(value || "0:0").split(":").map(Number);
    return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
  }
  function avatarPrefs() {
    const photo = localStorage.getItem(KEYS.avatarPhoto) || "";
    const requested = localStorage.getItem(KEYS.avatarMode) === "photo" ? "photo" : "mascot";
    return { photo, mode: requested === "photo" && photo ? "photo" : "mascot" };
  }
  function setAvatarMode(mode) {
    const prefs = avatarPrefs();
    localStorage.setItem(KEYS.avatarMode, mode === "photo" && prefs.photo ? "photo" : "mascot");
    renderProfileAvatars(); renderSidebar();
  }
  function avatarSlotMarkup(mode, photo, snap, large=false) {
    if (mode === "photo" && photo) return `<img src="${esc(photo)}" alt="" class="v771-avatar-photo">`;
    const present = window.WorkdayRewards?.getMascotPresentation?.(snap) || { emoji:"🐣", accessory:snap?.accessory || "" };
    return `<span class="v771-avatar-mascot" aria-hidden="true">${esc(present.emoji || "🐣")}</span><i class="v771-avatar-accessory" aria-hidden="true">${esc(present.accessory || snap?.accessory || "")}</i>`;
  }
  function renderProfileAvatars() {
    const prefs = avatarPrefs(), snap = mascotSnapshot();
    const effectiveMode = isDemo() ? "mascot" : prefs.mode;
    [["profileQuickAvatar",false],["v7SideAvatar",false],["v771AvatarPreview",true]].forEach(([id,large])=>{
      const el=$(id); if(!el)return;
      el.classList.add("v771-avatar-slot"); if(large)el.classList.add("v771-avatar-preview");
      el.dataset.avatarMode=effectiveMode;
      el.innerHTML=avatarSlotMarkup(effectiveMode,prefs.photo,snap,large);
    });
    qa("[data-v771-avatar-mode]").forEach(btn=>btn.classList.toggle("active",btn.dataset.v771AvatarMode===prefs.mode));
  }
  async function avatarDataFromFile(file) {
    if (!file || !String(file.type||"").startsWith("image/")) throw new Error("invalid");
    if (file.size > 12 * 1024 * 1024) throw new Error("large");
    const url=URL.createObjectURL(file);
    try {
      const img=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=url;});
      const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;if(!w||!h)throw new Error("invalid");
      const side=Math.min(w,h),sx=(w-side)/2,sy=(h-side)/2,canvas=document.createElement("canvas");
      canvas.width=256;canvas.height=256;const ctx=canvas.getContext("2d");if(!ctx)throw new Error("invalid");
      ctx.fillStyle="#ffffff";ctx.fillRect(0,0,256,256);ctx.drawImage(img,sx,sy,side,side,0,0,256,256);
      return canvas.toDataURL("image/jpeg",0.84);
    } finally { URL.revokeObjectURL(url); }
  }
  function injectAvatarSettings(root) {
    const profileCard=q(".v7-settings-card",root); if(!profileCard || $("v771AvatarSettings")) return;
    const prefs=avatarPrefs(), panel=document.createElement("div"); panel.id="v771AvatarSettings"; panel.className="v771-avatar-settings";
    panel.innerHTML=`<div id="v771AvatarPreview" class="v771-avatar-slot v771-avatar-preview"></div><div class="v771-avatar-settings-copy"><div><strong>${esc(t("avatarTitle"))}</strong><p>${esc(t("avatarHelp"))}</p></div><div class="v771-avatar-choice"><button type="button" data-v771-avatar-mode="mascot" class="outline-btn ${prefs.mode==="mascot"?"active":""}">🐣 ${esc(t("avatarMascot"))}</button><button type="button" data-v771-avatar-mode="photo" class="outline-btn ${prefs.mode==="photo"?"active":""}" ${prefs.photo?"":"disabled"}>🖼 ${esc(t("avatarPhoto"))}</button></div><div class="v771-avatar-actions"><button id="v771UploadAvatar" class="secondary-btn" type="button">${prefs.photo?esc(t("avatarChange")):esc(t("avatarUpload"))}</button>${prefs.photo?`<button id="v771RemoveAvatar" class="outline-btn danger-soft" type="button">${esc(t("avatarRemove"))}</button>`:""}<input id="v771AvatarFile" type="file" accept="image/*" hidden></div><small>${esc(isDemo()?t("avatarMascotDemo"):t("avatarStoredLocal"))}</small></div>`;
    q(".v7-card-title",profileCard)?.insertAdjacentElement("afterend",panel);
    qa("[data-v771-avatar-mode]",panel).forEach(btn=>btn.addEventListener("click",()=>{const mode=btn.dataset.v771AvatarMode;if(mode==="photo"&&!avatarPrefs().photo){$("v771AvatarFile")?.click();return;}setAvatarMode(mode);renderSettingsPage();}));
    $("v771UploadAvatar")?.addEventListener("click",()=>$("v771AvatarFile")?.click());
    $("v771RemoveAvatar")?.addEventListener("click",async()=>{if(!(await askConfirm(t("avatarRemoveConfirm"),false)))return;localStorage.removeItem(KEYS.avatarPhoto);localStorage.setItem(KEYS.avatarMode,"mascot");toast("✓",t("avatarRemoved"),"success");renderSidebar();renderSettingsPage();});
    $("v771AvatarFile")?.addEventListener("change",async e=>{const file=e.target.files?.[0];e.target.value="";if(!file)return;try{const data=await avatarDataFromFile(file);localStorage.setItem(KEYS.avatarPhoto,data);localStorage.setItem(KEYS.avatarMode,"photo");toast("✓",t("avatarUploaded"),"success");renderSidebar();renderSettingsPage();}catch(err){toast("!",t(err?.message==="large"?"avatarTooLarge":"avatarInvalid"),"error");}});
    renderProfileAvatars();
  }

  function mascotSnapshot() {
    const cfg = API.getConfig(), now = API.getNow(), nowKey = API.dateKey(now);
    const startKey = String(cfg.startDate || ""), endKey = String(cfg.endDate || "");
    const capacity = Math.max(0, API.getActualDayCapacity(now) || 0);
    const worked = capacity ? Math.max(0, API.getWorkedMinutes(now, now) || 0) : 0;
    const percent = capacity ? Math.max(0, Math.min(100, worked / capacity * 100)) : 0;
    const current = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const start = parseClockMinutes(cfg.workdayStart), end = parseClockMinutes(cfg.workdayEnd);
    const active = (cfg.schedule || []).find(seg => current >= parseClockMinutes(seg.start) && current < parseClockMinutes(seg.end));
    const dayType = API.getDayType(now);
    if (endKey && nowKey > endKey) return { key:"mascotJourneyDone", accessory:"🏆", state:"journey-done", percent:100 };
    if (startKey && nowKey < startKey) return { key:"mascotBefore", accessory:"💤", state:"before", percent:0 };
    if (dayType === "holiday") return { key:"mascotHoliday", accessory:"🏡", state:"rest", percent:0 };
    if (dayType === "leave" && capacity <= 0) return { key:"mascotLeave", accessory:"🌿", state:"rest", percent:0 };
    if (capacity <= 0) return { key:"mascotRest", accessory:"🌿", state:"rest", percent:0 };
    if (current < start) return { key:"mascotBefore", accessory:"💤", state:"before", percent };
    if (current >= end || percent >= 99.999) return { key:"mascotDone", accessory:"🎉", state:"done", percent:100 };
    if (active?.type === "break") return { key:"mascotBreak", accessory:"☕", state:"break", percent };
    if (percent <= 15) return { key:"mascotStart", accessory:"💤", state:"start", percent };
    if (percent < 50) return { key:"mascotWork", accessory:"💻", state:"work", percent };
    if (percent < 80) return { key:"mascotHalf", accessory:"☕", state:"half", percent };
    return { key:"mascotAlmost", accessory:"👀", state:"almost", percent };
  }
  function renderMascot() {
    const card = $("v77MascotCard"); if (!card) return;
    const snap = mascotSnapshot(), pct = Math.max(0, Math.min(100, Number(snap.percent) || 0));
    const present = window.WorkdayRewards?.getMascotPresentation?.(snap) || { emoji:"🐣", name:t("mascotName"), message:t(snap.key), accessory:snap.accessory, id:"chick" };
    card.dataset.mascotState = snap.state; card.dataset.mascotId = present.id || "chick";
    if ($("v77MascotEmoji")) $("v77MascotEmoji").textContent = present.emoji || "🐣";
    if ($("v77MascotEyebrow")) $("v77MascotEyebrow").textContent = t("mascotTitle");
    if ($("v77MascotName")) $("v77MascotName").textContent = present.name || t("mascotName");
    if ($("v77MascotAccessory")) $("v77MascotAccessory").textContent = present.accessory || snap.accessory;
    if ($("v77MascotBubble")) $("v77MascotBubble").textContent = present.message || t(snap.key);
    if ($("v77MascotPercent")) $("v77MascotPercent").textContent = `${pct.toFixed(1)}%`;
    if ($("v77MascotBar")) $("v77MascotBar").style.width = `${pct}%`;
    if ($("v77MascotStatus")) $("v77MascotStatus").textContent = `${t("mascotProgress")} · ${pct.toFixed(1)}%`;
    renderProfileAvatars();
  }

  function renderDashboardExtras() {
    renderMascot();
    if ($("v7QuickTitle")) $("v7QuickTitle").textContent = t("quickActions");
    const root=$("v76DashboardInsights");if(!root)return;const ach=API.getAchievements(API.getStats()),near=ach.filter(a=>!a.unlocked&&Number(a.percent)>=70).length,projects=getProjects(),active=projects.filter(p=>!p.archived&&p.status!=="completed").length,streak=journalStreakCount(),stamp=localStorage.getItem(KEYS.lastBackup);let backup=t("never");if(stamp){const diff=Math.max(0,Math.floor((Date.now()-new Date(stamp).getTime())/86400000));backup=diff===0?t("today"):t("daysAgo",{n:diff});}
    root.innerHTML=`<div class="v7-card-title"><div><p class="eyebrow">SMART SUMMARY</p><h3>${esc(t("dashboardInsights"))}</h3></div><small class="muted">${esc(t("summaryLive"))}</small></div><div class="v76-insight-grid"><button type="button" data-v7-go="achievements"><span>🏆</span><div><strong>${near}</strong><small>${esc(t("achievementNear"))}</small></div></button><button type="button" data-v7-go="projects"><span>🧩</span><div><strong>${active}</strong><small>${esc(t("activeProjects"))}</small></div></button><button type="button" data-v7-go="journal"><span>📓</span><div><strong>${streak}</strong><small>${esc(t("journalStreak"))} · ${esc(t("days"))}</small></div></button><button type="button" data-v7-go="settings"><span>💾</span><div><strong>${esc(backup)}</strong><small>${esc(t("backupHealth"))}</small></div></button></div>`;
    qa("[data-v7-go]",root).forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.v7Go)));
  }

  function getProjects() { const value = read(KEYS.projects, []); return Array.isArray(value) ? value : []; }
  function getJournals() { const value = read(KEYS.journal, {}); return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }
  function signalDataChanged() { window.dispatchEvent(new CustomEvent("workday:v7-data-changed")); }

  function clampTodayKey() {
    const cfg = API.getConfig(); const today = dateKey(API.getNow());
    return today < cfg.startDate ? cfg.startDate : today > cfg.endDate ? cfg.endDate : today;
  }

  function journalFilterOptions(journals,projects){
    const months=[...new Set(Object.keys(journals).map(k=>k.slice(0,7)))].sort().reverse();
    return {months,projects};
  }
  function filteredJournalEntries(journals,projects){
    const qv=String(journalFilterState.q||"").trim().toLowerCase();
    return Object.entries(journals).filter(([key,e])=>{
      if(journalFilterState.month&&key.slice(0,7)!==journalFilterState.month)return false;
      if(journalFilterState.mood&&e.mood!==journalFilterState.mood)return false;
      if(journalFilterState.project&&!(e.projectIds||[]).includes(journalFilterState.project))return false;
      if(qv){const projectNames=(e.projectIds||[]).map(id=>projects.find(p=>p.id===id)?.name||"").join(" ");const hay=`${e.work||""} ${e.learned||""} ${projectNames}`.toLowerCase();if(!hay.includes(qv))return false;}
      return true;
    }).sort((a,b)=>b[0].localeCompare(a[0]));
  }
  function renderJournalHistory(root,journals,projects){
    const list=q("#v76JournalHistory",root),count=q("#v76JournalCount",root);if(!list)return;const items=filteredJournalEntries(journals,projects);if(count)count.textContent=t("entriesFound",{n:items.length});
    list.innerHTML=items.length?items.slice(0,80).map(([d,e])=>`<button type="button" data-v7-journal-date="${d}"><div><strong>${esc(formatDate(dateFromKey(d)))}</strong><span>${esc(e.work||e.learned||t("noData"))}</span></div><small>${esc((e.projectIds||[]).map(id=>projects.find(p=>p.id===id)?.name).filter(Boolean).join(" · "))}</small></button>`).join(""):`<div class="v7-empty">📓 ${esc(t("noEntries"))}</div>`;
    qa("[data-v7-journal-date]",list).forEach(btn=>btn.addEventListener("click",()=>renderJournalPage(btn.dataset.v7JournalDate)));
  }
  function shiftMonthKey(monthKey, delta) {
    const m=/^(\d{4})-(\d{2})$/.exec(String(monthKey||""));
    if(!m)return monthKey;
    const d=new Date(Number(m[1]),Number(m[2])-1+delta,1);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  }
  function renderJournalCalendar(root,journals,selectedKey,monthKey=selectedKey.slice(0,7)) {
    const host=q("#v761JournalCalendar",root); if(!host)return;
    const cfg=API.getConfig(), now=API.getNow(), todayKey=dateKey(now);
    const endParts=String(cfg.workdayEnd||"23:59").split(":").map(Number), endMinute=(endParts[0]||0)*60+(endParts[1]||0), nowMinute=now.getHours()*60+now.getMinutes();
    const minMonth=cfg.startDate.slice(0,7), maxMonth=cfg.endDate.slice(0,7);
    if(monthKey<minMonth)monthKey=minMonth;if(monthKey>maxMonth)monthKey=maxMonth;
    host.dataset.month=monthKey;
    const [year,month]=monthKey.split("-").map(Number), first=new Date(year,month-1,1), totalDays=new Date(year,month,0).getDate();
    const offset=(first.getDay()+6)%7;
    const weekdays=lang()==="th"?["จ","อ","พ","พฤ","ศ","ส","อา"]:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    let pending=0,cells="";
    for(let i=0;i<offset;i++)cells+=`<span class="v761-jcal-blank" aria-hidden="true"></span>`;
    for(let day=1;day<=totalDays;day++){
      const key=`${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
      const inJourney=key>=cfg.startDate&&key<=cfg.endDate, date=dateFromKey(key), hasEntry=!!journals[key];
      const expected=inJourney&&API.getActualDayCapacity(date)>0, isDue=key<todayKey||(key===todayKey&&nowMinute>=endMinute);
      const isPending=expected&&isDue&&!hasEntry;
      if(isPending)pending++;
      const dayType=inJourney?API.getDayType(date):"off";
      const classes=["v761-jcal-day",hasEntry?"has-entry":"",isPending?"is-pending":"",key===selectedKey?"selected":"",key===todayKey?"today":"",!inJourney?"outside":"",!expected&&!hasEntry?"nonwork":""].filter(Boolean).join(" ");
      const status=hasEntry?(lang()==="th"?"บันทึกแล้ว":"saved"):(isPending?(lang()==="th"?"ยังไม่ได้บันทึก":"journal missing"):(dayType==="holiday"?(lang()==="th"?"วันหยุดบริษัท":"company holiday"):dayType==="leave"?(lang()==="th"?"วันลา":"leave"):""));
      cells+=`<button type="button" class="${classes}" data-v761-jcal-date="${key}" ${inJourney?"":"disabled"} aria-label="${esc(`${formatJournalDateKey(key)}${status?` · ${status}`:""}`)}"><span class="v761-jcal-num">${day}</span>${hasEntry?`<span class="v761-jcal-check" aria-hidden="true">✓</span>`:""}</button>`;
    }
    host.innerHTML=`<div class="v761-jcal-head"><div><p class="eyebrow">JOURNAL CALENDAR</p><h4>${esc(t("journalCalendar"))}</h4></div><span class="v761-jcal-pending ${pending?"has-pending":"all-done"}">${esc(pending?t("pendingJournals",{n:pending}):t("journalAllCaughtUp"))}</span></div><div class="v761-jcal-nav"><button type="button" data-v761-jcal-nav="-1" ${monthKey<=minMonth?"disabled":""} aria-label="${esc(t("previousMonth"))}">‹</button><strong>${esc(formatMonth(first))}</strong><button type="button" data-v761-jcal-nav="1" ${monthKey>=maxMonth?"disabled":""} aria-label="${esc(t("nextMonth"))}">›</button></div><div class="v761-jcal-weekdays">${weekdays.map(d=>`<span>${esc(d)}</span>`).join("")}</div><div class="v761-jcal-grid">${cells}</div><p class="v761-jcal-help"><span class="v761-jcal-legend-check">✓</span> ${esc(t("journalCalendarHelp"))}</p>`;
    qa("[data-v761-jcal-date]",host).forEach(btn=>btn.addEventListener("click",()=>renderJournalPage(btn.dataset.v761JcalDate)));
    qa("[data-v761-jcal-nav]",host).forEach(btn=>btn.addEventListener("click",()=>renderJournalCalendar(root,journals,selectedKey,shiftMonthKey(monthKey,Number(btn.dataset.v761JcalNav)||0))));
  }

  function renderJournalPage(selectedKey) {
    const root = $("v7JournalPage"); if (!root) return;
    const cfg=API.getConfig(), journals=getJournals(), projects=getProjects();
    const key = selectedKey || root.dataset.selectedDate || clampTodayKey(); root.dataset.selectedDate = key;
    const entry = journals[key] || {work:"",learned:"",mood:"productive",projectIds:[]};
    const selectableProjects=projects.filter(p=>!p.archived || entry.projectIds?.includes(p.id));
    const opts=journalFilterOptions(journals,projects);
    if (isDemo()) { root.innerHTML = `${pageHeader("📓",t("journalTitle"),t("journalHelp"))}<div class="card v7-privacy-lock"><span>🔐</span><h3>${esc(t("demoLocked"))}</h3><p class="muted">${esc(t("privateLocal"))}</p></div>`; return; }
    root.innerHTML = `${pageHeader("📓",t("journalTitle"),t("journalHelp"))}
      <div class="v7-journal-grid">
        <form id="v7JournalForm" class="card v7-form-card">
          <label><span>${esc(t("journalDate"))}</span><div class="journal-date-control"><input id="v7JournalDate" class="journal-date-text" type="text" inputmode="numeric" autocomplete="off" maxlength="10" placeholder="DD/MM/YYYY" value="${esc(formatJournalDateKey(key))}"><button id="v7JournalDateBtn" class="journal-date-picker-btn" type="button" aria-label="Calendar" title="Calendar">🗓</button><input id="v7JournalDatePicker" class="journal-date-native" type="date" tabindex="-1" aria-hidden="true" min="${esc(cfg.startDate)}" max="${esc(cfg.endDate)}" value="${esc(key)}"></div></label>
          <label><span>${esc(t("workDone"))}</span><textarea id="v7JournalWork" rows="5">${esc(entry.work||"")}</textarea></label>
          <label><span>${esc(t("learned"))}</span><textarea id="v7JournalLearned" rows="5">${esc(entry.learned||"")}</textarea></label>
          <div class="v7-journal-meta"><label class="v7-journal-mood"><span>${esc(t("mood"))}</span><select id="v7JournalMood">${[["productive","😊 Productive"],["good","🙂 Good"],["neutral","😐 Normal"],["tired","😴 Tired"],["challenging","💪 Challenging"]].map(([v,l])=>`<option value="${v}" ${entry.mood===v?"selected":""}>${l}</option>`).join("")}</select></label><div class="v7-related-projects"><span class="v7-field-label">${esc(t("relatedProjects"))}</span><div class="v7-project-checks">${selectableProjects.length?selectableProjects.map(p=>`<label title="${esc(p.name)}"><input type="checkbox" value="${esc(p.id)}" ${entry.projectIds?.includes(p.id)?"checked":""}><span>${esc(p.name)}</span>${p.archived?`<em>📦</em>`:""}</label>`).join(""):`<p class="muted">${esc(t("noProjects"))}</p>`}</div></div></div>
          <div class="v7-form-actions v7-journal-actions"><button id="v7JournalDelete" class="danger-btn" type="button" ${journals[key]?"":"disabled"}>${esc(t("deleteJournal"))}</button><button class="primary-btn" type="submit">${esc(t("saveJournal"))}</button></div>
        </form>
        <aside class="card v7-list-card v76-journal-history"><div id="v761JournalCalendar" class="v761-journal-calendar"></div><div class="v7-card-title v761-history-title"><div><p class="eyebrow">JOURNAL HISTORY</p><h3>${esc(t("recentEntries"))}</h3></div><span id="v76JournalCount" class="percentage-chip subtle"></span></div>
          <div class="v76-journal-filters"><input id="v76JournalSearch" type="search" value="${esc(journalFilterState.q||"")}" placeholder="${esc(t("journalSearch"))}"><select id="v76JournalProject"><option value="">${esc(t("journalFilterProject"))}</option>${projects.map(p=>`<option value="${esc(p.id)}" ${journalFilterState.project===p.id?"selected":""}>${esc(p.name)}</option>`).join("")}</select><select id="v76JournalMood"><option value="">${esc(t("journalFilterMood"))}</option>${[["productive","😊 Productive"],["good","🙂 Good"],["neutral","😐 Normal"],["tired","😴 Tired"],["challenging","💪 Challenging"]].map(([v,l])=>`<option value="${v}" ${journalFilterState.mood===v?"selected":""}>${l}</option>`).join("")}</select><select id="v76JournalMonth"><option value="">${esc(t("journalFilterMonth"))}</option>${opts.months.map(m=>`<option value="${m}" ${journalFilterState.month===m?"selected":""}>${esc(formatMonth(new Date(Number(m.slice(0,4)),Number(m.slice(5))-1,1)))}</option>`).join("")}</select><button id="v76JournalClear" class="small-text-btn" type="button">${esc(t("clearFilters"))}</button></div>
          <div id="v76JournalHistory" class="v7-recent-list"></div></aside>
      </div>`;
    renderJournalCalendar(root,journals,key);
    renderJournalHistory(root,journals,projects);
    const persistFilters=()=>{write(KEYS.journalFilters,journalFilterState);renderJournalHistory(root,journals,projects);};
    const onSearch=debounce(()=>{journalFilterState.q=$("v76JournalSearch")?.value||"";persistFilters();},160);
    $("v76JournalSearch")?.addEventListener("input",onSearch);
    [["v76JournalProject","project"],["v76JournalMood","mood"],["v76JournalMonth","month"]].forEach(([id,keyName])=>$(id)?.addEventListener("change",e=>{journalFilterState[keyName]=e.target.value;persistFilters();}));
    $("v76JournalClear")?.addEventListener("click",()=>{journalFilterState={q:"",project:"",mood:"",month:""};write(KEYS.journalFilters,journalFilterState);renderJournalPage(key);});
    const journalText=$("v7JournalDate"), journalPicker=$("v7JournalDatePicker"), journalPickerBtn=$("v7JournalDateBtn");
    journalText?.addEventListener("input",()=>{journalText.value=maskJournalDate(journalText.value);});
    const loadJournalDate=()=>{const parsed=parseJournalDateText(journalText?.value);if(!parsed||parsed<cfg.startDate||parsed>cfg.endDate){toast("!",t("journalDateInvalid"),"error");journalText?.focus();return;}if(journalPicker)journalPicker.value=parsed;renderJournalPage(parsed);};
    journalText?.addEventListener("change",loadJournalDate);journalText?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();loadJournalDate();}});journalPicker?.addEventListener("change",()=>{if(journalPicker.value){journalText.value=formatJournalDateKey(journalPicker.value);renderJournalPage(journalPicker.value);}});journalPickerBtn?.addEventListener("click",()=>openJournalPicker(journalText,journalPicker));
    $("v7JournalForm")?.addEventListener("submit",e=>{e.preventDefault();const all=getJournals();const k=parseJournalDateText($("v7JournalDate").value);if(!k||k<cfg.startDate||k>cfg.endDate){toast("!",t("journalDateInvalid"),"error");return;}all[k]={date:k,work:$("v7JournalWork").value.trim(),learned:$("v7JournalLearned").value.trim(),mood:$("v7JournalMood").value,projectIds:qa(".v7-project-checks input:checked").map(x=>x.value),updatedAt:new Date().toISOString()};write(KEYS.journal,all);signalDataChanged();toast("✓",t("journalSaved"),"success");renderJournalPage(k);});
    $("v7JournalDelete")?.addEventListener("click",async()=>{if(!(await askConfirm(t("confirmDeleteJournal"))))return;const before=deepClone(getJournals()),all=getJournals();delete all[key];write(KEYS.journal,all);signalDataChanged();toast("🗑",t("journalDeleted"),"warning");showUndoToast(t("journalDeleted"),()=>{write(KEYS.journal,before);signalDataChanged();renderJournalPage(key);});renderJournalPage(key);});
  }

  function projectViewItems(projects){
    if(projectViewState==="archived")return projects.filter(p=>p.archived);
    if(projectViewState==="completed")return projects.filter(p=>!p.archived&&(p.status==="completed"||Number(p.progress)>=100));
    return projects.filter(p=>!p.archived&&p.status!=="completed"&&Number(p.progress)<100);
  }
  function renderProjectsPage(editId="") {
    const root=$("v7ProjectsPage"); if(!root)return; const projects=getProjects(), journals=getJournals();
    const edit=projects.find(p=>p.id===editId)||{id:"",name:"",category:"",progress:0,status:"active",description:"",archived:false};
    const visible=projectViewItems(projects);
    const cards=visible.length?visible.map(p=>{const days=Object.values(journals).filter(j=>j.projectIds?.includes(p.id)).length;return `<article class="card v7-project-card ${p.archived?"archived":""}"><div class="v7-project-head"><div><span class="v7-status-dot ${esc(p.status)}"></span><strong>${esc(p.name)}</strong><small>${esc(p.category||"")}</small></div><b>${Math.round(p.progress||0)}%</b></div><div class="v7-project-progress"><i style="width:${Math.max(0,Math.min(100,Number(p.progress)||0))}%"></i></div><p>${esc(p.description||t("noData"))}</p><small>${days} ${esc(t("journalDays"))}</small><div class="v7-card-actions"><button class="small-text-btn" data-v7-project-edit="${esc(p.id)}" type="button" aria-label="Edit ${esc(p.name)}">✎</button><button class="small-text-btn" data-v76-project-archive="${esc(p.id)}" type="button" aria-label="${esc(p.archived?t("restoreProject"):t("archiveProject"))}">${p.archived?"↩":"📦"}</button><button class="small-text-btn danger-text" data-v7-project-delete="${esc(p.id)}" type="button" aria-label="${esc(t("delete"))} ${esc(p.name)}">🗑</button></div></article>`;}).join(""):`<div class="card v7-empty">🧩 ${esc(t("noProjects"))}</div>`;
    const counts={active:projects.filter(p=>!p.archived&&p.status!=="completed"&&Number(p.progress)<100).length,completed:projects.filter(p=>!p.archived&&(p.status==="completed"||Number(p.progress)>=100)).length,archived:projects.filter(p=>p.archived).length};
    root.innerHTML=`${pageHeader("🧩",t("projectsTitle"),t("projectsHelp"))}<div class="v7-project-layout"><form id="v7ProjectForm" class="card v7-form-card v7-project-form-wide"><input id="v7ProjectId" type="hidden" value="${esc(edit.id)}"><div class="v7-two-col"><label><span>${esc(t("projectName"))}</span><input id="v7ProjectName" maxlength="60" value="${esc(edit.name)}"></label><label><span>${esc(t("category"))}</span><input id="v7ProjectCategory" maxlength="40" value="${esc(edit.category)}" placeholder="Web / Power BI / Learning"></label></div><div class="v7-two-col"><label><span>${esc(t("progress"))}</span><input id="v7ProjectProgress" type="number" min="0" max="100" step="5" value="${Math.round(edit.progress||0)}"></label><label><span>${esc(t("status"))}</span><select id="v7ProjectStatus"><option value="active" ${edit.status==="active"?"selected":""}>${esc(t("active"))}</option><option value="paused" ${edit.status==="paused"?"selected":""}>${esc(t("paused"))}</option><option value="completed" ${edit.status==="completed"?"selected":""}>${esc(t("completed"))}</option></select></label></div><label class="v7-project-description-field"><span>${esc(t("description"))}</span><textarea id="v7ProjectDescription" rows="5">${esc(edit.description)}</textarea></label><div class="v7-form-actions"><button id="v7ProjectNew" class="secondary-btn" type="button">＋ ${esc(t("newProject"))}</button><button class="primary-btn" type="submit">${esc(t("saveProject"))}</button></div></form><section class="v7-project-list-section"><div class="v7-project-list-heading"><div><p class="eyebrow">PROJECTS</p><h3>${esc(t("projectList"))}</h3></div><div class="v76-project-tabs"><button type="button" data-v76-project-view="active" class="${projectViewState==="active"?"active":""}">${esc(t("projectActiveTab"))} <b>${counts.active}</b></button><button type="button" data-v76-project-view="completed" class="${projectViewState==="completed"?"active":""}">${esc(t("projectCompletedTab"))} <b>${counts.completed}</b></button><button type="button" data-v76-project-view="archived" class="${projectViewState==="archived"?"active":""}">${esc(t("projectArchivedTab"))} <b>${counts.archived}</b></button></div></div><div class="v7-project-cards">${cards}</div></section></div>`;
    $("v7ProjectNew")?.addEventListener("click",()=>renderProjectsPage());
    qa("[data-v76-project-view]",root).forEach(btn=>btn.addEventListener("click",()=>{projectViewState=btn.dataset.v76ProjectView;localStorage.setItem(KEYS.projectView,projectViewState);renderProjectsPage();}));
    $("v7ProjectForm")?.addEventListener("submit",e=>{e.preventDefault();const name=$("v7ProjectName").value.trim();if(!name){toast("!",t("projectNameRequired"),"error");return;}const list=getProjects(),id=$("v7ProjectId").value||`p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`,old=list.find(p=>p.id===id);const item={id,name,category:$("v7ProjectCategory").value.trim(),progress:Math.max(0,Math.min(100,Number($("v7ProjectProgress").value)||0)),status:$("v7ProjectStatus").value,description:$("v7ProjectDescription").value.trim(),archived:!!old?.archived,createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};const next=list.filter(p=>p.id!==id);next.push(item);next.sort((a,b)=>(!!a.archived)-(!!b.archived)||(a.status==="completed")-(b.status==="completed")||a.name.localeCompare(b.name));write(KEYS.projects,next);signalDataChanged();toast("✓",t("projectSaved"),"success");renderProjectsPage();});
    qa("[data-v7-project-edit]",root).forEach(btn=>btn.addEventListener("click",()=>renderProjectsPage(btn.dataset.v7ProjectEdit)));
    qa("[data-v76-project-archive]",root).forEach(btn=>btn.addEventListener("click",async()=>{const id=btn.dataset.v76ProjectArchive,list=getProjects(),p=list.find(x=>x.id===id);if(!p)return;const before=deepClone(list);if(!p.archived&&!(await askConfirm(t("projectArchiveConfirm"),false)))return;p.archived=!p.archived;p.updatedAt=new Date().toISOString();write(KEYS.projects,list);signalDataChanged();const msg=p.archived?t("projectArchived"):t("projectRestored");toast(p.archived?"📦":"↩",msg,p.archived?"info":"success");showUndoToast(msg,()=>{write(KEYS.projects,before);signalDataChanged();renderProjectsPage();});renderProjectsPage();}));
    qa("[data-v7-project-delete]",root).forEach(btn=>btn.addEventListener("click",async()=>{if(!(await askConfirm(t("confirmDeleteProject"))))return;const id=btn.dataset.v7ProjectDelete,beforeProjects=deepClone(getProjects()),beforeJournals=deepClone(getJournals());write(KEYS.projects,getProjects().filter(p=>p.id!==id));const js=getJournals();Object.values(js).forEach(j=>{if(Array.isArray(j.projectIds))j.projectIds=j.projectIds.filter(x=>x!==id);});write(KEYS.journal,js);signalDataChanged();toast("🗑",t("projectDeleted"),"warning");showUndoToast(t("projectDeleted"),()=>{write(KEYS.projects,beforeProjects);write(KEYS.journal,beforeJournals);signalDataChanged();renderProjectsPage();});renderProjectsPage();}));
  }

  function challengeProgressText(a) {
    const current=Math.min(Number(a.current)||0,Number(a.target)||1),target=Number(a.target)||1;
    if(a.unit==="hours")return `${current.toLocaleString(lang()==="th"?"th-TH":"en-US",{maximumFractionDigits:1})} / ${target.toLocaleString(lang()==="th"?"th-TH":"en-US")} h`;
    if(a.unit==="percent")return `${current.toFixed(1)} / ${target}%`;
    return `${Math.floor(current)} / ${Math.floor(target)}`;
  }
  function tierLabel(tier){return t(tier)||tier;}
  function categoryLabel(category){return t(`category${String(category||"").charAt(0).toUpperCase()+String(category||"").slice(1)}`)||category;}
  function renderAchievementsPage() {
    const root=$("v7AchievementsPage");if(!root)return;const stats=API.getStats(),ach=API.getAchievements(stats),unlocked=ach.filter(a=>a.unlocked).length;
    const tiers=["common","rare","epic","legendary"],masteryStates=tierMasteryStates(ach),masteredCount=masteryStates.filter(x=>x.unlocked).length,titles=titleStates(),titlesUnlocked=titles.filter(x=>x.unlocked).length,activeTitle=selectedTitle();
    const tierSections=tiers.map(tier=>{const items=ach.filter(a=>(a.tier||"common")===tier);if(!items.length)return"";const done=items.filter(a=>a.unlocked).length,mastery=masteryStates.find(x=>x.tier===tier),reward=mastery?.reward;
      const cards=items.map(a=>{const titleReward=titleRewardForAchievement(a.id),progress=Math.max(0,Math.min(100,Number(a.percent)||0)),state=a.unlocked?"unlocked":progress>0?"progress":"locked";return `<article tabindex="0" role="button" aria-label="${esc(API.translate(a.titleKey))}" data-v76-achievement="${esc(a.id)}" class="card v7-achievement-card v7-challenge-card ${state}" data-tier="${esc(tier)}"><div class="v7-challenge-top"><span class="v7-trophy">${a.unlocked?a.icon:"🔒"}</span><span class="v7-tier-badge" data-tier="${esc(tier)}">${esc(tierLabel(tier))}</span></div><div class="v7-challenge-copy"><span class="v7-category">${esc(categoryLabel(a.category))}</span><strong>${esc(API.translate(a.titleKey))}</strong><p>${esc(API.translate(a.descKey))}</p></div><div class="v7-challenge-progress"><div><i style="width:${progress}%"></i></div><span>${a.unlocked?`✓ ${esc(t("challengeComplete"))}`:esc(challengeProgressText(a))}</span></div>${titleReward?`<div class="v7-title-reward ${a.unlocked?"earned":"locked"}" data-tier="${esc(titleReward.tier)}">👑 <span>${esc(t("rewardTitle"))}: <strong>${esc(titleName(titleReward))}</strong></span></div>`:""}<small class="v76-detail-hint">${esc(t("achievementDetail"))} →</small></article>`;}).join("");
      const masteryCard=reward?`<div class="v7-tier-mastery ${mastery?.unlocked?"unlocked":"locked"}" data-tier="${esc(tier)}"><div class="v7-mastery-icon">${mastery?.unlocked?"✦":"◇"}</div><div class="v7-mastery-copy"><span>${esc(t("tierMastery"))}</span><strong>${esc(titleName(reward))}</strong><small>${mastery?.unlocked?esc(t("masteryComplete")):esc(t("masteryLocked"))}</small><div class="v7-mastery-rewards"><em>👑 ${esc(t("masteryTitle"))}</em><em>✨ ${esc(t("masteryEffect"))}: ${esc(masteryEffectName(reward))}</em></div></div><div class="v7-mastery-status"><b>${done}/${items.length}</b><span>${mastery?.unlocked?"MASTERED":""}</span></div></div>`:"";
      return `<section class="v7-tier-section ${mastery?.unlocked?"mastered":""}" data-tier="${esc(tier)}"><div class="v7-tier-heading"><div><span class="v7-tier-orb"></span><div><p class="eyebrow">${esc(tierLabel(tier).toUpperCase())}</p><h3>${done}/${items.length} ${esc(t("challenges"))}</h3></div></div><span class="v7-tier-badge" data-tier="${esc(tier)}">${esc(tierLabel(tier))}</span></div>${masteryCard}<div class="v7-achievement-grid">${cards}</div></section>`;}).join("");
    root.innerHTML=`${pageHeader("🏆",t("challengeCenter"),t("challengeHelp"))}<div class="card v7-achievement-summary"><div><span>${esc(t("achievementsCount"))}</span><strong>${unlocked}/${ach.length}</strong><small>${esc(t("achievementProgress",{n:unlocked,total:ach.length}))}</small></div><div class="v7-achievement-meter"><i style="width:${ach.length?unlocked/ach.length*100:0}%"></i></div><div class="v7-title-summary"><span>👑 ${esc(t("titleSystem"))}</span><strong>${titlesUnlocked}/${titles.length}</strong><small>${activeTitle?esc(titleName(activeTitle)):esc(t("noTitle"))}</small></div><div class="v7-title-summary v7-mastery-summary"><span>✦ ${esc(t("tierMasteries"))}</span><strong>${masteredCount}/4</strong><small>${esc(t("masteryProgress",{n:masteredCount}))}</small></div></div>${tierSections}`;
    qa("[data-v76-achievement]",root).forEach(card=>{card.addEventListener("click",()=>openAchievementDetail(card.dataset.v76Achievement));card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openAchievementDetail(card.dataset.v76Achievement);}});});
  }

  function renderReportsPage() {
    API.markAchievementFlag?.("monthly-report");
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
    el.innerHTML=options.map(item=>{
      if(item && !Array.isArray(item) && item.group) return `<optgroup label="${esc(item.group)}">${item.options.map(([v,l])=>`<option value="${esc(v)}">${esc(l)}</option>`).join("")}</optgroup>`;
      const [v,l]=item; return `<option value="${esc(v)}">${esc(l)}</option>`;
    }).join("");el.value=src.value;
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
    const titleList=titleStates(),selectedTitleId=localStorage.getItem(KEYS.selectedTitle)||"",activeTitle=titleList.find(x=>x.id===selectedTitleId&&x.unlocked)||null;
    root.innerHTML=`${pageHeader("⚙",t("settingsTitle"),t("settingsHelp"))}
      <div class="v7-settings-grid">
        <section class="card v7-settings-card"><div class="v7-card-title"><div><p class="eyebrow">${esc(t("profileSection"))}</p><h3>${esc(t("profileJourney"))}</h3></div><button id="v7EditJourney" class="outline-btn" type="button">${esc(t("editJourney"))}</button></div><div class="v7-profile-summary"><strong>${esc(isDemo()?t("publicDemo"):(cfg.profileName||t("myJourney")))}</strong>${activeTitle?`<em class="v7-profile-title v7-profile-title-inline" data-tier="${esc(activeTitle.tier)}">✦ ${esc(titleName(activeTitle))}</em>`:""}<span>${esc(API.formatCompactDate(cfg.startDate))} → ${esc(API.formatCompactDate(cfg.endDate))}</span><small>${esc(cfg.workdayStart)} – ${esc(cfg.workdayEnd)} · ${esc(state.timezone)}</small></div></section>
        <section class="card v7-settings-card v7-title-settings-card"><div class="v7-card-title"><div><p class="eyebrow">TITLES</p><h3>👑 ${esc(t("titleSystem"))}</h3></div><span class="mini-chip">${esc(t("titleUnlockedCount",{n:titleList.filter(x=>x.unlocked).length,total:ALL_TITLE_DEFS.length}))}</span></div><p class="muted v7-title-help">${esc(t("titlePreviewHelp"))}</p><label class="v7-title-select-label"><span>${esc(t("titlePreview"))}</span><select id="v7TitleSelect"><option value="">— ${esc(t("noTitle"))} —</option>${ALL_TITLE_DEFS.map(item=>{const st=titleList.find(x=>x.id===item.id);return `<option value="${esc(item.id)}" ${selectedTitleId===item.id?"selected":""} ${st?.unlocked?"":"disabled"}>${st?.unlocked?(item.masteryTier?"✦":"👑"):"🔒"} ${esc(titleName(item))} · ${esc(tierLabel(item.tier))}${item.masteryTier?" · MASTERY":""}</option>`;}).join("")}</select></label><div id="v76TitlePreview" class="v7-title-preview ${activeTitle?"active":""}" data-tier="${esc(activeTitle?.tier||"common")}" data-mastery="${esc(activeTitle?.masteryTier||"")}"><span>${activeTitle?.masteryTier?"✦":"👑"}</span><div><small>${esc(t("selectedTitle"))}</small><strong>${esc(activeTitle?titleName(activeTitle):t("noTitle"))}</strong></div></div><div class="v76-title-actions"><button id="v76ApplyTitle" class="primary-btn" type="button">${esc(t("applyTitle"))}</button></div></section>
        <section class="card v7-settings-card"><p class="eyebrow">${esc(t("displaySection"))}</p><h3>${esc(t("appearance"))}</h3><div class="v7-settings-fields"><label><span>${esc(t("theme"))}</span><select id="v7Theme"></select></label><label><span>${esc(t("font"))}</span><select id="v7Font"></select></label><label><span>${esc(t("fontSize"))}</span><select id="v7FontSize"></select></label><label><span>${esc(t("density"))}</span><select id="v7Density"></select></label></div><div class="v764-font-preview"><small>${esc(t("fontPreview"))}</small><strong>${esc(t("fontPreviewText"))}</strong><span>${esc(t("fontPreviewHelp"))}</span></div></section>
        <section class="card v7-settings-card"><p class="eyebrow">${esc(t("regionSection"))}</p><h3>${esc(t("regionSection"))}</h3><div class="v7-settings-fields"><label><span>${esc(t("timezone"))}</span><select id="v7Timezone"></select></label><label><span>${esc(t("locale"))}</span><select id="v7Locale"></select></label></div></section>
        <section class="card v7-settings-card"><p class="eyebrow">${esc(t("behaviorSection"))}</p><h3>${esc(t("behavior"))}</h3><div class="v7-toggle-list"><label><span>${esc(t("seconds"))}</span><input id="v7Seconds" type="checkbox"></label><label><span>${esc(t("animation"))}</span><input id="v7Animation" type="checkbox"></label><label><span>${esc(t("moodSetting"))}</span><input id="v7Mood" type="checkbox"></label><label><span>${esc(t("notifications"))}</span><input id="v7Notifications" type="checkbox"></label></div></section>
        <section class="card v7-settings-card v7-settings-wide"><div class="v7-card-title"><div><p class="eyebrow">${esc(t("dataSection"))}</p><h3>${esc(t("dataBackup"))}</h3></div><div class="v76-data-meta"><span class="mini-chip">${esc(t("backupStatus"))}: ${esc(backupLabel())}</span><span class="mini-chip">${esc(t("schemaVersion"))}: v3</span></div></div><div class="v7-settings-actions"><button id="v7ExportBackup" class="outline-btn" type="button">↓ ${esc(t("exportBackup"))}</button><button id="v7ImportBackup" class="outline-btn" type="button">↑ ${esc(t("importBackup"))}</button><button id="v7Customize" class="outline-btn" type="button">⚙ ${esc(t("dashboardLayout"))}</button><button id="v7OpenAdvanced" class="outline-btn" type="button">${esc(t("openFullSettings"))}</button><button id="v7NewJourney" class="secondary-btn" type="button">${esc(t("newJourney"))}</button><button id="v7ResetData" class="danger-btn" type="button">${esc(t("resetData"))}</button></div><p class="muted v7-privacy-text">🔐 ${esc(t("localPrivacy"))}</p></section>
      </div>`;
    injectAvatarSettings(root);
    mirrorSelect("v7Theme","themeSelect",[["light",t("light")],["dark",t("dark")],["system",t("system")]]);
    mirrorSelect("v7Font","fontFamilySelect",[
      {group:lang()==="th"?"แนะนำสำหรับระบบงาน":"Recommended",options:[["sarabun","Sarabun · Recommended"],["bai","Bai Jamjuree"],["noto","Noto Sans Thai"],["ibm","IBM Plex Sans Thai"]]},
      {group:lang()==="th"?"อ่านง่าย / ใช้งานทั่วไป":"General / Easy to read",options:[["leelawadee","Leelawadee UI"],["tahoma","Tahoma"],["system","Segoe UI / System"],["prompt","Prompt"],["kanit","Kanit"],["mitr","Mitr"],["anakotmai","Anakotmai"],["athiti","Athiti"]]},
      {group:lang()==="th"?"ฟอนต์สไตล์ / เน้นเอกลักษณ์":"Style / Personality",options:[["trirong","Trirong (Serif)"],["itim","Itim (Handwriting)"],["pattaya","Pattaya (Display)"],["chonburi","Chonburi (Display)"]]}
    ]);
    mirrorSelect("v7FontSize","fontSizeSelect",[["small",t("small")],["medium",t("medium")],["large",t("large")]]);
    mirrorSelect("v7Density","densitySelect",[["comfortable",t("comfortable")],["compact",t("compact")]]);
    mirrorSelect("v7Timezone","timezoneSelect",qa("#timezoneSelect option").map(o=>[o.value,o.textContent]));
    mirrorSelect("v7Locale","localeSelect",qa("#localeSelect option").map(o=>[o.value,o.textContent]));
    mirrorToggle("v7Seconds","showSecondsToggle");mirrorToggle("v7Animation","animationToggle");mirrorToggle("v7Mood","dynamicMoodToggle");mirrorToggle("v7Notifications","notificationToggle");
    const previewTitle=()=>{const value=$("v7TitleSelect")?.value||"",item=titleStates().find(x=>x.id===value&&x.unlocked)||null,box=$("v76TitlePreview");if(!box)return;box.classList.toggle("active",!!item);box.dataset.tier=item?.tier||"common";box.dataset.mastery=item?.masteryTier||"";box.querySelector("span").textContent=item?.masteryTier?"✦":"👑";box.querySelector("strong").textContent=item?titleName(item):t("noTitle");};
    $("v7TitleSelect")?.addEventListener("change",previewTitle); $("v76ApplyTitle")?.addEventListener("click",()=>setSelectedTitle($("v7TitleSelect")?.value||""));
    $("v7EditJourney")?.addEventListener("click",()=>$("editJourneyBtn")?.click());$("v7ExportBackup")?.addEventListener("click",()=>$("exportBackupBtn")?.click());$("v7ImportBackup")?.addEventListener("click",()=>$("importBackupBtn")?.click());$("v7Customize")?.addEventListener("click",()=>$("v6SettingsCustomize")?.click());$("v7OpenAdvanced")?.addEventListener("click",()=>$("settingsOpen")?.click());$("v7NewJourney")?.addEventListener("click",()=>$("startNewJourneyBtn")?.click());$("v7ResetData")?.addEventListener("click",async()=>{if(!(await askConfirm(t("confirmResetData"))))return;if(window.WorkdayV8Cloud?.isSignedIn?.()){const ok=await window.WorkdayV8Cloud.deleteCloudState?.();if(ok===false)return;}const keys=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.startsWith("wp-"))keys.push(key);}keys.forEach(k=>localStorage.removeItem(k));localStorage.setItem("wp-data-reset-version","5.2-setup-calendar-reset");location.reload();});
  }

  function renderVersion() {
    if ($("footerVersion")) $("footerVersion").textContent=`v${VERSION}`;
    const ft=q(".footer [data-i18n='footerText']"); if(ft)ft.textContent=t("appVersion");
  }

  function bindGlobal() {
    window.addEventListener("hashchange",applyRoute);
    let sidebarResizeTimer;
    window.addEventListener("resize",()=>{ clearTimeout(sidebarResizeTimer); sidebarResizeTimer=setTimeout(syncSidebarMode,120); });
    qa(".lang-btn").forEach(btn=>btn.addEventListener("click",()=>setTimeout(()=>{renderSidebar();renderPage(currentRoute());ensureQualityUi();},30)));
    window.addEventListener("workday:v7-data-changed",()=>renderPage(currentRoute()));
    window.addEventListener("workday:journey-cleared",()=>setTimeout(()=>navigate("dashboard"),20));
    document.addEventListener("keydown",e=>{
      if(e.key==="Escape"){if(confirmResolver){resolveConfirm(false);return;}closeAchievementDetail();}
    });
    let calendarBefore=null;
    $("dayModalSave")?.addEventListener("click",()=>{calendarBefore=deepClone(API.getDayOverrides());setTimeout(()=>{const after=API.getDayOverrides();if(JSON.stringify(calendarBefore)!==JSON.stringify(after)){showUndoToast(t("calendarUpdated"),()=>{API.setDayOverrides(calendarBefore);signalDataChanged();});}},80);},true);
  }

  function init() {
    setupShell(); injectPages(); renderVersion(); bindGlobal(); ensureQualityUi();
    if (!location.hash || !NAV.some(([key]) => location.hash.includes(key))) history.replaceState(null,"","#/dashboard");
    applyRoute();
    setInterval(()=>{ const route=currentRoute(); if(["dashboard","reports","calendar"].includes(route)) renderPage(route); renderSidebar(); }, 90000);
    setInterval(()=>{ if(currentRoute()==="dashboard") renderMascot(); }, 1000);
  }

  init();
})();
