(() => {
  "use strict";

  const APP_VERSION = "7.1.0";
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
      fontFamily: "รูปแบบตัวอักษร", fontHelp: "Sarabun จะโหลดจากไฟล์ภายในโปรเจกต์ หลังติดตั้งครั้งแรกด้วย setup-sarabun-font.bat และใช้งาน Offline ได้",
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
      settings: "Settings", fontFamily: "Font Family", fontHelp: "Sarabun loads from this project after one-time setup with setup-sarabun-font.bat, then works offline.",
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
    welcomeTitle: "ยินดีต้อนรับสู่ Workday Journey", welcomeSubtitle: "สร้าง Journey ของคุณเอง ข้อมูลทั้งหมดจะถูกเก็บไว้ใน Browser เครื่องนี้",
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
    privacyNoticeTitle: "ความเป็นส่วนตัว", privacyNotice: "ข้อมูล Journey, วันลา และ Settings ถูกเก็บใน localStorage ของ Browser นี้ และไม่ได้อัปโหลดไปยัง Server ของเว็บ",
    shareSummary: "แชร์สรุป", shareCopied: "คัดลอกสรุป Journey แล้ว", shareTitle: "Workday Journey Summary", demoJourneyName: "Public Demo Journey", myJourney: "My Journey",
    versionLabel: "เวอร์ชัน", updateAvailable: "มีเวอร์ชันใหม่พร้อมใช้งาน", updateHelp: "Refresh เพื่อโหลดไฟล์ล่าสุดจาก Deployment", refreshNow: "Refresh ตอนนี้",
    profileSummary: "สรุปโปรไฟล์", workdaysLabelShort: "วันทำงาน", noName: "ยังไม่ได้ตั้งชื่อ", timezoneChanged: "เปลี่ยนเขตเวลาแล้ว", localeChanged: "เปลี่ยนรูปแบบวันที่แล้ว",
    setupPrivacy: "ข้อมูลของคุณจะอยู่ใน Browser นี้เท่านั้น คนอื่นที่เปิด URL เดียวกันจะมีข้อมูลแยกของตัวเอง", monday:"จ", tuesday:"อ", wednesday:"พ", thursday:"พฤ", friday:"ศ", saturday:"ส", sunday:"อา",
    fullDayLeaveHelp: "ลาตามเวลาทำงานเต็มวัน", halfDayLeaveHelp: "ลาครึ่งหนึ่งของเวลาทำงาน", normalScheduleHelp: "ใช้วันทำงานตามที่ตั้งไว้ใน Journey",
    recordEquivalentDays: "เทียบเท่าวันทำงานเต็ม", footerText: "Workday Journey V7.1 · Sidebar & Typography Update · ข้อมูลเก็บใน Browser",
    heroWorking: "วันนี้กำลังเดินหน้าไปเรื่อย ๆ ทำงานให้ครบเวลาตามตารางกันครับ", heroFinished: "ภารกิจวันนี้ครบแล้ว ทำเวลางานตามตารางสำเร็จครับ",
    notifyDoneBody: "เวลาทำงานตามตารางของวันนี้ครบแล้ว", completionMessageDynamic: "Journey ตั้งแต่ {start} ถึง {end} ครบเรียบร้อยแล้ว",
    weekendStatus: "วันหยุดประจำ", heroWeekend: "วันนี้ไม่อยู่ในวันทำงานประจำ ระบบจะไม่นับเวลาทำงาน", statusWeekend: "วันหยุดประจำ", dayOffLabel: "วันหยุดประจำ"
  });
  Object.assign(translations.en, {
    welcomeTitle: "Welcome to Workday Journey", welcomeSubtitle: "Create your own journey. Your data stays in this browser.",
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
    privacyNoticeTitle: "Privacy", privacyNotice: "Journey data, leave records and settings are stored in this browser's localStorage and are not uploaded to the website server.",
    shareSummary: "Share Summary", shareCopied: "Journey summary copied", shareTitle: "Workday Journey Summary", demoJourneyName: "Public Demo Journey", myJourney: "My Journey",
    versionLabel: "Version", updateAvailable: "A new version is available", updateHelp: "Refresh to load the latest deployed files", refreshNow: "Refresh Now",
    profileSummary: "Profile Summary", workdaysLabelShort: "Working days", noName: "No name set", timezoneChanged: "Timezone updated", localeChanged: "Locale updated",
    setupPrivacy: "Your data stays in this browser. Other people opening the same URL get their own separate data.", monday:"Mon", tuesday:"Tue", wednesday:"Wed", thursday:"Thu", friday:"Fri", saturday:"Sat", sunday:"Sun",
    fullDayLeaveHelp: "Leave for the full scheduled work time", halfDayLeaveHelp: "Leave for half of the scheduled work time", normalScheduleHelp: "Use the regular working days configured for this journey",
    recordEquivalentDays: "Equivalent full workdays", footerText: "Workday Journey V7.1 · Sidebar & Typography Update · Data stays in your browser",
    heroWorking: "The day is moving forward. Keep going toward your scheduled work time.", heroFinished: "Today's scheduled working time is complete.",
    notifyDoneBody: "You have completed today's scheduled working time", completionMessageDynamic: "Your journey from {start} to {end} is complete",
    weekendStatus: "Day Off", heroWeekend: "Today is not one of your regular working days, so no work time is counted", statusWeekend: "Day Off", dayOffLabel: "Day Off"
  });


  const FONT_MAP = {
    sarabun: '"Sarabun Local", "Sarabun", "Noto Sans Thai", "Leelawadee UI", Tahoma, "Segoe UI", sans-serif',
    system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    noto: '"Noto Sans Thai", "Leelawadee UI", Tahoma, sans-serif',
    ibm: '"IBM Plex Sans Thai", "Leelawadee UI", Tahoma, sans-serif',
    leelawadee: '"Leelawadee UI", Tahoma, sans-serif',
    tahoma: 'Tahoma, "Segoe UI", sans-serif'
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

  function getAchievements(stats) {
    const hours = stats.elapsedMinutes / 60;
    const defs = [
      { id: "first-day", icon: "🌱", titleKey: "firstDayTitle", descKey: "firstDayDesc", unlocked: stats.startedDays >= 1 },
      { id: "100-hours", icon: "⏱", titleKey: "h100Title", descKey: "h100Desc", unlocked: hours >= 100 },
      { id: "250-hours", icon: "🚀", titleKey: "h250Title", descKey: "h250Desc", unlocked: hours >= 250 },
      { id: "halfway", icon: "⭐", titleKey: "halfwayTitle", descKey: "halfwayDesc", unlocked: stats.percent >= 50 },
      { id: "500-hours", icon: "🏆", titleKey: "h500Title", descKey: "h500Desc", unlocked: hours >= 500 },
      { id: "750-hours", icon: "💪", titleKey: "h750Title", descKey: "h750Desc", unlocked: hours >= 750 },
      { id: "75-percent", icon: "🎯", titleKey: "p75Title", descKey: "p75Desc", unlocked: stats.percent >= 75 },
      { id: "800-hours", icon: "🏅", titleKey: "h800Title", descKey: "h800Desc", unlocked: hours >= 800 },
      { id: "1000-hours", icon: "🔥", titleKey: "h1000Title", descKey: "h1000Desc", unlocked: hours >= 1000 },
      { id: "completed", icon: "🎓", titleKey: "completeTitle", descKey: "completeDesc", unlocked: stats.journeyComplete }
    ];
    const hourTargets = { "100-hours":100, "250-hours":250, "500-hours":500, "750-hours":750, "800-hours":800, "1000-hours":1000 };
    return defs.filter(item => !hourTargets[item.id] || hourTargets[item.id] * 60 <= stats.totalAttainableMinutes + .001);
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
  function achievementTargetMinutes(item, stats) {
    const map={"first-day":0,"100-hours":6000,"250-hours":15000,"halfway":stats.totalPlannedMinutes*.5,"500-hours":30000,"750-hours":45000,"75-percent":stats.totalPlannedMinutes*.75,"800-hours":48000,"1000-hours":60000,"completed":stats.totalPlannedMinutes};
    return Math.min(stats.totalPlannedMinutes, map[item.id] ?? stats.totalPlannedMinutes);
  }
  function renderAchievementShowcase(stats, achievements) {
    const unlocked=achievements.filter(a=>a.unlocked); els.statsAchievementCount.textContent=`${unlocked.length} / ${achievements.length}`;
    els.achievementsGrid.innerHTML=achievements.map(item=>{
      const target=achievementTargetMinutes(item,stats);
      const date=item.id==="halfway"||item.id==="75-percent" ? cumulativeScheduledTargetDate(target) : item.id==="completed" ? dateWithMinutes(CONFIG.internshipEnd,parseTime(CONFIG.workdayEnd)) : cumulativeTargetDate(target);
      const when=(item.unlocked?t("unlockedOn"):t("expectedOn")).replace("{date}",formatPredictionDate(date));
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
    let lead="";
    if(status.type==="work") lead=`${dailyPercent.toFixed(1)}% · ${formatDuration(Math.max(0,getActualDayCapacity(getConfiguredNow())-getWorkedMinutes(getConfiguredNow())),true)}`;
    else if(status.type==="break") lead=t("browserTitleBreak").replace("{minutes}",nextBreak?.minutes??0);
    else if(status.type==="finished") lead=t("browserTitleDone");
    else if(status.type==="before") lead=t("browserTitleBefore"); else lead=t("browserTitleOff");
    document.title=`${lead} · ${stats.percent.toFixed(1)}% Internship | Workday Progress`;
  }
  function showToast(icon,title,message="") {
    if(!els.toastStack) return; const node=document.createElement("div"); node.className="app-toast"; node.innerHTML=`<span>${icon}</span><div><strong>${escapeHtml(title)}</strong>${message?`<small>${escapeHtml(message)}</small>`:""}</div>`; els.toastStack.appendChild(node);
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
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i); if (key?.startsWith("wp-") && !key.startsWith("wp-notify-")) data[key] = localStorage.getItem(key);
    }
    const payload = { app: "Workday Journey", version: APP_VERSION, exportedAt: new Date().toISOString(), data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob), a = document.createElement("a"); a.href = url; a.download = `workday-journey-backup-${dateKey(getConfiguredNow())}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("💾", t("backupCreated"));
  }
  async function importBackupFile(file) {
    try {
      const payload = JSON.parse(await file.text());
      if (!payload || typeof payload.data !== "object" || Array.isArray(payload.data)) throw new Error("invalid");
      if (!confirm(t("importConfirm"))) return;
      [...Array(localStorage.length)].map((_,i) => localStorage.key(i)).filter(Boolean).filter(k => k.startsWith("wp-")).forEach(k => localStorage.removeItem(k));
      for (const [key, value] of Object.entries(payload.data)) if (key.startsWith("wp-") && typeof value === "string") localStorage.setItem(key, value);
      localStorage.setItem(DATA_RESET_MARKER, DATA_RESET_VERSION);
      localStorage.setItem("wp-app-version", APP_VERSION); alert(t("backupImported")); location.reload();
    } catch { showToast("!", t("invalidBackup")); }
  }
  function clearJourneyStorage() {
    const fixed = ["wp-day-overrides","wp-seen-achievements","wp-achievements-initialized","wp-completion-seen","wp-journey-config","wp-setup-completed",
      "wp-v6-journal","wp-v6-projects","wp-v6-recap-dismissed"];
    fixed.forEach(k => localStorage.removeItem(k));
    const transient = []; for (let i=0;i<localStorage.length;i++){ const key=localStorage.key(i); if(key?.startsWith("wp-notify-")) transient.push(key); } transient.forEach(k=>localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent("workday:journey-cleared"));
  }
  function startNewJourney() {
    if (!confirm(t("newJourneyConfirm"))) return;
    clearJourneyStorage(); state.dayOverrides = {}; state.setupCompleted = false; applyJourneyConfig(DEFAULT_JOURNEY_CONFIG, false); journeyConfig = normalizeJourneyConfig(DEFAULT_JOURNEY_CONFIG); openSetupWizard("first");
  }
  function resetAllData() {
    if (!confirm(t("resetAllConfirm"))) return;
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

  function resolveTheme(value) { return value === "system" ? (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light") : value; }
  function applyPreferences() {
    document.documentElement.style.setProperty("--app-font", FONT_MAP[state.fontFamily] || FONT_MAP.system);
    const fontScale = FONT_SCALE_MAP[state.fontSize] || 1; document.documentElement.style.setProperty("--font-scale", fontScale); document.documentElement.style.fontSize = `${16 * fontScale}px`;
    const resolved = resolveTheme(state.theme); document.documentElement.dataset.theme = resolved; els.themeToggle.textContent = resolved === "dark" ? "☀" : "☾";
    document.body.classList.toggle("no-animations", !state.animations); document.body.classList.toggle("compact", state.density === "compact");
    els.fontFamilySelect.value = state.fontFamily; els.fontSizeSelect.value = state.fontSize; els.themeSelect.value = state.theme; els.clockFormatSelect.value = state.clockFormat; els.densitySelect.value = state.density; els.showSecondsToggle.checked = state.showSeconds; els.animationToggle.checked = state.animations;
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

  function setLanguage(language) { if (!translations[language]) return; state.language = language; persistPreferences(); renderTranslations(); renderDashboard(); }
  function bindEvents() {
    document.querySelectorAll(".lang-btn").forEach(button => button.addEventListener("click", () => setLanguage(button.dataset.lang)));
    els.themeToggle.addEventListener("click", () => { state.theme = resolveTheme(state.theme) === "dark" ? "light" : "dark"; persistPreferences(); applyPreferences(); });
    els.settingsOpen.addEventListener("click", openSettings); els.settingsClose.addEventListener("click", closeSettings); els.settingsBackdrop.addEventListener("click", closeSettings);
    els.fontFamilySelect.addEventListener("change", e => { state.fontFamily = e.target.value; persistPreferences(); applyPreferences(); });
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
    defaultCompanyHolidays: [...DEFAULT_COMPANY_HOLIDAYS]
  };

  function init() { applyPreferences(); renderTranslations(); bindEvents(); bindV4Events(); bindV5Events(); initPwa(); initV5(); renderDashboard(); setInterval(renderDashboard, 1000); }
  init();
})();
