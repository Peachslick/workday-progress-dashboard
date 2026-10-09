/* Workday Journey 8.6.0.8 | consolidated in original execution order.
 * Individual source sections retain their previous isolated IIFE scope.
 * Edit by finding the SOURCE separator. Do not rearrange sections.
 */

/* ===== SOURCE: app.js ===== */
(() => {
  "use strict";

  const APP_VERSION = "8.7.6";
  const BACKUP_SCHEMA_VERSION = 3;
  const DATA_RESET_VERSION = "5.2-setup-calendar-reset";
  const DATA_RESET_MARKER = "wp-data-reset-version";

  // V5.2 migration: force older browsers through First-Time Setup once,
  // including the new Calendar & Attendance step. Only Workday Journey (wp-*) keys are removed.
  (function runV52OneTimeReset() {
    try {
      if (localStorage.getItem(DATA_RESET_MARKER) === DATA_RESET_VERSION) return;
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("wp-")) keys.push(key);
      }
      keys.forEach(key => localStorage.removeItem(key));
      localStorage.setItem(DATA_RESET_MARKER, DATA_RESET_VERSION);
    } catch (_) {
      // The app can still run with browser defaults if storage is unavailable.
    }
  })();

  // V5.1.1: Light is the default theme. Existing explicit Light/Dark choices are preserved.
  // Browsers that were still using the old default "system" theme are migrated once to Light.
  (function migrateDefaultThemeToLight() {
    try {
      const marker = "wp-theme-default-version";
      const version = "5.1.1-light-default";
      if (localStorage.getItem(marker) === version) return;
      const current = localStorage.getItem("wp-theme");
      if (!current || current === "system") localStorage.setItem("wp-theme", "light");
      localStorage.setItem(marker, version);
    } catch (_) {
      // If storage is unavailable, state below still falls back to Light.
    }
  })();
  const DEFAULT_JOURNEY_CONFIG = {
    profileName: "",
    startDate: "2026-05-05",
    endDate: "2026-10-30",
    workdayStart: "07:00",
    workdayEnd: "16:10",
    workdays: [1, 2, 3, 4, 5],
    breaks: [
      { start: "09:00", end: "09:20" },
      { start: "11:00", end: "11:40" },
      { start: "14:00", end: "14:10" }
    ],
    timezone: "Asia/Bangkok",
    locale: "th-TH"
  };
  const DEFAULT_COMPANY_HOLIDAYS = ["2026-07-27", "2026-07-28", "2026-08-12", "2026-10-13"];
  function createDefaultCompanyHolidayOverrides() {
    return Object.fromEntries(DEFAULT_COMPANY_HOLIDAYS.map(key => [key, { type: "holiday", note: "" }]));
  }

  function readStoredJson(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch { return fallback; }
  }
  function parseConfigDate(value, fallback) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
    if (!match) return new Date(fallback);
    const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(d.getTime()) ? new Date(fallback) : d;
  }
  function timeToMinutes(value) {
    const match = /^(\d{1,2}):(\d{2})$/.exec(String(value || ""));
    if (!match) return NaN;
    const h = Number(match[1]), m = Number(match[2]);
    return h >= 0 && h <= 23 && m >= 0 && m <= 59 ? h * 60 + m : NaN;
  }
  function minutesToTime(total) {
    const safe = Math.max(0, Math.min(1439, Math.round(total)));
    return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
  }
  function durationLabelFromMinutes(total) {
    const safe = Math.max(0, Math.round(total));
    const h = Math.floor(safe / 60), m = safe % 60;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
  }
  function normalizeJourneyConfig(raw = {}) {
    const merged = { ...DEFAULT_JOURNEY_CONFIG, ...(raw || {}) };
    const start = parseConfigDate(merged.startDate, parseConfigDate(DEFAULT_JOURNEY_CONFIG.startDate, new Date()));
    let end = parseConfigDate(merged.endDate, parseConfigDate(DEFAULT_JOURNEY_CONFIG.endDate, new Date()));
    if (end < start) end = new Date(start);
    let startMin = timeToMinutes(merged.workdayStart), endMin = timeToMinutes(merged.workdayEnd);
    if (!Number.isFinite(startMin) || !Number.isFinite(endMin) || endMin <= startMin) {
      startMin = timeToMinutes(DEFAULT_JOURNEY_CONFIG.workdayStart);
      endMin = timeToMinutes(DEFAULT_JOURNEY_CONFIG.workdayEnd);
    }
    let workdays = Array.isArray(merged.workdays) ? [...new Set(merged.workdays.map(Number).filter(n => n >= 0 && n <= 6))] : [...DEFAULT_JOURNEY_CONFIG.workdays];
    if (!workdays.length) workdays = [...DEFAULT_JOURNEY_CONFIG.workdays];
    const sourceBreaks = Array.isArray(merged.breaks) ? merged.breaks : DEFAULT_JOURNEY_CONFIG.breaks;
    const breaks = sourceBreaks.map(item => ({ start: String(item?.start || ""), end: String(item?.end || "") }))
      .filter(item => {
        const a = timeToMinutes(item.start), b = timeToMinutes(item.end);
        return Number.isFinite(a) && Number.isFinite(b) && a >= startMin && b <= endMin && b > a;
      })
      .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
      .filter((item, index, arr) => index === 0 || timeToMinutes(item.start) >= timeToMinutes(arr[index - 1].end));
    const timezone = typeof merged.timezone === "string" && merged.timezone ? merged.timezone : DEFAULT_JOURNEY_CONFIG.timezone;
    const locale = ["th-TH", "en-US", "en-GB"].includes(merged.locale) ? merged.locale : DEFAULT_JOURNEY_CONFIG.locale;
    return {
      profileName: String(merged.profileName || "").trim().slice(0, 40),
      startDate: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`,
      endDate: `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`,
      workdayStart: minutesToTime(startMin), workdayEnd: minutesToTime(endMin), workdays, breaks, timezone, locale
    };
  }
  function buildSchedule(config) {
    const startMin = timeToMinutes(config.workdayStart), endMin = timeToMinutes(config.workdayEnd);
    const schedule = [];
    let cursor = startMin, breakIndex = 0;
    for (const br of config.breaks) {
      const a = timeToMinutes(br.start), b = timeToMinutes(br.end);
      if (a > cursor) schedule.push({ type: "work", start: minutesToTime(cursor), end: minutesToTime(a), durationLabel: durationLabelFromMinutes(a - cursor) });
      breakIndex++;
      schedule.push({ type: "break", key: `break${breakIndex}`, start: minutesToTime(a), end: minutesToTime(b), durationLabel: durationLabelFromMinutes(b - a) });
      cursor = Math.max(cursor, b);
    }
    if (cursor < endMin) schedule.push({ type: "work", start: minutesToTime(cursor), end: minutesToTime(endMin), durationLabel: durationLabelFromMinutes(endMin - cursor) });
    return schedule;
  }
  function hydrateRuntimeConfig(raw) {
    const config = normalizeJourneyConfig(raw);
    const schedule = buildSchedule(config);
    const totalWorkMinutes = schedule.filter(x => x.type === "work").reduce((sum, x) => sum + (timeToMinutes(x.end) - timeToMinutes(x.start)), 0);
    const totalBreakMinutes = schedule.filter(x => x.type === "break").reduce((sum, x) => sum + (timeToMinutes(x.end) - timeToMinutes(x.start)), 0);
    return {
      ...config,
      internshipStart: parseConfigDate(config.startDate, new Date()),
      internshipEnd: parseConfigDate(config.endDate, new Date()),
      schedule,
      totalWorkMinutes,
      totalBreakMinutes
    };
  }

  const HAS_LEGACY_DATA = ["wp-day-overrides", "wp-achievements-initialized", "wp-dynamic-mood", "wp-font-family", "wp-language"].some(key => localStorage.getItem(key) !== null);
  if (!localStorage.getItem("wp-journey-config") && HAS_LEGACY_DATA) localStorage.setItem("wp-journey-config", JSON.stringify(DEFAULT_JOURNEY_CONFIG));
  if (localStorage.getItem("wp-setup-completed") !== "true" && HAS_LEGACY_DATA) localStorage.setItem("wp-setup-completed", "true");
  let journeyConfig = normalizeJourneyConfig(readStoredJson("wp-journey-config", DEFAULT_JOURNEY_CONFIG));
  const CONFIG = hydrateRuntimeConfig(journeyConfig);
  function applyJourneyConfig(raw, persist = true) {
    journeyConfig = normalizeJourneyConfig(raw);
    Object.assign(CONFIG, hydrateRuntimeConfig(journeyConfig));
    if (persist) localStorage.setItem("wp-journey-config", JSON.stringify(journeyConfig));
  }


  const translations = {
    th: {
      appEyebrow: "ตัวติดตามเวลาทำงานส่วนตัว", appTitle: "Workday Progress",
      todayProgress: "ความคืบหน้าวันนี้", workdayTitle: "ความคืบหน้าวันทำงาน", working: "กำลังทำงาน",
      breakStatus: "กำลังพัก", finished: "เลิกงานแล้ว", weekendStatus: "วันหยุดสุดสัปดาห์", beforeWork: "ยังไม่เริ่มงาน",
      holidayStatus: "วันหยุด", leaveStatus: "วันลา", completed: "ผ่านไปแล้ว", worked: "ทำงานแล้ว", remaining: "เหลือเวลา",
      finishTime: "เลิกงาน", nextBreak: "พักครั้งถัดไป", noMoreBreak: "ไม่มีช่วงพักแล้ว", dailyMilestone: "เป้าหมายวันนี้",
      liveCountdown: "LIVE COUNTDOWN", untilNextBreak: "ถึงช่วงพักถัดไป", untilBreakEnds: "ถึงเวลาพักสิ้นสุด", untilFinish: "ถึงเวลาเลิกงาน",
      untilStart: "ถึงเวลาเริ่มงาน", noWorkCountdown: "วันนี้ไม่มีเวลาทำงาน", nextBreakAt: "พักครั้งถัดไปเวลา {time}", breakEndsAt: "กลับมาทำงานเวลา {time}",
      finishAt: "เลิกงานเวลา {time}", workStartsAt: "เริ่มงานเวลา {time}", internshipProgress: "ความคืบหน้าการฝึกงาน", journeyTitle: "เส้นทางการฝึกงาน",
      workdayNumber: "วันทำงาน", workdaysLeft: "วันทำงานที่เหลือ", workHoursLeft: "ชั่วโมงทำงานที่เหลือ", startDate: "เริ่มต้น", endDate: "สิ้นสุด",
      todayTimeline: "ตารางเวลาวันนี้", scheduleTitle: "ตารางเวลาทำงานและพัก", work: "ทำงาน", break: "พัก", break1: "พัก 1", break2: "พัก 2", break3: "พัก 3",
      done: "ผ่านแล้ว", now: "ตอนนี้", upcoming: "ถัดไป", thisWeek: "สัปดาห์นี้", weeklyProgress: "ความคืบหน้าสัปดาห์นี้", weekTotal: "รวมสัปดาห์นี้",
      weeklySummary: "สัปดาห์นี้ผ่านไป {percent}% ของเวลาทำงานที่กำหนด", countdown: "นับถอยหลัง", untilEnd: "ถึงวันสิ้นสุดการฝึกงาน",
      calendarDays: "วันตามปฏิทิน", workingDays: "วันทำงาน", workingHours: "ชั่วโมงทำงาน", calendar: "ปฏิทิน", today: "วันนี้",
      calendarInstruction: "คลิกวันที่เพื่อกำหนดวันหยุด วันลา หรือวันทำงานพิเศษ", pastWorkday: "วันทำงานที่ผ่านมา", holiday: "วันหยุด", leave: "วันลา",
      customWorkday: "วันทำงานพิเศษ", footerText: "Workday Progress Dashboard · ใช้งานแบบออฟไลน์ได้", personalize: "ปรับแต่ง", settings: "ตั้งค่า",
      fontFamily: "รูปแบบตัวอักษร", fontHelp: "เลือกฟอนต์ได้หลายสไตล์ ฟอนต์เว็บจะโหลดจาก Google Fonts/Thai Web Fonts เมื่อออนไลน์ และใช้ fallback อัตโนมัติหากยังโหลดไม่สำเร็จ",
      fontSize: "ขนาดตัวอักษร", small: "เล็ก", medium: "กลาง", large: "ใหญ่", theme: "ธีม", systemTheme: "ตามระบบ", lightTheme: "สว่าง", darkTheme: "มืด",
      clockFormat: "รูปแบบเวลา", layoutDensity: "ระยะห่างหน้าจอ", comfortable: "สบายตา", compact: "กระชับ", showSeconds: "แสดงวินาที",
      showSecondsHelp: "แสดงวินาทีในนาฬิกาหลัก", animations: "Animation", animationsHelp: "เปิดการเคลื่อนไหวของ Progress และ Card", schedule: "เวลาทำงาน",
      workTime: "เวลาทำงานจริง", totalBreak: "เวลาพักรวม", internshipRange: "ช่วงฝึกงาน", resetSettings: "คืนค่าเริ่มต้น", greetingMorning: "สวัสดีตอนเช้า",
      greetingAfternoon: "สวัสดีตอนบ่าย", greetingEvening: "สวัสดีตอนเย็น", heroWorking: "วันนี้กำลังเดินหน้าไปเรื่อย ๆ ทำงานให้ครบ 8 ชั่วโมงกันครับ",
      heroBreak: "ตอนนี้เป็นช่วงพัก เปอร์เซ็นต์การทำงานจะหยุดไว้ชั่วคราว", heroFinished: "ภารกิจวันนี้ครบแล้ว เวลาทำงานสะสมครบ 8 ชั่วโมงแล้วครับ",
      heroWeekend: "วันนี้เป็นวันหยุดสุดสัปดาห์ ระบบจะไม่นับเป็นวันทำงาน", heroHoliday: "วันนี้ถูกกำหนดเป็นวันหยุด จึงไม่นับเวลาและเปอร์เซ็นต์การทำงาน",
      heroLeave: "วันนี้ถูกกำหนดเป็นวันลา จึงไม่นับเวลาและเปอร์เซ็นต์การทำงาน", heroBefore: "ยังไม่ถึงเวลาเริ่มงาน วันนี้เริ่มเวลา 07:00 น.",
      daysLeftSentence: "เหลืออีก {days} วันทำงาน ถึง {date}", dayPrefix: "วันที่", updated: "อัปเดต", calendarDaySetting: "ตั้งค่าวันในปฏิทิน",
      normalSchedule: "ตารางปกติ", normalScheduleHelp: "ใช้จันทร์–ศุกร์ตามปกติ", holidayHelp: "ไม่นับเป็นวันทำงาน", leaveHelp: "ไม่นับเป็นวันทำงาน",
      customWorkdayHelp: "บังคับให้นับเป็นวันทำงาน", noteOptional: "หมายเหตุ (ไม่บังคับ)", notePlaceholder: "เช่น วันหยุดบริษัท", cancel: "ยกเลิก", save: "บันทึก",
      outsideInternship: "วันที่นี้อยู่นอกช่วงฝึกงาน แต่ยังสามารถบันทึกสถานะไว้ได้", normalDayDescription: "เลือกสถานะสำหรับวันนี้ ระบบจะคำนวณ Progress ใหม่โดยอัตโนมัติ",
      milestone0: "เริ่มต้นวันทำงาน", milestone25: "25% · เริ่มเข้าที่แล้ว", milestone50: "50% · ผ่านครึ่งวันแล้ว", milestone75: "75% · ใกล้ถึงเส้นชัย",
      milestone100: "100% · งานวันนี้เสร็จแล้ว 🎉", holidayShort: "หยุด", leaveShort: "ลา", workShort: "ทำงาน", weekOff: "—",
      journeySoFar: "MY INTERNSHIP JOURNEY", achievementSummaryTitle: "ความสำเร็จที่ผ่านมา", achievementSummarySubtitle: "ดูว่าคุณลงทุนเวลาและเดินทางมาไกลแค่ไหนแล้ว",
      viewAllStatistics: "ดูสถิติทั้งหมด", totalWorkTime: "เวลาทำงานสะสม", workdaysReached: "วันทำงานที่ผ่านมาถึง", achievementsUnlocked: "Achievement ที่ปลดล็อก",
      currentStreak: "Work Streak ปัจจุบัน", fullDaysText: "{days} วันเต็มสำเร็จแล้ว", workingMinutesText: "{minutes} นาทีทำงาน", latestAchievement: "ล่าสุด: {title}",
      longestText: "ยาวนานที่สุด: {days} วันทำงาน", nextMilestone: "NEXT MILESTONE", milestoneRemaining: "เหลืออีก {time}", milestoneComplete: "ทุก Milestone สำเร็จแล้ว",
      journeyTimeline: "JOURNEY TIMELINE", fromFirstToLast: "จากวันแรกถึงวันสุดท้าย", youAreHere: "คุณอยู่ตรงนี้", plannedHours: "ชั่วโมงทั้งหมดตามแผน",
      weeksSinceStart: "สัปดาห์ที่เดินทางมา", daysSinceStart: "วันตามปฏิทินตั้งแต่เริ่ม", weekPrefix: "สัปดาห์", journeyComplete: "JOURNEY COMPLETE",
      internshipCompleted: "ฝึกงานสำเร็จแล้ว!", completionBannerText: "เส้นทางตั้งแต่วันแรกจนถึงวันสุดท้ายครบ 100% แล้ว", viewFinalSummary: "ดูสรุปการฝึกงาน",
      detailedStats: "DETAILED STATISTICS", yourJourneySoFar: "เส้นทางของคุณจนถึงตอนนี้", internshipRecords: "INTERNSHIP RECORDS", recordsAndHighlights: "สถิติและไฮไลต์",
      monthlyStatistics: "MONTHLY STATISTICS", workHoursByMonth: "ชั่วโมงทำงานรายเดือน", mostActive: "มากที่สุด: {month}", achievements: "ACHIEVEMENTS",
      achievementCollection: "คลังความสำเร็จ", achievementUnlocked: "ACHIEVEMENT UNLOCKED!", awesome: "เยี่ยมมาก!", unlocked: "ปลดล็อกแล้ว", locked: "ยังไม่ปลดล็อก",
      completionMessage: "คุณเดินทางตั้งแต่ 5 พฤษภาคม ถึง 30 ตุลาคม 2569 ครบเรียบร้อยแล้ว", hoursLabel: "ชั่วโมง", workdaysLabel: "วันทำงาน", weeksLabel: "สัปดาห์", journeyLabel: "เส้นทาง",
      allAchievementsUnlocked: "ปลดล็อกความสำเร็จแล้ว {count} รายการ", recordStartedDays: "วันทำงานที่เริ่มแล้ว", recordFullDays: "วันทำงานเต็มที่สำเร็จ", recordRemaining: "เวลาทำงานที่เหลือ",
      recordPlanned: "ชั่วโมงทั้งหมดตามแผน", recordCurrentStreak: "Work Streak ปัจจุบัน", recordLongestStreak: "Work Streak ที่ยาวที่สุด", recordCalendarDays: "วันตั้งแต่เริ่มฝึกงาน",
      recordWeek: "สัปดาห์ปัจจุบัน", recordEquivalentDays: "เทียบเท่าวันทำงาน 8 ชม.", recordProgress: "Progress การฝึกงาน", recordMilestones: "Milestone ที่ผ่านแล้ว",
      hoursShort: "ชม.", daysShort: "วัน", minutesShort: "นาที", of: "จาก", firstDayTitle: "The Beginning", firstDayDesc: "เริ่มต้นวันฝึกงานวันแรก",
      h100Title: "100 Hours", h100Desc: "สะสมเวลาทำงานครบ 100 ชั่วโมง", h250Title: "250 Hours", h250Desc: "เดินทางผ่าน 250 ชั่วโมงแรก",
      halfwayTitle: "Halfway There", halfwayDesc: "ความคืบหน้าการฝึกงานผ่าน 50%", h500Title: "500 Hours", h500Desc: "สะสมเวลาทำงานครบ 500 ชั่วโมง",
      h750Title: "750 Hours", h750Desc: "สะสมเวลาทำงานครบ 750 ชั่วโมง", p75Title: "75% Complete", p75Desc: "ผ่านสามในสี่ของเส้นทางฝึกงาน",
      h800Title: "800 Hours", h800Desc: "สะสมเวลาทำงานครบ 800 ชั่วโมง", h1000Title: "1,000 Hours", h1000Desc: "สะสมเวลาทำงานครบหนึ่งพันชั่วโมง",
      completeTitle: "Internship Completed", completeDesc: "เส้นทางฝึกงานสำเร็จครบ 100%", initialAchievementMeta: "ตอนนี้คุณปลดล็อกแล้ว {count} Achievement",
      newAchievementMeta: "ความสำเร็จใหม่ถูกบันทึกไว้ใน Journey ของคุณ", plannedText: "{worked} / {planned}", dayOffLabel: "วันหยุด"
    },
    en: {
      appEyebrow: "PERSONAL WORK TRACKER", appTitle: "Workday Progress",
      todayProgress: "TODAY'S WORK PROGRESS", workdayTitle: "Workday Progress", working: "Working", breakStatus: "On Break", finished: "Finished",
      weekendStatus: "Weekend", beforeWork: "Before Work", holidayStatus: "Holiday", leaveStatus: "Leave", completed: "completed", worked: "Worked", remaining: "Remaining",
      finishTime: "Finish", nextBreak: "Next Break", noMoreBreak: "No more breaks", dailyMilestone: "DAILY MILESTONE", liveCountdown: "LIVE COUNTDOWN",
      untilNextBreak: "Until Next Break", untilBreakEnds: "Until Break Ends", untilFinish: "Until Finish", untilStart: "Until Work Starts", noWorkCountdown: "No work scheduled today",
      nextBreakAt: "Next break at {time}", breakEndsAt: "Back to work at {time}", finishAt: "Finish at {time}", workStartsAt: "Work starts at {time}",
      internshipProgress: "INTERNSHIP PROGRESS", journeyTitle: "Internship Journey", workdayNumber: "Workday", workdaysLeft: "Workdays Left", workHoursLeft: "Working Hours Left",
      startDate: "Start", endDate: "End", todayTimeline: "TODAY'S TIMELINE", scheduleTitle: "Work & Break Schedule", work: "Work", break: "Break", break1: "Break 1", break2: "Break 2", break3: "Break 3",
      done: "Done", now: "Now", upcoming: "Upcoming", thisWeek: "THIS WEEK", weeklyProgress: "Weekly Progress", weekTotal: "Week Total",
      weeklySummary: "This week is {percent}% through its scheduled working time", countdown: "COUNTDOWN", untilEnd: "Until Internship Ends", calendarDays: "calendar days",
      workingDays: "workdays", workingHours: "working hours", calendar: "CALENDAR", today: "Today", calendarInstruction: "Click a date to mark a holiday, leave, or special working day",
      pastWorkday: "Past workday", holiday: "Holiday", leave: "Leave", customWorkday: "Special workday", footerText: "Workday Progress Dashboard · Offline Ready", personalize: "PERSONALIZE",
      settings: "Settings", fontFamily: "Font Family", fontHelp: "Choose from multiple Thai font styles. Web fonts load from Google Fonts/Thai Web Fonts when online and fall back automatically if unavailable.",
      fontSize: "Font Size", small: "Small", medium: "Medium", large: "Large", theme: "Theme", systemTheme: "System", lightTheme: "Light", darkTheme: "Dark",
      clockFormat: "Clock Format", layoutDensity: "Layout Density", comfortable: "Comfortable", compact: "Compact", showSeconds: "Show Seconds", showSecondsHelp: "Show seconds on the main clock",
      animations: "Animations", animationsHelp: "Animate progress and dashboard cards", schedule: "Work Schedule", workTime: "Actual Work Time", totalBreak: "Total Break", internshipRange: "Internship Period",
      resetSettings: "Reset Settings", greetingMorning: "GOOD MORNING", greetingAfternoon: "GOOD AFTERNOON", greetingEvening: "GOOD EVENING",
      heroWorking: "The day is moving forward. Keep going toward your 8 working hours.", heroBreak: "You are on a break. Work progress is paused until the break ends.",
      heroFinished: "Today's mission is complete. You have reached all 8 working hours.", heroWeekend: "It's the weekend. Today is not counted as a workday.",
      heroHoliday: "Today is marked as a holiday, so work time and progress are not counted.", heroLeave: "Today is marked as leave, so work time and progress are not counted.",
      heroBefore: "Work has not started yet. Today's schedule begins at 07:00.", daysLeftSentence: "{days} workdays left until {date}", dayPrefix: "Day", updated: "Updated",
      calendarDaySetting: "CALENDAR DAY", normalSchedule: "Normal schedule", normalScheduleHelp: "Use the regular Monday–Friday rule", holidayHelp: "Excluded from workday count",
      leaveHelp: "Excluded from workday count", customWorkdayHelp: "Force this date to count as a workday", noteOptional: "Note (optional)", notePlaceholder: "e.g. Company holiday", cancel: "Cancel", save: "Save",
      outsideInternship: "This date is outside the internship period, but you can still save its status.", normalDayDescription: "Choose a status for this date. Progress calculations update automatically.",
      milestone0: "Starting the workday", milestone25: "25% · Getting into the flow", milestone50: "50% · Halfway there", milestone75: "75% · Almost at the finish line", milestone100: "100% · Today's work is complete 🎉",
      holidayShort: "Holiday", leaveShort: "Leave", workShort: "Work", weekOff: "—", journeySoFar: "MY INTERNSHIP JOURNEY", achievementSummaryTitle: "Achievements So Far",
      achievementSummarySubtitle: "See how much time you have invested and how far you have come", viewAllStatistics: "View All Statistics", totalWorkTime: "Total Work Time",
      workdaysReached: "Workdays Reached", achievementsUnlocked: "Achievements Unlocked", currentStreak: "Current Work Streak", fullDaysText: "{days} full workdays completed",
      workingMinutesText: "{minutes} working minutes", latestAchievement: "Latest: {title}", longestText: "Longest: {days} workdays", nextMilestone: "NEXT MILESTONE",
      milestoneRemaining: "{time} to go", milestoneComplete: "All milestones achieved", journeyTimeline: "JOURNEY TIMELINE", fromFirstToLast: "From First Day to Last Day", youAreHere: "YOU ARE HERE",
      plannedHours: "Total Planned Hours", weeksSinceStart: "Journey Week", daysSinceStart: "Calendar Days Since Start", weekPrefix: "Week", journeyComplete: "JOURNEY COMPLETE",
      internshipCompleted: "Internship Completed!", completionBannerText: "The journey from your first day to your final day has reached 100%.", viewFinalSummary: "View Final Summary",
      detailedStats: "DETAILED STATISTICS", yourJourneySoFar: "Your Journey So Far", internshipRecords: "INTERNSHIP RECORDS", recordsAndHighlights: "Records & Highlights",
      monthlyStatistics: "MONTHLY STATISTICS", workHoursByMonth: "Work Hours by Month", mostActive: "Most active: {month}", achievements: "ACHIEVEMENTS", achievementCollection: "Achievement Collection",
      achievementUnlocked: "ACHIEVEMENT UNLOCKED!", awesome: "AWESOME!", unlocked: "Unlocked", locked: "Locked", completionMessage: "You completed the full journey from May 5 to October 30, 2026.",
      hoursLabel: "HOURS", workdaysLabel: "WORKDAYS", weeksLabel: "WEEKS", journeyLabel: "JOURNEY", allAchievementsUnlocked: "{count} achievements unlocked",
      recordStartedDays: "Workdays Started", recordFullDays: "Full Workdays Completed", recordRemaining: "Work Time Remaining", recordPlanned: "Total Planned Hours",
      recordCurrentStreak: "Current Work Streak", recordLongestStreak: "Longest Work Streak", recordCalendarDays: "Calendar Days Since Start", recordWeek: "Current Journey Week",
      recordEquivalentDays: "Equivalent 8-Hour Days", recordProgress: "Internship Progress", recordMilestones: "Milestones Reached", hoursShort: "h", daysShort: "days", minutesShort: "min", of: "of",
      firstDayTitle: "The Beginning", firstDayDesc: "Started the first day of your internship", h100Title: "100 Hours", h100Desc: "Completed 100 working hours",
      h250Title: "250 Hours", h250Desc: "Passed your first 250 working hours", halfwayTitle: "Halfway There", halfwayDesc: "Reached 50% internship progress",
      h500Title: "500 Hours", h500Desc: "Completed 500 working hours", h750Title: "750 Hours", h750Desc: "Completed 750 working hours", p75Title: "75% Complete", p75Desc: "Reached three quarters of the internship journey",
      h800Title: "800 Hours", h800Desc: "Completed 800 working hours", h1000Title: "1,000 Hours", h1000Desc: "Completed one thousand working hours", completeTitle: "Internship Completed",
      completeDesc: "Completed the internship journey at 100%", initialAchievementMeta: "You have already unlocked {count} achievements", newAchievementMeta: "This achievement has been added to your journey",
      plannedText: "{worked} / {planned}", dayOffLabel: "Day off"
    }
  };

  Object.assign(translations.th, {
    online: "ออนไลน์", offline: "ออฟไลน์", installApp: "ติดตั้งแอป", installReady: "พร้อมติดตั้งเป็นแอปแล้ว",
    installNotAvailable: "เปิดผ่าน HTTPS เช่น Vercel แล้วใช้เมนู Install ของ Browser ได้", installed: "ติดตั้ง Workday Journey เรียบร้อยแล้ว",
    createSnapshot: "สร้าง Snapshot", createFinalSnapshot: "สร้าง Final Snapshot", snapshotCreated: "สร้าง Journey Snapshot เรียบร้อยแล้ว",
    snapshotHelp: "สร้างภาพสรุป 1600×900 จากสถิติปัจจุบัน เหมาะสำหรับเก็บเป็น Portfolio หรือแชร์ให้เพื่อน", snapshotCard: "Journey Snapshot", shareJourney: "SHARE YOUR JOURNEY",
    futureMilestones: "FUTURE MILESTONES", milestonePredictor: "ตัวคาดการณ์ Milestone", milestonePredictorHelp: "คำนวณวันที่และเวลาที่คาดว่าจะไปถึงเป้าหมาย โดยข้าม Break, Weekend, Holiday และ Leave",
    expectedAt: "คาดว่าจะถึง", achievedAt: "สำเร็จเมื่อ", milestoneDone: "สำเร็จแล้ว", milestoneNext: "เป้าหมายถัดไป", milestoneFuture: "เป้าหมายในอนาคต",
    timeMachine: "TIME MACHINE", dayReplay: "จำลองเวลาในวันทำงาน", timeMachineHelp: "เลือกวันและลากเวลาเพื่อดูว่า ณ ช่วงเวลานั้น Progress จะเป็นเท่าไร", jumpToNow: "ตอนนี้",
    replayDate: "วันที่จำลอง", simulatedTime: "เวลาจำลอง", simulatedProgress: "Progress", simulatedStatus: "สถานะ", replaySummary: "ทำงานแล้ว {worked} · เหลือ {remaining}",
    internshipHeatmap: "INTERNSHIP HEATMAP", journeyAtGlance: "เส้นทางทั้งหมดในภาพเดียว", heatmapHelp: "สีเข้มขึ้นตามชั่วโมงทำงานของแต่ละวัน และแสดง Leave / Holiday แยกต่างหาก",
    journeyStory: "JOURNEY STORY", storyTitle: "เรื่องราวของการฝึกงาน", storyHelp: "เหตุการณ์สำคัญที่ผ่านแล้วและเป้าหมายที่จะเกิดขึ้นต่อจากนี้", storyDone: "ผ่านแล้ว", storyNext: "ถัดไป", storyUpcoming: "กำลังรอ",
    trophyRoom: "TROPHY ROOM", achievementShowcase: "Achievement Showcase", unlockedOn: "ปลดล็อก {date}", expectedOn: "คาดว่า {date}",
    dynamicMood: "Dynamic Dashboard Mood", dynamicMoodHelp: "เปลี่ยนบรรยากาศพื้นหลังตามช่วงเวลาและสถานะการทำงาน",
    smartNotifications: "Smart Notifications", smartNotificationsHelp: "แจ้งเตือนก่อนพัก กลับเข้าทำงาน เหลือ 1 ชั่วโมง และจบวันทำงาน", notificationsEnabled: "เปิด Smart Notifications แล้ว",
    notificationsDenied: "Browser ไม่อนุญาต Notification กรุณาเปิด Permission ของเว็บไซต์ก่อน", notificationsUnsupported: "Browser นี้ไม่รองรับ Notification",
    notifyBreakSoonTitle: "พักในอีก 5 นาที ☕", notifyBreakSoonBody: "อีกไม่นานจะถึงช่วงพัก {time}", notifyBackTitle: "กลับเข้าทำงาน ▶", notifyBackBody: "ช่วงพักสิ้นสุดแล้ว ถึงเวลากลับมาทำงานต่อ",
    notifyHourLeftTitle: "เหลืออีก 1 ชั่วโมง 🏁", notifyHourLeftBody: "วันนี้เหลือเวลาทำงานจริงอีกประมาณ 1 ชั่วโมง", notifyDoneTitle: "Workday Complete 🎉", notifyDoneBody: "เวลาทำงานวันนี้ครบ 8 ชั่วโมงแล้ว",
    pwaTitle: "ติดตั้งเป็นแอป", pwaHelp: "เมื่อเปิดผ่าน HTTPS เช่น Vercel สามารถติดตั้ง Dashboard เป็น PWA และใช้งานแบบ Offline หลังโหลดทรัพยากรแล้ว",
    firstLoadOffline: "โหลดทรัพยากรครั้งแรกขณะออนไลน์ก่อน เพื่อให้ PWA เก็บ Cache สำหรับ Offline", finalReportCard: "FINAL INTERNSHIP REPORT CARD",
    browserTitleBreak: "พัก {minutes} นาที", browserTitleDone: "งานวันนี้ครบแล้ว", browserTitleOff: "วันหยุด", browserTitleBefore: "ยังไม่เริ่มงาน",
    statusWork: "กำลังทำงาน", statusBreak: "กำลังพัก", statusBefore: "ก่อนเริ่มงาน", statusFinished: "เสร็จสิ้น", statusWeekend: "Weekend", statusHoliday: "Holiday", statusLeave: "Leave"
  });

  Object.assign(translations.en, {
    online: "Online", offline: "Offline", installApp: "Install App", installReady: "The app is ready to install",
    installNotAvailable: "Open over HTTPS such as Vercel, then use your browser's Install option", installed: "Workday Journey was installed",
    createSnapshot: "Create Snapshot", createFinalSnapshot: "Create Final Snapshot", snapshotCreated: "Journey Snapshot created",
    snapshotHelp: "Create a 1600×900 summary image from your current stats for a portfolio or sharing", snapshotCard: "Journey Snapshot", shareJourney: "SHARE YOUR JOURNEY",
    futureMilestones: "FUTURE MILESTONES", milestonePredictor: "Milestone Predictor", milestonePredictorHelp: "Predicts the date and time of each goal while skipping breaks, weekends, holidays and leave",
    expectedAt: "Expected", achievedAt: "Achieved", milestoneDone: "Achieved", milestoneNext: "Next milestone", milestoneFuture: "Upcoming",
    timeMachine: "TIME MACHINE", dayReplay: "Workday Replay", timeMachineHelp: "Choose a date and drag the clock to see what progress would look like at that moment", jumpToNow: "Now",
    replayDate: "Replay Date", simulatedTime: "Simulated Time", simulatedProgress: "Progress", simulatedStatus: "Status", replaySummary: "Worked {worked} · {remaining} remaining",
    internshipHeatmap: "INTERNSHIP HEATMAP", journeyAtGlance: "The Whole Journey at a Glance", heatmapHelp: "Darker cells mean more working hours; leave and holidays use separate colors",
    journeyStory: "JOURNEY STORY", storyTitle: "Your Internship Story", storyHelp: "Major moments already reached and the milestones still ahead", storyDone: "Reached", storyNext: "Next", storyUpcoming: "Upcoming",
    trophyRoom: "TROPHY ROOM", achievementShowcase: "Achievement Showcase", unlockedOn: "Unlocked {date}", expectedOn: "Expected {date}",
    dynamicMood: "Dynamic Dashboard Mood", dynamicMoodHelp: "Changes the dashboard atmosphere based on time of day and work status",
    smartNotifications: "Smart Notifications", smartNotificationsHelp: "Alerts before breaks, when a break ends, with one hour left, and at workday completion", notificationsEnabled: "Smart Notifications enabled",
    notificationsDenied: "Notifications are blocked. Enable the site permission in your browser first", notificationsUnsupported: "Notifications are not supported in this browser",
    notifyBreakSoonTitle: "Break in 5 minutes ☕", notifyBreakSoonBody: "Your next break begins at {time}", notifyBackTitle: "Back to work ▶", notifyBackBody: "The break has ended. Time to continue the workday",
    notifyHourLeftTitle: "1 hour to go 🏁", notifyHourLeftBody: "About one hour of actual working time remains today", notifyDoneTitle: "Workday Complete 🎉", notifyDoneBody: "You have completed all 8 working hours today",
    pwaTitle: "Install as an App", pwaHelp: "When served over HTTPS such as Vercel, this dashboard can be installed as a PWA and work offline after its resources are cached",
    firstLoadOffline: "Load the site online once so the PWA can cache resources for offline use", finalReportCard: "FINAL INTERNSHIP REPORT CARD",
    browserTitleBreak: "Break · {minutes}m left", browserTitleDone: "Workday complete", browserTitleOff: "Day off", browserTitleBefore: "Before work",
    statusWork: "Working", statusBreak: "On Break", statusBefore: "Before Work", statusFinished: "Finished", statusWeekend: "Weekend", statusHoliday: "Holiday", statusLeave: "Leave"
  });

  // V4.1 — Attendance, Leave & Time Balance
  Object.assign(translations.th, {
    attendanceOverview: "ATTENDANCE & TIME BALANCE", attendanceTitle: "เวลาเข้าเป้าและเวลาที่หายไป",
    attendanceHelp: "แยกเวลาที่ทำงานจริง เวลาที่หายจากการลา วันหยุดบริษัท และวันทำงานชดเชยออกจากกัน",
    leaveTimeLost: "เวลาที่หายไปจากการลา", leaveDaysRecorded: "{days} วันลา · {hours}",
    companyHolidays: "วันหยุดบริษัท", companyHolidayHelp: "ไม่นับเป็นเวลาที่หายไป",
    compensatoryWork: "งานชดเชย", compensatoryWorkHelp: "{days} วัน · ทำงานแล้ว {hours}",
    attendanceRate: "Attendance", attendanceExpectedActual: "จริง {actual} / ควรได้ {expected}",
    timeBalance: "TIME BALANCE", expectedByToday: "ชั่วโมงที่ควรสะสมถึงวันนี้", actualByToday: "ชั่วโมงทำงานจริง",
    leaveImpact: "เวลาลา", balance: "ส่วนต่างเวลา", onTrack: "ตรงตามแผน", behindBy: "ต่ำกว่าแผน {time}", aheadBy: "มากกว่าแผน {time}",
    companyHoliday: "วันหยุดบริษัท", personalLeave: "วันลา", compensatoryWorkday: "วันทำงานชดเชย",
    companyHolidayDayHelp: "บริษัทหยุดให้ ไม่นับเป็นวันทำงานและไม่ถือเป็นเวลาที่หายไป",
    personalLeaveHelp: "ยังถือเป็นเวลาตามตาราง แต่ชั่วโมงลาจะถูกนับเป็นเวลาที่หายไป",
    compensatoryWorkdayHelp: "วันที่บริษัทกำหนดให้มาทำงานชดเชย ให้นับเวลาเหมือนวันทำงานปกติ",
    leaveDuration: "ระยะเวลาลา", fullDayLeave: "เต็มวัน", halfDayLeave: "ครึ่งวัน", customLeave: "กำหนดเอง",
    fullDayLeaveHelp: "ลา 8 ชั่วโมง", halfDayLeaveHelp: "ลา 4 ชั่วโมง", customLeaveHelp: "กำหนดชั่วโมงและนาทีที่ลา",
    hoursField: "ชั่วโมง", minutesField: "นาที", leavePreview: "เวลาที่หายจากวันลา: {time}",
    partialLeaveBadge: "ลา {time}", fullLeaveBadge: "ลาเต็มวัน",
    recordLeaveLost: "เวลาที่หายจากการลา", recordAttendance: "Attendance ถึงวันนี้", recordExpected: "ชั่วโมงที่ควรสะสม",
    recordCompanyHoliday: "วันหยุดบริษัท", recordCompWork: "งานชดเชยที่ทำแล้ว", recordTimeBalance: "Time Balance",
    monthlyLeaveText: "ลา {leave} · ชดเชย {comp}", attendanceStatistics: "ATTENDANCE STATISTICS", attendanceAndBalance: "Attendance & Time Balance",
    finalActualHours: "เวลาทำงานจริง", finalLeaveTime: "เวลาลา", finalCompanyHolidays: "วันหยุดบริษัท", finalCompWork: "งานชดเชย", finalAttendance: "Attendance",
    scheduledWorkday: "วันตามตาราง", actualWorkCompletion: "Actual Work Completion", scheduleJourneyProgress: "Journey Progress",
    companyHolidayShort: "หยุดบริษัท", compWorkShort: "ชดเชย", leaveShortWithTime: "ลา {time}",
    attendancePerfect: "ยอดเยี่ยม · เวลาเข้าเป้าครบตามที่ควรถึงวันนี้", attendanceWithLeave: "มีเวลาหายจากการลา {time}",
    noLeaveTime: "ยังไม่มีเวลาที่หายจากการลา", daysRecordedTotal: "บันทึกไว้ทั้งหมด {days} วัน",
    leaveValidation: "กรุณากำหนดเวลาลาระหว่าง 1 นาที ถึงเวลาทำงานเต็มวัน",
    scheduleRemainingHours: "ชั่วโมงทำงานจริงที่เหลือตามปฏิทิน", workdaysActuallyWorked: "วันที่ได้ทำงานจริง",
    calendarInstruction: "คลิกวันที่เพื่อกำหนดวันหยุดบริษัท วันลา หรือวันทำงานชดเชย"
  });

  Object.assign(translations.en, {
    attendanceOverview: "ATTENDANCE & TIME BALANCE", attendanceTitle: "Attendance, Leave & Time Balance",
    attendanceHelp: "Separates actual work, leave time lost, company holidays and compensatory workdays",
    leaveTimeLost: "Leave Time Lost", leaveDaysRecorded: "{days} leave days · {hours}",
    companyHolidays: "Company Holidays", companyHolidayHelp: "Excluded from lost time",
    compensatoryWork: "Compensatory Work", compensatoryWorkHelp: "{days} days · {hours} worked",
    attendanceRate: "Attendance", attendanceExpectedActual: "Actual {actual} / Expected {expected}",
    timeBalance: "TIME BALANCE", expectedByToday: "Expected Hours by Today", actualByToday: "Actual Work Hours",
    leaveImpact: "Leave Time", balance: "Time Balance", onTrack: "On track", behindBy: "Behind by {time}", aheadBy: "Ahead by {time}",
    companyHoliday: "Company Holiday", personalLeave: "Personal Leave", compensatoryWorkday: "Compensatory Workday",
    companyHolidayDayHelp: "A company-provided day off. It is excluded from scheduled work and is not counted as lost time",
    personalLeaveHelp: "The day remains part of the schedule, while the selected leave duration is counted as lost time",
    compensatoryWorkdayHelp: "A company-designated make-up workday. It counts like a normal working day",
    leaveDuration: "Leave Duration", fullDayLeave: "Full Day", halfDayLeave: "Half Day", customLeave: "Custom",
    fullDayLeaveHelp: "8 hours of leave", halfDayLeaveHelp: "4 hours of leave", customLeaveHelp: "Set the leave hours and minutes",
    hoursField: "Hours", minutesField: "Minutes", leavePreview: "Time lost to leave: {time}",
    partialLeaveBadge: "Leave {time}", fullLeaveBadge: "Full-day leave",
    recordLeaveLost: "Leave Time Lost", recordAttendance: "Attendance to Date", recordExpected: "Expected Hours to Date",
    recordCompanyHoliday: "Company Holidays", recordCompWork: "Compensatory Work Completed", recordTimeBalance: "Time Balance",
    monthlyLeaveText: "Leave {leave} · Comp {comp}", attendanceStatistics: "ATTENDANCE STATISTICS", attendanceAndBalance: "Attendance & Time Balance",
    finalActualHours: "Actual Work Time", finalLeaveTime: "Leave Time", finalCompanyHolidays: "Company Holidays", finalCompWork: "Compensatory Work", finalAttendance: "Attendance",
    scheduledWorkday: "Scheduled workday", actualWorkCompletion: "Actual Work Completion", scheduleJourneyProgress: "Journey Progress",
    companyHolidayShort: "Company off", compWorkShort: "Comp work", leaveShortWithTime: "Leave {time}",
    attendancePerfect: "On track · actual time matches the expected time to date", attendanceWithLeave: "Leave has reduced work time by {time}",
    noLeaveTime: "No leave time lost yet", daysRecordedTotal: "{days} days recorded in total",
    leaveValidation: "Set leave duration between 1 minute and the full scheduled work time",
    scheduleRemainingHours: "Actual working hours remaining in the calendar", workdaysActuallyWorked: "Days with actual work",
    calendarInstruction: "Click a date to mark a company holiday, personal leave, or compensatory workday"
  });


  // V5 — Multi-user setup, privacy, backup and public deployment
  Object.assign(translations.th, {
    welcomeTitle: "ยินดีต้อนรับสู่ Workday Journey", welcomeSubtitle: "สร้าง Journey ของคุณเอง ข้อมูลจะเก็บใน Browser เป็นค่าเริ่มต้น และสามารถ Login เพื่อ Sync ข้ามอุปกรณ์ได้",
    setupProfile: "โปรไฟล์", setupJourney: "ช่วงเวลา", setupSchedule: "ตารางทำงาน", setupCalendar: "\u0e1b\u0e0f\u0e34\u0e17\u0e34\u0e19", yourName: "ชื่อ / ชื่อเล่น", optional: "ไม่บังคับ",
    timezone: "เขตเวลา", locale: "รูปแบบวันที่และตัวเลข", next: "ถัดไป", back: "ย้อนกลับ", startJourney: "เริ่ม Journey", saveChanges: "บันทึกการเปลี่ยนแปลง",
    useRecommended: "ใช้ค่าแนะนำ", startDateSetup: "วันเริ่มต้น", endDateSetup: "วันสิ้นสุด", workingDaysSetup: "วันทำงานประจำ",
    workStartSetup: "เวลาเริ่มงาน", workEndSetup: "เวลาเลิกงาน", breaksSetup: "ช่วงพัก", enableBreak: "ใช้งาน", setupValidationDates: "วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น",
    setupValidationTime: "เวลาเลิกงานต้องมากกว่าเวลาเริ่มงาน และต้องมีเวลาทำงานจริง", setupValidationDays: "กรุณาเลือกวันทำงานอย่างน้อย 1 วัน",
    dateInputHelp: "พิมพ์วันที่เอง หรือกดปฏิทินเพื่อเลือก", dateInputFormat: "รูปแบบ",
    setupCalendarHelp: "\u0e01\u0e33\u0e2b\u0e19\u0e14\u0e27\u0e31\u0e19\u0e2b\u0e22\u0e38\u0e14\u0e1a\u0e23\u0e34\u0e29\u0e31\u0e17 \u0e27\u0e31\u0e19\u0e25\u0e32 \u0e41\u0e25\u0e30\u0e27\u0e31\u0e19\u0e17\u0e33\u0e07\u0e32\u0e19\u0e0a\u0e14\u0e40\u0e0a\u0e22\u0e01\u0e48\u0e2d\u0e19\u0e40\u0e23\u0e34\u0e48\u0e21 Journey",
    defaultCompanyHolidays: "\u0e27\u0e31\u0e19\u0e2b\u0e22\u0e38\u0e14\u0e1a\u0e23\u0e34\u0e29\u0e31\u0e17\u0e04\u0e48\u0e32\u0e40\u0e23\u0e34\u0e48\u0e21\u0e15\u0e49\u0e19", defaultCompanyHolidaysHelp: "\u0e43\u0e2a\u0e48\u0e43\u0e2b\u0e49\u0e41\u0e25\u0e49\u0e27\u0e15\u0e32\u0e21\u0e1b\u0e0f\u0e34\u0e17\u0e34\u0e19\u0e1a\u0e23\u0e34\u0e29\u0e31\u0e17 \u0e04\u0e38\u0e13\u0e2a\u0e32\u0e21\u0e32\u0e23\u0e16\u0e25\u0e1a\u0e2b\u0e23\u0e37\u0e2d\u0e40\u0e1e\u0e34\u0e48\u0e21\u0e27\u0e31\u0e19\u0e2d\u0e37\u0e48\u0e19\u0e44\u0e14\u0e49\u0e01\u0e48\u0e2d\u0e19\u0e40\u0e23\u0e34\u0e48\u0e21\u0e43\u0e0a\u0e49\u0e07\u0e32\u0e19",
    restoreDefaultHolidays: "\u0e43\u0e0a\u0e49\u0e27\u0e31\u0e19\u0e2b\u0e22\u0e38\u0e14\u0e04\u0e48\u0e32\u0e40\u0e23\u0e34\u0e48\u0e21\u0e15\u0e49\u0e19", setupCalendarClickHelp: "\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e1b\u0e23\u0e30\u0e40\u0e20\u0e17\u0e27\u0e31\u0e19\u0e14\u0e49\u0e32\u0e19\u0e1a\u0e19 \u0e41\u0e25\u0e49\u0e27\u0e04\u0e25\u0e34\u0e01\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48\u0e43\u0e19\u0e1b\u0e0f\u0e34\u0e17\u0e34\u0e19 \u0e16\u0e49\u0e32\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e49\u0e32\u0e07\u0e2a\u0e16\u0e32\u0e19\u0e30\u0e43\u0e2b\u0e49\u0e40\u0e25\u0e37\u0e2d\u0e01 \u0e15\u0e32\u0e23\u0e32\u0e07\u0e1b\u0e01\u0e15\u0e34",
    calendarSetupSummaryTitle: "\u0e2a\u0e23\u0e38\u0e1b\u0e1b\u0e0f\u0e34\u0e17\u0e34\u0e19", calendarSetupSummary: "\u0e2b\u0e22\u0e38\u0e14\u0e1a\u0e23\u0e34\u0e29\u0e31\u0e17 {holiday} \u0e27\u0e31\u0e19 \u00b7 \u0e25\u0e32 {leave} \u0e27\u0e31\u0e19 \u00b7 \u0e0a\u0e14\u0e40\u0e0a\u0e22 {work} \u0e27\u0e31\u0e19", setupCalendarEditLater: "\u0e2a\u0e32\u0e21\u0e32\u0e23\u0e16\u0e41\u0e01\u0e49\u0e44\u0e02\u0e27\u0e31\u0e19\u0e40\u0e2b\u0e25\u0e48\u0e32\u0e19\u0e35\u0e49\u0e44\u0e14\u0e49\u0e20\u0e32\u0e22\u0e2b\u0e25\u0e31\u0e07\u0e08\u0e32\u0e01\u0e1b\u0e0f\u0e34\u0e17\u0e34\u0e19\u0e2b\u0e25\u0e31\u0e01\u0e43\u0e19 Dashboard",
    profileAndJourney: "โปรไฟล์และ Journey", editJourney: "แก้ไข Journey", privacyMode: "โหมดการแสดงผล", personalMode: "Personal", demoMode: "Public Demo",
    privacyModeHelp: "Demo Mode จะซ่อนชื่อและหมายเหตุส่วนตัว เหมาะสำหรับแชร์หน้าจอหรือ Portfolio", dataAndBackup: "ข้อมูลและ Backup",
    exportBackup: "Export Backup", importBackup: "Import Backup", startNewJourney: "เริ่ม Journey ใหม่", resetAllData: "ล้างข้อมูลทั้งหมด", resetAllConfirm: "ต้องการล้างข้อมูล Workday Journey ทั้งหมดใน Browser นี้หรือไม่?",
    newJourneyConfirm: "ต้องการเริ่ม Journey ใหม่หรือไม่? Calendar, Achievement และข้อมูล Journey ปัจจุบันจะถูกล้าง แต่ Theme/Font จะยังอยู่",
    importConfirm: "นำเข้า Backup นี้และแทนที่ข้อมูล Workday Journey ปัจจุบันหรือไม่?", invalidBackup: "ไฟล์ Backup ไม่ถูกต้อง", backupCreated: "สร้าง Backup เรียบร้อยแล้ว", backupImported: "นำเข้า Backup สำเร็จแล้ว",
    privacyNoticeTitle: "ความเป็นส่วนตัว", privacyNotice: "ข้อมูลเก็บใน Browser เป็นค่าเริ่มต้น หาก Login ระบบจะ Sync ข้อมูลของบัญชีคุณผ่าน Supabase Cloud",
    shareSummary: "แชร์สรุป", shareCopied: "คัดลอกสรุป Journey แล้ว", shareTitle: "Workday Journey Summary", demoJourneyName: "Public Demo Journey", myJourney: "My Journey",
    versionLabel: "เวอร์ชัน", updateAvailable: "มีเวอร์ชันใหม่พร้อมใช้งาน", updateHelp: "Refresh เพื่อโหลดไฟล์ล่าสุดจาก Deployment", refreshNow: "Refresh ตอนนี้",
    profileSummary: "สรุปโปรไฟล์", workdaysLabelShort: "วันทำงาน", noName: "ยังไม่ได้ตั้งชื่อ", timezoneChanged: "เปลี่ยนเขตเวลาแล้ว", localeChanged: "เปลี่ยนรูปแบบวันที่แล้ว",
    setupPrivacy: "ข้อมูลเก็บใน Browser เป็นค่าเริ่มต้น และแยกจากผู้ใช้อื่น หาก Login สามารถ Sync ข้อมูลของบัญชีข้ามอุปกรณ์ได้", monday:"จ", tuesday:"อ", wednesday:"พ", thursday:"พฤ", friday:"ศ", saturday:"ส", sunday:"อา",
    fullDayLeaveHelp: "ลาตามเวลาทำงานเต็มวัน", halfDayLeaveHelp: "ลาครึ่งหนึ่งของเวลาทำงาน", normalScheduleHelp: "ใช้วันทำงานตามที่ตั้งไว้ใน Journey",
    recordEquivalentDays: "เทียบเท่าวันทำงานเต็ม", footerText: "Workday Journey V8.5.0 · Navigation Refresh · Reward Codes · Smart Cloud Sync · Local-first",
    heroWorking: "วันนี้กำลังเดินหน้าไปเรื่อย ๆ ทำงานให้ครบเวลาตามตารางกันครับ", heroFinished: "ภารกิจวันนี้ครบแล้ว ทำเวลางานตามตารางสำเร็จครับ",
    notifyDoneBody: "เวลาทำงานตามตารางของวันนี้ครบแล้ว", completionMessageDynamic: "Journey ตั้งแต่ {start} ถึง {end} ครบเรียบร้อยแล้ว",
    weekendStatus: "วันหยุดประจำ", heroWeekend: "วันนี้ไม่อยู่ในวันทำงานประจำ ระบบจะไม่นับเวลาทำงาน", statusWeekend: "วันหยุดประจำ", dayOffLabel: "วันหยุดประจำ"
  });
  Object.assign(translations.en, {
    welcomeTitle: "Welcome to Workday Journey", welcomeSubtitle: "Create your own journey. Data stays local by default, with optional account-based Cloud Sync.",
    setupProfile: "Profile", setupJourney: "Journey", setupSchedule: "Schedule", setupCalendar: "Calendar", yourName: "Name / Nickname", optional: "Optional",
    timezone: "Timezone", locale: "Date & number format", next: "Next", back: "Back", startJourney: "Start My Journey", saveChanges: "Save Changes",
    useRecommended: "Use Recommended Defaults", startDateSetup: "Start Date", endDateSetup: "End Date", workingDaysSetup: "Regular Working Days",
    workStartSetup: "Work Start", workEndSetup: "Work End", breaksSetup: "Breaks", enableBreak: "Enabled", setupValidationDates: "End date must not be before the start date",
    setupValidationTime: "Finish time must be after start time and leave some actual working time", setupValidationDays: "Select at least one regular working day",
    dateInputHelp: "Type the date or choose it from the calendar", dateInputFormat: "Format",
    setupCalendarHelp: "Set company holidays, personal leave and compensatory workdays before starting your journey.",
    defaultCompanyHolidays: "Default Company Holidays", defaultCompanyHolidaysHelp: "These company dates are preloaded. You can remove them or add other dates before starting.",
    restoreDefaultHolidays: "Restore Default Holidays", setupCalendarClickHelp: "Choose a day type above, then click dates in the calendar. Choose Normal Schedule to clear a special date.",
    calendarSetupSummaryTitle: "Calendar Summary", calendarSetupSummary: "Company holidays {holiday} days \u00b7 Leave {leave} days \u00b7 Compensatory {work} days", setupCalendarEditLater: "You can edit these dates later from the main Dashboard calendar.",
    profileAndJourney: "Profile & Journey", editJourney: "Edit Journey", privacyMode: "Display Mode", personalMode: "Personal", demoMode: "Public Demo",
    privacyModeHelp: "Demo Mode hides your name and private notes for screen sharing or a portfolio", dataAndBackup: "Data & Backup",
    exportBackup: "Export Backup", importBackup: "Import Backup", startNewJourney: "Start New Journey", resetAllData: "Reset All Data", resetAllConfirm: "Reset all Workday Journey data stored in this browser?",
    newJourneyConfirm: "Start a new journey? Calendar, achievements and current journey data will be cleared, while appearance settings stay.",
    importConfirm: "Import this backup and replace the current Workday Journey data?", invalidBackup: "Invalid backup file", backupCreated: "Backup created", backupImported: "Backup imported",
    privacyNoticeTitle: "Privacy", privacyNotice: "Data stays local by default. When you sign in, your account data can sync through Supabase Cloud.",
    shareSummary: "Share Summary", shareCopied: "Journey summary copied", shareTitle: "Workday Journey Summary", demoJourneyName: "Public Demo Journey", myJourney: "My Journey",
    versionLabel: "Version", updateAvailable: "A new version is available", updateHelp: "Refresh to load the latest deployed files", refreshNow: "Refresh Now",
    profileSummary: "Profile Summary", workdaysLabelShort: "Working days", noName: "No name set", timezoneChanged: "Timezone updated", localeChanged: "Locale updated",
    setupPrivacy: "Data stays local by default and separate from other users. Sign in if you want to sync your account across devices.", monday:"Mon", tuesday:"Tue", wednesday:"Wed", thursday:"Thu", friday:"Fri", saturday:"Sat", sunday:"Sun",
    fullDayLeaveHelp: "Leave for the full scheduled work time", halfDayLeaveHelp: "Leave for half of the scheduled work time", normalScheduleHelp: "Use the regular working days configured for this journey",
    recordEquivalentDays: "Equivalent full workdays", footerText: "Workday Journey V8.5.0 · Navigation Refresh · Reward Codes · Smart Cloud Sync · Local-first",
    heroWorking: "The day is moving forward. Keep going toward your scheduled work time.", heroFinished: "Today's scheduled working time is complete.",
    notifyDoneBody: "You have completed today's scheduled working time", completionMessageDynamic: "Your journey from {start} to {end} is complete",
    weekendStatus: "Day Off", heroWeekend: "Today is not one of your regular working days, so no work time is counted", statusWeekend: "Day Off", dayOffLabel: "Day Off"
  });


  // V8.3 — Work Bank, Work Coins, Missions & Reward Shop
  Object.assign(translations.th, {
    p25Title: "25% Complete", p25Desc: "เดินทางผ่านหนึ่งในสี่ของ Journey แล้ว",
    p90Title: "90% Complete", p90Desc: "เหลืออีกเพียงช่วงสุดท้ายก่อนจบ Journey",
    h900Title: "900 Hours", h900Desc: "สะสมเวลาทำงานครบ 900 ชั่วโมง",
    firstProjectTitle: "Project แรก", firstProjectDesc: "สร้าง Project แรกใน Project Tracker",
    projects3Title: "Project Collector", projects3Desc: "สร้าง Project อย่างน้อย 3 รายการ",
    projectFinisherTitle: "Project Finisher", projectFinisherDesc: "ทำ Project แรกให้ Progress ครบ 100%",
    projects3CompleteTitle: "Triple Finisher", projects3CompleteDesc: "ทำ Project ให้ครบ 100% จำนวน 3 รายการ",
    firstJournalTitle: "First Entry", firstJournalDesc: "เขียน Daily Work Journal ครั้งแรก",
    journals7Title: "7 Entries", journals7Desc: "บันทึก Daily Journal ครบ 7 ครั้ง",
    journals30Title: "Journal Keeper", journals30Desc: "บันทึก Daily Journal ครบ 30 ครั้ง",
    journals60Title: "Chronicle Master", journals60Desc: "บันทึก Daily Journal ครบ 60 ครั้ง",
    streak5Title: "5-Day Streak", streak5Desc: "ทำงานต่อเนื่อง 5 วันทำงานโดยไม่ลา",
    streak10Title: "10-Day Streak", streak10Desc: "ทำงานต่อเนื่อง 10 วันทำงานโดยไม่ลา",
    streak20Title: "Unbroken 20", streak20Desc: "ทำงานต่อเนื่อง 20 วันทำงานโดยไม่ลา",
    streak30Title: "30-Day Vanguard", streak30Desc: "ทำงานต่อเนื่อง 30 วันทำงานโดยไม่ลา",
    perfectMonthTitle: "Perfect Month", perfectMonthDesc: "ทำงานครบทุกวันทำงานที่กำหนดในเดือนหนึ่งของ Journey โดยไม่มี Personal Leave",
    reportExplorerTitle: "Report Explorer", reportExplorerDesc: "เปิดดู Reports & Analytics เป็นครั้งแรก",
    backupGuardianTitle: "Backup Guardian", backupGuardianDesc: "ส่งออก Backup ของ Journey ครั้งแรก",
    calendarArchitectTitle: "Calendar Architect", calendarArchitectDesc: "บันทึกหรือนำเข้า Calendar Preset ครั้งแรก",
    snapshotCreatorTitle: "Snapshot Creator", snapshotCreatorDesc: "สร้าง Journey Snapshot ครั้งแรก",
    bankFirstDepositTitle: "First Deposit", bankFirstDepositDesc: "ฝาก Work Coins เข้า Work Bank เป็นครั้งแรก",
    bankSmartSaverTitle: "Smart Saver", bankSmartSaverDesc: "มียอด Savings แตะ 500 Coins",
    bankProSaverTitle: "Pro Saver", bankProSaverDesc: "มียอด Savings แตะ 1,500 Coins",
    bankEliteSaverTitle: "Elite Saver", bankEliteSaverDesc: "มียอด Savings แตะ 5,000 Coins",
    bankSavingHabitTitle: "Saving Habit", bankSavingHabitDesc: "รักษา Savings Streak ครบ 3 วัน",
    bankSavingMasterTitle: "Saving Master", bankSavingMasterDesc: "รักษา Savings Streak ครบ 7 วัน",
    bankDiamondSaverTitle: "Diamond Saver", bankDiamondSaverDesc: "รักษา Savings Streak ครบ 14 วัน",
    bankCompoundInvestorTitle: "Compound Investor", bankCompoundInvestorDesc: "รับดอกเบี้ยจาก Work Bank สะสมครบ 100 Coins",
    exchangeFirstTradeTitle: "First Trade", exchangeFirstTradeDesc: "ซื้อหรือขายหุ้นจำลองใน Work Exchange ครั้งแรก",
    exchangeAcademyGraduateTitle: "Academy Graduate", exchangeAcademyGraduateDesc: "เรียน Trading Academy ครบทั้ง 7 บท",
    exchangeInvestorTitle: "Investor", exchangeInvestorDesc: "ถือหุ้นพร้อมกันอย่างน้อย 3 บริษัท",
    exchangeGreenPortfolioTitle: "Green Portfolio", exchangeGreenPortfolioDesc: "ทำให้ Portfolio มีกำไรรวมเป็นบวก",
    exchangeMarketWinnerTitle: "Market Winner", exchangeMarketWinnerDesc: "ทำกำไรรวมใน Work Exchange แตะ 100 Coins",
    exchangeDiamondHandsTitle: "Diamond Hands", exchangeDiamondHandsDesc: "ถือหุ้นตัวเดิมต่อเนื่องอย่างน้อย 5 วัน",
    exchangeMasterTitle: "Exchange Master", exchangeMasterDesc: "ทำ Portfolio Value แตะ 2,500 Coins",
    vaultFirstUploadTitle: "First Upload", vaultFirstUploadDesc: "อัปโหลดไฟล์ Project เข้า File Vault ครั้งแรก",
    vaultArchivistTitle: "Project Archivist", vaultArchivistDesc: "เก็บไฟล์หลักอย่างน้อย 5 ไฟล์ไว้ใน Project เดียว",
    vaultVersionKeeperTitle: "Version Keeper", vaultVersionKeeperDesc: "อัปโหลด Version ใหม่ของไฟล์ Project ครั้งแรก",
    projectsShort: "โปรเจกต์", entriesShort: "บันทึก", actionsShort: "ครั้ง", monthsShort: "เดือน",
    challengeUnlockedMeta: "Challenge ใหม่สำเร็จแล้ว และรางวัลถูกเพิ่มเข้า Trophy Room"
  });
  Object.assign(translations.en, {
    p25Title: "25% Complete", p25Desc: "Reached one quarter of the journey",
    p90Title: "90% Complete", p90Desc: "Entered the final stretch of the journey",
    h900Title: "900 Hours", h900Desc: "Completed 900 working hours",
    firstProjectTitle: "First Project", firstProjectDesc: "Created your first project in Project Tracker",
    projects3Title: "Project Collector", projects3Desc: "Created at least 3 projects",
    projectFinisherTitle: "Project Finisher", projectFinisherDesc: "Completed your first project at 100% progress",
    projects3CompleteTitle: "Triple Finisher", projects3CompleteDesc: "Completed 3 projects at 100% progress",
    firstJournalTitle: "First Entry", firstJournalDesc: "Wrote your first Daily Work Journal entry",
    journals7Title: "7 Entries", journals7Desc: "Wrote 7 Daily Journal entries",
    journals30Title: "Journal Keeper", journals30Desc: "Wrote 30 Daily Journal entries",
    journals60Title: "Chronicle Master", journals60Desc: "Wrote 60 Daily Journal entries",
    streak5Title: "5-Day Streak", streak5Desc: "Completed 5 consecutive working days without personal leave",
    streak10Title: "10-Day Streak", streak10Desc: "Completed 10 consecutive working days without personal leave",
    streak20Title: "Unbroken 20", streak20Desc: "Completed 20 consecutive working days without personal leave",
    streak30Title: "30-Day Vanguard", streak30Desc: "Completed 30 consecutive working days without personal leave",
    perfectMonthTitle: "Perfect Month", perfectMonthDesc: "Completed every scheduled workday in one Journey month period without personal leave",
    reportExplorerTitle: "Report Explorer", reportExplorerDesc: "Opened Reports & Analytics for the first time",
    backupGuardianTitle: "Backup Guardian", backupGuardianDesc: "Exported your first Journey backup",
    calendarArchitectTitle: "Calendar Architect", calendarArchitectDesc: "Saved or imported your first Calendar Preset",
    snapshotCreatorTitle: "Snapshot Creator", snapshotCreatorDesc: "Created your first Journey Snapshot",
    bankFirstDepositTitle: "First Deposit", bankFirstDepositDesc: "Made your first Work Bank deposit",
    bankSmartSaverTitle: "Smart Saver", bankSmartSaverDesc: "Reached 500 Coins in Savings",
    bankProSaverTitle: "Pro Saver", bankProSaverDesc: "Reached 1,500 Coins in Savings",
    bankEliteSaverTitle: "Elite Saver", bankEliteSaverDesc: "Reached 5,000 Coins in Savings",
    bankSavingHabitTitle: "Saving Habit", bankSavingHabitDesc: "Maintained a 3-day Savings Streak",
    bankSavingMasterTitle: "Saving Master", bankSavingMasterDesc: "Maintained a 7-day Savings Streak",
    bankDiamondSaverTitle: "Diamond Saver", bankDiamondSaverDesc: "Maintained a 14-day Savings Streak",
    bankCompoundInvestorTitle: "Compound Investor", bankCompoundInvestorDesc: "Earned 100 cumulative Coins from Work Bank interest",
    exchangeFirstTradeTitle: "First Trade", exchangeFirstTradeDesc: "Completed your first simulated Work Exchange trade",
    exchangeAcademyGraduateTitle: "Academy Graduate", exchangeAcademyGraduateDesc: "Completed all 7 Trading Academy lessons",
    exchangeInvestorTitle: "Investor", exchangeInvestorDesc: "Held at least 3 companies at the same time",
    exchangeGreenPortfolioTitle: "Green Portfolio", exchangeGreenPortfolioDesc: "Reached a positive total portfolio P/L",
    exchangeMarketWinnerTitle: "Market Winner", exchangeMarketWinnerDesc: "Reached 100 Coins of total Work Exchange P/L",
    exchangeDiamondHandsTitle: "Diamond Hands", exchangeDiamondHandsDesc: "Held the same stock for at least 5 days",
    exchangeMasterTitle: "Exchange Master", exchangeMasterDesc: "Reached a 2,500 Coin portfolio value",
    vaultFirstUploadTitle: "First Upload", vaultFirstUploadDesc: "Uploaded your first Project File Vault file",
    vaultArchivistTitle: "Project Archivist", vaultArchivistDesc: "Stored at least 5 logical files in one project",
    vaultVersionKeeperTitle: "Version Keeper", vaultVersionKeeperDesc: "Uploaded a new version of a project file",
    projectsShort: "projects", entriesShort: "entries", actionsShort: "times", monthsShort: "months",
    challengeUnlockedMeta: "A new challenge is complete and its reward has been added to your Trophy Room"
  });


  const FONT_MAP = {
    sarabun: '"Sarabun Local", "Sarabun", "Noto Sans Thai", "Leelawadee UI", Tahoma, "Segoe UI", sans-serif',
    bai: '"Bai Jamjuree", "Sarabun", "Noto Sans Thai", sans-serif',
    noto: '"Noto Sans Thai", "Sarabun", "Leelawadee UI", Tahoma, sans-serif',
    ibm: '"IBM Plex Sans Thai", "Sarabun", "Leelawadee UI", Tahoma, sans-serif',
    leelawadee: '"Leelawadee UI", Tahoma, "Segoe UI", sans-serif',
    tahoma: 'Tahoma, "Segoe UI", sans-serif',
    system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    prompt: '"Prompt", "Sarabun", "Noto Sans Thai", sans-serif',
    kanit: '"Kanit", "Sarabun", "Noto Sans Thai", sans-serif',
    mitr: '"Mitr", "Sarabun", "Noto Sans Thai", sans-serif',
    anakotmai: '"Anakotmai", "Sarabun", "Noto Sans Thai", sans-serif',
    athiti: '"Athiti", "Sarabun", "Noto Sans Thai", sans-serif',
    trirong: '"Trirong", Georgia, "Times New Roman", serif',
    itim: '"Itim", "Sarabun", "Noto Sans Thai", cursive',
    pattaya: '"Pattaya", "Sarabun", "Noto Sans Thai", cursive',
    chonburi: '"Chonburi", "Sarabun", "Noto Sans Thai", serif'
  };
  const FONT_SCALE_MAP = { small: .90, medium: 1, large: 1.18 };

  const urlDemoMode = (() => { try { return new URLSearchParams(location.search).get("demo") === "1"; } catch { return false; } })();
  const state = {
    language: localStorage.getItem("wp-language") || (CONFIG.locale.startsWith("th") ? "th" : "en"),
    fontFamily: localStorage.getItem("wp-font-family") || "sarabun",
    fontSize: localStorage.getItem("wp-font-size") || "medium",
    theme: localStorage.getItem("wp-theme") || "light",
    clockFormat: localStorage.getItem("wp-clock-format") || "24",
    showSeconds: localStorage.getItem("wp-show-seconds") !== "false",
    animations: localStorage.getItem("wp-animations") !== "false",
    density: localStorage.getItem("wp-density") || "comfortable",
    dayOverrides: safeParse(localStorage.getItem("wp-day-overrides"), {}),
    calendarDate: startOfMonth(getConfiguredNow()),
    selectedDate: null,
    selectedDayType: "default",
    selectedLeaveMode: "full",
    selectedLeaveMinutes: CONFIG.totalWorkMinutes,
    latestStats: null,
    latestAchievements: [],
    completionConfettiPlayed: false,
    dynamicMood: localStorage.getItem("wp-dynamic-mood") !== "false",
    notificationsEnabled: localStorage.getItem("wp-notifications-enabled") === "true",
    timeMachineAuto: true,
    timeMachineDate: null,
    timeMachineMinute: parseTime(CONFIG.workdayStart),
    deferredInstallPrompt: null,
    timezone: localStorage.getItem("wp-timezone") || CONFIG.timezone,
    locale: localStorage.getItem("wp-locale") || CONFIG.locale,
    privacyMode: urlDemoMode ? "demo" : (localStorage.getItem("wp-privacy-mode") || "personal"),
    setupCompleted: localStorage.getItem("wp-setup-completed") === "true",
    setupStep: 1,
    setupMode: "first",
    setupOriginalLanguage: "th",
    setupDayOverrides: {},
    setupCalendarDate: startOfMonth(parseConfigDate(DEFAULT_JOURNEY_CONFIG.startDate, new Date())),
    setupCalendarType: "holiday",
    setupCalendarLeaveMode: "full",
    pendingServiceWorker: null,
    refreshForUpdate: false
  };

  const $ = id => document.getElementById(id);
  const els = {
    greeting: $("greeting"), todaySpecialBadge: $("todaySpecialBadge"), todayLongDate: $("todayLongDate"), heroMessage: $("heroMessage"), clockTime: $("clockTime"), clockDate: $("clockDate"),
    dailyProgressRing: $("dailyProgressRing"), dailyPercent: $("dailyPercent"), statusBadge: $("statusBadge"), workedTime: $("workedTime"), remainingTime: $("remainingTime"), nextBreakValue: $("nextBreakValue"),
    milestoneText: $("milestoneText"), milestoneDots: $("milestoneDots"), liveCountdownTitle: $("liveCountdownTitle"), liveCountdownIcon: $("liveCountdownIcon"), liveCountdownTime: $("liveCountdownTime"),
    liveCountdownHint: $("liveCountdownHint"), liveCountdownBar: $("liveCountdownBar"), timelineTrack: $("timelineTrack"), timelineLabels: $("timelineLabels"), scheduleList: $("scheduleList"),
    internshipPercentBadge: $("internshipPercentBadge"), internshipProgressBar: $("internshipProgressBar"), workdayCounter: $("workdayCounter"), daysLeft: $("daysLeft"), hoursLeft: $("hoursLeft"),
    internshipStartLabel: $("internshipStartLabel"), internshipEndLabel: $("internshipEndLabel"), weekPercentBadge: $("weekPercentBadge"), weeklyProgressList: $("weeklyProgressList"), weeklyHoursTotal: $("weeklyHoursTotal"), weeklySummary: $("weeklySummary"),
    calendarDaysLeft: $("calendarDaysLeft"), countdownWorkdays: $("countdownWorkdays"), countdownHours: $("countdownHours"), countdownSentence: $("countdownSentence"),
    totalWorkTime: $("totalWorkTime"), totalWorkMinutes: $("totalWorkMinutes"), workdaysReached: $("workdaysReached"), fullDaysCompleted: $("fullDaysCompleted"), achievementCount: $("achievementCount"), achievementLatest: $("achievementLatest"),
    leaveTimeLost: $("leaveTimeLost"), leaveDaysDetail: $("leaveDaysDetail"), companyHolidayCount: $("companyHolidayCount"), companyHolidayDetail: $("companyHolidayDetail"), compWorkTime: $("compWorkTime"), compWorkDetail: $("compWorkDetail"), attendancePercent: $("attendancePercent"), attendanceDetail: $("attendanceDetail"), attendancePercentBadge: $("attendancePercentBadge"), expectedByToday: $("expectedByToday"), actualByToday: $("actualByToday"), timeBalanceLeave: $("timeBalanceLeave"), timeBalanceValue: $("timeBalanceValue"), timeBalanceMessage: $("timeBalanceMessage"), timeBalanceFill: $("timeBalanceFill"),
    currentStreak: $("currentStreak"), longestStreak: $("longestStreak"), nextMilestoneTitle: $("nextMilestoneTitle"), nextMilestoneRemaining: $("nextMilestoneRemaining"), nextMilestoneFill: $("nextMilestoneFill"), nextMilestonePercent: $("nextMilestonePercent"),
    journeyWeekBadge: $("journeyWeekBadge"), journeyLineFill: $("journeyLineFill"), journeyNowMarker: $("journeyNowMarker"), journeyMarkers: $("journeyMarkers"), plannedHoursInline: $("plannedHoursInline"), weeksSinceStart: $("weeksSinceStart"), daysSinceStart: $("daysSinceStart"),
    calendarMonthTitle: $("calendarMonthTitle"), calendarWeekdays: $("calendarWeekdays"), calendarGrid: $("calendarGrid"), calendarPrev: $("calendarPrev"), calendarToday: $("calendarToday"), calendarNext: $("calendarNext"),
    lastUpdated: $("lastUpdated"), themeToggle: $("themeToggle"), settingsOpen: $("settingsOpen"), settingsBackdrop: $("settingsBackdrop"), settingsPanel: $("settingsPanel"), settingsClose: $("settingsClose"),
    fontFamilySelect: $("fontFamilySelect"), fontSizeSelect: $("fontSizeSelect"), themeSelect: $("themeSelect"), clockFormatSelect: $("clockFormatSelect"), densitySelect: $("densitySelect"), showSecondsToggle: $("showSecondsToggle"), animationToggle: $("animationToggle"), resetSettings: $("resetSettings"),
    dayModalBackdrop: $("dayModalBackdrop"), dayModal: $("dayModal"), dayModalTitle: $("dayModalTitle"), dayModalDescription: $("dayModalDescription"), dayModalClose: $("dayModalClose"), dayModalCancel: $("dayModalCancel"), dayModalSave: $("dayModalSave"), dayNoteInput: $("dayNoteInput"),
    leaveDetailsPanel: $("leaveDetailsPanel"), leaveHoursInput: $("leaveHoursInput"), leaveMinutesInput: $("leaveMinutesInput"), leaveDurationPreview: $("leaveDurationPreview"),
    statsOpen: $("statsOpen"), statsModalBackdrop: $("statsModalBackdrop"), statsModal: $("statsModal"), statsModalClose: $("statsModalClose"), statsTotalWorkTime: $("statsTotalWorkTime"), statsTotalMinutes: $("statsTotalMinutes"), recordsGrid: $("recordsGrid"), monthlyStatsList: $("monthlyStatsList"), mostActiveMonth: $("mostActiveMonth"), achievementsGrid: $("achievementsGrid"), statsAchievementCount: $("statsAchievementCount"),
    statsAttendanceGrid: $("statsAttendanceGrid"), statsBalanceMessage: $("statsBalanceMessage"),
    achievementModalBackdrop: $("achievementModalBackdrop"), achievementModal: $("achievementModal"), achievementModalIcon: $("achievementModalIcon"), achievementModalTitle: $("achievementModalTitle"), achievementModalDescription: $("achievementModalDescription"), achievementModalMeta: $("achievementModalMeta"), achievementModalClose: $("achievementModalClose"),
    completionBanner: $("completionBanner"), completionOpen: $("completionOpen"), completionModalBackdrop: $("completionModalBackdrop"), completionModal: $("completionModal"), completionModalClose: $("completionModalClose"), completionTotalHours: $("completionTotalHours"), completionWorkdays: $("completionWorkdays"), completionWeeks: $("completionWeeks"), completionAchievementText: $("completionAchievementText"), confettiLayer: $("confettiLayer"),
    completionLeaveTime: $("completionLeaveTime"), completionHolidayCount: $("completionHolidayCount"), completionCompTime: $("completionCompTime"), completionAttendance: $("completionAttendance"),
    onlineStatus: $("onlineStatus"), installAppBtn: $("installAppBtn"), settingsInstallBtn: $("settingsInstallBtn"), snapshotBtn: $("snapshotBtn"), statsSnapshotBtn: $("statsSnapshotBtn"), completionSnapshotBtn: $("completionSnapshotBtn"),
    nextMilestoneExpected: $("nextMilestoneExpected"), milestoneForecastList: $("milestoneForecastList"), timeMachineNow: $("timeMachineNow"), timeMachineDateInput: $("timeMachineDate"), timeMachineRange: $("timeMachineRange"), timeMachineClock: $("timeMachineClock"), timeMachinePercent: $("timeMachinePercent"), timeMachineStatus: $("timeMachineStatus"), timeMachineFill: $("timeMachineFill"), timeMachineSummary: $("timeMachineSummary"),
    heatmapMonths: $("heatmapMonths"), storyProgressBadge: $("storyProgressBadge"), journeyStoryList: $("journeyStoryList"), dynamicMoodToggle: $("dynamicMoodToggle"), notificationToggle: $("notificationToggle"), toastStack: $("toastStack"),
    setupBackdrop: $("setupBackdrop"), setupModal: $("setupModal"), setupNameInput: $("setupNameInput"), setupLanguageSelect: $("setupLanguageSelect"), setupTimezoneSelect: $("setupTimezoneSelect"), setupLocaleSelect: $("setupLocaleSelect"), setupStartDate: $("setupStartDate"), setupEndDate: $("setupEndDate"), setupStartDatePicker: $("setupStartDatePicker"), setupEndDatePicker: $("setupEndDatePicker"), setupStartDatePickerBtn: $("setupStartDatePickerBtn"), setupEndDatePickerBtn: $("setupEndDatePickerBtn"), setupStartDateFormat: $("setupStartDateFormat"), setupEndDateFormat: $("setupEndDateFormat"), setupWorkStart: $("setupWorkStart"), setupWorkEnd: $("setupWorkEnd"), setupSchedulePreview: $("setupSchedulePreview"), setupError: $("setupError"), setupCancelBtn: $("setupCancelBtn"), setupBackBtn: $("setupBackBtn"), setupNextBtn: $("setupNextBtn"), setupSaveBtn: $("setupSaveBtn"), setupDefaultsBtn: $("setupDefaultsBtn"), setupHolidayChips: $("setupHolidayChips"), setupRestoreHolidaysBtn: $("setupRestoreHolidaysBtn"), setupCalendarLeavePanel: $("setupCalendarLeavePanel"), setupCalendarLeaveMode: $("setupCalendarLeaveMode"), setupCalendarCustomLeave: $("setupCalendarCustomLeave"), setupCalendarLeaveHours: $("setupCalendarLeaveHours"), setupCalendarLeaveMinutes: $("setupCalendarLeaveMinutes"), setupCalendarPrev: $("setupCalendarPrev"), setupCalendarNext: $("setupCalendarNext"), setupCalendarMonthTitle: $("setupCalendarMonthTitle"), setupCalendarWeekdays: $("setupCalendarWeekdays"), setupCalendarGrid: $("setupCalendarGrid"), setupCalendarSummary: $("setupCalendarSummary"),
    profileQuickBtn: $("profileQuickBtn"), profileQuickName: $("profileQuickName"), editJourneyBtn: $("editJourneyBtn"), journeyProfileSummary: $("journeyProfileSummary"), timezoneSelect: $("timezoneSelect"), localeSelect: $("localeSelect"), privacyModeSelect: $("privacyModeSelect"), exportBackupBtn: $("exportBackupBtn"), importBackupBtn: $("importBackupBtn"), backupFileInput: $("backupFileInput"), startNewJourneyBtn: $("startNewJourneyBtn"), resetAllDataBtn: $("resetAllDataBtn"), shareSummaryBtn: $("shareSummaryBtn"), updateBanner: $("updateBanner"), refreshUpdateBtn: $("refreshUpdateBtn"), footerVersion: $("footerVersion"), finishTimeValue: $("finishTimeValue"), settingsScheduleValue: $("settingsScheduleValue"), settingsWorkTimeValue: $("settingsWorkTimeValue"), settingsBreakTimeValue: $("settingsBreakTimeValue"), settingsRangeValue: $("settingsRangeValue")
  };

  function safeParse(value, fallback) { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
  function getDisplayLocale() { return state?.locale || CONFIG.locale || (state?.language === "th" ? "th-TH" : "en-US"); }
  function getConfiguredNow(source = new Date()) {
    try {
      const parts = new Intl.DateTimeFormat("en-CA", { timeZone: CONFIG.timezone || "Asia/Bangkok", year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit", hourCycle:"h23" }).formatToParts(source);
      const map = Object.fromEntries(parts.filter(p => p.type !== "literal").map(p => [p.type, p.value]));
      return new Date(Number(map.year), Number(map.month) - 1, Number(map.day), Number(map.hour), Number(map.minute), Number(map.second), source.getMilliseconds());
    } catch { return new Date(source); }
  }
  function t(key) { return translations[state.language]?.[key] ?? translations.en[key] ?? key; }
  function pad(n) { return String(n).padStart(2, "0"); }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function startOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
  function localDateOnly(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
  function sameDate(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function dateKey(date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; }
  function parseTime(value) { const [h, m] = value.split(":").map(Number); return h * 60 + m; }
  function minutesOfDay(date) { return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60; }
  function isWeekend(date) { return !CONFIG.workdays.includes(date.getDay()); }
  function isWithinInternship(date) { const d = localDateOnly(date); return d >= CONFIG.internshipStart && d <= CONFIG.internshipEnd; }
  function getOverride(date) { return state.dayOverrides[dateKey(date)] || null; }
  function getDayType(date) {
    const override = getOverride(date);
    if (override?.type === "work") return "work";
    if (override?.type === "holiday") return "holiday";
    if (override?.type === "leave") return "leave";
    return isWeekend(date) ? "weekend" : "work";
  }
  function getLeaveMinutes(date) {
    const override = getOverride(date);
    if (override?.type !== "leave") return 0;
    const raw = Number(override.leaveMinutes ?? CONFIG.totalWorkMinutes);
    return clamp(Number.isFinite(raw) ? raw : CONFIG.totalWorkMinutes, 0, CONFIG.totalWorkMinutes);
  }
  function getScheduledMinutes(date) {
    if (!isWithinInternship(date)) return 0;
    const override = getOverride(date);
    if (override?.type === "holiday") return 0;
    if (override?.type === "work") return CONFIG.totalWorkMinutes;
    if (override?.type === "leave") return CONFIG.totalWorkMinutes;
    return isWeekend(date) ? 0 : CONFIG.totalWorkMinutes;
  }
  function getActualDayCapacity(date) { return Math.max(0, getScheduledMinutes(date) - getLeaveMinutes(date)); }
  function isScheduledWorkday(date) { return getScheduledMinutes(date) > 0; }
  function isFullLeave(date) { return getScheduledMinutes(date) > 0 && getActualDayCapacity(date) <= 0 && getDayType(date) === "leave"; }
  function isCompensatoryWorkday(date) { return isWithinInternship(date) && getOverride(date)?.type === "work"; }
  function isCompanyHoliday(date) { return isWithinInternship(date) && getOverride(date)?.type === "holiday"; }
  function addDays(date, amount) { const d = new Date(date); d.setDate(d.getDate() + amount); return d; }
  function diffCalendarDays(a, b) { return Math.floor((localDateOnly(b) - localDateOnly(a)) / 86400000); }
  function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char])); }

  function formatLongDate(date) {
    return new Intl.DateTimeFormat(getDisplayLocale(), { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
  }
  function formatMonthYear(date) { return new Intl.DateTimeFormat(getDisplayLocale(), { month: "long", year: "numeric" }).format(date); }
  function formatMonthName(date) { return new Intl.DateTimeFormat(getDisplayLocale(), { month: "long" }).format(date); }
  function formatShortDate(date) { return new Intl.DateTimeFormat(getDisplayLocale(), { day: "2-digit", month: "2-digit", year: "numeric" }).format(date); }
  function formatCompactDate(date) {
    return new Intl.DateTimeFormat(getDisplayLocale(), { day: "2-digit", month: "short", year: "numeric" }).format(date).toUpperCase();
  }
  function formatTime(date) {
    const options = { hour: "2-digit", minute: "2-digit", hour12: state.clockFormat === "12" };
    if (state.showSeconds) options.second = "2-digit";
    return new Intl.DateTimeFormat(getDisplayLocale(), options).format(date);
  }
  function formatDuration(totalMinutes, compact = false) {
    const safe = Math.max(0, Math.floor(totalMinutes));
    const h = Math.floor(safe / 60), m = safe % 60;
    if (compact) return `${h}h ${pad(m)}m`;
    if (state.language === "th") return `${h} ชม. ${m} นาที`;
    return `${h}h ${m}m`;
  }
  function formatHours(totalMinutes, decimals = 0) {
    const hours = Math.max(0, totalMinutes) / 60;
    return `${hours.toLocaleString(getDisplayLocale(), { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} ${t("hoursShort")}`;
  }
  function formatCountdownSeconds(totalSeconds) {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(safe / 3600), m = Math.floor((safe % 3600) / 60), s = safe % 60;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  function localeNumber(value, options = {}) { return Number(value).toLocaleString(getDisplayLocale(), options); }

  function getNormalScheduleElapsedMinutes(date, now = getConfiguredNow()) {
    const scheduled = getScheduledMinutes(date);
    if (!scheduled) return 0;
    const day = localDateOnly(date), today = localDateOnly(now);
    if (day < today) return scheduled;
    if (day > today) return 0;
    const current = minutesOfDay(now);
    let total = 0;
    for (const segment of CONFIG.schedule) {
      if (segment.type !== "work") continue;
      const start = parseTime(segment.start), end = parseTime(segment.end);
      total += clamp(current - start, 0, end - start);
    }
    return clamp(total, 0, scheduled);
  }

  function getWorkedMinutes(date, now = getConfiguredNow()) {
    const capacity = getActualDayCapacity(date);
    if (capacity <= 0) return 0;
    const day = localDateOnly(date), today = localDateOnly(now);
    if (day < today) return capacity;
    if (day > today) return 0;
    return clamp(Math.min(getNormalScheduleElapsedMinutes(date, now), capacity), 0, capacity);
  }

  function getDayStatus(now) {
    const dayType = getDayType(now);
    if (!isWithinInternship(now)) return { type: "weekend", key: "weekendStatus" };
    if (dayType === "holiday") return { type: "holiday", key: "holidayStatus" };
    if (dayType === "leave" && isFullLeave(now)) return { type: "leave", key: "leaveStatus" };
    if (dayType === "weekend") return { type: "weekend", key: "weekendStatus" };
    const current = minutesOfDay(now), start = parseTime(CONFIG.workdayStart), end = parseTime(CONFIG.workdayEnd);
    if (dayType === "leave" && current >= start && getActualDayCapacity(now) > 0 && getWorkedMinutes(now, now) >= getActualDayCapacity(now) - .001) return { type: "leave", key: "leaveStatus" };
    if (current < start) return { type: "before", key: "beforeWork" };
    if (current >= end) return { type: "finished", key: "finished" };
    const active = CONFIG.schedule.find(seg => current >= parseTime(seg.start) && current < parseTime(seg.end));
    return active?.type === "break" ? { type: "break", key: "breakStatus", segment: active } : { type: "work", key: "working", segment: active };
  }

  function getNextBreak(now) {
    if (!isScheduledWorkday(now) || getActualDayCapacity(now) <= 0 || getWorkedMinutes(now, now) >= getActualDayCapacity(now) - .001) return null;
    const current = minutesOfDay(now);
    for (const segment of CONFIG.schedule) {
      if (segment.type !== "break") continue;
      const start = parseTime(segment.start), end = parseTime(segment.end);
      if (current < start) return { mode: "upcoming", time: segment.start, minutes: Math.ceil(start - current), segment };
      if (current >= start && current < end) return { mode: "active", time: segment.end, minutes: Math.ceil(end - current), segment };
    }
    return null;
  }

  function getInternshipStats(now) {
    const today = localDateOnly(now);
    let totalDays = 0, startedDays = 0, fullCompletedDays = 0, elapsedMinutes = 0, futureWorkdays = 0, ordinalThroughToday = 0;
    let expectedMinutesToDate = 0, futureActualWorkMinutes = 0, leaveMinutesLost = 0, leaveDateCount = 0, totalLeaveMinutesAll = 0;
    let companyHolidayCount = 0, totalCompanyHolidayCount = 0, compWorkdayCount = 0, totalCompWorkdayCount = 0, compWorkMinutes = 0, totalCompPlannedMinutes = 0;
    for (let d = new Date(CONFIG.internshipStart); d <= CONFIG.internshipEnd; d = addDays(d, 1)) {
      const override = getOverride(d), scheduled = getScheduledMinutes(d), capacity = getActualDayCapacity(d), leave = getLeaveMinutes(d);
      const worked = getWorkedMinutes(d, now), expected = getNormalScheduleElapsedMinutes(d, now);

      if (override?.type === "holiday") {
        totalCompanyHolidayCount++;
        if (d <= today) companyHolidayCount++;
      }
      if (override?.type === "work") {
        totalCompWorkdayCount++; totalCompPlannedMinutes += scheduled;
        if (d <= today) { compWorkdayCount++; compWorkMinutes += worked; }
      }
      if (override?.type === "leave") {
        totalLeaveMinutesAll += leave;
        if (d <= today) { leaveMinutesLost += leave; leaveDateCount++; }
      }
      if (!scheduled) continue;

      totalDays++;
      elapsedMinutes += worked;
      expectedMinutesToDate += expected;
      if (worked > 0) startedDays++;
      if (worked >= scheduled - .001 && leave <= .001) fullCompletedDays++;
      if (d <= today) ordinalThroughToday++;
      if (d > today && capacity > 0) futureWorkdays++;

      if (d > today) futureActualWorkMinutes += capacity;
      else if (sameDate(d, today)) futureActualWorkMinutes += Math.max(0, capacity - worked);
    }
    const totalPlannedMinutes = totalDays * CONFIG.totalWorkMinutes;
    const totalAttainableMinutes = Math.max(0, totalPlannedMinutes - totalLeaveMinutesAll);
    const percent = totalPlannedMinutes ? clamp(expectedMinutesToDate / totalPlannedMinutes * 100, 0, 100) : 0;
    const actualWorkPercent = totalPlannedMinutes ? clamp(elapsedMinutes / totalPlannedMinutes * 100, 0, 100) : 0;
    const attendancePercent = expectedMinutesToDate > 0 ? clamp(elapsedMinutes / expectedMinutesToDate * 100, 0, 100) : 100;
    const timeBalanceMinutes = elapsedMinutes - expectedMinutesToDate;
    const minutesLeft = Math.max(0, futureActualWorkMinutes);
    const currentDay = today < CONFIG.internshipStart ? 0 : Math.min(totalDays, ordinalThroughToday);
    const calendarDaysSinceStart = today < CONFIG.internshipStart ? 0 : Math.min(diffCalendarDays(CONFIG.internshipStart, today) + 1, diffCalendarDays(CONFIG.internshipStart, CONFIG.internshipEnd) + 1);
    const totalWeeks = Math.ceil((diffCalendarDays(CONFIG.internshipStart, CONFIG.internshipEnd) + 1) / 7);
    const currentWeek = today < CONFIG.internshipStart ? 0 : Math.min(totalWeeks, Math.floor(diffCalendarDays(CONFIG.internshipStart, today) / 7) + 1);
    const completionMoment = new Date(CONFIG.internshipEnd); completionMoment.setHours(Math.floor(parseTime(CONFIG.workdayEnd) / 60), parseTime(CONFIG.workdayEnd) % 60, 0, 0);
    const journeyComplete = now >= completionMoment;
    return {
      totalDays, startedDays, fullCompletedDays, elapsedMinutes, futureWorkdays, totalPlannedMinutes, totalAttainableMinutes, percent, actualWorkPercent, attendancePercent,
      expectedMinutesToDate, timeBalanceMinutes, leaveMinutesLost, leaveDateCount, totalLeaveMinutesAll, companyHolidayCount, totalCompanyHolidayCount, compWorkdayCount, totalCompWorkdayCount,
      compWorkMinutes, totalCompPlannedMinutes, minutesLeft, currentDay, calendarDaysSinceStart, totalWeeks, currentWeek, journeyComplete
    };
  }

  function getStreakStats(now) {
    const today = localDateOnly(now);
    const end = today < CONFIG.internshipStart ? addDays(CONFIG.internshipStart, -1) : (today > CONFIG.internshipEnd ? CONFIG.internshipEnd : today);
    let current = 0, longest = 0, running = 0;
    for (let d = new Date(CONFIG.internshipStart); d <= end; d = addDays(d, 1)) {
      const override = getOverride(d);
      if (override?.type === "leave") { running = 0; continue; }
      if (!isScheduledWorkday(d)) continue;
      const completedEnough = d < today || (sameDate(d, today) && getWorkedMinutes(d, now) > 0);
      if (completedEnough) { running++; longest = Math.max(longest, running); }
      else running = 0;
    }
    let cursor = new Date(end);
    while (cursor >= CONFIG.internshipStart) {
      const override = getOverride(cursor);
      if (override?.type === "leave") break;
      if (isScheduledWorkday(cursor)) {
        const completedEnough = cursor < today || (sameDate(cursor, today) && getWorkedMinutes(cursor, now) > 0);
        if (!completedEnough) { cursor = addDays(cursor, -1); continue; }
        current++;
      }
      cursor = addDays(cursor, -1);
    }
    return { current, longest };
  }

  function getMonthlyStats(now) {
    const months = [];
    let cursor = new Date(CONFIG.internshipStart.getFullYear(), CONFIG.internshipStart.getMonth(), 1);
    const finalMonth = new Date(CONFIG.internshipEnd.getFullYear(), CONFIG.internshipEnd.getMonth(), 1);
    while (cursor <= finalMonth) {
      const year = cursor.getFullYear(), month = cursor.getMonth();
      const monthStart = new Date(year, month, 1), monthEnd = new Date(year, month + 1, 0);
      const start = monthStart < CONFIG.internshipStart ? CONFIG.internshipStart : monthStart;
      const end = monthEnd > CONFIG.internshipEnd ? CONFIG.internshipEnd : monthEnd;
      let planned = 0, worked = 0, leave = 0, comp = 0, holidays = 0;
      for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
        const scheduled = getScheduledMinutes(d);
        if (isCompanyHoliday(d)) holidays++;
        if (getDayType(d) === "leave") leave += getLeaveMinutes(d);
        if (isCompensatoryWorkday(d)) comp += getWorkedMinutes(d, now);
        if (!scheduled) continue;
        planned += scheduled;
        worked += getWorkedMinutes(d, now);
      }
      months.push({ date: new Date(year, month, 1), planned, worked, leave, comp, holidays });
      cursor = new Date(year, month + 1, 1);
    }
    return months;
  }

  function challengeStorageSet(key) {
    const value = safeParse(localStorage.getItem(key), []);
    return new Set(Array.isArray(value) ? value : []);
  }
  function markAchievementFlag(flag) {
    if (!flag) return;
    const flags = safeParse(localStorage.getItem("wp-v7-achievement-flags"), {});
    if (flags && typeof flags === "object" && flags[flag]) return;
    localStorage.setItem("wp-v7-achievement-flags", JSON.stringify({ ...(flags && typeof flags === "object" ? flags : {}), [flag]: true }));
  }
  function getPerfectWorkMonthInfo(now = getConfiguredNow()) {
    const today = localDateOnly(now);
    const journeyStart = localDateOnly(CONFIG.internshipStart);
    const journeyEnd = localDateOnly(CONFIG.internshipEnd);
    let cursor = new Date(journeyStart.getFullYear(), journeyStart.getMonth(), 1);
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const finalJourneyMonth = new Date(journeyEnd.getFullYear(), journeyEnd.getMonth(), 1);
    const lastMonth = currentMonth < finalJourneyMonth ? currentMonth : finalJourneyMonth;

    while (cursor <= lastMonth) {
      const monthStart = new Date(cursor);
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      const periodStart = monthStart < journeyStart ? journeyStart : monthStart;
      const periodEnd = monthEnd > journeyEnd ? journeyEnd : monthEnd;

      if (periodStart <= periodEnd) {
        let scheduledDays = 0;
        let hadLeave = false;
        let lastScheduledDay = null;

        for (let d = new Date(periodStart); d <= periodEnd; d = addDays(d, 1)) {
          const scheduled = getScheduledMinutes(d);
          if (scheduled <= 0) continue;
          scheduledDays++;
          lastScheduledDay = new Date(d);
          if (getOverride(d)?.type === "leave" && getLeaveMinutes(d) > 0) hadLeave = true;
        }

        const periodFinished = !!lastScheduledDay && (
          lastScheduledDay < today ||
          (sameDate(lastScheduledDay, today) && getWorkedMinutes(lastScheduledDay, now) >= getScheduledMinutes(lastScheduledDay) - .001)
        );

        if (scheduledDays > 0 && periodFinished && !hadLeave) {
          return {
            achieved: true,
            monthKey: `${periodStart.getFullYear()}-${pad(periodStart.getMonth() + 1)}`,
            startKey: dateKey(periodStart),
            endKey: dateKey(periodEnd)
          };
        }
      }
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
    return { achieved: false, monthKey: "", startKey: "", endKey: "" };
  }
  function hasPerfectWorkMonth(now = getConfiguredNow()) { return getPerfectWorkMonthInfo(now).achieved; }
  function getAchievements(stats) {
    const hours = stats.elapsedMinutes / 60;
    const projectsRaw = safeParse(localStorage.getItem("wp-v6-projects"), []);
    const projects = Array.isArray(projectsRaw) ? projectsRaw : [];
    const journalsRaw = safeParse(localStorage.getItem("wp-v6-journal"), {});
    const journalCount = journalsRaw && typeof journalsRaw === "object" && !Array.isArray(journalsRaw) ? Object.keys(journalsRaw).length : 0;
    const completedProjects = projects.filter(p => Number(p?.progress) >= 100).length;
    const streak = getStreakStats(getConfiguredNow());
    const flags = safeParse(localStorage.getItem("wp-v7-achievement-flags"), {});
    const perfectMonth = getPerfectWorkMonthInfo(getConfiguredNow());

    // V8.4.7.1 finance / feature achievement inputs. Keep these calculations in the
    // core achievement API so every surface (Achievement Center, Coin rewards,
    // public summary and Cloud Sync) sees the same unlock state.
    const bankRowsRaw = safeParse(localStorage.getItem("wp-v83-bank-ledger"), []);
    const bankRows = Array.isArray(bankRowsRaw) ? bankRowsRaw.slice().sort((a,b)=>new Date(a?.createdAt||0)-new Date(b?.createdAt||0)) : [];
    let bankRunning = 0, bankMaxBalance = 0, bankInterestTotal = 0, bankMaxStreak = 0, bankStreakStart = "";
    const keyFromStamp = stamp => { const d=new Date(stamp||0); return Number.isNaN(d.getTime()) ? "" : dateKey(d); };
    const keyDistance = (a,b) => {
      const ma=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(a||"")), mb=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(b||""));
      if(!ma||!mb)return 0; const da=new Date(+ma[1],+ma[2]-1,+ma[3]),db=new Date(+mb[1],+mb[2]-1,+mb[3]);
      return Math.max(0,Math.round((db-da)/86400000));
    };
    bankRows.forEach(item=>{
      const before=bankRunning, amount=Number(item?.amount||0);
      bankRunning=Math.round((bankRunning+amount)*100)/100; bankMaxBalance=Math.max(bankMaxBalance,bankRunning);
      if(item?.type==="interest")bankInterestTotal+=Math.max(0,amount);
      const key=keyFromStamp(item?.createdAt);
      if(item?.type==="deposit"&&before<=0&&bankRunning>0&&!bankStreakStart)bankStreakStart=key;
      if(item?.type==="withdraw"){
        if(bankStreakStart&&key)bankMaxStreak=Math.max(bankMaxStreak,keyDistance(bankStreakStart,key)+1);
        bankStreakStart=bankRunning>0?key:"";
      }
    });
    if(bankRunning>0&&bankStreakStart)bankMaxStreak=Math.max(bankMaxStreak,keyDistance(bankStreakStart,dateKey(getConfiguredNow()))+1);
    bankInterestTotal=Math.round(bankInterestTotal*100)/100;
    const bankDepositCount=bankRows.filter(x=>x?.type==="deposit"&&Number(x?.amount||0)>0).length;

    const exchangeTradesRaw=safeParse(localStorage.getItem("wp-v84-exchange-trades"), []);
    const exchangeTrades=Array.isArray(exchangeTradesRaw)?exchangeTradesRaw:[];
    const exchangeState=safeParse(localStorage.getItem("wp-v84-exchange-achievements"), {})||{};
    const academyState=safeParse(localStorage.getItem("wp-v841-trading-academy"), {})||{};
    const academyCompleted=academyState?.completed&&typeof academyState.completed==="object"?Object.keys(academyState.completed).length:0;
    const qtyBySymbol={}; exchangeTrades.forEach(tr=>{const sym=String(tr?.symbol||"");if(!sym)return;qtyBySymbol[sym]=(qtyBySymbol[sym]||0)+(tr?.side==="sell"?-1:1)*Math.max(0,Number(tr?.qty)||0);});
    const exchangeHoldings=Object.values(qtyBySymbol).filter(qty=>qty>0).length;
    const featureStats=safeParse(localStorage.getItem("wp-v846-feature-achievement-stats"), {})||{};
    const exchangePnl=Math.max(Number(featureStats.exchangeMaxTotalPnl)||0,Number(featureStats.exchangeTotalPnl)||0,exchangeState?.["market-winner"]?100:0);
    const exchangePortfolioValue=Math.max(Number(featureStats.exchangeMaxPortfolioValue)||0,Number(featureStats.exchangePortfolioValue)||0,exchangeState?.["exchange-master"]?2500:0);
    const exchangeHoldDays=Math.max(Number(featureStats.exchangeMaxHoldDays)||0,Number(featureStats.exchangeHoldDays)||0,exchangeState?.["diamond-hands"]?5:0);
    const exchangeGreen=(exchangeState?.["green-portfolio"]||Number(featureStats.exchangeMaxTotalPnl)>0||Number(featureStats.exchangeTotalPnl)>0)?1:0;
    const vaultTotalFiles=Number(featureStats.vaultMaxTotalFiles||featureStats.vaultTotalFiles)||0;
    const vaultMaxProjectFiles=Number(featureStats.vaultMaxProjectFiles)||0;
    const vaultMaxVersion=Number(featureStats.vaultMaxVersion)||0;

    const defs = [];
    const add = (id, icon, titleKey, descKey, tier, category, current, target, unit, extra={}) => defs.push({
      id, icon, titleKey, descKey, tier, category, current: Number(current) || 0, target: Number(target) || 1, unit,
      unlockedNow: (Number(current) || 0) >= (Number(target) || 1) - .001, ...extra
    });

    // Time & journey milestones
    add("first-day","🌱","firstDayTitle","firstDayDesc","common","journey",stats.startedDays,1,"days");
    add("100-hours","⏱","h100Title","h100Desc","common","time",hours,100,"hours");
    add("250-hours","🚀","h250Title","h250Desc","rare","time",hours,250,"hours");
    add("500-hours","🏆","h500Title","h500Desc","epic","time",hours,500,"hours");
    add("750-hours","💪","h750Title","h750Desc","epic","time",hours,750,"hours");
    add("800-hours","🏅","h800Title","h800Desc","epic","time",hours,800,"hours");
    add("900-hours","👑","h900Title","h900Desc","legendary","time",hours,900,"hours");
    add("1000-hours","🔥","h1000Title","h1000Desc","legendary","time",hours,1000,"hours");
    add("25-percent","🥉","p25Title","p25Desc","common","journey",stats.percent,25,"percent");
    add("halfway","⭐","halfwayTitle","halfwayDesc","rare","journey",stats.percent,50,"percent");
    add("75-percent","🎯","p75Title","p75Desc","epic","journey",stats.percent,75,"percent");
    add("90-percent","💎","p90Title","p90Desc","legendary","journey",stats.percent,90,"percent");
    add("completed","🎓","completeTitle","completeDesc","legendary","journey",stats.journeyComplete?1:0,1,"count");

    // Project challenges
    add("first-project","🧩","firstProjectTitle","firstProjectDesc","common","projects",projects.length,1,"projects");
    add("projects-3","🗂️","projects3Title","projects3Desc","rare","projects",projects.length,3,"projects");
    add("project-finisher","✅","projectFinisherTitle","projectFinisherDesc","rare","projects",completedProjects,1,"projects");
    add("projects-complete-3","🏛️","projects3CompleteTitle","projects3CompleteDesc","epic","projects",completedProjects,3,"projects");

    // Journal challenges
    add("first-journal","✍️","firstJournalTitle","firstJournalDesc","common","journal",journalCount,1,"entries");
    add("journals-7","📖","journals7Title","journals7Desc","rare","journal",journalCount,7,"entries");
    add("journals-30","📚","journals30Title","journals30Desc","epic","journal",journalCount,30,"entries");
    add("journals-60","🪶","journals60Title","journals60Desc","legendary","journal",journalCount,60,"entries");

    // Attendance & consistency
    add("streak-5","🔥","streak5Title","streak5Desc","common","attendance",streak.longest,5,"days");
    add("streak-10","⚡","streak10Title","streak10Desc","rare","attendance",streak.longest,10,"days");
    add("streak-20","🛡️","streak20Title","streak20Desc","epic","attendance",streak.longest,20,"days");
    add("streak-30","⚔️","streak30Title","streak30Desc","legendary","attendance",streak.longest,30,"days");
    add("perfect-month","🌟","perfectMonthTitle","perfectMonthDesc","epic","attendance",perfectMonth.achieved?1:0,1,"months");
    const perfectMonthDef = defs[defs.length - 1];
    let savedPerfectMonthKey = localStorage.getItem("wp-v7-perfect-month-key") || "";
    if (perfectMonth.achieved && !savedPerfectMonthKey && perfectMonth.monthKey) {
      savedPerfectMonthKey = perfectMonth.monthKey;
      localStorage.setItem("wp-v7-perfect-month-key", savedPerfectMonthKey);
    }
    if (savedPerfectMonthKey || perfectMonth.achieved) {
      const key = savedPerfectMonthKey || perfectMonth.monthKey || "";
      perfectMonthDef.perfectMonthKey = key;
      if (key) {
        const [y, m] = key.split("-").map(Number);
        const monthStart = new Date(y, Math.max(0, (m || 1) - 1), 1);
        const monthEnd = new Date(y, Math.max(0, (m || 1) - 1) + 1, 0);
        const rangeStart = monthStart < CONFIG.internshipStart ? CONFIG.internshipStart : monthStart;
        const rangeEnd = monthEnd > CONFIG.internshipEnd ? CONFIG.internshipEnd : monthEnd;
        perfectMonthDef.perfectMonthStart = dateKey(rangeStart);
        perfectMonthDef.perfectMonthEnd = dateKey(rangeEnd);
      }
    }

    // Exploration challenges
    add("report-explorer","📊","reportExplorerTitle","reportExplorerDesc","common","exploration",flags?.["monthly-report"]?1:0,1,"actions");
    add("backup-guardian","💾","backupGuardianTitle","backupGuardianDesc","rare","exploration",flags?.["backup-exported"]?1:0,1,"actions");
    add("calendar-architect","🗓️","calendarArchitectTitle","calendarArchitectDesc","rare","exploration",flags?.["calendar-preset"]?1:0,1,"actions");
    add("snapshot-creator","📸","snapshotCreatorTitle","snapshotCreatorDesc","epic","exploration",flags?.["snapshot-created"]?1:0,1,"actions");

    // V8.4.7.1 — Finance & Feature Achievements. These have explicit Coin rewards
    // and do not change the legacy Tier Mastery requirements.
    add("bank-first-deposit","🏦","bankFirstDepositTitle","bankFirstDepositDesc","common","bank",bankDepositCount,1,"deposits",{coinReward:20,masteryEligible:false});
    add("bank-smart-saver","💼","bankSmartSaverTitle","bankSmartSaverDesc","common","bank",bankMaxBalance,500,"coins",{coinReward:30,masteryEligible:false});
    add("bank-pro-saver","💎","bankProSaverTitle","bankProSaverDesc","rare","bank",bankMaxBalance,1500,"coins",{coinReward:50,masteryEligible:false});
    add("bank-elite-saver","👑","bankEliteSaverTitle","bankEliteSaverDesc","legendary","bank",bankMaxBalance,5000,"coins",{coinReward:100,masteryEligible:false});
    add("bank-saving-habit","🔥","bankSavingHabitTitle","bankSavingHabitDesc","common","bank",bankMaxStreak,3,"days",{coinReward:25,masteryEligible:false});
    add("bank-saving-master","⚡","bankSavingMasterTitle","bankSavingMasterDesc","rare","bank",bankMaxStreak,7,"days",{coinReward:50,masteryEligible:false});
    add("bank-diamond-saver","💠","bankDiamondSaverTitle","bankDiamondSaverDesc","epic","bank",bankMaxStreak,14,"days",{coinReward:100,masteryEligible:false});
    add("bank-compound-investor","✨","bankCompoundInvestorTitle","bankCompoundInvestorDesc","rare","bank",bankInterestTotal,100,"coins",{coinReward:60,masteryEligible:false});

    add("first-trade","📈","exchangeFirstTradeTitle","exchangeFirstTradeDesc","common","exchange",Math.max(exchangeTrades.length,exchangeState?.["first-trade"]?1:0),1,"trades",{coinReward:20,masteryEligible:false});
    add("academy-graduate","🎓","exchangeAcademyGraduateTitle","exchangeAcademyGraduateDesc","rare","exchange",Math.max(academyCompleted,exchangeState?.["academy-graduate"]?7:0),7,"lessons",{coinReward:40,masteryEligible:false});
    add("investor","💼","exchangeInvestorTitle","exchangeInvestorDesc","common","exchange",Math.max(exchangeHoldings,exchangeState?.investor?3:0),3,"companies",{coinReward:30,masteryEligible:false});
    add("green-portfolio","💚","exchangeGreenPortfolioTitle","exchangeGreenPortfolioDesc","common","exchange",exchangeGreen,1,"count",{coinReward:25,masteryEligible:false});
    add("market-winner","🔥","exchangeMarketWinnerTitle","exchangeMarketWinnerDesc","rare","exchange",exchangePnl,100,"coins",{coinReward:50,masteryEligible:false});
    add("diamond-hands","💎","exchangeDiamondHandsTitle","exchangeDiamondHandsDesc","rare","exchange",exchangeHoldDays,5,"days",{coinReward:50,masteryEligible:false});
    add("exchange-master","🏆","exchangeMasterTitle","exchangeMasterDesc","epic","exchange",exchangePortfolioValue,2500,"coins",{coinReward:100,masteryEligible:false});

    add("vault-first-upload","📁","vaultFirstUploadTitle","vaultFirstUploadDesc","common","vault",vaultTotalFiles,1,"files",{coinReward:20,masteryEligible:false});
    add("vault-archivist","🗂️","vaultArchivistTitle","vaultArchivistDesc","common","vault",vaultMaxProjectFiles,5,"files",{coinReward:30,masteryEligible:false});
    add("vault-version-keeper","🔄","vaultVersionKeeperTitle","vaultVersionKeeperDesc","rare","vault",vaultMaxVersion,2,"versions",{coinReward:25,masteryEligible:false});

    const attainableHours = stats.totalAttainableMinutes / 60;
    const visible = defs.filter(item => item.category !== "time" || item.target <= attainableHours + .001);
    const ever = challengeStorageSet("wp-v7-ever-achievements");
    const unlockedAt = safeParse(localStorage.getItem("wp-v7-achievement-unlocked-at"), {});
    let changed = false, timeChanged = false;
    const nowIso = new Date().toISOString();
    visible.forEach(item => {
      if (item.unlockedNow && !ever.has(item.id)) { ever.add(item.id); changed = true; }
      if (item.unlockedNow && !unlockedAt[item.id]) { unlockedAt[item.id] = nowIso; timeChanged = true; }
      item.unlocked = item.unlockedNow || ever.has(item.id);
      item.unlockedAt = unlockedAt[item.id] || "";
      item.percent = clamp(item.current / Math.max(.0001,item.target) * 100, 0, 100);
      delete item.unlockedNow;
    });
    if (changed) localStorage.setItem("wp-v7-ever-achievements", JSON.stringify([...ever]));
    if (timeChanged) localStorage.setItem("wp-v7-achievement-unlocked-at", JSON.stringify(unlockedAt));
    return visible;
  }

  function getNextMilestone(stats) {
    const elapsedHours = stats.elapsedMinutes / 60;
    const plannedHours = stats.totalAttainableMinutes / 60;
    const fixed = [100, 250, 500, 750, 800, 900, 1000].filter(h => h < plannedHours - .01);
    const milestones = [...fixed, plannedHours].filter((v, i, arr) => i === 0 || Math.abs(v - arr[i - 1]) > .01);
    const next = milestones.find(h => elapsedHours < h - .001);
    if (!next) return { complete: true, targetHours: plannedHours, remainingMinutes: 0, percent: 100 };
    return { complete: false, targetHours: next, remainingMinutes: Math.max(0, next * 60 - stats.elapsedMinutes), percent: clamp(elapsedHours / next * 100, 0, 100) };
  }

  function getGreetingKey(now) { const h = now.getHours(); return h < 12 ? "greetingMorning" : h < 17 ? "greetingAfternoon" : "greetingEvening"; }

  function renderTranslations() {
    document.documentElement.lang = state.language;
    document.querySelectorAll("[data-i18n]").forEach(node => { const key = node.dataset.i18n; if (translations[state.language][key]) node.textContent = t(key); });
    els.dayNoteInput.placeholder = t("notePlaceholder");
    document.querySelectorAll(".lang-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.lang === state.language));
    if (els.setupSaveBtn && !els.setupBackdrop?.hidden) els.setupSaveBtn.textContent = t(state.setupMode === "edit" ? "saveChanges" : "startJourney");
    if (!els.setupBackdrop?.hidden && state.setupStep === 4) renderSetupCalendar();
    renderJourneyConfigUI();
  }

  function renderStatus(status) {
    els.statusBadge.className = `status-badge ${status.type === "work" ? "working" : status.type === "break" ? "break" : status.type === "finished" ? "finished" : status.type === "holiday" ? "holiday" : status.type === "leave" ? "leave" : "closed"}`;
    els.statusBadge.innerHTML = `● <span>${escapeHtml(t(status.key))}</span>`;
  }

  function renderMilestones(percent) {
    const milestones = [0, 25, 50, 75, 100];
    let key = "milestone0";
    if (percent >= 100) key = "milestone100"; else if (percent >= 75) key = "milestone75"; else if (percent >= 50) key = "milestone50"; else if (percent >= 25) key = "milestone25";
    els.milestoneText.textContent = t(key);
    els.milestoneDots.innerHTML = milestones.map(value => `<span class="milestone-dot ${percent >= value && (value !== 0 || percent > 0) ? "active" : ""}" title="${value}%"></span>`).join("");
  }

  function renderLiveCountdown(now, status) {
    const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    let targetSeconds = currentSeconds, titleKey = "noWorkCountdown", hint = t("noWorkCountdown"), icon = "○", rangeStart = currentSeconds, rangeEnd = currentSeconds + 1;
    if (status.type === "before") {
      targetSeconds = parseTime(CONFIG.workdayStart) * 60; titleKey = "untilStart"; hint = t("workStartsAt").replace("{time}", CONFIG.workdayStart); icon = "▶"; rangeStart = 0; rangeEnd = targetSeconds;
    } else if (status.type === "work") {
      const nextBreak = getNextBreak(now);
      if (nextBreak?.mode === "upcoming") {
        targetSeconds = parseTime(nextBreak.time) * 60; titleKey = "untilNextBreak"; hint = t("nextBreakAt").replace("{time}", nextBreak.time); icon = "☕";
        rangeStart = parseTime(status.segment.start) * 60; rangeEnd = targetSeconds;
      } else {
        targetSeconds = parseTime(CONFIG.workdayEnd) * 60; titleKey = "untilFinish"; hint = t("finishAt").replace("{time}", CONFIG.workdayEnd); icon = "🏁";
        rangeStart = parseTime(status.segment?.start || CONFIG.workdayStart) * 60; rangeEnd = targetSeconds;
      }
    } else if (status.type === "break") {
      targetSeconds = parseTime(status.segment.end) * 60; titleKey = "untilBreakEnds"; hint = t("breakEndsAt").replace("{time}", status.segment.end); icon = "☕";
      rangeStart = parseTime(status.segment.start) * 60; rangeEnd = targetSeconds;
    } else if (status.type === "finished") {
      targetSeconds = currentSeconds; titleKey = "untilFinish"; hint = t("finishAt").replace("{time}", CONFIG.workdayEnd); icon = "✓";
    }
    const remaining = Math.max(0, targetSeconds - currentSeconds);
    const segmentProgress = rangeEnd > rangeStart ? clamp((currentSeconds - rangeStart) / (rangeEnd - rangeStart) * 100, 0, 100) : 100;
    els.liveCountdownTitle.textContent = t(titleKey); els.liveCountdownHint.textContent = hint; els.liveCountdownIcon.textContent = icon; els.liveCountdownTime.textContent = formatCountdownSeconds(remaining); els.liveCountdownBar.style.width = `${segmentProgress}%`;
  }

  function renderTimeline(now) {
    const totalSpan = parseTime(CONFIG.workdayEnd) - parseTime(CONFIG.workdayStart), current = minutesOfDay(now);
    els.timelineTrack.innerHTML = CONFIG.schedule.map(seg => {
      const start = parseTime(seg.start), end = parseTime(seg.end), width = (end - start) / totalSpan * 100;
      const cls = current >= end ? "past" : current >= start && current < end ? "now" : "";
      return `<div class="timeline-segment ${seg.type} ${cls}" style="width:${width}%" title="${seg.start}–${seg.end}"></div>`;
    }).join("");
    const markers = [CONFIG.workdayStart, ...CONFIG.schedule.filter(x => x.type === "break").map(x => x.start), CONFIG.workdayEnd];
    els.timelineLabels.innerHTML = markers.map(x => `<span>${x}</span>`).join("");
  }

  function renderScheduleList(now) {
    const current = minutesOfDay(now), scheduled = isScheduledWorkday(now) && getActualDayCapacity(now) > 0;
    els.scheduleList.innerHTML = CONFIG.schedule.map((seg, index) => {
      const start = parseTime(seg.start), end = parseTime(seg.end);
      let stateKey = "upcoming", cls = "";
      if (!scheduled) stateKey = "weekOff";
      else if (current >= end) { stateKey = "done"; cls = "past"; }
      else if (current >= start && current < end) { stateKey = "now"; cls = "current"; }
      const label = seg.type === "work" ? t("work") : t(seg.key || "break");
      const icon = seg.type === "work" ? "●" : "☕";
      return `<div class="schedule-item ${cls}"><div class="schedule-item-type"><strong>${icon} ${escapeHtml(label)}</strong><span class="schedule-state">${escapeHtml(t(stateKey))}</span></div><span class="schedule-item-time">${seg.start} – ${seg.end}</span><span class="schedule-duration">${seg.durationLabel}</span></div>`;
    }).join("");
  }

  function getWeekStart(date) { const d = localDateOnly(date); const day = d.getDay(); const diff = day === 0 ? -6 : 1 - day; return addDays(d, diff); }
  function renderWeeklyProgress(now) {
    const weekStart = getWeekStart(now); let workedTotal = 0, plannedTotal = 0; const rows = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i), type = getDayType(day), planned = getScheduledMinutes(day), scheduled = planned > 0;
      const include = CONFIG.workdays.includes(day.getDay()) || isCompensatoryWorkday(day) || type === "leave";
      if (!include) continue;
      const worked = getWorkedMinutes(day, now), leave = getLeaveMinutes(day);
      workedTotal += worked; plannedTotal += planned;
      const pct = planned ? clamp(worked / planned * 100, 0, 100) : 0;
      const locale = getDisplayLocale();
      const name = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(day);
      let value = scheduled ? formatHours(worked, worked > 0 && worked < 60 ? 1 : 0) : t("weekOff");
      if (type === "leave") value = `${formatHours(worked, 1)} · ${t("leaveShortWithTime").replace("{time}", formatDuration(leave, true))}`;
      let cls = sameDate(day, now) ? "today" : "";
      if (!scheduled) cls += " closed";
      if (type === "leave") cls += " leave";
      if (type === "holiday") cls += " holiday";
      if (isCompensatoryWorkday(day)) cls += " custom-work";
      rows.push(`<div class="week-row ${cls.trim()}"><span class="week-day-name">${escapeHtml(name)}</span><div class="week-bar"><div class="week-bar-fill" style="width:${pct}%"></div></div><span class="week-percent">${escapeHtml(value)}</span></div>`);
    }
    const weekPercent = plannedTotal ? workedTotal / plannedTotal * 100 : 0;
    els.weeklyProgressList.innerHTML = rows.join("");
    els.weekPercentBadge.textContent = `${weekPercent.toFixed(1)}%`;
    els.weeklyHoursTotal.textContent = `${formatHours(workedTotal, 1)} / ${formatHours(plannedTotal, 0)}`;
    els.weeklySummary.textContent = t("weeklySummary").replace("{percent}", weekPercent.toFixed(1));
  }

  function getCalendarDayTag(date) {
    const override = getOverride(date); if (!override) return "";
    let fallback = t("workShort");
    if (override.type === "holiday") fallback = t("companyHolidayShort");
    else if (override.type === "leave") fallback = t("leaveShortWithTime").replace("{time}", formatDuration(getLeaveMinutes(date), true));
    else if (override.type === "work") fallback = t("compWorkShort");
    const label = override.note || fallback;
    return `<span class="day-tag">${escapeHtml(label)}</span>`;
  }

  function renderCalendar(now) {
    const year = state.calendarDate.getFullYear(), month = state.calendarDate.getMonth();
    els.calendarMonthTitle.textContent = formatMonthYear(state.calendarDate);
    const names = state.language === "th" ? ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"] : ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    els.calendarWeekdays.innerHTML = names.map(day => `<div>${day}</div>`).join("");
    const first = new Date(year, month, 1), last = new Date(year, month + 1, 0);
    const gridStart = addDays(first, -first.getDay()), gridEnd = addDays(last, 6 - last.getDay()), today = localDateOnly(now);
    els.calendarGrid.innerHTML = "";
    for (let cursor = new Date(gridStart); cursor <= gridEnd; cursor = addDays(cursor, 1)) {
      const cell = new Date(cursor), button = document.createElement("button"), type = getDayType(cell);
      button.type = "button"; button.className = "calendar-day"; button.dataset.date = dateKey(cell); button.innerHTML = `<span>${cell.getDate()}</span>${getCalendarDayTag(cell)}`; button.setAttribute("aria-label", formatLongDate(cell));
      if (cell.getMonth() !== month) button.classList.add("other-month");
      if (isWeekend(cell)) button.classList.add("weekend");
      if (isWithinInternship(cell)) button.classList.add("internship-day");
      if (isWithinInternship(cell) && getWorkedMinutes(cell, now) > 0 && cell < today) button.classList.add("past-workday");
      if (sameDate(cell, today)) button.classList.add("today");
      if (type === "holiday") button.classList.add("holiday");
      if (type === "leave") button.classList.add("leave");
      if (getOverride(cell)?.type === "work") button.classList.add("custom-work");
      button.addEventListener("click", () => openDayModal(cell)); els.calendarGrid.appendChild(button);
    }
  }

  function renderTodaySpecialBadge(now) {
    const override = getOverride(now);
    if (!override) { els.todaySpecialBadge.hidden = true; return; }
    let label = override.type === "holiday" ? t("companyHoliday") : override.type === "work" ? t("compensatoryWorkday") : t("leaveStatus");
    if (override.type === "leave") label = isFullLeave(now) ? t("fullLeaveBadge") : t("partialLeaveBadge").replace("{time}", formatDuration(getLeaveMinutes(now), true));
    const note = state.privacyMode === "demo" ? "" : override.note;
    els.todaySpecialBadge.textContent = note ? `${label} · ${note}` : label; els.todaySpecialBadge.hidden = false;
  }

  function renderJourneyOverview(stats, streak, achievements) {
    const unlocked = achievements.filter(a => a.unlocked), latest = unlocked[unlocked.length - 1];
    els.totalWorkTime.textContent = formatDuration(stats.elapsedMinutes, true);
    els.totalWorkMinutes.textContent = t("workingMinutesText").replace("{minutes}", localeNumber(Math.floor(stats.elapsedMinutes)));
    els.workdaysReached.textContent = localeNumber(stats.startedDays);
    els.fullDaysCompleted.textContent = t("fullDaysText").replace("{days}", localeNumber(stats.fullCompletedDays));
    els.achievementCount.textContent = `${unlocked.length} / ${achievements.length}`;
    els.achievementLatest.textContent = latest ? t("latestAchievement").replace("{title}", t(latest.titleKey)) : "—";
    els.currentStreak.textContent = `${localeNumber(streak.current)} ${t("daysShort")}`;
    els.longestStreak.textContent = t("longestText").replace("{days}", localeNumber(streak.longest));

    const milestone = getNextMilestone(stats);
    if (milestone.complete) {
      els.nextMilestoneTitle.textContent = t("completeTitle"); els.nextMilestoneRemaining.textContent = t("milestoneComplete"); els.nextMilestoneFill.style.width = "100%"; els.nextMilestonePercent.textContent = "100%";
    } else {
      const target = Number.isInteger(milestone.targetHours) ? localeNumber(milestone.targetHours) : localeNumber(milestone.targetHours, { maximumFractionDigits: 1 });
      els.nextMilestoneTitle.textContent = `${target} HOURS`; els.nextMilestoneRemaining.textContent = t("milestoneRemaining").replace("{time}", formatDuration(milestone.remainingMinutes, true));
      els.nextMilestoneFill.style.width = `${milestone.percent}%`; els.nextMilestonePercent.textContent = `${milestone.percent.toFixed(1)}%`;
    }
  }

  function renderAttendanceOverview(stats) {
    if (!els.leaveTimeLost) return;
    els.leaveTimeLost.textContent = formatDuration(stats.leaveMinutesLost, true);
    els.leaveDaysDetail.textContent = stats.leaveMinutesLost > 0
      ? t("leaveDaysRecorded").replace("{days}", localeNumber(stats.leaveDateCount)).replace("{hours}", formatHours(stats.leaveMinutesLost, 1))
      : t("noLeaveTime");
    els.companyHolidayCount.textContent = `${localeNumber(stats.companyHolidayCount)} ${t("daysShort")}`;
    els.companyHolidayDetail.textContent = stats.totalCompanyHolidayCount === stats.companyHolidayCount
      ? t("companyHolidayHelp")
      : `${t("companyHolidayHelp")} · ${t("daysRecordedTotal").replace("{days}", localeNumber(stats.totalCompanyHolidayCount))}`;
    els.compWorkTime.textContent = formatDuration(stats.compWorkMinutes, true);
    els.compWorkDetail.textContent = t("compensatoryWorkHelp").replace("{days}", localeNumber(stats.compWorkdayCount)).replace("{hours}", formatHours(stats.compWorkMinutes, 1));
    els.attendancePercent.textContent = `${stats.attendancePercent.toFixed(1)}%`;
    els.attendancePercentBadge.textContent = `${stats.attendancePercent.toFixed(1)}%`;
    els.attendanceDetail.textContent = t("attendanceExpectedActual").replace("{actual}", formatHours(stats.elapsedMinutes, 1)).replace("{expected}", formatHours(stats.expectedMinutesToDate, 1));
    els.expectedByToday.textContent = formatDuration(stats.expectedMinutesToDate, true);
    els.actualByToday.textContent = formatDuration(stats.elapsedMinutes, true);
    els.timeBalanceLeave.textContent = `−${formatDuration(stats.leaveMinutesLost, true)}`;
    const balance = stats.timeBalanceMinutes;
    els.timeBalanceValue.textContent = `${balance > .5 ? "+" : balance < -.5 ? "−" : ""}${formatDuration(Math.abs(balance), true)}`;
    els.timeBalanceValue.classList.toggle("negative", balance < -.5);
    els.timeBalanceValue.classList.toggle("positive", balance > .5);
    els.timeBalanceMessage.textContent = Math.abs(balance) < 1 ? t("onTrack") : balance < 0 ? t("behindBy").replace("{time}", formatDuration(-balance, true)) : t("aheadBy").replace("{time}", formatDuration(balance, true));
    els.timeBalanceFill.style.width = `${clamp(stats.attendancePercent, 0, 100)}%`;
  }

  function renderJourneyTimeline(stats) {
    els.journeyLineFill.style.width = `${stats.percent}%`;
    els.journeyNowMarker.style.left = `${clamp(stats.percent, 0, 100)}%`;
    const markers = [0, 25, 50, 75, 100];
    els.journeyMarkers.innerHTML = markers.map(value => {
      const label = value === 0 ? (state.language === "th" ? "เริ่ม" : "START") : value === 100 ? (state.language === "th" ? "จบ" : "FINISH") : `${value}%`;
      return `<div class="journey-marker ${stats.percent >= value ? "achieved" : ""}"><strong>${label}</strong><span>${value === 0 ? formatCompactDate(CONFIG.internshipStart) : value === 100 ? formatCompactDate(CONFIG.internshipEnd) : `${value}%`}</span></div>`;
    }).join("");
    els.journeyWeekBadge.textContent = `${t("weekPrefix")} ${stats.currentWeek} / ${stats.totalWeeks}`;
    els.plannedHoursInline.textContent = formatHours(stats.totalPlannedMinutes, 0);
    els.weeksSinceStart.textContent = `${stats.currentWeek} / ${stats.totalWeeks}`;
    els.daysSinceStart.textContent = localeNumber(stats.calendarDaysSinceStart);
  }

  function renderStatsModal(stats, streak, achievements) {
    els.statsTotalWorkTime.textContent = formatDuration(stats.elapsedMinutes, true);
    els.statsTotalMinutes.textContent = t("workingMinutesText").replace("{minutes}", localeNumber(Math.floor(stats.elapsedMinutes)));
    const milestone = getNextMilestone(stats);
    const unlocked = achievements.filter(a => a.unlocked);
    const records = [
      ["📅", "recordStartedDays", localeNumber(stats.startedDays), `${t("of")} ${localeNumber(stats.totalDays)} ${t("daysShort")}`],
      ["✅", "recordFullDays", localeNumber(stats.fullCompletedDays), `${(stats.fullCompletedDays / Math.max(1, stats.totalDays) * 100).toFixed(1)}%`],
      ["⌛", "recordRemaining", formatDuration(stats.minutesLeft, true), `${formatHours(stats.minutesLeft, 1)}`],
      ["🏁", "recordPlanned", formatHours(stats.totalPlannedMinutes, 0), `${localeNumber(stats.totalDays)} ${t("daysShort")}`],
      ["🔥", "recordCurrentStreak", `${localeNumber(streak.current)} ${t("daysShort")}`, ""],
      ["🏆", "recordLongestStreak", `${localeNumber(streak.longest)} ${t("daysShort")}`, ""],
      ["📆", "recordCalendarDays", localeNumber(stats.calendarDaysSinceStart), `${formatCompactDate(CONFIG.internshipStart)} → ${formatCompactDate(CONFIG.internshipEnd)}`],
      ["🗓", "recordWeek", `${stats.currentWeek} / ${stats.totalWeeks}`, ""],
      ["⏱", "recordEquivalentDays", localeNumber(stats.elapsedMinutes / CONFIG.totalWorkMinutes, { minimumFractionDigits: 1, maximumFractionDigits: 1 }), `× ${formatDuration(CONFIG.totalWorkMinutes,true)}`],
      ["📈", "recordProgress", `${stats.percent.toFixed(1)}%`, t("scheduleJourneyProgress")],
      ["🏖", "recordLeaveLost", formatDuration(stats.leaveMinutesLost, true), `${localeNumber(stats.leaveDateCount)} ${t("daysShort")}`],
      ["🧭", "recordAttendance", `${stats.attendancePercent.toFixed(1)}%`, t("attendanceExpectedActual").replace("{actual}", formatHours(stats.elapsedMinutes,1)).replace("{expected}", formatHours(stats.expectedMinutesToDate,1))],
      ["📌", "recordExpected", formatDuration(stats.expectedMinutesToDate, true), ""],
      ["🏢", "recordCompanyHoliday", `${localeNumber(stats.companyHolidayCount)} ${t("daysShort")}`, t("companyHolidayHelp")],
      ["🔄", "recordCompWork", formatDuration(stats.compWorkMinutes, true), `${localeNumber(stats.compWorkdayCount)} ${t("daysShort")}`],
      ["⚖", "recordTimeBalance", `${stats.timeBalanceMinutes > .5 ? "+" : stats.timeBalanceMinutes < -.5 ? "−" : ""}${formatDuration(Math.abs(stats.timeBalanceMinutes), true)}`, ""],
      ["🎯", "recordMilestones", `${unlocked.length} / ${achievements.length}`, milestone.complete ? t("milestoneComplete") : `${els.nextMilestoneTitle.textContent}`]
    ];
    els.recordsGrid.innerHTML = records.map(([icon,key,value,small]) => `<div class="record-card"><span class="record-icon">${icon}</span><span>${escapeHtml(t(key))}</span><strong>${escapeHtml(value)}</strong>${small ? `<small>${escapeHtml(small)}</small>` : ""}</div>`).join("");

    const months = getMonthlyStats(getConfiguredNow());
    const mostActive = months.reduce((best, item) => item.worked > (best?.worked ?? -1) ? item : best, null);
    els.mostActiveMonth.textContent = mostActive ? t("mostActive").replace("{month}", formatMonthName(mostActive.date)) : "";
    els.monthlyStatsList.innerHTML = months.map(item => {
      const pct = item.planned ? clamp(item.worked / item.planned * 100, 0, 100) : 0;
      const worked = formatHours(item.worked, item.worked % 60 ? 1 : 0), planned = formatHours(item.planned, 0);
      const detail = t("monthlyLeaveText").replace("{leave}", formatHours(item.leave, 1)).replace("{comp}", formatHours(item.comp, 1));
      return `<div class="month-row"><span class="month-name">${escapeHtml(formatMonthName(item.date))}</span><div class="month-bar"><div class="month-bar-fill" style="width:${pct}%"></div></div><span class="month-value">${escapeHtml(t("plannedText").replace("{worked}", worked).replace("{planned}", planned))}<small>${escapeHtml(detail)}</small></span></div>`;
    }).join("");

    if (els.statsAttendanceGrid) {
      const attendanceCards = [
        ["🏖", "leaveTimeLost", formatDuration(stats.leaveMinutesLost, true)],
        ["🏢", "companyHolidays", `${localeNumber(stats.companyHolidayCount)} ${t("daysShort")}`],
        ["🔄", "compensatoryWork", formatDuration(stats.compWorkMinutes, true)],
        ["🧭", "attendanceRate", `${stats.attendancePercent.toFixed(1)}%`]
      ];
      els.statsAttendanceGrid.innerHTML = attendanceCards.map(([icon,key,value]) => `<div class="attendance-mini-card"><span>${icon}</span><small>${escapeHtml(t(key))}</small><strong>${escapeHtml(value)}</strong></div>`).join("");
      els.statsBalanceMessage.textContent = Math.abs(stats.timeBalanceMinutes) < 1 ? t("attendancePerfect") : t("attendanceWithLeave").replace("{time}", formatDuration(Math.abs(stats.timeBalanceMinutes), true));
    }
    els.statsAchievementCount.textContent = `${unlocked.length} / ${achievements.length}`;
    els.achievementsGrid.innerHTML = achievements.map(item => `<div class="achievement-card ${item.unlocked ? "unlocked" : "locked"}"><div class="achievement-icon">${item.unlocked ? item.icon : "🔒"}</div><div class="achievement-copy"><strong>${escapeHtml(t(item.titleKey))}</strong><small>${escapeHtml(t(item.descKey))}</small></div><span class="achievement-status">${escapeHtml(t(item.unlocked ? "unlocked" : "locked"))}</span></div>`).join("");
  }

  function renderCompletionState(stats, achievements) {
    const complete = stats.journeyComplete;
    document.body.classList.toggle("completed-journey", complete);
    els.completionBanner.hidden = !complete;
    if (!complete) return;
    els.completionTotalHours.textContent = localeNumber(stats.elapsedMinutes / 60, { maximumFractionDigits: 1 });
    els.completionWorkdays.textContent = localeNumber(stats.startedDays);
    els.completionWeeks.textContent = localeNumber(stats.totalWeeks);
    els.completionAchievementText.textContent = t("allAchievementsUnlocked").replace("{count}", achievements.filter(a => a.unlocked).length);
    if (els.completionLeaveTime) els.completionLeaveTime.textContent = formatDuration(stats.leaveMinutesLost, true);
    if (els.completionHolidayCount) els.completionHolidayCount.textContent = localeNumber(stats.companyHolidayCount);
    if (els.completionCompTime) els.completionCompTime.textContent = formatDuration(stats.compWorkMinutes, true);
    if (els.completionAttendance) els.completionAttendance.textContent = `${stats.attendancePercent.toFixed(1)}%`;
    const completionMessageNode = document.querySelector('[data-i18n="completionMessage"]');
    if (completionMessageNode) completionMessageNode.textContent = t("completionMessageDynamic").replace("{start}", formatCompactDate(CONFIG.internshipStart)).replace("{end}", formatCompactDate(CONFIG.internshipEnd));
    if (localStorage.getItem("wp-completion-seen") !== "true" && !els.completionModal.classList.contains("open")) {
      setTimeout(() => openCompletionModal(), 700);
    }
  }

  function checkAchievementNotifications(achievements) {
    const unlocked = achievements.filter(a => a.unlocked);
    if (!unlocked.length || els.achievementModal.classList.contains("open") || els.completionModal.classList.contains("open")) return;
    const initialized = localStorage.getItem("wp-achievements-initialized") === "true";
    const seen = new Set(safeParse(localStorage.getItem("wp-seen-achievements"), []));
    if (initialized && localStorage.getItem("wp-v74-achievements-migrated") !== "true") {
      unlocked.forEach(a => seen.add(a.id));
      localStorage.setItem("wp-seen-achievements", JSON.stringify([...seen]));
      localStorage.setItem("wp-v74-achievements-migrated", "true");
      return;
    }
    if (!initialized) {
      unlocked.forEach(a => seen.add(a.id));
      localStorage.setItem("wp-seen-achievements", JSON.stringify([...seen]));
      localStorage.setItem("wp-achievements-initialized", "true");
      const latest = unlocked[unlocked.length - 1];
      setTimeout(() => openAchievementModal(latest, t("initialAchievementMeta").replace("{count}", unlocked.length)), 1000);
      return;
    }
    const fresh = unlocked.filter(a => !seen.has(a.id));
    if (!fresh.length) return;
    fresh.forEach(a => seen.add(a.id));
    localStorage.setItem("wp-seen-achievements", JSON.stringify([...seen]));
    setTimeout(() => openAchievementModal(fresh[fresh.length - 1], t("newAchievementMeta")), 450);
  }


  function formatInputDate(date) { return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`; }
  function parseInputDate(value) {
    if (!value) return new Date(CONFIG.internshipStart);
    const [y,m,d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  function dateWithMinutes(date, minute) {
    const d = localDateOnly(date); const whole = Math.floor(minute); const seconds = Math.round((minute - whole) * 60);
    d.setHours(Math.floor(whole / 60), whole % 60, seconds, 0); return d;
  }
  function formatClockMinute(minute) { const whole = Math.floor(minute); return `${pad(Math.floor(whole/60))}:${pad(whole%60)}`; }
  function formatPredictionDate(date) {
    if (!date) return "—";
    const day = new Intl.DateTimeFormat(getDisplayLocale(), { weekday:"short", day:"numeric", month:"short" }).format(date);
    const time = new Intl.DateTimeFormat(getDisplayLocale(), { hour:"2-digit", minute:"2-digit", hour12: state.clockFormat === "12" }).format(date);
    return `${day} · ${time}`;
  }
  function getWorkedMinutesAt(date, minute) {
    const capacity = getActualDayCapacity(date);
    if (capacity <= 0) return 0;
    let total = 0;
    for (const segment of CONFIG.schedule) {
      if (segment.type !== "work") continue;
      const start = parseTime(segment.start), end = parseTime(segment.end);
      total += clamp(minute - start, 0, end - start);
    }
    return clamp(Math.min(total, capacity), 0, capacity);
  }
  function getStatusAtMinute(date, minute) {
    const type = getDayType(date);
    if (!isWithinInternship(date)) return { type:"weekend", key:"statusWeekend" };
    if (type === "holiday") return { type:"holiday", key:"statusHoliday" };
    if (type === "leave" && isFullLeave(date)) return { type:"leave", key:"statusLeave" };
    if (type === "weekend") return { type:"weekend", key:"statusWeekend" };
    if (minute < parseTime(CONFIG.workdayStart)) return { type:"before", key:"statusBefore" };
    if (type === "leave" && getActualDayCapacity(date) > 0 && getWorkedMinutesAt(date, minute) >= getActualDayCapacity(date) - .001) return { type:"leave", key:"statusLeave" };
    if (minute >= parseTime(CONFIG.workdayEnd)) return { type:"finished", key:"statusFinished" };
    const seg = CONFIG.schedule.find(x => minute >= parseTime(x.start) && minute < parseTime(x.end));
    return seg?.type === "break" ? { type:"break", key:"statusBreak", segment:seg } : { type:"work", key:"statusWork", segment:seg };
  }
  function cumulativeTargetDate(targetMinutes) {
    let remaining = Math.max(0, targetMinutes);
    if (remaining <= 0) return dateWithMinutes(CONFIG.internshipStart, parseTime(CONFIG.workdayStart));
    for (let d = new Date(CONFIG.internshipStart); d <= CONFIG.internshipEnd; d = addDays(d, 1)) {
      const capacity = getActualDayCapacity(d);
      if (capacity <= 0) continue;
      if (remaining > capacity + .0001) { remaining -= capacity; continue; }
      let inside = Math.min(remaining, capacity);
      for (const seg of CONFIG.schedule) {
        if (seg.type !== "work") continue;
        const start = parseTime(seg.start), end = parseTime(seg.end), dur = end - start;
        if (inside <= dur + .0001) return dateWithMinutes(d, start + inside);
        inside -= dur;
      }
      return dateWithMinutes(d, parseTime(CONFIG.workdayEnd));
    }
    return dateWithMinutes(CONFIG.internshipEnd, parseTime(CONFIG.workdayEnd));
  }
  function getForecastTargets(stats) {
    const plannedHours = stats.totalAttainableMinutes / 60;
    return [...new Set([100,250,500,750,800,900,1000,plannedHours].filter(h => h > 0 && h <= plannedHours + .001).map(h => Math.round(h*1000)/1000))].sort((a,b)=>a-b);
  }
  function renderMilestoneForecast(stats) {
    const targets = getForecastTargets(stats), elapsed = stats.elapsedMinutes / 60;
    let nextIndex = targets.findIndex(h => h > elapsed + .001); if (nextIndex < 0) nextIndex = targets.length;
    const start = Math.max(0, Math.min(nextIndex - 1, Math.max(0, targets.length - 5)));
    const visible = targets.slice(start, start + 5);
    els.milestoneForecastList.innerHTML = visible.map(h => {
      const done = elapsed >= h - .001, next = !done && h === targets[nextIndex];
      const date = cumulativeTargetDate(h * 60); const planned = Math.abs(h - stats.totalAttainableMinutes/60) < .01;
      const label = planned ? `${localeNumber(h,{maximumFractionDigits:1})} HOURS · 100%` : `${localeNumber(h,{maximumFractionDigits:1})} HOURS`;
      const stateLabel = done ? t("milestoneDone") : next ? t("milestoneNext") : t("milestoneFuture");
      return `<div class="forecast-item ${done?"done":""} ${next?"next":""}"><span class="forecast-icon">${done?"✓":next?"●":"○"}</span><div class="forecast-copy"><strong>${escapeHtml(label)}</strong><small>${escapeHtml(stateLabel)}</small></div><div class="forecast-date"><strong>${escapeHtml(formatPredictionDate(date))}</strong><small>${escapeHtml(done?t("achievedAt"):t("expectedAt"))}</small></div></div>`;
    }).join("");
    const next = getNextMilestone(stats);
    if (next.complete) els.nextMilestoneExpected.textContent = t("milestoneComplete");
    else els.nextMilestoneExpected.textContent = `${t("expectedAt")} ${formatPredictionDate(cumulativeTargetDate(next.targetHours*60))}`;
  }
  function clampReplayDate(date) {
    if (date < CONFIG.internshipStart) return new Date(CONFIG.internshipStart);
    if (date > CONFIG.internshipEnd) return new Date(CONFIG.internshipEnd);
    return localDateOnly(date);
  }
  function renderTimeMachine(now) {
    if (!state.timeMachineDate) state.timeMachineDate = clampReplayDate(now);
    if (state.timeMachineAuto) {
      state.timeMachineDate = clampReplayDate(now);
      const same = sameDate(state.timeMachineDate, now);
      state.timeMachineMinute = same ? clamp(minutesOfDay(now), parseTime(CONFIG.workdayStart), parseTime(CONFIG.workdayEnd)) : parseTime(CONFIG.workdayEnd);
    }
    const date = state.timeMachineDate, minute = state.timeMachineMinute;
    const worked = getWorkedMinutesAt(date, minute), capacity = getActualDayCapacity(date), percent = capacity ? clamp(worked / capacity * 100, 0, 100) : 0, status = getStatusAtMinute(date, minute);
    els.timeMachineDateInput.value = formatInputDate(date); els.timeMachineRange.value = Math.round(minute);
    els.timeMachineClock.textContent = formatClockMinute(minute); els.timeMachinePercent.textContent = `${percent.toFixed(1)}%`; els.timeMachineStatus.textContent = t(status.key);
    els.timeMachineFill.style.width = `${percent}%`;
    els.timeMachineSummary.textContent = t("replaySummary").replace("{worked}",formatDuration(worked,true)).replace("{remaining}",formatDuration(Math.max(0,capacity-worked),true));
  }
  function renderHeatmap(now) {
    const today = localDateOnly(now), weekdayNames = state.language === "th" ? ["อา","จ","อ","พ","พฤ","ศ","ส"] : ["S","M","T","W","T","F","S"];
    let cursor = new Date(CONFIG.internshipStart.getFullYear(), CONFIG.internshipStart.getMonth(), 1); const finalMonth = new Date(CONFIG.internshipEnd.getFullYear(), CONFIG.internshipEnd.getMonth(), 1); const html=[];
    while (cursor <= finalMonth) {
      const y=cursor.getFullYear(), m=cursor.getMonth(), monthStart=new Date(y,m,1), monthEnd=new Date(y,m+1,0), blanks=monthStart.getDay();
      const cells=[]; for(let i=0;i<blanks;i++) cells.push('<span class="heat-day blank"></span>');
      for(let d=1;d<=monthEnd.getDate();d++) {
        const day=new Date(y,m,d); if(day<CONFIG.internshipStart||day>CONFIG.internshipEnd){cells.push('<span class="heat-day blank"></span>');continue;}
        const type=getDayType(day), override=getOverride(day); let cls="heat-day", worked=getWorkedMinutes(day,now), title="";
        if(type==="holiday") { cls+=" holiday"; title=t("companyHoliday"); }
        else if(type==="weekend") { cls+=" weekend"; title=t("weekendStatus"); }
        else {
          if(day>today) cls+=" future";
          if(worked>0 && worked<CONFIG.totalWorkMinutes/2) cls+=" level-1"; else if(worked>=CONFIG.totalWorkMinutes/2 && worked<CONFIG.totalWorkMinutes) cls+=" level-2"; else if(worked>=CONFIG.totalWorkMinutes) cls+=" level-3";
          if(type==="leave") { cls+=isFullLeave(day)?" leave":" partial-leave"; title=`${t("personalLeave")} · ${t("leavePreview").replace("{time}",formatDuration(getLeaveMinutes(day),true))} · ${formatDuration(worked,true)} ${t("worked")}`; }
          else title=formatDuration(worked,true);
        }
        if(sameDate(day,today)) cls+=" today"; if(override?.type==="work") cls+=" custom-work";
        const fullTitle=`${formatLongDate(day)} · ${title}`;
        cells.push(`<span class="${cls}" title="${escapeHtml(fullTitle)}"></span>`);
      }
      html.push(`<div class="heatmap-month"><strong>${escapeHtml(formatMonthName(cursor))}</strong><div class="heatmap-weekdays">${weekdayNames.map(x=>`<span>${x}</span>`).join("")}</div><div class="heatmap-days">${cells.join("")}</div></div>`);
      cursor=new Date(y,m+1,1);
    }
    els.heatmapMonths.innerHTML=html.join("");
  }
  function cumulativeScheduledTargetDate(targetMinutes) {
    let remaining = Math.max(0, targetMinutes);
    for (let d = new Date(CONFIG.internshipStart); d <= CONFIG.internshipEnd; d = addDays(d, 1)) {
      const scheduled = getScheduledMinutes(d);
      if (!scheduled) continue;
      if (remaining > scheduled + .0001) { remaining -= scheduled; continue; }
      let inside = remaining;
      for (const seg of CONFIG.schedule) {
        if (seg.type !== "work") continue;
        const start=parseTime(seg.start), end=parseTime(seg.end), dur=end-start;
        if (inside <= dur + .0001) return dateWithMinutes(d,start+inside);
        inside -= dur;
      }
      return dateWithMinutes(d, parseTime(CONFIG.workdayEnd));
    }
    return dateWithMinutes(CONFIG.internshipEnd, parseTime(CONFIG.workdayEnd));
  }
  function getStoryItems(stats) {
    const planned=stats.totalPlannedMinutes;
    const defs=[
      {icon:"🌱",labelKey:"firstDayTitle",kind:"start",target:0}, {icon:"⏱",labelKey:"h100Title",kind:"hours",target:6000}, {icon:"🚀",labelKey:"h250Title",kind:"hours",target:15000},
      {icon:"⭐",labelKey:"halfwayTitle",kind:"journey",target:planned*.5}, {icon:"🏆",labelKey:"h500Title",kind:"hours",target:30000}, {icon:"💪",labelKey:"h750Title",kind:"hours",target:45000},
      {icon:"🎯",labelKey:"p75Title",kind:"journey",target:planned*.75}, {icon:"🏅",labelKey:"h800Title",kind:"hours",target:48000}, {icon:"🔥",labelKey:"h1000Title",kind:"hours",target:60000}, {icon:"🎓",labelKey:"completeTitle",kind:"complete",target:planned}
    ].filter((x,i,a)=> x.kind!=="hours" || x.target<=stats.totalAttainableMinutes+.001);
    let nextAssigned=false;
    return defs.map(item=>{
      const done=item.kind==="start" ? stats.startedDays>=1 : item.kind==="journey" ? stats.percent>=item.target/planned*100-.001 : item.kind==="complete" ? stats.journeyComplete : stats.elapsedMinutes>=item.target-.001;
      const next=!done&&!nextAssigned; if(next) nextAssigned=true;
      const date=item.kind==="journey" ? cumulativeScheduledTargetDate(item.target) : item.kind==="complete" ? dateWithMinutes(CONFIG.internshipEnd,parseTime(CONFIG.workdayEnd)) : cumulativeTargetDate(item.target);
      return {...item,done,next,date};
    });
  }
  function renderJourneyStory(stats) {
    const items=getStoryItems(stats); els.storyProgressBadge.textContent=`${stats.percent.toFixed(1)}%`;
    els.journeyStoryList.innerHTML=items.map(item=>`<article class="story-item ${item.done?"done":item.next?"next":""}"><span class="story-item-icon">${item.icon}</span><strong>${escapeHtml(t(item.labelKey))}</strong><time>${escapeHtml(formatPredictionDate(item.date))}</time><span class="story-state">${escapeHtml(t(item.done?"storyDone":item.next?"storyNext":"storyUpcoming"))}</span></article>`).join("");
  }
  function achievementProgressText(item) {
    const current=Math.min(Number(item.current)||0,Number(item.target)||1), target=Number(item.target)||1;
    if(item.unit==="hours") return `${localeNumber(current,{maximumFractionDigits:1})} / ${localeNumber(target,{maximumFractionDigits:0})} ${t("hoursShort")}`;
    if(item.unit==="percent") return `${current.toFixed(1)} / ${target}%`;
    if(item.unit==="projects") return `${Math.floor(current)} / ${Math.floor(target)} ${t("projectsShort")}`;
    if(item.unit==="entries") return `${Math.floor(current)} / ${Math.floor(target)} ${t("entriesShort")}`;
    if(item.unit==="days") return `${Math.floor(current)} / ${Math.floor(target)} ${t("daysShort")}`;
    if(item.unit==="months") return `${Math.floor(current)} / ${Math.floor(target)} ${t("monthsShort")}`;
    return `${Math.floor(current)} / ${Math.floor(target)} ${t("actionsShort")}`;
  }
  function renderAchievementShowcase(stats, achievements) {
    const unlocked=achievements.filter(a=>a.unlocked); els.statsAchievementCount.textContent=`${unlocked.length} / ${achievements.length}`;
    els.achievementsGrid.innerHTML=achievements.map(item=>{
      const when=item.unlocked ? t("unlocked") : achievementProgressText(item);
      return `<div class="achievement-card ${item.unlocked?"unlocked":"locked"}"><div class="achievement-icon">${item.unlocked?item.icon:"🔒"}</div><div class="achievement-copy"><strong>${escapeHtml(t(item.titleKey))}</strong><small>${escapeHtml(t(item.descKey))}</small><span class="achievement-date">${escapeHtml(when)}</span></div><span class="achievement-status">${escapeHtml(t(item.unlocked?"unlocked":"locked"))}</span></div>`;
    }).join("");
  }
  function applyDynamicMood(now,status) {
    ["mood-morning","mood-midday","mood-afternoon","mood-evening","mood-break","mood-finished"].forEach(c=>document.body.classList.remove(c));
    if(!state.dynamicMood || document.body.classList.contains("completed-journey")) return;
    const h=now.getHours(); document.body.classList.add(h<10?"mood-morning":h<14?"mood-midday":h<17?"mood-afternoon":"mood-evening");
    if(status.type==="break") document.body.classList.add("mood-break"); if(status.type==="finished") document.body.classList.add("mood-finished");
  }
  function updateBrowserTitle(status,dailyPercent,stats,nextBreak) {
    // Keep the browser tab clean and stable. The old title included live
    // countdown/status text, while V7/V8 page routing could also overwrite it.
    // That made the tab look like it was changing every second.
    const percent=Number.isFinite(Number(dailyPercent)) ? Math.max(0,Math.min(100,Number(dailyPercent))) : 0;
    const nextTitle=`${percent.toFixed(1)}% · Workday Journey`;
    if(document.title!==nextTitle) document.title=nextTitle;
  }
  function toastTypeFromIcon(icon,title="") {
    const text=String(title||"").toLowerCase();
    if(["✓","✅","📸"].includes(icon)) return "success";
    if(icon==="!" || icon==="✕" || /invalid|error|required|กรุณา|ไม่ถูกต้อง|ผิดพลาด/.test(text)) return "error";
    if(["🔕","⚠","⚠️"].includes(icon) || /blocked|permission|เตือน|ไม่อนุญาต/.test(text)) return "warning";
    if(icon==="💾" && /backup|สำรอง/.test(text)) return "success";
    return "info";
  }
  function showToast(icon,title,message="",type="") {
    if(!els.toastStack) return;
    const tone=type||toastTypeFromIcon(icon,title);
    const node=document.createElement("div");
    node.className=`app-toast toast-${tone}`;
    node.setAttribute("role",tone==="error"?"alert":"status");
    node.innerHTML=`<span>${icon}</span><div><strong>${escapeHtml(title)}</strong>${message?`<small>${escapeHtml(message)}</small>`:""}</div>`;
    els.toastStack.appendChild(node);
    setTimeout(()=>{node.classList.add("out");setTimeout(()=>node.remove(),250);},3600);
  }
  async function showSmartNotification(title,body,tag) {
    if(!state.notificationsEnabled || !("Notification" in window) || Notification.permission!=="granted") return;
    try {
      if("serviceWorker" in navigator && location.protocol.startsWith("http")) { const reg=await navigator.serviceWorker.ready; await reg.showNotification(title,{body,tag,icon:"assets/icons/icon-192.png",badge:"assets/icons/icon-192.png"}); }
      else new Notification(title,{body,tag});
    } catch { /* keep dashboard silent if browser blocks notifications */ }
  }
  function notificationSeenKey(date,event){return `wp-notify-${dateKey(date)}-${event}`;}
  function notifyOnce(now,event,title,body){ const key=notificationSeenKey(now,event); if(localStorage.getItem(key)==="1") return; localStorage.setItem(key,"1"); showSmartNotification(title,body,event); }
  function checkSmartNotifications(now,status,workedMinutes,nextBreak) {
    if(!state.notificationsEnabled || !("Notification" in window) || Notification.permission!=="granted" || !isScheduledWorkday(now)) return;
    if(nextBreak?.mode==="upcoming" && nextBreak.minutes<=5 && nextBreak.minutes>0) notifyOnce(now,`break-soon-${nextBreak.segment.start}`,t("notifyBreakSoonTitle"),t("notifyBreakSoonBody").replace("{time}",nextBreak.segment.start));
    const current=minutesOfDay(now);
    for(const seg of CONFIG.schedule.filter(x=>x.type==="break")){ const end=parseTime(seg.end); if(current>=end && current<end+1) notifyOnce(now,`back-${seg.end}`,t("notifyBackTitle"),t("notifyBackBody")); }
    const capacity=getActualDayCapacity(now), remaining=Math.max(0,capacity-workedMinutes); if(capacity>0 && remaining<=60 && remaining>59) notifyOnce(now,"one-hour-left",t("notifyHourLeftTitle"),t("notifyHourLeftBody"));
    if(capacity>0 && workedMinutes>=capacity) notifyOnce(now,"workday-complete",t("notifyDoneTitle"),t("notifyDoneBody"));
  }
  async function setNotificationsEnabled(enabled) {
    if(!enabled){ state.notificationsEnabled=false; els.notificationToggle.checked=false; persistV4Preferences(); return; }
    if(!("Notification" in window)){ state.notificationsEnabled=false; els.notificationToggle.checked=false; showToast("🔕",t("notificationsUnsupported")); return; }
    let permission=Notification.permission; if(permission!=="granted") permission=await Notification.requestPermission();
    if(permission==="granted"){state.notificationsEnabled=true;els.notificationToggle.checked=true;persistV4Preferences();showToast("🔔",t("notificationsEnabled"));}
    else {state.notificationsEnabled=false;els.notificationToggle.checked=false;persistV4Preferences();showToast("🔕",t("notificationsDenied"));}
  }
  function updateConnectionStatus() {
    const online=navigator.onLine; els.onlineStatus?.classList.toggle("offline",!online); const span=els.onlineStatus?.querySelector("span"); if(span) span.textContent=t(online?"online":"offline");
  }
  async function installPwa() {
    if(state.deferredInstallPrompt){ state.deferredInstallPrompt.prompt(); const choice=await state.deferredInstallPrompt.userChoice; state.deferredInstallPrompt=null; els.installAppBtn.hidden=true; if(choice.outcome==="accepted") showToast("✓",t("installed")); }
    else showToast("📱",t("installNotAvailable"));
  }
  function persistV4Preferences(){localStorage.setItem("wp-dynamic-mood",String(state.dynamicMood));localStorage.setItem("wp-notifications-enabled",String(state.notificationsEnabled));}
  function applyV4Preferences(){ if(els.dynamicMoodToggle) els.dynamicMoodToggle.checked=state.dynamicMood; if(els.notificationToggle) els.notificationToggle.checked=state.notificationsEnabled; updateConnectionStatus(); }
  function roundedRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
  async function createJourneySnapshot(finalMode=false) {
    markAchievementFlag("snapshot-created");
    const now=getConfiguredNow(),stats=getInternshipStats(now),streak=getStreakStats(now),achievements=getAchievements(stats),unlocked=achievements.filter(a=>a.unlocked),milestone=getNextMilestone(stats);
    try{await document.fonts?.ready;}catch{}
    const canvas=document.createElement("canvas");canvas.width=1600;canvas.height=900;const ctx=canvas.getContext("2d");
    const dark=resolveTheme(state.theme)==="dark"; const bg=dark?"#0d1420":"#f4f7fb",surface=dark?"#141d2c":"#ffffff",text=dark?"#edf3fb":"#152033",muted=dark?"#9aa8ba":"#718096",accent=dark?"#7098ff":"#356ae6",work=dark?"#5ed39d":"#22a06b",gold=dark?"#f3bf44":"#d89b13";
    const grad=ctx.createLinearGradient(0,0,1600,900);grad.addColorStop(0,bg);grad.addColorStop(.65,bg);grad.addColorStop(1,dark?"#17253c":"#e8f0ff");ctx.fillStyle=grad;ctx.fillRect(0,0,1600,900);
    ctx.fillStyle=accent;ctx.fillRect(90,80,78,10);ctx.fillStyle=text;ctx.font='800 58px "Sarabun", "Leelawadee UI", sans-serif';ctx.fillText(finalMode?t("finalReportCard"):"MY INTERNSHIP JOURNEY",90,165);
    ctx.fillStyle=muted;ctx.font='600 26px "Sarabun", "Leelawadee UI", sans-serif';ctx.fillText(`${formatCompactDate(CONFIG.internshipStart)}  →  ${formatCompactDate(CONFIG.internshipEnd)}`,92,210);
    roundedRect(ctx,90,260,1420,470,34);ctx.fillStyle=surface;ctx.fill();
    const bigHours=(stats.elapsedMinutes/60).toLocaleString(state.language==="th"?"th-TH":"en-US",{maximumFractionDigits:1});ctx.fillStyle=accent;ctx.font='800 116px "Sarabun", "Leelawadee UI", sans-serif';ctx.fillText(bigHours,145,430);ctx.fillStyle=muted;ctx.font='700 25px "Sarabun", "Leelawadee UI", sans-serif';ctx.fillText(t("totalWorkTime").toUpperCase(),150,472);
    const cards=[[` ${stats.startedDays} `,t("workdaysActuallyWorked")],[`${stats.percent.toFixed(1)}%`,t("scheduleJourneyProgress")],[`${stats.attendancePercent.toFixed(1)}%`,t("attendanceRate")],[`${formatDuration(stats.leaveMinutesLost,true)}`,t("leaveTimeLost")]];
    cards.forEach((c,i)=>{const x=650+(i%2)*390,y=315+Math.floor(i/2)*180;roundedRect(ctx,x,y,350,145,22);ctx.fillStyle=dark?"#182334":"#f7f9fc";ctx.fill();ctx.fillStyle=text;ctx.font='800 46px "Sarabun", "Leelawadee UI", sans-serif';ctx.fillText(c[0],x+24,y+62);ctx.fillStyle=muted;ctx.font='600 20px "Sarabun", "Leelawadee UI", sans-serif';ctx.fillText(c[1],x+24,y+101);});
    const barX=145,barY=570,barW=445,barH=22;roundedRect(ctx,barX,barY,barW,barH,11);ctx.fillStyle=dark?"#263449":"#e5eaf1";ctx.fill();roundedRect(ctx,barX,barY,barW*(stats.percent/100),barH,11);ctx.fillStyle=work;ctx.fill();ctx.fillStyle=text;ctx.font='700 24px "Sarabun", "Leelawadee UI", sans-serif';ctx.fillText(`${stats.percent.toFixed(1)}% COMPLETE`,barX,635);
    ctx.fillStyle=gold;ctx.font='700 22px "Sarabun", "Leelawadee UI", sans-serif';const nextText=milestone.complete?t("milestoneComplete"):`NEXT: ${localeNumber(milestone.targetHours,{maximumFractionDigits:1})} HOURS · ${formatPredictionDate(cumulativeTargetDate(milestone.targetHours*60))}`;ctx.fillText(nextText,barX,680);
    ctx.fillStyle=muted;ctx.font='600 20px "Sarabun", "Leelawadee UI", sans-serif';ctx.fillText(`${formatLongDate(now)} · Workday Journey V7`,90,815);ctx.fillStyle=text;ctx.font='700 20px "Sarabun", "Leelawadee UI", sans-serif';ctx.textAlign="right";ctx.fillText("MULTI-USER · PRIVATE BY DEFAULT",1510,815);ctx.textAlign="left";
    canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`workday-journey-${dateKey(now)}${finalMode?"-final":""}.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);showToast("📸",t("snapshotCreated"));},"image/png");
  }
  function renderV4(now,status,dailyPercent,stats,streak,achievements,nextBreak,workedMinutes){
    renderMilestoneForecast(stats);renderTimeMachine(now);renderHeatmap(now);renderJourneyStory(stats);renderAchievementShowcase(stats,achievements);applyDynamicMood(now,status);updateBrowserTitle(status,dailyPercent,stats,nextBreak);updateConnectionStatus();checkSmartNotifications(now,status,workedMinutes,nextBreak);
  }
  function bindV4Events(){
    els.timeMachineRange?.addEventListener("input",e=>{state.timeMachineAuto=false;state.timeMachineMinute=Number(e.target.value);renderTimeMachine(getConfiguredNow());});
    els.timeMachineDateInput?.addEventListener("change",e=>{state.timeMachineAuto=false;state.timeMachineDate=clampReplayDate(parseInputDate(e.target.value));renderTimeMachine(getConfiguredNow());});
    els.timeMachineNow?.addEventListener("click",()=>{state.timeMachineAuto=true;renderTimeMachine(getConfiguredNow());});
    els.snapshotBtn?.addEventListener("click",()=>createJourneySnapshot(false));els.statsSnapshotBtn?.addEventListener("click",()=>createJourneySnapshot(false));els.completionSnapshotBtn?.addEventListener("click",()=>createJourneySnapshot(true));
    els.dynamicMoodToggle?.addEventListener("change",e=>{state.dynamicMood=e.target.checked;persistV4Preferences();renderDashboard();});
    els.notificationToggle?.addEventListener("change",e=>setNotificationsEnabled(e.target.checked));
    els.installAppBtn?.addEventListener("click",installPwa);els.settingsInstallBtn?.addEventListener("click",installPwa);
    window.addEventListener("online",updateConnectionStatus);window.addEventListener("offline",updateConnectionStatus);
    window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();state.deferredInstallPrompt=e;els.installAppBtn.hidden=false;});
    window.addEventListener("appinstalled",()=>{state.deferredInstallPrompt=null;els.installAppBtn.hidden=true;showToast("✓",t("installed"));});
    els.resetSettings?.addEventListener("click",()=>{state.dynamicMood=true;state.notificationsEnabled=false;persistV4Preferences();applyV4Preferences();});
  }
  function initPwa(){
    if("serviceWorker" in navigator && (location.protocol==="https:" || location.hostname==="localhost" || location.hostname==="127.0.0.1")) {
      let reloading = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => { if (!state.refreshForUpdate || reloading) return; reloading = true; location.reload(); });
      navigator.serviceWorker.register(`./service-worker.js?v=${APP_VERSION}`).then(reg => {
        if (reg.waiting) showUpdateBanner(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const worker = reg.installing; if (!worker) return;
          worker.addEventListener("statechange", () => { if (worker.state === "installed" && navigator.serviceWorker.controller) showUpdateBanner(worker); });
        });
        setInterval(() => reg.update().catch(()=>{}), 60 * 60 * 1000);
      }).catch(()=>{});
    }
    const standalone=window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone===true; if(standalone) els.installAppBtn.hidden=true;
  }

  function renderDashboard() {
    const now = getConfiguredNow(), workedMinutes = getWorkedMinutes(now), todayCapacity = getActualDayCapacity(now), dailyPercent = todayCapacity ? clamp(workedMinutes / todayCapacity * 100, 0, 100) : 0, status = getDayStatus(now), nextBreak = getNextBreak(now);
    const stats = getInternshipStats(now), streak = getStreakStats(now), achievements = getAchievements(stats);
    state.latestStats = stats; state.latestAchievements = achievements;

    els.greeting.textContent = t(getGreetingKey(now)); els.todayLongDate.textContent = formatLongDate(now); els.clockTime.textContent = formatTime(now); els.clockDate.textContent = formatShortDate(now);
    els.dailyPercent.textContent = `${dailyPercent.toFixed(1)}%`; els.dailyProgressRing.style.setProperty("--progress", `${dailyPercent * 3.6}deg`);
    els.workedTime.textContent = formatDuration(workedMinutes); els.remainingTime.textContent = formatDuration(Math.max(0, todayCapacity - workedMinutes));
    renderStatus(status); renderTodaySpecialBadge(now); renderMilestones(dailyPercent); renderLiveCountdown(now, status);

    const heroKey = status.type === "work" ? "heroWorking" : status.type === "break" ? "heroBreak" : status.type === "finished" ? "heroFinished" : status.type === "weekend" ? "heroWeekend" : status.type === "holiday" ? "heroHoliday" : status.type === "leave" ? "heroLeave" : "heroBefore";
    els.heroMessage.textContent = heroKey === "heroBefore" ? t(heroKey).replace("07:00", CONFIG.workdayStart).replace("{time}", CONFIG.workdayStart) : t(heroKey);
    els.nextBreakValue.textContent = nextBreak ? `${nextBreak.time} · ${nextBreak.minutes}m` : t("noMoreBreak");

    els.internshipPercentBadge.textContent = `${stats.percent.toFixed(1)}%`; els.internshipProgressBar.style.width = `${stats.percent}%`;
    els.workdayCounter.textContent = `${t("dayPrefix")} ${stats.currentDay} / ${stats.totalDays}`;
    els.daysLeft.textContent = localeNumber(stats.futureWorkdays); els.hoursLeft.textContent = formatDuration(stats.minutesLeft);
    els.internshipStartLabel.textContent = formatCompactDate(CONFIG.internshipStart); els.internshipEndLabel.textContent = formatCompactDate(CONFIG.internshipEnd);

    const today = localDateOnly(now), calendarDays = today > CONFIG.internshipEnd ? 0 : today < CONFIG.internshipStart ? diffCalendarDays(today, CONFIG.internshipEnd) : Math.max(0, diffCalendarDays(today, CONFIG.internshipEnd));
    els.calendarDaysLeft.textContent = localeNumber(calendarDays); els.countdownWorkdays.textContent = localeNumber(stats.futureWorkdays); els.countdownHours.textContent = formatDuration(stats.minutesLeft);
    els.countdownSentence.textContent = t("daysLeftSentence").replace("{days}", localeNumber(stats.futureWorkdays)).replace("{date}", formatCompactDate(CONFIG.internshipEnd));

    renderTimeline(now); renderScheduleList(now); renderWeeklyProgress(now); renderJourneyOverview(stats, streak, achievements); renderAttendanceOverview(stats); renderJourneyTimeline(stats); renderCalendar(now); renderStatsModal(stats, streak, achievements); renderCompletionState(stats, achievements);
    renderV4(now, status, dailyPercent, stats, streak, achievements, nextBreak, workedMinutes);
    els.lastUpdated.textContent = `${t("updated")} ${formatTime(now)}`;
    renderJourneyConfigUI();
    checkAchievementNotifications(achievements);
  }


  function workdayKeysFromConfig(config = CONFIG) {
    const keyMap = {0:"sunday",1:"monday",2:"tuesday",3:"wednesday",4:"thursday",5:"friday",6:"saturday"};
    return config.workdays.map(day => keyMap[day]).filter(Boolean);
  }
  function displayProfileName() {
    if (state.privacyMode === "demo") return t("demoJourneyName");
    return CONFIG.profileName || t("myJourney");
  }
  function applyPrivacyMode() {
    document.body.classList.toggle("demo-mode", state.privacyMode === "demo");
    if (els.privacyModeSelect) els.privacyModeSelect.value = state.privacyMode;
    if (els.profileQuickName) els.profileQuickName.textContent = displayProfileName();
  }
  function renderJourneyConfigUI() {
    if (els.footerVersion) els.footerVersion.textContent = `v${APP_VERSION}`;
    if (els.finishTimeValue) els.finishTimeValue.textContent = CONFIG.workdayEnd;
    if (els.leaveHoursInput) els.leaveHoursInput.max = Math.ceil(CONFIG.totalWorkMinutes / 60);
    const heatLegend = document.querySelector(".heatmap-legend"); if (heatLegend) heatLegend.innerHTML = `<span><i class="heat-0"></i>0h</span><span><i class="heat-1"></i>&lt;50%</span><span><i class="heat-2"></i>50–99%</span><span><i class="heat-3"></i>100%</span>`;
    if (els.settingsScheduleValue) els.settingsScheduleValue.textContent = `${CONFIG.workdayStart} – ${CONFIG.workdayEnd}`;
    if (els.settingsWorkTimeValue) els.settingsWorkTimeValue.textContent = formatDuration(CONFIG.totalWorkMinutes, true);
    if (els.settingsBreakTimeValue) els.settingsBreakTimeValue.textContent = formatDuration(CONFIG.totalBreakMinutes, true);
    if (els.settingsRangeValue) els.settingsRangeValue.textContent = `${formatShortDate(CONFIG.internshipStart)} – ${formatShortDate(CONFIG.internshipEnd)}`;
    if (els.timezoneSelect) els.timezoneSelect.value = CONFIG.timezone;
    if (els.localeSelect) els.localeSelect.value = CONFIG.locale;
    const dayNames = workdayKeysFromConfig().map(key => t(key)).join(" · ");
    if (els.journeyProfileSummary) els.journeyProfileSummary.textContent = `${displayProfileName()} · ${formatCompactDate(CONFIG.internshipStart)} → ${formatCompactDate(CONFIG.internshipEnd)} · ${CONFIG.workdayStart}–${CONFIG.workdayEnd} · ${dayNames}`;
    if (els.timeMachineDateInput) { els.timeMachineDateInput.min = formatInputDate(CONFIG.internshipStart); els.timeMachineDateInput.max = formatInputDate(CONFIG.internshipEnd); }
    if (els.timeMachineRange) { els.timeMachineRange.min = parseTime(CONFIG.workdayStart); els.timeMachineRange.max = parseTime(CONFIG.workdayEnd); }
    const replayLabels = document.querySelector(".time-machine-labels");
    if (replayLabels) {
      const markers = [CONFIG.workdayStart, ...CONFIG.schedule.filter(x => x.type === "break").map(x => x.start), CONFIG.workdayEnd];
      replayLabels.innerHTML = markers.map(x => `<span>${x}</span>`).join("");
    }
    applyPrivacyMode();
  }
  function setupDatePattern(locale = els.setupLocaleSelect?.value || CONFIG.locale) {
    return locale === "en-US" ? "MM/DD/YYYY" : "DD/MM/YYYY";
  }
  function setupDatePartsToIso(year, month, day) {
    const y = Number(year), m = Number(month), d = Number(day);
    if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d) || y < 1900 || y > 2200 || m < 1 || m > 12 || d < 1 || d > 31) return "";
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return "";
    return `${String(y).padStart(4,"0")}-${pad(m)}-${pad(d)}`;
  }
  function parseSetupDateText(value, locale = els.setupLocaleSelect?.value || CONFIG.locale) {
    const text = String(value || "").trim();
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (iso) return setupDatePartsToIso(iso[1], iso[2], iso[3]);
    const match = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/.exec(text);
    if (!match) return "";
    const first = Number(match[1]), second = Number(match[2]), year = Number(match[3]);
    const month = locale === "en-US" ? first : second;
    const day = locale === "en-US" ? second : first;
    return setupDatePartsToIso(year, month, day);
  }
  function formatSetupDateText(isoValue, locale = els.setupLocaleSelect?.value || CONFIG.locale) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoValue || ""));
    if (!match) return "";
    const year = match[1], month = match[2], day = match[3];
    return locale === "en-US" ? `${month}/${day}/${year}` : `${day}/${month}/${year}`;
  }
  function maskSetupDateTyping(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0,2)}/${digits.slice(2)}`;
    return `${digits.slice(0,2)}/${digits.slice(2,4)}/${digits.slice(4)}`;
  }
  function syncSetupDateFromText(textInput, pickerInput, normalize = false) {
    if (!textInput || !pickerInput) return "";
    const iso = parseSetupDateText(textInput.value);
    pickerInput.value = iso;
    if (normalize && iso) textInput.value = formatSetupDateText(iso);
    return iso;
  }
  function refreshSetupDateControls() {
    const locale = els.setupLocaleSelect?.value || CONFIG.locale;
    const pattern = setupDatePattern(locale);
    [
      [els.setupStartDate, els.setupStartDatePicker, els.setupStartDateFormat],
      [els.setupEndDate, els.setupEndDatePicker, els.setupEndDateFormat]
    ].forEach(([textInput, pickerInput, formatNode]) => {
      if (!textInput || !pickerInput) return;
      const iso = pickerInput.value || parseSetupDateText(textInput.value, locale);
      textInput.placeholder = pattern;
      if (formatNode) formatNode.textContent = pattern;
      if (iso) { pickerInput.value = iso; textInput.value = formatSetupDateText(iso, locale); }
    });
  }
  function openSetupDatePicker(textInput, pickerInput) {
    if (!pickerInput) return;
    syncSetupDateFromText(textInput, pickerInput, false);
    try {
      if (typeof pickerInput.showPicker === "function") pickerInput.showPicker();
      else pickerInput.click();
    } catch (_) { pickerInput.click(); }
  }
  function bindSetupDateControl(textInput, pickerInput, button) {
    if (!textInput || !pickerInput) return;
    textInput.addEventListener("input", () => { textInput.value = maskSetupDateTyping(textInput.value); pickerInput.value = parseSetupDateText(textInput.value) || ""; updateSetupSchedulePreview(); if (state.setupStep === 4) renderSetupCalendar(); });
    textInput.addEventListener("blur", () => { syncSetupDateFromText(textInput, pickerInput, true); updateSetupSchedulePreview(); });
    pickerInput.addEventListener("change", () => { if (pickerInput.value) textInput.value = formatSetupDateText(pickerInput.value); updateSetupSchedulePreview(); if (state.setupStep === 4) renderSetupCalendar(); });
    button?.addEventListener("click", () => openSetupDatePicker(textInput, pickerInput));
  }

  function cloneOverrides(source = {}) {
    try { return JSON.parse(JSON.stringify(source || {})); } catch (_) { return {}; }
  }
  function getSetupRuntime() {
    return hydrateRuntimeConfig(collectSetupConfig());
  }
  function getSetupRange() {
    const runtime = getSetupRuntime();
    return { start: runtime.internshipStart, end: runtime.internshipEnd };
  }
  function isSetupDateInRange(date) {
    const { start, end } = getSetupRange();
    const day = localDateOnly(date);
    return day >= start && day <= end;
  }
  function clampSetupCalendarMonth() {
    const { start, end } = getSetupRange();
    const min = startOfMonth(start), max = startOfMonth(end);
    if (!state.setupCalendarDate || state.setupCalendarDate < min) state.setupCalendarDate = new Date(min);
    if (state.setupCalendarDate > max) state.setupCalendarDate = new Date(max);
  }
  function setupLeaveMinutesFromControls() {
    const runtime = getSetupRuntime();
    const mode = els.setupCalendarLeaveMode?.value || state.setupCalendarLeaveMode || "full";
    state.setupCalendarLeaveMode = mode;
    if (mode === "half") return Math.max(1, Math.round(runtime.totalWorkMinutes / 2));
    if (mode === "custom") {
      const h = clamp(Number(els.setupCalendarLeaveHours?.value || 0), 0, 24);
      const m = clamp(Number(els.setupCalendarLeaveMinutes?.value || 0), 0, 59);
      return clamp(Math.round(h * 60 + m), 1, runtime.totalWorkMinutes);
    }
    return runtime.totalWorkMinutes;
  }
  function sanitizeSetupOverrides(overrides, rawConfig) {
    const runtime = hydrateRuntimeConfig(rawConfig);
    const out = {};
    for (const [key, value] of Object.entries(overrides || {})) {
      const date = parseConfigDate(key, new Date(1900,0,1));
      if (date < runtime.internshipStart || date > runtime.internshipEnd || !value || !["holiday","leave","work"].includes(value.type)) continue;
      if (value.type === "leave") {
        const leaveMinutes = clamp(Number(value.leaveMinutes || runtime.totalWorkMinutes), 1, runtime.totalWorkMinutes);
        const leaveMode = value.leaveMode === "half" || value.leaveMode === "custom" ? value.leaveMode : "full";
        out[key] = { type: "leave", leaveMode, leaveMinutes: Math.round(leaveMinutes), scheduledMinutes: runtime.totalWorkMinutes, note: String(value.note || "") };
      } else out[key] = { type: value.type, note: String(value.note || "") };
    }
    return out;
  }
  function setupOverrideLabel(type) {
    if (type === "holiday") return t("companyHoliday");
    if (type === "leave") return t("personalLeave");
    if (type === "work") return t("compensatoryWorkday");
    return t("normalSchedule");
  }
  function refreshSetupCalendarTypeButtons() {
    document.querySelectorAll(".setup-day-type-btn").forEach(btn => btn.classList.toggle("selected", btn.dataset.setupDayType === state.setupCalendarType));
    if (els.setupCalendarLeavePanel) els.setupCalendarLeavePanel.hidden = state.setupCalendarType !== "leave";
    if (els.setupCalendarCustomLeave) els.setupCalendarCustomLeave.hidden = (els.setupCalendarLeaveMode?.value || state.setupCalendarLeaveMode) !== "custom";
  }
  function renderSetupHolidayChips() {
    if (!els.setupHolidayChips) return;
    const locale = els.setupLocaleSelect?.value || CONFIG.locale;
    const { start, end } = getSetupRange();
    els.setupHolidayChips.innerHTML = DEFAULT_COMPANY_HOLIDAYS.map(key => {
      const date = parseConfigDate(key, new Date());
      const inRange = date >= start && date <= end;
      const active = state.setupDayOverrides[key]?.type === "holiday";
      return `<button type="button" class="setup-holiday-chip ${active ? "active" : ""} ${inRange ? "" : "out-of-range"}" data-setup-holiday-date="${key}" title="${escapeHtml(setupOverrideLabel(active ? "holiday" : "default"))}">${escapeHtml(formatSetupDateText(key, locale))}${active ? " <span>\u2713</span>" : ""}</button>`;
    }).join("");
  }
  function renderSetupCalendar() {
    if (!els.setupCalendarGrid) return;
    clampSetupCalendarMonth();
    refreshSetupCalendarTypeButtons();
    renderSetupHolidayChips();
    const { start, end } = getSetupRange();
    const month = state.setupCalendarDate;
    const y = month.getFullYear(), m = month.getMonth();
    const locale = els.setupLocaleSelect?.value || CONFIG.locale;
    els.setupCalendarMonthTitle.textContent = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month);
    const weekdayKeys = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
    els.setupCalendarWeekdays.innerHTML = weekdayKeys.map(key => `<span>${escapeHtml(t(key))}</span>`).join("");
    const firstDay = new Date(y, m, 1), lastDate = new Date(y, m + 1, 0).getDate();
    const lead = (firstDay.getDay() + 6) % 7;
    const cells = [];
    for (let i = 0; i < lead; i++) cells.push('<span class="setup-calendar-day blank"></span>');
    for (let d = 1; d <= lastDate; d++) {
      const date = new Date(y, m, d), key = dateKey(date), override = state.setupDayOverrides[key];
      const inRange = date >= start && date <= end;
      const type = override?.type || "default";
      const classes = ["setup-calendar-day", type];
      if (!inRange) classes.push("outside");
      if (DEFAULT_COMPANY_HOLIDAYS.includes(key)) classes.push("recommended");
      const title = inRange ? setupOverrideLabel(type) : t("outsideInternship");
      const icon = type === "holiday" ? "\ud83c\udfe2" : type === "leave" ? "\ud83c\udfd6\ufe0f" : type === "work" ? "\ud83d\udd04" : "";
      cells.push(`<button type="button" class="${classes.join(" ")}" data-setup-calendar-date="${key}" ${inRange ? "" : "disabled"} title="${escapeHtml(title)}"><span>${d}</span>${icon ? `<i>${icon}</i>` : ""}</button>`);
    }
    els.setupCalendarGrid.innerHTML = cells.join("");
    const counts = { holiday: 0, leave: 0, work: 0 };
    for (const [key, value] of Object.entries(state.setupDayOverrides)) {
      const date = parseConfigDate(key, new Date(1900,0,1));
      if (date < start || date > end || !Object.prototype.hasOwnProperty.call(counts, value?.type)) continue;
      counts[value.type]++;
    }
    els.setupCalendarSummary.textContent = t("calendarSetupSummary").replace("{holiday}", counts.holiday).replace("{leave}", counts.leave).replace("{work}", counts.work);
    const minMonth = startOfMonth(start), maxMonth = startOfMonth(end);
    if (els.setupCalendarPrev) els.setupCalendarPrev.disabled = month <= minMonth;
    if (els.setupCalendarNext) els.setupCalendarNext.disabled = month >= maxMonth;
  }
  function setSetupCalendarType(type) {
    if (!["default","holiday","leave","work"].includes(type)) return;
    state.setupCalendarType = type;
    refreshSetupCalendarTypeButtons();
  }
  function applySetupCalendarDate(key) {
    const date = parseConfigDate(key, new Date(1900,0,1));
    if (!isSetupDateInRange(date)) return;
    if (state.setupCalendarType === "default") delete state.setupDayOverrides[key];
    else if (state.setupCalendarType === "leave") {
      const runtime = getSetupRuntime();
      const leaveMinutes = setupLeaveMinutesFromControls();
      state.setupDayOverrides[key] = { type: "leave", leaveMode: state.setupCalendarLeaveMode, leaveMinutes, scheduledMinutes: runtime.totalWorkMinutes, note: "" };
    } else state.setupDayOverrides[key] = { type: state.setupCalendarType, note: "" };
    renderSetupCalendar();
  }
  function restoreSetupDefaultHolidays() {
    for (const [key, value] of Object.entries(createDefaultCompanyHolidayOverrides())) state.setupDayOverrides[key] = value;
    renderSetupCalendar();
  }
  function setSetupStep(step) {
    state.setupStep = clamp(Number(step) || 1, 1, 4);
    document.querySelectorAll(".setup-step").forEach(node => node.classList.toggle("active", Number(node.dataset.setupStep) === state.setupStep));
    document.querySelectorAll(".setup-progress-item").forEach(node => {
      const n = Number(node.dataset.setupJump); node.classList.toggle("active", n === state.setupStep); node.classList.toggle("done", n < state.setupStep);
    });
    if (els.setupCancelBtn) els.setupCancelBtn.hidden = state.setupMode !== "edit";
    if (els.setupBackBtn) els.setupBackBtn.hidden = state.setupStep === 1;
    if (els.setupNextBtn) els.setupNextBtn.hidden = state.setupStep === 4;
    if (els.setupSaveBtn) { els.setupSaveBtn.hidden = state.setupStep !== 4; els.setupSaveBtn.textContent = t(state.setupMode === "edit" ? "saveChanges" : "startJourney"); }
    if (els.setupError) els.setupError.hidden = true;
    updateSetupSchedulePreview();
    if (state.setupStep === 4) renderSetupCalendar();
  }
  function populateSetupForm(config = journeyConfig) {
    const normalized = normalizeJourneyConfig(config);
    els.setupNameInput.value = normalized.profileName;
    els.setupLanguageSelect.value = state.language;
    els.setupTimezoneSelect.value = normalized.timezone;
    els.setupLocaleSelect.value = normalized.locale;
    if (els.setupStartDatePicker) els.setupStartDatePicker.value = normalized.startDate;
    if (els.setupEndDatePicker) els.setupEndDatePicker.value = normalized.endDate;
    els.setupStartDate.value = formatSetupDateText(normalized.startDate, normalized.locale);
    els.setupEndDate.value = formatSetupDateText(normalized.endDate, normalized.locale);
    refreshSetupDateControls();
    els.setupWorkStart.value = normalized.workdayStart;
    els.setupWorkEnd.value = normalized.workdayEnd;
    document.querySelectorAll(".setup-workday").forEach(input => { input.checked = normalized.workdays.includes(Number(input.value)); });
    for (let i = 1; i <= 3; i++) {
      const br = normalized.breaks[i - 1];
      const enabled = $(`setupBreakEnabled${i}`), start = $(`setupBreakStart${i}`), end = $(`setupBreakEnd${i}`);
      if (enabled) enabled.checked = Boolean(br);
      if (start) start.value = br?.start || DEFAULT_JOURNEY_CONFIG.breaks[i - 1]?.start || normalized.workdayStart;
      if (end) end.value = br?.end || DEFAULT_JOURNEY_CONFIG.breaks[i - 1]?.end || normalized.workdayStart;
    }
    updateSetupSchedulePreview();
  }
  function collectSetupConfig() {
    const workdays = [...document.querySelectorAll(".setup-workday:checked")].map(input => Number(input.value));
    const breaks = [];
    for (let i = 1; i <= 3; i++) {
      if ($(`setupBreakEnabled${i}`)?.checked) breaks.push({ start: $(`setupBreakStart${i}`).value, end: $(`setupBreakEnd${i}`).value });
    }
    return {
      profileName: els.setupNameInput.value.trim(),
      startDate: parseSetupDateText(els.setupStartDate.value, els.setupLocaleSelect.value),
      endDate: parseSetupDateText(els.setupEndDate.value, els.setupLocaleSelect.value),
      workdayStart: els.setupWorkStart.value,
      workdayEnd: els.setupWorkEnd.value,
      workdays,
      breaks,
      timezone: els.setupTimezoneSelect.value,
      locale: els.setupLocaleSelect.value
    };
  }
  function setupValidationMessage(raw) {
    const start = parseConfigDate(raw.startDate, new Date(2000,0,1)), end = parseConfigDate(raw.endDate, new Date(1999,0,1));
    if (!raw.startDate || !raw.endDate || end < start) return t("setupValidationDates");
    if (!raw.workdays?.length) return t("setupValidationDays");
    const startMin = timeToMinutes(raw.workdayStart), endMin = timeToMinutes(raw.workdayEnd);
    if (!Number.isFinite(startMin) || !Number.isFinite(endMin) || endMin <= startMin) return t("setupValidationTime");
    const sorted = [...(raw.breaks || [])].sort((a,b) => timeToMinutes(a.start) - timeToMinutes(b.start));
    let lastEnd = startMin;
    for (const br of sorted) {
      const a = timeToMinutes(br.start), b = timeToMinutes(br.end);
      if (!Number.isFinite(a) || !Number.isFinite(b) || a < startMin || b > endMin || b <= a || a < lastEnd) return t("setupValidationTime");
      lastEnd = b;
    }
    const runtime = hydrateRuntimeConfig(raw);
    if (runtime.totalWorkMinutes < 1) return t("setupValidationTime");
    return "";
  }
  function updateSetupSchedulePreview() {
    if (!els.setupSchedulePreview) return;
    const raw = collectSetupConfig();
    const err = setupValidationMessage(raw);
    if (err && state.setupStep === 3) { els.setupSchedulePreview.innerHTML = `<span>⚠</span><strong>${escapeHtml(err)}</strong>`; return; }
    const runtime = hydrateRuntimeConfig(raw);
    els.setupSchedulePreview.innerHTML = `<div><span>${escapeHtml(t("workTime"))}</span><strong>${escapeHtml(formatDuration(runtime.totalWorkMinutes,true))}</strong></div><div><span>${escapeHtml(t("totalBreak"))}</span><strong>${escapeHtml(formatDuration(runtime.totalBreakMinutes,true))}</strong></div><div><span>${escapeHtml(t("schedule"))}</span><strong>${escapeHtml(runtime.workdayStart)} – ${escapeHtml(runtime.workdayEnd)}</strong></div>`;
  }
  function openSetupWizard(mode = "first") {
    state.setupMode = mode; state.setupStep = 1; state.setupOriginalLanguage = state.language;
    populateSetupForm(mode === "first" && !state.setupCompleted ? DEFAULT_JOURNEY_CONFIG : journeyConfig);
    state.setupDayOverrides = mode === "edit" ? cloneOverrides(state.dayOverrides) : createDefaultCompanyHolidayOverrides();
    state.setupCalendarDate = startOfMonth(parseConfigDate((mode === "edit" ? journeyConfig : DEFAULT_JOURNEY_CONFIG).startDate, new Date()));
    state.setupCalendarType = "holiday"; state.setupCalendarLeaveMode = "full";
    if (els.setupCalendarLeaveMode) els.setupCalendarLeaveMode.value = "full";
    els.setupBackdrop.hidden = false; requestAnimationFrame(() => els.setupBackdrop.classList.add("open"));
    document.body.classList.add("setup-open"); setSetupStep(1);
  }
  function closeSetupWizard() {
    if (state.setupMode === "first" && !state.setupCompleted) return;
    if (state.setupMode === "edit") { state.language = state.setupOriginalLanguage; renderTranslations(); }
    els.setupBackdrop.classList.remove("open"); document.body.classList.remove("setup-open");
    setTimeout(() => { if (!els.setupBackdrop.classList.contains("open")) els.setupBackdrop.hidden = true; }, 180);
  }
  function saveSetupJourney() {
    const raw = collectSetupConfig(), error = setupValidationMessage(raw);
    if (error) { els.setupError.textContent = error; els.setupError.hidden = false; return; }
    const priorRange = `${journeyConfig.startDate}|${journeyConfig.endDate}|${journeyConfig.workdayStart}|${journeyConfig.workdayEnd}|${journeyConfig.workdays.join(",")}`;
    const setupOverrides = sanitizeSetupOverrides(state.setupDayOverrides, raw);
    applyJourneyConfig(raw, true);
    state.dayOverrides = setupOverrides;
    state.language = els.setupLanguageSelect.value;
    state.timezone = CONFIG.timezone; state.locale = CONFIG.locale; state.setupCompleted = true; state.selectedLeaveMinutes = CONFIG.totalWorkMinutes;
    localStorage.setItem("wp-setup-completed", "true"); localStorage.setItem("wp-timezone", state.timezone); localStorage.setItem("wp-locale", state.locale);
    const nextRange = `${journeyConfig.startDate}|${journeyConfig.endDate}|${journeyConfig.workdayStart}|${journeyConfig.workdayEnd}|${journeyConfig.workdays.join(",")}`;
    if (priorRange !== nextRange) { state.timeMachineAuto = true; state.timeMachineDate = null; state.calendarDate = startOfMonth(getConfiguredNow()); }
    persistPreferences(); applyPreferences(); renderTranslations(); renderJourneyConfigUI(); renderDashboard();
    els.setupBackdrop.classList.remove("open"); els.setupBackdrop.hidden = true; document.body.classList.remove("setup-open");
    showToast("✓", state.setupMode === "edit" ? t("saveChanges") : t("startJourney"));
  }
  function setJourneyMeta(patch) {
    applyJourneyConfig({ ...journeyConfig, ...patch }, true);
    state.timezone = CONFIG.timezone; state.locale = CONFIG.locale;
    localStorage.setItem("wp-timezone", state.timezone); localStorage.setItem("wp-locale", state.locale);
    renderTranslations(); renderJourneyConfigUI(); renderDashboard();
  }
  function exportBackup() {
    markAchievementFlag("backup-exported");
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i); if (key?.startsWith("wp-") && !key.startsWith("wp-notify-") && !key.startsWith("wp-v8-cloud-") && key !== "wp-v8-data-updated-at") data[key] = localStorage.getItem(key);
    }
    const payload = { app: "Workday Journey", version: APP_VERSION, schemaVersion: BACKUP_SCHEMA_VERSION, exportedAt: new Date().toISOString(), data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob), a = document.createElement("a"); a.href = url; a.download = `workday-journey-backup-${dateKey(getConfiguredNow())}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("💾", t("backupCreated"));
  }
  function migrateBackupPayload(payload) {
    const schema = Number(payload?.schemaVersion || 1);
    if (!payload || payload.app !== "Workday Journey" || typeof payload.data !== "object" || Array.isArray(payload.data)) throw new Error("invalid");
    if (!Number.isFinite(schema) || schema < 1 || schema > BACKUP_SCHEMA_VERSION) throw new Error("schema");
    const data = { ...payload.data };
    if (schema < 2 && typeof data["wp-v6-projects"] === "string") {
      try {
        const projects = JSON.parse(data["wp-v6-projects"]);
        if (Array.isArray(projects)) data["wp-v6-projects"] = JSON.stringify(projects.map(project => ({ ...project, archived: !!project.archived })));
      } catch {}
    }
    return { ...payload, schemaVersion: BACKUP_SCHEMA_VERSION, data };
  }
  async function importBackupFile(file) {
    try {
      const payload = migrateBackupPayload(JSON.parse(await file.text()));
      if (window.WorkdayDataSafety?.confirmRisk && !window.WorkdayDataSafety.confirmRisk("import")) return;
      if (!confirm(t("importConfirm"))) return;
      [...Array(localStorage.length)].map((_,i) => localStorage.key(i)).filter(Boolean).filter(k => k.startsWith("wp-")).forEach(k => localStorage.removeItem(k));
      for (const [key, value] of Object.entries(payload.data)) if (key.startsWith("wp-") && typeof value === "string") localStorage.setItem(key, value);
      localStorage.setItem(DATA_RESET_MARKER, DATA_RESET_VERSION);
      localStorage.setItem("wp-app-version", APP_VERSION); alert(t("backupImported")); location.reload();
    } catch { showToast("!", t("invalidBackup")); }
  }
  function clearJourneyStorage() {
    const fixed = ["wp-day-overrides","wp-seen-achievements","wp-achievements-initialized","wp-completion-seen","wp-journey-config","wp-setup-completed",
      "wp-v6-journal","wp-v6-projects","wp-v6-recap-dismissed","wp-v7-achievement-flags","wp-v7-ever-achievements","wp-v7-achievement-unlocked-at","wp-v7-selected-title","wp-v7-perfect-month-key","wp-v74-achievements-migrated"];
    fixed.forEach(k => localStorage.removeItem(k));
    const transient = []; for (let i=0;i<localStorage.length;i++){ const key=localStorage.key(i); if(key?.startsWith("wp-notify-")) transient.push(key); } transient.forEach(k=>localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent("workday:journey-cleared"));
  }
  function startNewJourney() {
    if (window.WorkdayDataSafety?.confirmRisk && !window.WorkdayDataSafety.confirmRisk("journey")) return;
    if (!confirm(t("newJourneyConfirm"))) return;
    clearJourneyStorage(); state.dayOverrides = {}; state.setupCompleted = false; applyJourneyConfig(DEFAULT_JOURNEY_CONFIG, false); journeyConfig = normalizeJourneyConfig(DEFAULT_JOURNEY_CONFIG); openSetupWizard("first");
  }
  async function resetAllData() {
    if (window.WorkdayDataSafety?.confirmRisk && !window.WorkdayDataSafety.confirmRisk("reset")) return;
    if (!confirm(t("resetAllConfirm"))) return;
    if (window.WorkdayV8Cloud?.isSignedIn?.()) { const ok = await window.WorkdayV8Cloud.deleteCloudState?.(); if (ok === false) return; }
    const keys=[]; for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.startsWith("wp-"))keys.push(key);} keys.forEach(k=>localStorage.removeItem(k)); localStorage.setItem(DATA_RESET_MARKER, DATA_RESET_VERSION); location.reload();
  }
  async function shareJourneySummary() {
    const now = getConfiguredNow(), stats = getInternshipStats(now);
    const person = state.privacyMode === "demo" ? t("demoJourneyName") : (CONFIG.profileName || t("myJourney"));
    const text = `${person}\n${stats.percent.toFixed(1)}% · ${formatDuration(stats.elapsedMinutes,true)} · ${stats.startedDays} ${t("daysShort")} · Attendance ${stats.attendancePercent.toFixed(1)}%\n${formatCompactDate(CONFIG.internshipStart)} → ${formatCompactDate(CONFIG.internshipEnd)}`;
    const shareData = { title: t("shareTitle"), text, url: location.origin === "null" ? "" : `${location.origin}${location.pathname}` };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText([text, shareData.url].filter(Boolean).join("\n")); showToast("✓", t("shareCopied")); }
    } catch (error) { if (error?.name !== "AbortError") showToast("!", t("shareTitle"), String(error?.message || error)); }
  }
  function showUpdateBanner(worker = null) { state.pendingServiceWorker = worker || state.pendingServiceWorker; if (els.updateBanner) els.updateBanner.hidden = false; }
  function bindV5Events() {
    els.profileQuickBtn?.addEventListener("click", () => openSetupWizard("edit")); els.editJourneyBtn?.addEventListener("click", () => openSetupWizard("edit"));
    document.querySelectorAll("[data-setup-jump]").forEach(btn => btn.addEventListener("click", () => { const target=Number(btn.dataset.setupJump); if (target <= state.setupStep) setSetupStep(target); }));
    els.setupCancelBtn?.addEventListener("click", closeSetupWizard);
    els.setupBackBtn?.addEventListener("click", () => setSetupStep(state.setupStep - 1));
    els.setupNextBtn?.addEventListener("click", () => {
      const error = setupValidationMessage(collectSetupConfig());
      if (state.setupStep >= 2 && error) { els.setupError.textContent = error; els.setupError.hidden = false; return; }
      setSetupStep(state.setupStep + 1);
    });
    els.setupSaveBtn?.addEventListener("click", saveSetupJourney);
    els.setupDefaultsBtn?.addEventListener("click", () => { populateSetupForm(DEFAULT_JOURNEY_CONFIG); state.setupDayOverrides = createDefaultCompanyHolidayOverrides(); state.setupCalendarDate = startOfMonth(parseConfigDate(DEFAULT_JOURNEY_CONFIG.startDate, new Date())); state.setupCalendarType = "holiday"; state.setupCalendarLeaveMode = "full"; if (els.setupCalendarLeaveMode) els.setupCalendarLeaveMode.value = "full"; state.language="th"; els.setupLanguageSelect.value="th"; renderTranslations(); if (state.setupStep === 4) renderSetupCalendar(); });
    els.setupLanguageSelect?.addEventListener("change", e => { state.language=e.target.value; renderTranslations(); setSetupStep(state.setupStep); });
    bindSetupDateControl(els.setupStartDate, els.setupStartDatePicker, els.setupStartDatePickerBtn);
    bindSetupDateControl(els.setupEndDate, els.setupEndDatePicker, els.setupEndDatePickerBtn);
    els.setupLocaleSelect?.addEventListener("change", () => { refreshSetupDateControls(); updateSetupSchedulePreview(); if (state.setupStep === 4) renderSetupCalendar(); });
    document.querySelectorAll(".setup-day-type-btn").forEach(btn => btn.addEventListener("click", () => setSetupCalendarType(btn.dataset.setupDayType)));
    els.setupCalendarLeaveMode?.addEventListener("change", e => { state.setupCalendarLeaveMode = e.target.value; refreshSetupCalendarTypeButtons(); });
    [els.setupCalendarLeaveHours, els.setupCalendarLeaveMinutes].filter(Boolean).forEach(input => input.addEventListener("input", () => { state.setupCalendarLeaveMode = "custom"; if (els.setupCalendarLeaveMode) els.setupCalendarLeaveMode.value = "custom"; refreshSetupCalendarTypeButtons(); }));
    els.setupCalendarPrev?.addEventListener("click", () => { state.setupCalendarDate = new Date(state.setupCalendarDate.getFullYear(), state.setupCalendarDate.getMonth() - 1, 1); renderSetupCalendar(); });
    els.setupCalendarNext?.addEventListener("click", () => { state.setupCalendarDate = new Date(state.setupCalendarDate.getFullYear(), state.setupCalendarDate.getMonth() + 1, 1); renderSetupCalendar(); });
    els.setupCalendarGrid?.addEventListener("click", e => { const btn = e.target.closest("[data-setup-calendar-date]"); if (btn && !btn.disabled) applySetupCalendarDate(btn.dataset.setupCalendarDate); });
    els.setupHolidayChips?.addEventListener("click", e => { const btn = e.target.closest("[data-setup-holiday-date]"); if (!btn) return; const date = parseConfigDate(btn.dataset.setupHolidayDate, new Date()); state.setupCalendarDate = startOfMonth(date); renderSetupCalendar(); });
    els.setupRestoreHolidaysBtn?.addEventListener("click", restoreSetupDefaultHolidays);
    [els.setupWorkStart,els.setupWorkEnd,...document.querySelectorAll(".setup-workday"),...document.querySelectorAll(".setup-break-row input")].filter(Boolean).forEach(node => node.addEventListener("change", updateSetupSchedulePreview));
    els.timezoneSelect?.addEventListener("change", e => { setJourneyMeta({timezone:e.target.value}); showToast("🌐",t("timezoneChanged")); });
    els.localeSelect?.addEventListener("change", e => { setJourneyMeta({locale:e.target.value}); showToast("✓",t("localeChanged")); });
    els.privacyModeSelect?.addEventListener("change", e => { state.privacyMode=e.target.value; localStorage.setItem("wp-privacy-mode",state.privacyMode); applyPrivacyMode(); renderDashboard(); });
    els.exportBackupBtn?.addEventListener("click", exportBackup); els.importBackupBtn?.addEventListener("click", () => els.backupFileInput?.click()); els.backupFileInput?.addEventListener("change", e => { const file=e.target.files?.[0]; if(file) importBackupFile(file); e.target.value=""; });
    els.startNewJourneyBtn?.addEventListener("click", startNewJourney); els.resetAllDataBtn?.addEventListener("click", resetAllData); els.shareSummaryBtn?.addEventListener("click", shareJourneySummary);
    els.refreshUpdateBtn?.addEventListener("click", () => { state.refreshForUpdate = true; if(state.pendingServiceWorker) state.pendingServiceWorker.postMessage({type:"SKIP_WAITING"}); else location.reload(); });
  }
  function initV5() {
    applyJourneyConfig({ ...journeyConfig, timezone: state.timezone, locale: state.locale }, false);
    renderJourneyConfigUI();
    localStorage.setItem("wp-app-version", APP_VERSION);
    if (!state.setupCompleted) setTimeout(() => openSetupWizard("first"), 80);
  }

  function renderFontPicker() {
    const picker = document.getElementById("fontPicker");
    const selected = document.getElementById("fontPickerSelected");
    const category = document.getElementById("fontPickerCategory");
    if (!picker || !selected || !category) return;
    const option = picker.querySelector(`.font-picker-option[data-font="${state.fontFamily}"]`) || picker.querySelector('.font-picker-option[data-font="sarabun"]');
    picker.querySelectorAll(".font-picker-option").forEach(btn => {
      const active = btn === option;
      btn.classList.toggle("is-selected", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (option) {
      selected.textContent = option.dataset.label || option.textContent.trim();
      selected.style.fontFamily = FONT_MAP[state.fontFamily] || FONT_MAP.system;
      const group = option.closest(".font-picker-group");
      const title = group?.querySelector("[data-font-group-title]");
      category.textContent = title ? (state.language === "th" ? title.dataset.th : title.dataset.en) : "Font";
    }
    picker.querySelectorAll("[data-font-group-title]").forEach(title => {
      title.textContent = state.language === "th" ? title.dataset.th : title.dataset.en;
    });
  }

  function closeFontPicker() {
    const picker = document.getElementById("fontPicker");
    const menu = document.getElementById("fontPickerMenu");
    const trigger = document.getElementById("fontPickerTrigger");
    if (!picker || !menu || !trigger) return;
    menu.hidden = true; picker.classList.remove("is-open"); trigger.setAttribute("aria-expanded", "false");
  }

  function resolveTheme(value) { return value === "system" ? (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light") : value; }
  function applyPreferences() {
    document.documentElement.style.setProperty("--app-font", FONT_MAP[state.fontFamily] || FONT_MAP.system);
    const fontScale = FONT_SCALE_MAP[state.fontSize] || 1; document.documentElement.style.setProperty("--font-scale", fontScale); document.documentElement.style.fontSize = `${16 * fontScale}px`;
    const resolved = resolveTheme(state.theme); document.documentElement.dataset.theme = resolved; els.themeToggle.textContent = resolved === "dark" ? "☀" : "☾";
    document.body.classList.toggle("no-animations", !state.animations); document.body.classList.toggle("compact", state.density === "compact");
    if (els.fontFamilySelect) els.fontFamilySelect.value = state.fontFamily; els.fontSizeSelect.value = state.fontSize; els.themeSelect.value = state.theme; els.clockFormatSelect.value = state.clockFormat; els.densitySelect.value = state.density; els.showSecondsToggle.checked = state.showSeconds; els.animationToggle.checked = state.animations;
    renderFontPicker();
    const fontPreview = document.getElementById("fontPreviewCard"); if (fontPreview) fontPreview.style.fontFamily = FONT_MAP[state.fontFamily] || FONT_MAP.system;
    applyV4Preferences();
    if (els.timezoneSelect) els.timezoneSelect.value = CONFIG.timezone; if (els.localeSelect) els.localeSelect.value = CONFIG.locale; applyPrivacyMode();
  }
  function persistPreferences() {
    localStorage.setItem("wp-language", state.language); localStorage.setItem("wp-font-family", state.fontFamily); localStorage.setItem("wp-font-size", state.fontSize); localStorage.setItem("wp-theme", state.theme);
    localStorage.setItem("wp-clock-format", state.clockFormat); localStorage.setItem("wp-show-seconds", String(state.showSeconds)); localStorage.setItem("wp-animations", String(state.animations)); localStorage.setItem("wp-density", state.density); localStorage.setItem("wp-day-overrides", JSON.stringify(state.dayOverrides));
    localStorage.setItem("wp-timezone", state.timezone); localStorage.setItem("wp-locale", state.locale); localStorage.setItem("wp-privacy-mode", state.privacyMode); localStorage.setItem("wp-journey-config", JSON.stringify(journeyConfig));
    persistV4Preferences();
  }

  function openSettings() { renderJourneyConfigUI(); els.settingsBackdrop.hidden = false; requestAnimationFrame(() => els.settingsPanel.classList.add("open")); els.settingsPanel.setAttribute("aria-hidden", "false"); }
  function closeSettings() { els.settingsPanel.classList.remove("open"); els.settingsPanel.setAttribute("aria-hidden", "true"); setTimeout(() => { if (!els.settingsPanel.classList.contains("open")) els.settingsBackdrop.hidden = true; }, 280); }
  function openDayModal(date) {
    state.selectedDate = localDateOnly(date); const override = getOverride(date); state.selectedDayType = override?.type || "default";
    const savedMinutes = override?.type === "leave" ? getLeaveMinutes(date) : CONFIG.totalWorkMinutes;
    state.selectedLeaveMode = override?.leaveMode || (savedMinutes >= CONFIG.totalWorkMinutes ? "full" : Math.abs(savedMinutes - CONFIG.totalWorkMinutes / 2) < 1 ? "half" : "custom");
    state.selectedLeaveMinutes = savedMinutes;
    els.dayModalTitle.textContent = formatLongDate(date); els.dayModalDescription.textContent = isWithinInternship(date) ? t("normalDayDescription") : t("outsideInternship"); els.dayNoteInput.value = state.privacyMode === "demo" ? "" : (override?.note || "");
    syncLeaveInputsFromState(); updateDayTypeButtons(); els.dayModalBackdrop.hidden = false; requestAnimationFrame(() => els.dayModal.classList.add("open")); els.dayModal.setAttribute("aria-hidden", "false");
  }
  function closeDayModal() { els.dayModal.classList.remove("open"); els.dayModal.setAttribute("aria-hidden", "true"); setTimeout(() => { if (!els.dayModal.classList.contains("open")) els.dayModalBackdrop.hidden = true; }, 180); }
  function updateDayTypeButtons() {
    document.querySelectorAll(".day-type-btn").forEach(btn => btn.classList.toggle("selected", btn.dataset.dayType === state.selectedDayType));
    if (els.leaveDetailsPanel) els.leaveDetailsPanel.hidden = state.selectedDayType !== "leave";
    document.querySelectorAll(".leave-mode-btn").forEach(btn => btn.classList.toggle("selected", btn.dataset.leaveMode === state.selectedLeaveMode));
    updateLeavePreview();
  }
  function syncLeaveInputsFromState() {
    const minutes = clamp(state.selectedLeaveMinutes || CONFIG.totalWorkMinutes, 1, CONFIG.totalWorkMinutes);
    if (state.selectedLeaveMode === "full") state.selectedLeaveMinutes = CONFIG.totalWorkMinutes;
    else if (state.selectedLeaveMode === "half") state.selectedLeaveMinutes = CONFIG.totalWorkMinutes / 2;
    if (els.leaveHoursInput) els.leaveHoursInput.value = Math.floor(state.selectedLeaveMinutes / 60);
    if (els.leaveMinutesInput) els.leaveMinutesInput.value = state.selectedLeaveMinutes % 60;
  }
  function updateLeavePreview() {
    if (!els.leaveDurationPreview) return;
    els.leaveDurationPreview.textContent = t("leavePreview").replace("{time}", formatDuration(state.selectedLeaveMinutes, true));
  }
  function setLeaveMode(mode) {
    state.selectedLeaveMode = mode;
    if (mode === "full") state.selectedLeaveMinutes = CONFIG.totalWorkMinutes;
    else if (mode === "half") state.selectedLeaveMinutes = CONFIG.totalWorkMinutes / 2;
    syncLeaveInputsFromState(); updateDayTypeButtons();
  }
  function updateCustomLeaveDuration() {
    state.selectedLeaveMode = "custom";
    const hours = clamp(Number(els.leaveHoursInput?.value || 0), 0, Math.ceil(CONFIG.totalWorkMinutes / 60)), mins = clamp(Number(els.leaveMinutesInput?.value || 0), 0, 59);
    state.selectedLeaveMinutes = clamp(Math.round(hours * 60 + mins), 0, CONFIG.totalWorkMinutes);
    document.querySelectorAll(".leave-mode-btn").forEach(btn => btn.classList.toggle("selected", btn.dataset.leaveMode === "custom"));
    updateLeavePreview();
  }
  function saveDayOverride() {
    if (!state.selectedDate) return; const key = dateKey(state.selectedDate), existing = state.dayOverrides[key], note = state.privacyMode === "demo" ? (existing?.note || "") : els.dayNoteInput.value.trim();
    if (state.selectedDayType === "default") delete state.dayOverrides[key];
    else if (state.selectedDayType === "leave") {
      const rawLeaveMinutes = Number(state.selectedLeaveMinutes);
      if (!Number.isFinite(rawLeaveMinutes) || rawLeaveMinutes < 1 || rawLeaveMinutes > CONFIG.totalWorkMinutes) { showToast("!", t("leaveValidation")); return; }
      const leaveMinutes = Math.round(rawLeaveMinutes);
      state.dayOverrides[key] = { type: "leave", leaveMode: state.selectedLeaveMode, leaveMinutes, scheduledMinutes: CONFIG.totalWorkMinutes, note };
    } else state.dayOverrides[key] = { type: state.selectedDayType, note };
    persistPreferences(); closeDayModal(); renderDashboard();
  }

  function openStatsModal() { renderDashboard(); els.statsModalBackdrop.hidden = false; requestAnimationFrame(() => els.statsModal.classList.add("open")); els.statsModal.setAttribute("aria-hidden", "false"); }
  function closeStatsModal() { els.statsModal.classList.remove("open"); els.statsModal.setAttribute("aria-hidden", "true"); setTimeout(() => { if (!els.statsModal.classList.contains("open")) els.statsModalBackdrop.hidden = true; }, 200); }
  function openAchievementModal(item, meta) {
    if (!item) return; els.achievementModalIcon.textContent = item.icon; els.achievementModalTitle.textContent = t(item.titleKey); els.achievementModalDescription.textContent = t(item.descKey); els.achievementModalMeta.textContent = meta;
    els.achievementModalBackdrop.hidden = false; requestAnimationFrame(() => els.achievementModal.classList.add("open")); els.achievementModal.setAttribute("aria-hidden", "false");
  }
  function closeAchievementModal() { els.achievementModal.classList.remove("open"); els.achievementModal.setAttribute("aria-hidden", "true"); setTimeout(() => { if (!els.achievementModal.classList.contains("open")) els.achievementModalBackdrop.hidden = true; }, 200); }
  function openCompletionModal() {
    if (!state.latestStats || !state.latestStats.journeyComplete) return; els.completionModalBackdrop.hidden = false; requestAnimationFrame(() => els.completionModal.classList.add("open")); els.completionModal.setAttribute("aria-hidden", "false"); launchConfetti();
  }
  function closeCompletionModal() { els.completionModal.classList.remove("open"); els.completionModal.setAttribute("aria-hidden", "true"); localStorage.setItem("wp-completion-seen", "true"); setTimeout(() => { if (!els.completionModal.classList.contains("open")) els.completionModalBackdrop.hidden = true; }, 230); }
  function launchConfetti() {
    if (!state.animations) return; els.confettiLayer.innerHTML = "";
    for (let i = 0; i < 72; i++) {
      const piece = document.createElement("span"); piece.className = "confetti";
      piece.style.setProperty("--x", `${Math.random() * 100}%`); piece.style.setProperty("--w", `${5 + Math.random() * 7}px`); piece.style.setProperty("--h", `${8 + Math.random() * 11}px`);
      piece.style.setProperty("--hue", `${Math.floor(Math.random() * 360)}`); piece.style.setProperty("--rot", `${Math.floor(Math.random() * 180)}deg`); piece.style.setProperty("--dur", `${3.2 + Math.random() * 2.7}s`);
      piece.style.setProperty("--delay", `${Math.random() * .9}s`); piece.style.setProperty("--drift", `${-90 + Math.random() * 180}px`); els.confettiLayer.appendChild(piece);
    }
    setTimeout(() => { els.confettiLayer.innerHTML = ""; }, 7000);
  }

  function setLanguage(language) { if (!translations[language]) return; state.language = language; persistPreferences(); renderTranslations(); renderFontPicker(); renderDashboard(); }
  function bindEvents() {
    document.querySelectorAll(".lang-btn").forEach(button => button.addEventListener("click", () => setLanguage(button.dataset.lang)));
    els.themeToggle.addEventListener("click", () => { state.theme = resolveTheme(state.theme) === "dark" ? "light" : "dark"; persistPreferences(); applyPreferences(); });
    els.settingsOpen.addEventListener("click", openSettings); els.settingsClose.addEventListener("click", closeSettings); els.settingsBackdrop.addEventListener("click", closeSettings);
    els.fontFamilySelect.addEventListener("change", e => { state.fontFamily = e.target.value; persistPreferences(); applyPreferences(); });
    const fontPicker = document.getElementById("fontPicker"), fontPickerTrigger = document.getElementById("fontPickerTrigger"), fontPickerMenu = document.getElementById("fontPickerMenu");
    if (fontPicker && fontPickerTrigger && fontPickerMenu) {
      fontPickerTrigger.addEventListener("click", () => {
        const open = fontPickerMenu.hidden;
        fontPickerMenu.hidden = !open; fontPicker.classList.toggle("is-open", open); fontPickerTrigger.setAttribute("aria-expanded", open ? "true" : "false");
        if (open) fontPickerMenu.querySelector('.font-picker-option.is-selected')?.scrollIntoView({ block: "nearest" });
      });
      fontPickerMenu.addEventListener("click", e => {
        const option = e.target.closest(".font-picker-option[data-font]"); if (!option) return;
        state.fontFamily = option.dataset.font; if (els.fontFamilySelect) els.fontFamilySelect.value = state.fontFamily; persistPreferences(); applyPreferences(); closeFontPicker(); fontPickerTrigger.focus();
      });
      document.addEventListener("click", e => { if (!fontPicker.contains(e.target)) closeFontPicker(); });
      document.addEventListener("keydown", e => { if (e.key === "Escape" && !fontPickerMenu.hidden) { closeFontPicker(); fontPickerTrigger.focus(); } });
    }
    els.fontSizeSelect.addEventListener("change", e => { state.fontSize = e.target.value; persistPreferences(); applyPreferences(); });
    els.themeSelect.addEventListener("change", e => { state.theme = e.target.value; persistPreferences(); applyPreferences(); });
    els.clockFormatSelect.addEventListener("change", e => { state.clockFormat = e.target.value; persistPreferences(); renderDashboard(); });
    els.densitySelect.addEventListener("change", e => { state.density = e.target.value; persistPreferences(); applyPreferences(); });
    els.showSecondsToggle.addEventListener("change", e => { state.showSeconds = e.target.checked; persistPreferences(); renderDashboard(); });
    els.animationToggle.addEventListener("change", e => { state.animations = e.target.checked; persistPreferences(); applyPreferences(); });
    els.resetSettings.addEventListener("click", () => { Object.assign(state, { language: "th", fontFamily: "sarabun", fontSize: "medium", theme: "light", clockFormat: "24", showSeconds: true, animations: true, density: "comfortable" }); persistPreferences(); applyPreferences(); renderTranslations(); renderDashboard(); });
    els.calendarPrev.addEventListener("click", () => { state.calendarDate = new Date(state.calendarDate.getFullYear(), state.calendarDate.getMonth() - 1, 1); renderCalendar(getConfiguredNow()); });
    els.calendarNext.addEventListener("click", () => { state.calendarDate = new Date(state.calendarDate.getFullYear(), state.calendarDate.getMonth() + 1, 1); renderCalendar(getConfiguredNow()); });
    els.calendarToday.addEventListener("click", () => { state.calendarDate = startOfMonth(getConfiguredNow()); renderCalendar(getConfiguredNow()); });
    els.dayModalClose.addEventListener("click", closeDayModal); els.dayModalCancel.addEventListener("click", closeDayModal); els.dayModalBackdrop.addEventListener("click", closeDayModal); els.dayModalSave.addEventListener("click", saveDayOverride);
    document.querySelectorAll(".day-type-btn").forEach(btn => btn.addEventListener("click", () => { state.selectedDayType = btn.dataset.dayType; updateDayTypeButtons(); }));
    document.querySelectorAll(".leave-mode-btn").forEach(btn => btn.addEventListener("click", () => setLeaveMode(btn.dataset.leaveMode)));
    els.leaveHoursInput?.addEventListener("input", updateCustomLeaveDuration); els.leaveMinutesInput?.addEventListener("input", updateCustomLeaveDuration);
    els.statsOpen.addEventListener("click", openStatsModal); els.statsModalClose.addEventListener("click", closeStatsModal); els.statsModalBackdrop.addEventListener("click", closeStatsModal);
    els.achievementModalClose.addEventListener("click", closeAchievementModal); els.achievementModalBackdrop.addEventListener("click", closeAchievementModal);
    els.completionOpen.addEventListener("click", openCompletionModal); els.completionModalClose.addEventListener("click", closeCompletionModal); els.completionModalBackdrop.addEventListener("click", closeCompletionModal);
    document.addEventListener("keydown", e => { if (e.key === "Escape") { closeSettings(); closeDayModal(); closeStatsModal(); closeAchievementModal(); closeCompletionModal(); if (state.setupMode === "edit") closeSetupWizard(); } });
    window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", () => { if (state.theme === "system") applyPreferences(); });
  }

  // Public bridge for feature modules. This keeps the core dashboard logic in one place
  // while allowing Journal / Projects / Reports to use the same calendar and attendance rules.
  window.WorkdayJourneyAPI = {
    version: APP_VERSION,
    getConfig: () => ({ ...journeyConfig, totalWorkMinutes: CONFIG.totalWorkMinutes, totalBreakMinutes: CONFIG.totalBreakMinutes, schedule: CONFIG.schedule.map(item => ({ ...item })) }),
    getState: () => ({ language: state.language, timezone: state.timezone, locale: state.locale, privacyMode: state.privacyMode, setupCompleted: state.setupCompleted }),
    getNow: () => new Date(getConfiguredNow()),
    getStats: (date = getConfiguredNow()) => getInternshipStats(new Date(date)),
    getMonthlyStats: (date = getConfiguredNow()) => getMonthlyStats(new Date(date)).map(item => ({ ...item, date: new Date(item.date) })),
    getAchievements: (stats = getInternshipStats(getConfiguredNow())) => getAchievements(stats).map(item => ({ ...item })),
    getDayOverrides: () => JSON.parse(JSON.stringify(state.dayOverrides || {})),
    setDayOverrides: overrides => { state.dayOverrides = overrides && typeof overrides === "object" ? JSON.parse(JSON.stringify(overrides)) : {}; persistPreferences(); renderDashboard(); },
    getScheduledMinutes: value => getScheduledMinutes(value instanceof Date ? value : parseConfigDate(String(value), new Date())),
    getActualDayCapacity: value => getActualDayCapacity(value instanceof Date ? value : parseConfigDate(String(value), new Date())),
    getWorkedMinutes: (value, now = getConfiguredNow()) => getWorkedMinutes(value instanceof Date ? value : parseConfigDate(String(value), new Date()), now instanceof Date ? now : new Date(now)),
    getNormalScheduleElapsedMinutes: (value, now = getConfiguredNow()) => getNormalScheduleElapsedMinutes(value instanceof Date ? value : parseConfigDate(String(value), new Date()), now instanceof Date ? now : new Date(now)),
    getDayType: value => getDayType(value instanceof Date ? value : parseConfigDate(String(value), new Date())),
    getLeaveMinutes: value => getLeaveMinutes(value instanceof Date ? value : parseConfigDate(String(value), new Date())),
    isScheduledWorkday: value => isScheduledWorkday(value instanceof Date ? value : parseConfigDate(String(value), new Date())),
    render: () => renderDashboard(),
    exportBackup: () => exportBackup(),
    formatDuration: (minutes, compact = false) => formatDuration(minutes, compact),
    formatCompactDate: value => formatCompactDate(value instanceof Date ? value : parseConfigDate(String(value), new Date())),
    dateKey: value => dateKey(value instanceof Date ? value : parseConfigDate(String(value), new Date())),
    translate: key => t(key),
    markAchievementFlag: flag => markAchievementFlag(flag),
    defaultCompanyHolidays: [...DEFAULT_COMPANY_HOLIDAYS]
  };

  function init() { applyPreferences(); renderTranslations(); bindEvents(); bindV4Events(); bindV5Events(); initPwa(); initV5(); renderDashboard(); setInterval(renderDashboard, 1000); }
  init();
})();
;

/* ===== SOURCE: v6.js ===== */
(() => {
  "use strict";

  const API = window.WorkdayJourneyAPI;
  if (!API) return;

  const V6_VERSION = "8.7.6";
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
    $("v6SavePreset")?.addEventListener("click",()=>{ const name=$("v6PresetName").value.trim(); if(!name)return; calendarPresets.push({id:`c_${Date.now().toString(36)}`,name,overrides:API.getDayOverrides(),createdAt:new Date().toISOString()}); write(KEYS.calendarPresets,calendarPresets); API.markAchievementFlag?.("calendar-preset"); openCalendarPresets(); });
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
    try { const payload=JSON.parse(await file.text()); const overrides=payload?.type==="workday-calendar-preset"?payload.overrides:(payload?.overrides||payload); if(!overrides||typeof overrides!=="object"||Array.isArray(overrides))throw new Error(); const clean={}; for(const [key,value] of Object.entries(overrides)){ if(!/^\d{4}-\d{2}-\d{2}$/.test(key)||!value||!["holiday","leave","work"].includes(value.type))continue; clean[key]={...value}; } if(!Object.keys(clean).length && Object.keys(overrides).length)throw new Error(); if(!confirm(tr("replaceCalendarConfirm")))return; API.setDayOverrides(clean); API.markAchievementFlag?.("calendar-preset"); toast("✓",tr("calendarImported")); if(modalType==="calendar")openCalendarPresets(); } catch { toast("!",tr("invalidCalendar")); } finally { $("v6CalendarFileInput").value=""; }
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
    const footText=document.querySelector('.footer [data-i18n="footerText"]'); if(footText)footText.textContent=lang()==="th"?"Workday Journey V8.5.0 · Navigation Refresh · Reward Codes · Smart Cloud Sync · ข้อมูลเก็บใน Browser":"Workday Journey V8.5.0 · Navigation Refresh · Reward Codes · Smart Cloud Sync · Local browser data";
    const eyebrow=document.querySelector(".setup-brand .eyebrow"); if(eyebrow)eyebrow.textContent="WORKDAY JOURNEY · V8.5.0";
  }

  function init() {
    injectUI(); updateVersionLabels(); applyLayout(); bindUI(); renderHub(); maybeBackupToast();
    setInterval(()=>{renderHub();},60000);
  }

  init();
})();
;

/* ===== SOURCE: v7.js ===== */
(() => {
  "use strict";

  const API = window.WorkdayJourneyAPI;
  if (!API) return;

  const VERSION = "8.7.6";
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
    avatarPhoto: "wp-profile-avatar-image",
    achievementCategory: "wp-v846-achievement-category",
    achievementView: "wp-v847-achievement-view",
    featureAchievementCategory: "wp-v847-feature-achievement-category"
  };

  const TEXT = {
    th: {
      dashboard:"แดชบอร์ด", journal:"บันทึกประจำวัน", projects:"โปรเจกต์", achievements:"ความสำเร็จ", reports:"รายงานและการวิเคราะห์", calendar:"ปฏิทินและการเข้างาน", missions:"ภารกิจรายวัน", focus:"Focus Studio", focusSub:"จับเวลาโฟกัสและสรุป Session", skills:"Skill Tree", skillsSub:"เติบโตจาก Journal และ Projects", bank:"Work Bank", exchange:"Work Exchange", rewards:"รางวัล", developer:"Developer Tools", settings:"ตั้งค่า",
      dashboardSub:"ภาพรวมวันนี้และ Journey", journalSub:"บันทึกสิ่งที่ทำและสิ่งที่เรียนรู้", projectsSub:"ติดตามงานและความคืบหน้าของ Project", achievementsSub:"Milestones, Badge และ Journey Story", reportsSub:"สถิติ Attendance, Heatmap และรายงาน", calendarSub:"วันลา วันหยุด และวันทำงานชดเชย", missionsSub:"ภารกิจรายวันและ Daily / Weekly Chest", bankSub:"ออม Work Coins · ดอกเบี้ยทบต้น + Streak", exchangeSub:"ตลาดจำลองและ Trading Academy", rewardsSub:"ร้านค้า ของสะสม Daily / Weekly Deals", developerSub:"Reward Codes และ Owner Control", settingsSub:"โปรไฟล์และการตั้งค่าแอป", fontPreview:"ตัวอย่างแบบอักษร", fontPreviewText:"ภาษาไทย · Workday Journey · ABC 123", fontPreviewHelp:"แบบอักษรที่เลือกจะใช้กับทั้งแอป",
      privateLocal:"Private · Local data", menu:"เมนู", quickActions:"ทางลัด", addJournal:"เพิ่ม Journal วันนี้", manageProjects:"จัดการ Projects", openReports:"ดู Reports", openCalendar:"เปิด Calendar",
      journalTitle:"Daily Work Journal", journalHelp:"บันทึกว่าวันนี้ทำอะไร เรียนรู้อะไร และ Project ที่เกี่ยวข้อง", journalDate:"วันที่", workDone:"วันนี้ทำอะไร", learned:"สิ่งที่ได้เรียนรู้", mood:"ความรู้สึกวันนี้", relatedProjects:"Project ที่เกี่ยวข้อง", saveJournal:"บันทึก Journal", deleteJournal:"ลบบันทึก", recentEntries:"บันทึกล่าสุด", noEntries:"ยังไม่มีบันทึก", demoLocked:"Journal ถูกซ่อนใน Public Demo Mode", journalSaved:"บันทึก Journal แล้ว", journalDeleted:"ลบบันทึกแล้ว", journalDateInvalid:"กรุณาใส่วันที่ให้ถูกต้องในรูปแบบ DD/MM/YYYY", journalCalendar:"สถานะการบันทึกประจำวัน", journalCalendarHelp:"✓ = บันทึกแล้ว · ช่องว่างสีอ่อน = วันทำงานที่ยังไม่ได้บันทึก", pendingJournals:"ค้าง {n} วัน", journalAllCaughtUp:"บันทึกครบแล้ว", previousMonth:"เดือนก่อนหน้า", nextMonth:"เดือนถัดไป", summaryLive:"อัปเดตจากข้อมูลล่าสุดของคุณ",
      projectsTitle:"Project Tracker", projectsHelp:"ติดตาม Project, Status, Progress และเก็บไฟล์ Project บน Private Cloud", projectName:"ชื่อ Project", category:"หมวดหมู่", progress:"Progress (%)", status:"สถานะ", description:"รายละเอียด", active:"กำลังทำ", paused:"พักไว้", completed:"เสร็จแล้ว", saveProject:"บันทึก Project", newProject:"Project ใหม่", noProjects:"ยังไม่มี Project", journalDays:"วันที่มี Journal", projectSaved:"บันทึก Project แล้ว", projectDeleted:"ลบ Project แล้ว", projectList:"รายการ Project",
      achievementsTitle:"Achievement Center", achievementsHelp:"รวม Badge, Milestone และเรื่องราวสำคัญของ Journey", unlocked:"ปลดล็อกแล้ว", locked:"ยังไม่ปลดล็อก", achievementProgress:"ปลดล็อก {n}/{total} Achievement",
      reportsTitle:"Reports & Analytics", reportsHelp:"ดูภาพรวม Attendance, Monthly Statistics, Heatmap และ Final Journey Report", monthlyReport:"Monthly Report", detailedStats:"Detailed Statistics", finalReport:"Final Journey Report", snapshot:"Journey Snapshot", month:"เดือน", planned:"ตามแผน", actual:"ทำงานจริง", leave:"ลา", holidays:"วันหยุด", comp:"ชดเชย", journals:"Journal", projectsMentioned:"Projects",
      calendarTitle:"Calendar & Attendance", calendarHelp:"จัดการวันลา วันหยุดบริษัท วันทำงานชดเชย และ Calendar Preset", presetImport:"Preset / Import", companyHoliday:"วันหยุดบริษัท", personalLeave:"วันลา", compWork:"วันทำงานชดเชย", specialDates:"วันพิเศษ",
      settingsTitle:"ตั้งค่า", settingsHelp:"ปรับโปรไฟล์ ธีม แบบอักษร ภาษา การสำรองข้อมูล และการแสดงผล", profileJourney:"โปรไฟล์และข้อมูลการเดินทาง", editJourney:"แก้ไขข้อมูลการเดินทาง", appearance:"การแสดงผล", theme:"ธีม", font:"แบบอักษร", fontSize:"ขนาดตัวอักษร", density:"ความหนาแน่นของหน้าจอ", timezone:"เขตเวลา", locale:"รูปแบบวันที่", behavior:"การทำงาน", seconds:"แสดงวินาที", animation:"แอนิเมชัน", moodSetting:"บรรยากาศตามเวลา", notifications:"การแจ้งเตือน", dataBackup:"ข้อมูลและการสำรอง", exportBackup:"ส่งออกข้อมูลสำรอง", importBackup:"นำเข้าข้อมูลสำรอง", newJourney:"เริ่มการเดินทางใหม่", resetData:"ล้างข้อมูลทั้งหมด", dashboardLayout:"จัดรูปแบบแดชบอร์ด", openFullSettings:"เปิดการตั้งค่าขั้นสูง", light:"สว่าง", dark:"มืด", system:"ตามระบบ", compact:"กะทัดรัด", comfortable:"สบายตา", small:"เล็ก", medium:"กลาง", large:"ใหญ่", profileSection:"โปรไฟล์", displaySection:"การแสดงผล", regionSection:"ภูมิภาคและเวลา", behaviorSection:"การทำงาน", dataSection:"ข้อมูล", publicDemo:"โหมดสาธารณะ", myJourney:"การเดินทางของฉัน", collapseSidebar:"ซ่อน Sidebar", expandSidebar:"แสดง Sidebar",
      backupStatus:"Backup ล่าสุด", never:"ยังไม่เคย Backup", today:"วันนี้", daysAgo:"{n} วันที่แล้ว", appVersion:"Workday Journey V8.5.0 · Navigation Refresh + Smart Cloud Sync + Achievement Center + File Vault", perfectMonthAchievedMonth:"เดือนที่ทำสำเร็จ", perfectMonthJourneyPeriod:"ช่วง Journey ที่ตรวจ", localPrivacy:"Local เป็นค่าเริ่มต้น · Login เพื่อ Sync ข้ามอุปกรณ์",
      overview:"ภาพรวม", workTime:"เวลาสะสม", attendance:"Attendance", achievementsCount:"Achievements", workdaysLeft:"วันทำงานที่เหลือ", goTo:"เปิดหน้า",
      challenges:"Challenges", challengeCenter:"Achievement Center", challengeHelp:"แยก Journey Challenges ที่ใช้ Tier Mastery ออกจาก Feature Achievements ที่ให้ Coin จาก Work Bank, Work Exchange และ File Vault", allTiers:"ทุกระดับ", common:"Common", rare:"Rare", epic:"Epic", legendary:"Legendary", inProgress:"กำลังทำ", challengeComplete:"สำเร็จ", rewardTitle:"รางวัลฉายา", noTitle:"ไม่ใช้ฉายา", titleSystem:"ฉายาและเกียรติยศ", titleHelp:"เลือกฉายาที่ปลดล็อกจาก Achievement เพื่อแสดงบน Profile", selectedTitle:"ฉายาที่ใช้", titleUnlockedCount:"ปลดล็อกฉายา {n}/{total}", lockedTitle:"ยังไม่ปลดล็อก", titleSaved:"เปลี่ยนฉายาแล้ว", categoryJourney:"Journey", categoryTime:"เวลา", categoryProjects:"Project", categoryJournal:"Journal", categoryAttendance:"Attendance", categoryExploration:"Explorer", categoryBank:"Work Bank", categoryExchange:"Work Exchange", categoryVault:"File Vault", achievementAllCategories:"ทั้งหมด", achievementCoinReward:"รางวัล Coin", tierMastery:"รางวัลพิชิตระดับ", masteryComplete:"ปลดล็อกรางวัล Tier แล้ว", masteryLocked:"ทำ Challenge ใน Tier นี้ให้ครบเพื่อปลดล็อกรางวัล", masteryReward:"รางวัลเมื่อพิชิต Tier", masteryTitle:"ฉายาที่ได้รับ", masteryEffect:"เอฟเฟกต์ธีมที่ได้รับ", tierMasteries:"UX & Quality", masteryProgress:"พิชิตแล้ว {n}/4 ระดับ", journeyChallenges:"Journey Challenges", journeyChallengesHelp:"Challenge หลักของ Journey แบ่ง Common → Legendary และใช้คำนวณ Tier Mastery", featureAchievements:"Feature Achievements", featureAchievementsHelp:"ความสำเร็จจาก Feature ใหม่ แจก Work Coins แยกจาก Tier Mastery", featureAll:"Feature ทั้งหมด", featureTierNote:"Feature Achievements ไม่ถูกนำไปคำนวณ Tier Mastery",
      journalSearch:"ค้นหาบันทึก", journalFilterProject:"ทุก Project", journalFilterMood:"ทุก Mood", journalFilterMonth:"ทุกเดือน", clearFilters:"ล้างตัวกรอง", entriesFound:"พบ {n} บันทึก", projectActiveTab:"กำลังใช้งาน", projectCompletedTab:"เสร็จแล้ว", projectArchivedTab:"เก็บถาวร", archiveProject:"เก็บถาวร", restoreProject:"นำกลับมา", projectArchived:"เก็บ Project แล้ว", projectRestored:"นำ Project กลับมาแล้ว", confirmTitle:"ยืนยันการทำรายการ", confirmDeleteJournal:"ต้องการลบบันทึกประจำวันนี้หรือไม่?", confirmDeleteProject:"ต้องการลบ Project นี้หรือไม่? Journal ที่เชื่อมอยู่จะถูกถอด Project ออก", cancel:"ยกเลิก", confirm:"ยืนยัน", undo:"ย้อนกลับ", undone:"ย้อนกลับรายการแล้ว", achievementDetail:"รายละเอียด Achievement", condition:"เงื่อนไข", progressNow:"ความคืบหน้า", unlockedDate:"วันที่ปลดล็อก", stillLocked:"ยังไม่ปลดล็อก", close:"ปิด", titlePreview:"ตัวอย่างฉายา", applyTitle:"ใช้ฉายานี้", titlePreviewHelp:"เลือกฉายาเพื่อดูก่อน แล้วกดใช้ฉายานี้", achievementNear:"Achievement ใกล้สำเร็จ", activeProjects:"Project ที่กำลังทำ", journalStreak:"Journal ต่อเนื่อง", backupHealth:"สถานะ Backup", days:"วัน", dashboardInsights:"สรุปด่วน", archived:"เก็บถาวร", updateReady:"มีเวอร์ชันใหม่พร้อมใช้งาน", refreshNow:"อัปเดตตอนนี้", calendarUpdated:"อัปเดตปฏิทินแล้ว", projectArchiveConfirm:"เก็บ Project นี้ไว้ใน Archive?", delete:"ลบ", schemaVersion:"เวอร์ชันข้อมูล", confirmResetData:"ต้องการล้างข้อมูล Workday Journey ทั้งหมดใน Browser นี้หรือไม่? การทำรายการนี้ไม่สามารถย้อนกลับได้",      deleteConfirm:"ยืนยันการลบรายการนี้?", projectNameRequired:"กรุณาใส่ชื่อ Project", noData:"ยังไม่มีข้อมูล", todayLabel:"วันนี้", mascotTitle:"Progress Mascot", mascotName:"Default Chick", mascotBefore:"ยังไม่ถึงเวลาเริ่มงาน พักอีกนิดนะ 💤", mascotStart:"เพิ่งเริ่มเอง ค่อย ๆ ลุยไปด้วยกัน!", mascotWork:"กำลังไปได้สวย ลุยกันต่อ!", mascotHalf:"ผ่านครึ่งทางแล้ว! เก่งมาก ☕", mascotAlmost:"อีกนิดเดียววว เตรียมตัวฉลอง!", mascotBreak:"พักก่อนนะ เดี๋ยวค่อยกลับมาลุยต่อ ☕", mascotDone:"วันนี้สำเร็จแล้ว กลับบ้านได้! 🎉", mascotRest:"วันนี้เป็นวันพัก เติมพลังให้เต็มที่ 🌿", mascotHoliday:"วันหยุดบริษัท วันนี้พักให้เต็มที่ 🏡", mascotLeave:"วันนี้เป็นวันลา พักผ่อนให้เต็มที่ 🌿", mascotJourneyDone:"Journey สำเร็จแล้ว! ลูกเจี๊ยบภูมิใจมาก 🏆", mascotProgress:"ความคืบหน้าวันนี้", avatarTitle:"รูปโปรไฟล์", avatarHelp:"เลือกใช้ Mascot หรือรูปของคุณเองใน Profile", avatarMascot:"ใช้ Mascot", avatarPhoto:"ใช้รูปของฉัน", avatarUpload:"อัปโหลดรูป", avatarChange:"เปลี่ยนรูป", avatarRemove:"ลบรูป", avatarStoredLocal:"รูปจะถูกย่อขนาดและเก็บไว้ใน Browser นี้ รวมอยู่ในไฟล์ Backup ด้วย", avatarUploaded:"อัปโหลดรูปโปรไฟล์แล้ว", avatarRemoved:"ลบรูปโปรไฟล์แล้ว", avatarInvalid:"กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง", avatarTooLarge:"ไฟล์รูปใหญ่เกินไป กรุณาเลือกไฟล์ไม่เกิน 12 MB", avatarRemoveConfirm:"ต้องการลบรูปโปรไฟล์ที่อัปโหลดไว้หรือไม่?", avatarMascotDemo:"Public Demo Mode จะแสดง Mascot แทนรูปส่วนตัว"
    },
    en: {
      dashboard:"Dashboard", journal:"Daily Journal", projects:"Projects", achievements:"Achievements", reports:"Reports & Analytics", calendar:"Calendar & Attendance", missions:"Daily Missions", focus:"Focus Studio", focusSub:"Stay focused and review your sessions", skills:"Skill Tree", skillsSub:"See your skill growth", bank:"Work Bank", exchange:"Work Exchange", rewards:"Rewards", developer:"Developer Tools", settings:"Settings",
      dashboardSub:"Today and journey overview", journalSub:"Record your work and learning", projectsSub:"Track project status and progress", achievementsSub:"Milestones, Trophy Room and Journey Story", reportsSub:"Attendance, heatmap and journey reports", calendarSub:"Leave, company holidays and compensatory days", missionsSub:"Daily Missions & Chests", bankSub:"Compound Savings + Streak", exchangeSub:"Simulated market + Trading Academy for beginners", rewardsSub:"Shop, Collection, Daily & Weekly Deals", developerSub:"Reward Codes & Owner Control", settingsSub:"Profile & App Settings", fontPreview:"Font Preview", fontPreviewText:"ภาษาไทย · Workday Journey · ABC 123", fontPreviewHelp:"The selected font is applied across the app",
      privateLocal:"Private · Local data", menu:"Menu", quickActions:"Quick Actions", addJournal:"Add Today's Journal", manageProjects:"Manage Projects", openReports:"View Reports", openCalendar:"Open Calendar",
      journalTitle:"Daily Work Journal", journalHelp:"Record what you worked on, what you learned, and the related projects", journalDate:"Date", workDone:"What did you work on?", learned:"What did you learn?", mood:"Today's mood", relatedProjects:"Related Projects", saveJournal:"Save Journal", deleteJournal:"Delete Entry", recentEntries:"Recent Entries", noEntries:"No entries yet", demoLocked:"Journal is hidden in Public Demo Mode", journalSaved:"Journal saved", journalDeleted:"Journal deleted", journalDateInvalid:"Enter a valid date in DD/MM/YYYY format", journalCalendar:"Journal Calendar", journalCalendarHelp:"✓ = saved · softly highlighted blank = working day still missing a journal", pendingJournals:"{n} days pending", journalAllCaughtUp:"All caught up", previousMonth:"Previous month", nextMonth:"Next month", summaryLive:"Updated from your latest data",
      projectsTitle:"Project Tracker", projectsHelp:"Track project status, progress and private cloud files alongside Daily Journal", projectName:"Project Name", category:"Category", progress:"Progress (%)", status:"Status", description:"Description", active:"Active", paused:"Paused", completed:"Completed", saveProject:"Save Project", newProject:"New Project", noProjects:"No projects yet", journalDays:"Journal Days", projectSaved:"Project saved", projectDeleted:"Project deleted", projectList:"Project List",
      achievementsTitle:"Achievement Center", achievementsHelp:"Badges, milestones and memorable moments from your journey", unlocked:"Unlocked", locked:"Locked", achievementProgress:"{n}/{total} achievements unlocked",
      reportsTitle:"Reports & Analytics", reportsHelp:"Review attendance, monthly statistics, heatmap and the final journey report", monthlyReport:"Monthly Report", detailedStats:"Detailed Statistics", finalReport:"Final Journey Report", snapshot:"Journey Snapshot", month:"Month", planned:"Planned", actual:"Actual", leave:"Leave", holidays:"Holidays", comp:"Comp", journals:"Journals", projectsMentioned:"Projects",
      calendarTitle:"Calendar & Attendance", calendarHelp:"Manage leave, company holidays, compensatory workdays and calendar presets", presetImport:"Preset / Import", companyHoliday:"Company Holidays", personalLeave:"Personal Leave", compWork:"Compensatory Workdays", specialDates:"Special Dates",
      settingsTitle:"Settings", settingsHelp:"Manage profile, theme, font, language, backups and display preferences", profileJourney:"Profile & Journey", editJourney:"Edit Journey", appearance:"Appearance", theme:"Theme", font:"Font", fontSize:"Font Size", density:"Layout Density", timezone:"Timezone", locale:"Date Format", behavior:"Behavior", seconds:"Show Seconds", animation:"Animation", moodSetting:"Dynamic Mood", notifications:"Notifications", dataBackup:"Data & Backup", exportBackup:"Export Backup", importBackup:"Import Backup", newJourney:"Start New Journey", resetData:"Reset All Data", dashboardLayout:"Dashboard Layout", openFullSettings:"Open Advanced Settings", light:"Light", dark:"Dark", system:"System", compact:"Compact", comfortable:"Comfortable", small:"Small", medium:"Medium", large:"Large", profileSection:"PROFILE", displaySection:"DISPLAY", regionSection:"REGION", behaviorSection:"BEHAVIOR", dataSection:"DATA", publicDemo:"Public Demo", myJourney:"My Journey", collapseSidebar:"Hide sidebar", expandSidebar:"Show sidebar",
      backupStatus:"Last Backup", never:"Never", today:"Today", daysAgo:"{n} days ago", appVersion:"Workday Journey V8.5.0 · Navigation Refresh + Smart Cloud Sync + Achievement Center + File Vault", perfectMonthAchievedMonth:"Perfect month", perfectMonthJourneyPeriod:"Journey period checked", localPrivacy:"Local by default · Sign in to sync across devices",
      overview:"Overview", workTime:"Work Time", attendance:"Attendance", achievementsCount:"Achievements", workdaysLeft:"Workdays Left", goTo:"Open",
      challenges:"Challenges", challengeCenter:"Achievement Center", challengeHelp:"Journey Challenges use Tier Mastery, while Feature Achievements reward Coins from Work Bank, Work Exchange and File Vault", allTiers:"All Tiers", common:"Common", rare:"Rare", epic:"Epic", legendary:"Legendary", inProgress:"In Progress", challengeComplete:"Complete", rewardTitle:"Title Reward", noTitle:"No title", titleSystem:"Titles & Honors", titleHelp:"Choose an unlocked achievement title to display on your profile", selectedTitle:"Selected Title", titleUnlockedCount:"{n}/{total} titles unlocked", lockedTitle:"Locked", titleSaved:"Title updated", categoryJourney:"Journey", categoryTime:"Time", categoryProjects:"Projects", categoryJournal:"Journal", categoryAttendance:"Attendance", categoryExploration:"Explorer", categoryBank:"Work Bank", categoryExchange:"Work Exchange", categoryVault:"File Vault", achievementAllCategories:"All", achievementCoinReward:"Coin Reward", tierMastery:"UX & Quality Reward", masteryComplete:"Tier reward unlocked", masteryLocked:"Complete every challenge in this tier to unlock the reward", masteryReward:"Tier Mastery Reward", masteryTitle:"Unlocked Title", masteryEffect:"Theme Effect", tierMasteries:"UX & Quality", masteryProgress:"{n}/4 tiers mastered", journeyChallenges:"Journey Challenges", journeyChallengesHelp:"Core Journey challenges from Common → Legendary that count toward Tier Mastery", featureAchievements:"Feature Achievements", featureAchievementsHelp:"Achievements from newer features with separate Work Coin rewards", featureAll:"All Features", featureTierNote:"Feature Achievements do not count toward Tier Mastery",
      journalSearch:"Search journal", journalFilterProject:"All Projects", journalFilterMood:"All Moods", journalFilterMonth:"All Months", clearFilters:"Clear filters", entriesFound:"{n} entries found", projectActiveTab:"Active", projectCompletedTab:"Completed", projectArchivedTab:"Archived", archiveProject:"Archive", restoreProject:"Restore", projectArchived:"Project archived", projectRestored:"Project restored", confirmTitle:"Confirm action", confirmDeleteJournal:"Delete this journal entry?", confirmDeleteProject:"Delete this project? Linked journal entries will keep their notes but lose this project link.", cancel:"Cancel", confirm:"Confirm", undo:"Undo", undone:"Action undone", achievementDetail:"Achievement Details", condition:"Condition", progressNow:"Progress", unlockedDate:"Unlocked", stillLocked:"Still locked", close:"Close", titlePreview:"Title Preview", applyTitle:"Use This Title", titlePreviewHelp:"Choose a title to preview it, then apply when ready", achievementNear:"Achievements close", activeProjects:"Active projects", journalStreak:"Journal streak", backupHealth:"Backup health", days:"days", dashboardInsights:"Quick Summary", archived:"Archived", updateReady:"A new version is ready", refreshNow:"Update now", calendarUpdated:"Calendar updated", projectArchiveConfirm:"Archive this project?", delete:"Delete", schemaVersion:"Data schema", confirmResetData:"Reset all Workday Journey data stored in this browser? This action cannot be undone.",      deleteConfirm:"Delete this item?", projectNameRequired:"Enter a project name", noData:"No data yet", todayLabel:"Today", mascotTitle:"Progress Mascot", mascotName:"Default Chick", mascotBefore:"Work has not started yet. A little more rest 💤", mascotStart:"Just getting started. Let’s ease into the day!", mascotWork:"Looking good — keep going!", mascotHalf:"Halfway there! Nice work ☕", mascotAlmost:"Almost there — celebration is close!", mascotBreak:"Take a break. We’ll get back to it soon ☕", mascotDone:"100% — today is complete! 🎉", mascotRest:"Rest day today. Recharge your energy 🌿", mascotHoliday:"Company holiday — enjoy the day off 🏡", mascotLeave:"Leave day today. Get some good rest 🌿", mascotJourneyDone:"Journey complete! Your chick is proud 🏆", mascotProgress:"Today’s progress", avatarTitle:"Profile Picture", avatarHelp:"Choose the current Mascot or your own uploaded photo for your profile", avatarMascot:"Use Mascot", avatarPhoto:"Use My Photo", avatarUpload:"Upload Photo", avatarChange:"Change Photo", avatarRemove:"Remove Photo", avatarStoredLocal:"Your photo is resized and stored in this browser and is included in exported backups", avatarUploaded:"Profile photo uploaded", avatarRemoved:"Profile photo removed", avatarInvalid:"Please choose a valid image file", avatarTooLarge:"This image is too large. Please choose a file under 12 MB", avatarRemoveConfirm:"Remove the uploaded profile photo?", avatarMascotDemo:"Public Demo Mode shows the Mascot instead of your personal photo"
    }
  };
  const t = (key, vars={}) => {
    let out = TEXT[lang()][key] || TEXT.en[key] || key;
    Object.entries(vars).forEach(([k,v]) => out = out.replaceAll(`{${k}}`, String(v)));
    return out;
  };

  // V8.5.0: route order stays aligned with the refreshed grouped navigation:
  // work -> attendance/analysis -> progress -> earn/spend/save/invest -> settings.
  const NAV = [
    ["dashboard","🏠"],
    ["journal","📓"],
    ["projects","🧩"],
    ["focus","⏱️"],
    ["skills","🌳"],
    ["calendar","📅"],
    ["reports","📊"],
    ["achievements","🏆"],
    ["missions","🎯"],
    ["rewards","🎁"],
    ["workspace","🪴"],
    ["bank","🏦"],
    ["exchange","📈"],
    ["developer","🛠"],
    ["settings","⚙"]
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
      const items=achievements.filter(a=>(a.tier||"common")===tier && a.masteryEligible!==false);
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
  const storedAchievementCategory = localStorage.getItem(KEYS.achievementCategory) || "all";
  const featureCategoryIds = ["bank","exchange","vault"];
  let achievementCategoryState = ["all","journey","time","projects","journal","attendance","exploration"].includes(storedAchievementCategory) ? storedAchievementCategory : "all";
  let featureAchievementCategoryState = localStorage.getItem(KEYS.featureAchievementCategory) || (featureCategoryIds.includes(storedAchievementCategory) ? storedAchievementCategory : "all");
  let achievementViewState = localStorage.getItem(KEYS.achievementView) || (featureCategoryIds.includes(storedAchievementCategory) ? "features" : "journey");
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
    const coinReward=Number(a.coinReward)||0,coinClaimed=coinReward>0&&read("wp-v81-coin-ledger",[]).some(x=>x?.id===`earn:achievement:${a.id}`);
    const isFeature=a.masteryEligible===false,heroBadge=isFeature?`<span class="v847-feature-detail-badge" data-category="${esc(a.category||"")}">${a.category==="bank"?"🏦":a.category==="exchange"?"📈":"📁"} ${esc(categoryLabel(a.category))}</span>`:`<span class="v7-tier-badge" data-tier="${esc(tier)}">${esc(tierLabel(tier))}</span>`;
    const body=$("v76AchBody"); body.innerHTML=`<div class="v76-ach-hero ${isFeature?"v847-feature-detail":""}" data-tier="${esc(tier)}" data-category="${esc(a.category||"")}"><span class="v76-ach-icon">${a.unlocked?a.icon:"🔒"}</span><div>${heroBadge}<h2 id="v76AchTitle">${esc(API.translate(a.titleKey))}</h2><p>${esc(API.translate(a.descKey))}</p></div></div><div class="v76-ach-stats"><div><span>${esc(t("condition"))}</span><strong>${esc(challengeProgressText({...a,current:a.target}))}</strong></div><div><span>${esc(t("progressNow"))}</span><strong>${esc(challengeProgressText(a))}</strong></div><div><span>${esc(t("unlockedDate"))}</span><strong>${esc(date)}</strong></div></div><div class="v76-ach-progress"><i style="width:${Math.max(0,Math.min(100,Number(a.percent)||0))}%"></i></div>${coinReward?`<div class="v76-ach-reward v846-coin-reward ${isFeature?"v847-feature-reward":""}" data-tier="${esc(tier)}"><span>🪙</span><div><small>${esc(t("achievementCoinReward"))}</small><strong>+${coinReward.toLocaleString()} Coins ${a.unlocked?(coinClaimed?"· ✓ CLAIMED":"· READY"):""}</strong></div></div>`:""}${perfectMonthMeta}${reward?`<div class="v76-ach-reward" data-tier="${esc(reward.tier)}"><span>👑</span><div><small>${esc(t("rewardTitle"))}</small><strong>${esc(titleName(reward))}</strong></div></div>`:""}`;
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
      <div class="v7-sidebar-brand"><div class="v7-sidebar-brand-main"><div class="brand-mark">%</div><div><strong>Workday Journey</strong><div class="v8472-version-row"><small>V8.5.0</small><button id="v8472WhatsNewBtn" class="v8472-whats-new-btn" type="button" aria-label="What's New" title="What's New"><span aria-hidden="true">📰</span><b id="v8472WhatsNewBadge" data-v8472-new hidden>NEW</b></button></div></div></div><button id="v7CollapseBtn" class="v7-collapse-btn" type="button" aria-label="Hide sidebar" title="Hide sidebar">‹</button></div>
      <nav class="v7-nav" aria-label="Workday Journey navigation">${NAV.map(([key,icon]) => `<button type="button" data-v7-route="${key}" class="${key==="developer"?"v848-owner-nav":""}"><span>${icon}</span><div><strong data-v7-nav-label="${key}"></strong><small data-v7-nav-sub="${key}"></small></div></button>`).join("")}</nav>
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
    return `<div class="v7-page-heading"><div class="v7-page-title"><span>${icon}</span><div><p class="eyebrow">WORKDAY JOURNEY · V8.5.0</p><h2>${esc(title)}</h2><p class="muted">${esc(help)}</p></div></div>${actions ? `<div class="v7-page-actions">${actions}</div>` : ""}</div>`;
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
    const exchange = document.createElement("section"); exchange.id="v84ExchangePage"; exchange.className="v7-page-panel"; exchange.dataset.v7Page="exchange"; main.appendChild(exchange);
    const skills = document.createElement("section"); skills.id="wdjSkillTreePage"; skills.className="v7-page-panel"; skills.dataset.v7Page="skills"; main.appendChild(skills);
    const focus = document.createElement("section"); focus.id="wdjFocusPage"; focus.className="v7-page-panel"; focus.dataset.v7Page="focus"; main.appendChild(focus);
    const ws = document.createElement("section"); ws.id="wdjWorkspacePage"; ws.className="v7-page-panel"; ws.dataset.v7Page="workspace"; main.appendChild(ws);
    const rewards = document.createElement("section"); rewards.id="v81RewardsPage"; rewards.className="v7-page-panel"; rewards.dataset.v7Page="rewards"; main.appendChild(rewards);
    const developer = document.createElement("section"); developer.id="v848DeveloperPage"; developer.className="v7-page-panel"; developer.dataset.v7Page="developer"; main.appendChild(developer);
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
      exchange:["#v84ExchangePage"],
      rewards:["#v81RewardsPage"],
      developer:["#v848DeveloperPage"],
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
      if (label) label.textContent = key === "workspace" ? (document.documentElement.lang === "en" ? "My Workspace" : "ห้องทำงานของฉัน") : t(key); if (sub) sub.textContent = key === "workspace" ? (document.documentElement.lang === "en" ? "Decorate your cozy pixel room" : "ตกแต่งห้อง Pixel Art ส่วนตัว") : t(`${key}Sub`);
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
    if (route === "exchange") window.WorkdayRewards?.renderExchange?.();
    if (route === "rewards") window.WorkdayRewards?.renderShop?.();
    if (route === "workspace") window.WorkdayWorkspace?.render?.();
    if (route === "focus") window.WorkdayFocus?.render?.();
    if (route === "skills") window.WorkdaySkills?.render?.();
    if (route === "developer") window.WorkdayV848?.renderDeveloper?.();
    if (route === "settings") renderSettingsPage();
    // Complete presentation refresh synchronously after the page DOM is rebuilt.
    // JS runs to completion before the browser paints, avoiding a one-frame legacy UI.
    if (["dashboard", "journal", "projects", "calendar", "reports"].includes(route)) {
      window.WorkdayV852?.refresh?.();
    } else if (route === "achievements") {
      window.WorkdayV853?.refresh?.();
    }
    window.WorkdayV850?.refresh?.();
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
    const cards=visible.length?visible.map(p=>{const days=Object.values(journals).filter(j=>j.projectIds?.includes(p.id)).length;return `<article class="card v7-project-card ${p.archived?"archived":""}"><div class="v7-project-head"><div><span class="v7-status-dot ${esc(p.status)}"></span><strong>${esc(p.name)}</strong><small>${esc(p.category||"")}</small></div><b>${Math.round(p.progress||0)}%</b></div><div class="v7-project-progress"><i style="width:${Math.max(0,Math.min(100,Number(p.progress)||0))}%"></i></div><p>${esc(p.description||t("noData"))}</p><small>${days} ${esc(t("journalDays"))}</small><div class="v845-project-files-row"><span data-v845-file-summary="${esc(p.id)}">☁ ${esc(lang()==="th"?"Project File Vault":"Project File Vault")}</span><button class="small-text-btn v845-project-files-btn" data-v845-project-files="${esc(p.id)}" type="button">📁 ${esc(lang()==="th"?"ไฟล์ Project":"Project Files")}</button></div><div class="v7-card-actions"><button class="small-text-btn" data-v7-project-edit="${esc(p.id)}" type="button" aria-label="Edit ${esc(p.name)}">✎</button><button class="small-text-btn" data-v76-project-archive="${esc(p.id)}" type="button" aria-label="${esc(p.archived?t("restoreProject"):t("archiveProject"))}">${p.archived?"↩":"📦"}</button><button class="small-text-btn danger-text" data-v7-project-delete="${esc(p.id)}" type="button" aria-label="${esc(t("delete"))} ${esc(p.name)}">🗑</button></div></article>`;}).join(""):`<div class="card v7-empty">🧩 ${esc(t("noProjects"))}</div>`;
    const counts={active:projects.filter(p=>!p.archived&&p.status!=="completed"&&Number(p.progress)<100).length,completed:projects.filter(p=>!p.archived&&(p.status==="completed"||Number(p.progress)>=100)).length,archived:projects.filter(p=>p.archived).length};
    root.innerHTML=`${pageHeader("🧩",t("projectsTitle"),t("projectsHelp"))}<div class="v7-project-layout"><form id="v7ProjectForm" class="card v7-form-card v7-project-form-wide"><input id="v7ProjectId" type="hidden" value="${esc(edit.id)}"><div class="v7-two-col"><label><span>${esc(t("projectName"))}</span><input id="v7ProjectName" maxlength="60" value="${esc(edit.name)}"></label><label><span>${esc(t("category"))}</span><input id="v7ProjectCategory" maxlength="40" value="${esc(edit.category)}" placeholder="Web / Power BI / Learning"></label></div><div class="v7-two-col"><label><span>${esc(t("progress"))}</span><input id="v7ProjectProgress" type="number" min="0" max="100" step="5" value="${Math.round(edit.progress||0)}"></label><label><span>${esc(t("status"))}</span><select id="v7ProjectStatus"><option value="active" ${edit.status==="active"?"selected":""}>${esc(t("active"))}</option><option value="paused" ${edit.status==="paused"?"selected":""}>${esc(t("paused"))}</option><option value="completed" ${edit.status==="completed"?"selected":""}>${esc(t("completed"))}</option></select></label></div><label class="v7-project-description-field"><span>${esc(t("description"))}</span><textarea id="v7ProjectDescription" rows="5">${esc(edit.description)}</textarea></label><div class="v7-form-actions"><button id="v7ProjectNew" class="secondary-btn" type="button">＋ ${esc(t("newProject"))}</button><button class="primary-btn" type="submit">${esc(t("saveProject"))}</button></div></form><section class="v7-project-list-section"><div class="v7-project-list-heading"><div><p class="eyebrow">PROJECTS</p><h3>${esc(t("projectList"))}</h3></div><div class="v76-project-tabs"><button type="button" data-v76-project-view="active" class="${projectViewState==="active"?"active":""}">${esc(t("projectActiveTab"))} <b>${counts.active}</b></button><button type="button" data-v76-project-view="completed" class="${projectViewState==="completed"?"active":""}">${esc(t("projectCompletedTab"))} <b>${counts.completed}</b></button><button type="button" data-v76-project-view="archived" class="${projectViewState==="archived"?"active":""}">${esc(t("projectArchivedTab"))} <b>${counts.archived}</b></button></div></div><div class="v7-project-cards">${cards}</div></section></div>`;
    $("v7ProjectNew")?.addEventListener("click",()=>renderProjectsPage());
    qa("[data-v76-project-view]",root).forEach(btn=>btn.addEventListener("click",()=>{projectViewState=btn.dataset.v76ProjectView;localStorage.setItem(KEYS.projectView,projectViewState);renderProjectsPage();}));
    $("v7ProjectForm")?.addEventListener("submit",e=>{e.preventDefault();const name=$("v7ProjectName").value.trim();if(!name){toast("!",t("projectNameRequired"),"error");return;}const list=getProjects(),id=$("v7ProjectId").value||`p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`,old=list.find(p=>p.id===id);const item={id,name,category:$("v7ProjectCategory").value.trim(),progress:Math.max(0,Math.min(100,Number($("v7ProjectProgress").value)||0)),status:$("v7ProjectStatus").value,description:$("v7ProjectDescription").value.trim(),archived:!!old?.archived,createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};const next=list.filter(p=>p.id!==id);next.push(item);next.sort((a,b)=>(!!a.archived)-(!!b.archived)||(a.status==="completed")-(b.status==="completed")||a.name.localeCompare(b.name));write(KEYS.projects,next);signalDataChanged();toast("✓",t("projectSaved"),"success");renderProjectsPage();});
    qa("[data-v7-project-edit]",root).forEach(btn=>btn.addEventListener("click",()=>renderProjectsPage(btn.dataset.v7ProjectEdit)));
    qa("[data-v76-project-archive]",root).forEach(btn=>btn.addEventListener("click",async()=>{const id=btn.dataset.v76ProjectArchive,list=getProjects(),p=list.find(x=>x.id===id);if(!p)return;const before=deepClone(list);if(!p.archived&&!(await askConfirm(t("projectArchiveConfirm"),false)))return;p.archived=!p.archived;p.updatedAt=new Date().toISOString();write(KEYS.projects,list);signalDataChanged();const msg=p.archived?t("projectArchived"):t("projectRestored");toast(p.archived?"📦":"↩",msg,p.archived?"info":"success");showUndoToast(msg,()=>{write(KEYS.projects,before);signalDataChanged();renderProjectsPage();});renderProjectsPage();}));
    qa("[data-v7-project-delete]",root).forEach(btn=>btn.addEventListener("click",async()=>{if(!(await askConfirm(t("confirmDeleteProject"))))return;const id=btn.dataset.v7ProjectDelete,beforeProjects=deepClone(getProjects()),beforeJournals=deepClone(getJournals());const vault=window.WorkdayProjectFileVault;if(vault?.cleanupBeforeProjectDelete){const cleanup=await vault.cleanupBeforeProjectDelete(id);if(cleanup===false){toast("!",lang()==="th"?"ยังลบ Project ไม่ได้ เพราะลบไฟล์ Cloud ไม่สำเร็จ":"Project was not deleted because Cloud files could not be removed.","error");return;}}write(KEYS.projects,getProjects().filter(p=>p.id!==id));const js=getJournals();Object.values(js).forEach(j=>{if(Array.isArray(j.projectIds))j.projectIds=j.projectIds.filter(x=>x!==id);});write(KEYS.journal,js);signalDataChanged();toast("🗑",t("projectDeleted"),"warning");showUndoToast(t("projectDeleted"),()=>{write(KEYS.projects,beforeProjects);write(KEYS.journal,beforeJournals);signalDataChanged();renderProjectsPage();});renderProjectsPage();}));
  }

  function challengeProgressText(a) {
    const current=Math.min(Number(a.current)||0,Number(a.target)||1),target=Number(a.target)||1,locale=lang()==="th"?"th-TH":"en-US";
    if(a.unit==="hours")return `${current.toLocaleString(locale,{maximumFractionDigits:1})} / ${target.toLocaleString(locale)} h`;
    if(a.unit==="percent")return `${current.toFixed(1)} / ${target}%`;
    const suffix={coins:" 🪙",days:lang()==="th"?" วัน":" days",companies:lang()==="th"?" บริษัท":" companies",lessons:lang()==="th"?" บท":" lessons",files:lang()==="th"?" ไฟล์":" files",versions:lang()==="th"?" เวอร์ชัน":" versions",trades:lang()==="th"?" ครั้ง":" trades",deposits:lang()==="th"?" ครั้ง":" deposits"}[a.unit]||"";
    const maxDigits=a.unit==="coins"?2:0;
    return `${current.toLocaleString(locale,{maximumFractionDigits:maxDigits})} / ${target.toLocaleString(locale,{maximumFractionDigits:maxDigits})}${suffix}`;
  }
  function tierLabel(tier){return t(tier)||tier;}
  function categoryLabel(category){return t(`category${String(category||"").charAt(0).toUpperCase()+String(category||"").slice(1)}`)||category;}
  function renderAchievementsPage() {
    const root=$("v7AchievementsPage");if(!root)return;
    const stats=API.getStats(),allAch=API.getAchievements(stats),journeyAch=allAch.filter(a=>a.masteryEligible!==false),featureAch=allAch.filter(a=>a.masteryEligible===false);
    const journeyCategoryIds=["all","journey","time","projects","journal","attendance","exploration"],featureCategoryIdsLocal=["all","bank","exchange","vault"];
    if(!["journey","features"].includes(achievementViewState))achievementViewState="journey";
    if(!journeyCategoryIds.includes(achievementCategoryState))achievementCategoryState="all";
    if(!featureCategoryIdsLocal.includes(featureAchievementCategoryState))featureAchievementCategoryState="all";
    const unlocked=allAch.filter(a=>a.unlocked).length,journeyDone=journeyAch.filter(a=>a.unlocked).length,featureDone=featureAch.filter(a=>a.unlocked).length;
    const tiers=["common","rare","epic","legendary"],masteryStates=tierMasteryStates(journeyAch),masteredCount=masteryStates.filter(x=>x.unlocked).length,titles=titleStates(),titlesUnlocked=titles.filter(x=>x.unlocked).length,activeTitle=selectedTitle();
    const journeyCategories=[
      ["all","✨",t("achievementAllCategories")],["journey","🧭",categoryLabel("journey")],["time","⏱",categoryLabel("time")],["projects","🧩",categoryLabel("projects")],
      ["journal","📓",categoryLabel("journal")],["attendance","📅",categoryLabel("attendance")],["exploration","🔎",categoryLabel("exploration")]
    ];
    const featureCategories=[["all","✨",t("featureAll")],["bank","🏦",categoryLabel("bank")],["exchange","📈",categoryLabel("exchange")],["vault","📁",categoryLabel("vault")]];
    const modeTabs=`<div class="v847-ach-mode" role="tablist" aria-label="Achievement groups"><button type="button" role="tab" aria-selected="${achievementViewState==="journey"}" data-v847-ach-view="journey" class="${achievementViewState==="journey"?"active":""}"><span>🎯</span><div><strong>${esc(t("journeyChallenges"))}</strong><small>${esc(t("journeyChallengesHelp"))}</small></div><b>${journeyDone}/${journeyAch.length}</b></button><button type="button" role="tab" aria-selected="${achievementViewState==="features"}" data-v847-ach-view="features" class="${achievementViewState==="features"?"active":""}"><span>🚀</span><div><strong>${esc(t("featureAchievements"))}</strong><small>${esc(t("featureAchievementsHelp"))}</small></div><b>${featureDone}/${featureAch.length}</b></button></div>`;
    const renderFilters=(categories,list,state,attr)=>`<div class="v847-filter-shell"><div class="v846-ach-filters" data-v847-scroll-strip>${categories.map(([id,icon,label])=>{const count=id==="all"?list.length:list.filter(a=>a.category===id).length;return `<button type="button" ${attr}="${id}" class="${state===id?"active":""}"><span>${icon}</span><b>${esc(label)}</b><small>${count}</small></button>`;}).join("")}</div></div>`;
    const journeyFiltered=achievementCategoryState==="all"?journeyAch:journeyAch.filter(a=>a.category===achievementCategoryState);
    const featureFiltered=featureAchievementCategoryState==="all"?featureAch:featureAch.filter(a=>a.category===featureAchievementCategoryState);
    const journeyFilters=renderFilters(journeyCategories,journeyAch,achievementCategoryState,"data-v847-journey-category");
    const featureFilters=renderFilters(featureCategories,featureAch,featureAchievementCategoryState,"data-v847-feature-category");
    const achievementCard=(a,feature=false)=>{const tier=a.tier||"common",titleReward=feature?null:titleRewardForAchievement(a.id),progress=Math.max(0,Math.min(100,Number(a.percent)||0)),state=a.unlocked?"unlocked":progress>0?"progress":"locked",coin=Number(a.coinReward)||0,claimed=coin>0&&read("wp-v81-coin-ledger",[]).some(x=>x?.id===`earn:achievement:${a.id}`);
      if(feature)return `<article tabindex="0" role="button" aria-label="${esc(API.translate(a.titleKey))}" data-v76-achievement="${esc(a.id)}" class="card v7-achievement-card v7-challenge-card v847-feature-ach-card ${state}" data-category="${esc(a.category||"")}"><div class="v847-feature-card-top"><span class="v7-trophy">${a.unlocked?a.icon:"🔒"}</span><span class="v847-feature-source">${a.category==="bank"?"🏦":a.category==="exchange"?"📈":"📁"} ${esc(categoryLabel(a.category))}</span></div><div class="v7-challenge-copy"><strong>${esc(API.translate(a.titleKey))}</strong><p>${esc(API.translate(a.descKey))}</p></div><div class="v7-challenge-progress"><div><i style="width:${progress}%"></i></div><span>${a.unlocked?`✓ ${esc(t("challengeComplete"))}`:esc(challengeProgressText(a))}</span></div>${coin?`<div class="v846-ach-coin ${a.unlocked?"earned":""}">🪙 <span>+${coin.toLocaleString()} Coins</span>${a.unlocked&&claimed?"<b>✓</b>":""}</div>`:""}<small class="v76-detail-hint">${esc(t("achievementDetail"))} →</small></article>`;
      return `<article tabindex="0" role="button" aria-label="${esc(API.translate(a.titleKey))}" data-v76-achievement="${esc(a.id)}" class="card v7-achievement-card v7-challenge-card ${state}" data-tier="${esc(tier)}"><div class="v7-challenge-top"><span class="v7-trophy">${a.unlocked?a.icon:"🔒"}</span><span class="v7-tier-badge" data-tier="${esc(tier)}">${esc(tierLabel(tier))}</span></div><div class="v7-challenge-copy"><span class="v7-category">${esc(categoryLabel(a.category))}</span><strong>${esc(API.translate(a.titleKey))}</strong><p>${esc(API.translate(a.descKey))}</p></div><div class="v7-challenge-progress"><div><i style="width:${progress}%"></i></div><span>${a.unlocked?`✓ ${esc(t("challengeComplete"))}`:esc(challengeProgressText(a))}</span></div>${titleReward?`<div class="v7-title-reward ${a.unlocked?"earned":"locked"}" data-tier="${esc(titleReward.tier)}">👑 <span>${esc(t("rewardTitle"))}: <strong>${esc(titleName(titleReward))}</strong></span></div>`:""}<small class="v76-detail-hint">${esc(t("achievementDetail"))} →</small></article>`;};
    const tierSections=tiers.map(tier=>{const items=journeyFiltered.filter(a=>(a.tier||"common")===tier);if(!items.length)return"";const done=items.filter(a=>a.unlocked).length,mastery=masteryStates.find(x=>x.tier===tier),reward=mastery?.reward,cards=items.map(a=>achievementCard(a,false)).join("");
      const showMastery=achievementCategoryState==="all"&&!!reward;
      const tierSymbol=tier==="common"?"◆":tier==="rare"?"✦":tier==="epic"?"✧":"♛";
      const masteryPanel=showMastery?`<div class="v8475-mastery-panel ${mastery?.unlocked?"unlocked":"locked"}"><div class="v8475-mastery-emblem"><span>${mastery?.unlocked?"✦":"◇"}</span></div><div class="v8475-mastery-copy"><span class="v8475-mastery-label">${esc(t("masteryReward"))}</span><div class="v8475-mastery-rewards"><div><small>${esc(t("masteryTitle"))}</small><strong>${esc(titleName(reward))}</strong></div><div><small>${esc(t("masteryEffect"))}</small><strong><i class="v8475-theme-dot" aria-hidden="true"></i>${esc(masteryEffectName(reward))}</strong></div></div><p>${esc(mastery?.unlocked?t("masteryComplete"):t("masteryLocked"))}</p></div><b class="v8475-mastery-progress">${mastery?.done||0}/${mastery?.total||0}</b></div>`:"";
      return `<section class="v7-tier-section v8475-tier-section" data-tier="${esc(tier)}"><div class="v8475-tier-hero ${showMastery?"has-mastery":""}" data-tier="${esc(tier)}"><div class="v8475-tier-overview"><div class="v7-tier-symbol" data-tier="${esc(tier)}">${tierSymbol}</div><div class="v8475-tier-copy"><p class="eyebrow">${esc(tierLabel(tier).toUpperCase())} TIER</p><h3>${done}/${items.length} ${esc(t("challenges"))}</h3><small>${esc(showMastery?(lang()==="th"?"ทำ Challenge ใน Tier นี้ให้ครบเพื่อรับฉายาและเอฟเฟกต์ธีม":"Complete this tier to earn its title and theme effect"):(lang()==="th"?"ผลลัพธ์ตามตัวกรองที่เลือก":"Results for the selected filter"))}</small></div><span class="v7-tier-badge" data-tier="${esc(tier)}">${esc(tierLabel(tier))}</span></div>${masteryPanel}</div><div class="v7-achievement-grid">${cards}</div></section>`;}).join("");
    const journeyFilteredNote=achievementCategoryState!=="all"?`<div class="v846-ach-filter-summary"><span>${journeyCategories.find(x=>x[0]===achievementCategoryState)?.[1]||"🏆"}</span><strong>${esc(journeyCategories.find(x=>x[0]===achievementCategoryState)?.[2]||achievementCategoryState)}</strong><small>${journeyFiltered.filter(a=>a.unlocked).length}/${journeyFiltered.length} ${esc(t("unlocked"))}</small></div>`:"";
    const featureGroups=[
      ["bank","🏦",categoryLabel("bank"),lang()==="th"?"การฝาก Savings, Streak และดอกเบี้ยทบต้น":"Savings deposits, streaks and compound interest"],
      ["exchange","📈",categoryLabel("exchange"),lang()==="th"?"Trading Academy, Portfolio และการทดลองลงทุน":"Trading Academy, portfolio and simulated investing"],
      ["vault","📁",categoryLabel("vault"),lang()==="th"?"การอัปโหลด จัดเก็บ และสร้าง Version ของไฟล์ Project":"Upload, organize and version Project files"]
    ];
    const featureSections=featureGroups.filter(([id])=>featureAchievementCategoryState==="all"||featureAchievementCategoryState===id).map(([id,icon,label,help])=>{const items=featureFiltered.filter(a=>a.category===id);if(!items.length)return"";const done=items.filter(a=>a.unlocked).length;return `<section class="v847-feature-section" data-category="${id}"><div class="v847-feature-section-head"><div><span>${icon}</span><div><p class="eyebrow">FEATURE ACHIEVEMENTS</p><h3>${esc(label)}</h3><small>${esc(help)}</small></div></div><b>${done}/${items.length}</b></div><div class="v847-feature-grid">${items.map(a=>achievementCard(a,true)).join("")}</div></section>`;}).join("");
    const viewContent=achievementViewState==="journey"?`${journeyFilters}<div class="v847-tier-note"><span>✦</span><div><strong>${esc(t("journeyChallenges"))}</strong><small>${esc(t("journeyChallengesHelp"))}</small></div></div>${journeyFilteredNote}${tierSections}`:`${featureFilters}<div class="v847-tier-note feature"><span>🪙</span><div><strong>${esc(t("featureAchievements"))}</strong><small>${esc(t("featureTierNote"))}</small></div></div>${featureSections}`;
    root.innerHTML=`${pageHeader("🏆",t("challengeCenter"),t("challengeHelp"))}<div class="card v7-achievement-summary"><div><span>${esc(t("achievementsCount"))}</span><strong>${unlocked}/${allAch.length}</strong><small>${esc(t("achievementProgress",{n:unlocked,total:allAch.length}))}</small></div><div class="v7-achievement-meter"><i style="width:${allAch.length?unlocked/allAch.length*100:0}%"></i></div><div class="v7-title-summary"><span>👑 ${esc(t("titleSystem"))}</span><strong>${titlesUnlocked}/${titles.length}</strong><small>${activeTitle?esc(titleName(activeTitle)):esc(t("noTitle"))}</small></div><div class="v7-title-summary v7-mastery-summary"><span>✦ ${esc(t("tierMasteries"))}</span><strong>${masteredCount}/4</strong><small>${esc(t("masteryProgress",{n:masteredCount}))}</small></div></div>${modeTabs}<div class="v847-ach-view">${viewContent}</div>`;
    qa("[data-v847-ach-view]",root).forEach(btn=>btn.addEventListener("click",()=>{achievementViewState=btn.dataset.v847AchView||"journey";localStorage.setItem(KEYS.achievementView,achievementViewState);renderAchievementsPage();}));
    qa("[data-v847-journey-category]",root).forEach(btn=>btn.addEventListener("click",()=>{achievementCategoryState=btn.dataset.v847JourneyCategory||"all";localStorage.setItem(KEYS.achievementCategory,achievementCategoryState);renderAchievementsPage();}));
    qa("[data-v847-feature-category]",root).forEach(btn=>btn.addEventListener("click",()=>{featureAchievementCategoryState=btn.dataset.v847FeatureCategory||"all";localStorage.setItem(KEYS.featureAchievementCategory,featureAchievementCategoryState);renderAchievementsPage();}));
    qa("[data-v847-scroll-strip]",root).forEach(strip=>strip.addEventListener("wheel",e=>{if(strip.scrollWidth<=strip.clientWidth||Math.abs(e.deltaX)>=Math.abs(e.deltaY))return;e.preventDefault();strip.scrollLeft+=e.deltaY;},{passive:false}));
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
    mirrorSelect("v7Density","densitySelect",[["comfortable",t("comfortable")],["compact",t("compact")],["spacious",lang()==="th"?"โปร่งสบาย":"Spacious"]]);
    mirrorSelect("v7Timezone","timezoneSelect",qa("#timezoneSelect option").map(o=>[o.value,o.textContent]));
    mirrorSelect("v7Locale","localeSelect",qa("#localeSelect option").map(o=>[o.value,o.textContent]));
    mirrorToggle("v7Seconds","showSecondsToggle");mirrorToggle("v7Animation","animationToggle");mirrorToggle("v7Mood","dynamicMoodToggle");mirrorToggle("v7Notifications","notificationToggle");
    const previewTitle=()=>{const value=$("v7TitleSelect")?.value||"",item=titleStates().find(x=>x.id===value&&x.unlocked)||null,box=$("v76TitlePreview");if(!box)return;box.classList.toggle("active",!!item);box.dataset.tier=item?.tier||"common";box.dataset.mastery=item?.masteryTier||"";box.querySelector("span").textContent=item?.masteryTier?"✦":"👑";box.querySelector("strong").textContent=item?titleName(item):t("noTitle");};
    $("v7TitleSelect")?.addEventListener("change",previewTitle); $("v76ApplyTitle")?.addEventListener("click",()=>setSelectedTitle($("v7TitleSelect")?.value||""));
    $("v7EditJourney")?.addEventListener("click",()=>$("editJourneyBtn")?.click());$("v7ExportBackup")?.addEventListener("click",()=>$("exportBackupBtn")?.click());$("v7ImportBackup")?.addEventListener("click",()=>$("importBackupBtn")?.click());$("v7Customize")?.addEventListener("click",()=>$("v6SettingsCustomize")?.click());$("v7OpenAdvanced")?.addEventListener("click",()=>$("settingsOpen")?.click());$("v7NewJourney")?.addEventListener("click",()=>$("startNewJourneyBtn")?.click());$("v7ResetData")?.addEventListener("click",async()=>{if(window.WorkdayDataSafety?.confirmRisk && !window.WorkdayDataSafety.confirmRisk("reset"))return;if(!(await askConfirm(t("confirmResetData"))))return;if(window.WorkdayV8Cloud?.isSignedIn?.()){const ok=await window.WorkdayV8Cloud.deleteCloudState?.();if(ok===false)return;}const keys=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.startsWith("wp-"))keys.push(key);}keys.forEach(k=>localStorage.removeItem(k));localStorage.setItem("wp-data-reset-version","5.2-setup-calendar-reset");location.reload();});
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
;
