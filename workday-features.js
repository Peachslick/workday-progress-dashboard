/* Workday Journey 8.6.0.8 | consolidated in original execution order.
 * Individual source sections retain their previous isolated IIFE scope.
 * Edit by finding the SOURCE separator. Do not rearrange sections.
 */

/* ===== SOURCE: v8.js ===== */
(() => {
  "use strict";

  const API = window.WorkdayJourneyAPI;
  if (!API) return;

  const VERSION = "8.7.6";
  const CLOUD_SCHEMA = 1;
  const CLOUD_TABLE = "workday_user_state";
  const $ = id => document.getElementById(id);
  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const lang = () => localStorage.getItem("wp-language") === "en" ? "en" : "th";
  const readJson = (key, fallback) => { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
  const writeJson = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  const dateKey = date => API.dateKey(date);

  const KEYS = {
    cloudLastSync: "wp-v8-cloud-last-sync",
    cloudLastHash: "wp-v8-cloud-last-hash",
    cloudLastPayloadHash: "wp-v8-cloud-last-payload-hash",
    cloudBase: "wp-v8-cloud-base-v2",
    cloudLastUpdated: "wp-v8-cloud-last-updated-at",
    cloudError: "wp-v8-cloud-last-error",
    cloudUserId: "wp-v8-cloud-user-id",
    dataUpdated: "wp-v8-data-updated-at",
    notifRead: "wp-v8-notification-read",
    journalDrafts: "wp-v8-journal-drafts",
    projectDraft: "wp-v8-project-draft",
    scheduleTemplates: "wp-v8-schedule-templates",
    pendingJournalDate: "wp-v8-open-journal-date",
    whatsNewSeen: "wp-v8472-last-seen-version"
  };

  const TEXT = {
    th: {
      cloudLocal:"Local", cloudSynced:"ซิงก์แล้ว", cloudSyncing:"กำลังซิงก์", cloudOffline:"ออฟไลน์", cloudError:"ซิงก์มีปัญหา", account:"บัญชีและ Cloud Sync", accountHelp:"ใช้งานแบบ Local ได้เหมือนเดิม หรือเข้าสู่ระบบเพื่อซิงก์ข้อมูลข้าม PC, iPad และมือถือ", cloudNotConfigured:"Deployment นี้ยังไม่ได้ตั้งค่า Supabase", cloudNotConfiguredHelp:"ตั้งค่า supabase-config.js และรัน supabase-setup.sql ก่อนเปิด Cloud Sync", email:"อีเมล", password:"รหัสผ่าน", signIn:"เข้าสู่ระบบ", createAccount:"สร้างบัญชี", signOut:"ออกจากระบบ", checkEmail:"สร้างบัญชีสำเร็จและพร้อมเข้าสู่ระบบ", signedInAs:"เข้าสู่ระบบเป็น", syncNow:"ซิงก์ตอนนี้", uploadDevice:"ใช้ข้อมูลเครื่องนี้", loadCloud:"ใช้ข้อมูล Cloud", lastSync:"ซิงก์ล่าสุด", never:"ยังไม่เคย", cloudReady:"Cloud Sync พร้อมใช้งาน", cloudUploaded:"อัปโหลดข้อมูลเครื่องนี้ขึ้น Cloud แล้ว", cloudLoaded:"โหลดข้อมูล Cloud แล้ว", cloudConflict:"พบการแก้ไขข้อมูลเดียวกันจากหลายอุปกรณ์", cloudConflictHelp:"Smart Sync รวมข้อมูลที่ไม่ชนกันให้อัตโนมัติแล้ว เหลือเฉพาะข้อมูลเดียวกันที่ถูกแก้ทั้งสองฝั่ง กรุณาเลือกชุดที่จะใช้", thisDevice:"เครื่องนี้", cloudCopy:"Cloud", cloudAutoHelp:"หลังเลือกแล้ว การเปลี่ยนแปลงใหม่จะซิงก์อัตโนมัติเมื่อออนไลน์", authFailed:"เข้าสู่ระบบไม่สำเร็จ", signupFailed:"สร้างบัญชีไม่สำเร็จ", syncFailed:"Cloud Sync ไม่สำเร็จ", localDefault:"Local เป็นค่าเริ่มต้น · Login เพื่อ Sync ข้ามอุปกรณ์", restoreCloud:"มีบัญชีอยู่แล้ว? เข้าสู่ระบบเพื่อกู้ข้อมูลจาก Cloud",
      notifications:"การแจ้งเตือน", markAllRead:"อ่านทั้งหมด", noNotifications:"ยังไม่มีการแจ้งเตือน", journalMissing:"Journal ยังไม่ได้บันทึก", journalMissingBody:"วันที่ {date} เป็นวันทำงานที่ผ่านแล้ว แต่ยังไม่มี Daily Journal", backupOld:"ควรสำรองข้อมูล", backupNever:"ยังไม่เคย Export Backup", backupOldBody:"Backup ล่าสุดผ่านมา {days} วันแล้ว", milestoneClose:"ใกล้ถึง {hours} ชั่วโมง", milestoneBody:"เหลืออีกประมาณ {left} ชั่วโมงทำงาน", achievementUnlocked:"Achievement ใหม่", cloudNeedsSync:"ข้อมูลในเครื่องรอซิงก์", cloudNeedsSyncBody:"กลับมาออนไลน์หรือกด Sync Now เพื่ออัปเดต Cloud",
      draftSaved:"บันทึกร่างล่าสุด {time}", draftRestored:"กู้ร่างที่ยังไม่ได้บันทึกกลับมาแล้ว", scheduleTemplates:"Calendar / Schedule Templates", scheduleTemplateHelp:"เลือกตารางทำงานสำเร็จรูป หรือบันทึกตารางปัจจุบันเพื่อใช้และแชร์กับเพื่อน", templateIntern:"Internship · จ–ศ · 07:00–16:10", templateOffice8:"Office · จ–ศ · 08:00–17:00", templateOffice9:"Office · จ–ศ · 09:00–18:00", applyTemplate:"ใช้ Template", saveCurrentTemplate:"บันทึกตารางปัจจุบัน", exportTemplate:"Export Template", importTemplate:"Import Template", templateName:"ชื่อ Template", templateSaved:"บันทึก Template แล้ว", templateApplied:"ใช้ตารางใหม่แล้ว ระบบจะ Reload", templateImported:"Import Template สำเร็จ", templateInvalid:"ไฟล์ Template ไม่ถูกต้อง", templateApplyConfirm:"เปลี่ยนตารางทำงานปัจจุบันตาม Template นี้หรือไม่?",
      dataHealth:"Data Health & Storage", dataHealthHelp:"ตรวจสุขภาพข้อมูล Local, Backup, Cloud Sync และเวอร์ชัน PWA", journals:"Journals", projects:"Projects", achievements:"Achievements", localStorage:"Local storage", appVersion:"App version", statusGood:"ปกติ", statusWarning:"ควรตรวจสอบ", checkUpdate:"Check for Update", clearCache:"Clear App Cache", reloadLatest:"Reload Latest Version", cacheCleared:"ล้าง App Cache แล้ว", updateChecked:"ตรวจสอบอัปเดตแล้ว", storageIssue:"พบข้อมูล Local ที่อ่านไม่ได้ {n} รายการ", backupHealth:"Backup", cloudHealth:"Cloud Sync",
      publicJourney:"Public Journey Card", publicJourneyHelp:"สร้างลิงก์สรุป Journey สำหรับ Portfolio โดยไม่แนบ Journal, Leave, Calendar หรือข้อมูลส่วนตัวอื่น", includeName:"แสดงชื่อใน Public Card", copyPublicLink:"คัดลอกลิงก์ Public", downloadPublicCard:"ดาวน์โหลดภาพ", sharePublic:"แชร์", publicLinkCopied:"คัดลอก Public Link แล้ว", publicSummary:"Journey Summary", workHours:"ชั่วโมงทำงาน", workdays:"วันทำงาน", projectCount:"Projects", achievementCount:"Achievements", journeyProgress:"Journey", publicSafe:"ข้อมูลสาธารณะชุดนี้ไม่มี Journal, Leave หรือ Calendar รายวัน", close:"ปิด",
      cloudSetup:"Cloud Setup", autoDraft:"Auto Save Draft", diagnostics:"Diagnostics", mobileReady:"Mobile ready",
      profileMenu:"เมนูโปรไฟล์", editProfile:"แก้ไขโปรไฟล์ / Journey", languageLabel:"ภาษา", themeLabel:"ธีม", installLabel:"ติดตั้งแอป", settingsLabel:"ตั้งค่า", lightLabel:"สว่าง", darkLabel:"มืด", accountMenu:"บัญชีและ Cloud Sync"
    },
    en: {
      cloudLocal:"Local", cloudSynced:"Synced", cloudSyncing:"Syncing", cloudOffline:"Offline", cloudError:"Sync issue", account:"Account & Cloud Sync", accountHelp:"Keep using Local Mode, or sign in to sync your journey across PC, iPad and mobile", cloudNotConfigured:"Supabase is not configured for this deployment", cloudNotConfiguredHelp:"Configure supabase-config.js and run supabase-setup.sql before enabling Cloud Sync", email:"Email", password:"Password", signIn:"Sign in", createAccount:"Create account", signOut:"Sign out", checkEmail:"Account created and ready to sign in.", signedInAs:"Signed in as", syncNow:"Sync now", uploadDevice:"Use this device data", loadCloud:"Use cloud data", lastSync:"Last sync", never:"Never", cloudReady:"Cloud Sync is ready", cloudUploaded:"This device data was uploaded to Cloud", cloudLoaded:"Cloud data loaded", cloudConflict:"The same data was edited on multiple devices", cloudConflictHelp:"Smart Sync already merged non-conflicting changes. Only the same data was changed on both sides; choose which copy should win.", thisDevice:"This device", cloudCopy:"Cloud", cloudAutoHelp:"After resolving this once, new changes sync automatically while online.", authFailed:"Sign in failed", signupFailed:"Account creation failed", syncFailed:"Cloud Sync failed", localDefault:"Local by default · Sign in to sync across devices", restoreCloud:"Already have an account? Sign in to restore Cloud data",
      notifications:"Notifications", markAllRead:"Mark all read", noNotifications:"No notifications yet", journalMissing:"Journal is missing", journalMissingBody:"{date} was a completed workday but still has no Daily Journal", backupOld:"Backup recommended", backupNever:"No backup has been exported yet", backupOldBody:"Your latest backup is {days} days old", milestoneClose:"Approaching {hours} hours", milestoneBody:"About {left} working hours remaining", achievementUnlocked:"Achievement unlocked", cloudNeedsSync:"Local changes are waiting to sync", cloudNeedsSyncBody:"Reconnect or press Sync Now to update Cloud",
      draftSaved:"Draft saved {time}", draftRestored:"Unsaved draft restored", scheduleTemplates:"Calendar / Schedule Templates", scheduleTemplateHelp:"Choose a ready-made schedule or save your current schedule to reuse and share", templateIntern:"Internship · Mon–Fri · 07:00–16:10", templateOffice8:"Office · Mon–Fri · 08:00–17:00", templateOffice9:"Office · Mon–Fri · 09:00–18:00", applyTemplate:"Apply Template", saveCurrentTemplate:"Save current schedule", exportTemplate:"Export Template", importTemplate:"Import Template", templateName:"Template name", templateSaved:"Template saved", templateApplied:"Schedule updated. The app will reload.", templateImported:"Template imported", templateInvalid:"Invalid template file", templateApplyConfirm:"Replace the current work schedule with this template?",
      dataHealth:"Data Health & Storage", dataHealthHelp:"Check Local data, backups, Cloud Sync and PWA version health", journals:"Journals", projects:"Projects", achievements:"Achievements", localStorage:"Local storage", appVersion:"App version", statusGood:"Healthy", statusWarning:"Needs attention", checkUpdate:"Check for Update", clearCache:"Clear App Cache", reloadLatest:"Reload Latest Version", cacheCleared:"App cache cleared", updateChecked:"Update check completed", storageIssue:"{n} Local data items could not be parsed", backupHealth:"Backup", cloudHealth:"Cloud Sync",
      publicJourney:"Public Journey Card", publicJourneyHelp:"Create a portfolio-safe Journey link without Journal, Leave, Calendar or other private details", includeName:"Include display name", copyPublicLink:"Copy public link", downloadPublicCard:"Download card", sharePublic:"Share", publicLinkCopied:"Public link copied", publicSummary:"Journey Summary", workHours:"Work Hours", workdays:"Workdays", projectCount:"Projects", achievementCount:"Achievements", journeyProgress:"Journey", publicSafe:"This public payload contains no Journal, Leave or daily Calendar data", close:"Close",
      cloudSetup:"Cloud Setup", autoDraft:"Auto Save Draft", diagnostics:"Diagnostics", mobileReady:"Mobile ready",
      profileMenu:"Profile menu", editProfile:"Edit profile / Journey", languageLabel:"Language", themeLabel:"Theme", installLabel:"Install app", settingsLabel:"Settings", lightLabel:"Light", darkLabel:"Dark", accountMenu:"Account & Cloud Sync"
    }
  };
  const t = (key, vars={}) => { let out = TEXT[lang()][key] || TEXT.en[key] || key; Object.entries(vars).forEach(([k,v]) => out = out.replaceAll(`{${k}}`, String(v))); return out; };

  const AUTH_TEXT = {
    th:{
      accountTitle:"Workday Journey Account",
      accountIntro:"เก็บ Journey ของคุณไว้บน Cloud และใช้งานต่อได้จากหลายอุปกรณ์",
      chooseSignInHelp:"มีบัญชีอยู่แล้ว? เข้าสู่ระบบเพื่อดึงข้อมูลและซิงก์ Journey",
      chooseSignUpHelp:"สร้างบัญชีใหม่สำหรับ Cloud Sync และฟีเจอร์ที่ผูกกับบัญชี",
      signInTitle:"เข้าสู่ระบบ", signInHelp:"ใช้บัญชีเดิมของคุณเพื่อซิงก์ Journey ข้ามอุปกรณ์",
      signUpTitle:"สร้างบัญชีใหม่", signUpHelp:"สมัครครั้งเดียว แล้ว Journey ของคุณจะพร้อมใช้กับ Cloud Sync",
      confirmPassword:"ยืนยันรหัสผ่าน", passwordHint:"อย่างน้อย 6 ตัวอักษร",
      showPassword:"แสดงรหัสผ่าน", hidePassword:"ซ่อนรหัสผ่าน",
      noAccount:"ยังไม่มีบัญชี?", haveAccount:"มีบัญชีอยู่แล้ว?",
      back:"ย้อนกลับ", continue:"ดำเนินการต่อ", startUsing:"เริ่มใช้งาน",
      localStillWorks:"ยังใช้งานแบบ Local ได้ตามปกติ โดยไม่ต้องเข้าสู่ระบบ",
      signingIn:"กำลังเข้าสู่ระบบ...", creatingAccount:"กำลังสร้างบัญชี...",
      loginSuccessTitle:"เข้าสู่ระบบสำเร็จ", loginSuccessBody:"ยินดีต้อนรับกลับมา ระบบกำลังตรวจสอบข้อมูล Cloud ของคุณ",
      signupSuccessTitle:"สร้างบัญชีสำเร็จ!", signupSuccessBody:"บัญชีของคุณพร้อมใช้งานแล้ว และสามารถซิงก์ Journey ข้ามอุปกรณ์ได้ทันที",
      accountConnected:"เชื่อมต่อบัญชีแล้ว", cloudChecking:"กำลังตรวจสอบข้อมูล Cloud...",
      invalidEmail:"กรุณากรอกอีเมลให้ถูกต้อง", passwordTooShort:"รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", passwordMismatch:"รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน",
      invalidCredentials:"อีเมลหรือรหัสผ่านไม่ถูกต้อง", emailExists:"อีเมลนี้มีบัญชีอยู่แล้ว", emailNotConfirmed:"บัญชีนี้ยังไม่ได้ยืนยันอีเมล", signupDisabled:"ระบบสมัครบัญชีถูกปิดอยู่", rateLimited:"มีการลองหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง", authUnknown:"เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
    },
    en:{
      accountTitle:"Workday Journey Account",
      accountIntro:"Keep your Journey in the Cloud and continue across your devices",
      chooseSignInHelp:"Already have an account? Sign in to restore and sync your Journey",
      chooseSignUpHelp:"Create an account for Cloud Sync and account-based features",
      signInTitle:"Sign in", signInHelp:"Use your existing account to sync your Journey across devices",
      signUpTitle:"Create account", signUpHelp:"Create it once and your Journey is ready for Cloud Sync",
      confirmPassword:"Confirm password", passwordHint:"At least 6 characters",
      showPassword:"Show password", hidePassword:"Hide password",
      noAccount:"No account yet?", haveAccount:"Already have an account?",
      back:"Back", continue:"Continue", startUsing:"Start using",
      localStillWorks:"Local Mode still works normally without signing in",
      signingIn:"Signing in...", creatingAccount:"Creating account...",
      loginSuccessTitle:"Signed in successfully", loginSuccessBody:"Welcome back. We are checking your Cloud data now",
      signupSuccessTitle:"Account created!", signupSuccessBody:"Your account is ready and your Journey can sync across devices immediately",
      accountConnected:"Account connected", cloudChecking:"Checking Cloud data...",
      invalidEmail:"Enter a valid email address", passwordTooShort:"Password must be at least 6 characters", passwordMismatch:"Passwords do not match",
      invalidCredentials:"Email or password is incorrect", emailExists:"An account already exists for this email", emailNotConfirmed:"This account has not confirmed its email yet", signupDisabled:"Account creation is disabled", rateLimited:"Too many attempts. Please wait a moment and try again", authUnknown:"Something went wrong. Please try again"
    }
  };
  const authT = key => AUTH_TEXT[lang()][key] || AUTH_TEXT.en[key] || key;


  // ---------- V8.5.0 What's New / Version History ----------
  // Keep this intentionally concise: it is the user-facing history, not the
  // developer README. New releases should normally have only 2–4 bullets.
  const WHATS_NEW_RELEASES = [
    {version:"8.7",icon:"🏡",th:"ห้องทำงานและ Mascot",en:"Workspace & Mascot Life",notesTh:["ห้อง Pixel Art พร้อม Mascot และของตกแต่งที่ปลดล็อกได้", "เพิ่ม Focus Studio: Pomodoro, Deep Work และประวัติการโฟกัส", "Skill Tree 6 สายทักษะ พร้อม XP, Level และ Milestones"],notesEn:["Pixel Art workspace with Mascots and unlockable decorations", "Focus Studio with Pomodoro, Deep Work and session history", "Skill Tree with six skill paths, XP, levels and milestones"]},
    {version:"8.6",icon:"🔐",th:"บัญชีและ Work Bank",en:"Account & Work Bank",notesTh:["ศูนย์แจ้งเตือนใหม่ แยกตามประเภทและลดข้อความซ้ำ", "สำรองข้อมูลส่วนตัวได้สะดวกขึ้น", "ปรับความเสถียรของ Wallet และ Work Bank", "เพิ่มตัวเลือกอ่านชัด ขีดเส้นใต้ลิงก์ และปุ่มกดง่าย"],notesEn:["Refreshed Notification Center with filters and fewer duplicate alerts", "Easier personal data backups", "Improved Wallet and Work Bank stability", "Optional high contrast, underlined links and larger touch targets"]},
    {version:"8.5",icon:"✨",th:"หน้าตาใหม่ทั้งระบบ",en:"New Look & Navigation",notesTh:["เมนูใหม่ ใช้ง่ายทั้งคอมและมือถือ", "ปรับหน้า Dashboard, Journal, Projects และ Reports", "อัปเกรด Reward Shop, Missions และ Finance Hub"],notesEn:["Improved navigation for desktop and mobile", "Refreshed Dashboard, Journal, Projects and Reports", "Updated Rewards, Missions and Finance Hub"]},
    {version:"8.4",icon:"📈",th:"ลงทุนและรางวัลพิเศษ",en:"Trading & Special Rewards",notesTh:["เพิ่มระบบจำลองลงทุนและบทเรียนสำหรับผู้เริ่มต้น", "เพิ่มโค้ดรับรางวัลและกิจกรรมใหม่"],notesEn:["Simulated trading and beginner lessons", "Reward codes and new activities"]},
    {version:"8.3",icon:"🏦",th:"Work Bank",en:"Work Bank",notesTh:["ออมเหรียญและติดตามดอกเบี้ยทบต้น", "ขยายร้านค้าและไอเทมแต่งโปรไฟล์"],notesEn:["Save Coins and track compound interest", "More Shop items and profile customization"]},
    {version:"8.1",icon:"🎮",th:"Work Coins และ Reward Shop",en:"Work Coins & Reward Shop",notesTh:["รับเหรียญจากการทำงานและทำภารกิจ", "ปลดล็อก Mascot, Theme และรางวัลอื่น ๆ"],notesEn:["Earn Coins from work and missions", "Unlock Mascots, Themes and other rewards"]}
  ];

  const ORIG_SET = Storage.prototype.setItem;
  const ORIG_REMOVE = Storage.prototype.removeItem;
  const rawSet = (key, value) => ORIG_SET.call(localStorage, key, String(value));
  const rawRemove = key => ORIG_REMOVE.call(localStorage, key);

  const cloud = {
    client:null, configured:false, session:null, user:null, status:"local", localDirty:false,
    applying:false, syncTimer:null, conflictRow:null, authSubscription:null, reconciling:false, initialReady:false,
    authUserId:"", uploadPromise:null, lastRemoteCheck:0
  };
  const authUi = {mode:"choose", error:"", success:null, busy:false, returnAction:""};

  const DEVICE_LOCAL_KEYS = new Set([
    "wp-v7-sidebar-collapsed",
    "wp-v76-journal-filters",
    "wp-v76-project-view",
    "wp-v81-shop-tab",
    // Page-visit activity powers exploration missions but is UI activity,
    // not a Cloud document edit. Switching pages must not trigger an upload.
    "wp-v82-daily-activity",
    "wp-v84-exchange-selected",
    "wp-v84-exchange-range",
    "wp-v846-achievement-category",
    "wp-v847-achievement-view",
    "wp-v847-feature-achievement-category",
    "wp-v8472-last-seen-version",
    "wp-v8-open-journal-date",
    "wp-v8-notification-read",
    "wp-v8-notifications-initialized",
    "wp-v6-backup-toast",
    "wp-v6-recap-dismissed",
    "wp-v6-last-backup-at",
    // V8.4.7.6: build/cache/reset markers belong to this browser deployment.
    // Syncing them can make a newly deployed app fight an older Cloud snapshot
    // and repeatedly reload while each side restores a different version marker.
    "wp-app-version",
    "wp-theme-default-version",
    "wp-data-reset-version"
  ]);
  const SOFT_SYNC_KEYS = new Set([
    "wp-language","wp-locale","wp-theme","wp-font-family","wp-font-size","wp-density",
    "wp-v8602-ui-size","wp-v8602-icon-style",
    "wp-clock-format","wp-show-seconds","wp-animations","wp-dynamic-mood","wp-privacy-mode",
    "wp-notifications-enabled","wp-v6-dashboard-layout","wp-v7-selected-title",
    "wp-v81-equipped-mascot","wp-v81-equipped-theme","wp-v81-equipped-effect",
    "wp-v831-equipped-accessory","wp-v831-equipped-frame","wp-v84-exchange-watchlist",
    "wp-v841-beginner-mode","wp-v845-vault-projects","wp-v846-feature-achievement-stats",
    "wp-seen-achievements","wp-completion-seen","wp-achievements-initialized",
    "wp-v7-achievement-flags","wp-v7-achievement-unlocked-at","wp-v7-ever-achievements",
    "wp-v74-achievements-migrated","wp-v81-retro-rewards-v1","wp-v82-coin-rebalance-v1",
    "wp-setup-completed"
  ]);

  const isCloudMetaKey = key => String(key||"").startsWith("wp-v8-cloud-") || key === KEYS.dataUpdated;
  const isDeviceLocalKey = key => DEVICE_LOCAL_KEYS.has(String(key||""));
  const ECONOMY_PROTECTED_KEYS = new Set(["wp-v81-coin-ledger","wp-v81-owned-rewards","wp-v83-bank-ledger","wp-v83-bank-state","wp-v84-exchange-trades","wp-v84-exchange-achievements"]);
  const isSyncableKey = key => String(key||"").startsWith("wp-") && !isCloudMetaKey(key) && !String(key).startsWith("wp-notify-") && !isDeviceLocalKey(key) && !ECONOMY_PROTECTED_KEYS.has(String(key||""));
  const isConflictRelevantKey = key => isSyncableKey(key) && !SOFT_SYNC_KEYS.has(String(key||""));
  const isLegacySyncableKey = key => String(key||"").startsWith("wp-") && !isCloudMetaKey(key) && !String(key).startsWith("wp-notify-");

  function hashString(value) {
    let h = 2166136261;
    for (let i=0;i<value.length;i++) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16).padStart(8,"0");
  }
  function stableJson(value){
    if(Array.isArray(value))return `[${value.map(stableJson).join(",")}]`;
    if(value&&typeof value==="object")return `{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${stableJson(value[k])}`).join(",")}}`;
    return JSON.stringify(value);
  }
  function canonicalStoredValue(value){
    if(value==null)return "__ABSENT__";
    const raw=String(value);
    if(!raw)return raw;
    const first=raw.trim()[0];
    if(first!=="{"&&first!=="[")return raw;
    try{return stableJson(JSON.parse(raw));}catch{return raw;}
  }
  function valueFingerprint(value){return hashString(canonicalStoredValue(value));}
  function normalizeSyncData(input){
    const out={};
    Object.keys(input||{}).filter(isSyncableKey).sort().forEach(key=>{if(typeof input[key]==="string")out[key]=input[key];});
    return out;
  }
  function collectLocalData() {
    const data={};
    const keys=[];
    for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(isSyncableKey(key))keys.push(key);}
    keys.sort().forEach(key=>{data[key]=localStorage.getItem(key);});
    return data;
  }
  function collectLegacyLocalData(){
    const data={},keys=[];
    for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(isLegacySyncableKey(key))keys.push(key);}
    keys.sort().forEach(key=>{data[key]=localStorage.getItem(key);});
    return data;
  }
  function dataHash(data,filterFn){
    const source=normalizeSyncData(data),parts=[];
    Object.keys(source).filter(filterFn).sort().forEach(key=>parts.push([key,valueFingerprint(source[key])]));
    return hashString(JSON.stringify(parts));
  }
  function snapshotHash(data=collectLocalData()) { return dataHash(data,isConflictRelevantKey); }
  function payloadHash(data=collectLocalData()) { return dataHash(data,isSyncableKey); }
  function legacyHash(data){
    const ordered={};Object.keys(data||{}).filter(isLegacySyncableKey).sort().forEach(k=>{if(typeof data[k]==="string")ordered[k]=data[k];});
    return hashString(JSON.stringify(ordered));
  }
  function buildBaseMap(data){
    const source=normalizeSyncData(data),out={};Object.keys(source).forEach(k=>out[k]=valueFingerprint(source[k]));return out;
  }
  function readBaseMap(){const value=readJson(KEYS.cloudBase,null);return value&&typeof value==="object"&&!Array.isArray(value)?value:null;}
  function setBaseMap(data){setCloudMeta(KEYS.cloudBase,JSON.stringify(buildBaseMap(data)));}
  function buildCloudPayload() { return {schemaVersion:CLOUD_SCHEMA,appVersion:VERSION,exportedAt:new Date().toISOString(),data:collectLocalData()}; }
  function meaningfulLocalData() {
    if(localStorage.getItem("wp-setup-completed")==="true") return true;
    const journals=readJson("wp-v6-journal",{}),projects=readJson("wp-v6-projects",[]);
    return Object.keys(journals||{}).length>0 || (Array.isArray(projects)&&projects.length>0) || !!localStorage.getItem("wp-profile-avatar-image");
  }
  function setCloudMeta(key,value){ if(value==null)rawRemove(key); else rawSet(key,value); }
  function markLocalChanged(key) {
    if(cloud.applying || !isSyncableKey(key)) return;
    setCloudMeta(KEYS.dataUpdated,new Date().toISOString());
    cloud.localDirty=true;
    updateCloudIndicators();
    if(cloud.user && cloud.initialReady && navigator.onLine && !cloud.conflictRow && localStorage.getItem("wp-setup-completed")==="true") scheduleCloudUpload();
  }

  try {
    Storage.prototype.setItem = function(key,value){
      const old=this.getItem(key); ORIG_SET.call(this,key,value);
      if(this===localStorage && old!==String(value)) markLocalChanged(key);
    };
    Storage.prototype.removeItem = function(key){
      const had=this.getItem(key)!==null; ORIG_REMOVE.call(this,key);
      if(this===localStorage && had) markLocalChanged(key);
    };
  } catch (_) {
    // Some privacy-focused browsers may prevent prototype replacement.
    // The periodic hash check below still keeps Cloud Sync working.
  }

  function scheduleCloudUpload(delay=1800){
    clearTimeout(cloud.syncTimer);
    cloud.syncTimer=setTimeout(()=>uploadCloudState({silent:true}),delay);
  }

  function safeDateLabel(iso){
    if(!iso)return t("never"); const d=new Date(iso); if(Number.isNaN(d.getTime()))return t("never");
    return new Intl.DateTimeFormat(lang()==="th"?"th-TH":"en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(d);
  }
  function formatDateKey(key){
    const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key||"")); if(!m)return key;
    return lang()==="th"?`${m[3]}/${m[2]}/${Number(m[1])+543}`:`${m[3]}/${m[2]}/${m[1]}`;
  }
  function parseDDMMYYYY(text){
    const m=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(text||"").trim());if(!m)return"";
    let y=Number(m[3]); if(y>2400)y-=543; const mo=Number(m[2]),d=Number(m[1]); const dt=new Date(y,mo-1,d);
    if(dt.getFullYear()!==y||dt.getMonth()!==mo-1||dt.getDate()!==d)return"";
    return `${y}-${String(mo).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  }

  function dispatchDataChanged(){ window.dispatchEvent(new CustomEvent("workday:v7-data-changed")); window.dispatchEvent(new CustomEvent("workday:v8-data-changed")); }

  // V8.4.7.6 — never allow automatic Cloud reconciliation to create a reload loop.
  // sessionStorage survives a reload but is isolated to this browser tab. If the
  // exact same reconciled payload asks for another reload, refresh the UI in-place
  // instead of reloading the document again.
  const AUTO_RELOAD_GUARD_KEY = "wp-v8476-cloud-auto-reload";
  function safeCloudAutoReload(data,delay=140){
    const signature=payloadHash(data||collectLocalData());
    try{
      if(sessionStorage.getItem(AUTO_RELOAD_GUARD_KEY)===signature){
        dispatchDataChanged();
        requestEnhance(40);
        return false;
      }
      sessionStorage.setItem(AUTO_RELOAD_GUARD_KEY,signature);
    }catch{}
    setTimeout(()=>location.reload(),delay);
    return true;
  }
  function clearCloudAutoReloadGuard(){try{sessionStorage.removeItem(AUTO_RELOAD_GUARD_KEY);}catch{}}

  function toast(icon,message,type="info"){
    const stack=$("toastStack"); if(!stack)return;
    const node=document.createElement("div");node.className=`app-toast v7-toast toast-${type}`;node.setAttribute("role",type==="error"?"alert":"status");node.innerHTML=`<span>${icon}</span><div><strong>${esc(message)}</strong></div>`;stack.appendChild(node);
    setTimeout(()=>{node.classList.add("out");setTimeout(()=>node.remove(),250);},3400);
  }

  // ---------- Account / Cloud Sync ----------
  function configLooksValid(){
    const cfg=window.WORKDAY_SUPABASE_CONFIG||{};
    return /^https:\/\//i.test(String(cfg.url||"").trim()) && String(cfg.publishableKey||"").trim().length>20;
  }
  function initSupabase(){
    cloud.configured=configLooksValid() && !!window.supabase?.createClient;
    if(!cloud.configured){updateCloudIndicators();return;}
    const cfg=window.WORKDAY_SUPABASE_CONFIG;
    try{
      cloud.client=window.supabase.createClient(cfg.url.replace(/\/$/,""),cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
      const beginUserSession = (user, session, event) => {
        if (!user) return;
        const oldUser=cloud.authUserId;
        const previousUser=localStorage.getItem(KEYS.cloudUserId)||"";
        cloud.user=user; cloud.session=session||cloud.session;
        if((previousUser&&previousUser!==user.id)||(oldUser&&oldUser!==user.id)){
          setCloudMeta(KEYS.cloudLastHash,null);setCloudMeta(KEYS.cloudLastPayloadHash,null);
          setCloudMeta(KEYS.cloudBase,null);setCloudMeta(KEYS.cloudLastSync,null);
          setCloudMeta(KEYS.cloudLastUpdated,null);cloud.localDirty=false;cloud.initialReady=false;
          cloud.lastRemoteCheck=0;
        }
        setCloudMeta(KEYS.cloudUserId,user.id);
        if(oldUser===user.id) return; // INITIAL_SESSION, getSession and token refresh can overlap.
        cloud.authUserId=user.id;
        cloud.status=navigator.onLine?"syncing":"offline"; updateCloudIndicators();
        try{window.dispatchEvent(new CustomEvent("workday:v8-auth-state",{detail:{event,signedIn:true,userId:user.id,email:user.email||""}}));}catch{}
        setTimeout(()=>{if(cloud.user?.id===user.id)reconcileCloudOnLogin();},60);
      };
      cloud.client.auth.onAuthStateChange((event,session)=>{
        cloud.session=session||null;cloud.user=session?.user||null;
        if(event==="SIGNED_OUT"){
          clearTimeout(cloud.syncTimer);cloud.authUserId="";cloud.lastRemoteCheck=0;
          cloud.status="local";cloud.localDirty=false;cloud.conflictRow=null;cloud.initialReady=false;
          updateCloudIndicators();renderAccountModal();
          try{window.dispatchEvent(new CustomEvent("workday:v8-auth-state",{detail:{event,signedIn:false}}));}catch{}
          return;
        }
        if(session?.user)beginUserSession(session.user,session,event);
      });
      cloud.client.auth.getSession().then(({data})=>{
        const session=data?.session||null;
        if(session?.user)beginUserSession(session.user,session,"INITIAL_SESSION");
        else if(!cloud.authUserId){cloud.session=null;cloud.user=null;cloud.status="local";}
        updateCloudIndicators();renderAccountModal();
      }).catch(()=>{});
    }catch(err){cloud.configured=false;cloud.status="error";setCloudMeta(KEYS.cloudError,String(err?.message||err));updateCloudIndicators();}
  }

  async function fetchCloudRow(){
    if(!cloud.client||!cloud.user) return null;
    const {data,error}=await cloud.client.from(CLOUD_TABLE).select("payload,updated_at,client_updated_at").eq("user_id",cloud.user.id).maybeSingle();
    if(error)throw error;
    cloud.lastRemoteCheck=Date.now();
    return data||null;
  }
  function markSynced(data,updatedAt){
    const normalized=normalizeSyncData(data);
    setCloudMeta(KEYS.cloudLastHash,snapshotHash(normalized));
    setCloudMeta(KEYS.cloudLastPayloadHash,payloadHash(normalized));
    setBaseMap(normalized);
    setCloudMeta(KEYS.cloudLastSync,new Date().toISOString());if(updatedAt)setCloudMeta(KEYS.cloudLastUpdated,updatedAt);setCloudMeta(KEYS.cloudError,null);
    cloud.localDirty=false;cloud.status="synced";
    const firstReady=!cloud.initialReady;cloud.initialReady=true;
    updateCloudIndicators();refreshNotificationCenter();refreshDataHealth();
    if(firstReady){try{window.dispatchEvent(new CustomEvent("workday:v8-cloud-ready"));}catch{}}
  }
  function replaceSyncableLocalData(data){
    const normalized=normalizeSyncData(data),before=payloadHash(collectLocalData());
    cloud.applying=true;
    try{
      const remove=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(isSyncableKey(k))remove.push(k);}remove.forEach(k=>ORIG_REMOVE.call(localStorage,k));
      Object.entries(normalized).forEach(([k,v])=>ORIG_SET.call(localStorage,k,v));
    }finally{cloud.applying=false;}
    return before!==payloadHash(normalized);
  }
  async function uploadCloudState({silent=false}={}){
    if(!cloud.client||!cloud.user||!navigator.onLine)return false;
    if(cloud.conflictRow && silent)return false;
    if(cloud.uploadPromise)return cloud.uploadPromise;
    const userId=cloud.user.id,payload=buildCloudPayload(),hash=payloadHash(payload.data);
    const lastHash=localStorage.getItem(KEYS.cloudLastPayloadHash)||"";
    if(cloud.initialReady && lastHash === hash){
      cloud.localDirty=false;
      if(cloud.status==="syncing"){cloud.status="synced";updateCloudIndicators();}
      return true;
    }
    cloud.status="syncing";updateCloudIndicators();
    const promise=(async()=>{
      const now=new Date().toISOString();
      try{
        const {data,error}=await cloud.client.from(CLOUD_TABLE).upsert({user_id:userId,payload,client_updated_at:now},{onConflict:"user_id"}).select("updated_at,client_updated_at").single();
        if(error)throw error;
        if(cloud.user?.id!==userId)return false;
        markSynced(payload.data,data?.client_updated_at||data?.updated_at||now);
        if(payloadHash()!==hash){
          cloud.localDirty=true;
          scheduleCloudUpload(1300); // Local writes made while the upload was in-flight.
        }
        if(!silent)toast("☁",t("cloudUploaded"),"success");
        return true;
      }catch(err){
        if(cloud.user?.id===userId){
          cloud.status="error";setCloudMeta(KEYS.cloudError,String(err?.message||err));
          updateCloudIndicators();refreshNotificationCenter();
          if(!silent)toast("!",`${t("syncFailed")}: ${err?.message||err}`,"error");
        }
        return false;
      }
    })();
    cloud.uploadPromise=promise;
    try{return await promise;}finally{if(cloud.uploadPromise===promise)cloud.uploadPromise=null;}
  }
  function applyCloudPayload(payload,updatedAt){
    if(!payload?.data||typeof payload.data!=="object")throw new Error("Invalid cloud payload");
    const normalized=normalizeSyncData(payload.data),changed=replaceSyncableLocalData(normalized);
    markSynced(normalized,updatedAt||new Date().toISOString());
    setCloudMeta(KEYS.dataUpdated,payload.exportedAt||updatedAt||new Date().toISOString());
    return changed;
  }
  function putMergedValue(target,key,present,value){if(present)target[key]=value;else delete target[key];}
  function mergeFromBase(localData,cloudData,baseMap,{preferLocalSoft=false}={}){
    const local=normalizeSyncData(localData),remote=normalizeSyncData(cloudData),base=baseMap||{},localChoice={},cloudChoice={},conflicts=[];
    const keys=[...new Set([...Object.keys(local),...Object.keys(remote),...Object.keys(base)])].filter(isSyncableKey).sort();
    keys.forEach(key=>{
      const hasL=Object.prototype.hasOwnProperty.call(local,key),hasC=Object.prototype.hasOwnProperty.call(remote,key);
      const lv=hasL?local[key]:null,cv=hasC?remote[key]:null,lh=valueFingerprint(lv),ch=valueFingerprint(cv),bh=Object.prototype.hasOwnProperty.call(base,key)?base[key]:valueFingerprint(null);
      if(lh===ch){putMergedValue(localChoice,key,hasL,lv);putMergedValue(cloudChoice,key,hasL,lv);return;}
      const lChanged=lh!==bh,cChanged=ch!==bh;
      if(lChanged&&!cChanged){putMergedValue(localChoice,key,hasL,lv);putMergedValue(cloudChoice,key,hasL,lv);return;}
      if(!lChanged&&cChanged){putMergedValue(localChoice,key,hasC,cv);putMergedValue(cloudChoice,key,hasC,cv);return;}
      if(!isConflictRelevantKey(key)){const useLocal=preferLocalSoft;putMergedValue(localChoice,key,useLocal?hasL:hasC,useLocal?lv:cv);putMergedValue(cloudChoice,key,useLocal?hasL:hasC,useLocal?lv:cv);return;}
      conflicts.push(key);putMergedValue(localChoice,key,hasL,lv);putMergedValue(cloudChoice,key,hasC,cv);
    });
    return {localChoice,cloudChoice,conflicts};
  }
  function mergeSoftOnly(localData,cloudData,{preferLocal=false}={}){
    const local=normalizeSyncData(localData),remote=normalizeSyncData(cloudData),merged={...remote};
    const keys=[...new Set([...Object.keys(local),...Object.keys(remote)])].sort();
    keys.forEach(key=>{
      if(isConflictRelevantKey(key)){if(Object.prototype.hasOwnProperty.call(local,key))merged[key]=local[key];else delete merged[key];return;}
      const hasL=Object.prototype.hasOwnProperty.call(local,key),hasC=Object.prototype.hasOwnProperty.call(remote,key);
      if(hasL&&hasC&&valueFingerprint(local[key])===valueFingerprint(remote[key])){merged[key]=local[key];return;}
      if(preferLocal){if(hasL)merged[key]=local[key];else delete merged[key];}
      else if(!hasC&&hasL)merged[key]=local[key];
    });
    return merged;
  }
  async function loadCloudState({reload=true,silent=false}={}){
    if(!cloud.client||!cloud.user||!navigator.onLine)return false;cloud.status="syncing";updateCloudIndicators();
    try{const row=await fetchCloudRow();if(!row?.payload){if(!silent)toast("☁",t("cloudReady"),"info");cloud.status="synced";updateCloudIndicators();return false;}applyCloudPayload(row.payload,row.client_updated_at||row.updated_at);cloud.status="synced";if(!silent)toast("☁",t("cloudLoaded"),"success");if(reload)setTimeout(()=>location.reload(),180);return true;}
    catch(err){cloud.status="error";setCloudMeta(KEYS.cloudError,String(err?.message||err));updateCloudIndicators();if(!silent)toast("!",`${t("syncFailed")}: ${err?.message||err}`,"error");return false;}
  }
  async function reconcileCloudOnLogin(){
    if(!cloud.user||!navigator.onLine||cloud.reconciling)return;
    const targetUser=cloud.user.id;
    cloud.reconciling=true;cloud.status="syncing";updateCloudIndicators();
    try{
      const row=await fetchCloudRow();
      if(cloud.user?.id!==targetUser)return; // Never apply another account's in-flight payload.
      const localData=collectLocalData();
      if(!row?.payload?.data){await uploadCloudState({silent:true});renderAccountModal();return;}
      const cloudData=normalizeSyncData(row.payload.data),localPayloadHash=payloadHash(localData),cloudPayloadHash=payloadHash(cloudData);
      const localConflictHash=snapshotHash(localData),cloudConflictHash=snapshotHash(cloudData),lastHash=localStorage.getItem(KEYS.cloudLastHash)||"";
      const remoteUpdatedAt=row.client_updated_at||row.updated_at||"",localUpdatedAt=localStorage.getItem(KEYS.dataUpdated)||"";
      const preferLocalSoft=Date.parse(localUpdatedAt||0)>Date.parse(remoteUpdatedAt||0);

      // Exact logical match: refresh sync metadata only. Device-local UI state is
      // intentionally excluded, so tab/filter/sidebar changes never reopen a dialog.
      if(localPayloadHash===cloudPayloadHash){markSynced(localData,remoteUpdatedAt);clearCloudAutoReloadGuard();renderAccountModal();return;}
      if(!meaningfulLocalData()){const changed=applyCloudPayload({...row.payload,data:cloudData},remoteUpdatedAt);if(changed)safeCloudAutoReload(cloudData);return;}

      // If only soft preferences differ, resolve them by the most recently updated
      // side and quietly converge both copies without showing a conflict dialog.
      if(localConflictHash===cloudConflictHash){
        const merged=mergeSoftOnly(localData,cloudData,{preferLocal:preferLocalSoft}),changed=replaceSyncableLocalData(merged);
        await uploadCloudState({silent:true});renderAccountModal();if(changed)safeCloudAutoReload(merged);return;
      }

      let baseMap=readBaseMap();
      // V8.4.7 -> V8.4.7.1 migration: infer the old common ancestor from the
      // legacy full snapshot hash so existing users do not get a one-time false conflict.
      if(!baseMap&&lastHash){
        const legacyLocal=legacyHash(collectLegacyLocalData()),legacyCloud=legacyHash(row.payload.data);
        if(legacyCloud===lastHash)baseMap=buildBaseMap(cloudData);
        else if(legacyLocal===lastHash)baseMap=buildBaseMap(localData);
      }

      if(baseMap){
        const merged=mergeFromBase(localData,cloudData,baseMap,{preferLocalSoft});
        if(!merged.conflicts.length){
          const changed=replaceSyncableLocalData(merged.localChoice);
          await uploadCloudState({silent:true});renderAccountModal();if(changed)safeCloudAutoReload(merged.localChoice);return;
        }
        cloud.conflictRow={...row,conflictKeys:merged.conflicts,localChoiceData:merged.localChoice,cloudChoiceData:merged.cloudChoice};
        cloud.status="error";updateCloudIndicators();openConflictModal(cloud.conflictRow);return;
      }

      // A genuinely new device with meaningful Local data and no shared baseline
      // still asks once which copy should win. After that, a per-key baseline is
      // stored and future changes on different keys merge automatically.
      cloud.conflictRow={...row,conflictKeys:["initial-source"],localChoiceData:localData,cloudChoiceData:cloudData};
      cloud.status="error";updateCloudIndicators();openConflictModal(cloud.conflictRow);
    }catch(err){cloud.status="error";setCloudMeta(KEYS.cloudError,String(err?.message||err));updateCloudIndicators();}
    finally{
      cloud.reconciling=false;
      if(cloud.user?.id&&cloud.user.id!==targetUser){
        setTimeout(()=>reconcileCloudOnLogin(),60);
      }
    }
  }
  async function syncNow({silent=false}={}){
    if(!cloud.user){if(!silent)openAccountModal();return;}
    if(!navigator.onLine){cloud.status="offline";updateCloudIndicators();if(!silent)toast("☁",t("cloudOffline"),"warning");return;}
    // Never reset the reconciliation guard. A visibility/focus event can arrive
    // while another sync is still running; forcing the flag false creates races.
    if(cloud.reconciling||cloud.conflictRow)return;
    await reconcileCloudOnLogin();
    if(!silent&&cloud.status==="synced"&&!cloud.conflictRow)toast("✓",t("cloudSynced"),"success");
  }

  function validAuthEmail(email){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email||"").trim());}
  function friendlyAuthError(error,mode="signin"){
    const code=String(error?.code||"").toLowerCase(),message=String(error?.message||error||"").toLowerCase();
    if(code.includes("invalid_credentials")||message.includes("invalid login credentials"))return authT("invalidCredentials");
    if(code.includes("email_not_confirmed")||message.includes("email not confirmed"))return authT("emailNotConfirmed");
    if(code.includes("user_already_exists")||message.includes("already registered")||message.includes("already been registered"))return authT("emailExists");
    if(code.includes("signup_disabled")||message.includes("signups not allowed")||message.includes("signup is disabled"))return authT("signupDisabled");
    if(code.includes("rate")||message.includes("rate limit")||message.includes("too many requests"))return authT("rateLimited");
    if(message.includes("valid email")||message.includes("invalid email"))return authT("invalidEmail");
    if(message.includes("password")&&(message.includes("least")||message.includes("short")))return authT("passwordTooShort");
    return mode==="signup"?`${t("signupFailed")}: ${error?.message||authT("authUnknown")}`:`${t("authFailed")}: ${error?.message||authT("authUnknown")}`;
  }
  function setAuthError(message=""){
    authUi.error=message||"";
    const box=$("v8477AuthError");if(box){box.textContent=authUi.error;box.hidden=!authUi.error;}
  }
  function setAuthMode(mode){authUi.mode=mode;authUi.error="";authUi.success=null;renderAccountModal();}
  function toggleAuthPassword(inputId,button){
    const input=$(inputId);if(!input)return;const show=input.type==="password";input.type=show?"text":"password";button?.setAttribute("aria-label",authT(show?"hidePassword":"showPassword"));if(button)button.textContent=show?"🙈":"👁";input.focus();
  }
  function finishAuthSuccess(){
    const action=authUi.returnAction,email=cloud.user?.email||authUi.success?.email||"";
    authUi.success=null;authUi.error="";authUi.mode="choose";authUi.returnAction="";closeAccountModal();
    if(action){try{window.dispatchEvent(new CustomEvent("workday:v8-auth-complete",{detail:{action,email,userId:cloud.user?.id||""}}));}catch{}}
  }
  async function authSignIn(){
    if(!cloud.configured||!cloud.client)return;
    const email=$("v8AuthEmail")?.value.trim()||"",password=$("v8AuthPassword")?.value||"";
    if(!validAuthEmail(email)){setAuthError(authT("invalidEmail"));$("v8AuthEmail")?.focus();return;}
    if(password.length<6){setAuthError(authT("passwordTooShort"));$("v8AuthPassword")?.focus();return;}
    setAuthError("");setAuthBusy(true,"signin");
    try{
      const {data,error}=await cloud.client.auth.signInWithPassword({email,password});
      if(error){setAuthError(friendlyAuthError(error,"signin"));return;}
      cloud.session=data?.session||cloud.session;cloud.user=data?.user||data?.session?.user||cloud.user;
      authUi.success={type:"signin",email:cloud.user?.email||email};renderAccountModal();
    }catch(error){setAuthError(friendlyAuthError(error,"signin"));}
    finally{setAuthBusy(false,"signin");}
  }
  async function authSignUp(){
    if(!cloud.configured||!cloud.client)return;
    const email=$("v8AuthEmail")?.value.trim()||"",password=$("v8AuthPassword")?.value||"",confirm=$("v8AuthConfirmPassword")?.value||"";
    if(!validAuthEmail(email)){setAuthError(authT("invalidEmail"));$("v8AuthEmail")?.focus();return;}
    if(password.length<6){setAuthError(authT("passwordTooShort"));$("v8AuthPassword")?.focus();return;}
    if(password!==confirm){setAuthError(authT("passwordMismatch"));$("v8AuthConfirmPassword")?.focus();return;}
    setAuthError("");setAuthBusy(true,"signup");
    try{
      // Confirm Email is disabled for this project, so a successful signup should
      // return a session immediately. No emailRedirectTo is needed in this flow.
      const {data,error}=await cloud.client.auth.signUp({email,password});
      if(error){setAuthError(friendlyAuthError(error,"signup"));return;}
      if(data?.user && Array.isArray(data.user.identities) && data.user.identities.length===0 && !data?.session){setAuthError(authT("emailExists"));return;}
      if(!data?.session){setAuthError(lang()==="th"?"สร้างบัญชีแล้วแต่ยังไม่ได้ Session กรุณาตรวจสอบว่า Supabase ปิด Confirm Email อยู่":"Account created but no session was returned. Confirm that Supabase Confirm Email is disabled.");return;}
      cloud.session=data.session;cloud.user=data.session.user||data.user||cloud.user;
      authUi.success={type:"signup",email:cloud.user?.email||data?.user?.email||email};renderAccountModal();
    }catch(error){setAuthError(friendlyAuthError(error,"signup"));}
    finally{setAuthBusy(false,"signup");}
  }
  async function authSignOut(){if(!cloud.client)return;await cloud.client.auth.signOut();cloud.user=null;cloud.session=null;cloud.status="local";cloud.initialReady=false;cloud.conflictRow=null;authUi.mode="choose";authUi.error="";authUi.success=null;authUi.returnAction="";updateCloudIndicators();renderAccountModal();try{window.dispatchEvent(new CustomEvent("workday:v8-auth-state",{detail:{event:"SIGNED_OUT",signedIn:false}}));}catch{}}
  async function deleteCloudState(){
    if(!cloud.client||!cloud.user)return true;
    try{const {error}=await cloud.client.from(CLOUD_TABLE).delete().eq("user_id",cloud.user.id);if(error)throw error;setCloudMeta(KEYS.cloudLastHash,null);setCloudMeta(KEYS.cloudLastPayloadHash,null);setCloudMeta(KEYS.cloudBase,null);setCloudMeta(KEYS.cloudLastSync,null);setCloudMeta(KEYS.cloudLastUpdated,null);cloud.localDirty=false;cloud.initialReady=false;return true;}catch(err){toast("!",`${t("syncFailed")}: ${err?.message||err}`,"error");return false;}
  }
  window.WorkdayV8Cloud={isSignedIn:()=>!!cloud.user,deleteCloudState,syncNow,openAccount:(options={})=>{const cfg=typeof options==="string"?{mode:options}:options||{};openAccountModal(cfg.mode||"choose",cfg);},signOut:authSignOut,getClient:()=>cloud.client||null,getUser:()=>cloud.user?{id:cloud.user.id,email:cloud.user.email||""}:null,getStatus:()=>({status:cloud.status,email:cloud.user?.email||"",signedIn:!!cloud.user,reconciling:cloud.reconciling,conflict:!!cloud.conflictRow,ready:cloud.initialReady})};
  function setAuthBusy(busy,action=""){
    authUi.busy=busy;["v8SignIn","v8SignUp","v8SignOut","v8SyncNow","v8UploadDevice","v8LoadCloud","v8477AuthBack","v8477AuthSwitch"].forEach(id=>{const el=$(id);if(el)el.disabled=busy;});
    const signIn=$("v8SignIn"),signUp=$("v8SignUp");if(signIn)signIn.textContent=busy&&action==="signin"?authT("signingIn"):t("signIn");if(signUp)signUp.textContent=busy&&action==="signup"?authT("creatingAccount"):t("createAccount");
  }

  // ---------- V8.4.7.7 Account UX + Cloud Reconciliation Stability ----------
  const TOPBAR_ROUTES = {
    th:{
      dashboard:["🏠","แดชบอร์ด","ภาพรวมวันนี้และ Journey"],
      journal:["📓","บันทึกประจำวัน","บันทึกสิ่งที่ทำและสิ่งที่เรียนรู้"],
      projects:["🧩","โปรเจกต์","ติดตามงานและความคืบหน้าของ Project"],
      focus:["⏱️","Focus Studio","Pomodoro · Deep Work · สรุปเวลาโฟกัส"],
      skills:["🌳","Skill Tree","แผนผังทักษะ · Level · Growth XP"],
      achievements:["🏆","ความสำเร็จ","Journey Challenges · Feature Achievements · ฉายา"],
      reports:["📊","รายงานและการวิเคราะห์","Attendance, Heatmap และรายงานสรุป"],
      calendar:["🗓️","ปฏิทินและการเข้างาน","วันลา วันหยุดบริษัท และวันทำงานชดเชย"],
      missions:["🎯","ภารกิจรายวัน","Daily Missions, Daily Chest และ Weekly Chest"],
      bank:["🏦","Work Bank","Savings, Daily Interest และ Work Coins"],
      exchange:["📈","Work Exchange","ตลาดหุ้นจำลอง Portfolio และ Trading ด้วย Work Coins"],
      rewards:["🎁","รางวัล","Reward Shop, Reward Codes และของสะสม"],
      workspace:["🏡","ห้องทำงานของฉัน","ห้อง Pixel Art · Mascot และของตกแต่ง"],
      developer:["🛠","Developer Control Center","Reward Codes, Redeem History และ Owner Economy Tools"],
      settings:["⚙️","ตั้งค่า","โปรไฟล์ การแสดงผล Cloud และข้อมูล"]
    },
    en:{
      dashboard:["🏠","Dashboard","Today and Journey overview"],
      journal:["📓","Daily Journal","Record your work and learning"],
      projects:["🧩","Projects","Track project status and progress"],
      focus:["⏱️","Focus Studio","Pomodoro · Deep Work · Focus history"],
      skills:["🌳","Skill Tree","Career paths · Levels · Growth XP"],
      achievements:["🏆","Achievements","Journey Challenges · Feature Achievements · Titles"],
      reports:["📊","Reports & Analytics","Attendance, heatmap and journey reports"],
      calendar:["🗓️","Calendar & Attendance","Leave, company holidays and compensatory work"],
      missions:["🎯","Daily Missions","Daily Missions, Daily Chest and Weekly Chest"],
      bank:["🏦","Work Bank","Savings, daily interest and Work Coins"],
      exchange:["📈","Work Exchange","Simulated market, portfolio and Work Coin trading"],
      rewards:["🎁","Rewards","Reward Shop, Reward Codes and collections"],
      workspace:["🏡","My Workspace","Pixel Art room · Mascot and decorations"],
      developer:["🛠","Developer Control Center","Reward Codes, redemption history and Owner Economy Tools"],
      settings:["⚙️","Settings","Profile, appearance, cloud and data"]
    }
  };
  function activeRoute(){return (location.hash.replace(/^#\/?/,"").split(/[?&]/)[0]||"dashboard").toLowerCase();}
  function refreshTopContext(){
    const route=TOPBAR_ROUTES[lang()]?.[activeRoute()]?activeRoute():"dashboard";
    const item=TOPBAR_ROUTES[lang()][route];
    const icon=$("v802ContextIcon"),eyebrow=$("v802ContextEyebrow"),title=$("v802ContextTitle");
    if(icon)icon.textContent=item[0]; if(eyebrow)eyebrow.textContent=item[2]; if(title)title.textContent=item[1];
  }
  function closeProfileMenu(){const menu=$("v802ProfileMenu");if(!menu)return;menu.hidden=true;menu.classList.remove("open");$("profileQuickBtn")?.setAttribute("aria-expanded","false");}
  function toggleProfileMenu(){const menu=$("v802ProfileMenu");if(!menu)return;const next=menu.hidden;menu.hidden=!next;menu.classList.toggle("open",next);$("profileQuickBtn")?.setAttribute("aria-expanded",String(next));if(next)renderProfileMenu();}
  function triggerLegacy(id){const el=$(id);if(el)el.click();}
  function whatsNewUnread(){return localStorage.getItem(KEYS.whatsNewSeen)!==VERSION;}
  function whatsNewCopy(th,en){return lang()==="th"?th:en;}
  function updateWhatsNewBadges(){
    const unread=whatsNewUnread();
    qa("[data-v8472-new]").forEach(el=>el.hidden=!unread);
    const btn=$("v8472WhatsNewBtn");if(btn){btn.title=whatsNewCopy("มีอะไรใหม่ใน Workday Journey","What's new in Workday Journey");btn.setAttribute("aria-label",btn.title);}
  }
  function renderWhatsNew(){
    const host=$("v8472ChangelogList");if(!host)return;
    host.innerHTML=WHATS_NEW_RELEASES.map((r,index)=>{
      const notes=lang()==="th"?r.notesTh:r.notesEn;
      return `<article class="v8472-release ${index===0?"latest":""}"><div class="v8472-release-rail"><span>${esc(r.icon)}</span><i></i></div><div class="v8472-release-card"><div class="v8472-release-head"><div><b>V${esc(r.version)}</b><strong>${esc(whatsNewCopy(r.th,r.en))}</strong></div>${index===0?`<em>${esc(whatsNewCopy("ล่าสุด","LATEST"))}</em>`:""}</div><ul>${notes.slice(0,4).map(note=>`<li>${esc(note)}</li>`).join("")}</ul></div></article>`;
    }).join("");
    const title=$("v8472ChangelogTitle"),help=$("v8472ChangelogHelp"),foot=$("v8472ChangelogFoot");
    if(title)title.textContent=whatsNewCopy("มีอะไรใหม่","What's New");
    if(help)help.textContent=whatsNewCopy("สรุปการอัปเดตสำคัญ อ่านง่ายในไม่กี่บรรทัด","Major highlights from your Journey updates.");
    if(foot)foot.textContent=whatsNewCopy("เลือกดูฟีเจอร์สำคัญจากแต่ละรุ่น","Highlights from major releases");
  }
  function ensureWhatsNewUi(){
    const sideBtn=$("v8472WhatsNewBtn");
    if(sideBtn&&!sideBtn.dataset.v8472Bound){sideBtn.dataset.v8472Bound="1";sideBtn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();openWhatsNew();});}
    const footerVersion=$("footerVersion");
    if(footerVersion&&!footerVersion.dataset.v8472Bound){footerVersion.dataset.v8472Bound="1";footerVersion.classList.add("v8472-footer-version");footerVersion.setAttribute("role","button");footerVersion.setAttribute("tabindex","0");footerVersion.title="What's New";footerVersion.addEventListener("click",openWhatsNew);footerVersion.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openWhatsNew();}});}
    if(!$("v8472ChangelogBackdrop")){
      const wrap=document.createElement("div");wrap.id="v8472ChangelogBackdrop";wrap.className="v8472-changelog-backdrop";wrap.hidden=true;wrap.innerHTML=`<section class="v8472-changelog-modal" role="dialog" aria-modal="true" aria-labelledby="v8472ChangelogTitle"><button id="v8472ChangelogClose" class="v8472-changelog-close" type="button" aria-label="Close">×</button><div class="v8472-changelog-hero"><span>📰</span><div><p class="eyebrow">WORKDAY JOURNEY · V${esc(VERSION)}</p><h2 id="v8472ChangelogTitle"></h2><p id="v8472ChangelogHelp"></p></div></div><div id="v8472ChangelogList" class="v8472-changelog-list"></div><p id="v8472ChangelogFoot" class="v8472-changelog-foot"></p></section>`;document.body.appendChild(wrap);$("v8472ChangelogClose").onclick=closeWhatsNew;wrap.addEventListener("click",e=>{if(e.target===wrap)closeWhatsNew();});
    }
    renderWhatsNew();updateWhatsNewBadges();
  }
  function openWhatsNew(){ensureWhatsNewUi();rawSet(KEYS.whatsNewSeen,VERSION);updateWhatsNewBadges();renderWhatsNew();const el=$("v8472ChangelogBackdrop");if(!el)return;el.hidden=false;requestAnimationFrame(()=>el.classList.add("open"));}
  function closeWhatsNew(){const el=$("v8472ChangelogBackdrop");if(!el)return;el.classList.remove("open");setTimeout(()=>{el.hidden=true;},150);}

  function renderProfileMenu(){
    const menu=$("v802ProfileMenu");if(!menu)return;
    const cfg=API.getConfig(),st=API.getState(),resolved=document.documentElement.dataset.theme||"light",signed=!!cloud.user;
    const installVisible=$("installAppBtn") && !$("installAppBtn").hidden;
    menu.innerHTML=`
      <div class="v802-menu-head"><div class="v802-menu-avatar v771-avatar-slot" id="v802MenuAvatar">🐣</div><div><strong>${esc(cfg.profileName||"My Journey")}</strong><small>${signed?esc(cloud.user.email||""):esc(t("localDefault"))}</small></div></div>
      <div class="v802-menu-section">
        <button type="button" data-v802-action="profile"><span>👤</span><div><strong>${esc(t("editProfile"))}</strong><small>${esc(cfg.startDate)} → ${esc(cfg.endDate)}</small></div></button>
        <button type="button" data-v802-action="cloud"><span>☁</span><div><strong>${esc(t("accountMenu"))}</strong><small>${esc(cloudStatusLabel())}</small></div></button>
      </div>
      <div class="v802-menu-section v802-menu-inline"><span>${esc(t("languageLabel"))}</span><div><button type="button" data-v802-lang="th" class="${st.language!=="en"?"active":""}">TH</button><button type="button" data-v802-lang="en" class="${st.language==="en"?"active":""}">EN</button></div></div>
      <div class="v802-menu-section">
        <button type="button" data-v802-action="theme"><span>${resolved==="dark"?"☀":"☾"}</span><div><strong>${esc(t("themeLabel"))}</strong><small>${esc(resolved==="dark"?t("darkLabel"):t("lightLabel"))}</small></div></button>
        ${installVisible?`<button type="button" data-v802-action="install"><span>＋</span><div><strong>${esc(t("installLabel"))}</strong><small>PWA</small></div></button>`:""}
        <button type="button" data-v802-action="whatsnew"><span>📰</span><div><strong>${esc(whatsNewCopy("มีอะไรใหม่","What's New"))}</strong><small>V${esc(VERSION)}${whatsNewUnread()?` · ${esc(whatsNewCopy("ใหม่","NEW"))}`:""}</small></div></button>
        <button type="button" data-v802-action="settings"><span>⚙</span><div><strong>${esc(t("settingsLabel"))}</strong><small>Workday Journey</small></div></button>
      </div>
      ${signed?`<div class="v802-menu-section"><button class="danger" type="button" data-v802-action="signout"><span>↪</span><div><strong>${esc(t("signOut"))}</strong><small>${esc(cloud.user.email||"")}</small></div></button></div>`:""}`;
    // Reuse the exact avatar renderer from V7.7.1 for the menu preview.
    const src=$("profileQuickAvatar"); const dst=$("v802MenuAvatar"); if(src&&dst) dst.innerHTML=src.innerHTML;
    qa("[data-v802-action]",menu).forEach(btn=>btn.onclick=async()=>{const action=btn.dataset.v802Action;closeProfileMenu();if(action==="profile")triggerLegacy("editJourneyBtn");if(action==="cloud")openAccountModal();if(action==="theme")triggerLegacy("themeToggle");if(action==="install")triggerLegacy("installAppBtn");if(action==="whatsnew")openWhatsNew();if(action==="settings")location.hash="#/settings";if(action==="signout")await authSignOut();setTimeout(()=>{refreshTopContext();renderProfileMenu();},50);});
    qa("[data-v802-lang]",menu).forEach(btn=>btn.onclick=()=>{q(`.lang-btn[data-lang="${btn.dataset.v802Lang}"]`)?.click();setTimeout(()=>{refreshTopContext();renderProfileMenu();},80);});
  }
  function ensureCleanTopbar(){
    const actions=q(".topbar-actions"); if(!actions)return;
    [$("onlineStatus"),$("installAppBtn"),q(".language-switch",actions),$("themeToggle"),$("settingsOpen")].filter(Boolean).forEach(el=>el.classList.add("v802-legacy-top-control"));
    const profile=$("profileQuickBtn");if(profile){profile.classList.add("v802-profile-btn");profile.setAttribute("aria-haspopup","menu");profile.setAttribute("aria-expanded","false");if(!$('v802ProfileCaret')){const caret=document.createElement("span");caret.id="v802ProfileCaret";caret.className="v802-profile-caret";caret.textContent="⌄";profile.appendChild(caret);}if(!profile.dataset.v802Bound){profile.dataset.v802Bound="1";profile.addEventListener("click",e=>{e.preventDefault();e.stopImmediatePropagation();toggleProfileMenu();},true);}}
    if(!$('v802ProfileMenu')){const menu=document.createElement("div");menu.id="v802ProfileMenu";menu.className="v802-profile-menu";menu.hidden=true;menu.setAttribute("role","menu");document.body.appendChild(menu);}
    const bell=$("v8NotifBtn"),cloudBtn=$("v8CloudBtn"); if(bell)bell.classList.add("v802-top-compact");if(cloudBtn)cloudBtn.classList.add("v802-top-compact");
    // Keep a predictable, uncluttered order: notifications, cloud, profile.
    // IMPORTANT: appendChild() moves an existing DOM node. Calling it on every
    // real-time dashboard refresh can replace the element underneath the pointer
    // between mousedown and mouseup, which makes clicks feel intermittent.
    // Reorder only when the structure is actually different.
    const desired=[bell,cloudBtn,profile].filter(Boolean);
    const current=[...actions.children].filter(el=>desired.includes(el));
    const orderIsStable=desired.length===current.length
      && desired.every((el,i)=>el.parentElement===actions && current[i]===el);
    if(!orderIsStable){
      const frag=document.createDocumentFragment();
      desired.forEach(el=>frag.appendChild(el));
      actions.appendChild(frag);
    }
    document.body.classList.add("v802-clean-topbar");refreshTopContext();
  }
  // ---------- Core V8 UI ----------
  function ensureUi(){
    const actions=q(".topbar-actions");
    if(actions&&!$("v8CloudBtn")){
      const cloudBtn=document.createElement("button");cloudBtn.id="v8CloudBtn";cloudBtn.className="v8-top-btn v8-cloud-btn";cloudBtn.type="button";cloudBtn.innerHTML=`<span class="v8-top-icon">☁</span><span id="v8CloudLabel">${esc(t("cloudLocal"))}</span><i id="v8CloudDot"></i>`;cloudBtn.addEventListener("click",openAccountModal);
      const profile=$("profileQuickBtn");profile?.insertAdjacentElement("afterend",cloudBtn);
      const bell=document.createElement("button");bell.id="v8NotifBtn";bell.className="v8-top-btn v8-notif-btn";bell.type="button";bell.setAttribute("aria-label",t("notifications"));bell.setAttribute("aria-controls","v8NotifPanel");bell.setAttribute("aria-expanded","false");bell.innerHTML=`<span class="v8-top-icon">🔔</span><b id="v8NotifBadge" hidden>0</b>`;bell.addEventListener("click",toggleNotificationPanel);cloudBtn.insertAdjacentElement("afterend",bell);
    }
    if(!$("v8NotifPanel")){
      const panel=document.createElement("aside");panel.id="v8NotifPanel";panel.className="v8-notif-panel wdj-notification-center";panel.hidden=true;panel.setAttribute("role","dialog");panel.setAttribute("aria-labelledby","v8NotifHeading");panel.innerHTML=`<div class="v8-panel-head"><div><p class="eyebrow">WORKDAY JOURNEY</p><h3 id="v8NotifHeading">${esc(t("notifications"))}</h3><small id="wdjNotifSubtitle"></small></div><button id="v8NotifClose" class="icon-btn" type="button" aria-label="${esc(t("close"))}">×</button></div><div class="wdj-notif-tabs" id="wdjNotifTabs" role="group" aria-label="${esc(t("notifications"))}"></div><div id="v8NotifList" class="v8-notif-list" aria-live="polite"></div><div class="v8-panel-foot"><span id="wdjNotifFootnote"></span><button id="v8NotifReadAll" class="text-btn" type="button">${esc(t("markAllRead"))}</button></div>`;document.body.appendChild(panel);$("v8NotifClose").onclick=()=>setNotificationPanel(false);$("v8NotifReadAll").onclick=markAllNotificationsRead;
    }
    if(!$("v8AuthBackdrop")){
      const wrap=document.createElement("div");wrap.id="v8AuthBackdrop";wrap.className="v8-modal-backdrop";wrap.hidden=true;wrap.innerHTML=`<section class="v8-auth-modal v8477-auth-modal" role="dialog" aria-modal="true" aria-labelledby="v8AuthTitle"><button id="v8AuthClose" class="v8-modal-close" type="button" aria-label="${esc(t("close"))}">×</button><div class="v8-auth-hero v8477-auth-hero"><span id="v8477AuthHeroIcon">☁</span><div><p id="v8477AuthEyebrow" class="eyebrow">WORKDAY JOURNEY ACCOUNT</p><h2 id="v8AuthTitle">${esc(authT("accountTitle"))}</h2><p id="v8477AuthIntro">${esc(authT("accountIntro"))}</p></div></div><div id="v8AuthBody"></div></section>`;document.body.appendChild(wrap);$("v8AuthClose").onclick=closeAccountModal;wrap.addEventListener("click",e=>{if(e.target===wrap)closeAccountModal();});
    }
    if(!$("v8ConflictBackdrop")){
      const wrap=document.createElement("div");wrap.id="v8ConflictBackdrop";wrap.className="v8-modal-backdrop v8-conflict-backdrop";wrap.hidden=true;wrap.innerHTML=`<section class="v8-conflict-modal" role="dialog" aria-modal="true"><div class="v8-conflict-icon">↔</div><h2>${esc(t("cloudConflict"))}</h2><p>${esc(t("cloudConflictHelp"))}</p><div id="v8ConflictMeta" class="v8-conflict-meta"></div><div class="v8-conflict-actions"><button id="v8ConflictLocal" class="primary-btn" type="button">💻 ${esc(t("thisDevice"))}</button><button id="v8ConflictCloud" class="outline-btn" type="button">☁ ${esc(t("cloudCopy"))}</button></div><small>${esc(t("cloudAutoHelp"))}</small></section>`;document.body.appendChild(wrap);
      $("v8ConflictLocal").onclick=async()=>{const row=cloud.conflictRow;if(!row)return;wrap.hidden=true;cloud.conflictRow=null;if(row.localChoiceData)replaceSyncableLocalData(row.localChoiceData);await uploadCloudState();};$("v8ConflictCloud").onclick=()=>{const row=cloud.conflictRow;if(!row)return;wrap.hidden=true;cloud.conflictRow=null;const data=row.cloudChoiceData||normalizeSyncData(row.payload?.data||{});applyCloudPayload({...row.payload,data},row.client_updated_at||row.updated_at);location.reload();};
    }
    if(!$("v8PublicBackdrop")){
      const wrap=document.createElement("div");wrap.id="v8PublicBackdrop";wrap.className="v8-public-backdrop";wrap.hidden=true;wrap.innerHTML=`<section class="v8-public-view"><button id="v8PublicClose" class="v8-modal-close" type="button">×</button><div id="v8PublicViewBody"></div></section>`;document.body.appendChild(wrap);$("v8PublicClose").onclick=closePublicView;
    }
    ensureSetupCloudPrompt();ensureSetupTemplates();ensureWhatsNewUi();
  }

  function setAuthHero(icon,title,help){const heroIcon=$("v8477AuthHeroIcon"),titleEl=$("v8AuthTitle"),intro=$("v8477AuthIntro");if(heroIcon)heroIcon.textContent=icon;if(titleEl)titleEl.textContent=title;if(intro)intro.textContent=help;}
  function openAccountModal(mode="choose",options={}){
    if(mode && typeof mode==="object"){options=mode;mode=options.mode||"choose";}
    ensureUi();if(!cloud.user&&!authUi.success){authUi.mode=["signin","signup","choose"].includes(mode)?mode:"choose";authUi.error="";}if(options?.returnAction)authUi.returnAction=String(options.returnAction);
    const el=$("v8AuthBackdrop");el.hidden=false;requestAnimationFrame(()=>el.classList.add("open"));renderAccountModal();
  }
  function closeAccountModal(){const el=$("v8AuthBackdrop");if(!el)return;el.classList.remove("open");setTimeout(()=>el.hidden=true,160);}
  function authPasswordField(id,label,autocomplete="current-password"){
    return `<label class="v8477-field"><span>${esc(label)}</span><div class="v8477-password-wrap"><input id="${id}" type="password" autocomplete="${autocomplete}" minlength="6" placeholder="••••••••"><button class="v8477-password-toggle" type="button" data-password-for="${id}" aria-label="${esc(authT("showPassword"))}">👁</button></div></label>`;
  }
  function bindAuthForm(mode){
    $("v8477AuthBack")?.addEventListener("click",()=>setAuthMode("choose"));
    $("v8477AuthSwitch")?.addEventListener("click",()=>setAuthMode(mode==="signin"?"signup":"signin"));
    qa("[data-password-for]",$("v8AuthBody")).forEach(btn=>btn.addEventListener("click",()=>toggleAuthPassword(btn.dataset.passwordFor,btn)));
    const form=$("v8477AuthForm");if(form)form.addEventListener("submit",e=>{e.preventDefault();mode==="signin"?authSignIn():authSignUp();});
    setTimeout(()=>$("v8AuthEmail")?.focus(),30);
  }
  function renderAccountModal(){
    const body=$("v8AuthBody");if(!body)return;
    if(!cloud.configured){setAuthHero("🧩",t("cloudNotConfigured"),t("cloudNotConfiguredHelp"));body.innerHTML=`<div class="v8-cloud-unconfigured"><span>🧩</span><h3>${esc(t("cloudNotConfigured"))}</h3><p>${esc(t("cloudNotConfiguredHelp"))}</p><code>supabase-config.js + supabase-setup.sql</code></div>`;return;}
    if(authUi.success){
      const signup=authUi.success.type==="signup",status=cloud.status==="synced"?t("cloudSynced"):(cloud.reconciling||cloud.status==="syncing"?authT("cloudChecking"):cloudStatusLabel());
      setAuthHero(signup?"✨":"☁",signup?authT("signupSuccessTitle"):authT("loginSuccessTitle"),signup?authT("signupSuccessBody"):authT("loginSuccessBody"));
      body.innerHTML=`<div class="v8477-auth-success"><div class="v8477-success-mark">✓</div><h3>${esc(signup?authT("signupSuccessTitle"):authT("loginSuccessTitle"))}</h3><p>${esc(signup?authT("signupSuccessBody"):authT("loginSuccessBody"))}</p><div class="v8477-success-email">${esc(authUi.success.email||cloud.user?.email||"")}</div><div class="v8477-success-status"><i id="v8477AuthSuccessDot" data-state="${esc(cloud.status)}"></i><div><strong>${esc(authT("accountConnected"))}</strong><small id="v8477AuthSuccessState">${esc(status)}</small></div></div><button id="v8477AuthContinue" class="primary-btn v8477-auth-primary" type="button">${esc(signup?authT("startUsing"):authT("continue"))}</button></div>`;
      $("v8477AuthContinue").onclick=finishAuthSuccess;return;
    }
    if(!cloud.user){
      if(authUi.mode==="signin"||authUi.mode==="signup"){
        const signup=authUi.mode==="signup";setAuthHero(signup?"✨":"👤",signup?authT("signUpTitle"):authT("signInTitle"),signup?authT("signUpHelp"):authT("signInHelp"));
        body.innerHTML=`<div class="v8477-auth-form-shell"><button id="v8477AuthBack" class="v8477-auth-back" type="button">← ${esc(authT("back"))}</button><form id="v8477AuthForm" class="v8-auth-form v8477-auth-form" novalidate><label class="v8477-field"><span>${esc(t("email"))}</span><input id="v8AuthEmail" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com"></label>${authPasswordField("v8AuthPassword",t("password"),signup?"new-password":"current-password")}${signup?authPasswordField("v8AuthConfirmPassword",authT("confirmPassword"),"new-password"):""}${signup?`<p class="v860-guest-cloud-note" role="note">🔐 ${esc(lang()==="th"?"Coin และไอเทมจาก Guest จะอยู่เฉพาะเครื่องนี้ บัญชี Cloud ใหม่จะเริ่มจากยอดที่ Supabase กำหนด":"Guest Coins and items stay on this device. A new Cloud account starts with a server-issued balance.")}</p>`:""}<small class="v8477-password-hint">${esc(authT("passwordHint"))}</small><div id="v8477AuthError" class="v8477-auth-error" role="alert" ${authUi.error?"":"hidden"}>${esc(authUi.error)}</div><button id="${signup?"v8SignUp":"v8SignIn"}" class="primary-btn v8477-auth-primary" type="submit">${esc(signup?t("createAccount"):t("signIn"))}</button></form><div class="v8477-auth-switch"><span>${esc(signup?authT("haveAccount"):authT("noAccount"))}</span><button id="v8477AuthSwitch" type="button">${esc(signup?t("signIn"):t("createAccount"))} →</button></div></div>`;
        bindAuthForm(authUi.mode);return;
      }
      setAuthHero("☁",authT("accountTitle"),authT("accountIntro"));
      body.innerHTML=`<div class="v8477-auth-choice"><button id="v8477ChooseSignIn" class="v8477-auth-choice-card primary" type="button"><span class="v8477-choice-icon">👤</span><span class="v8477-choice-copy"><strong>${esc(t("signIn"))}</strong><small>${esc(authT("chooseSignInHelp"))}</small></span><b>→</b></button><button id="v8477ChooseSignUp" class="v8477-auth-choice-card" type="button"><span class="v8477-choice-icon">✨</span><span class="v8477-choice-copy"><strong>${esc(t("createAccount"))}</strong><small>${esc(authT("chooseSignUpHelp"))}</small></span><b>→</b></button></div><p class="v8-auth-note v8477-auth-note">🔐 ${esc(authT("localStillWorks"))}</p>`;
      $("v8477ChooseSignIn").onclick=()=>setAuthMode("signin");$("v8477ChooseSignUp").onclick=()=>setAuthMode("signup");return;
    }
    setAuthHero("☁",t("account"),t("accountHelp"));
    const last=localStorage.getItem(KEYS.cloudLastSync);body.innerHTML=`<div class="v8-account-card"><div class="v8-account-avatar">☁</div><div><span>${esc(t("signedInAs"))}</span><strong>${esc(cloud.user.email||cloud.user.id)}</strong><small>${esc(t("lastSync"))}: ${esc(safeDateLabel(last))}</small></div></div><div class="v8-cloud-state"><i data-state="${esc(cloud.status)}"></i><strong>${esc(cloudStatusLabel())}</strong></div><div class="v8-auth-actions grid"><button id="v8SyncNow" class="primary-btn" type="button">↻ ${esc(t("syncNow"))}</button><button id="v8UploadDevice" class="outline-btn" type="button">💻↑ ${esc(t("uploadDevice"))}</button><button id="v8LoadCloud" class="outline-btn" type="button">☁↓ ${esc(t("loadCloud"))}</button><button id="v8SignOut" class="secondary-btn" type="button">${esc(t("signOut"))}</button></div>`;
    $("v8SyncNow").onclick=syncNow;$("v8UploadDevice").onclick=()=>uploadCloudState();$("v8LoadCloud").onclick=()=>loadCloudState();$("v8SignOut").onclick=authSignOut;
  }
  function syncKeyLabel(key){const k=String(key||"");if(k==="initial-source")return lang()==="th"?"ข้อมูลเริ่มต้น":"Initial data";if(k.includes("journal"))return "Journal";if(k.includes("project"))return "Projects";if(k.includes("coin")||k.includes("reward"))return "Work Coins / Rewards";if(k.includes("bank"))return "Work Bank";if(k.includes("exchange"))return "Work Exchange";if(k.includes("mission")||k.includes("chest"))return "Daily Missions";if(k.includes("journey")||k.includes("day-overrides"))return "Journey / Calendar";return k.replace(/^wp-[^-]+-?/,"");}
  function openConflictModal(row){ensureUi();const meta=$("v8ConflictMeta"),localStamp=localStorage.getItem(KEYS.dataUpdated),cloudStamp=row?.client_updated_at||row?.updated_at,keys=(row?.conflictKeys||[]).map(syncKeyLabel);meta.innerHTML=`<div><span>💻 ${esc(t("thisDevice"))}</span><strong>${esc(safeDateLabel(localStamp))}</strong></div><div><span>☁ ${esc(t("cloudCopy"))}</span><strong>${esc(safeDateLabel(cloudStamp))}</strong></div>${keys.length?`<div><span>⚠ ${lang()==="th"?"ข้อมูลที่ชนกัน":"Conflicting data"}</span><strong>${esc(keys.slice(0,3).join(" · "))}${keys.length>3?` +${keys.length-3}`:""}</strong></div>`:""}`;$("v8ConflictBackdrop").hidden=false;requestAnimationFrame(()=>$("v8ConflictBackdrop").classList.add("open"));}
  function cloudStatusLabel(){if(!navigator.onLine&&cloud.user)return t("cloudOffline");return ({local:t("cloudLocal"),synced:t("cloudSynced"),syncing:t("cloudSyncing"),offline:t("cloudOffline"),error:t("cloudError")})[cloud.status]||t("cloudLocal");}
  function refreshOpenInteractiveStatus(){
    // Never replace an open interactive surface just because Cloud status changed.
    // Replacing DOM between pointerdown and click makes controls feel intermittent.
    const auth=$("v8AuthBackdrop");
    if(auth && !auth.hidden && cloud.user){
      const state=auth.querySelector(".v8-cloud-state strong"); if(state)state.textContent=cloudStatusLabel();
      const dot=auth.querySelector(".v8-cloud-state i"); if(dot)dot.dataset.state=cloud.user?(navigator.onLine?cloud.status:"offline"):"local";
      const last=auth.querySelector(".v8-account-card small"); if(last)last.textContent=`${t("lastSync")}: ${safeDateLabel(localStorage.getItem(KEYS.cloudLastSync))}`;
    }
    if(auth && !auth.hidden && authUi.success){
      const successState=$("v8477AuthSuccessState"),successDot=$("v8477AuthSuccessDot");
      if(successState)successState.textContent=cloud.status==="synced"?t("cloudSynced"):(cloud.reconciling||cloud.status==="syncing"?authT("cloudChecking"):cloudStatusLabel());
      if(successDot)successDot.dataset.state=cloud.user?(navigator.onLine?cloud.status:"offline"):"local";
    }
    const menu=$("v802ProfileMenu");
    if(menu && !menu.hidden){
      const cloudRow=menu.querySelector('[data-v802-action="cloud"] small'); if(cloudRow)cloudRow.textContent=cloudStatusLabel();
      const email=menu.querySelector(".v802-menu-head small"); if(email)email.textContent=cloud.user?(cloud.user.email||""):t("localDefault");
    }
  }
  function updateCloudIndicators(){
    const label=$("v8CloudLabel"),btn=$("v8CloudBtn"),dot=$("v8CloudDot");if(label)label.textContent=cloudStatusLabel();if(btn){btn.dataset.state=cloud.user?(navigator.onLine?cloud.status:"offline"):"local";btn.title=cloud.user?(cloud.user.email||t("account")):t("account");}if(dot)dot.dataset.state=btn?.dataset.state||"local";
    const priv=$("v7PrivateLabel");if(priv)priv.textContent=cloud.user?(cloud.status==="synced"?`☁ ${t("cloudSynced")}`:`☁ ${cloudStatusLabel()}`):t("localDefault");
    refreshOpenInteractiveStatus();
  }

  // ---------- Auto Save Draft ----------
  let draftTimer=null,projectDraftTimer=null;
  function getJournalDateFromUi(){return parseDDMMYYYY($("v7JournalDate")?.value)||$("v7JournalDatePicker")?.value||"";}
  function saveJournalDraft(){
    const form=$("v7JournalForm");if(!form)return;const key=getJournalDateFromUi();if(!key)return;const drafts=readJson(KEYS.journalDrafts,{});
    drafts[key]={date:key,work:$("v7JournalWork")?.value||"",learned:$("v7JournalLearned")?.value||"",mood:$("v7JournalMood")?.value||"productive",projectIds:qa(".v7-project-checks input:checked",form).map(x=>x.value),updatedAt:new Date().toISOString()};writeJson(KEYS.journalDrafts,drafts);renderDraftStatus(drafts[key].updatedAt);
  }
  function clearJournalDraft(key){const drafts=readJson(KEYS.journalDrafts,{});if(key&&drafts[key]){delete drafts[key];writeJson(KEYS.journalDrafts,drafts);}}
  function renderDraftStatus(stamp){const form=$("v7JournalForm");if(!form)return;let el=$("v8JournalDraftStatus");if(!el){el=document.createElement("small");el.id="v8JournalDraftStatus";el.className="v8-draft-status";q(".v7-journal-actions",form)?.insertAdjacentElement("beforebegin",el);}if(el)el.textContent=stamp?`💾 ${t("draftSaved",{time:new Intl.DateTimeFormat(lang()==="th"?"th-TH":"en-GB",{hour:"2-digit",minute:"2-digit"}).format(new Date(stamp))})}`:`💾 ${t("autoDraft")}`;}
  function restoreJournalDraft(){
    const form=$("v7JournalForm");if(!form)return;const key=getJournalDateFromUi();if(!key)return;const journals=readJson("wp-v6-journal",{});if(journals?.[key]){renderDraftStatus("");return;}const draft=readJson(KEYS.journalDrafts,{})?.[key];if(!draft){renderDraftStatus("");return;}
    const work=$("v7JournalWork"),learned=$("v7JournalLearned"),mood=$("v7JournalMood");if(work&&!work.value)work.value=draft.work||"";if(learned&&!learned.value)learned.value=draft.learned||"";if(mood&&draft.mood)mood.value=draft.mood;qa(".v7-project-checks input",form).forEach(x=>x.checked=(draft.projectIds||[]).includes(x.value));renderDraftStatus(draft.updatedAt);form.dataset.v8DraftRestored="1";
  }
  function saveProjectDraft(){const form=$("v7ProjectForm");if(!form||$("v7ProjectId")?.value)return;writeJson(KEYS.projectDraft,{name:$("v7ProjectName")?.value||"",category:$("v7ProjectCategory")?.value||"",progress:$("v7ProjectProgress")?.value||"0",status:$("v7ProjectStatus")?.value||"active",description:$("v7ProjectDescription")?.value||"",updatedAt:new Date().toISOString()});renderProjectDraftStatus();}
  function restoreProjectDraft(){const form=$("v7ProjectForm");if(!form||$("v7ProjectId")?.value)return;const d=readJson(KEYS.projectDraft,null);if(!d)return;if(!$("v7ProjectName")?.value){$("v7ProjectName").value=d.name||"";$("v7ProjectCategory").value=d.category||"";$("v7ProjectProgress").value=d.progress||"0";$("v7ProjectStatus").value=d.status||"active";$("v7ProjectDescription").value=d.description||"";}renderProjectDraftStatus(d.updatedAt);}
  function renderProjectDraftStatus(stamp){const form=$("v7ProjectForm");if(!form)return;let el=$("v8ProjectDraftStatus");if(!el){el=document.createElement("small");el.id="v8ProjectDraftStatus";el.className="v8-draft-status";q(".v7-form-actions",form)?.insertAdjacentElement("beforebegin",el);}const d=readJson(KEYS.projectDraft,null);const s=stamp||d?.updatedAt;el.textContent=s?`💾 ${t("draftSaved",{time:new Intl.DateTimeFormat(lang()==="th"?"th-TH":"en-GB",{hour:"2-digit",minute:"2-digit"}).format(new Date(s))})}`:`💾 ${t("autoDraft")}`;}

  // ---------- Notification Center ----------
  function notificationReadSet(){const v=readJson(KEYS.notifRead,[]);return new Set(Array.isArray(v)?v:[]);}
  function saveNotificationRead(set){writeJson(KEYS.notifRead,[...set].slice(-300));}
  function missingJournalNotifications(){
    const cfg=API.getConfig(),now=API.getNow(),today=dateKey(now),journals=readJson("wp-v6-journal",{}),out=[];let checked=0;
    const [eh,em]=String(cfg.workdayEnd||"23:59").split(":").map(Number),nowMin=now.getHours()*60+now.getMinutes();
    for(let d=new Date(now.getFullYear(),now.getMonth(),now.getDate());checked<14&&d>=new Date(`${cfg.startDate}T00:00:00`);d.setDate(d.getDate()-1)){
      const key=dateKey(d),scheduled=API.getScheduledMinutes(d),leave=API.getLeaveMinutes(d),due=key<today||(key===today&&nowMin>=((eh||0)*60+(em||0)));if(scheduled<=0||leave>=scheduled||!due)continue;checked++;if(!journals[key])out.push({id:`journal:${key}`,icon:"📓",title:t("journalMissing"),body:t("journalMissingBody",{date:formatDateKey(key)}),route:"journal",date:key,tone:"warning"});if(out.length>=3)break;
    }return out;
  }
  function buildNotifications(){
    const list=[...missingJournalNotifications()],stats=API.getStats(),hours=stats.elapsedMinutes/60;
    const backup=localStorage.getItem("wp-v6-last-backup-at"),reminder=Number(localStorage.getItem("wp-v6-backup-reminder-days")||14);
    if(!backup)list.push({id:"backup:none",icon:"💾",title:t("backupOld"),body:t("backupNever"),route:"settings",tone:"warning"});else{const days=Math.floor((Date.now()-new Date(backup).getTime())/86400000);if(reminder>0&&days>=reminder)list.push({id:`backup:${new Date(backup).toISOString().slice(0,10)}`,icon:"💾",title:t("backupOld"),body:t("backupOldBody",{days}),route:"settings",tone:"warning"});}
    [900,1000].forEach(target=>{const left=target-hours;if(left>0&&left<=24)list.push({id:`milestone:${target}`,icon:"⏱",title:t("milestoneClose",{hours:target}),body:t("milestoneBody",{left:left.toFixed(1)}),route:"achievements",tone:"info"});});
    API.getAchievements(stats).filter(a=>a.unlocked&&a.unlockedAt).sort((a,b)=>String(b.unlockedAt).localeCompare(String(a.unlockedAt))).slice(0,4).forEach(a=>list.push({id:`ach:${a.id}:${a.unlockedAt}`,icon:a.icon||"🏆",title:t("achievementUnlocked"),body:API.translate(a.titleKey),route:"achievements",tone:"success"}));
    if(cloud.user&&(cloud.localDirty||cloud.status==="error"))list.unshift({id:"cloud:pending",icon:"☁",title:t("cloudNeedsSync"),body:t("cloudNeedsSyncBody"),route:"settings",tone:cloud.status==="error"?"error":"info"});
    return list.slice(0,12);
  }
  function initializeNotificationReadState(){
    const marker="wp-v8-notifications-initialized";if(localStorage.getItem(marker)==="1")return;
    const set=notificationReadSet();API.getAchievements(API.getStats()).filter(a=>a.unlocked&&a.unlockedAt).forEach(a=>set.add(`ach:${a.id}:${a.unlockedAt}`));saveNotificationRead(set);localStorage.setItem(marker,"1");
  }
  // V8.6.0.8: UI-only recent activity. Never placed in localStorage or sent to account sync.
  // Existing reminder/read keys keep their original semantics.
  const wdjRecentNotifications=[];
  const wdjRecentRead=new Set();
  const wdjToastSignatures=new Map();
  let wdjEventCounter=0;
  let wdjNoticeAccountId=cloud.user?.id||"guest";
  let wdjNotificationFilter="all";
  let wdjNotifRenderSignature="";
  const wdjNotifText={
    th:{all:"ทั้งหมด",unread:"ยังไม่อ่าน",success:"สำเร็จ",warning:"คำเตือน",error:"ข้อผิดพลาด",recent:"กิจกรรมล่าสุด",reminders:"รายการที่ควรทราบ",shown:"รายการ",noMatches:"ไม่มีการแจ้งเตือนในหมวดนี้",clear:"อ่านทั้งหมด",subtitle:"ติดตามสิ่งสำคัญและกิจกรรมล่าสุด",activity:"การทำรายการล่าสุด",time:"เวลา"},
    en:{all:"All",unread:"Unread",success:"Success",warning:"Warnings",error:"Errors",recent:"Recent activity",reminders:"Reminders & updates",shown:"items",noMatches:"Nothing in this category",clear:"Mark all read",subtitle:"Important updates and recent activity",activity:"Recent action",time:"Time"}
  };
  const wdjNt=(key)=>wdjNotifText[lang()][key]||key;
  const wdjIsRead=(n,read)=>n.recent?wdjRecentRead.has(n.id):read.has(n.id);
  function wdjNotificationItems(){
    const accountId=cloud.user?.id||"guest";
    if(wdjNoticeAccountId!==accountId){
      // Do not show recent action messages from another signed-in account.
      wdjNoticeAccountId=accountId;
      wdjRecentNotifications.length=0;
      wdjRecentRead.clear();
      wdjToastSignatures.clear();
      wdjNotifRenderSignature="";
    }
    return [...wdjRecentNotifications,...buildNotifications()];
  }
  function wdjTone(node){
    if(node.classList.contains("toast-error")||node.classList.contains("toast-danger"))return "error";
    if(node.classList.contains("toast-warning")||node.classList.contains("toast-warn"))return "warning";
    if(node.classList.contains("toast-success"))return "success";
    return "info";
  }
  function wdjRegisterToast(node){
    if(!node||node.nodeType!==1||!node.classList.contains("app-toast")||node.dataset.wdjNotifProcessed)return;
    node.dataset.wdjNotifProcessed="1";
    const tone=wdjTone(node);
    // Use textContent only. Never persist toast text (which may contain private data).
    const strong=node.querySelector("strong");
    const title=String(strong?.textContent||"").trim().slice(0,140);
    const body=String(node.querySelector("small")?.textContent||"").trim().slice(0,180);
    if(!title)return;
    const signature=`${tone}|${title}|${body}`;
    const now=Date.now();
    for(const [key,stamp] of wdjToastSignatures){if(now-stamp>15000)wdjToastSignatures.delete(key);}
    if(wdjToastSignatures.has(signature)){
      // Suppress rapid duplicates from several legacy toast emitters.
      node.remove();return;
    }
    wdjToastSignatures.set(signature,now);
    const icons={success:"✓",warning:"!",error:"×",info:"i"};
    wdjRecentNotifications.unshift({id:`recent:${now}:${++wdjEventCounter}`,recent:true,tone,icon:icons[tone],title,body,createdAt:now});
    if(wdjRecentNotifications.length>25){const removed=wdjRecentNotifications.splice(25);removed.forEach(n=>wdjRecentRead.delete(n.id));}
    const stack=$("toastStack");
    if(stack){const active=qa(".app-toast:not(.out)",stack);active.slice(0,Math.max(0,active.length-3)).forEach(item=>{item.classList.add("out");setTimeout(()=>item.remove(),260);});}
    refreshNotificationCenter(false);
  }
  function wdjObserveToasts(){
    const stack=$("toastStack");if(!stack||stack.dataset.wdjNotifWatch)return;
    stack.dataset.wdjNotifWatch="1";
    const observer=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{
      if(node.nodeType!==1)return;
      if(node.classList?.contains("app-toast"))wdjRegisterToast(node);
      else node.querySelectorAll?.(".app-toast").forEach(wdjRegisterToast);
    })));
    observer.observe(stack,{childList:true});
    qa(".app-toast",stack).forEach(wdjRegisterToast);
  }
  function wdjRecentTime(stamp){
    return new Intl.DateTimeFormat(lang()==="th"?"th-TH":"en-GB",{hour:"2-digit",minute:"2-digit"}).format(new Date(stamp));
  }
  function wdjNotificationTabs(list,read){
    const tabs=$("wdjNotifTabs");if(!tabs)return;
    const kinds=["all","unread","success","warning","error"];
    tabs.innerHTML=kinds.map(key=>{
      const count=list.filter(n=>key==="all"||(key==="unread"?!wdjIsRead(n,read):n.tone===key)).length;
      return `<button type="button" class="wdj-notif-tab ${key===wdjNotificationFilter?"active":""}" data-wdj-notif-filter="${key}" aria-pressed="${key===wdjNotificationFilter}">${esc(wdjNt(key))}<span>${count}</span></button>`;
    }).join("");
    qa("[data-wdj-notif-filter]",tabs).forEach(btn=>btn.onclick=(event)=>{event.stopPropagation();
      const left=tabs.scrollLeft;
      wdjNotificationFilter=btn.dataset.wdjNotifFilter;
      refreshNotificationCenter(true);
      const next=$("wdjNotifTabs");if(next){next.scrollLeft=left;next.querySelector(`[data-wdj-notif-filter="${wdjNotificationFilter}"]`)?.focus({preventScroll:true});}
    });
  }
  function refreshNotificationCenter(forceList=false){
    ensureUi();
    const list=wdjNotificationItems(),read=notificationReadSet(),unread=list.filter(n=>!wdjIsRead(n,read)),badge=$("v8NotifBadge");
    if(badge){badge.hidden=!unread.length;badge.textContent=unread.length>9?"9+":String(unread.length);}
    const bell=$("v8NotifBtn");if(bell)bell.setAttribute("aria-label",`${t("notifications")}${unread.length?` (${unread.length})`:""}`);
    const host=$("v8NotifList"),panel=$("v8NotifPanel");if(!host||!panel||panel.hidden)return;
    const signature=JSON.stringify([lang(),wdjNotificationFilter,list.map(n=>[n.id,n.tone,n.body,wdjIsRead(n,read)] )]);
    if(!forceList&&signature===wdjNotifRenderSignature)return;
    wdjNotifRenderSignature=signature;
    const heading=$("v8NotifHeading"),subtitle=$("wdjNotifSubtitle"),footer=$("wdjNotifFootnote"),all=$("v8NotifReadAll"),close=$("v8NotifClose");
    if(heading)heading.textContent=t("notifications");
    if(subtitle)subtitle.textContent=wdjNt("subtitle");
    if(footer)footer.textContent=`${unread.length} ${wdjNt("unread")} · ${list.length} ${wdjNt("shown")}`;
    if(all){all.textContent=wdjNt("clear");all.disabled=unread.length===0;}
    if(close)close.setAttribute("aria-label",t("close"));
    wdjNotificationTabs(list,read);
    const filtered=list.filter(n=>wdjNotificationFilter==="all"||
      (wdjNotificationFilter==="unread"?!wdjIsRead(n,read):n.tone===wdjNotificationFilter));
    if(!filtered.length){host.innerHTML=`<div class="v8-empty-notif"><span>🔕</span><strong>${esc(wdjNt("noMatches"))}</strong></div>`;return;}
    let lastSection="";
    host.innerHTML=filtered.map(n=>{
      const section=n.recent?"recent":"reminders";
      const heading=section!==lastSection?`<p class="wdj-notif-section">${esc(wdjNt(section))}</p>`:"";
      lastSection=section;
      const time=n.recent?`<small class="wdj-notif-time">${esc(wdjRecentTime(n.createdAt))}</small>`:"";
      const body=n.body?`<p>${esc(n.body)}</p>`:"";
      return `${heading}<button class="v8-notif-item wdj-notif-item ${wdjIsRead(n,read)?"read":"unread"}" data-v8-notif="${esc(n.id)}" data-wdj-recent="${n.recent?"1":"0"}" data-route="${esc(n.route||"")}" data-date="${esc(n.date||"")}" type="button"><span class="v8-notif-icon ${esc(n.tone||"info")}">${esc(n.icon||"🔔")}</span><div><strong>${esc(n.title)}</strong>${body}${time}</div>${wdjIsRead(n,read)?"":"<i aria-hidden=\"true\"></i>"}</button>`;
    }).join("");
    qa("[data-v8-notif]",host).forEach(btn=>btn.onclick=(event)=>{event.stopPropagation();
      if(btn.dataset.wdjRecent==="1")wdjRecentRead.add(btn.dataset.v8Notif);
      else{const set=notificationReadSet();set.add(btn.dataset.v8Notif);saveNotificationRead(set);}
      if(btn.dataset.date)localStorage.setItem(KEYS.pendingJournalDate,btn.dataset.date);
      if(btn.dataset.route){location.hash=`#/${btn.dataset.route}`;setNotificationPanel(false);requestEnhance(100);}
      refreshNotificationCenter(true);
    });
  }
  function markAllNotificationsRead(){
    const set=notificationReadSet();buildNotifications().forEach(n=>set.add(n.id));saveNotificationRead(set);
    wdjRecentNotifications.forEach(n=>wdjRecentRead.add(n.id));refreshNotificationCenter(true);
  }
  function toggleNotificationPanel(){setNotificationPanel($("v8NotifPanel")?.hidden!==false);}
  function setNotificationPanel(open){
    const panel=$("v8NotifPanel");if(!panel)return;
    const wasOpen=!panel.hidden;panel.hidden=!open;panel.classList.toggle("open",open);
    $("v8NotifBtn")?.setAttribute("aria-expanded",String(!!open));
    if(open){wdjNotifRenderSignature="";refreshNotificationCenter(true);if(!wasOpen)$("v8NotifClose")?.focus({preventScroll:true});}
    else if(wasOpen&&panel.contains(document.activeElement))$("v8NotifBtn")?.focus({preventScroll:true});
  }

  // ---------- Schedule Templates ----------
  const BUILTIN_TEMPLATES = [
    {id:"intern",nameKey:"templateIntern",workdayStart:"07:00",workdayEnd:"16:10",workdays:[1,2,3,4,5],breaks:[{start:"09:00",end:"09:20"},{start:"11:00",end:"11:40"},{start:"14:00",end:"14:10"}]},
    {id:"office8",nameKey:"templateOffice8",workdayStart:"08:00",workdayEnd:"17:00",workdays:[1,2,3,4,5],breaks:[{start:"12:00",end:"13:00"}]},
    {id:"office9",nameKey:"templateOffice9",workdayStart:"09:00",workdayEnd:"18:00",workdays:[1,2,3,4,5],breaks:[{start:"12:00",end:"13:00"}]}
  ];
  function templateName(item){return item.nameKey?t(item.nameKey):(item.name||item.id);}
  function allScheduleTemplates(){const custom=readJson(KEYS.scheduleTemplates,[]);return [...BUILTIN_TEMPLATES,...(Array.isArray(custom)?custom:[])];}
  function currentScheduleTemplate(name="Current") {const cfg=API.getConfig();return{id:`custom-${Date.now().toString(36)}`,name,workdayStart:cfg.workdayStart,workdayEnd:cfg.workdayEnd,workdays:[...(cfg.workdays||[1,2,3,4,5])],breaks:(cfg.breaks||[]).map(b=>({start:b.start,end:b.end}))};}
  function applyTemplateToSetup(tpl){if(!tpl)return;const start=$("setupWorkStart"),end=$("setupWorkEnd");if(start){start.value=tpl.workdayStart;start.dispatchEvent(new Event("input",{bubbles:true}));}if(end){end.value=tpl.workdayEnd;end.dispatchEvent(new Event("input",{bubbles:true}));}qa(".setup-workday").forEach(x=>x.checked=tpl.workdays.includes(Number(x.value)));for(let i=1;i<=3;i++){const br=tpl.breaks[i-1],en=$("setupBreakEnabled"+i),s=$("setupBreakStart"+i),e=$("setupBreakEnd"+i);if(en)en.checked=!!br;if(s)s.value=br?.start||"12:00";if(e)e.value=br?.end||"13:00";[en,s,e].forEach(x=>x?.dispatchEvent(new Event("change",{bubbles:true})));}}
  function ensureSetupTemplates(){const step=q('[data-setup-step="3"]');if(!step||$("v8SetupTemplates"))return;const box=document.createElement("div");box.id="v8SetupTemplates";box.className="v8-setup-templates";box.innerHTML=`<div><strong>🗓 ${esc(t("scheduleTemplates"))}</strong><small>${esc(t("scheduleTemplateHelp"))}</small></div><div class="v8-template-chips">${BUILTIN_TEMPLATES.map(x=>`<button type="button" data-v8-setup-template="${x.id}">${esc(templateName(x))}</button>`).join("")}</div>`;q(".setup-form-grid",step)?.insertAdjacentElement("beforebegin",box);qa("[data-v8-setup-template]",box).forEach(btn=>btn.onclick=()=>applyTemplateToSetup(BUILTIN_TEMPLATES.find(x=>x.id===btn.dataset.v8SetupTemplate)));}
  function ensureSetupCloudPrompt(){const step=q('[data-setup-step="1"]');if(!step||$("v8SetupCloud"))return;const box=document.createElement("div");box.id="v8SetupCloud";box.className="v8-setup-cloud";box.innerHTML=`<span>☁</span><div><strong>${esc(t("restoreCloud"))}</strong><small>${esc(t("localDefault"))}</small></div><button type="button" class="outline-btn">${esc(t("signIn"))}</button>`;q(".setup-form-grid",step)?.insertAdjacentElement("beforebegin",box);box.querySelector("button").onclick=()=>openAccountModal("signin");}
  function applyTemplateToJourney(tpl){if(!tpl||!confirm(t("templateApplyConfirm")))return;const raw=readJson("wp-journey-config",{});writeJson("wp-journey-config",{...raw,workdayStart:tpl.workdayStart,workdayEnd:tpl.workdayEnd,workdays:[...tpl.workdays],breaks:tpl.breaks.map(b=>({...b}))});toast("✓",t("templateApplied"),"success");setTimeout(()=>location.reload(),350);}
  function downloadJson(name,obj){const blob=new Blob([JSON.stringify(obj,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);}
  function ensureCalendarTemplates(){const root=$("v7CalendarIntro");if(!root||$("v8ScheduleTemplatesCard"))return;const card=document.createElement("section");card.id="v8ScheduleTemplatesCard";card.className="card v8-template-card";root.appendChild(card);renderTemplateCard();}
  function renderTemplateCard(){const card=$("v8ScheduleTemplatesCard");if(!card)return;const list=allScheduleTemplates();card.innerHTML=`<div class="v8-card-head"><div><p class="eyebrow">TEMPLATES</p><h3>${esc(t("scheduleTemplates"))}</h3><p>${esc(t("scheduleTemplateHelp"))}</p></div></div><div class="v8-template-toolbar"><select id="v8TemplateSelect">${list.map(x=>`<option value="${esc(x.id)}">${esc(templateName(x))}</option>`).join("")}</select><button id="v8TemplateApply" class="primary-btn" type="button">${esc(t("applyTemplate"))}</button></div><div class="v8-template-actions"><button id="v8TemplateSave" class="outline-btn" type="button">＋ ${esc(t("saveCurrentTemplate"))}</button><button id="v8TemplateExport" class="outline-btn" type="button">↓ ${esc(t("exportTemplate"))}</button><button id="v8TemplateImport" class="outline-btn" type="button">↑ ${esc(t("importTemplate"))}</button><input id="v8TemplateFile" type="file" accept="application/json,.json" hidden></div>`;
    $("v8TemplateApply").onclick=()=>applyTemplateToJourney(allScheduleTemplates().find(x=>x.id===$("v8TemplateSelect").value));
    $("v8TemplateSave").onclick=()=>{const name=prompt(t("templateName"),"My Schedule");if(!name)return;const custom=readJson(KEYS.scheduleTemplates,[]),item=currentScheduleTemplate(name.trim()||"My Schedule");custom.push(item);writeJson(KEYS.scheduleTemplates,custom);toast("✓",t("templateSaved"),"success");renderTemplateCard();};
    $("v8TemplateExport").onclick=()=>{const item=allScheduleTemplates().find(x=>x.id===$("v8TemplateSelect").value);if(item)downloadJson(`workday-schedule-${item.id}.json`,{type:"workday-schedule-template",version:1,template:item});};
    $("v8TemplateImport").onclick=()=>$("v8TemplateFile").click();$("v8TemplateFile").onchange=async e=>{const file=e.target.files?.[0];e.target.value="";if(!file)return;try{const data=JSON.parse(await file.text()),tpl=data?.template;if(data?.type!=="workday-schedule-template"||!tpl?.workdayStart||!tpl?.workdayEnd||!Array.isArray(tpl.workdays)||!Array.isArray(tpl.breaks))throw 0;const custom=readJson(KEYS.scheduleTemplates,[]);custom.push({...tpl,id:`custom-${Date.now().toString(36)}`,name:tpl.name||file.name.replace(/\.json$/i,"")});writeJson(KEYS.scheduleTemplates,custom);toast("✓",t("templateImported"),"success");renderTemplateCard();}catch{toast("!",t("templateInvalid"),"error");}};
  }

  // ---------- Data Health + PWA Diagnostics ----------
  function storageBytes(){let n=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i)||"",v=localStorage.getItem(k)||"";n+=(k.length+v.length)*2;}return n;}
  function formatBytes(n){if(n<1024)return`${n} B`;if(n<1048576)return`${(n/1024).toFixed(1)} KB`;return`${(n/1048576).toFixed(2)} MB`;}
  function parseIssues(){const keys=["wp-v6-journal","wp-v6-projects","wp-day-overrides","wp-journey-config","wp-v8-journal-drafts","wp-v8-schedule-templates"];let bad=0;keys.forEach(k=>{const raw=localStorage.getItem(k);if(!raw)return;try{JSON.parse(raw);}catch{bad++;}});return bad;}
  async function checkForUpdate(){try{const reg=await navigator.serviceWorker?.getRegistration();await reg?.update();toast("✓",t("updateChecked"),"success");}catch(e){toast("!",String(e?.message||e),"error");}}
  async function clearAppCache(){try{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith("workday-journey-")).map(k=>caches.delete(k)));toast("✓",t("cacheCleared"),"success");}catch(e){toast("!",String(e?.message||e),"error");}}
  async function reloadLatest(){await clearAppCache();try{const reg=await navigator.serviceWorker?.getRegistration();await reg?.update();}catch{}location.reload();}
  function dataHealthHtml(){const journals=Object.keys(readJson("wp-v6-journal",{})).length,projects=(readJson("wp-v6-projects",[])||[]).length,ach=API.getAchievements(API.getStats()),unlocked=ach.filter(a=>a.unlocked).length,bad=parseIssues(),backup=localStorage.getItem("wp-v6-last-backup-at"),lastSync=localStorage.getItem(KEYS.cloudLastSync);return `<section id="v8DataHealth" class="card v7-settings-card v7-settings-wide v8-data-health"><div class="v8-card-head"><div><p class="eyebrow">DATA HEALTH</p><h3>🩺 ${esc(t("dataHealth"))}</h3><p>${esc(t("dataHealthHelp"))}</p></div><span class="v8-health-chip ${bad?"warn":"good"}">${esc(bad?t("statusWarning"):t("statusGood"))}</span></div><div class="v8-health-grid"><div><span>📓 ${esc(t("journals"))}</span><strong>${journals}</strong></div><div><span>🧩 ${esc(t("projects"))}</span><strong>${projects}</strong></div><div><span>🏆 ${esc(t("achievements"))}</span><strong>${unlocked}/${ach.length}</strong></div><div><span>💽 ${esc(t("localStorage"))}</span><strong>${formatBytes(storageBytes())}</strong></div><div><span>💾 ${esc(t("backupHealth"))}</span><strong>${esc(safeDateLabel(backup))}</strong></div><div><span>☁ ${esc(t("cloudHealth"))}</span><strong>${esc(cloud.user?safeDateLabel(lastSync):t("cloudLocal"))}</strong></div><div><span>🏷 ${esc(t("appVersion"))}</span><strong>v${VERSION}</strong></div><div><span>🔎 JSON</span><strong>${bad?esc(t("storageIssue",{n:bad})):esc(t("statusGood"))}</strong></div></div><div class="v8-diagnostic-actions"><button id="v8OpenCloud" class="outline-btn" type="button">☁ ${esc(t("account"))}</button><button id="v8CheckUpdate" class="outline-btn" type="button">↻ ${esc(t("checkUpdate"))}</button><button id="v8ClearCache" class="outline-btn" type="button">🧹 ${esc(t("clearCache"))}</button><button id="v8ReloadLatest" class="primary-btn" type="button">⚡ ${esc(t("reloadLatest"))}</button></div></section>`;}
  function ensureDataHealth(){const grid=q("#v7SettingsPage .v7-settings-grid");if(!grid||$("v8DataHealth"))return;grid.insertAdjacentHTML("beforeend",dataHealthHtml());$("v8OpenCloud").onclick=openAccountModal;$("v8CheckUpdate").onclick=checkForUpdate;$("v8ClearCache").onclick=clearAppCache;$("v8ReloadLatest").onclick=reloadLatest;}
  function refreshDataHealth(){if(location.hash.includes("settings")){const old=$("v8DataHealth");if(old)old.remove();ensureDataHealth();}}

  // ---------- Public Journey Card ----------
  function publicPayload(includeName=false){const stats=API.getStats(),ach=API.getAchievements(stats),projects=(readJson("wp-v6-projects",[])||[]).filter(p=>!p.archived),cfg=API.getConfig();return{v:1,n:includeName?(cfg.profileName||""):"",h:Math.round(stats.elapsedMinutes/6)/10,d:stats.fullCompletedDays,p:projects.length,a:ach.filter(x=>x.unlocked).length,at:ach.length,j:Math.round(stats.percent*10)/10,s:cfg.startDate,e:cfg.endDate,ts:new Date().toISOString()};}
  function encodePublic(obj){const bytes=new TextEncoder().encode(JSON.stringify(obj));let binary="";bytes.forEach(b=>binary+=String.fromCharCode(b));return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");}
  function decodePublic(value){try{let b=value.replace(/-/g,"+").replace(/_/g,"/");while(b.length%4)b+="=";const binary=atob(b),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));return JSON.parse(new TextDecoder().decode(bytes));}catch{return null;}}
  function publicUrl(includeName=false){const url=new URL(location.href);url.searchParams.set("journey",encodePublic(publicPayload(includeName)));url.hash="";return url.toString();}
  function publicCardMarkup(data){const name=data.n?`<p class="v8-public-name">${esc(data.n)}</p>`:"";return `<div class="v8-public-brand"><span>%</span><div><p>WORKDAY JOURNEY</p><h1>${esc(t("publicSummary"))}</h1>${name}</div></div><div class="v8-public-progress"><strong>${Number(data.j||0).toFixed(1)}%</strong><span>${esc(t("journeyProgress"))}</span><i><b style="width:${Math.max(0,Math.min(100,Number(data.j)||0))}%"></b></i></div><div class="v8-public-stats"><div><span>⏱ ${esc(t("workHours"))}</span><strong>${Number(data.h||0).toLocaleString()}h</strong></div><div><span>📅 ${esc(t("workdays"))}</span><strong>${Number(data.d||0)}</strong></div><div><span>🧩 ${esc(t("projectCount"))}</span><strong>${Number(data.p||0)}</strong></div><div><span>🏆 ${esc(t("achievementCount"))}</span><strong>${Number(data.a||0)}/${Number(data.at||0)}</strong></div></div><p class="v8-public-safe">🔐 ${esc(t("publicSafe"))}</p>`;}
  function ensurePublicShareCard(){const root=$("v7ReportsPage");if(!root||$("v8PublicShareCard"))return;const card=document.createElement("section");card.id="v8PublicShareCard";card.className="card v8-public-share-card";card.innerHTML=`<div class="v8-card-head"><div><p class="eyebrow">PORTFOLIO</p><h3>🔗 ${esc(t("publicJourney"))}</h3><p>${esc(t("publicJourneyHelp"))}</p></div></div><label class="v8-public-name-toggle"><input id="v8PublicIncludeName" type="checkbox"><span>${esc(t("includeName"))}</span></label><div class="v8-public-preview" id="v8PublicPreview">${publicCardMarkup(publicPayload(false))}</div><div class="v8-public-actions"><button id="v8CopyPublic" class="outline-btn" type="button">🔗 ${esc(t("copyPublicLink"))}</button><button id="v8DownloadPublic" class="outline-btn" type="button">📸 ${esc(t("downloadPublicCard"))}</button><button id="v8SharePublic" class="primary-btn" type="button">↗ ${esc(t("sharePublic"))}</button></div>`;root.appendChild(card);const update=()=>{$("v8PublicPreview").innerHTML=publicCardMarkup(publicPayload($("v8PublicIncludeName").checked));};$("v8PublicIncludeName").onchange=update;$("v8CopyPublic").onclick=async()=>{const url=publicUrl($("v8PublicIncludeName").checked);await navigator.clipboard?.writeText(url);toast("✓",t("publicLinkCopied"),"success");};$("v8DownloadPublic").onclick=()=>downloadPublicImage(publicPayload($("v8PublicIncludeName").checked));$("v8SharePublic").onclick=async()=>{const url=publicUrl($("v8PublicIncludeName").checked);if(navigator.share)try{await navigator.share({title:"Workday Journey",text:t("publicSummary"),url});}catch{}else{await navigator.clipboard?.writeText(url);toast("✓",t("publicLinkCopied"),"success");}};}
  function downloadPublicImage(data){const c=document.createElement("canvas");c.width=1200;c.height=675;const x=c.getContext("2d"),g=x.createLinearGradient(0,0,1200,675);g.addColorStop(0,"#eef4ff");g.addColorStop(1,"#f8fffb");x.fillStyle=g;x.fillRect(0,0,c.width,c.height);x.fillStyle="#1b2a44";x.font="700 48px sans-serif";x.fillText("WORKDAY JOURNEY",80,100);x.font="800 110px sans-serif";x.fillStyle="#356ae6";x.fillText(`${Number(data.j||0).toFixed(1)}%`,80,240);x.fillStyle="#1b2a44";x.font="600 32px sans-serif";x.fillText(data.n||"Journey Summary",80,305);const rows=[["Work Hours",`${data.h}h`],["Workdays",String(data.d)],["Projects",String(data.p)],["Achievements",`${data.a}/${data.at}`]];rows.forEach(([a,b],i)=>{const xx=80+(i%2)*500,yy=410+Math.floor(i/2)*110;x.fillStyle="#6c7a90";x.font="500 24px sans-serif";x.fillText(a,xx,yy);x.fillStyle="#1b2a44";x.font="800 42px sans-serif";x.fillText(b,xx,yy+48);});x.fillStyle="#6c7a90";x.font="400 18px sans-serif";x.fillText("Public summary · No Journal, Leave or private Calendar data",80,630);const a=document.createElement("a");a.href=c.toDataURL("image/png");a.download="workday-journey-public.png";a.click();}
  function showPublicView(data){ensureUi();const body=$("v8PublicViewBody");body.innerHTML=publicCardMarkup(data);$("v8PublicBackdrop").hidden=false;document.body.classList.add("v8-public-open");}
  function closePublicView(){const el=$("v8PublicBackdrop");if(el)el.hidden=true;document.body.classList.remove("v8-public-open");const url=new URL(location.href);url.searchParams.delete("journey");history.replaceState(null,"",url.pathname+url.search+location.hash);}
  function detectPublicLink(){const data=decodePublic(new URL(location.href).searchParams.get("journey")||"");if(data&&data.v===1)showPublicView(data);}

  // ---------- Route Enhancements ----------
  function enhanceRoute(){
    ensureUi();ensureCleanTopbar();ensureSetupTemplates();ensureSetupCloudPrompt();restoreJournalDraft();restoreProjectDraft();
    if(location.hash.includes("calendar"))ensureCalendarTemplates();
    if(location.hash.includes("settings")){ensureDataHealth();window.WorkdayDataSafety?.mount?.();}
    if(location.hash.includes("reports"))ensurePublicShareCard();
    const pending=localStorage.getItem(KEYS.pendingJournalDate);if(pending&&location.hash.includes("journal")&&$("v7JournalDate")){localStorage.removeItem(KEYS.pendingJournalDate);const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(pending);if(m){$("v7JournalDate").value=`${m[3]}/${m[2]}/${m[1]}`;$("v7JournalDate").dispatchEvent(new Event("change",{bubbles:true}));}}
    updateCloudIndicators();refreshNotificationCenter();ensureWhatsNewUi();
  }

  document.addEventListener("input",e=>{
    if(["v7JournalWork","v7JournalLearned"].includes(e.target.id)){clearTimeout(draftTimer);draftTimer=setTimeout(saveJournalDraft,450);}
    if(["v7ProjectName","v7ProjectCategory","v7ProjectProgress","v7ProjectDescription"].includes(e.target.id)){clearTimeout(projectDraftTimer);projectDraftTimer=setTimeout(saveProjectDraft,450);}
  },true);
  document.addEventListener("change",e=>{
    if(e.target.id==="v7JournalMood"||e.target.closest?.(".v7-project-checks")){clearTimeout(draftTimer);draftTimer=setTimeout(saveJournalDraft,180);}
    if(e.target.id==="v7ProjectStatus")saveProjectDraft();
  },true);
  document.addEventListener("submit",e=>{
    if(e.target.id==="v7JournalForm"){const key=getJournalDateFromUi();setTimeout(()=>clearJournalDraft(key),20);}
    if(e.target.id==="v7ProjectForm"){setTimeout(()=>rawRemove(KEYS.projectDraft),20);}
  },true);

  // ---------- Stable interaction / route enhancement scheduler ----------
  let interactionActive=false,enhancePending=false,enhanceTimer=null;
  const INTERACTIVE_SELECTOR='button,a,input,select,textarea,[role="button"],[role="menuitem"],#fontPicker,#fontPickerMenu,#v802ProfileMenu,#v8NotifPanel,.v8-modal-backdrop,.modal-backdrop';
  function requestEnhance(delay=60){
    clearTimeout(enhanceTimer);
    if(interactionActive){enhancePending=true;return;}
    enhanceTimer=setTimeout(()=>{enhancePending=false;enhanceRoute();},delay);
  }
  document.addEventListener("pointerdown",e=>{if(e.target.closest?.(INTERACTIVE_SELECTOR))interactionActive=true;},true);
  const releaseInteraction=()=>setTimeout(()=>{interactionActive=false;if(enhancePending)requestEnhance(20);},90);
  document.addEventListener("pointerup",releaseInteraction,true);
  document.addEventListener("pointercancel",releaseInteraction,true);

  const ROUTE_ROOT_IDS=new Set(["v7JournalPage","v7ProjectsPage","v7ReportsPage","v7CalendarIntro","v7SettingsPage"]);
  const observer=new MutationObserver(records=>{
    // V7 replaces the direct contents of route roots when a page is genuinely
    // re-rendered. Ignore nested real-time updates (clock, progress, mascot),
    // otherwise open menus can be rebuilt every second.
    const routeWasRebuilt=records.some(r=>r.type==="childList" && r.addedNodes.length && ROUTE_ROOT_IDS.has(r.target?.id));
    if(routeWasRebuilt)requestEnhance(50);
  });
  const main=q("main.dashboard");if(main)observer.observe(main,{childList:true,subtree:true});

  window.addEventListener("hashchange",()=>requestEnhance(60));
  window.addEventListener("workday:v7-data-changed",()=>requestEnhance(60));
  document.addEventListener("click",e=>{if(e.target.closest?.(".lang-btn"))requestEnhance(100);},true);
  window.addEventListener("workday:journey-cleared",()=>{rawRemove(KEYS.journalDrafts);rawRemove(KEYS.projectDraft);rawRemove(KEYS.notifRead);cloud.localDirty=true;updateCloudIndicators();});
  window.addEventListener("online",()=>{if(cloud.user){cloud.status="syncing";syncNow({silent:true});}else updateCloudIndicators();});
  window.addEventListener("offline",()=>{if(cloud.user)cloud.status="offline";updateCloudIndicators();});
  let v807VisibilitySyncTimer=null;
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden||!cloud.user||!navigator.onLine||cloud.conflictRow)return;
    clearTimeout(v807VisibilitySyncTimer);
    v807VisibilitySyncTimer=setTimeout(()=>{
      if(document.hidden||!cloud.user||!navigator.onLine||cloud.conflictRow||cloud.reconciling)return;
      const different=payloadHash()!==(localStorage.getItem(KEYS.cloudLastPayloadHash)||"");
      if(cloud.initialReady && different){cloud.localDirty=true;scheduleCloudUpload(1200);return;}
      // Remote changes are checked occasionally, not on every tab/page switch.
      if(!cloud.initialReady||Date.now()-cloud.lastRemoteCheck>180000)syncNow({silent:true});
    },650);
  });
  document.addEventListener("click",e=>{if(!e.target.closest?.("#v8NotifPanel,#v8NotifBtn")&&$("v8NotifPanel")?.hidden===false)setNotificationPanel(false);if(!e.target.closest?.("#v802ProfileMenu,#profileQuickBtn"))closeProfileMenu();});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){setNotificationPanel(false);closeAccountModal();closeProfileMenu();closeWhatsNew();}});

  // ---------- Boot ----------
  function boot(){
    ensureUi();ensureCleanTopbar();
    if(!localStorage.getItem(KEYS.dataUpdated))setCloudMeta(KEYS.dataUpdated,new Date().toISOString());
    const currentHash=payloadHash(),lastHash=localStorage.getItem(KEYS.cloudLastPayloadHash)||"";cloud.localDirty=!!lastHash&&lastHash!==currentHash;
    initializeNotificationReadState();wdjObserveToasts();initSupabase();enhanceRoute();detectPublicLink();
    setInterval(()=>{refreshNotificationCenter();updateCloudIndicators();},30000);
    setInterval(()=>{if(!cloud.user||!cloud.initialReady||!navigator.onLine||cloud.conflictRow||localStorage.getItem("wp-setup-completed")!=="true")return;const h=payloadHash(),last=localStorage.getItem(KEYS.cloudLastPayloadHash)||"";if(last&&h!==last){cloud.localDirty=true;updateCloudIndicators();scheduleCloudUpload(1300);}},12000);
  }
  boot();
})();
;

/* ===== SOURCE: v81.js ===== */
(() => {
  "use strict";

  const API = window.WorkdayJourneyAPI;
  if (!API) return;

  const VERSION = "8.6.0.2";
  const $ = id => document.getElementById(id);
  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const read = (key, fallback) => { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  const lang = () => localStorage.getItem("wp-language") === "en" ? "en" : "th";

  const KEYS = {
    ledger: "wp-v81-coin-ledger",
    owned: "wp-v81-owned-rewards",
    mascot: "wp-v81-equipped-mascot",
    theme: "wp-v81-equipped-theme",
    effect: "wp-v81-equipped-effect",
    accessory: "wp-v831-equipped-accessory",
    frame: "wp-v831-equipped-frame",
    retro: "wp-v81-retro-rewards-v1",
    tab: "wp-v81-shop-tab",
    rebalance: "wp-v82-coin-rebalance-v1",
    missions: "wp-v82-daily-missions",
    activity: "wp-v82-daily-activity",
    chests: "wp-v82-chests",
    themeTrial: "wp-v82-theme-trial",
    mascotXp: "wp-v82-mascot-xp",
    bankLedger: "wp-v83-bank-ledger",
    bankState: "wp-v83-bank-state",
    exchangeTrades: "wp-v84-exchange-trades",
    exchangeWatch: "wp-v84-exchange-watchlist",
    exchangeSelected: "wp-v84-exchange-selected",
    exchangeRange: "wp-v84-exchange-range",
    exchangeAchievements: "wp-v84-exchange-achievements",
    exchangeAcademy: "wp-v841-trading-academy",
    exchangeBeginner: "wp-v841-beginner-mode",
    vaultProjects: "wp-v845-vault-projects",
    featureStats: "wp-v846-feature-achievement-stats"
  };

  const ECONOMY = { workday:15, journal:10, project:50 };
  const TIER_COINS = { common: 20, rare: 40, epic: 80, legendary: 150 };
  const LEGACY_BANK_DAILY_CAP = 15;
  const LEGACY_BANK_TIERS = [
    { id:"starter", min:0, max:499.999, rate:.001, icon:"🌱", th:"Starter Saver", en:"Starter Saver" },
    { id:"smart", min:500, max:1499.999, rate:.002, icon:"💼", th:"Smart Saver", en:"Smart Saver" },
    { id:"pro", min:1500, max:4999.999, rate:.003, icon:"💎", th:"Pro Saver", en:"Pro Saver" },
    { id:"elite", min:5000, max:Infinity, rate:.004, icon:"👑", th:"Elite Saver", en:"Elite Saver" }
  ];
  const BANK_DAILY_CAP = 150;
  const BANK_TIERS = [
    { id:"starter", min:0, max:499.999, rate:.0100, icon:"🌱", th:"Starter Saver", en:"Starter Saver" },
    { id:"smart", min:500, max:1499.999, rate:.0125, icon:"💼", th:"Smart Saver", en:"Smart Saver" },
    { id:"pro", min:1500, max:4999.999, rate:.0150, icon:"💎", th:"Pro Saver", en:"Pro Saver" },
    { id:"elite", min:5000, max:Infinity, rate:.0200, icon:"👑", th:"Elite Saver", en:"Elite Saver" }
  ];
  const BANK_STREAK_BONUSES = [
    { days:14, rate:.0050, icon:"🔥", th:"14 วัน", en:"14 days" },
    { days:7, rate:.0025, icon:"🔥", th:"7 วัน", en:"7 days" },
    { days:3, rate:.0010, icon:"🔥", th:"3 วัน", en:"3 days" }
  ];

  const TEXT = {
    th: {
      rewards: "รางวัล",
      rewardsSub: "Mascot, Accessories, Frames, Theme, Effect และ Work Coins",
      shopTitle: "Reward Shop",
      shopHelp: "ใช้ Work Coins แต่ง Journey ของคุณด้วย Mascot, Accessories, Profile Frames, Premium Themes และ Effects",
      coinBalance: "Work Coins",
      lifetimeEarned: "ได้รับทั้งหมด",
      lifetimeSpent: "ใช้ไปทั้งหมด",
      retroTitle: "V8.2 Coin Economy Rebalance",
      retroHelp: "V8.2 ปรับเรท Coin ใหม่และเติมส่วนต่างย้อนหลังให้ Workday, Journal, Project และ Achievement เดิมโดยอัตโนมัติ พร้อม Daily Missions และ Chests",
      howToEarn: "รับ Coins ยังไง",
      earnWorkday: "ทำงานครบวัน",
      earnJournal: "บันทึก Daily Journal",
      earnProject: "Project สำเร็จ 100%",
      earnAchievement: "Achievement",
      common: "Common",
      rare: "Rare",
      epic: "Epic",
      legendary: "Legendary",
      mascots: "Mascots",
      themes: "Themes",
      effects: "Effects",
      accessories: "Accessories",
      frames: "Profile Frames",
      history: "Coin History",
      collection: "Collection",
      dailyFeatured: "ดีลประจำวัน",
      dailyFeaturedHelp: "สินค้า 3 ชิ้นลดพิเศษ 15–40% วันนี้เท่านั้น · เปลี่ยนใหม่ทุกวันเวลา 00:00",
      weeklyFeatured: "ดีลประจำสัปดาห์",
      weeklyFeaturedHelp: "สินค้าเด่นลดพิเศษ 20–50% เฉพาะ Weekly Shop · มีโอกาสเจอดีลใหญ่ 50% · เปลี่ยนดีลใหม่ทุกวันจันทร์",
      finaleCollection: "Internship Finale Collection",
      finaleHelp: "ของ Limited สำหรับช่วงสุดท้ายของ Journey · ซื้อแล้วเก็บไว้ใช้ได้ตลอด",
      finaleEnded: "Finale สิ้นสุดแล้ว",
      limited: "LIMITED",
      featured: "ดีลพิเศษ",
      collected: "สะสมแล้ว",
      owned: "เป็นเจ้าของแล้ว",
      equipped: "กำลังใช้",
      equip: "ใช้",
      buy: "ซื้อ",
      free: "ฟรี",
      insufficient: "Work Coins ไม่เพียงพอ",
      purchased: "ซื้อรางวัลแล้ว",
      equippedToast: "เปลี่ยนรางวัลที่ใช้งานแล้ว",
      coinHistoryEmpty: "ยังไม่มีประวัติ Work Coins",
      coinEarned: "ได้รับ",
      coinSpent: "ใช้",
      retroAwarded: "ให้รางวัลย้อนหลังจากความคืบหน้าเดิมแล้ว +{coins} Coins",
      retroNothing: "ตรวจสอบรางวัลย้อนหลังเรียบร้อยแล้ว",
      balanceLabel: "ยอดคงเหลือ",
      defaultTheme: "ค่าเริ่มต้น",
      noneEffect: "ไม่มี Effect",
      rewardLocked: "ยังไม่ได้ซื้อ",
      purchaseConfirm: "ใช้ {coins} Coins เพื่อซื้อ {name}?",
      workdayComplete: "Completed Workday",
      journalEntry: "Daily Journal",
      projectComplete: "Project Completed",
      achievementReward: "Achievement",
      migrationReward: "Legacy progress",
      themeSakura: "Sakura",
      themeSakuraDesc: "เปลี่ยนทั้งหน้าเป็นบรรยากาศซากุระ ชมพูละมุนพร้อมกลีบดอกไม้เคลื่อนไหว",
      themeAurora: "Aurora",
      themeAuroraDesc: "Aurora เต็มหน้าจอพร้อมแสงสีฟ้า เขียว และม่วงที่เคลื่อนไหวอย่างนุ่มนวล",
      themeGolden: "Golden",
      themeGoldenDesc: "บรรยากาศทองเต็มหน้า พร้อมแสงและประกายแบบ Legendary Journey",
      effectSparkle: "Profile Sparkle",
      effectSparkleDesc: "ประกายดาวลอยทั่วหน้าจอ พร้อมแสงวิบวับรอบ Profile และ Mascot",
      effectHalo: "Soft Halo",
      effectHaloDesc: "วง Aurora Halo เคลื่อนไหวรอบหน้า พร้อมแสงพิเศษรอบ Profile และ Mascot",
      effectCelebration: "Celebration Aura",
      effectCelebrationDesc: "เอฟเฟกต์ฉลองเต็มหน้าจอ มี confetti แสง และประกายรอบ Profile กับ Mascot",
      chick: "Default Chick",
      cat: "Office Cat",
      bear: "Sleepy Bear",
      bunny: "Working Bunny",
      ghost: "Office Ghost"
    },
    en: {
      rewards: "Rewards",
      rewardsSub: "Mascots, accessories, frames, themes, effects and Work Coins",
      shopTitle: "Reward Shop",
      shopHelp: "Use Work Coins to personalize your Journey with Mascots, Accessories, Profile Frames, Premium Themes and Effects",
      coinBalance: "Work Coins",
      lifetimeEarned: "Lifetime earned",
      lifetimeSpent: "Lifetime spent",
      retroTitle: "V8.2 Coin Economy Rebalance",
      retroHelp: "V8.2 rebalances Coin rewards and automatically tops up previous Workdays, Journals, Projects and Achievements, plus Daily Missions and Chests",
      howToEarn: "How to earn Coins",
      earnWorkday: "Complete a workday",
      earnJournal: "Write a Daily Journal",
      earnProject: "Complete a Project at 100%",
      earnAchievement: "Achievement",
      common: "Common",
      rare: "Rare",
      epic: "Epic",
      legendary: "Legendary",
      mascots: "Mascots",
      themes: "Themes",
      effects: "Effects",
      accessories: "Accessories",
      frames: "Profile Frames",
      history: "Coin History",
      collection: "Collection",
      dailyFeatured: "Daily Deals",
      dailyFeaturedHelp: "Three rewards are 15–40% off today only · refreshes every day at 00:00",
      weeklyFeatured: "Weekly Deals Rotation",
      weeklyFeaturedHelp: "Weekly deals are 20–50% off here · rare 50% mega deals can appear · rotates every Monday",
      finaleCollection: "Internship Finale Collection",
      finaleHelp: "Limited rewards for the final stretch of your Journey · owned items remain usable forever",
      finaleEnded: "Finale ended",
      limited: "LIMITED",
      featured: "FEATURED",
      collected: "Collected",
      owned: "Owned",
      equipped: "Equipped",
      equip: "Equip",
      buy: "Buy",
      free: "Free",
      insufficient: "Not enough Work Coins",
      purchased: "Reward purchased",
      equippedToast: "Reward equipped",
      coinHistoryEmpty: "No Work Coin history yet",
      coinEarned: "Earned",
      coinSpent: "Spent",
      retroAwarded: "Previous progress rewarded +{coins} Coins",
      retroNothing: "Previous rewards checked",
      balanceLabel: "Balance",
      defaultTheme: "Default",
      noneEffect: "No Effect",
      rewardLocked: "Not purchased",
      purchaseConfirm: "Spend {coins} Coins to buy {name}?",
      workdayComplete: "Completed Workday",
      journalEntry: "Daily Journal",
      projectComplete: "Project Completed",
      achievementReward: "Achievement",
      migrationReward: "Legacy progress",
      themeSakura: "Sakura",
      themeSakuraDesc: "A full-page sakura atmosphere with soft pink gradients and drifting petals",
      themeAurora: "Aurora",
      themeAuroraDesc: "A full-screen animated aurora with blue, green and violet light",
      themeGolden: "Golden",
      themeGoldenDesc: "A full-page golden atmosphere with legendary light and shimmer",
      effectSparkle: "Profile Sparkle",
      effectSparkleDesc: "Floating stars across the screen with extra sparkle around Profile and Mascot",
      effectHalo: "Soft Halo",
      effectHaloDesc: "Animated aurora halo waves plus a luminous Profile and Mascot",
      effectCelebration: "Celebration Aura",
      effectCelebrationDesc: "Full-screen celebration confetti, glow and a festive Profile and Mascot aura",
      chick: "Default Chick",
      cat: "Office Cat",
      bear: "Sleepy Bear",
      bunny: "Working Bunny",
      ghost: "Office Ghost"
    }
  };
  const t = (key, vars={}) => {
    let out = TEXT[lang()][key] || TEXT.en[key] || key;
    Object.entries(vars).forEach(([k,v]) => out = out.replaceAll(`{${k}}`, String(v)));
    return out;
  };

  const MASCOTS = [
    { id:"chick", type:"mascot", price:0, emoji:"🐣", nameKey:"chick", accent:"#f7c948", rarity:"common" },
    { id:"cat", type:"mascot", price:100, emoji:"🐱", nameKey:"cat", accent:"#f0a35e", rarity:"common" },
    { id:"bear", type:"mascot", price:200, emoji:"🐻", nameKey:"bear", accent:"#b78560", rarity:"rare" },
    { id:"bunny", type:"mascot", price:300, emoji:"🐰", nameKey:"bunny", accent:"#ef88bd", rarity:"rare" },
    { id:"ghost", type:"mascot", price:500, emoji:"👻", nameKey:"ghost", accent:"#9d8cff", rarity:"epic" },
    { id:"hamster", type:"mascot", price:450, emoji:"🐹", th:"Coffee Hamster", en:"Coffee Hamster", accent:"#bf7b4a", rarity:"rare" },
    { id:"fox", type:"mascot", price:650, emoji:"🦊", th:"Coding Fox", en:"Coding Fox", accent:"#f28a38", rarity:"epic" },
    { id:"penguin", type:"mascot", price:900, emoji:"🐧", th:"Executive Penguin", en:"Executive Penguin", accent:"#4678b8", rarity:"epic" },
    { id:"dragon", type:"mascot", price:1500, emoji:"🐉", th:"Journey Dragon", en:"Journey Dragon", accent:"#8b64ef", rarity:"legendary", finale:true },
    { id:"developerChick", type:"mascot", price:-1, emoji:"🐥", th:"Developer Chick", en:"Developer Chick", accent:"#3b82f6", rarity:"legendary", codeExclusive:true, descTh:"Mascot ลับสำหรับ Reward Code และ Owner Event เท่านั้น", descEn:"A secret Mascot available only through Reward Codes and Owner events" }
  ];
  const THEMES = [
    { id:"default", type:"theme", price:0, icon:"◐", nameKey:"defaultTheme", descKey:"defaultTheme", rarity:"common" },
    { id:"sakura", type:"theme", price:150, icon:"🌸", nameKey:"themeSakura", descKey:"themeSakuraDesc", rarity:"rare" },
    { id:"aurora", type:"theme", price:250, icon:"🌌", nameKey:"themeAurora", descKey:"themeAuroraDesc", rarity:"epic" },
    { id:"golden", type:"theme", price:400, icon:"✨", nameKey:"themeGolden", descKey:"themeGoldenDesc", rarity:"epic" },
    { id:"midnight", type:"theme", price:400, icon:"🌙", th:"Midnight Office", en:"Midnight Office", descTh:"โทนน้ำเงินเที่ยงคืนเต็มหน้า พร้อมแสงเมืองและประกาย Office Night", descEn:"A full-page midnight-blue office atmosphere with city glow and subtle night lights", rarity:"rare" },
    { id:"sakuraNight", type:"theme", price:600, icon:"🌸", th:"Sakura Night", en:"Sakura Night", descTh:"ซากุระยามค่ำคืน โทนม่วงชมพูเข้มพร้อมกลีบดอกไม้เรืองแสง", descEn:"Night sakura in deep violet and pink with glowing drifting petals", rarity:"epic" },
    { id:"auroraGalaxy", type:"theme", price:900, icon:"🪐", th:"Aurora Galaxy", en:"Aurora Galaxy", descTh:"ออโรราผสมกาแล็กซีเต็มจอ มีดาวและเนบิวลาเคลื่อนไหวแบบ Premium", descEn:"Premium full-screen aurora galaxy with stars, nebula light and animated depth", rarity:"legendary" },
    { id:"goldenExecutive", type:"theme", price:1200, icon:"🏆", th:"Golden Executive", en:"Golden Executive", descTh:"Theme Finale สีดำทองหรู พร้อมแสงทองพาดผ่านและบรรยากาศ Legendary", descEn:"A luxurious finale black-and-gold theme with sweeping golden light", rarity:"legendary", finale:true },
    { id:"secretGalaxy", type:"theme", price:-1, icon:"🌠", th:"Secret Galaxy", en:"Secret Galaxy", descTh:"Theme ลับโทน Cosmic Blue / Violet สำหรับผู้ได้รับ Reward Code", descEn:"A code-exclusive cosmic blue and violet theme", rarity:"legendary", codeExclusive:true }
  ];
  const EFFECTS = [
    { id:"none", type:"effect", price:0, icon:"○", nameKey:"noneEffect", descKey:"noneEffect", rarity:"common" },
    { id:"sparkle", type:"effect", price:120, icon:"✦", nameKey:"effectSparkle", descKey:"effectSparkleDesc", rarity:"common" },
    { id:"halo", type:"effect", price:200, icon:"◉", nameKey:"effectHalo", descKey:"effectHaloDesc", rarity:"rare" },
    { id:"celebration", type:"effect", price:350, icon:"🎉", nameKey:"effectCelebration", descKey:"effectCelebrationDesc", rarity:"rare" },
    { id:"fallingStars", type:"effect", price:350, icon:"🌠", th:"Falling Stars", en:"Falling Stars", descTh:"ดาวตกพาดผ่านหน้าจอเป็นระยะ พร้อมประกายแสงบาง ๆ รอบ Journey", descEn:"Shooting stars sweep across the screen with a soft luminous trail", rarity:"rare" },
    { id:"fireflies", type:"effect", price:500, icon:"✨", th:"Fireflies", en:"Fireflies", descTh:"หิ่งห้อยเรืองแสงลอยรอบหน้าจอแบบนุ่มนวล ดูสงบแต่โดดเด่น", descEn:"Soft glowing fireflies drift around the screen for a calm premium atmosphere", rarity:"epic" },
    { id:"galaxyTrail", type:"effect", price:750, icon:"💫", th:"Galaxy Trail", en:"Galaxy Trail", descTh:"อนุภาคกาแล็กซีหมุนและไหลผ่านหน้าจอ พร้อมแสงสีม่วงน้ำเงิน", descEn:"Galaxy particles orbit and flow across the screen with violet-blue light", rarity:"epic" },
    { id:"legendaryCelebration", type:"effect", price:1000, icon:"👑", th:"Legendary Celebration", en:"Legendary Celebration", descTh:"Finale Effect ระดับ Legendary: ดาว แสง วง Aura และ Confetti เต็มหน้าจอ", descEn:"Legendary finale effect with stars, aura rings, light bursts and full-screen confetti", rarity:"legendary", finale:true },
    { id:"coinRain", type:"effect", price:-1, icon:"🪙", th:"Coin Rain", en:"Coin Rain", descTh:"ฝน Work Coins ลอยลงทั่วหน้าจอแบบ Code Exclusive", descEn:"A code-exclusive shower of animated Work Coins", rarity:"legendary", codeExclusive:true }
  ];
  const ACCESSORIES = [
    { id:"none", type:"accessory", price:0, icon:"○", th:"No Accessory", en:"No Accessory", descTh:"ใช้ Accessory ตามสถานะ Workday แบบเดิม", descEn:"Use the default Workday-state accessory", rarity:"common" },
    { id:"glasses", type:"accessory", price:120, icon:"👓", th:"Office Glasses", en:"Office Glasses", descTh:"แว่นออฟฟิศสำหรับ Mascot ที่อยากดูจริงจังขึ้นอีกนิด", descEn:"Office glasses for a smarter, focused Mascot look", rarity:"common" },
    { id:"headphones", type:"accessory", price:180, icon:"🎧", th:"Focus Headphones", en:"Focus Headphones", descTh:"หูฟังโหมด Focus แสดงบน Mascot และ Avatar ที่ใช้ Mascot", descEn:"Focus headphones shown on your Mascot and Mascot avatar", rarity:"rare" },
    { id:"laptop", type:"accessory", price:250, icon:"💻", th:"Work Laptop", en:"Work Laptop", descTh:"Laptop คู่ใจสำหรับโหมดทำงานจริงจังของ Mascot", descEn:"A work laptop companion for your productive Mascot", rarity:"rare" },
    { id:"crown", type:"accessory", price:500, icon:"👑", th:"Journey Crown", en:"Journey Crown", descTh:"มงกุฎ Limited สำหรับช่วง Finale ของ Workday Journey", descEn:"A limited crown made for the Workday Journey finale", rarity:"legendary", finale:true },
    { id:"developerCrown", type:"accessory", price:-1, icon:"🛠️", th:"Developer Crown", en:"Developer Crown", descTh:"Accessory ลับสำหรับ Owner Pack และ Reward Code", descEn:"A secret accessory for Owner Packs and Reward Codes", rarity:"legendary", codeExclusive:true }
  ];
  const FRAMES = [
    { id:"none", type:"frame", price:0, icon:"○", th:"No Frame", en:"No Frame", descTh:"ใช้กรอบ Profile แบบมาตรฐาน", descEn:"Use the standard profile avatar frame", rarity:"common" },
    { id:"neonBlue", type:"frame", price:200, icon:"🔵", th:"Neon Blue Frame", en:"Neon Blue Frame", descTh:"กรอบ Neon สีฟ้า แสดงที่ Avatar ใน Sidebar, Topbar และ Profile", descEn:"Blue neon frame shown on Sidebar, Topbar and Profile avatars", rarity:"common" },
    { id:"sakuraFrame", type:"frame", price:300, icon:"🌸", th:"Sakura Frame", en:"Sakura Frame", descTh:"กรอบชมพูซากุระพร้อม Glow เบา ๆ รอบ Avatar", descEn:"Sakura-pink profile frame with a soft glow", rarity:"rare" },
    { id:"auroraFrame", type:"frame", price:450, icon:"🌌", th:"Aurora Frame", en:"Aurora Frame", descTh:"กรอบ Aurora ไล่สีพร้อมแสงเคลื่อนไหวรอบ Profile", descEn:"Animated aurora gradient frame around your profile avatar", rarity:"epic" },
    { id:"championGold", type:"frame", price:750, icon:"🏆", th:"Journey Champion Frame", en:"Journey Champion Frame", descTh:"กรอบทอง Legendary รุ่น Finale สำหรับโชว์ Journey ช่วงสุดท้าย", descEn:"Legendary gold finale frame for your completed Journey", rarity:"legendary", finale:true },
    { id:"founderFrame", type:"frame", price:-1, icon:"🔷", th:"Founder Frame", en:"Founder Frame", descTh:"กรอบ Profile Code Exclusive สำหรับกิจกรรมพิเศษและผู้ร่วม Journey รุ่นแรก", descEn:"A code-exclusive profile frame for special events and early Journey users", rarity:"legendary", codeExclusive:true }
  ];
  const ALL_REWARDS = [...MASCOTS, ...ACCESSORIES, ...FRAMES, ...THEMES, ...EFFECTS];

  const MASCOT_PERSONAS = {
    chick: {
      th:{before:"ยังไม่ถึงเวลาเริ่มงาน พักอีกนิดนะ",start:"เพิ่งเริ่มเอง ค่อย ๆ ลุยไปด้วยกัน!",work:"กำลังไปได้สวย ลุยกันต่อ!",half:"ผ่านครึ่งทางแล้ว! เก่งมาก",almost:"อีกนิดเดียววว เตรียมตัวฉลอง!",break:"พักก่อนนะ เดี๋ยวค่อยกลับมาลุยต่อ",done:"100% แล้ว วันนี้สำเร็จ!",rest:"วันนี้เป็นวันพัก เติมพลังให้เต็มที่",holiday:"วันหยุดบริษัท วันนี้พักให้เต็มที่",leave:"วันนี้เป็นวันลา ดูแลตัวเองนะ",journeyDone:"Journey สำเร็จแล้ว! ภูมิใจมาก"},
      en:{before:"Work has not started yet. Rest a little longer",start:"Just getting started. Let’s ease into it!",work:"Looking good — keep going!",half:"Halfway there! Nice work",almost:"Almost there — celebration is close!",break:"Take a break. We’ll get back to it soon",done:"100% — today is complete!",rest:"Rest day today. Recharge your energy",holiday:"Company holiday — enjoy the day off",leave:"Leave day today. Take good care of yourself",journeyDone:"Journey complete! So proud of you"}
    },
    cat: {
      th:{before:"ขออีก 5 นาที... แล้วค่อยเริ่ม เมี้ยว",start:"เปิดโหมดออฟฟิศแล้ว เมี้ยว!",work:"งานกำลังไหลลื่น อย่าหยุดนะ",half:"ครึ่งวันแล้ว กาแฟมา งานไปต่อ",almost:"อย่าพึ่งปิดจอ อีกนิดเดียวเอง",break:"พักสายตาก่อน เมี้ยวขอจิบกาแฟ",done:"ปิดจอได้แล้ว เจ้าทาสกลับบ้าน!",rest:"วันนี้แมวขอเฝ้าโซฟาแทนโต๊ะทำงาน",holiday:"วันหยุด! แมวประกาศงดประชุม",leave:"วันนี้พักนะ งานไว้พรุ่งนี้ค่อยว่ากัน",journeyDone:"ภารกิจเสร็จสิ้น แมวอนุมัติให้เป็นตำนาน"},
      en:{before:"Five more minutes… then we start, meow",start:"Office mode activated, meow!",work:"The work is flowing — keep it moving",half:"Halfway. Coffee first, then onward",almost:"Don’t close the laptop yet — almost there",break:"Eye break. The cat is getting coffee",done:"Laptop closed. Human may go home!",rest:"The cat is guarding the sofa today",holiday:"Holiday! Meetings officially cancelled",leave:"Rest today. Tomorrow can handle the work",journeyDone:"Mission complete. The cat approves your legend"}
    },
    bear: {
      th:{before:"ยังง่วงอยู่เลย... ขอหมีพักต่ออีกหน่อย",start:"โอเค ตื่นแล้ว เริ่มช้า ๆ ก็ได้",work:"หมีตื่นเต็มตาแล้ว ลุยต่อกัน",half:"ครึ่งทางแล้ว ขอของหวานนิดนึง",almost:"ใกล้เลิกแล้ว หมีเริ่มเก็บของ",break:"เวลาพักคือเวลาศักดิ์สิทธิ์ของหมี",done:"เสร็จแล้ว! กลับไปนอนกัน",rest:"วันนี้โหมดจำศีลเต็มรูปแบบ",holiday:"Holiday = Hibernation Day",leave:"พักให้เต็มที่ หมีเฝ้า Journey ให้เอง",journeyDone:"ตื่นจากจำศีลมาเจอ 100% พอดี!"},
      en:{before:"Still sleepy… the bear needs a little longer",start:"Okay, awake now. Slow start is fine",work:"Fully awake — let’s keep going",half:"Halfway. A snack sounds deserved",almost:"Almost done. The bear is packing up",break:"Break time is sacred bear time",done:"Done! Time to go home and sleep",rest:"Full hibernation mode today",holiday:"Holiday = Hibernation Day",leave:"Rest well. The bear will watch the Journey",journeyDone:"Woke up from hibernation to a perfect 100%!"}
    },
    bunny: {
      th:{before:"พร้อมเด้งแล้ว! รอเวลาเริ่มนิดเดียว",start:"ไปกันนน! เริ่มวันแบบพลังเต็มร้อย",work:"เร็วเข้า เรากำลังไปได้สวย!",half:"เย้! ผ่านครึ่งทางแล้ว!",almost:"อีกนิดเดียวววว เด้งเข้าเส้นชัยเลย!",break:"พักแป๊บเดียว เดี๋ยวกลับมาวิ่งต่อ",done:"เข้าเส้นชัยแล้ววว! 100% 🎉",rest:"วันพักก็ต้องพักให้สุดนะ!",holiday:"Holiday! กระต่ายออกไปเที่ยวแล้ว",leave:"วันนี้พักก่อน พรุ่งนี้ค่อยเด้งต่อ",journeyDone:"สุดยอด! Journey นี้เข้าเส้นชัยแล้ว!"},
      en:{before:"Ready to bounce! Just waiting for start time",start:"Let’s gooo! Full energy start",work:"Keep moving — we’re doing great!",half:"Yes! Halfway there!",almost:"So close! Bounce to the finish line!",break:"Quick break, then we sprint again",done:"Finish line reached! 100% 🎉",rest:"A rest day deserves full rest!",holiday:"Holiday! Bunny is out exploring",leave:"Rest today. Bounce again tomorrow",journeyDone:"Amazing! This Journey crossed the finish line!"}
    },
    ghost: {
      th:{before:"ยังไม่มีใครในออฟฟิศ... ดีจัง 👻",start:"เริ่มงานแล้วเหรอ... ผีมารออยู่ก่อนแล้ว",work:"ทำต่อไปนะ ผีคอยมองอยู่ 👀",half:"ครึ่งวันแล้ว... ยังรอดอยู่ใช่มั้ย",almost:"ใกล้กลับแล้ว แต่ผียังไม่กลับนะ",break:"พักเถอะ เดี๋ยวผีเฝ้างานให้",done:"100% แล้ว... หนีออกจากออฟฟิศได้!",rest:"วันนี้ออฟฟิศเงียบถูกใจผีมาก",holiday:"ไม่มีคนมาเลย... Perfect 👻",leave:"พักไปเถอะ ผีลงเวลาแทนไม่ได้หรอก",journeyDone:"Journey จบแล้ว... แต่ตำนานยังหลอกหลอนต่อ"},
      en:{before:"Nobody is in the office yet… perfect 👻",start:"Starting work? The ghost was already here",work:"Keep going. The ghost is watching 👀",half:"Halfway… you’re still alive, right?",almost:"Almost home. The ghost is staying though",break:"Go rest. The ghost will watch the desk",done:"100%… escape the office now!",rest:"A quiet office. Exactly how the ghost likes it",holiday:"Nobody came in… perfect 👻",leave:"Rest. The ghost cannot clock in for you",journeyDone:"Journey complete… but the legend still haunts the office"}
    }
  };


  Object.assign(MASCOT_PERSONAS, {
    hamster:{
      th:{before:"กาแฟยังไม่มา ขอหมุนวงล้อรอก่อน ☕",start:"กาแฟพร้อม! เริ่มงานได้แล้ว",work:"จิบกาแฟหนึ่งที แล้วลุยต่อ!",half:"ครึ่งวันแล้ว เติมกาแฟได้หนึ่งแก้ว",almost:"เหลืออีกนิดเดียว เก็บแก้วเตรียมกลับ!",break:"พักก่อน แฮมสเตอร์ขอเติมคาเฟอีน",done:"งานครบวันแล้ว! กาแฟหมดพอดี 🎉",rest:"วันพัก = วันสะสมเมล็ดกาแฟ",holiday:"Holiday! ร้านกาแฟเปิดไหมนะ",leave:"วันนี้พักก่อน เดี๋ยวแฮมสเตอร์เฝ้าแก้วให้",journeyDone:"Journey จบแล้ว! แก้วสุดท้ายฉลองกัน ☕🏆"},
      en:{before:"Coffee is not ready yet — wheel-spin while we wait",start:"Coffee ready. Work mode on!",work:"One sip, then keep going!",half:"Halfway — another coffee is justified",almost:"Almost done. Pack the mug!",break:"Break time. Hamster needs caffeine",done:"Full workday complete — perfect timing 🎉",rest:"Rest day = coffee bean collection day",holiday:"Holiday! Is the cafe open?",leave:"Rest today. The hamster will guard the mug",journeyDone:"Journey complete — one last victory coffee ☕🏆"}
    },
    fox:{
      th:{before:"ยังไม่เปิด IDE... รอเวลาเริ่มก่อน",start:"Boot ระบบแล้ว เริ่มเขียนโค้ดได้",work:"โค้ดกำลังไหล อย่าลืม save!",half:"ผ่านครึ่งทางแล้ว ไม่มี bug ก็ถือว่าชนะ",almost:"อีกนิดเดียว commit แล้วกลับบ้าน!",break:"พักสายตาจากหน้าจอก่อน",done:"Build ผ่าน! วันนี้ deploy สำเร็จ 🎉",rest:"วันนี้ไม่ merge อะไรทั้งนั้น",holiday:"Holiday branch activated",leave:"พักก่อน เดี๋ยว bug รอได้",journeyDone:"Final build complete. Journey deployed! 🚀"},
      en:{before:"IDE still closed — waiting for start time",start:"System booted. Time to code",work:"Code is flowing — remember to save",half:"Halfway. No bugs yet counts as a win",almost:"One last commit, then home",break:"Eyes off the screen for a bit",done:"Build passed. Today deployed successfully 🎉",rest:"No merges today",holiday:"Holiday branch activated",leave:"Rest first. Bugs can wait",journeyDone:"Final build complete. Journey deployed! 🚀"}
    },
    penguin:{
      th:{before:"Executive ยังไม่เข้าห้องประชุม",start:"Agenda พร้อม เริ่มวันอย่างมืออาชีพ",work:"เดินตามแผนต่อ ทุกอย่างอยู่ในการควบคุม",half:"Midday review ผ่านเรียบร้อย",almost:"เหลือ Final Check ก่อนปิดวัน",break:"พักตามตาราง แล้วกลับมาคมกว่าเดิม",done:"Agenda วันนี้ Complete 100%",rest:"วันนี้ไม่มี Meeting ใน Calendar",holiday:"Board อนุมัติวันหยุดแล้ว",leave:"Leave Approved. พักได้เต็มที่",journeyDone:"Journey Closed Successfully. Excellent work."},
      en:{before:"The executive has not entered the meeting room yet",start:"Agenda ready. Start the day professionally",work:"Stay on plan — everything is under control",half:"Midday review completed",almost:"One final check before closing the day",break:"Scheduled break, then return sharper",done:"Today's agenda is 100% complete",rest:"No meetings on the calendar today",holiday:"The board approved the holiday",leave:"Leave approved. Rest well",journeyDone:"Journey closed successfully. Excellent work."}
    },
    dragon:{
      th:{before:"ตำนานยังหลับอยู่... รอเวลาแห่ง Journey",start:"เปลวไฟแรกของวันนี้ถูกจุดแล้ว",work:"พลัง Journey กำลังเพิ่มขึ้น ลุยต่อ!",half:"ครึ่งทางแล้ว เปลวไฟยิ่งสว่างขึ้น",almost:"ประตูสุดท้ายอยู่ตรงหน้า!",break:"แม้มังกรก็ต้องพักเพื่อสะสมพลัง",done:"วันนี้พิชิตแล้ว! Legendary Finish 🐉",rest:"มังกรเฝ้าสมบัติในวันพัก",holiday:"อาณาจักรประกาศวันหยุด",leave:"พักเพื่อกลับมาแข็งแกร่งกว่าเดิม",journeyDone:"ตำนานสมบูรณ์แล้ว — คุณคือ Journey Legend 👑"},
      en:{before:"The legend still sleeps… waiting for Journey time",start:"Today's first flame has been lit",work:"Journey power is rising — keep going",half:"Halfway. The flame burns brighter",almost:"The final gate is right ahead",break:"Even dragons rest to rebuild power",done:"Today conquered — Legendary Finish 🐉",rest:"The dragon guards the treasure on rest days",holiday:"The kingdom declared a holiday",leave:"Rest and return stronger",journeyDone:"The legend is complete — you are a Journey Legend 👑"}
    },
    developerChick:{
      th:{before:"ระบบพร้อมแล้ว รอเวลาเริ่ม Journey 🧑‍💻",start:"Boot complete! เริ่มสร้างวันนี้กัน",work:"เขียน Journey ต่อทีละ Commit",half:"ครึ่งวันแล้ว Build ยังเขียวอยู่!",almost:"อีกนิดเดียว เตรียม Deploy วันนี้",break:"พักก่อน เดี๋ยว Chick เฝ้า Console ให้",done:"Deploy วันนี้สำเร็จ 100% 🚀",rest:"Maintenance day — พักระบบบ้าง",holiday:"Production ปิดวันนี้ พักได้เต็มที่",leave:"พักก่อน เดี๋ยวงานค่อยกลับมาแก้",journeyDone:"Final release shipped. Journey complete! 🐥🚀"},
      en:{before:"System ready — waiting for Journey start",start:"Boot complete. Let's build today",work:"Keep committing progress one step at a time",half:"Halfway and the build is still green",almost:"Almost there — prepare today's deploy",break:"Take a break. Chick will watch the console",done:"Today's deploy completed 100% 🚀",rest:"Maintenance day — systems need rest too",holiday:"Production is closed today. Enjoy the break",leave:"Rest first. The work can wait",journeyDone:"Final release shipped. Journey complete! 🐥🚀"}
    }
  });

  function toast(icon, message, type="info") {
    const stack = $("toastStack");
    if (!stack) return;
    const node = document.createElement("div");
    node.className = `app-toast v7-toast toast-${type}`;
    node.innerHTML = `<span>${icon}</span><div><strong>${esc(message)}</strong></div>`;
    stack.appendChild(node);
    setTimeout(() => { node.classList.add("out"); setTimeout(() => node.remove(), 250); }, 3600);
  }

  function ledger() {
    const list = read(KEYS.ledger, []);
    return Array.isArray(list) ? list : [];
  }
  function ownedRewards() {
    const list = read(KEYS.owned, []);
    const set = new Set(Array.isArray(list) ? list : []);
    set.add("mascot:chick"); set.add("theme:default"); set.add("effect:none"); set.add("accessory:none"); set.add("frame:none");
    return set;
  }
  function saveOwned(set) { write(KEYS.owned, [...set]); }
  function balance(list = ledger()) { return Math.round(list.reduce((sum, item) => sum + Number(item?.amount || 0), 0)); }
  function lifetimeEarned(list = ledger()) { return Math.round(list.reduce((sum, item) => sum + Math.max(0, Number(item?.amount || 0)), 0)); }
  function lifetimeSpent(list = ledger()) { return Math.round(Math.abs(list.reduce((sum, item) => sum + Math.min(0, Number(item?.amount || 0)), 0))); }
  function rewardKey(reward) { return `${reward.type}:${reward.id}`; }
  function rewardBy(type,id) { return ALL_REWARDS.find(r => r.type === type && r.id === id); }
  function selectedMascotId() {
    const id = localStorage.getItem(KEYS.mascot) || "chick";
    return ownedRewards().has(`mascot:${id}`) && rewardBy("mascot", id) ? id : "chick";
  }
  function selectedThemeId() {
    const id = localStorage.getItem(KEYS.theme) || "default";
    return ownedRewards().has(`theme:${id}`) && rewardBy("theme", id) ? id : "default";
  }
  function selectedEffectId() {
    const id = localStorage.getItem(KEYS.effect) || "none";
    return ownedRewards().has(`effect:${id}`) && rewardBy("effect", id) ? id : "none";
  }
  function selectedAccessoryId() {
    const id = localStorage.getItem(KEYS.accessory) || "none";
    return ownedRewards().has(`accessory:${id}`) && rewardBy("accessory", id) ? id : "none";
  }
  function selectedFrameId() {
    const id = localStorage.getItem(KEYS.frame) || "none";
    return ownedRewards().has(`frame:${id}`) && rewardBy("frame", id) ? id : "none";
  }

  function stableHash(text) {
    let h = 2166136261;
    for (const c of String(text || "")) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  }
  function isoFromDateKey(key, fallback = new Date().toISOString()) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key || ""));
    if (!m) return fallback;
    return new Date(Number(m[1]), Number(m[2])-1, Number(m[3]), 18, 0, 0).toISOString();
  }
  function dateKey(date) { return API.dateKey(date); }
  function dateFromKey(key) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key || ""));
    return m ? new Date(Number(m[1]), Number(m[2])-1, Number(m[3])) : new Date();
  }
  function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate()+n); return d; }
  function sameDay(a,b) { return dateKey(a) === dateKey(b); }

  function candidateEvents() {
    const events = [];
    const now = API.getNow();
    const cfg = API.getConfig();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = dateFromKey(cfg.startDate), end = dateFromKey(cfg.endDate);
    const last = today < end ? today : end;

    for (let d = new Date(start); d <= last; d = addDays(d,1)) {
      const scheduled = Number(API.getScheduledMinutes(d) || 0);
      if (scheduled <= 0) continue;
      const leave = Number(API.getLeaveMinutes(d) || 0);
      const worked = Number(API.getWorkedMinutes(d, now) || 0);
      if (leave <= .001 && worked >= scheduled - .001) {
        const key = dateKey(d);
        events.push({ id:`earn:workday:${key}`, amount:ECONOMY.workday, type:"workday", labelTh:`${t("workdayComplete")} · ${key}`, labelEn:`Completed Workday · ${key}`, createdAt:isoFromDateKey(key), meta:{date:key} });
      }
    }

    const journals = read("wp-v6-journal", {});
    if (journals && typeof journals === "object" && !Array.isArray(journals)) {
      Object.entries(journals).forEach(([key, entry]) => {
        events.push({ id:`earn:journal:${key}`, amount:ECONOMY.journal, type:"journal", labelTh:`${t("journalEntry")} · ${key}`, labelEn:`Daily Journal · ${key}`, createdAt:entry?.updatedAt || entry?.createdAt || isoFromDateKey(key), meta:{date:key} });
      });
    }

    const projects = read("wp-v6-projects", []);
    if (Array.isArray(projects)) projects.forEach((project, index) => {
      if (Number(project?.progress || 0) < 100) return;
      const pid = project?.id || `legacy-${stableHash(`${project?.name||"project"}|${project?.createdAt||index}`)}`;
      const name = String(project?.name || "Project");
      events.push({ id:`earn:project:${pid}`, amount:ECONOMY.project, type:"project", labelTh:`${t("projectComplete")} · ${name}`, labelEn:`Project Completed · ${name}`, createdAt:project?.updatedAt || project?.createdAt || new Date().toISOString(), meta:{projectId:pid,name} });
    });

    const achievements = API.getAchievements(API.getStats(now));
    achievements.filter(a => a.unlocked).forEach(a => {
      const tier = String(a.tier || "common").toLowerCase();
      const amount = Math.max(1,Math.round(Number(a.coinReward)||TIER_COINS[tier]||5));
      const name = API.translate(a.titleKey) || a.id;
      events.push({ id:`earn:achievement:${a.id}`, amount, type:"achievement", labelTh:`${t("achievementReward")} · ${name}`, labelEn:`Achievement · ${name}`, createdAt:a.unlockedAt || new Date().toISOString(), meta:{achievementId:a.id,tier,name,rewardAmount:amount,category:a.category||""} });
    });
    return events;
  }

  function coreTargetAmount(item) {
    if (!item) return 0;
    if (item.type === "workday" || String(item.id||"").startsWith("earn:workday:")) return ECONOMY.workday;
    if (item.type === "journal" || String(item.id||"").startsWith("earn:journal:")) return ECONOMY.journal;
    if (item.type === "project" || String(item.id||"").startsWith("earn:project:")) return ECONOMY.project;
    if (item.type === "achievement" || String(item.id||"").startsWith("earn:achievement:")) return Math.max(1,Math.round(Number(item.meta?.rewardAmount)||TIER_COINS[String(item.meta?.tier||"common").toLowerCase()]||TIER_COINS.common));
    return 0;
  }

  function rebalanceEvents(list) {
    const ids = new Set(list.map(item=>item.id));
    return list.flatMap(item => {
      const target = coreTargetAmount(item), current = Number(item?.amount||0);
      if (target <= current || current < 0) return [];
      const id = `rebalance:v82:${item.id}`;
      if (ids.has(id)) return [];
      const diff = Math.round(target-current);
      return [{id,amount:diff,type:"rebalance",labelTh:`V8.2 Rebalance · ${historyLabel(item)}`,labelEn:`V8.2 Rebalance · ${item.labelEn||item.labelTh||item.id}`,createdAt:new Date().toISOString(),meta:{sourceId:item.id,targetAmount:target,oldAmount:current}}];
    });
  }

  let reconcileBusy = false;
  async function reconcileRewards({notify=true}={}) {
    if (reconcileBusy) return {added:0,count:0};
    reconcileBusy = true;
    try {
      const list = ledger();
      const ids = new Set(list.map(item => item.id));
      const coreAdditions = candidateEvents().filter(item => !ids.has(item.id));
      const provisional = [...list, ...coreAdditions];
      const rebalanceAdditions = rebalanceEvents(provisional).filter(item => !ids.has(item.id) && !coreAdditions.some(x=>x.id===item.id));
      const additions = [...coreAdditions, ...rebalanceAdditions];
      if (additions.length) {
        const next = [...list, ...additions].sort((a,b) => new Date(a.createdAt||0) - new Date(b.createdAt||0));
        write(KEYS.ledger, next);
      }
      const firstRebalance = localStorage.getItem(KEYS.rebalance) !== "done";
      if (firstRebalance) localStorage.setItem(KEYS.rebalance, "done");
      const total = additions.reduce((sum,item)=>sum+Math.max(0,Number(item.amount)||0),0);
      if (notify && additions.length) {
        const msg = firstRebalance
          ? (lang()==="th"?`V8.2 ปรับ Economy + แจกย้อนหลังแล้ว +${total} Coins`:`V8.2 economy rebalance + retro rewards +${total} Coins`)
          : `+${total} ${t("coinBalance")}`;
        toast("🪙", msg, "success");
      }
      refreshAll();
      return {added:total,count:additions.length};
    } finally { reconcileBusy = false; }
  }

  function rewardName(reward) {
    if (!reward) return "";
    const direct = lang()==="th" ? reward.th : reward.en;
    return direct || t(reward.nameKey);
  }
  function rewardDescription(reward) {
    if (!reward) return "";
    const direct = lang()==="th" ? reward.descTh : reward.descEn;
    return direct || (reward.descKey ? t(reward.descKey) : "");
  }
  function rarityName(reward){ return t(reward?.rarity || "common"); }
  function journeyFinaleInfo(){
    const cfg=API.getConfig(), end=dateFromKey(cfg.endDate), now=API.getNow();
    end.setHours(23,59,59,999);
    const ms=end.getTime()-now.getTime(), days=Math.max(0,Math.ceil(ms/86400000));
    return {active:ms>=0,days,end};
  }
  function rewardAvailable(reward){ return !reward?.finale || journeyFinaleInfo().active || isOwned(reward); }
  function isOwned(reward) { return reward.price === 0 || ownedRewards().has(rewardKey(reward)); }
  function isEquipped(reward) {
    if (reward.type === "mascot") return selectedMascotId() === reward.id;
    if (reward.type === "theme") return selectedThemeId() === reward.id;
    if (reward.type === "effect") return selectedEffectId() === reward.id;
    if (reward.type === "accessory") return selectedAccessoryId() === reward.id;
    if (reward.type === "frame") return selectedFrameId() === reward.id;
    return false;
  }
  async function purchaseReward(reward, source="shop") {
    if (!reward || reward.price <= 0 || isOwned(reward)) return;
    if (!rewardAvailable(reward)) { toast("🎓", t("finaleEnded"), "error"); return; }
    const deal = source === "weekly" ? weeklyDealFor(reward) : source === "daily" ? dailyDealFor(reward) : null;
    const payPrice = deal ? deal.price : reward.price;
    const current = balance();
    if (current < payPrice) { toast("🪙", t("insufficient"), "error"); return; }
    const sourceName = source === "daily" ? (lang()==="th"?"ดีลประจำวัน":"Daily Deal") : (lang()==="th"?"ดีลประจำสัปดาห์":"Weekly Deal");
    const confirmText = deal ? (lang()==="th" ? `${sourceName} ลด ${deal.discount}% · ใช้ ${payPrice.toLocaleString()} Coins (ปกติ ${reward.price.toLocaleString()}) เพื่อซื้อ ${rewardName(reward)}?` : `${sourceName} ${deal.discount}% off · Spend ${payPrice.toLocaleString()} Coins (normally ${reward.price.toLocaleString()}) for ${rewardName(reward)}?`) : t("purchaseConfirm", {coins:payPrice,name:rewardName(reward)});
    if (!confirm(confirmText)) return;
    const sec=window.WorkdayEconomySecurity,cloud=window.WorkdayV8Cloud,client=cloud?.getClient?.(),user=cloud?.getUser?.();
    if(client&&user&&sec){
      try{
        await sec.ensureImported();
        const {data,error}=await client.rpc("purchase_reward_secure",{p_reward_type:reward.type,p_reward_id:reward.id,p_source:deal?source:"shop",p_discount_pct:deal?.discount||0});
        if(error)throw error;sec.applyEconomy(data);toast("🎁",deal?`${t("purchased")}: ${rewardName(reward)} · -${deal.discount}%`:`${t("purchased")}: ${rewardName(reward)}`,"success");refreshAll();return;
      }catch(err){toast("🔐",String(err?.message||err).includes("INSUFFICIENT_COINS")?t("insufficient"):(lang()==="th"?"ซื้อไม่สำเร็จ: ระบบ Security ปฏิเสธรายการ":"Purchase rejected by Economy Security"),"error");return;}
    }
    // Local/Guest mode remains device-local. It cannot write protected Economy keys to Cloud Sync.
    const list=ledger(),id=`spend:${reward.type}:${reward.id}`;
    if(!list.some(item=>item.id===id))list.push({id,amount:-payPrice,type:"purchase",labelTh:`ซื้อ ${rewardName(reward)}`,labelEn:`Purchased ${rewardName(reward)}`,createdAt:new Date().toISOString(),meta:{rewardType:reward.type,rewardId:reward.id,source:deal?source:"shop",discountPct:deal?.discount||0,originalPrice:reward.price,paidPrice:payPrice}});
    write(KEYS.ledger,list);const owned=ownedRewards();owned.add(rewardKey(reward));saveOwned(owned);toast("🎁",`${t("purchased")}: ${rewardName(reward)}`,"success");refreshAll();
  }

  function equipReward(reward) {
    if (!reward || !isOwned(reward)) return;
    if (reward.type === "mascot") localStorage.setItem(KEYS.mascot, reward.id);
    if (reward.type === "theme") { localStorage.setItem(KEYS.theme, reward.id); localStorage.removeItem(KEYS.themeTrial); }
    if (reward.type === "effect") localStorage.setItem(KEYS.effect, reward.id);
    if (reward.type === "accessory") localStorage.setItem(KEYS.accessory, reward.id);
    if (reward.type === "frame") localStorage.setItem(KEYS.frame, reward.id);
    applyEquippedRewards(reward.type === "effect");
    flashRewardChange(reward.type);
    toast("✓", `${t("equippedToast")}: ${rewardName(reward)}`, "success");
    refreshAll();
    window.dispatchEvent(new CustomEvent("workday:v7-data-changed"));
  }

  function personaKeyFromState(state) {
    if (state === "journey-done") return "journeyDone";
    if (state === "before") return "before";
    if (state === "rest") return "rest";
    if (state === "break") return "break";
    if (state === "done") return "done";
    if (state === "start") return "start";
    if (state === "half") return "half";
    if (state === "almost") return "almost";
    return "work";
  }
  function mascotPresentation(snapshot={}) {
    const id = selectedMascotId();
    const def = MASCOTS.find(m => m.id === id) || MASCOTS[0];
    const state = snapshot.state || "work";
    let pKey = personaKeyFromState(state);
    const baseKey = String(snapshot.key || "");
    if (baseKey.includes("Holiday")) pKey = "holiday";
    if (baseKey.includes("Leave")) pKey = "leave";
    const copy = MASCOT_PERSONAS[id]?.[lang()] || MASCOT_PERSONAS[id]?.en || MASCOT_PERSONAS.chick[lang()];
    const accessories = {before:"💤",start:"💤",work:"💻",half:"☕",almost:"👀",break:"☕",done:"🎉",rest:"🌿",holiday:"🏡",leave:"🌿",journeyDone:"🏆"};
    const equippedAccessory=rewardBy("accessory",selectedAccessoryId());
    const accessory=equippedAccessory && equippedAccessory.id!=="none" ? equippedAccessory.icon : (accessories[pKey] || snapshot.accessory || "");
    return { id, emoji:def.emoji, name:rewardName(def), message:copy[pKey] || copy.work, accessory, accent:def.accent, accessoryId:selectedAccessoryId(), frameId:selectedFrameId() };
  }

  function ensureRewardVisualLayers() {
    let themeLayer = $("v81ThemeBackdrop");
    if (!themeLayer) {
      themeLayer = document.createElement("div");
      themeLayer.id = "v81ThemeBackdrop";
      themeLayer.className = "v81-theme-backdrop";
      themeLayer.setAttribute("aria-hidden", "true");
      document.body.prepend(themeLayer);
    }
    let effectLayer = $("v81EffectLayer");
    if (!effectLayer) {
      effectLayer = document.createElement("div");
      effectLayer.id = "v81EffectLayer";
      effectLayer.className = "v81-effect-layer";
      effectLayer.setAttribute("aria-hidden", "true");
      document.body.appendChild(effectLayer);
    }
    return {themeLayer, effectLayer};
  }

  function effectParticleMarkup(effect) {
    if (effect === "sparkle") {
      return Array.from({length:28}, (_,i) => {
        const x=(i*37+11)%97, y=(i*53+7)%91, size=7+(i%5)*3, delay=-((i*17)%70)/10, duration=3.8+(i%6)*.55;
        const glyph=i%4===0?"✧":i%3===0?"·":"✦";
        return `<i class="v81-fx-spark" style="--x:${x}%;--y:${y}%;--size:${size}px;--delay:${delay}s;--dur:${duration}s">${glyph}</i>`;
      }).join("");
    }
    if (effect === "halo") return `<i class="v81-fx-halo h1"></i><i class="v81-fx-halo h2"></i><i class="v81-fx-halo h3"></i><i class="v81-fx-halo-core"></i>`;
    if (effect === "celebration" || effect === "legendaryCelebration") {
      const legendary=effect==="legendaryCelebration", shapes=legendary?["✦","◆","●","★","■","▲"]:["●","◆","✦","■","▲"];
      const count=legendary?58:34;
      let markup=`<i class="v81-fx-celebrate-glow one"></i><i class="v81-fx-celebrate-glow two"></i>`;
      if(legendary) markup+=`<i class="v831-fx-legend-ring r1"></i><i class="v831-fx-legend-ring r2"></i><i class="v831-fx-legend-burst"></i>`;
      return markup + Array.from({length:count}, (_,i) => {
        const x=(i*29+5)%98, size=6+(i%5)*2, delay=-((i*13)%85)/10, duration=(legendary?4.4:5.2)+(i%7)*.42, spin=(i%2?1:-1), drift=spin*(legendary?55:35), rot=spin*720;
        return `<i class="v81-fx-confetti c${i%6} ${legendary?"legendary":""}" style="--x:${x}%;--size:${size}px;--delay:${delay}s;--dur:${duration}s;--drift:${drift}px;--rot:${rot}deg">${shapes[i%shapes.length]}</i>`;
      }).join("");
    }
    if(effect === "fallingStars"){
      return Array.from({length:12},(_,i)=>`<i class="v831-fx-shooting" style="--x:${(i*23+7)%95}%;--y:${(i*31+4)%62}%;--delay:${-((i*19)%90)/10}s;--dur:${3.8+(i%4)*.8}s;--len:${90+(i%5)*28}px"></i>`).join("");
    }
    if(effect === "fireflies"){
      return Array.from({length:38},(_,i)=>`<i class="v831-fx-firefly" style="--x:${(i*41+9)%98}%;--y:${(i*57+12)%94}%;--delay:${-((i*11)%75)/10}s;--dur:${5+(i%7)*.7}s;--size:${3+(i%4)*2}px"></i>`).join("");
    }
    if(effect === "galaxyTrail"){
      return `<i class="v831-fx-galaxy-core"></i>`+Array.from({length:30},(_,i)=>`<i class="v831-fx-galaxy-orb o${i%4}" style="--x:${(i*47+6)%96}%;--y:${(i*29+10)%90}%;--delay:${-((i*17)%95)/10}s;--dur:${7+(i%6)*.9}s;--size:${5+(i%5)*3}px"></i>`).join("");
    }
    if(effect === "coinRain"){
      return Array.from({length:38},(_,i)=>`<i class="v848-coin-rain" style="--x:${(i*37+4)%98}%;--delay:${-((i*13)%85)/10}s;--dur:${4.5+(i%7)*.55}s;--size:${15+(i%4)*3}px">🪙</i>`).join("");
    }
    return "";
  }

  function renderRewardVisuals(force=false) {
    const {themeLayer,effectLayer}=ensureRewardVisualLayers();
    const theme=effectiveThemeId(), effect=selectedEffectId();
    themeLayer.dataset.theme=theme;
    if (force || effectLayer.dataset.effect !== effect) {
      effectLayer.dataset.effect=effect;
      effectLayer.innerHTML=effectParticleMarkup(effect);
    }
  }

  function flashRewardChange(kind) {
    const root=document.documentElement;
    root.classList.remove("v811-reward-switching");
    void root.offsetWidth;
    root.dataset.rewardSwitchKind=kind||"reward";
    root.classList.add("v811-reward-switching");
    setTimeout(()=>root.classList.remove("v811-reward-switching"),760);
  }

  function applyEquippedRewards(forceVisual=false) {
    const root = document.documentElement;
    root.dataset.rewardTheme = effectiveThemeId();
    root.dataset.rewardEffect = selectedEffectId();
    root.dataset.rewardMascot = selectedMascotId();
    root.dataset.rewardAccessory = selectedAccessoryId();
    root.dataset.rewardFrame = selectedFrameId();
    renderRewardVisuals(forceVisual);
  }

  function ensureCoinChip() {
    const actions = q(".topbar-actions");
    if (!actions) return;
    let btn = $("v81CoinChip");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "v81CoinChip";
      btn.type = "button";
      btn.className = "v81-coin-chip";
      btn.innerHTML = `<span>🪙</span><strong id="v81CoinBalance">0</strong>`;
      btn.addEventListener("click", () => { location.hash = "#/rewards"; });
      const bell = $("v8NotifBtn");
      if (bell?.parentElement === actions) actions.insertBefore(btn, bell); else actions.prepend(btn);
    }
    const bal = $("v81CoinBalance"); if (bal) bal.textContent = balance().toLocaleString(lang()==="th"?"th-TH":"en-US");
  }

  function historyLabel(item) { return lang() === "th" ? (item.labelTh || item.labelEn || item.id) : (item.labelEn || item.labelTh || item.id); }
  function historyValue(item) { const n=Number(item?.amount||0); if(n===0&&item?.meta?.rewardText)return item.meta.rewardText; return `${n>=0?"+":""}${n} 🪙`; }
  function formatHistoryDate(iso) {
    const d = new Date(iso || Date.now());
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat(lang()==="th"?"th-TH":"en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(d);
  }
  function visualForReward(reward){
    if(reward.type==="mascot") return reward.emoji;
    if(reward.type==="accessory") return `<span class="v831-accessory-preview"><b>🐣</b><i>${reward.icon}</i></span>`;
    if(reward.type==="frame") return `<span class="v831-frame-preview" data-preview-frame="${esc(reward.id)}">🐣</span>`;
    return reward.icon;
  }
  function rewardCard(reward) {
    const owned = isOwned(reward), equipped = isEquipped(reward), currentBalance = balance(), available=rewardAvailable(reward);
    const visual = visualForReward(reward), bond = reward.type === "mascot" ? mascotBond(reward.id) : null;
    const desc = reward.type === "mascot"
      ? `${lang()==="th" ? "เปลี่ยนบุคลิกและข้อความตาม Workday Progress" : "Changes personality and messages with Workday Progress"} · Bond Lv.${bond.level} (${bond.progress}/100 XP)`
      : rewardDescription(reward);
    let action = "";
    if (equipped) action = `<button type="button" class="v81-reward-btn equipped" disabled>✓ ${esc(t("equipped"))}</button>`;
    else if (owned) action = `<button type="button" class="v81-reward-btn" data-v81-equip="${esc(reward.type)}:${esc(reward.id)}">${esc(t("equip"))}</button>`;
    else if(reward.codeExclusive) action = `<button type="button" class="v81-reward-btn v848-code-locked" disabled>🔒 CODE EXCLUSIVE</button>`;
    else if(!available) action = `<button type="button" class="v81-reward-btn finale-ended" disabled>🎓 ${esc(t("finaleEnded"))}</button>`;
    else action = `<button type="button" class="v81-reward-btn buy" data-v81-buy="${esc(reward.type)}:${esc(reward.id)}" ${currentBalance<reward.price?'data-low="1"':""}>🪙 ${reward.price.toLocaleString()} · ${esc(t("buy"))}</button>`;
    const ownershipLabel=owned?`<span>${esc(t("owned"))}</span>`:(reward.codeExclusive?`<span>🎟 CODE</span>`:`<span>🪙 ${reward.price}</span>`);
    return `<article class="v81-reward-card ${owned?"owned":"locked"} ${equipped?"active":""} rarity-${esc(reward.rarity||"common")} ${reward.finale?"finale":""} ${reward.codeExclusive?"v848-code-exclusive":""}" data-kind="${esc(reward.type)}" data-reward="${esc(reward.id)}"><div class="v831-card-badges"><span class="v831-rarity ${esc(reward.rarity||"common")}">${esc(rarityName(reward))}</span>${reward.codeExclusive?`<span class="v848-code-badge">🎟 CODE EXCLUSIVE</span>`:""}${reward.finale?`<span class="v831-limited">${esc(t("limited"))}</span>`:""}</div><div class="v81-reward-visual" style="--reward-accent:${esc(reward.accent||"#6d8cff")}">${visual}</div><div class="v81-reward-copy"><div class="v81-reward-title"><strong>${esc(rewardName(reward))}</strong>${ownershipLabel}</div><p>${esc(desc)}</p></div>${action}</article>`;
  }
  function collectableRewards(){ return ALL_REWARDS.filter(r=>r.price>0); }
  function categoryCollection(type){ const list=collectableRewards().filter(r=>r.type===type),owned=ownedRewards();return{owned:list.filter(r=>owned.has(rewardKey(r))).length,total:list.length}; }
  function collectionMarkup(){
    const owned=ownedRewards(), all=collectableRewards(), count=all.filter(r=>owned.has(rewardKey(r))).length, pct=all.length?Math.round(count/all.length*100):0;
    const rows=[["mascot","🐣",t("mascots")],["accessory","🎩",t("accessories")],["frame","🖼",t("frames")],["theme","🎨",t("themes")],["effect","✨",t("effects")]];
    return `<section class="v831-collection"><div class="v831-collection-main"><div><p class="eyebrow">YOUR COLLECTION</p><h3>${esc(t("collection"))}</h3><p>${lang()==="th"?"สะสมของใน Reward Shop ให้ครบก่อน Journey สิ้นสุด":"Build your Reward Shop collection before the Journey ends"}</p></div><div class="v831-collection-score"><strong>${count}/${all.length}</strong><span>${pct}%</span></div><div class="v831-collection-meter"><i style="width:${pct}%"></i></div></div><div class="v831-collection-cats">${rows.map(([type,icon,label])=>{const c=categoryCollection(type);return`<button type="button" data-v831-category="${type}"><span>${icon}</span><div><strong>${esc(label)}</strong><small>${c.owned}/${c.total} ${esc(t("collected"))}</small></div></button>`}).join("")}</div></section>`;
  }
  function weeklyFeaturedRewards(){
    const seed=`rotation:${weekKey()}:${API.getConfig().startDate}`;
    return collectableRewards().slice().sort((a,b)=>seedNumber(`${seed}:${a.type}:${a.id}`)-seedNumber(`${seed}:${b.type}:${b.id}`)).slice(0,6);
  }
  function dailyFeaturedRewards(){
    const weeklyKeys=new Set(weeklyFeaturedRewards().map(rewardKey));
    const seed=`daily-rotation:${dayKeyNow()}`;
    return collectableRewards().filter(r=>!weeklyKeys.has(rewardKey(r))).slice().sort((a,b)=>seedNumber(`${seed}:${a.type}:${a.id}`)-seedNumber(`${seed}:${b.type}:${b.id}`)).slice(0,3);
  }
  function weeklyDealFor(reward){
    const week=weekKey();
    const discounts=[20,20,25,25,30,30,35,35,40,40,50];
    const discount=discounts[seedNumber(`weekly-deal:${week}:${reward.type}:${reward.id}`)%discounts.length];
    const price=Math.max(1,Math.round(Number(reward.price||0)*(100-discount)/100));
    return {key:week,week,discount,price,originalPrice:Number(reward.price||0)};
  }
  function dailyDealFor(reward){
    const day=dayKeyNow();
    const discounts=[15,15,20,20,20,25,25,30,30,35,40];
    const discount=discounts[seedNumber(`daily-deal:${day}:${reward.type}:${reward.id}`)%discounts.length];
    const price=Math.max(1,Math.round(Number(reward.price||0)*(100-discount)/100));
    return {key:day,day,discount,price,originalPrice:Number(reward.price||0)};
  }
  function weeklyResetLabel(){
    const now=API.getNow(), next=weekStartDate(addDays(now,7)); next.setHours(0,0,0,0); const ms=Math.max(0,next-now),d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000);
    return lang()==="th"?`ดีลใหม่ใน ${d} วัน ${h} ชม.`:`New deals in ${d}d ${h}h`;
  }
  function dailyResetLabel(){
    const now=API.getNow(),next=new Date(now);next.setDate(next.getDate()+1);next.setHours(0,0,0,0);const ms=Math.max(0,next-now),h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000);
    return lang()==="th"?`ดีลใหม่ใน ${h} ชม. ${m} นาที`:`New deals in ${h}h ${m}m`;
  }
  function miniRewardCard(reward,kind){
    const owned=isOwned(reward),equipped=isEquipped(reward),available=rewardAvailable(reward),deal=kind==="weekly"?weeklyDealFor(reward):kind==="daily"?dailyDealFor(reward):null;
    let action="";
    if(equipped) action=`<button type="button" disabled>✓ ${esc(t("equipped"))}</button>`;
    else if(owned) action=`<button type="button" data-v81-equip="${esc(reward.type)}:${esc(reward.id)}">${esc(t("equip"))}</button>`;
    else if(!available) action=`<button type="button" disabled>${esc(t("finaleEnded"))}</button>`;
    else if(deal&&kind==="daily") action=`<button type="button" class="v844-daily-buy" data-v844-daily-buy="${esc(reward.type)}:${esc(reward.id)}"><s>🪙 ${reward.price.toLocaleString()}</s><strong>🪙 ${deal.price.toLocaleString()}</strong></button>`;
    else if(deal) action=`<button type="button" class="v832-weekly-buy" data-v832-weekly-buy="${esc(reward.type)}:${esc(reward.id)}"><s>🪙 ${reward.price.toLocaleString()}</s><strong>🪙 ${deal.price.toLocaleString()}</strong></button>`;
    else action=`<button type="button" data-v81-buy="${esc(reward.type)}:${esc(reward.id)}">🪙 ${reward.price}</button>`;
    const isMega=kind==="weekly"&&!!deal&&deal.discount===50;
    const isDailyHot=kind==="daily"&&!!deal&&deal.discount>=35;
    const label=kind==="finale"?esc(t("limited")):kind==="daily"?(isDailyHot?(lang()==="th"?"🔥 ดีลร้อน":"🔥 HOT DEAL"):(lang()==="th"?"⚡ ดีลวันนี้":"⚡ DAILY DEAL")):(isMega?(lang()==="th"?"🔥 ดีลใหญ่":"🔥 MEGA DEAL"):esc(t("featured")));
    const typeLabels={mascot:lang()==="th"?"มาสคอต":"Mascot",accessory:lang()==="th"?"ของแต่ง":"Accessory",frame:lang()==="th"?"กรอบโปรไฟล์":"Profile Frame",theme:lang()==="th"?"ธีม":"Theme",effect:lang()==="th"?"เอฟเฟกต์":"Effect"};
    const typeLabel=typeLabels[reward.type]||reward.type;
    const dealClass=kind==="daily"?"v844-daily-deal":deal?"v832-weekly-deal":"";
    return `<article class="v831-mini-reward rarity-${esc(reward.rarity||"common")} ${dealClass} ${isMega?"v834-mega-deal":""} ${isDailyHot?"v844-hot-deal":""}">${deal?`<span class="v832-discount-badge ${kind==="daily"?"v844-daily-badge":""} ${isMega?"v834-mega-badge":""}">-${deal.discount}%</span>`:""}<div class="v831-mini-visual">${visualForReward(reward)}</div><div class="v831-mini-copy ${deal?"v832-deal-copy":""}"><span>${label}</span><strong>${esc(rewardName(reward))}</strong><small>${esc(rarityName(reward))} · ${esc(typeLabel)}</small></div>${action}</article>`;
  }
  function dailyMarkup(){
    const eyebrow=lang()==="th"?"ข้อเสนอวันนี้":"TODAY ONLY";
    return `<section class="v831-featured v844-daily-shop"><div class="v831-section-head"><div><p class="eyebrow">${eyebrow}</p><h3>⚡ ${esc(t("dailyFeatured"))}</h3><p>${esc(t("dailyFeaturedHelp"))}</p></div><span>${esc(dailyResetLabel())}</span></div><div class="v844-daily-note"><span>🛍️</span><div><strong>${lang()==="th"?"3 ดีลใหม่ทุกวัน · ลด 15–40%":"3 fresh deals every day · 15–40% off"}</strong><small>${lang()==="th"?"ไม่ซ้ำกับ Weekly Deals ของสัปดาห์นี้ · ราคาพิเศษเฉพาะการซื้อจากการ์ด Daily Deal":"Does not overlap this week's Weekly Deals · special price applies only from the Daily Deal card"}</small></div></div><div class="v831-featured-track v844-daily-track">${dailyFeaturedRewards().map(r=>miniRewardCard(r,"daily")).join("")}</div></section>`;
  }
  function weeklyMarkup(){ const eyebrow=lang()==="th"?"โปรโมชั่นประจำสัปดาห์":"WEEKLY DEALS"; return `<section class="v831-featured v832-weekly-shop"><div class="v831-section-head"><div><p class="eyebrow">${eyebrow}</p><h3>🏷️ ${esc(t("weeklyFeatured"))}</h3><p>${esc(t("weeklyFeaturedHelp"))}</p></div><span>${esc(weeklyResetLabel())}</span></div><div class="v832-sale-note"><span>⚡</span><strong>${lang()==="th"?"ส่วนลดประจำสัปดาห์ 20–50%":"Weekly discounts from 20–50%"}</strong><small>${lang()==="th"?"ดีล 50% เป็น Mega Deal ที่พบได้น้อย · ซื้อจากการ์ดนี้เท่านั้น ส่วนหมวดปกติยังเป็นราคาเต็ม":"50% is a rare Mega Deal · discounts apply only when buying from these cards; regular categories stay full price"}</small></div><div class="v831-featured-track">${weeklyFeaturedRewards().map(r=>miniRewardCard(r,"weekly")).join("")}</div></section>`; }

  function finaleMarkup(){
    const info=journeyFinaleInfo(), items=ALL_REWARDS.filter(r=>r.finale);
    const countdown=info.active?(lang()==="th"?`${info.days} วันก่อน Journey สิ้นสุด`:`${info.days} days until Journey end`):t("finaleEnded");
    return `<section class="v831-finale ${info.active?"active":"ended"}"><div class="v831-finale-head"><div><span>🎓</span><div><p class="eyebrow">FINAL CHAPTER</p><h3>${esc(t("finaleCollection"))}</h3><p>${esc(t("finaleHelp"))}</p></div></div><b>${esc(countdown)}</b></div><div class="v831-finale-grid">${items.map(r=>miniRewardCard(r,"finale")).join("")}</div></section>`;
  }

  function renderShop() {
    const root = $("v81RewardsPage");
    if (!root) return;
    const tab = localStorage.getItem(KEYS.tab) || "mascots";
    const list = ledger().slice().sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
    const bal = balance(list), earned = lifetimeEarned(list), spent = lifetimeSpent(list);
    const categoryMap={mascots:MASCOTS,accessories:ACCESSORIES,frames:FRAMES,themes:THEMES,effects:EFFECTS};
    const tabContent = categoryMap[tab]
      ? categoryMap[tab].map(rewardCard).join("")
      : `<div class="v81-history-list">${list.length ? list.slice(0,160).map(item=>`<div class="v81-history-row ${Number(item.amount)>=0?"earn":"spend"}"><span class="v81-history-icon">${Number(item.amount)>=0?"＋":"−"}</span><div><strong>${esc(historyLabel(item))}</strong><small>${esc(formatHistoryDate(item.createdAt))}</small></div><b>${esc(historyValue(item))}</b></div>`).join("") : `<div class="empty-state">🪙 ${esc(t("coinHistoryEmpty"))}</div>`}</div>`;

    root.innerHTML = `<div class="v7-page-heading"><div class="v7-page-title"><span>🎁</span><div><p class="eyebrow">WORKDAY JOURNEY · V8.5.0</p><h2>${esc(t("shopTitle"))}</h2><p class="muted">${esc(t("shopHelp"))}</p></div></div></div>
      <section class="v81-wallet-hero"><div class="v81-wallet-main"><span>🪙</span><div><small>${esc(t("coinBalance"))}</small><strong>${bal.toLocaleString(lang()==="th"?"th-TH":"en-US")}</strong></div></div><div class="v81-wallet-stat"><small>${esc(t("lifetimeEarned"))}</small><b>+${earned.toLocaleString()}</b></div><div class="v81-wallet-stat"><small>${esc(t("lifetimeSpent"))}</small><b>-${spent.toLocaleString()}</b></div></section>
      ${collectionMarkup()}
      ${dailyMarkup()}
      ${weeklyMarkup()}
      ${finaleMarkup()}
      <section class="v81-earn-card"><div><p class="eyebrow">${esc(t("howToEarn"))}</p><h3>${esc(t("retroTitle"))}</h3><p>${esc(t("retroHelp"))}</p></div><div class="v81-earn-grid"><span>🕒 <b>+15</b> ${esc(t("earnWorkday"))}</span><span>📓 <b>+10</b> ${esc(t("earnJournal"))}</span><span>🧩 <b>+50</b> ${esc(t("earnProject"))}</span><span>🏆 <b>+20 / +40 / +80 / +150</b> ${esc(t("earnAchievement"))}</span><span>🎯 <b>+5 – +20</b> Daily Mission</span><span>🎁 <b>+5 – +100</b> Daily / Weekly Chest</span></div></section>
      <div class="v81-shop-tabs">${[["mascots","🐣",t("mascots")],["accessories","🎩",t("accessories")],["frames","🖼",t("frames")],["themes","🎨",t("themes")],["effects","✨",t("effects")],["history","📜",t("history")]].map(([id,icon,label])=>`<button type="button" data-v81-tab="${id}" class="${tab===id?"active":""}">${icon}<span>${esc(label)}</span></button>`).join("")}</div>
      <section class="v81-shop-grid ${tab==="history"?"history":""}">${tabContent}</section>`;

    qa("[data-v831-category]",root).forEach(btn=>btn.addEventListener("click",()=>{const map={mascot:"mascots",accessory:"accessories",frame:"frames",theme:"themes",effect:"effects"};localStorage.setItem(KEYS.tab,map[btn.dataset.v831Category]||"mascots");renderShop();}));
    qa("[data-v81-tab]", root).forEach(btn => btn.addEventListener("click", () => { localStorage.setItem(KEYS.tab, btn.dataset.v81Tab); renderShop(); }));
    qa("[data-v81-buy]", root).forEach(btn => btn.addEventListener("click", () => { const [type,id]=btn.dataset.v81Buy.split(":"); purchaseReward(rewardBy(type,id)); }));
    qa("[data-v844-daily-buy]", root).forEach(btn => btn.addEventListener("click", () => { const [type,id]=btn.dataset.v844DailyBuy.split(":"); purchaseReward(rewardBy(type,id),"daily"); }));
    qa("[data-v832-weekly-buy]", root).forEach(btn => btn.addEventListener("click", () => { const [type,id]=btn.dataset.v832WeeklyBuy.split(":"); purchaseReward(rewardBy(type,id),"weekly"); }));
    qa("[data-v81-equip]", root).forEach(btn => btn.addEventListener("click", () => { const [type,id]=btn.dataset.v81Equip.split(":"); equipReward(rewardBy(type,id)); }));
    // Render-stability hotfix: finish the visual layer before the browser can paint.
    // These hooks decorate DOM only; no wallet, bank, shop purchase or Cloud writes.
    window.WorkdayV848?.enhanceRewards?.();
    window.WorkdayV853?.refresh?.();
    window.WorkdayV850?.refresh?.();
  }


  // ---------- V8.2 Daily Missions + Chests ----------
  const MISSION_DEFS = {
    half_shift:{group:"work",reward:8,icon:"◔",th:"ผ่านครึ่งวัน",en:"Halfway Shift",descTh:"ทำงานให้ได้อย่างน้อย 50% ของเวลาวันนี้",descEn:"Complete at least 50% of today's work time"},
    focus_4h:{group:"work",reward:10,icon:"⏱",th:"Focus 4 Hours",en:"Focus 4 Hours",descTh:"สะสมเวลาทำงานให้ครบ 4 ชั่วโมง",descEn:"Accumulate 4 hours of work time"},
    strong_finish:{group:"work",reward:12,icon:"⚡",th:"Strong Finish",en:"Strong Finish",descTh:"ทำงานให้ได้อย่างน้อย 80% ของวัน",descEn:"Reach at least 80% of today's work time"},
    full_shift:{group:"work",reward:15,icon:"🏁",th:"Full Workday",en:"Full Workday",descTh:"ทำงานครบวันตามตาราง",descEn:"Complete the full scheduled workday"},
    journal_today:{group:"journal",reward:10,icon:"📓",th:"Daily Chronicle",en:"Daily Chronicle",descTh:"บันทึก Daily Journal ของวันนี้",descEn:"Write today's Daily Journal"},
    journal_reflection:{group:"journal",reward:12,icon:"✍️",th:"Reflection Note",en:"Reflection Note",descTh:"เขียนสิ่งที่เรียนรู้วันนี้อย่างน้อย 20 ตัวอักษร",descEn:"Write at least 20 characters in today's learning note"},
    journal_project:{group:"journal",reward:12,icon:"🔗",th:"Connect the Work",en:"Connect the Work",descTh:"เชื่อม Journal วันนี้กับ Project อย่างน้อย 1 Project",descEn:"Link today's Journal to at least one Project"},
    project_update:{group:"project",reward:12,icon:"🧩",th:"Project Momentum",en:"Project Momentum",descTh:"บันทึกหรืออัปเดต Project อย่างน้อย 1 รายการวันนี้",descEn:"Save or update at least one Project today"},
    project_push50:{group:"project",reward:15,icon:"🚀",th:"Push Past 50",en:"Push Past 50",descTh:"อัปเดต Project วันนี้และให้ Progress ถึง 50% ขึ้นไป",descEn:"Update a Project today and reach at least 50% progress"},
    balanced_day:{group:"bonus",reward:15,icon:"⚖️",th:"Balanced Day",en:"Balanced Day",descTh:"ทำงานเกินครึ่งวันและมี Journal วันนี้",descEn:"Reach half a workday and write today's Journal"},
    power_day:{group:"bonus",reward:20,icon:"🔥",th:"Power Day",en:"Power Day",descTh:"ทำงานครบวันพร้อมบันทึก Journal",descEn:"Complete the workday and today's Journal"},
    rewards_visit:{group:"explore",reward:5,icon:"🎁",th:"Reward Explorer",en:"Reward Explorer",descTh:"เข้าไปดู Reward Shop วันนี้",descEn:"Visit the Reward Shop today"},
    achievements_visit:{group:"explore",reward:5,icon:"🏆",th:"Achievement Check",en:"Achievement Check",descTh:"เข้าไปดูหน้า Achievements วันนี้",descEn:"Visit the Achievements page today"}
  };

  function dayKeyNow(){ return dateKey(API.getNow()); }
  function isoDay(value){ try { const d=new Date(value); return Number.isNaN(d.getTime())?"":dateKey(d); } catch { return ""; } }
  function activityMap(){ const value=read(KEYS.activity,{}); return value&&typeof value==="object"&&!Array.isArray(value)?value:{}; }
  function markRouteVisit(){
    const key=dayKeyNow(), route=(location.hash.replace(/^#\/?/,"").split(/[?&]/)[0]||"dashboard").toLowerCase();
    const map=activityMap(), row=map[key]||{routes:[],openedAt:new Date().toISOString()};
    if(!Array.isArray(row.routes)) row.routes=[];
    if(!row.routes.includes(route)){ row.routes.push(route); row.updatedAt=new Date().toISOString(); map[key]=row; write(KEYS.activity,map); }
  }
  function missionContext(key=dayKeyNow()){
    const d=dateFromKey(key), now=API.getNow(), scheduled=Number(API.getScheduledMinutes(d)||0), capacity=Number(API.getActualDayCapacity(d)||0), leave=Number(API.getLeaveMinutes(d)||0), worked=Number(API.getWorkedMinutes(d,now)||0);
    const journals=read("wp-v6-journal",{}), journal=journals?.[key]||null;
    const projectsRaw=read("wp-v6-projects",[]), projects=Array.isArray(projectsRaw)?projectsRaw:[];
    const updatedToday=projects.filter(p=>isoDay(p?.updatedAt)===key);
    const routes=activityMap()?.[key]?.routes||[];
    return {key,d,now,scheduled,capacity,leave,worked,journal,projects,updatedToday,routes};
  }
  function missionEligible(id,c){
    if(["half_shift","strong_finish","balanced_day"].includes(id)) return c.capacity>0;
    if(id==="focus_4h") return c.capacity>=240;
    if(["full_shift","power_day"].includes(id)) return c.scheduled>0&&c.leave<=.001;
    if(id==="journal_project") return c.projects.length>0;
    if(["project_update","project_push50"].includes(id)) return c.projects.some(p=>!p.archived);
    return true;
  }
  function missionProgress(id,c){
    if(id==="half_shift") return {value:Math.min(c.worked,c.capacity*.5),target:Math.max(1,c.capacity*.5)};
    if(id==="focus_4h") return {value:Math.min(c.worked,240),target:240};
    if(id==="strong_finish") return {value:Math.min(c.worked,c.capacity*.8),target:Math.max(1,c.capacity*.8)};
    if(id==="full_shift") return {value:Math.min(c.worked,c.scheduled),target:Math.max(1,c.scheduled)};
    if(id==="journal_today") return {value:c.journal?1:0,target:1};
    if(id==="journal_reflection") return {value:Math.min(String(c.journal?.learned||"").trim().length,20),target:20};
    if(id==="journal_project") return {value:(c.journal?.projectIds||[]).length?1:0,target:1};
    if(id==="project_update") return {value:c.updatedToday.length?1:0,target:1};
    if(id==="project_push50") return {value:c.updatedToday.some(p=>Number(p.progress||0)>=50)?1:0,target:1};
    if(id==="balanced_day") return {value:(c.worked>=c.capacity*.5&&c.journal)?1:0,target:1};
    if(id==="power_day") return {value:(c.worked>=c.scheduled-.001&&c.leave<=.001&&c.journal)?1:0,target:1};
    if(id==="rewards_visit") return {value:c.routes.includes("rewards")?1:0,target:1};
    if(id==="achievements_visit") return {value:c.routes.includes("achievements")?1:0,target:1};
    return {value:0,target:1};
  }
  function seedNumber(text){ return parseInt(stableHash(text),36)>>>0; }
  function pickSeeded(ids,seed){ return [...ids].sort((a,b)=>seedNumber(`${seed}:${a}`)-seedNumber(`${seed}:${b}`))[0]; }
  function missionStore(){ const value=read(KEYS.missions,{}); return value&&typeof value==="object"&&!Array.isArray(value)?value:{}; }
  function dailyMissionSet(key=dayKeyNow()){
    const store=missionStore(); if(store[key]?.ids?.length===3) return store[key];
    const c=missionContext(key), cfg=API.getConfig(), seed=`${key}|${cfg.startDate}|${cfg.profileName||"journey"}`;
    const claimed=ledger().filter(x=>String(x.id||"").startsWith(`earn:mission:${key}:`)).map(x=>String(x.id).split(":").pop()).filter(id=>MISSION_DEFS[id]);
    const groups=[];
    if(c.capacity>0) groups.push(["half_shift","focus_4h","strong_finish","full_shift"].filter(id=>missionEligible(id,c)));
    else groups.push(["rewards_visit","achievements_visit"]);
    groups.push(["journal_today","journal_reflection","journal_project"].filter(id=>missionEligible(id,c)));
    groups.push(["project_update","project_push50","balanced_day","power_day","rewards_visit","achievements_visit"].filter(id=>missionEligible(id,c)));
    const ids=[...new Set(claimed)];
    groups.forEach((pool,i)=>{ const clean=pool.filter(id=>!ids.includes(id)); if(ids.length<3&&clean.length) ids.push(pickSeeded(clean,`${seed}:${i}`)); });
    const fallback=Object.keys(MISSION_DEFS).filter(id=>missionEligible(id,c)&&!ids.includes(id));
    while(ids.length<3&&fallback.length){ const id=pickSeeded(fallback,`${seed}:fallback:${ids.length}`); ids.push(id); fallback.splice(fallback.indexOf(id),1); }
    store[key]={ids:ids.slice(0,3),generatedAt:new Date().toISOString()}; write(KEYS.missions,store); return store[key];
  }
  function missionClaimed(key,id){ return ledger().some(x=>x.id===`earn:mission:${key}:${id}`); }
  function missionClaimCount(key){ return ledger().filter(x=>String(x.id||"").startsWith(`earn:mission:${key}:`)).length; }
  function claimMission(id){
    const key=dayKeyNow(), set=dailyMissionSet(key); if(!set.ids.includes(id)||missionClaimed(key,id)||missionClaimCount(key)>=3)return;
    const def=MISSION_DEFS[id], p=missionProgress(id,missionContext(key)); if(p.value+1e-6<p.target){toast("🎯",lang()==="th"?"ภารกิจนี้ยังไม่สำเร็จ":"This mission is not complete yet","error");return;}
    const list=ledger(); list.push({id:`earn:mission:${key}:${id}`,amount:def.reward,type:"mission",labelTh:`Daily Mission · ${def.th}`,labelEn:`Daily Mission · ${def.en}`,createdAt:new Date().toISOString(),meta:{date:key,missionId:id}}); write(KEYS.ledger,list);
    toast("🎯",`+${def.reward} Coins · ${lang()==="th"?def.th:def.en}`,"success"); refreshAll();
  }
  function mascotXpMap(){ const v=read(KEYS.mascotXp,{}); return v&&typeof v==="object"&&!Array.isArray(v)?v:{}; }
  function mascotBond(id){ const xp=Math.max(0,Math.round(Number(mascotXpMap()[id]||0))); return {xp,level:Math.floor(xp/100)+1,progress:xp%100}; }
  function addMascotXp(id,amount){ const map=mascotXpMap(); map[id]=Math.max(0,Math.round(Number(map[id]||0)+Number(amount||0))); write(KEYS.mascotXp,map); }
  function activeThemeTrial(){
    const trial=read(KEYS.themeTrial,null); if(!trial?.themeId||!rewardBy("theme",trial.themeId)) return null;
    const expires=new Date(trial.expiresAt||0).getTime(); if(!expires||Date.now()>=expires){localStorage.removeItem(KEYS.themeTrial);return null;} return trial;
  }
  function effectiveThemeId(){ return activeThemeTrial()?.themeId || selectedThemeId(); }
  function grantThemeTrial(hours,seed){
    const locked=THEMES.filter(x=>x.price>0&&!isOwned(x));
    if(!locked.length) return null;
    const theme=locked[seedNumber(seed)%locked.length], start=Date.now(), end=start+hours*3600000;
    const trial={themeId:theme.id,startedAt:new Date(start).toISOString(),expiresAt:new Date(end).toISOString(),hours}; write(KEYS.themeTrial,trial); return trial;
  }
  function weekKey(date=API.getNow()){
    const d=new Date(date.getFullYear(),date.getMonth(),date.getDate()), day=(d.getDay()+6)%7; d.setDate(d.getDate()-day);
    const y=d.getFullYear(), first=new Date(y,0,1), week=Math.floor((d-first)/86400000/7)+1; return `${y}-W${String(week).padStart(2,"0")}`;
  }
  function weekStartDate(date=API.getNow()){ const d=new Date(date.getFullYear(),date.getMonth(),date.getDate()), day=(d.getDay()+6)%7; d.setDate(d.getDate()-day); return d; }
  function dailyChestOpened(key){ return ledger().some(x=>x.id===`chest:daily:${key}`); }
  function weeklyChestOpened(key=weekKey()){ return ledger().some(x=>x.id===`chest:weekly:${key}`); }
  function completedDailyInWeek(){ const start=weekStartDate(), keys=[]; for(let i=0;i<7;i++)keys.push(dateKey(addDays(start,i))); return keys.filter(dailyChestOpened).length; }
  function chestReward(kind,key){
    const cfg=API.getConfig(), seed=`${kind}|${key}|${cfg.startDate}|${cfg.profileName||"journey"}`, roll=seedNumber(seed)%100;
    if(kind==="daily"){
      if(roll<70){const coins=[5,10,15,20,25,30][seedNumber(seed+":coins")%6];return{type:"coins",coins,text:`+${coins} Coins`};}
      if(roll<85){const theme=THEMES.filter(x=>x.price>0&&!isOwned(x));if(theme.length)return{type:"trial",hours:24,text:lang()==="th"?"Theme Trial 24 ชั่วโมง":"24h Theme Trial"};}
      const xp=[15,20,25,30][seedNumber(seed+":xp")%4];return{type:"xp",xp,text:`+${xp} Mascot XP`};
    }
    if(roll<60){const coins=[40,50,60,70,80,100][seedNumber(seed+":coins")%6];return{type:"coins",coins,text:`+${coins} Coins`};}
    if(roll<80){const theme=THEMES.filter(x=>x.price>0&&!isOwned(x));if(theme.length)return{type:"trial",hours:48,text:lang()==="th"?"Theme Trial 48 ชั่วโมง":"48h Theme Trial"};}
    const xp=[60,80,100,120][seedNumber(seed+":xp")%4];return{type:"xp",xp,text:`+${xp} Mascot XP`};
  }
  function chestLedgerEntry(kind,key=kind==="daily"?dayKeyNow():weekKey()){
    return ledger().find(x=>x.id===`chest:${kind}:${key}`)||null;
  }
  function chestEntryInfo(entry){
    if(!entry)return null;
    const meta=entry.meta||{}, type=meta.rewardType||"coins";
    if(type==="coins"){
      const coins=Math.max(0,Math.round(Number(meta.coins ?? entry.amount ?? 0)));
      return {type,icon:"🪙",text:`+${coins} Coins`,coins,jackpot:!!meta.jackpot};
    }
    if(type==="trial"){
      const theme=rewardBy("theme",meta.rewardId),hours=Math.max(1,Math.round(Number(meta.hours||24)));
      return {type,icon:theme?.icon||"🎨",text:theme?`${rewardName(theme)} · ${hours}h`:(meta.rewardText||`${hours}h Theme Trial`),hours,rewardId:meta.rewardId||""};
    }
    if(type==="xp"){
      const mascot=rewardBy("mascot",meta.mascotId),xp=Math.max(0,Math.round(Number(meta.xp||0)));
      return {type,icon:mascot?.emoji||"🐣",text:`+${xp} XP · ${mascot?rewardName(mascot):(meta.rewardText||"Mascot")}`,xp,mascotId:meta.mascotId||"",level:Number(meta.bondLevel||0),progress:Number(meta.bondProgress||0)};
    }
    return {type,icon:meta.rewardIcon||"🎁",text:meta.rewardText||entry.labelTh||entry.labelEn||"Reward"};
  }
  function chestCardRewardMarkup(entry,kind){
    const info=chestEntryInfo(entry); if(!info)return"";
    const label=kind==="daily"?(lang()==="th"?"วันนี้ได้รับ":"Today's reward"):(lang()==="th"?"สัปดาห์นี้ได้รับ":"This week's reward");
    return `<div class="v843-chest-last reward-${esc(info.type)}"><span>${info.icon}</span><div><small>${esc(label)}</small><strong>${esc(info.text)}</strong></div></div>`;
  }
  function chestMotionEnabled(){
    return !document.body.classList.contains("no-animations") && localStorage.getItem("wp-animations")!=="false" && !globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  }
  let chestRevealTimer=null;
  function ensureChestRewardModal(){
    let back=$("v843ChestBackdrop"); if(back)return back;
    back=document.createElement("div"); back.id="v843ChestBackdrop"; back.className="v843-chest-backdrop"; back.hidden=true;
    back.innerHTML=`<section id="v843ChestModal" class="v843-chest-modal" role="dialog" aria-modal="true" aria-labelledby="v843ChestTitle"><button id="v843ChestClose" class="v843-chest-close" type="button" aria-label="Close">×</button><div id="v843ChestParticles" class="v843-chest-particles" aria-hidden="true"></div><div id="v843ChestStage" class="v843-chest-stage" data-stage="opening"><div class="v843-chest-box"><span id="v843ChestBoxIcon">🎁</span><i></i></div><div class="v843-chest-question">?</div><div class="v843-chest-reward-icon" id="v843ChestRewardIcon">🪙</div></div><div class="v843-chest-copy"><p id="v843ChestEyebrow" class="eyebrow">DAILY CHEST</p><div id="v843ChestJackpot" class="v843-chest-jackpot" hidden>🔥 JACKPOT!</div><h2 id="v843ChestTitle">Reward</h2><p id="v843ChestSubtitle"></p><div id="v843ChestXp" class="v843-chest-xp" hidden><div><span id="v843ChestXpLabel"></span><strong id="v843ChestXpLevel"></strong></div><i><b id="v843ChestXpBar"></b></i></div></div><button id="v843ChestAccept" class="v843-chest-accept" type="button">รับรางวัล</button><small class="v843-chest-safe">รางวัลถูกบันทึกแล้ว · ปิด Popup ได้อย่างปลอดภัย</small></section>`;
    document.body.appendChild(back);
    const close=()=>closeChestRewardModal();
    $("v843ChestClose").addEventListener("click",close); $("v843ChestAccept").addEventListener("click",close);
    back.addEventListener("click",e=>{if(e.target===back)close();});
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!back.hidden)close();});
    return back;
  }
  function closeChestRewardModal(){
    clearTimeout(chestRevealTimer); const back=$("v843ChestBackdrop"); if(back){back.classList.remove("show");back.hidden=true;} document.body.classList.remove("v843-chest-open");
  }
  function chestParticleMarkup(kind,jackpot){
    const symbols=kind==="weekly"||jackpot?["✦","★","●","◆","🪙","✧","★","●","🪙","✦","◆","★"]:["✦","●","🪙","✧","●","✦","🪙","●"];
    return symbols.map((symbol,i)=>`<i style="--i:${i};--x:${8+(i*23)%84}%;--delay:${(i%5)*.08}s">${symbol}</i>`).join("");
  }
  function showChestRewardModal(kind,reward){
    const back=ensureChestRewardModal(),modal=$("v843ChestModal"),stage=$("v843ChestStage"),motion=chestMotionEnabled(),weekly=kind==="weekly";
    clearTimeout(chestRevealTimer); modal.className=`v843-chest-modal ${kind} reward-${reward.type} ${reward.jackpot?"jackpot":""}`;
    $("v843ChestBoxIcon").textContent=weekly?"🏆":"🎁"; $("v843ChestRewardIcon").textContent=reward.icon||"🎁";
    $("v843ChestEyebrow").textContent=weekly?"WEEKLY CHEST":"DAILY CHEST"; $("v843ChestJackpot").hidden=!reward.jackpot;
    $("v843ChestTitle").textContent=reward.title||reward.rewardText||"Reward"; $("v843ChestSubtitle").textContent=reward.subtitle||"";
    $("v843ChestAccept").textContent=lang()==="th"?"รับรางวัล":"Awesome!"; q(".v843-chest-safe",modal).textContent=lang()==="th"?"รางวัลถูกบันทึกแล้ว · ปิด Popup ได้อย่างปลอดภัย":"Reward saved · you can safely close this popup";
    const xp=$("v843ChestXp");
    if(reward.type==="xp"){
      xp.hidden=false; $("v843ChestXpLabel").textContent=lang()==="th"?`ความผูกพัน ${reward.progress}/100`:`Bond progress ${reward.progress}/100`; $("v843ChestXpLevel").textContent=`Lv. ${reward.level}`; $("v843ChestXpBar").style.width=`${Math.max(0,Math.min(100,reward.progress||0))}%`;
    }else xp.hidden=true;
    $("v843ChestParticles").innerHTML=chestParticleMarkup(kind,reward.jackpot);
    stage.dataset.stage=motion?"opening":"revealed"; back.hidden=false; document.body.classList.add("v843-chest-open");
    requestAnimationFrame(()=>back.classList.add("show"));
    if(motion)chestRevealTimer=setTimeout(()=>{stage.dataset.stage="revealed";},weekly?1150:850);
    setTimeout(()=>$("v843ChestAccept")?.focus(),motion?(weekly?1500:1200):80);
  }
  function openChest(kind){
    const dailyKey=dayKeyNow(), key=kind==="daily"?dailyKey:weekKey(), id=`chest:${kind}:${key}`;
    if(ledger().some(x=>x.id===id))return;
    if(kind==="daily"&&missionClaimCount(dailyKey)<3){toast("🎁",lang()==="th"?"ทำ Daily Missions ให้ครบ 3 ภารกิจก่อน":"Complete all 3 Daily Missions first","error");return;}
    if(kind==="weekly"&&completedDailyInWeek()<5){toast("🎁",lang()==="th"?"เปิด Daily Chest ให้ครบ 5 วันในสัปดาห์ก่อน":"Open Daily Chests on 5 days this week first","error");return;}
    const reward=chestReward(kind,key), list=ledger(); let amount=0, rewardText=reward.text, resolved={type:reward.type,icon:"🎁",title:reward.text,subtitle:"",rewardText:reward.text,jackpot:false};
    if(reward.type==="coins"){
      amount=reward.coins; const jackpot=kind==="daily"?amount>=25:amount>=80;
      resolved={type:"coins",icon:"🪙",title:`+${amount} Work Coins`,subtitle:kind==="weekly"?(lang()==="th"?"รางวัล Weekly Chest ของสัปดาห์นี้":"Your Weekly Chest reward"):(lang()==="th"?"รางวัล Daily Chest วันนี้":"Today's Daily Chest reward"),rewardText:`+${amount} Coins`,coins:amount,jackpot};
    }
    if(reward.type==="trial"){
      const trial=grantThemeTrial(reward.hours,`${kind}:${key}`);
      if(trial){const theme=rewardBy("theme",trial.themeId);rewardText=`${rewardName(theme)} · ${reward.hours}h Trial`;resolved={type:"trial",icon:theme?.icon||"🎨",title:rewardName(theme),subtitle:lang()==="th"?`Theme Trial ${reward.hours} ชั่วโมง · เปิดใช้งานแล้ว`:`${reward.hours}h Theme Trial · activated`,rewardText,hours:reward.hours,rewardId:trial.themeId,jackpot:false};}
      else{amount=kind==="daily"?20:70;rewardText=`+${amount} Coins`;resolved={type:"coins",icon:"🪙",title:`+${amount} Work Coins`,subtitle:lang()==="th"?"คุณมี Theme ที่ปลดล็อกครบแล้ว จึงเปลี่ยนเป็น Coins":"All eligible themes are already unlocked, so you received Coins instead",rewardText,coins:amount,jackpot:false};}
    }
    if(reward.type==="xp"){
      const mascotId=selectedMascotId(),mascot=rewardBy("mascot",mascotId);addMascotXp(mascotId,reward.xp);const bond=mascotBond(mascotId);rewardText=`+${reward.xp} XP · ${rewardName(mascot)}`;resolved={type:"xp",icon:mascot?.emoji||"🐣",title:`+${reward.xp} Mascot XP`,subtitle:rewardName(mascot),rewardText,xp:reward.xp,mascotId,level:bond.level,progress:bond.progress,jackpot:false};
    }
    list.push({id,amount,type:"chest",labelTh:`${kind==="daily"?"Daily":"Weekly"} Chest · ${rewardText}`,labelEn:`${kind==="daily"?"Daily":"Weekly"} Chest · ${rewardText}`,createdAt:new Date().toISOString(),meta:{kind,key,rewardType:resolved.type,rewardText,rewardIcon:resolved.icon,coins:resolved.coins||0,hours:resolved.hours||0,rewardId:resolved.rewardId||"",xp:resolved.xp||0,mascotId:resolved.mascotId||"",bondLevel:resolved.level||0,bondProgress:resolved.progress||0,jackpot:!!resolved.jackpot}}); write(KEYS.ledger,list);
    // Save first, animate second: refresh/reload during the popup can never reroll this chest.
    applyEquippedRewards(true);refreshAll();showChestRewardModal(kind,resolved);
  }
  function externalChestReward(kind,seed){
    const mode=["daily","weekly","mystery"].includes(kind)?kind:"mystery",roll=seedNumber(`external:${mode}:${seed}`)%100;
    if(mode==="daily"){
      if(roll<72){const coins=[10,15,20,25,30][seedNumber(`${seed}:coins`)%5];return{type:"coins",coins,text:`+${coins} Coins`};}
      if(roll<86)return{type:"trial",hours:24,text:lang()==="th"?"Theme Trial 24 ชั่วโมง":"24h Theme Trial"};
      return{type:"xp",xp:[20,25,30,40][seedNumber(`${seed}:xp`)%4],text:"Mascot XP"};
    }
    if(mode==="weekly"){
      if(roll<62){const coins=[50,60,70,80,100][seedNumber(`${seed}:coins`)%5];return{type:"coins",coins,text:`+${coins} Coins`};}
      if(roll<80)return{type:"trial",hours:48,text:lang()==="th"?"Theme Trial 48 ชั่วโมง":"48h Theme Trial"};
      return{type:"xp",xp:[60,80,100,120][seedNumber(`${seed}:xp`)%4],text:"Mascot XP"};
    }
    if(roll<68){const coins=[20,40,60,80,120,150][seedNumber(`${seed}:coins`)%6];return{type:"coins",coins,text:`+${coins} Coins`};}
    if(roll<84)return{type:"trial",hours:36,text:lang()==="th"?"Mystery Theme Trial 36 ชั่วโมง":"36h Mystery Theme Trial"};
    return{type:"xp",xp:[30,50,75,100][seedNumber(`${seed}:xp`)%4],text:"Mascot XP"};
  }
  function applyExternalChest(kind,sourceId,index,list,ids){
    const id=`reward-code:${sourceId}:chest:${kind}:${index}`;
    const existing=list.find(x=>x.id===id);if(existing)return chestEntryInfo(existing);
    const reward=externalChestReward(kind,`${sourceId}:${index}`);let amount=0,rewardText=reward.text,resolved={type:reward.type,icon:"🎁",title:reward.text,subtitle:"",rewardText:reward.text,jackpot:false};
    if(reward.type==="coins"){
      amount=reward.coins;resolved={type:"coins",icon:"🪙",title:`+${amount} Work Coins`,subtitle:kind==="mystery"?(lang()==="th"?"Mystery Chest จาก Reward Code":"Mystery Chest from Reward Code"):(lang()==="th"?"Chest จาก Reward Code":"Chest from Reward Code"),rewardText:`+${amount} Coins`,coins:amount,jackpot:amount>=100};
    }else if(reward.type==="trial"){
      const trial=grantThemeTrial(reward.hours,`${sourceId}:${kind}:${index}`);
      if(trial){const theme=rewardBy("theme",trial.themeId);rewardText=`${rewardName(theme)} · ${reward.hours}h Trial`;resolved={type:"trial",icon:theme?.icon||"🎨",title:rewardName(theme),subtitle:lang()==="th"?`Theme Trial ${reward.hours} ชั่วโมง`:`${reward.hours}h Theme Trial`,rewardText,hours:reward.hours,rewardId:trial.themeId,jackpot:false};}
      else{amount=kind==="weekly"?80:kind==="mystery"?60:25;rewardText=`+${amount} Coins`;resolved={type:"coins",icon:"🪙",title:`+${amount} Work Coins`,subtitle:lang()==="th"?"Theme ปลดล็อกครบแล้ว จึงเปลี่ยนเป็น Coins":"All eligible themes are unlocked, so this became Coins",rewardText,coins:amount,jackpot:false};}
    }else{
      const mascotId=selectedMascotId(),mascot=rewardBy("mascot",mascotId);addMascotXp(mascotId,reward.xp);const bond=mascotBond(mascotId);rewardText=`+${reward.xp} XP · ${rewardName(mascot)}`;resolved={type:"xp",icon:mascot?.emoji||"🐣",title:`+${reward.xp} Mascot XP`,subtitle:rewardName(mascot),rewardText,xp:reward.xp,mascotId,level:bond.level,progress:bond.progress,jackpot:false};
    }
    list.push({id,amount,type:"reward_code_chest",labelTh:`Reward Code ${kind} Chest · ${rewardText}`,labelEn:`Reward Code ${kind} Chest · ${rewardText}`,createdAt:new Date().toISOString(),meta:{kind,sourceId,rewardType:resolved.type,rewardText,rewardIcon:resolved.icon,coins:resolved.coins||0,hours:resolved.hours||0,rewardId:resolved.rewardId||"",xp:resolved.xp||0,mascotId:resolved.mascotId||"",bondLevel:resolved.level||0,bondProgress:resolved.progress||0,jackpot:!!resolved.jackpot}});ids.add(id);return resolved;
  }
  function normalizeExternalItem(item){
    if(typeof item==="string"){const [type,id]=item.split(":");return{type,id};}
    return item&&typeof item==="object"?{type:String(item.type||""),id:String(item.id||"")}:null;
  }
  function grantExternalReward(payload={}){
    const sourceId=String(payload.sourceId||`external-${Date.now()}`).replace(/[^a-zA-Z0-9:_-]/g,"-").slice(0,160),sourceLabel=String(payload.sourceLabel||"Reward Code");
    const list=ledger(),ids=new Set(list.map(x=>x.id)),owned=ownedRewards(),summary={coins:0,items:[],chests:[]};
    const coins=Math.max(0,Math.round(Number(payload.coins||0))),coinId=`reward-code:${sourceId}:coins`;
    if(coins>0&&!ids.has(coinId)){list.push({id:coinId,amount:coins,type:"reward_code",labelTh:`${sourceLabel} · +${coins} Coins`,labelEn:`${sourceLabel} · +${coins} Coins`,createdAt:new Date().toISOString(),meta:{sourceId,rewardCode:true}});ids.add(coinId);summary.coins=coins;}
    (Array.isArray(payload.items)?payload.items:[]).map(normalizeExternalItem).filter(Boolean).forEach(item=>{
      const reward=rewardBy(item.type,item.id);if(!reward)return;const key=rewardKey(reward),entryId=`reward-code:${sourceId}:item:${key}`;
      if(!owned.has(key)){owned.add(key);summary.items.push({type:reward.type,id:reward.id,name:rewardName(reward),icon:reward.emoji||reward.icon||"🎁",codeExclusive:!!reward.codeExclusive});}
      if(!ids.has(entryId)){list.push({id:entryId,amount:0,type:"reward_code_item",labelTh:`${sourceLabel} · ${rewardName(reward)}`,labelEn:`${sourceLabel} · ${rewardName(reward)}`,createdAt:new Date().toISOString(),meta:{sourceId,rewardText:rewardName(reward),rewardType:reward.type,rewardId:reward.id,rewardCode:true}});ids.add(entryId);}
    });
    (Array.isArray(payload.chests)?payload.chests:[]).forEach(ch=>{const kind=["daily","weekly","mystery"].includes(ch?.kind)?ch.kind:"mystery",count=Math.max(0,Math.min(10,Math.round(Number(ch?.count||0))));for(let i=0;i<count;i++){const before=list.length,res=applyExternalChest(kind,sourceId,i,list,ids);if(list.length>before&&res)summary.chests.push({kind,...res});}});
    write(KEYS.ledger,list);saveOwned(owned);applyEquippedRewards(true);refreshAll();
    try{window.dispatchEvent(new CustomEvent("workday:v8-data-changed",{detail:{source:"reward-code",sourceId}}));window.dispatchEvent(new CustomEvent("workday:v7-data-changed"));}catch{}
    return summary;
  }

  function progressText(value,target){ if(target<=1)return value>=target?(lang()==="th"?"สำเร็จแล้ว":"Completed"):`${Math.round(value)}/${Math.round(target)}`; return `${Math.round(value)}/${Math.round(target)} min`; }
  function renderMissions(){
    const root=$("v82MissionsPage"); if(!root)return; markRouteVisit();
    const key=dayKeyNow(), set=dailyMissionSet(key), c=missionContext(key), claimed=missionClaimCount(key), dailyEntry=chestLedgerEntry("daily",key), dailyOpen=!!dailyEntry, weeklyDone=completedDailyInWeek(), weeklyEntry=chestLedgerEntry("weekly",weekKey()), weeklyOpen=!!weeklyEntry, trial=activeThemeTrial();
    const cards=set.ids.map(id=>{const d=MISSION_DEFS[id],p=missionProgress(id,c),done=p.value+1e-6>=p.target,got=missionClaimed(key,id),pct=Math.max(0,Math.min(100,p.value/Math.max(.0001,p.target)*100));return `<article class="v82-mission-card ${done?"done":""} ${got?"claimed":""}"><div class="v82-mission-icon">${d.icon}</div><div class="v82-mission-copy"><div><strong>${esc(lang()==="th"?d.th:d.en)}</strong><span>+${d.reward} 🪙</span></div><p>${esc(lang()==="th"?d.descTh:d.descEn)}</p><div class="v82-mission-progress"><i><b style="width:${pct}%"></b></i><small>${esc(progressText(p.value,p.target))}</small></div></div><button type="button" data-v82-claim="${id}" ${!done||got?"disabled":""}>${got?"✓ "+(lang()==="th"?"รับแล้ว":"Claimed"):(done?(lang()==="th"?"รับ Coin":"Claim Coins"):(lang()==="th"?"กำลังทำ":"In progress"))}</button></article>`;}).join("");
    const dailyReady=claimed>=3&&!dailyOpen, weeklyReady=weeklyDone>=5&&!weeklyOpen;
    root.innerHTML=`<div class="v7-page-heading"><div class="v7-page-title"><span>🎯</span><div><p class="eyebrow">WORKDAY JOURNEY · V8.5.0</p><h2>${lang()==="th"?"Daily Missions":"Daily Missions"}</h2><p class="muted">${lang()==="th"?"ภารกิจสุ่มใหม่ทุกวัน ทำให้ครบเพื่อเปิด Daily Chest และสะสมวันสำหรับ Weekly Chest":"Fresh missions every day. Complete all three to open a Daily Chest and build toward the Weekly Chest."}</p></div></div></div>${trial?`<section class="v82-trial-banner">🌈 <div><strong>${esc(rewardName(rewardBy("theme",trial.themeId)))} Theme Trial</strong><span>${lang()==="th"?"ใช้งานได้ถึง":"Active until"} ${esc(formatHistoryDate(trial.expiresAt))}</span></div></section>`:""}<section class="v82-mission-hero"><div><span>🎯</span><div><small>${lang()==="th"?"ภารกิจวันนี้":"TODAY'S MISSIONS"}</small><strong>${claimed}/3</strong></div></div><div><small>${lang()==="th"?"รับ Coin วันนี้จาก Mission":"Mission Coins Today"}</small><b>+${ledger().filter(x=>String(x.id||"").startsWith(`earn:mission:${key}:`)).reduce((a,x)=>a+Number(x.amount||0),0)} 🪙</b></div></section><section class="v82-mission-list">${cards}</section><section class="v82-chest-grid"><article class="v82-chest-card daily ${dailyReady?"ready":""}"><div class="v82-chest-art">🎁</div><div><p class="eyebrow">DAILY CHEST</p><h3>${dailyOpen?(lang()==="th"?"เปิดแล้ววันนี้":"Opened today"):(dailyReady?(lang()==="th"?"พร้อมเปิด!":"Ready to open!"):(lang()==="th"?`ทำภารกิจ ${claimed}/3`:`Missions ${claimed}/3`))}</h3><p>${lang()==="th"?"สุ่ม 5–30 Coins, Theme Trial 24h หรือ Mascot XP":"Random 5–30 Coins, a 24h Theme Trial, or Mascot XP"}</p>${chestCardRewardMarkup(dailyEntry,"daily")}</div><button type="button" data-v82-chest="daily" ${!dailyReady?"disabled":""}>${dailyOpen?"✓ OPENED":"OPEN CHEST"}</button></article><article class="v82-chest-card weekly ${weeklyReady?"ready":""}"><div class="v82-chest-art">🏆</div><div><p class="eyebrow">WEEKLY CHEST</p><h3>${weeklyOpen?(lang()==="th"?"เปิดแล้วสัปดาห์นี้":"Opened this week"):(weeklyReady?(lang()==="th"?"พร้อมเปิด!":"Ready to open!"):`${weeklyDone}/5 DAYS`)}</h3><p>${lang()==="th"?"เปิด Daily Chest ครบ 5 วัน · รางวัลใหญ่ 40–100 Coins, Theme Trial 48h หรือ Mascot XP":"Open Daily Chests on 5 days · bigger rewards: 40–100 Coins, 48h Theme Trial, or Mascot XP"}</p>${chestCardRewardMarkup(weeklyEntry,"weekly")}</div><button type="button" data-v82-chest="weekly" ${!weeklyReady?"disabled":""}>${weeklyOpen?"✓ OPENED":"OPEN WEEKLY"}</button></article></section>`;
    qa("[data-v82-claim]",root).forEach(btn=>btn.addEventListener("click",()=>claimMission(btn.dataset.v82Claim)));
    qa("[data-v82-chest]",root).forEach(btn=>btn.addEventListener("click",()=>openChest(btn.dataset.v82Chest)));
    window.WorkdayV853?.refresh?.();
    window.WorkdayV850?.refresh?.();
  }


  // ---------- V8.5.0 Finance achievement state bridge ----------
  function featureAchievementStats(){const value=read(KEYS.featureStats,{});return value&&typeof value==="object"&&!Array.isArray(value)?value:{};}
  function saveFeatureAchievementStats(patch){
    const prev=featureAchievementStats(),next={...prev,...patch,updatedAt:new Date().toISOString()};
    const a={...prev},b={...next};delete a.updatedAt;delete b.updatedAt;
    if(JSON.stringify(a)===JSON.stringify(b))return false;write(KEYS.featureStats,next);return true;
  }
  function featureAchievementItems(category){return API.getAchievements(API.getStats()).filter(a=>a.category===category);}
  function featureAchievementProgressText(a){
    const cur=Math.min(Number(a.current)||0,Number(a.target)||1),target=Number(a.target)||1,locale=lang()==="th"?"th-TH":"en-US";
    const suffix={coins:" 🪙",days:lang()==="th"?" วัน":" days",companies:lang()==="th"?" บริษัท":" companies",lessons:lang()==="th"?" บท":" lessons",files:lang()==="th"?" ไฟล์":" files",versions:lang()==="th"?" เวอร์ชัน":" versions",trades:lang()==="th"?" ครั้ง":" trades",deposits:lang()==="th"?" ครั้ง":" deposits"}[a.unit]||"";
    return `${cur.toLocaleString(locale,{maximumFractionDigits:a.unit==="coins"?2:0})}/${target.toLocaleString(locale,{maximumFractionDigits:a.unit==="coins"?2:0})}${suffix}`;
  }
  function featureAchievementCardMarkup(a,compact=false){
    const reward=Math.max(0,Number(a.coinReward)||0),claimed=reward>0&&ledger().some(x=>x.id===`earn:achievement:${a.id}`),pct=Math.max(0,Math.min(100,Number(a.percent)||0));
    return `<article class="v846-feature-ach ${a.unlocked?"unlocked":"locked"} ${compact?"compact":""}"><span>${a.unlocked?a.icon:"🔒"}</span><div><strong>${esc(API.translate(a.titleKey))}</strong><small>${esc(API.translate(a.descKey))}</small><i><b style="width:${pct}%"></b></i><em>${a.unlocked?(lang()==="th"?"สำเร็จแล้ว":"Completed"):esc(featureAchievementProgressText(a))}</em></div><mark>🪙 +${reward}${a.unlocked&&claimed?" ✓":""}</mark></article>`;
  }

  // ---------- V8.5.0 Work Bank + Finale Boost + Compound Interest ----------
  const isSignedInBank = () => !!window.WorkdayV8Cloud?.isSignedIn?.();
  const bankBridge = () => window.WorkdayBankSecurity;
  function bankLedger(){
    if(isSignedInBank())return bankBridge()?.getCached?.()?.transactions || [];
    const value=read(KEYS.bankLedger,[]); return Array.isArray(value)?value:[];
  }
  function bankState(){
    if(isSignedInBank())return bankBridge()?.getCached?.()?.state || {};
    const value=read(KEYS.bankState,{}); return value&&typeof value==="object"&&!Array.isArray(value)?value:{};
  }
  function saveBankState(value){
    if(isSignedInBank())return; // server-owned data cannot be mutated by render/interest code
    write(KEYS.bankState,value&&typeof value==="object"?value:{});
  }
  function roundBank(value){ return Math.round((Number(value)||0)*100)/100; }
  function bankBalance(list=bankLedger()){
    if(isSignedInBank())return roundBank(bankBridge()?.getCached?.()?.savings || 0);
    return roundBank(list.reduce((sum,item)=>sum+Number(item?.amount||0),0));
  }
  function bankInterestEarned(list=bankLedger()){
    if(isSignedInBank())return roundBank(bankBridge()?.getCached?.()?.interestEarned || 0);
    return roundBank(list.filter(x=>x?.type==="interest").reduce((sum,item)=>sum+Math.max(0,Number(item?.amount||0)),0));
  }
  function bankTierFrom(amount,tiers=BANK_TIERS){
    const value=Math.max(0,Number(amount)||0); return tiers.find(t=>value>=t.min&&value<=t.max)||tiers[tiers.length-1];
  }
  function bankTier(amount=bankBalance()){ return bankTierFrom(amount,BANK_TIERS); }
  function bankLocale(){return lang()==="th"?"th-TH":"en-US";}
  function formatBankCoin(value){
    const n=roundBank(value),fraction=Math.abs(n-Math.round(n))>.0001;
    return n.toLocaleString(bankLocale(),{minimumFractionDigits:fraction?2:0,maximumFractionDigits:2});
  }
  function bankTxId(kind){
    const suffix=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.floor(Math.random()*1000000)}`; return `bank:${kind}:${suffix}`;
  }
  function bankDateLabel(key){
    const d=dateFromKey(key); return new Intl.DateTimeFormat(bankLocale(),{day:"2-digit",month:"short",year:"numeric"}).format(d);
  }
  function bankStampDateKey(stamp){
    const d=new Date(stamp||0); return Number.isNaN(d.getTime())?dayKeyNow():dateKey(d);
  }
  function bankDaysBetween(startKey,endKey){
    if(!startKey||!endKey)return 0; const a=dateFromKey(startKey),b=dateFromKey(endKey); return Math.max(0,Math.round((b-a)/86400000));
  }
  function deriveBankStreakStart(list=bankLedger()){
    const sorted=list.slice().sort((a,b)=>new Date(a.createdAt||0)-new Date(b.createdAt||0));
    let amount=0,start=null;
    for(const item of sorted){
      const before=amount,n=Number(item?.amount||0); amount=roundBank(amount+n);
      if(item?.type==="deposit"&&before<=0&&amount>0)start=bankStampDateKey(item.createdAt);
      if(item?.type==="withdraw"){ if(amount>0)start=bankStampDateKey(item.createdAt); else start=null; }
    }
    return amount>0?start:null;
  }
  function ensureBankV844State(state=bankState(),list=bankLedger()){
    if(isSignedInBank())return state;
    let changed=false; const savings=bankBalance(list),hasBankData=list.length>0||!!state.openedAt||!!state.lastInterestDate||savings>0;
    // Do not create empty Bank state before Cloud data has a chance to load.
    if(!hasBankData)return state;
    if(!state.boostStartedDate){state.boostStartedDate=dayKeyNow();changed=true;}
    if(savings>0&&!state.streakStartDate){state.streakStartDate=deriveBankStreakStart(list)||dayKeyNow();changed=true;}
    if(savings<=0&&state.streakStartDate){state.streakStartDate=null;changed=true;}
    if(changed)saveBankState(state); return state;
  }
  function bankStreakDays(state=bankState(),targetKey=dayKeyNow(),amount=bankBalance()){
    if(Math.max(0,Number(amount)||0)<=0||!state?.streakStartDate||String(targetKey)<String(state.streakStartDate))return 0;
    return bankDaysBetween(state.streakStartDate,targetKey)+1;
  }
  function bankStreakBonusRate(days){
    const hit=BANK_STREAK_BONUSES.find(x=>Number(days)>=x.days); return hit?.rate||0;
  }
  function bankRateInfo(amount=bankBalance(),targetKey=dayKeyNow(),state=bankState()){
    const value=Math.max(0,Number(amount)||0),boostStart=state?.boostStartedDate||dayKeyNow(),boosted=String(targetKey)>=String(boostStart);
    if(!boosted){const tier=bankTierFrom(value,LEGACY_BANK_TIERS);return{tier,baseRate:tier.rate,bonusRate:0,effectiveRate:tier.rate,streakDays:0,cap:LEGACY_BANK_DAILY_CAP,boosted:false};}
    const tier=bankTier(value),streakDays=bankStreakDays(state,targetKey,value),bonusRate=bankStreakBonusRate(streakDays);
    return {tier,baseRate:tier.rate,bonusRate,effectiveRate:tier.rate+bonusRate,streakDays,cap:BANK_DAILY_CAP,boosted:true};
  }
  function bankDailyInterest(amount=bankBalance(),targetKey=dayKeyNow(),state=bankState()){
    const value=Math.max(0,Number(amount)||0),info=bankRateInfo(value,targetKey,state); return roundBank(Math.min(info.cap,value*info.effectiveRate));
  }
  function bankNextStreakMilestone(days){
    const ordered=[3,7,14],next=ordered.find(x=>x>Number(days||0));
    if(!next)return null; const rate=BANK_STREAK_BONUSES.find(x=>x.days===next)?.rate||0;return{days:next,remaining:Math.max(0,next-Number(days||0)),rate};
  }
  function settleBankInterest({notify=false}={}){
    if(isSignedInBank()){
      // The bank RPC accrues time-based interest, not the browser clock.
      if(location.hash.includes('/bank'))bankBridge()?.ensureFresh?.();
      return 0;
    }
    const today=dayKeyNow(),list=bankLedger(),state=ensureBankV844State(bankState(),list); let amount=bankBalance(list);
    if(amount<=0){
      if((state.openedAt||list.length)&&state.lastInterestDate!==today){state.lastInterestDate=today;saveBankState(state);} return 0;
    }
    if(!state.openedAt)state.openedAt=new Date().toISOString();
    if(!state.lastInterestDate){state.lastInterestDate=today;saveBankState(state);return 0;}
    let cursor=dateFromKey(state.lastInterestDate),end=dateFromKey(today),total=0,changed=false,guard=0;
    while(cursor<end&&guard<3660){
      cursor=addDays(cursor,1); guard++;
      const key=dateKey(cursor),id=`bank:interest:${key}`;
      if(list.some(x=>x.id===id)){state.lastInterestDate=key;continue;}
      const info=bankRateInfo(amount,key,state),interest=roundBank(Math.min(info.cap,amount*info.effectiveRate));
      if(interest>0){
        list.push({id,amount:interest,type:"interest",labelTh:`ดอกเบี้ยรายวัน · ${bankDateLabel(key)}`,labelEn:`Daily Interest · ${bankDateLabel(key)}`,createdAt:isoFromDateKey(key),meta:{date:key,rate:info.effectiveRate,baseRate:info.baseRate,streakBonusRate:info.bonusRate,streakDays:info.streakDays,tier:info.tier.id,balanceBefore:amount,cap:info.cap,finaleBoost:info.boosted}});
        amount=roundBank(amount+interest); total=roundBank(total+interest); changed=true;
      }
      state.lastInterestDate=key;
    }
    if(changed)write(KEYS.bankLedger,list); saveBankState(state);
    if(changed)reconcileRewards({notify});
    if(notify&&total>0)toast("🏦",`${lang()==="th"?"รับดอกเบี้ยทบต้นแล้ว":"Compound interest credited"} +${formatBankCoin(total)} Coins`,`success`);
    return total;
  }
  async function bankSecureTransfer(direction,rawAmount){
    const amount=Number(rawAmount),bank=bankBridge();
    if(!Number.isSafeInteger(amount)||amount<1){
      toast("!",lang()==="th"?"Enter a whole Coin amount (1 or more)":"Enter a whole Coin amount (1 or more)","error");return;
    }
    if(!bank?.getCached?.()){
      toast("!","Secure Bank is not ready. Please wait for Supabase.","error");
      bank?.refresh?.({force:true}).catch(()=>{});return;
    }
    if(direction==="deposit"&&amount>balance()){
      toast("!",t("insufficient"),"error");return;
    }
    if(direction==="withdraw"&&amount>Math.floor(bankBalance())){
      toast("!","Not enough Savings","error");return;
    }
    try{
      await bank.move(direction,amount);
      toast("🏦",direction==="deposit"?"Deposit confirmed by Supabase":"Withdrawal confirmed by Supabase","success");
      reconcileRewards({notify:false});refreshAll();
    }catch(error){
      const message=String(error?.message||error||"BANK_ERROR");
      toast("!",`${lang()==="th"?"รายการไม่สำเร็จ":"Transaction failed"}: ${message}`,"error");
    }
  }
  function bankDeposit(rawAmount){
    if(isSignedInBank())return bankSecureTransfer("deposit",rawAmount);
    settleBankInterest({notify:false});
    const amount=Math.floor(Number(rawAmount)||0),wallet=balance();
    if(amount<1){toast("🏦",lang()==="th"?"กรุณาระบุจำนวน Coin ที่ต้องการฝาก":"Enter the amount of Coins to deposit","error");return;}
    if(amount>wallet){toast("🪙",t("insufficient"),"error");return;}
    const now=new Date().toISOString(),tx=bankTxId("deposit"),walletList=ledger(),bankList=bankLedger(),state=ensureBankV844State(bankState(),bankList),wasEmpty=bankBalance(bankList)<=0;
    walletList.push({id:`${tx}:wallet`,amount:-amount,type:"bank_deposit",labelTh:`ฝากเข้า Work Bank · ${amount} Coins`,labelEn:`Work Bank Deposit · ${amount} Coins`,createdAt:now,meta:{bankTx:tx}});
    bankList.push({id:`${tx}:savings`,amount,type:"deposit",labelTh:`ฝากจาก Wallet · ${amount} Coins`,labelEn:`Deposit from Wallet · ${amount} Coins`,createdAt:now,meta:{bankTx:tx}});
    if(!state.boostStartedDate)state.boostStartedDate=dayKeyNow();
    if(!state.openedAt)state.openedAt=now; if(wasEmpty){state.lastInterestDate=dayKeyNow();state.streakStartDate=dayKeyNow();} else if(!state.lastInterestDate)state.lastInterestDate=dayKeyNow();
    write(KEYS.ledger,walletList);write(KEYS.bankLedger,bankList);saveBankState(state);
    reconcileRewards({notify:true});toast("🏦",`${lang()==="th"?"ฝากสำเร็จ · เริ่มสะสม Savings Streak":"Deposited · Savings Streak active"} ${amount.toLocaleString(bankLocale())} Coins`,`success`);refreshAll();
  }
  function bankWithdraw(rawAmount){
    if(isSignedInBank())return bankSecureTransfer("withdraw",rawAmount);
    settleBankInterest({notify:false});
    const savings=bankBalance(),amount=Math.floor(Number(rawAmount)||0);
    if(amount<1){toast("🏦",lang()==="th"?"กรุณาระบุจำนวน Coin ที่ต้องการถอน":"Enter the amount of Coins to withdraw","error");return;}
    if(amount>Math.floor(savings)){toast("🏦",lang()==="th"?"ยอด Savings ไม่เพียงพอ":"Not enough Savings","error");return;}
    const now=new Date().toISOString(),tx=bankTxId("withdraw"),walletList=ledger(),bankList=bankLedger(),state=ensureBankV844State(bankState(),bankList),remaining=roundBank(savings-amount);
    walletList.push({id:`${tx}:wallet`,amount,type:"bank_withdraw",labelTh:`ถอนจาก Work Bank · ${amount} Coins`,labelEn:`Work Bank Withdrawal · ${amount} Coins`,createdAt:now,meta:{bankTx:tx}});
    bankList.push({id:`${tx}:savings`,amount:-amount,type:"withdraw",labelTh:`ถอนกลับ Wallet · ${amount} Coins`,labelEn:`Withdraw to Wallet · ${amount} Coins`,createdAt:now,meta:{bankTx:tx}});
    state.streakStartDate=remaining>0?dayKeyNow():null;
    if(remaining<=0)state.lastInterestDate=dayKeyNow();
    write(KEYS.ledger,walletList);write(KEYS.bankLedger,bankList);saveBankState(state);
    reconcileRewards({notify:true});toast("🏦",`${lang()==="th"?"ถอนสำเร็จ · Savings Streak เริ่มใหม่":"Withdrawn · Savings Streak reset"} ${amount.toLocaleString(bankLocale())} Coins`,`success`);refreshAll();
  }
  function bankProjection(days,starting=bankBalance(),state=bankState()){
    let value=Math.max(0,Number(starting)||0),interest=0,key=dayKeyNow();
    for(let i=1;i<=Math.max(0,Math.floor(Number(days)||0));i++){
      const d=addDays(dateFromKey(key),i),futureKey=dateKey(d),info=bankRateInfo(value,futureKey,state),gain=roundBank(Math.min(info.cap,value*info.effectiveRate));
      value=roundBank(value+gain);interest=roundBank(interest+gain);
    }
    return {balance:value,interest};
  }
  function bankHistoryLabel(item){return lang()==="th"?(item.labelTh||item.labelEn||item.type):(item.labelEn||item.labelTh||item.type);}
  function renderBank(){
    const root=$("v83BankPage");if(!root)return;
    if(isSignedInBank()){
      const bank=bankBridge();
      if(!bank?.getCached?.()){
        const message=bank?.getError?.();
        root.innerHTML=`<section class="v8601-bank-pending" role="status"><span class="v8601-bank-pending-icon">🏦</span><h3>${message?"Secure Bank unavailable":"Loading secure Work Bank"}</h3><p>${message?esc(message):"Checking savings and transactions with Supabase. No Local balance will be used."}</p><button type="button" data-v8601-retry>Retry connection</button></section>`;
        root.querySelector('[data-v8601-retry]')?.addEventListener('click',()=>bank?.refresh?.({force:true}).catch(()=>{}));
        if(!message)bank?.ensureFresh?.();
        return;
      }
      bank.ensureFresh?.();
    }
    settleBankInterest({notify:true});
    const wallet=balance(),list=bankLedger().slice().sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)),savings=bankBalance(list),state=ensureBankV844State(bankState(),list),rateInfo=bankRateInfo(savings,dayKeyNow(),state),tier=rateInfo.tier,daily=bankDailyInterest(savings,dayKeyNow(),state),earned=bankInterestEarned(list),streakDays=rateInfo.streakDays,nextStreak=bankNextStreakMilestone(streakDays),finale=journeyFinaleInfo(),p1=bankProjection(1,savings,state),p7=bankProjection(7,savings,state),p14=bankProjection(14,savings,state),pEnd=bankProjection(Math.max(0,finale.days),savings,state);
    const tierIndex=BANK_TIERS.findIndex(x=>x.id===tier.id),next=BANK_TIERS[tierIndex+1]||null,nextGap=next?Math.max(0,roundBank(next.min-savings)):0;
    const tierCards=BANK_TIERS.map(item=>`<article class="v83-tier-card ${item.id===tier.id?"active":""}"><span>${item.icon}</span><div><strong>${esc(lang()==="th"?item.th:item.en)}</strong><small>${item.max===Infinity?`${item.min.toLocaleString()}+`:`${item.min.toLocaleString()}–${Math.floor(item.max).toLocaleString()}`} Coins</small></div><b>${(item.rate*100).toFixed(2)}%<small>/day</small></b></article>`).join("");
    const history=list.length?list.slice(0,60).map(item=>{const n=Number(item.amount||0),kind=item.type==="interest"?"interest":n>=0?"deposit":"withdraw";return `<div class="v83-bank-history-row ${kind}"><span>${item.type==="interest"?"✨":item.type==="deposit"?"↓":"↑"}</span><div><strong>${esc(bankHistoryLabel(item))}</strong><small>${esc(formatHistoryDate(item.createdAt))}</small></div><b>${n>=0?"+":""}${formatBankCoin(n)} 🪙</b></div>`;}).join(""):`<div class="empty-state">🏦 ${lang()==="th"?"ยังไม่มีรายการฝากถอน":"No bank transactions yet"}</div>`;
    const streakText=streakDays>0?(lang()==="th"?`${streakDays} วันต่อเนื่อง`:`${streakDays}-day streak`):(lang()==="th"?"เริ่มฝากเพื่อสร้าง Streak":"Deposit to start a streak");
    const nextStreakText=nextStreak?(lang()==="th"?`อีก ${nextStreak.remaining} วัน รับโบนัส +${(nextStreak.rate*100).toFixed(2)}%/วัน`:`${nextStreak.remaining} more day(s) to +${(nextStreak.rate*100).toFixed(2)}%/day bonus`):(lang()==="th"?"ปลดล็อก Streak Bonus สูงสุดแล้ว":"Maximum Streak Bonus unlocked");
    const bankAchievements=featureAchievementItems("bank"),bankAchievementDone=bankAchievements.filter(a=>a.unlocked).length,bankAchievementMarkup=bankAchievements.map(a=>featureAchievementCardMarkup(a,true)).join("");
    root.innerHTML=`<div class="v7-page-heading"><div class="v7-page-title"><span>🏦</span><div><p class="eyebrow">WORKDAY JOURNEY · V8.5.0</p><h2>Work Bank</h2><p class="muted">${lang()==="th"?"Finale Bank Boost · ฝาก Work Coins รับดอกเบี้ยทบต้นรายวัน พร้อม Savings Streak Bonus":"Finale Bank Boost · earn compounding daily interest plus Savings Streak bonuses."}</p></div></div></div>
      <section class="v83-bank-hero"><div class="v83-bank-balance"><div class="v83-bank-orb">🏦</div><div><small>${lang()==="th"?"SAVINGS BALANCE":"SAVINGS BALANCE"}</small><strong>${formatBankCoin(savings)} <i>🪙</i></strong><span>${tier.icon} ${esc(lang()==="th"?tier.th:tier.en)} · ${(rateInfo.effectiveRate*100).toFixed(2)}% / day${rateInfo.bonusRate>0?` (${(rateInfo.baseRate*100).toFixed(2)}% + 🔥 ${(rateInfo.bonusRate*100).toFixed(2)}%)`:""}</span></div></div><div class="v83-bank-kpis"><article><small>${lang()==="th"?"Wallet ใช้จ่ายได้":"Wallet available"}</small><b>${wallet.toLocaleString(bankLocale())} 🪙</b></article><article><small>${lang()==="th"?"ดอกเบี้ยรอบถัดไป":"Next daily interest"}</small><b>+${formatBankCoin(daily)} 🪙</b></article><article><small>${lang()==="th"?"ดอกเบี้ยสะสม":"Interest earned"}</small><b>+${formatBankCoin(earned)} 🪙</b></article></div></section>
      <section class="v844-bank-boost"><div class="v844-boost-title"><span>🚀</span><div><p class="eyebrow">FINALE BANK BOOST</p><h3>${lang()==="th"?"ดอกเบี้ยแรงขึ้น + ทบต้นทุกวัน":"Higher rates + daily compounding"}</h3><p>${lang()==="th"?`Base Rate ${(rateInfo.baseRate*100).toFixed(2)}% + Streak Bonus ${(rateInfo.bonusRate*100).toFixed(2)}% · สูงสุด ${BANK_DAILY_CAP} Coins/วัน`:`Base ${(rateInfo.baseRate*100).toFixed(2)}% + Streak ${(rateInfo.bonusRate*100).toFixed(2)}% · capped at ${BANK_DAILY_CAP} Coins/day`}</p></div></div><div class="v844-streak-status"><span><small>🔥 SAVINGS STREAK</small><b>${esc(streakText)}</b><em>${esc(nextStreakText)}</em></span><div class="v844-streak-steps">${[[3,.001],[7,.0025],[14,.005]].map(([d,r])=>`<i class="${streakDays>=d?"done":""}"><b>${d}D</b><small>+${(r*100).toFixed(2)}%</small></i>`).join("")}</div></div></section>
      <section class="v846-bank-achievements"><div class="v83-bank-section-head"><div><p class="eyebrow">SAVINGS ACHIEVEMENTS</p><h3>${lang()==="th"?"เป้าหมาย Work Bank":"Work Bank goals"}</h3></div><span>${bankAchievementDone}/${bankAchievements.length} · ${lang()==="th"?"มี Coin Reward":"Coin rewards"}</span></div><div class="v846-feature-ach-grid">${bankAchievementMarkup}</div></section>
      <section class="v83-bank-actions"><article class="v83-bank-action-card deposit"><div><span>↓</span><div><p class="eyebrow">DEPOSIT</p><h3>${lang()==="th"?"ฝากเข้า Savings":"Move to Savings"}</h3><p>${lang()==="th"?"Coin ที่ฝากจะไม่สามารถซื้อ Reward ได้จนกว่าจะถอนกลับ Wallet · ฝากเพิ่มไม่รีเซ็ต Streak":"Saved Coins cannot be spent until withdrawn · extra deposits do not reset your Streak."}</p></div></div><div class="v83-bank-input"><span>🪙</span><input id="v83DepositAmount" type="number" min="1" step="1" inputmode="numeric" placeholder="0"><button type="button" data-v83-deposit>DEPOSIT</button></div><div class="v83-bank-quick">${[25,50,100].map(p=>`<button type="button" data-v83-deposit-pct="${p}">${p===100?"MAX":p+"%"}</button>`).join("")}</div></article>
      <article class="v83-bank-action-card withdraw"><div><span>↑</span><div><p class="eyebrow">WITHDRAW</p><h3>${lang()==="th"?"ถอนกลับ Wallet":"Return to Wallet"}</h3><p>${lang()==="th"?`ถอนได้สูงสุด ${Math.floor(savings).toLocaleString(bankLocale())} Coins · การถอนทุกครั้งจะรีเซ็ต Savings Streak`:`Withdraw up to ${Math.floor(savings).toLocaleString(bankLocale())} Coins · any withdrawal resets the Savings Streak.`}</p></div></div><div class="v83-bank-input"><span>🪙</span><input id="v83WithdrawAmount" type="number" min="1" step="1" inputmode="numeric" placeholder="0"><button type="button" data-v83-withdraw>WITHDRAW</button></div><div class="v83-bank-quick">${[25,50,100].map(p=>`<button type="button" data-v83-withdraw-pct="${p}">${p===100?"MAX":p+"%"}</button>`).join("")}</div></article></section>
      <section class="v83-bank-growth"><article><p class="eyebrow">SAVINGS TIER</p><h3>${tier.icon} ${esc(lang()==="th"?tier.th:tier.en)}</h3><div class="v83-tier-list">${tierCards}</div>${next?`<p class="v83-next-tier">${lang()==="th"?`อีก ${formatBankCoin(nextGap)} Coins ถึง ${next.icon} ${next.th}`:`${formatBankCoin(nextGap)} Coins to ${next.icon} ${next.en}`}</p>`:`<p class="v83-next-tier max">👑 ${lang()==="th"?"คุณอยู่ Tier สูงสุดแล้ว":"You are at the highest tier"}</p>`}</article><article class="v83-projection v844-projection"><p class="eyebrow">COMPOUND FORECAST</p><h3>${lang()==="th"?"ถ้าไม่ถอนเงิน Savings จะโตเท่าไหร่":"How Savings can grow if left untouched"}</h3><div><span><small>TOMORROW</small><b>+${formatBankCoin(p1.interest)} 🪙</b><em>${formatBankCoin(p1.balance)} total</em></span><span><small>7 DAYS</small><b>+${formatBankCoin(p7.interest)} 🪙</b><em>${formatBankCoin(p7.balance)} total</em></span><span><small>14 DAYS</small><b>+${formatBankCoin(p14.interest)} 🪙</b><em>${formatBankCoin(p14.balance)} total</em></span><span class="journey-end"><small>🎓 JOURNEY END</small><b>+${formatBankCoin(pEnd.interest)} 🪙</b><em>${formatBankCoin(pEnd.balance)} total · ${finale.days} days</em></span></div><p>${lang()==="th"?`ดอกเบี้ยเข้าบัญชี Savings และถูกนำไปคิดดอกวันถัดไปอัตโนมัติ · Cap ${BANK_DAILY_CAP} Coins/วัน`:`Interest is credited into Savings and automatically compounds the next day · ${BANK_DAILY_CAP} Coin/day cap.`}</p></article></section>
      <section class="v83-bank-history"><div class="v83-bank-section-head"><div><p class="eyebrow">BANK LEDGER</p><h3>${lang()==="th"?"ประวัติ Savings":"Savings history"}</h3></div><span>${state.openedAt?`${lang()==="th"?"เปิดบัญชี":"Opened"} ${esc(formatHistoryDate(state.openedAt))}`:(lang()==="th"?"ยังไม่ได้ฝาก Coin":"No deposit yet")}</span></div><div class="v83-bank-history-list">${history}</div></section>`;
    if(isSignedInBank()&&bankBridge()?.hasLocalOnlySavings?.()){
      const note=document.createElement('aside');
      note.className='v8601-bank-legacy-notice';
      note.textContent=lang()==='th'
        ?'ยอด Savings แบบ Local ที่เคยฝากยังเก็บไว้ใน Browser แต่ไม่ถูกนำเข้า Cloud อัตโนมัติ หากต้องการกู้ยอดเดิมให้ติดต่อ Owner เพื่อตรวจสอบ'
        :'Older Local-only Savings are backed up on this device, but are not auto-imported into Cloud. Contact the Owner to review any previous balance.';
      root.prepend(note);
    }
    const dep=$("v83DepositAmount"),wd=$("v83WithdrawAmount");
    q("[data-v83-deposit]",root)?.addEventListener("click",()=>bankDeposit(dep?.value));q("[data-v83-withdraw]",root)?.addEventListener("click",()=>bankWithdraw(wd?.value));
    qa("[data-v83-deposit-pct]",root).forEach(btn=>btn.addEventListener("click",()=>{if(dep)dep.value=Math.floor(wallet*Number(btn.dataset.v83DepositPct||0)/100)||"";}));
    qa("[data-v83-withdraw-pct]",root).forEach(btn=>btn.addEventListener("click",()=>{if(wd)wd.value=Math.floor(savings*Number(btn.dataset.v83WithdrawPct||0)/100)||"";}));
    [dep,wd].filter(Boolean).forEach(input=>input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();input===dep?bankDeposit(input.value):bankWithdraw(input.value);}}));
    if(isSignedInBank()&&bankBridge()?.isBusy?.()){
      [dep,wd,...qa('[data-v83-deposit],[data-v83-withdraw]',root)].filter(Boolean).forEach(el=>{el.disabled=true;});
    }
    window.WorkdayV854?.refresh?.();
    window.WorkdayV850?.refresh?.();
  }

  // ---------- V8.5.0 Work Exchange ----------
  const EXCHANGE_EPOCH_KEY = "2026-05-05";
  const EXCHANGE_FEE_RATE = 0.01;
  const EXCHANGE_SLOTS = [7,8,9,10,11,12,13,14,15,16];
  const EXCHANGE_OPEN_HOUR = EXCHANGE_SLOTS[0];
  const EXCHANGE_CLOSE_HOUR = EXCHANGE_SLOTS[EXCHANGE_SLOTS.length-1];
  const EXCHANGE_LAST_TRADABLE_SLOT = EXCHANGE_SLOTS.length-2;
  const EXCHANGE_LEGACY_SLOT_COUNT = 4;
  const EXCHANGE_STOCKS = [
    {symbol:"FOCS",icon:"🎯",name:"Focus Corp",th:"โฟกัส คอร์ป",sectorTh:"ประสิทธิภาพการทำงาน",sectorEn:"Productivity",base:36,vol:.008,drift:.00035,risk:"low",descTh:"บริการและเครื่องมือช่วยโฟกัสงาน เหมาะกับสายลงทุนที่ชอบความผันผวนต่ำ",descEn:"Focus and productivity services with comparatively low simulated volatility."},
    {symbol:"TECH",icon:"💻",name:"Productivity Tech",th:"โปรดักทิวิตี้ เทค",sectorTh:"เทคโนโลยี",sectorEn:"Technology",base:58,vol:.015,drift:.00055,risk:"medium",descTh:"ซอฟต์แวร์และเครื่องมือดิจิทัลสำหรับการทำงาน เติบโตดีแต่ราคาแกว่งกว่าหุ้น Defensive",descEn:"Workplace software and digital tools with medium simulated volatility."},
    {symbol:"COFF",icon:"☕",name:"Office Coffee",th:"ออฟฟิศ คอฟฟี่",sectorTh:"เครื่องดื่ม",sectorEn:"Consumer",base:18,vol:.026,drift:.00020,risk:"high",descTh:"หุ้นสายกาแฟออฟฟิศ ราคาไวต่อกระแสและ Event ประจำวัน เหมาะกับคนชอบความตื่นเต้น",descEn:"Office coffee brand with high event sensitivity and simulated volatility."},
    {symbol:"ENGY",icon:"⚡",name:"Energy Works",th:"เอ็นเนอร์จี เวิร์คส์",sectorTh:"พลังงาน",sectorEn:"Energy",base:72,vol:.013,drift:.00025,risk:"medium",descTh:"ธุรกิจพลังงานสำหรับโรงงานและสำนักงาน ราคาขยับตาม Event ด้านต้นทุนและสัญญาพลังงาน",descEn:"Industrial energy business with medium simulated volatility."},
    {symbol:"SAFE",icon:"🦺",name:"Safe Industries",th:"เซฟ อินดัสทรีส์",sectorTh:"ความปลอดภัย",sectorEn:"Safety",base:44,vol:.007,drift:.00030,risk:"low",descTh:"อุปกรณ์และระบบความปลอดภัย มีความผันผวนต่ำและตอบสนองต่อข่าว Audit หรือ Safety Campaign",descEn:"Safety equipment and systems with low simulated volatility."},
    {symbol:"DATA",icon:"🗄️",name:"Data Systems",th:"ดาต้า ซิสเต็มส์",sectorTh:"ข้อมูลและ Analytics",sectorEn:"Data",base:65,vol:.017,drift:.00050,risk:"medium",descTh:"ระบบข้อมูลและ Analytics สำหรับองค์กร เติบโตตาม Demand ของ Dashboard และ Data Platform",descEn:"Enterprise data and analytics platform with medium simulated volatility."},
    {symbol:"AUTO",icon:"🤖",name:"Automation Labs",th:"ออโตเมชัน แล็บส์",sectorTh:"Automation",sectorEn:"Automation",base:90,vol:.028,drift:.00065,risk:"high",descTh:"Automation และ Smart Factory มีโอกาสขึ้นแรงและลงแรง เหมาะกับคนรับความผันผวนได้",descEn:"Automation and smart-factory company with high simulated volatility."},
    {symbol:"LOGI",icon:"🚚",name:"Logistics Express",th:"โลจิสติกส์ เอ็กซ์เพรส",sectorTh:"โลจิสติกส์",sectorEn:"Logistics",base:52,vol:.013,drift:.00030,risk:"medium",descTh:"โลจิสติกส์และ Supply Chain ราคาตอบสนองต่อ Export Rush และเหตุการณ์คอขวด",descEn:"Logistics and supply-chain operator with medium simulated volatility."}
  ];
  const EXCHANGE_EVENTS = [
    {icon:"🤖",titleTh:"Automation Boom",titleEn:"Automation Boom",bodyTh:"โรงงานเพิ่มงบ Smart Factory และ Automation",bodyEn:"Factories increase smart-factory and automation spending.",effects:{AUTO:.040,TECH:.012}},
    {icon:"🧠",titleTh:"AI Productivity Rollout",titleEn:"AI Productivity Rollout",bodyTh:"องค์กรเร่งใช้ AI และ Data Tools เพื่อเพิ่ม Productivity",bodyEn:"Companies accelerate AI and data-tool adoption.",effects:{TECH:.028,DATA:.025,FOCS:.010}},
    {icon:"☕",titleTh:"Coffee Rush",titleEn:"Coffee Rush",bodyTh:"ยอดสั่งกาแฟในออฟฟิศพุ่งช่วงงานเร่ง",bodyEn:"Office coffee demand jumps during a busy work cycle.",effects:{COFF:.042}},
    {icon:"📉",titleTh:"Coffee Supply Tightens",titleEn:"Coffee Supply Tightens",bodyTh:"ต้นทุนวัตถุดิบกาแฟเพิ่ม กดดัน Margin ระยะสั้น",bodyEn:"Higher coffee input costs pressure short-term margins.",effects:{COFF:-.045}},
    {icon:"🦺",titleTh:"Safety Audit Week",titleEn:"Safety Audit Week",bodyTh:"หลายโรงงานเพิ่มคำสั่งซื้ออุปกรณ์ Safety ก่อน Audit",bodyEn:"Factories increase safety-equipment orders ahead of audits.",effects:{SAFE:.035,FOCS:.006}},
    {icon:"⚡",titleTh:"Green Energy Contract",titleEn:"Green Energy Contract",bodyTh:"Energy Works ได้สัญญาพลังงานระยะยาวใหม่",bodyEn:"Energy Works lands a new long-term energy contract.",effects:{ENGY:.033}},
    {icon:"🗄️",titleTh:"Data Platform Demand",titleEn:"Data Platform Demand",bodyTh:"Demand ระบบ Dashboard และ Data Platform เพิ่มขึ้น",bodyEn:"Demand rises for dashboards and enterprise data platforms.",effects:{DATA:.034,TECH:.010}},
    {icon:"🚚",titleTh:"Export Rush",titleEn:"Export Rush",bodyTh:"ยอดส่งออกเร่งตัว ทำให้ปริมาณขนส่งเพิ่มขึ้น",bodyEn:"A shipping rush boosts logistics volumes.",effects:{LOGI:.036}},
    {icon:"🚧",titleTh:"Supply Chain Bottleneck",titleEn:"Supply Chain Bottleneck",bodyTh:"คอขวดด้าน Supply Chain ทำให้ต้นทุน Logistics สูงขึ้น",bodyEn:"Supply-chain bottlenecks lift logistics costs.",effects:{LOGI:-.038,AUTO:-.010}},
    {icon:"🎯",titleTh:"Focus Campaign",titleEn:"Focus Campaign",bodyTh:"องค์กรเปิดแคมเปญ Productivity และ Deep Work",bodyEn:"Companies launch productivity and deep-work programs.",effects:{FOCS:.032,TECH:.008}},
    {icon:"🛑",titleTh:"Server Outage",titleEn:"Server Outage",bodyTh:"เหตุขัดข้องของระบบข้อมูลกดดันหุ้น Data Systems ชั่วคราว",bodyEn:"A simulated platform outage pressures Data Systems.",effects:{DATA:-.040}},
    {icon:"🏭",titleTh:"Factory Capex Cycle",titleEn:"Factory Capex Cycle",bodyTh:"โรงงานเร่งลงทุนเครื่องจักรและระบบอัตโนมัติ",bodyEn:"Factories accelerate machinery and automation investment.",effects:{AUTO:.030,ENGY:.012,LOGI:.008}},
    {icon:"🌤️",titleTh:"Calm Market",titleEn:"Calm Market",bodyTh:"วันนี้ตลาดค่อนข้างสงบ ไม่มีปัจจัยเฉพาะตัวเด่น",bodyEn:"The simulated market is relatively calm today.",effects:{FOCS:.002,SAFE:.002}},
    {icon:"📣",titleTh:"Productivity Expo",titleEn:"Productivity Expo",bodyTh:"งาน Productivity Expo สร้างกระแสให้กลุ่ม Tech และ Focus",bodyEn:"A productivity expo lifts simulated sentiment for tech and focus names.",effects:{TECH:.020,FOCS:.020,DATA:.010}}
  ];
  const EXCHANGE_ACHIEVEMENTS = [
    {id:"first-trade",icon:"📈",reward:20,th:"First Trade",en:"First Trade",descTh:"ซื้อหรือขายหุ้นครั้งแรก",descEn:"Complete your first trade"},
    {id:"academy-graduate",icon:"🎓",reward:40,th:"Academy Graduate",en:"Academy Graduate",descTh:"เรียน Trading Academy ครบทั้ง 7 บท",descEn:"Complete all 7 Trading Academy lessons"},
    {id:"investor",icon:"💼",reward:30,th:"Investor",en:"Investor",descTh:"ถือหุ้นพร้อมกันอย่างน้อย 3 บริษัท",descEn:"Hold at least 3 companies at once"},
    {id:"green-portfolio",icon:"💚",reward:25,th:"Green Portfolio",en:"Green Portfolio",descTh:"Portfolio มีกำไรรวมเป็นบวก",descEn:"Reach a positive total portfolio P/L"},
    {id:"market-winner",icon:"🔥",reward:50,th:"Market Winner",en:"Market Winner",descTh:"กำไรรวมแตะ 100 Coins",descEn:"Reach 100 Coins of total P/L"},
    {id:"diamond-hands",icon:"💎",reward:50,th:"Diamond Hands",en:"Diamond Hands",descTh:"ถือหุ้นตัวเดิมต่อเนื่องอย่างน้อย 5 วัน",descEn:"Hold the same stock for at least 5 days"},
    {id:"exchange-master",icon:"🏆",reward:100,th:"Exchange Master",en:"Exchange Master",descTh:"Portfolio Value แตะ 2,500 Coins",descEn:"Reach a 2,500 Coin portfolio value"}
  ];

  // ---------- V8.5.0 Trading Academy / Beginner Mode ----------
  const ACADEMY_LESSON_REWARD = 5;
  const EXCHANGE_ACADEMY = [
    {
      id:"stock-basics",icon:"🏢",titleTh:"หุ้นคืออะไร?",titleEn:"What is a stock?",
      introTh:"ใน Work Exchange หุ้นคือหน่วยจำลองของบริษัทที่คุณซื้อด้วย Work Coins ราคาจะขึ้นลงตาม Market Engine ของเว็บ",
      introEn:"In Work Exchange, a stock is a simulated company share bought with Work Coins. Prices move with the app's market engine.",
      pointsTh:["1 หุ้น = การถือหน่วยจำลองของบริษัท 1 หน่วย","ราคาขึ้นหรือลงทำให้มูลค่า Portfolio เปลี่ยน","หุ้นในเว็บนี้ไม่มีเงินจริงหรือหลักทรัพย์จริงเกี่ยวข้อง"],
      pointsEn:["1 share = one simulated unit of a company","Price movement changes your portfolio value","No real money or real securities are involved"],
      tipTh:"จำง่าย ๆ: ซื้อหุ้น = แลก Work Coins ไปถือสินทรัพย์จำลองที่ราคาเปลี่ยนได้",
      tipEn:"Remember: buying a share exchanges Work Coins for a simulated asset whose price can move.",
      questionTh:"ถ้าคุณซื้อ TECH 3 หุ้น หมายถึงอะไร?",questionEn:"What does buying 3 TECH shares mean?",
      answers:[{id:"a",th:"ถือหน่วยจำลอง TECH จำนวน 3 หน่วย",en:"You hold 3 simulated TECH shares"},{id:"b",th:"ได้กำไร 3 Coins ทันที",en:"You instantly earn 3 Coins"},{id:"c",th:"TECH จะขึ้นราคาแน่นอน",en:"TECH is guaranteed to rise"}],correct:"a",action:"market",actionTh:"ไปดูหุ้นทั้งหมด",actionEn:"Explore the market"
    },
    {
      id:"pnl-fees",icon:"📊",titleTh:"กำไร ขาดทุน และ Fee",titleEn:"Profit, loss and fees",
      introTh:"P/L คือ Profit/Loss ส่วนค่าธรรมเนียมซื้อและขายใน Work Exchange คือ 1% จึงต้องคิด Fee ก่อนตัดสินใจเทรด",
      introEn:"P/L means profit or loss. Work Exchange charges a 1% fee on both buys and sells, so fees matter before trading.",
      pointsTh:["Unrealized P/L = กำไร/ขาดทุนของหุ้นที่ยังถืออยู่","Realized P/L = กำไร/ขาดทุนหลังขายแล้ว","ซื้อและขายมี Fee 1% จึงไม่ควรเทรดถี่เพราะการขยับเล็กน้อย"],
      pointsEn:["Unrealized P/L is profit/loss on positions you still hold","Realized P/L is profit/loss after selling","Both buys and sells have a 1% fee, so tiny moves can be eaten by fees"],
      tipTh:"ราคาขึ้นเล็กน้อยไม่ได้แปลว่ากำไรสุทธิ เพราะยังมี Fee ตอนซื้อและขาย",
      tipEn:"A small price rise does not guarantee net profit because buy and sell fees still apply.",
      questionTh:"ซื้อหุ้นมูลค่า 100 Coins และ Fee 1% ต้องจ่ายทั้งหมดเท่าไร?",questionEn:"If a buy is worth 100 Coins and the fee is 1%, how much do you pay?",
      answers:[{id:"a",th:"100 Coins",en:"100 Coins"},{id:"b",th:"101 Coins",en:"101 Coins"},{id:"c",th:"99 Coins",en:"99 Coins"}],correct:"b",action:"trade",actionTh:"ดู Trade Ticket",actionEn:"Open the trade ticket"
    },
    {
      id:"average-cost",icon:"🧮",titleTh:"Average Cost คืออะไร?",titleEn:"What is average cost?",
      introTh:"ถ้าซื้อหุ้นตัวเดิมหลายครั้ง ระบบจะคำนวณต้นทุนเฉลี่ยต่อหุ้น เพื่อใช้เทียบกับราคาปัจจุบันและหา P/L",
      introEn:"When you buy the same stock multiple times, the app calculates an average cost per share to measure P/L.",
      pointsTh:["Average Cost ไม่ใช่ราคาซื้อล่าสุด","จำนวนหุ้นแต่ละรอบมีผลต่อต้นทุนเฉลี่ย","Portfolio แสดง Avg เพื่อช่วยดูว่าราคาปัจจุบันสูงหรือต่ำกว่าต้นทุน"],
      pointsEn:["Average cost is not simply your latest buy price","Share quantity in each purchase affects the average","Portfolio Avg helps compare current price with your cost basis"],
      tipTh:"ตัวอย่าง: ซื้อ 2 หุ้น @50 และ 2 หุ้น @70 → Average Cost = 60 Coins/หุ้น",
      tipEn:"Example: buy 2 shares @50 and 2 shares @70 → Average Cost = 60 Coins/share.",
      questionTh:"ซื้อ 2 หุ้น @50 และอีก 2 หุ้น @70 ต้นทุนเฉลี่ยคือเท่าไร?",questionEn:"Buy 2 shares @50 and 2 more @70. What is the average cost?",
      answers:[{id:"a",th:"50 Coins",en:"50 Coins"},{id:"b",th:"60 Coins",en:"60 Coins"},{id:"c",th:"70 Coins",en:"70 Coins"}],correct:"b",action:"portfolio",actionTh:"ดู Portfolio",actionEn:"View portfolio"
    },
    {
      id:"diversification",icon:"🧺",titleTh:"อย่า All-in",titleEn:"Do not go all-in",
      introTh:"การเอา Coins ทั้งหมดลงหุ้นตัวเดียวทำให้ Portfolio ขึ้นกับหุ้นนั้นมากเกินไป การกระจายและเก็บ Wallet สำรองช่วยลดความเสี่ยง",
      introEn:"Putting all Coins into one stock makes your portfolio depend too heavily on it. Diversification and cash reserves reduce risk.",
      pointsTh:["ไม่จำเป็นต้องซื้อหุ้นครบทุกตัว","แบ่งเงินระหว่างหุ้นความเสี่ยงต่างกันได้","เก็บ Coins บางส่วนไว้ใน Wallet หรือ Bank เพื่อไม่ถูกบังคับขาย"],
      pointsEn:["You do not need to own every stock","You can split Coins across different risk levels","Keep some Coins in Wallet or Bank so you are not forced to sell"],
      tipTh:"สำหรับมือใหม่ ลองใช้เงินเทรดเพียง 20–30% ของ Wallet ต่อหุ้นหนึ่งตัวก่อน",
      tipEn:"For beginners, consider limiting one stock to roughly 20–30% of your trading Wallet.",
      questionTh:"ข้อไหนช่วยลดความเสี่ยงได้ดีกว่า?",questionEn:"Which approach better reduces risk?",
      answers:[{id:"a",th:"เอา Coins ทั้งหมดซื้อ AUTO ตัวเดียว",en:"Put every Coin into AUTO"},{id:"b",th:"แบ่งหลายหุ้นและเก็บ Coins สำรอง",en:"Diversify and keep some Coins in reserve"},{id:"c",th:"ซื้อหุ้นที่ขึ้นแรงที่สุดทุกครั้ง",en:"Always buy the biggest gainer"}],correct:"b",action:"market",actionTh:"เปรียบเทียบหุ้น",actionEn:"Compare stocks"
    },
    {
      id:"risk-levels",icon:"🚦",titleTh:"เข้าใจ Risk Level",titleEn:"Understand risk levels",
      introTh:"หุ้นแต่ละตัวใน Work Exchange มี Low, Medium หรือ High Risk จากระดับความผันผวนจำลอง ไม่ได้หมายถึงดีหรือแย่ แต่หมายถึงราคาแกว่งไม่เท่ากัน",
      introEn:"Each Work Exchange stock has Low, Medium or High Risk based on simulated volatility. It is not a quality score; it describes how much price can move.",
      pointsTh:["Low Risk มักแกว่งน้อยกว่า","High Risk มีโอกาสขึ้นแรงและลงแรงกว่า","ดู Risk พร้อม Market Event และกราฟ ไม่ควรดูอย่างเดียว"],
      pointsEn:["Low Risk generally moves less","High Risk can rise faster and fall faster","Use Risk together with market events and the chart"],
      tipTh:"หุ้น High Risk ไม่ได้แปลว่าห้ามซื้อ แต่ควรใช้ขนาด Position ที่คุณรับการแกว่งได้",
      tipEn:"High Risk does not mean never buy it; it means size the position so you can tolerate the movement.",
      questionTh:"High Risk ในเว็บนี้หมายถึงอะไร?",questionEn:"What does High Risk mean here?",
      answers:[{id:"a",th:"หุ้นต้องขาดทุนแน่นอน",en:"The stock must lose money"},{id:"b",th:"ราคามีโอกาสแกว่งแรงกว่า",en:"The price can move more sharply"},{id:"c",th:"ซื้อไม่ได้",en:"It cannot be bought"}],correct:"b",action:"stock",actionTh:"ดู Risk ของหุ้น",actionEn:"Inspect stock risk"
    },
    {
      id:"reading-chart",icon:"📈",titleTh:"อ่านกราฟแบบง่าย",titleEn:"Read a chart simply",
      introTh:"ไม่ต้องทายอนาคตจากเส้นกราฟ แค่ใช้กราฟดูทิศทางและความผันผวนร่วมกับ Today, 5D และ All ก็ช่วยเห็นภาพมากขึ้น",
      introEn:"You do not need to predict the future from a chart. Use Today, 5D and All to understand direction and volatility.",
      pointsTh:["Today แสดงราคาทุกรอบรายชั่วโมงของวัน 07:00–16:00","5D ช่วยเห็นภาพ 5 วันทำการล่าสุด","All ช่วยดูแนวโน้มตั้งแต่เริ่มตลาดจำลอง"],
      pointsEn:["Today shows the hourly 07:00–16:00 market path","5D shows the latest five business days","All shows the longer simulated history"],
      tipTh:"อย่าดูแค่ตัวเลข +% ตอนนี้ ลองดูว่าราคาขึ้นสม่ำเสมอหรือแกว่งแรงด้วย",
      tipEn:"Do not look only at the current +%. Also check whether the move is steady or highly volatile.",
      questionTh:"ถ้าต้องการดูแนวโน้ม 5 วันทำการล่าสุด ควรกดอะไร?",questionEn:"Which range shows the latest five business days?",
      answers:[{id:"a",th:"Today",en:"Today"},{id:"b",th:"5D",en:"5D"},{id:"c",th:"All เท่านั้น",en:"All only"}],correct:"b",action:"chart",actionTh:"ลองเปลี่ยนช่วงกราฟ",actionEn:"Try chart ranges"
    },
    {
      id:"first-trade",icon:"🎯",titleTh:"เตรียมซื้อขายครั้งแรก",titleEn:"Prepare your first trade",
      introTh:"ก่อนกดซื้อให้เช็ก Wallet, จำนวนหุ้น, ราคาปัจจุบัน, Fee และ Risk ก่อนเสมอ หลังซื้อสามารถดู Average Cost และ P/L ใน Portfolio ได้",
      introEn:"Before buying, check Wallet, quantity, current price, fee and risk. After buying, Portfolio shows average cost and P/L.",
      pointsTh:["เริ่มจากจำนวนหุ้นเล็ก ๆ เพื่อเรียนรู้ระบบ","ตั้งเป้าว่ารับขาดทุนได้แค่ไหนก่อนซื้อ","Trade History ใช้ย้อนดูว่าซื้อขายอะไรไปและเสีย Fee เท่าไร"],
      pointsEn:["Start with a small quantity while learning","Decide how much loss you can tolerate before buying","Trade History shows what you traded and how much fee you paid"],
      tipTh:"บทเรียนนี้ไม่บังคับให้ซื้อจริง คุณสามารถเรียนจบก่อน แล้วค่อยทดลองตอนตลาดเปิด",
      tipEn:"This lesson does not force a trade. Finish the lesson first and practice when the market is open.",
      questionTh:"ก่อนกด BUY สิ่งไหนควรเช็กมากที่สุด?",questionEn:"What should you check before pressing BUY?",
      answers:[{id:"a",th:"ราคา จำนวน Fee Risk และ Wallet",en:"Price, quantity, fee, risk and Wallet"},{id:"b",th:"ดูแค่ว่าหุ้นเป็นสีเขียว",en:"Only whether the stock is green"},{id:"c",th:"กด MAX ทุกครั้ง",en:"Always press MAX"}],correct:"a",action:"trade",actionTh:"ไปที่ Trade Ticket",actionEn:"Go to trade ticket"
    }
  ];

  function academyState(){
    const raw=read(KEYS.exchangeAcademy,{}),completed=raw&&typeof raw.completed==="object"&&!Array.isArray(raw.completed)?raw.completed:{};
    const fallback=EXCHANGE_ACADEMY.find(x=>!completed[x.id])?.id||EXCHANGE_ACADEMY[0].id;
    const selected=EXCHANGE_ACADEMY.some(x=>x.id===raw?.selected)?raw.selected:fallback;
    return {...(raw&&typeof raw==="object"?raw:{}),completed,selected,open:raw?.open===true};
  }
  function saveAcademyState(state){ write(KEYS.exchangeAcademy,state); }
  function academyCompletedCount(state=academyState()){ return EXCHANGE_ACADEMY.filter(x=>state.completed?.[x.id]).length; }
  function academyCoinEarned(){ const ids=new Set(EXCHANGE_ACADEMY.map(x=>`earn:academy:${x.id}`));return ledger().filter(x=>ids.has(x.id)&&Number(x.amount)>0).reduce((sum,x)=>sum+Number(x.amount||0),0); }
  function beginnerModeEnabled(){ const raw=localStorage.getItem(KEYS.exchangeBeginner);return raw===null?academyCompletedCount()<EXCHANGE_ACADEMY.length:raw!=="0"; }
  function setBeginnerMode(on){ localStorage.setItem(KEYS.exchangeBeginner,on?"1":"0"); }
  function academyLesson(id){ return EXCHANGE_ACADEMY.find(x=>x.id===id)||EXCHANGE_ACADEMY[0]; }
  function academyReconcileRewards(){
    const state=academyState(),list=ledger(),ids=new Set(list.map(x=>x.id));let changed=false;
    EXCHANGE_ACADEMY.forEach(def=>{if(!state.completed?.[def.id])return;const id=`earn:academy:${def.id}`;if(ids.has(id))return;list.push({id,amount:ACADEMY_LESSON_REWARD,type:"academy",labelTh:`Trading Academy · ${def.titleTh}`,labelEn:`Trading Academy · ${def.titleEn}`,createdAt:state.completed[def.id]||new Date().toISOString(),meta:{lessonId:def.id}});ids.add(id);changed=true;});
    if(changed)write(KEYS.ledger,list);return changed;
  }
  function academyCompleteLesson(id,answerId,{notify=true}={}){
    const def=academyLesson(id);if(!def||answerId!==def.correct){if(notify)toast("💡",lang()==="th"?"คำตอบยังไม่ถูก ลองอ่าน Key Takeaway แล้วตอบอีกครั้ง":"Not quite. Review the key takeaway and try again.","warning");return false;}
    const state=academyState(),first=!state.completed?.[def.id];if(first){state.completed[def.id]=new Date().toISOString();if(!state.startedAt)state.startedAt=state.completed[def.id];const next=EXCHANGE_ACADEMY.find(x=>!state.completed[x.id]);state.selected=next?.id||def.id;if(academyCompletedCount(state)===EXCHANGE_ACADEMY.length)state.completedAt=new Date().toISOString();saveAcademyState(state);academyReconcileRewards();reconcileExchangeAchievements({notify:false});if(notify)toast("🎓",lang()==="th"?`เรียนจบบทนี้แล้ว +${ACADEMY_LESSON_REWARD} Coins`:`Lesson complete +${ACADEMY_LESSON_REWARD} Coins`,"success");}
    else if(notify)toast("✓",lang()==="th"?"บทนี้เรียนจบแล้ว และรับรางวัลไปแล้ว":"This lesson is already complete and rewarded.","info");
    return true;
  }
  function academyPractice(action,root){
    const map={market:".v84-market-list",trade:".v84-trade-ticket",portfolio:".v84-portfolio-card",stock:".v84-stock-detail",chart:".v84-chart-wrap"},target=q(map[action]||".v84-market-list",root||document);if(!target)return;target.scrollIntoView?.({behavior:"smooth",block:"center"});target.classList.add("v841-focus");setTimeout(()=>target.classList.remove("v841-focus"),1700);
  }
  function academyBeginnerTip(snap,portfolio,trades){
    if(!trades.length)return{icon:"🧭",th:"เริ่มจาก Watchlist 2–3 ตัวก่อน แล้วดู Risk + กราฟ + Market Event ยังไม่ต้องรีบกด MAX",en:"Start with a 2–3 stock watchlist. Check risk, chart and the market event before using a large position."};
    if(snap?.risk==="high")return{icon:"🚨",th:`${snap.symbol} เป็น High Risk ราคาอาจแกว่งแรง ลองลดจำนวนหุ้นให้เล็กกว่าปกติ`,en:`${snap.symbol} is High Risk. Consider a smaller position because price can move sharply.`};
    if(portfolio.positions.length===1)return{icon:"🧺",th:"ตอนนี้ Portfolio พึ่งหุ้นตัวเดียว ลองเปรียบเทียบหุ้น Risk ระดับอื่นก่อนเพิ่ม Position",en:"Your portfolio currently depends on one stock. Compare other risk levels before adding more."};
    if(portfolio.totalPnl>0)return{icon:"💚",th:"Portfolio เป็นบวกแล้ว แต่อย่าลืมว่า P/L ที่ยังไม่ขายคือ Unrealized และการขายยังมี Fee 1%",en:"Your portfolio is positive, but unsold P/L is unrealized and selling still has a 1% fee."};
    return{icon:"💡",th:"ดู Average Cost เทียบกับราคาปัจจุบัน และตัดสินใจจากแผน ไม่ใช่จากสีเขียว/แดงอย่างเดียว",en:"Compare average cost with current price and follow a plan instead of reacting only to green/red colors."};
  }
  function academyMarkup(portfolio,trades,snap){
    const state=academyState(),count=academyCompletedCount(state),total=EXCHANGE_ACADEMY.length,pct=Math.round(count/total*100),def=academyLesson(state.selected),done=!!state.completed?.[def.id],mode=beginnerModeEnabled(),coins=academyCoinEarned();
    const lessonNav=EXCHANGE_ACADEMY.map((x,i)=>`<button type="button" data-v841-lesson="${x.id}" class="${x.id===def.id?"active":""} ${state.completed?.[x.id]?"done":""}"><span>${state.completed?.[x.id]?"✓":x.icon}</span><div><small>${lang()==="th"?`บทที่ ${i+1}`:`Lesson ${i+1}`}</small><strong>${esc(lang()==="th"?x.titleTh:x.titleEn)}</strong></div></button>`).join("");
    const points=(lang()==="th"?def.pointsTh:def.pointsEn).map(x=>`<li>${esc(x)}</li>`).join("");
    const answers=def.answers.map(a=>`<label class="v841-answer"><input type="radio" name="v841Quiz" value="${a.id}" ${done&&a.id===def.correct?"checked disabled":""}><span>${esc(lang()==="th"?a.th:a.en)}</span></label>`).join("");
    const certificate=count===total?`<div class="v841-certificate"><span>🎓</span><div><small>TRADING ACADEMY GRADUATE</small><strong>${lang()==="th"?"จบหลักสูตรมือใหม่แล้ว!":"Beginner course complete!"}</strong><p>${lang()==="th"?`เรียนครบ ${total} บท · รับแล้ว ${coins} Coins · ปลดล็อก Academy Graduate`:`Completed ${total} lessons · earned ${coins} Coins · Academy Graduate unlocked`}</p></div><b>7/7</b></div>`:"";
    return `<section id="v841Academy" class="v841-academy ${state.open?"open":""}"><div class="v841-academy-summary"><div class="v841-academy-icon">🎓</div><div class="v841-academy-copy"><p class="eyebrow">TRADING ACADEMY · BEGINNER MODE</p><h3>${lang()==="th"?"เรียนหุ้นจาก Work Exchange แบบทีละขั้น":"Learn Work Exchange step by step"}</h3><p>${lang()==="th"?"7 บทสั้น + Mini Quiz · ได้ +5 Coins ต่อบทครั้งเดียว · ไม่มีเงินจริง":"7 short lessons + mini quizzes · +5 Coins per lesson once · no real money"}</p><div class="v841-academy-progress"><i><b style="width:${pct}%"></b></i><span>${count}/${total} · ${pct}%</span><em>+${coins}/${total*ACADEMY_LESSON_REWARD} 🪙</em></div></div><label class="v841-beginner-toggle"><input type="checkbox" data-v841-beginner ${mode?"checked":""}><i></i><span><strong>${lang()==="th"?"โหมดมือใหม่":"Beginner Mode"}</strong><small>${lang()==="th"?"แสดงคำแนะนำขณะเทรด":"Show trading guidance"}</small></span></label><button type="button" class="v841-academy-open" data-v841-academy-toggle>${state.open?(lang()==="th"?"ย่อบทเรียน":"Collapse"):(count?(lang()==="th"?"เรียนต่อ":"Continue"):(lang()==="th"?"เริ่มเรียน":"Start learning"))}</button></div>${state.open?`<div class="v841-academy-body"><aside class="v841-lesson-nav">${lessonNav}</aside><article class="v841-lesson"><div class="v841-lesson-head"><span>${def.icon}</span><div><small>${lang()==="th"?`บทที่ ${EXCHANGE_ACADEMY.indexOf(def)+1} / ${total}`:`Lesson ${EXCHANGE_ACADEMY.indexOf(def)+1} / ${total}`}</small><h3>${esc(lang()==="th"?def.titleTh:def.titleEn)}</h3><p>${esc(lang()==="th"?def.introTh:def.introEn)}</p></div>${done?`<b class="v841-done-chip">✓ ${lang()==="th"?"เรียนจบแล้ว":"Completed"}</b>`:""}</div><ul class="v841-lesson-points">${points}</ul><div class="v841-takeaway"><span>💡</span><div><small>KEY TAKEAWAY</small><strong>${esc(lang()==="th"?def.tipTh:def.tipEn)}</strong></div></div><div class="v841-quiz"><div><p class="eyebrow">MINI QUIZ</p><h4>${esc(lang()==="th"?def.questionTh:def.questionEn)}</h4></div><div class="v841-answers">${answers}</div><div class="v841-quiz-actions"><button type="button" class="outline-btn" data-v841-practice="${def.action}">↗ ${esc(lang()==="th"?def.actionTh:def.actionEn)}</button>${done?`<button type="button" class="primary-btn" data-v841-next>${academyCompletedCount(state)===total?(lang()==="th"?"✓ เรียนครบแล้ว":"✓ Course complete"):(lang()==="th"?"บทถัดไป →":"Next lesson →")}</button>`:`<button type="button" class="primary-btn" data-v841-submit="${def.id}">✓ ${lang()==="th"?`ตรวจคำตอบ +${ACADEMY_LESSON_REWARD} 🪙`:`Check answer +${ACADEMY_LESSON_REWARD} 🪙`}</button>`}</div></div>${certificate}</article></div>`:""}</section>`;
  }

  const exchangeDayCache = new Map();
  function exchangeTrades(){ const rows=read(KEYS.exchangeTrades,[]); return Array.isArray(rows)?rows:[]; }
  function saveExchangeTrades(rows){ write(KEYS.exchangeTrades,rows); }
  function exchangeWatchlist(){ const rows=read(KEYS.exchangeWatch,[]); return new Set(Array.isArray(rows)?rows:[]); }
  function saveExchangeWatchlist(set){ write(KEYS.exchangeWatch,[...set]); }
  function exchangeSelected(){ const id=localStorage.getItem(KEYS.exchangeSelected)||"TECH"; return EXCHANGE_STOCKS.some(s=>s.symbol===id)?id:"TECH"; }
  function exchangeRange(){ const id=localStorage.getItem(KEYS.exchangeRange)||"today"; return ["today","5d","all"].includes(id)?id:"today"; }
  function exchangeStock(symbol){ return EXCHANGE_STOCKS.find(s=>s.symbol===symbol)||EXCHANGE_STOCKS[0]; }
  function exchangeSeedUnit(seed){ let h=2166136261; for(const c of String(seed||"")){h^=c.charCodeAt(0);h=Math.imul(h,16777619);} return (h>>>0)/4294967295; }
  function exchangeRound(value,digits=2){ const p=10**digits; return Math.round((Number(value)||0)*p)/p; }
  function exchangeBusinessDay(date){ const d=date.getDay(); return d!==0&&d!==6; }
  function exchangePrevBusiness(date){ const d=new Date(date); do{d.setDate(d.getDate()-1);}while(!exchangeBusinessDay(d)); return d; }
  function exchangeNextBusiness(date){ const d=new Date(date); do{d.setDate(d.getDate()+1);}while(!exchangeBusinessDay(d)); return d; }
  function exchangeEventForKey(key){ const idx=Math.floor(exchangeSeedUnit(`event:${key}`)*EXCHANGE_EVENTS.length)%EXCHANGE_EVENTS.length; return EXCHANGE_EVENTS[idx]; }
  function exchangeEventEffect(symbol,key){ return Number(exchangeEventForKey(key)?.effects?.[symbol]||0); }
  function exchangePreviousBusinessKey(key){ return dateKey(exchangePrevBusiness(dateFromKey(key))); }
  function exchangeDayPath(symbol,key){
    const cacheKey=`${symbol}|${key}`; if(exchangeDayCache.has(cacheKey))return exchangeDayCache.get(cacheKey);
    const stock=exchangeStock(symbol),day=dateFromKey(key),epoch=dateFromKey(EXCHANGE_EPOCH_KEY);
    let prevClose=stock.base;
    if(day>epoch){ const prevKey=exchangePreviousBusinessKey(key); prevClose=exchangeDayPath(symbol,prevKey).close; }
    const overnight=(exchangeSeedUnit(`${symbol}|${key}|overnight`)*2-1)*stock.vol*.45;
    const open=Math.max(5,prevClose*(1+overnight+stock.drift));
    const event=exchangeEventEffect(symbol,key),slots=[];let price=open;
    // Keep the overall daily volatility close to the original 4-round market
    // V8.5.0 keeps the same 10 hourly price points from the previous release.
    const noiseScale=Math.sqrt(EXCHANGE_LEGACY_SLOT_COUNT/EXCHANGE_SLOTS.length);
    for(let i=0;i<EXCHANGE_SLOTS.length;i++){
      const noise=(exchangeSeedUnit(`${symbol}|${key}|${i}`)*2-1)*stock.vol*noiseScale;
      const eventStep=event/EXCHANGE_SLOTS.length;
      price=Math.max(5,price*(1+stock.drift/EXCHANGE_SLOTS.length+noise+eventStep));
      slots.push(exchangeRound(price));
    }
    const values=[open,...slots],row={key,open:exchangeRound(open),slots,close:slots.at(-1),high:exchangeRound(Math.max(...values)),low:exchangeRound(Math.min(...values)),prevClose:exchangeRound(prevClose)};
    exchangeDayCache.set(cacheKey,row); return row;
  }
  function exchangeMarketContext(now=API.getNow()){
    const cfg=API.getConfig(),end=dateFromKey(cfg.endDate),endMinutes=String(cfg.workdayEnd||"16:10").split(":").map(Number),endAt=new Date(end.getFullYear(),end.getMonth(),end.getDate(),endMinutes[0]||16,endMinutes[1]||10);
    const final=now.getTime()>endAt.getTime(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate()),businessToday=exchangeBusinessDay(today),mins=now.getHours()*60+now.getMinutes(),openMinutes=EXCHANGE_OPEN_HOUR*60,closeMinutes=EXCHANGE_CLOSE_HOUR*60;
    let anchor=final?new Date(end):new Date(today),slot=EXCHANGE_SLOTS.length-1,phase="closed",isOpen=false,nextAt=null;
    if(!exchangeBusinessDay(anchor))anchor=exchangePrevBusiness(anchor);
    if(!final&&businessToday){
      if(mins<openMinutes){
        anchor=exchangePrevBusiness(today);slot=EXCHANGE_SLOTS.length-1;phase="preopen";nextAt=new Date(today.getFullYear(),today.getMonth(),today.getDate(),EXCHANGE_OPEN_HOUR,0,0,0);
      }else if(mins<closeMinutes){
        slot=Math.min(EXCHANGE_LAST_TRADABLE_SLOT,Math.floor((mins-openMinutes)/60));phase="open";isOpen=true;
        const nextHour=EXCHANGE_SLOTS[slot+1];nextAt=new Date(today.getFullYear(),today.getMonth(),today.getDate(),nextHour,0,0,0);
      }else{
        slot=EXCHANGE_SLOTS.length-1;phase="closed";
      }
    }
    if(!final&&!isOpen&&!nextAt){
      const nextDay=exchangeNextBusiness(today);nextAt=new Date(nextDay.getFullYear(),nextDay.getMonth(),nextDay.getDate(),EXCHANGE_OPEN_HOUR,0,0,0);
    }
    const key=dateKey(anchor);let nextLabel="";
    if(final)nextLabel=lang()==="th"?"Journey สิ้นสุดแล้ว":"Journey ended";
    else if(isOpen){
      const nextHour=EXCHANGE_SLOTS[slot+1],closing=nextHour===EXCHANGE_CLOSE_HOUR;
      nextLabel=closing?(lang()==="th"?`${String(nextHour).padStart(2,"0")}:00 · ราคาปิด`:`${String(nextHour).padStart(2,"0")}:00 · Closing price`):`${String(nextHour).padStart(2,"0")}:00`;
    }else if(phase==="preopen")nextLabel=`${String(EXCHANGE_OPEN_HOUR).padStart(2,"0")}:00`;
    else nextLabel=`${dateKey(nextAt)} · ${String(EXCHANGE_OPEN_HOUR).padStart(2,"0")}:00`;
    return {now,final,key,slot,isOpen,phase,nextLabel,nextAt,canTrade:isOpen&&!final};
  }
  function exchangeCountdownText(ctx,now=API.getNow()){
    if(ctx.final||!ctx.nextAt)return lang()==="th"?"Journey สิ้นสุดแล้ว":"Journey ended";
    const seconds=Math.max(0,Math.floor((ctx.nextAt.getTime()-now.getTime())/1000)),days=Math.floor(seconds/86400),hours=Math.floor((seconds%86400)/3600),minutes=Math.floor((seconds%3600)/60),secs=seconds%60,pad=n=>String(n).padStart(2,"0");
    if(days>0)return lang()==="th"?`${days} วัน ${pad(hours)}:${pad(minutes)}:${pad(secs)}`:`${days}d ${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    if(hours>0)return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    return `${pad(minutes)}:${pad(secs)}`;
  }
  function exchangeMarketSignature(ctx){return `${ctx.key}|${ctx.slot}|${ctx.phase}|${ctx.final?1:0}`;}
  let exchangeClockSignature="";
  function updateExchangeClock(){
    if(!location.hash.includes("/exchange"))return;
    const ctx=exchangeMarketContext(),signature=exchangeMarketSignature(ctx);
    if(exchangeClockSignature&&signature!==exchangeClockSignature){exchangeClockSignature=signature;renderExchange();return;}
    exchangeClockSignature=signature;
    const next=$("v8474MarketNext"),countdown=$("v8474MarketCountdown");
    if(next)next.textContent=`${lang()==="th"?"รอบถัดไป":"Next"}: ${ctx.nextLabel}`;
    if(countdown)countdown.textContent=`⏱ ${exchangeCountdownText(ctx)}`;
  }
  function exchangeSnapshot(stock,ctx=exchangeMarketContext()){
    const day=exchangeDayPath(stock.symbol,ctx.key),lastSlot=Math.min(EXCHANGE_SLOTS.length-1,Math.max(0,ctx.slot)),price=ctx.slot>=0?day.slots[lastSlot]:day.prevClose;
    const seen=[day.open,...day.slots.slice(0,lastSlot+1)],changePct=day.prevClose?((price-day.prevClose)/day.prevClose*100):0;
    return {...stock,price:exchangeRound(price),open:day.open,prevClose:day.prevClose,high:exchangeRound(Math.max(...seen)),low:exchangeRound(Math.min(...seen)),changePct:exchangeRound(changePct),event:exchangeEventForKey(ctx.key)};
  }
  function exchangeSnapshots(ctx=exchangeMarketContext()){ return EXCHANGE_STOCKS.map(s=>exchangeSnapshot(s,ctx)); }
  function exchangeBusinessKeys(endKey,count){ const out=[],d=dateFromKey(endKey);let cur=new Date(d);while(out.length<count){if(exchangeBusinessDay(cur))out.unshift(dateKey(cur));cur.setDate(cur.getDate()-1);}return out; }
  function exchangeHistory(symbol,range,ctx=exchangeMarketContext()){
    if(range==="today"){
      const d=exchangeDayPath(symbol,ctx.key),points=[{label:"OPEN",value:d.open}];
      for(let i=0;i<=ctx.slot;i++)points.push({label:`${String(EXCHANGE_SLOTS[i]).padStart(2,"0")}:00`,value:d.slots[i]});return points;
    }
    if(range==="5d")return exchangeBusinessKeys(ctx.key,5).map(key=>({label:key.slice(5),value:key===ctx.key?exchangeSnapshot(exchangeStock(symbol),ctx).price:exchangeDayPath(symbol,key).close}));
    const points=[],start=dateFromKey(EXCHANGE_EPOCH_KEY),end=dateFromKey(ctx.key);for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){if(!exchangeBusinessDay(d))continue;const key=dateKey(d);points.push({label:key,value:key===ctx.key?exchangeSnapshot(exchangeStock(symbol),ctx).price:exchangeDayPath(symbol,key).close});}return points;
  }
  function exchangeChart(points){
    const W=720,H=230,p=18,values=points.map(x=>Number(x.value)||0),min=Math.min(...values),max=Math.max(...values),spread=Math.max(.01,max-min),coords=points.map((x,i)=>{const px=p+(W-p*2)*(points.length===1?0:i/(points.length-1)),py=H-p-(H-p*2)*((Number(x.value)-min)/spread);return[px,py];});
    const line=coords.map(([x,y])=>`${x.toFixed(1)},${y.toFixed(1)}`).join(" "),area=`${p},${H-p} ${line} ${W-p},${H-p}`,up=values.at(-1)>=values[0];
    return `<div class="v84-chart-wrap ${up?"up":"down"}"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img"><defs><linearGradient id="v84Area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".22"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><polygon points="${area}" fill="url(#v84Area)"></polygon><polyline points="${line}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline></svg><div class="v84-chart-axis"><span>${esc(points[0]?.label||"")}</span><b>${exchangeRound(min).toFixed(2)}–${exchangeRound(max).toFixed(2)} 🪙</b><span>${esc(points.at(-1)?.label||"")}</span></div></div>`;
  }
  function exchangePortfolio(trades=exchangeTrades(),snaps=exchangeSnapshots()){
    const positions={};let realized=0,totalFees=0;
    [...trades].sort((a,b)=>new Date(a.createdAt||0)-new Date(b.createdAt||0)).forEach(tr=>{
      const p=positions[tr.symbol]||(positions[tr.symbol]={symbol:tr.symbol,qty:0,avgCost:0,firstBuyAt:null});const qty=Math.max(0,Number(tr.qty)||0),fee=Math.max(0,Number(tr.fee)||0);totalFees+=fee;
      if(tr.side==="buy"){const cost=Number(tr.walletAmount?Math.abs(tr.walletAmount):tr.gross+fee)||0,newQty=p.qty+qty;p.avgCost=newQty?((p.avgCost*p.qty+cost)/newQty):0;p.qty=newQty;if(!p.firstBuyAt)p.firstBuyAt=tr.createdAt;}
      else if(tr.side==="sell"&&p.qty>0){const used=Math.min(qty,p.qty),net=Number(tr.walletAmount||tr.net||0);realized+=net-p.avgCost*used;p.qty-=used;if(p.qty<=1e-9){p.qty=0;p.avgCost=0;p.firstBuyAt=null;}}
    });
    const rows=Object.values(positions).filter(p=>p.qty>0).map(p=>{const snap=snaps.find(s=>s.symbol===p.symbol)||exchangeSnapshot(exchangeStock(p.symbol));const value=p.qty*snap.price,cost=p.qty*p.avgCost,pnl=value-cost;return{...p,stock:exchangeStock(p.symbol),price:snap.price,value:exchangeRound(value),cost:exchangeRound(cost),pnl:exchangeRound(pnl),pnlPct:cost?pnl/cost*100:0};});
    const value=rows.reduce((a,p)=>a+p.value,0),cost=rows.reduce((a,p)=>a+p.cost,0),unrealized=rows.reduce((a,p)=>a+p.pnl,0),totalPnl=realized+unrealized;
    return {positions:rows,value:exchangeRound(value),cost:exchangeRound(cost),realized:exchangeRound(realized),unrealized:exchangeRound(unrealized),totalPnl:exchangeRound(totalPnl),returnPct:cost?exchangeRound(totalPnl/cost*100):0,totalFees:exchangeRound(totalFees)};
  }
  function exchangeRiskLabel(risk){ if(lang()==="th")return risk==="low"?"ความเสี่ยงต่ำ":risk==="medium"?"ความเสี่ยงกลาง":"ความเสี่ยงสูง";return risk==="low"?"Low risk":risk==="medium"?"Medium risk":"High risk"; }
  function exchangeStatusLabel(ctx){ if(ctx.final)return lang()==="th"?"Journey Market ปิดแล้ว":"Journey market ended";if(ctx.isOpen)return lang()==="th"?"ตลาดเปิด":"Market open";if(ctx.phase==="preopen")return lang()==="th"?"ก่อนเปิดตลาด":"Pre-market";return lang()==="th"?"ตลาดปิด":"Market closed"; }
  function exchangeSentiment(snaps){ const avg=snaps.reduce((a,s)=>a+s.changePct,0)/Math.max(1,snaps.length);return avg>1?{icon:"🐂",th:"Bullish",en:"Bullish",tone:"up"}:avg< -1?{icon:"🐻",th:"Bearish",en:"Bearish",tone:"down"}:{icon:"😐",th:"Neutral",en:"Neutral",tone:"flat"}; }
  function exchangeQtyHeld(symbol,portfolio=exchangePortfolio()){ return portfolio.positions.find(p=>p.symbol===symbol)?.qty||0; }
  function exchangeMaxBuy(price,wallet){ let qty=Math.floor(wallet/Math.max(.01,price*1.01));while(qty>0){const gross=Math.round(price*qty),fee=Math.max(1,Math.round(gross*EXCHANGE_FEE_RATE));if(gross+fee<=wallet)break;qty--;}return Math.max(0,qty); }
  function exchangeToggleWatch(symbol){const set=exchangeWatchlist();set.has(symbol)?set.delete(symbol):set.add(symbol);saveExchangeWatchlist(set);renderExchange();}
  function exchangeTrade(side,symbol,qtyRaw){
    const ctx=exchangeMarketContext();if(!ctx.canTrade){toast("📈",lang()==="th"?"ซื้อขายได้เฉพาะช่วงตลาดเปิด 07:00–16:00 วันจันทร์–ศุกร์":"Trading is available only while the market is open, 07:00–16:00 Monday–Friday","warning");return;}
    const qty=Math.floor(Number(qtyRaw)||0);if(qty<=0){toast("!",lang()==="th"?"กรุณาระบุจำนวนหุ้น":"Enter a share quantity","error");return;}
    const snap=exchangeSnapshot(exchangeStock(symbol),ctx),portfolio=exchangePortfolio(exchangeTrades(),exchangeSnapshots(ctx)),held=exchangeQtyHeld(symbol,portfolio),wallet=balance(),gross=Math.round(snap.price*qty),fee=Math.max(1,Math.round(gross*EXCHANGE_FEE_RATE));
    let walletAmount=0;if(side==="buy"){walletAmount=-(gross+fee);if(wallet<Math.abs(walletAmount)){toast("🪙",lang()==="th"?"Work Coins ใน Wallet ไม่เพียงพอ":"Not enough Work Coins in your Wallet","error");return;}}
    else{if(held<qty){toast("📉",lang()==="th"?`คุณถือ ${symbol} เพียง ${held} หุ้น`:`You only hold ${held} ${symbol} shares`,"error");return;}walletAmount=Math.max(0,gross-fee);}
    const actionTh=side==="buy"?"ซื้อ":"ขาย",actionEn=side==="buy"?"Buy":"Sell",confirmText=lang()==="th"?`${actionTh} ${symbol} ${qty} หุ้น @ ${snap.price.toFixed(2)} 🪙\nค่าธรรมเนียม ${fee} 🪙\n${side==="buy"?"ใช้":"รับ"} ${Math.abs(walletAmount).toLocaleString()} Coins?`:`${actionEn} ${qty} ${symbol} shares @ ${snap.price.toFixed(2)} 🪙\nFee ${fee} 🪙\n${side==="buy"?"Spend":"Receive"} ${Math.abs(walletAmount).toLocaleString()} Coins?`;
    if(!confirm(confirmText))return;
    const id=`trade:v84:${Date.now().toString(36)}:${symbol}:${side}`,nowIso=new Date().toISOString(),currentPos=portfolio.positions.find(p=>p.symbol===symbol),realizedPnl=side==="sell"?exchangeRound(walletAmount-(currentPos?.avgCost||0)*qty):0;
    const trades=exchangeTrades();trades.push({id,side,symbol,qty,price:snap.price,gross,fee,walletAmount,realizedPnl,marketKey:ctx.key,marketSlot:ctx.slot,createdAt:nowIso});saveExchangeTrades(trades);
    const walletLedger=ledger();walletLedger.push({id:`${id}:wallet`,amount:walletAmount,type:side==="buy"?"exchange_buy":"exchange_sell",labelTh:`Work Exchange · ${actionTh} ${symbol} ${qty} หุ้น @ ${snap.price.toFixed(2)}`,labelEn:`Work Exchange · ${actionEn} ${qty} ${symbol} @ ${snap.price.toFixed(2)}`,createdAt:nowIso,meta:{tradeId:id,side,symbol,qty,price:snap.price,fee,gross}});write(KEYS.ledger,walletLedger);
    toast(side==="buy"?"📈":"💰",lang()==="th"?`${actionTh} ${symbol} สำเร็จ · ${qty} หุ้น`:`${actionEn} ${symbol} complete · ${qty} shares`,"success");
    reconcileExchangeAchievements({notify:true});refreshAll();try{window.dispatchEvent(new CustomEvent("workday:v8-data-changed"));}catch{}
  }
  function exchangeAchievementState(){const value=read(KEYS.exchangeAchievements,{});return value&&typeof value==="object"&&!Array.isArray(value)?value:{};}
  function reconcileExchangeAchievements({notify=false}={}){
    const trades=exchangeTrades(),ctx=exchangeMarketContext(),portfolio=exchangePortfolio(trades,exchangeSnapshots(ctx)),now=Date.now(),holdDays=Math.max(0,...portfolio.positions.map(p=>p.firstBuyAt?Math.floor((now-new Date(p.firstBuyAt).getTime())/86400000)+1:0)),conditions={
      "first-trade":trades.length>=1,
      "academy-graduate":academyCompletedCount()>=EXCHANGE_ACADEMY.length,
      investor:portfolio.positions.length>=3,
      "green-portfolio":trades.length>0&&portfolio.totalPnl>0,
      "market-winner":portfolio.totalPnl>=100,
      "diamond-hands":holdDays>=5,
      "exchange-master":portfolio.value>=2500
    },state=exchangeAchievementState();let added=[];
    const prev=featureAchievementStats();saveFeatureAchievementStats({
      exchangePortfolioValue:portfolio.value,exchangeTotalPnl:portfolio.totalPnl,exchangeHoldDays:holdDays,
      exchangeMaxPortfolioValue:Math.max(Number(prev.exchangeMaxPortfolioValue)||0,portfolio.value),
      exchangeMaxTotalPnl:Math.max(Number(prev.exchangeMaxTotalPnl)||0,portfolio.totalPnl),
      exchangeMaxHoldDays:Math.max(Number(prev.exchangeMaxHoldDays)||0,holdDays)
    });
    EXCHANGE_ACHIEVEMENTS.forEach(a=>{if(conditions[a.id]&&!state[a.id]){state[a.id]=new Date().toISOString();added.push(a);}});
    if(added.length)write(KEYS.exchangeAchievements,state);
    reconcileRewards({notify:notify&&added.length>0});
    if(added.length&&notify)toast("🏆",lang()==="th"?`ปลดล็อก Trading Achievement: ${added.map(a=>`${a.th} +${a.reward}🪙`).join(", ")}`:`Trading achievement unlocked: ${added.map(a=>`${a.en} +${a.reward}🪙`).join(", ")}`,"success");
    return{state,conditions,portfolio,holdDays};
  }
  function exchangeTraderRank(portfolio,trades){const score=(portfolio.totalPnl>=300?3:portfolio.totalPnl>=100?2:portfolio.totalPnl>0?1:0)+(portfolio.value>=2500?3:portfolio.value>=1200?2:portfolio.value>=400?1:0)+(trades.length>=10?2:trades.length>=3?1:0);return score>=7?{icon:"👑",th:"ตำนานตลาด",en:"Market Legend"}:score>=5?{icon:"💎",th:"โปรเทรดเดอร์",en:"Pro Trader"}:score>=3?{icon:"📈",th:"นักลงทุน",en:"Investor"}:score>=1?{icon:"🌱",th:"เทรดเดอร์มือใหม่",en:"Rookie Trader"}:{icon:"🧭",th:"นักสำรวจตลาด",en:"Explorer"};}
  function exchangeFinaleInfo(ctx,portfolio,trades){const cfg=API.getConfig(),end=dateFromKey(cfg.endDate),days=Math.max(0,Math.ceil((end.getTime()-ctx.now.getTime())/86400000)),rank=exchangeTraderRank(portfolio,trades),best=[...portfolio.positions].sort((a,b)=>b.pnl-a.pnl)[0],worst=[...portfolio.positions].sort((a,b)=>a.pnl-b.pnl)[0],bestTrade=[...trades].filter(t=>t.side==="sell").sort((a,b)=>(b.realizedPnl||0)-(a.realizedPnl||0))[0];return{days,rank,best,worst,bestTrade};}
  function exchangeEventEffectText(event){const parts=Object.entries(event.effects||{}).map(([s,v])=>`${s} ${v>0?"↑":"↓"}${Math.abs(v)>=.035?"↑":""}`);return parts.join(" · ");}
  function exchangeTradeHistoryMarkup(trades){if(!trades.length)return `<div class="empty-state">📜 ${lang()==="th"?"ยังไม่มีประวัติการซื้อขาย":"No trades yet"}</div>`;return trades.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,60).map(tr=>`<div class="v84-history-row ${tr.side}"><span>${tr.side==="buy"?"BUY":"SELL"}</span><div><strong>${tr.symbol} · ${tr.qty} ${lang()==="th"?"หุ้น":"shares"} @ ${Number(tr.price).toFixed(2)}</strong><small>${esc(formatHistoryDate(tr.createdAt))} · Fee ${Number(tr.fee||0)} 🪙</small></div><b>${tr.walletAmount>=0?"+":""}${Number(tr.walletAmount||0).toLocaleString()} 🪙</b></div>`).join("");}
  function renderExchange(){
    const root=$("v84ExchangePage");if(!root)return;const ctx=exchangeMarketContext();exchangeClockSignature=exchangeMarketSignature(ctx);const snaps=exchangeSnapshots(ctx),portfolio=exchangePortfolio(exchangeTrades(),snaps),trades=exchangeTrades(),watch=exchangeWatchlist(),selected=exchangeSelected(),snap=snaps.find(s=>s.symbol===selected)||snaps[0],range=exchangeRange(),points=exchangeHistory(selected,range,ctx),event=exchangeEventForKey(ctx.key),sentiment=exchangeSentiment(snaps),earned=reconcileExchangeAchievements({notify:false}).state;
    academyReconcileRewards();
    const movers=[...snaps].sort((a,b)=>b.changePct-a.changePct),gainers=movers.slice(0,2),losers=[...snaps].sort((a,b)=>a.changePct-b.changePct).slice(0,2),pos=portfolio.positions.find(p=>p.symbol===selected),held=pos?.qty||0,wallet=balance(),maxBuy=exchangeMaxBuy(snap.price,wallet),finale=exchangeFinaleInfo(ctx,portfolio,trades),statusClass=ctx.isOpen?"open":ctx.final?"final":"closed",beginner=beginnerModeEnabled(),beginnerTip=academyBeginnerTip(snap,portfolio,trades);
    const watchRows=[...watch].map(symbol=>snaps.find(s=>s.symbol===symbol)).filter(Boolean);const watchMarkup=watchRows.length?watchRows.map(s=>`<button type="button" class="v84-watch-chip ${s.changePct>=0?"up":"down"}" data-v84-select="${s.symbol}"><span>${s.icon}</span><strong>${s.symbol}</strong><b>${s.price.toFixed(2)}</b><small>${s.changePct>=0?"+":""}${s.changePct.toFixed(2)}%</small></button>`).join(""):`<span class="v84-watch-empty">⭐ ${lang()==="th"?"กดดาวหุ้นที่สนใจเพื่อเพิ่ม Watchlist":"Star a stock to add it to your watchlist"}</span>`;
    const stockRows=snaps.map(s=>`<button type="button" class="v84-stock-row ${s.symbol===selected?"active":""}" data-v84-select="${s.symbol}"><span class="v84-stock-icon">${s.icon}</span><div><strong>${s.symbol}</strong><small>${esc(lang()==="th"?s.th:s.name)}</small></div><span class="v84-risk ${s.risk}">${esc(exchangeRiskLabel(s.risk))}</span><b>${s.price.toFixed(2)}</b><em class="${s.changePct>=0?"up":"down"}">${s.changePct>=0?"+":""}${s.changePct.toFixed(2)}%</em><i data-v84-watch="${s.symbol}" class="${watch.has(s.symbol)?"on":""}" title="Watchlist">${watch.has(s.symbol)?"★":"☆"}</i></button>`).join("");
    const portfolioRows=portfolio.positions.length?portfolio.positions.map(p=>`<button type="button" class="v84-portfolio-row" data-v84-select="${p.symbol}"><span>${p.stock.icon}</span><div><strong>${p.symbol}</strong><small>${p.qty} ${lang()==="th"?"หุ้น":"shares"} · Avg ${p.avgCost.toFixed(2)}</small></div><b>${p.value.toFixed(2)} 🪙</b><em class="${p.pnl>=0?"up":"down"}">${p.pnl>=0?"+":""}${p.pnl.toFixed(2)} (${p.pnlPct>=0?"+":""}${p.pnlPct.toFixed(1)}%)</em></button>`).join(""):`<div class="empty-state">💼 ${lang()==="th"?"ยังไม่มีหุ้นใน Portfolio":"Your portfolio is empty"}</div>`;
    const ach=EXCHANGE_ACHIEVEMENTS.map(a=>{const claimed=ledger().some(x=>x.id===`earn:achievement:${a.id}`);return `<article class="v84-ach ${earned[a.id]?"unlocked":"locked"}"><span>${earned[a.id]?a.icon:"🔒"}</span><div><strong>${esc(lang()==="th"?a.th:a.en)}</strong><small>${esc(lang()==="th"?a.descTh:a.descEn)}</small><em>🪙 +${a.reward} ${lang()==="th"?"Coins":"Coins"}</em></div>${earned[a.id]?`<b>${claimed?"✓":"+"}</b>`:""}</article>`;}).join("");
    root.innerHTML=`<div class="v7-page-heading"><div class="v7-page-title"><span>📈</span><div><p class="eyebrow">WORKDAY JOURNEY · V8.5.0</p><h2>Work Exchange</h2><p class="muted">${lang()==="th"?"ตลาดหุ้นจำลองด้วย Work Coins · ราคาอัปเดตทุก 1 ชั่วโมง 07:00–16:00 และเหมือนกันใน Seed เดียวกัน · ไม่มีเงินจริง":"A simulated Work Coin market with deterministic hourly prices from 07:00–16:00. No real money is involved."}</p></div></div><div class="v84-market-status ${statusClass}"><i></i><div><strong>${esc(exchangeStatusLabel(ctx))}</strong><small id="v8474MarketNext">${lang()==="th"?"รอบถัดไป":"Next"}: ${esc(ctx.nextLabel)}</small><em id="v8474MarketCountdown">⏱ ${esc(exchangeCountdownText(ctx))}</em></div></div></div>
      <section class="v84-kpis"><article><span>🪙</span><div><small>${lang()==="th"?"Wallet":"Wallet"}</small><strong>${wallet.toLocaleString()} 🪙</strong></div></article><article><span>💼</span><div><small>Portfolio Value</small><strong>${portfolio.value.toFixed(2)} 🪙</strong></div></article><article class="${portfolio.totalPnl>=0?"up":"down"}"><span>📊</span><div><small>Total P/L</small><strong>${portfolio.totalPnl>=0?"+":""}${portfolio.totalPnl.toFixed(2)} 🪙</strong><em>${portfolio.returnPct>=0?"+":""}${portfolio.returnPct.toFixed(2)}%</em></div></article><article class="${sentiment.tone}"><span>${sentiment.icon}</span><div><small>Market Sentiment</small><strong>${esc(lang()==="th"?sentiment.th:sentiment.en)}</strong></div></article></section>
      ${academyMarkup(portfolio,trades,snap)}
      ${beginner?`<section class="v841-beginner-tip"><span>${beginnerTip.icon}</span><div><small>${lang()==="th"?"คำแนะนำสำหรับมือใหม่":"BEGINNER TIP"}</small><strong>${esc(lang()==="th"?beginnerTip.th:beginnerTip.en)}</strong></div><button type="button" data-v841-academy-open>${lang()==="th"?"เปิด Academy":"Open Academy"}</button></section>`:""}
      <section class="v84-event-card"><div class="v84-event-icon">${event.icon}</div><div><p class="eyebrow">TODAY'S MARKET EVENT · ${esc(ctx.key)}</p><h3>${esc(lang()==="th"?event.titleTh:event.titleEn)}</h3><p>${esc(lang()==="th"?event.bodyTh:event.bodyEn)}</p></div><span>${esc(exchangeEventEffectText(event))}</span></section>
      <section class="v84-movers"><article><p class="eyebrow">TOP GAINERS</p>${gainers.map(s=>`<button data-v84-select="${s.symbol}"><span>${s.icon}</span><strong>${s.symbol}</strong><b>+${s.changePct.toFixed(2)}%</b></button>`).join("")}</article><article><p class="eyebrow">TOP LOSERS</p>${losers.map(s=>`<button data-v84-select="${s.symbol}"><span>${s.icon}</span><strong>${s.symbol}</strong><b>${s.changePct.toFixed(2)}%</b></button>`).join("")}</article><article class="v84-watchlist"><p class="eyebrow">MY WATCHLIST</p><div>${watchMarkup}</div></article></section>
      <section class="v84-market-grid"><article class="v84-market-list"><div class="v84-section-head"><div><p class="eyebrow">MARKET</p><h3>${lang()==="th"?"หุ้นจำลองทั้งหมด":"All simulated stocks"}</h3></div><small>${lang()==="th"?"ค่าธรรมเนียมซื้อ/ขาย 1%":"1% buy/sell fee"}</small></div><div class="v84-stock-list">${stockRows}</div></article>
      <article class="v84-stock-detail"><div class="v84-stock-detail-head"><div class="v84-selected-icon">${snap.icon}</div><div><span>${snap.symbol} · ${esc(lang()==="th"?snap.sectorTh:snap.sectorEn)}</span><h3>${esc(lang()==="th"?snap.th:snap.name)}</h3><p>${esc(lang()==="th"?snap.descTh:snap.descEn)}</p></div><button type="button" data-v84-watch="${snap.symbol}" class="v84-detail-watch ${watch.has(snap.symbol)?"on":""}">${watch.has(snap.symbol)?"★":"☆"}</button></div><div class="v84-price-line"><strong>${snap.price.toFixed(2)} <small>🪙</small></strong><b class="${snap.changePct>=0?"up":"down"}">${snap.changePct>=0?"+":""}${snap.changePct.toFixed(2)}%</b><span class="v84-risk ${snap.risk}">${esc(exchangeRiskLabel(snap.risk))}</span></div><div class="v84-ohlc"><span><small>OPEN</small><b>${snap.open.toFixed(2)}</b></span><span><small>HIGH</small><b>${snap.high.toFixed(2)}</b></span><span><small>LOW</small><b>${snap.low.toFixed(2)}</b></span><span><small>PREV</small><b>${snap.prevClose.toFixed(2)}</b></span></div><div class="v84-range-tabs">${[["today","Today"],["5d","5D"],["all","All"]].map(([id,label])=>`<button type="button" data-v84-range="${id}" class="${range===id?"active":""}">${label}</button>`).join("")}</div>${exchangeChart(points)}
      <div class="v84-trade-ticket"><div class="v84-ticket-head"><div><p class="eyebrow">TRADE TICKET</p><h3>${snap.symbol}</h3></div><span>${lang()==="th"?`ถืออยู่ ${held} หุ้น`:`Holding ${held} shares`}</span></div><div class="v84-ticket-input"><label>${lang()==="th"?"จำนวนหุ้น":"Shares"}<input id="v84TradeQty" type="number" min="1" step="1" inputmode="numeric" value="1"></label><div class="v84-ticket-quick"><button type="button" data-v84-qty="1">1</button><button type="button" data-v84-qty="5">5</button><button type="button" data-v84-qty="10">10</button><button type="button" data-v84-qty="max">MAX</button></div></div><div id="v84TradePreview" class="v84-ticket-preview"></div><div class="v84-ticket-actions"><button type="button" class="buy" data-v84-trade="buy" ${ctx.canTrade&&maxBuy>0?"":"disabled"}>📈 ${lang()==="th"?"ซื้อ":"BUY"}</button><button type="button" class="sell" data-v84-trade="sell" ${ctx.canTrade&&held>0?"":"disabled"}>📉 ${lang()==="th"?"ขาย":"SELL"}</button></div><small class="v84-ticket-note">${ctx.canTrade?(lang()==="th"?"ตลาดเปิด · ราคาซื้อขายอ้างอิงรอบปัจจุบัน · Fee 1%":"Market open · trades use the current round price · 1% fee"):(lang()==="th"?`ตลาดปิด · ${exchangeStatusLabel(ctx)}`:`Trading disabled · ${exchangeStatusLabel(ctx)}`)}</small></div></article></section>
      <section class="v84-lower-grid"><article class="v84-portfolio-card"><div class="v84-section-head"><div><p class="eyebrow">PORTFOLIO</p><h3>${lang()==="th"?"สินทรัพย์ของฉัน":"My holdings"}</h3></div><span>${portfolio.positions.length} ${lang()==="th"?"บริษัท":"companies"}</span></div><div class="v84-portfolio-list">${portfolioRows}</div><div class="v84-portfolio-foot"><span>Cost Basis <b>${portfolio.cost.toFixed(2)} 🪙</b></span><span>Realized P/L <b class="${portfolio.realized>=0?"up":"down"}">${portfolio.realized>=0?"+":""}${portfolio.realized.toFixed(2)}</b></span><span>Fees <b>-${portfolio.totalFees.toFixed(2)} 🪙</b></span></div></article><article class="v84-ach-card"><div class="v84-section-head"><div><p class="eyebrow">TRADING ACHIEVEMENTS</p><h3>${lang()==="th"?"เส้นทางนักลงทุน":"Investor journey"}</h3></div><span>${Object.keys(earned).length}/${EXCHANGE_ACHIEVEMENTS.length}</span></div><div class="v84-ach-list">${ach}</div></article></section>
      <section class="v84-history-card"><div class="v84-section-head"><div><p class="eyebrow">TRADE HISTORY</p><h3>${lang()==="th"?"ประวัติการซื้อขาย":"Trade history"}</h3></div><span>${trades.length} trades</span></div><div class="v84-history-list">${exchangeTradeHistoryMarkup(trades)}</div></section>
      <section class="v84-finale ${ctx.final?"final":"preview"}"><div><span>${ctx.final?"🏁":"🎓"}</span><div><p class="eyebrow">${ctx.final?"FINAL MARKET DAY":"FINALE PREVIEW"}</p><h3>${ctx.final?(lang()==="th"?"สรุป Work Exchange เมื่อ Journey สิ้นสุด":"Final Work Exchange summary"):(lang()==="th"?`อีก ${finale.days} วันถึง Journey สิ้นสุด`:`${finale.days} days until Journey ends`)}</h3><p>${lang()==="th"?"Portfolio นี้เป็นระบบจำลองด้วย Work Coins ไม่มีเงินจริงหรือหลักทรัพย์จริงเกี่ยวข้อง":"This is a Work Coin simulation; no real money or securities are involved."}</p></div></div><div class="v84-finale-stats"><span><small>TRADER RANK</small><b>${finale.rank.icon} ${esc(lang()==="th"?finale.rank.th:finale.rank.en)}</b></span><span><small>PORTFOLIO</small><b>${portfolio.value.toFixed(2)} 🪙</b></span><span><small>TOTAL P/L</small><b class="${portfolio.totalPnl>=0?"up":"down"}">${portfolio.totalPnl>=0?"+":""}${portfolio.totalPnl.toFixed(2)} 🪙</b></span><span><small>BEST HOLDING</small><b>${finale.best?`${finale.best.symbol} ${finale.best.pnl>=0?"+":""}${finale.best.pnl.toFixed(1)}`:"—"}</b></span></div></section>`;
    qa("[data-v84-select]",root).forEach(btn=>btn.addEventListener("click",()=>{localStorage.setItem(KEYS.exchangeSelected,btn.dataset.v84Select);renderExchange();}));
    qa("[data-v84-watch]",root).forEach(btn=>btn.addEventListener("click",e=>{e.stopPropagation();exchangeToggleWatch(btn.dataset.v84Watch);}));
    qa("[data-v84-range]",root).forEach(btn=>btn.addEventListener("click",()=>{localStorage.setItem(KEYS.exchangeRange,btn.dataset.v84Range);renderExchange();}));
    qa("[data-v841-academy-toggle]",root).forEach(btn=>btn.addEventListener("click",()=>{const state=academyState();state.open=!state.open;saveAcademyState(state);renderExchange();}));
    qa("[data-v841-academy-open]",root).forEach(btn=>btn.addEventListener("click",()=>{const state=academyState();state.open=true;saveAcademyState(state);renderExchange();setTimeout(()=>$('v841Academy')?.scrollIntoView?.({behavior:"smooth",block:"start"}),40);}));
    qa("[data-v841-beginner]",root).forEach(input=>input.addEventListener("change",()=>{setBeginnerMode(input.checked);renderExchange();}));
    qa("[data-v841-lesson]",root).forEach(btn=>btn.addEventListener("click",()=>{const state=academyState();state.selected=btn.dataset.v841Lesson;state.open=true;saveAcademyState(state);renderExchange();}));
    qa("[data-v841-submit]",root).forEach(btn=>btn.addEventListener("click",()=>{const answer=q('input[name="v841Quiz"]:checked',root)?.value;if(!answer){toast("🎓",lang()==="th"?"เลือกคำตอบก่อนนะ":"Choose an answer first.","warning");return;}academyCompleteLesson(btn.dataset.v841Submit,answer,{notify:true});renderExchange();}));
    qa("[data-v841-next]",root).forEach(btn=>btn.addEventListener("click",()=>{const state=academyState(),idx=EXCHANGE_ACADEMY.findIndex(x=>x.id===state.selected),next=EXCHANGE_ACADEMY.slice(idx+1).find(x=>!state.completed[x.id])||EXCHANGE_ACADEMY.find(x=>!state.completed[x.id]);if(next){state.selected=next.id;state.open=true;saveAcademyState(state);renderExchange();}}));
    qa("[data-v841-practice]",root).forEach(btn=>btn.addEventListener("click",()=>academyPractice(btn.dataset.v841Practice,root)));
    const qty=$("v84TradeQty"),preview=$("v84TradePreview");const updatePreview=()=>{if(!qty||!preview)return;const n=Math.max(0,Math.floor(Number(qty.value)||0)),gross=Math.round(snap.price*n),fee=n?Math.max(1,Math.round(gross*EXCHANGE_FEE_RATE)):0;preview.innerHTML=`<span>${lang()==="th"?"มูลค่า":"Value"} <b>${gross.toLocaleString()} 🪙</b></span><span>Fee 1% <b>${fee.toLocaleString()} 🪙</b></span><span>${lang()==="th"?"ซื้อรวม":"Buy total"} <b>${(gross+fee).toLocaleString()} 🪙</b></span><span>${lang()==="th"?"ขายสุทธิ":"Sell net"} <b>${Math.max(0,gross-fee).toLocaleString()} 🪙</b></span>`;};qty?.addEventListener("input",updatePreview);updatePreview();
    qa("[data-v84-qty]",root).forEach(btn=>btn.addEventListener("click",()=>{if(!qty)return;qty.value=btn.dataset.v84Qty==="max"?String(Math.max(held,maxBuy)):btn.dataset.v84Qty;updatePreview();}));
    qa("[data-v84-trade]",root).forEach(btn=>btn.addEventListener("click",()=>exchangeTrade(btn.dataset.v84Trade,selected,qty?.value)));
    window.WorkdayV854?.refresh?.();
    window.WorkdayV850?.refresh?.();
  }


  // ---------- V8.5.0 Project File Vault ----------
  const VAULT_BUCKET = "project-files";
  const VAULT_TABLE = "project_file_versions";
  const VAULT_MAX_FILE_BYTES = 20 * 1024 * 1024;
  const VAULT_USER_QUOTA_BYTES = 100 * 1024 * 1024;
  const VAULT_MAX_PROJECT_FILES = 8;
  const VAULT_ALLOWED_EXT = new Set(["zip","pdf","doc","docx","xls","xlsx","ppt","pptx","png","jpg","jpeg","gif","webp","txt","md","csv","json"]);
  const vaultUi = { projectId:"", projectName:"", rows:[], userUsage:0, loading:false, error:"", replaceName:"", expanded:new Set() };

  function vaultCopy(th,en){ return lang()==="th"?th:en; }
  function vaultCloud(){ const api=window.WorkdayV8Cloud; return {api,client:api?.getClient?.()||null,user:api?.getUser?.()||null}; }
  function vaultSignedIn(){ const c=vaultCloud(); return !!(c.client&&c.user?.id); }
  function vaultFormatBytes(bytes){ const n=Math.max(0,Number(bytes)||0); if(n<1024)return `${n} B`; if(n<1048576)return `${(n/1024).toFixed(n<10240?1:0)} KB`; return `${(n/1048576).toFixed(n<10485760?1:0)} MB`; }
  function vaultFileIcon(name){ const ext=String(name||"").split(".").pop().toLowerCase(); if(ext==="pdf")return"📕";if(["doc","docx"].includes(ext))return"📘";if(["xls","xlsx","csv"].includes(ext))return"📊";if(["ppt","pptx"].includes(ext))return"📙";if(["png","jpg","jpeg","gif","webp"].includes(ext))return"🖼️";if(ext==="zip")return"📦";if(["txt","md","json"].includes(ext))return"📄";return"📎"; }
  function vaultSafePath(value){ return String(value||"").normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,90)||"file"; }
  function vaultLogicalGroups(rows=vaultUi.rows){ const map=new Map(); (rows||[]).forEach(row=>{const key=String(row.logical_name||"");if(!map.has(key))map.set(key,[]);map.get(key).push(row);}); return [...map.entries()].map(([name,versions])=>({name,versions:versions.sort((a,b)=>Number(b.version||0)-Number(a.version||0)),latest:versions[0]})).sort((a,b)=>new Date(b.latest?.created_at||0)-new Date(a.latest?.created_at||0)); }
  function vaultDate(iso){ try{return new Intl.DateTimeFormat(lang()==="th"?"th-TH":"en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(iso));}catch{return"—";} }
  function vaultProject(){ const list=read("wp-v6-projects",[]); return Array.isArray(list)?list.find(p=>p.id===vaultUi.projectId):null; }
  function vaultKnownProjects(){ const raw=read(KEYS.vaultProjects,[]);return new Set(Array.isArray(raw)?raw.map(String):[]); }
  function vaultRememberProject(projectId,hasFiles=true){ const set=vaultKnownProjects(),id=String(projectId||"");if(!id)return;if(hasFiles)set.add(id);else set.delete(id);write(KEYS.vaultProjects,[...set]); }
  function vaultUpdateAchievementStats(rows){
    const list=Array.isArray(rows)?rows:[],perProject=new Map(),logical=new Set();let maxVersion=0;
    list.forEach(row=>{const project=String(row?.project_id||""),name=String(row?.logical_name||"");if(!project||!name)return;logical.add(`${project}|${name}`);if(!perProject.has(project))perProject.set(project,new Set());perProject.get(project).add(name);maxVersion=Math.max(maxVersion,Number(row?.version)||0);});
    const maxProjectFiles=Math.max(0,...[...perProject.values()].map(set=>set.size)),prev=featureAchievementStats();
    const changed=saveFeatureAchievementStats({vaultTotalFiles:logical.size,vaultMaxTotalFiles:Math.max(Number(prev.vaultMaxTotalFiles)||0,logical.size),vaultMaxProjectFiles:Math.max(Number(prev.vaultMaxProjectFiles)||0,maxProjectFiles),vaultMaxVersion:Math.max(Number(prev.vaultMaxVersion)||0,maxVersion)});
    if(changed)reconcileRewards({notify:false}); return changed;
  }
  function vaultAchievementMarkup(){const items=featureAchievementItems("vault");return items.length?`<section class="v846-vault-ach"><div><p class="eyebrow">FILE VAULT ACHIEVEMENTS</p><h3>${vaultCopy("Achievement จากการจัดเก็บ Project","Project storage achievements")}</h3></div><div class="v846-feature-ach-grid">${items.map(a=>featureAchievementCardMarkup(a,true)).join("")}</div></section>`:"";}

  function ensureVaultModal(){
    if($("v845VaultBackdrop"))return;
    const wrap=document.createElement("div");wrap.id="v845VaultBackdrop";wrap.className="v845-vault-backdrop";wrap.hidden=true;
    wrap.innerHTML=`<section class="v845-vault-modal" role="dialog" aria-modal="true" aria-labelledby="v845VaultTitle"><button id="v845VaultClose" class="v845-vault-close" type="button" aria-label="Close">×</button><div id="v845VaultBody"></div><input id="v845VaultInput" type="file" hidden accept=".zip,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.txt,.md,.csv,.json"></section>`;
    document.body.appendChild(wrap);$("v845VaultClose").addEventListener("click",closeProjectVault);wrap.addEventListener("click",e=>{if(e.target===wrap)closeProjectVault();});
    $("v845VaultInput").addEventListener("change",async e=>{const file=e.target.files?.[0];e.target.value="";if(!file)return;await vaultUploadFile(file,vaultUi.replaceName||"");vaultUi.replaceName="";});
  }
  function closeProjectVault(){ const wrap=$("v845VaultBackdrop");if(!wrap)return;wrap.classList.remove("open");setTimeout(()=>wrap.hidden=true,150); }
  function vaultOpenAccount(){ closeProjectVault();window.WorkdayV8Cloud?.openAccount?.(); }

  function vaultHeaderMarkup(){
    const groups=vaultLogicalGroups(),projectBytes=vaultUi.rows.reduce((sum,x)=>sum+Number(x.file_size||0),0),quotaPct=Math.min(100,(vaultUi.userUsage/VAULT_USER_QUOTA_BYTES)*100);
    return `<div class="v845-vault-head"><div class="v845-vault-icon">📁</div><div><p class="eyebrow">PROJECT FILE VAULT · V8.5.0</p><h2 id="v845VaultTitle">${esc(vaultUi.projectName||vaultCopy("ไฟล์ Project","Project Files"))}</h2><p>${esc(vaultCopy("พื้นที่ Cloud ส่วนตัว · เฉพาะบัญชีของคุณเท่านั้น","Private cloud storage · only your account can access these files"))}</p></div></div><div class="v845-vault-stats"><article><span>${esc(vaultCopy("ไฟล์ใน Project","Project files"))}</span><strong>${groups.length}/${VAULT_MAX_PROJECT_FILES}</strong><small>${vaultUi.rows.length} ${esc(vaultCopy("เวอร์ชัน","versions"))}</small></article><article><span>${esc(vaultCopy("พื้นที่ Project","Project storage"))}</span><strong>${vaultFormatBytes(projectBytes)}</strong><small>${esc(vaultCopy("รวมทุก Version","including all versions"))}</small></article><article><span>${esc(vaultCopy("พื้นที่ของฉัน","My storage"))}</span><strong>${vaultFormatBytes(vaultUi.userUsage)} / 100 MB</strong><div class="v845-quota"><i style="width:${quotaPct}%"></i></div></article></div>`;
  }

  function vaultRender(){
    ensureVaultModal();const body=$("v845VaultBody");if(!body)return;const {client,user}=vaultCloud();
    if(!client||!user?.id){body.innerHTML=`${vaultHeaderMarkup()}<div class="v845-vault-gate"><span>☁️</span><h3>${esc(vaultCopy("เข้าสู่ระบบ Cloud ก่อนใช้งาน File Vault","Sign in to Cloud to use File Vault"))}</h3><p>${esc(vaultCopy("ไฟล์ Project จะถูกเก็บใน Supabase Storage แบบ Private และสามารถเปิดจากอุปกรณ์อื่นเมื่อ Login บัญชีเดิม","Project files are stored privately in Supabase Storage and follow you to other devices when you sign in."))}</p><button data-v845-vault-signin class="primary-btn" type="button">☁ ${esc(vaultCopy("เข้าสู่ระบบ Cloud","Sign in to Cloud"))}</button></div>`;q("[data-v845-vault-signin]",body)?.addEventListener("click",vaultOpenAccount);return;}
    if(vaultUi.loading){body.innerHTML=`${vaultHeaderMarkup()}<div class="v845-vault-loading"><span>📁</span><strong>${esc(vaultCopy("กำลังโหลดไฟล์ Project...","Loading project files..."))}</strong></div>`;return;}
    if(vaultUi.error){body.innerHTML=`${vaultHeaderMarkup()}<div class="v845-vault-error"><span>⚠️</span><h3>${esc(vaultCopy("ยังเปิด Project File Vault ไม่ได้","Project File Vault is not ready"))}</h3><p>${esc(vaultUi.error)}</p><small>${esc(vaultCopy("ถ้ายังไม่ได้ตั้งค่า Supabase ให้รันไฟล์ SUPABASE_FILE_VAULT_SETUP.sql หนึ่งครั้ง","If Supabase has not been configured yet, run SUPABASE_FILE_VAULT_SETUP.sql once."))}</small><button data-v845-vault-retry class="outline-btn" type="button">↻ ${esc(vaultCopy("ลองใหม่","Retry"))}</button></div>`;q("[data-v845-vault-retry]",body)?.addEventListener("click",()=>vaultLoad(true));return;}
    const groups=vaultLogicalGroups();
    const list=groups.length?groups.map(group=>{const latest=group.latest,expanded=vaultUi.expanded.has(group.name),versions=expanded?`<div class="v845-version-list">${group.versions.map(row=>`<div class="v845-version-row"><div><b>v${Number(row.version)||1}</b><span>${vaultFormatBytes(row.file_size)} · ${esc(vaultDate(row.created_at))}</span></div><div><button type="button" data-v845-download-version="${esc(row.id)}">↓</button><button type="button" class="danger" data-v845-delete-version="${esc(row.id)}">🗑</button></div></div>`).join("")}</div>`:"";return `<article class="v845-file-card"><div class="v845-file-main"><span class="v845-file-icon">${vaultFileIcon(group.name)}</span><div><strong title="${esc(group.name)}">${esc(group.name)}</strong><small>v${Number(latest.version)||1} · ${vaultFormatBytes(latest.file_size)} · ${esc(vaultDate(latest.created_at))}</small></div></div><div class="v845-file-actions"><button type="button" data-v845-download="${esc(latest.id)}">↓ ${esc(vaultCopy("ดาวน์โหลด","Download"))}</button><button type="button" data-v845-new-version="${esc(group.name)}">＋ ${esc(vaultCopy("Version ใหม่","New Version"))}</button><button type="button" data-v845-versions="${esc(group.name)}">${expanded?"▴":"▾"} ${group.versions.length} ${esc(vaultCopy("เวอร์ชัน","versions"))}</button><button type="button" data-v845-rename="${esc(group.name)}">✎</button><button type="button" class="danger" data-v845-delete-file="${esc(group.name)}">🗑</button></div>${versions}</article>`;}).join(""):`<div class="v845-vault-empty"><span>📂</span><h3>${esc(vaultCopy("Project นี้ยังไม่มีไฟล์","No files in this project yet"))}</h3><p>${esc(vaultCopy("อัปโหลด ZIP, PDF, Word, Excel, PowerPoint, รูปภาพ หรือไฟล์ข้อความได้สูงสุด 20 MB ต่อไฟล์","Upload ZIP, PDF, Office documents, images or text files up to 20 MB each."))}</p></div>`;
    body.innerHTML=`${vaultHeaderMarkup()}${vaultAchievementMarkup()}<div class="v845-vault-toolbar"><div><strong>🔐 ${esc(vaultCopy("Private Storage","Private Storage"))}</strong><small>${esc(vaultCopy("สูงสุด 20 MB/ไฟล์ · 8 ไฟล์หลัก/Project · 100 MB/User","20 MB/file · 8 logical files/project · 100 MB/user"))}</small></div><button data-v845-upload-new class="primary-btn" type="button" ${groups.length>=VAULT_MAX_PROJECT_FILES?"disabled":""}>＋ ${esc(vaultCopy("อัปโหลดไฟล์","Upload File"))}</button></div><div class="v845-file-list">${list}</div><p class="v845-vault-note">💡 ${esc(vaultCopy("อัปโหลดไฟล์ชื่อเดิมจะสร้าง Version ใหม่โดยอัตโนมัติ · อย่าอัปโหลด .env, Password, API Secret หรือ Database Dump","Uploading the same logical filename creates a new version automatically · never upload .env files, passwords, API secrets or database dumps."))}</p>`;
    q("[data-v845-upload-new]",body)?.addEventListener("click",()=>vaultPickFile(""));
    qa("[data-v845-download]",body).forEach(btn=>btn.addEventListener("click",()=>vaultDownload(btn.dataset.v845Download)));
    qa("[data-v845-download-version]",body).forEach(btn=>btn.addEventListener("click",()=>vaultDownload(btn.dataset.v845DownloadVersion)));
    qa("[data-v845-new-version]",body).forEach(btn=>btn.addEventListener("click",()=>vaultPickFile(btn.dataset.v845NewVersion)));
    qa("[data-v845-versions]",body).forEach(btn=>btn.addEventListener("click",()=>{const name=btn.dataset.v845Versions;vaultUi.expanded.has(name)?vaultUi.expanded.delete(name):vaultUi.expanded.add(name);vaultRender();}));
    qa("[data-v845-rename]",body).forEach(btn=>btn.addEventListener("click",()=>vaultRenameFile(btn.dataset.v845Rename)));
    qa("[data-v845-delete-file]",body).forEach(btn=>btn.addEventListener("click",()=>vaultDeleteLogicalFile(btn.dataset.v845DeleteFile)));
    qa("[data-v845-delete-version]",body).forEach(btn=>btn.addEventListener("click",()=>vaultDeleteVersion(btn.dataset.v845DeleteVersion)));
  }

  async function vaultFetchProjectRows(projectId){ const {client,user}=vaultCloud();if(!client||!user?.id)return[];const {data,error}=await client.from(VAULT_TABLE).select("id,user_id,project_id,logical_name,version,storage_path,file_size,mime_type,created_at").eq("user_id",user.id).eq("project_id",projectId).order("created_at",{ascending:false});if(error)throw error;return Array.isArray(data)?data:[]; }
  async function vaultFetchUserUsageRows(){ const {client,user}=vaultCloud();if(!client||!user?.id)return[];const {data,error}=await client.from(VAULT_TABLE).select("project_id,logical_name,file_size,version,created_at").eq("user_id",user.id);if(error)throw error;return Array.isArray(data)?data:[]; }
  function vaultFriendlyError(err){ const msg=String(err?.message||err||"");if(/project_file_versions|relation .* does not exist|schema cache/i.test(msg))return vaultCopy("ไม่พบ Table project_file_versions · กรุณารัน SQL Setup ของ V8.4.5 ใน Supabase ก่อน","Table project_file_versions was not found. Run the V8.4.5 Supabase setup SQL first.");if(/bucket|not found|storage/i.test(msg)&&/project-files/i.test(msg))return vaultCopy("ไม่พบ Storage Bucket project-files · กรุณารัน SQL Setup ของ V8.4.5","Storage bucket project-files was not found. Run the V8.4.5 setup SQL.");if(/row-level security|permission|policy|unauthorized/i.test(msg))return vaultCopy("Supabase Policy ยังไม่อนุญาตให้เข้าถึงไฟล์ของบัญชีนี้ · ตรวจสอบ RLS/Storage Policy","Supabase policies are blocking access. Check the RLS and Storage policies.");return msg||vaultCopy("เกิดข้อผิดพลาดในการเชื่อมต่อ File Vault","Could not connect to File Vault"); }
  async function vaultLoad(showLoading=true){ if(!vaultUi.projectId)return;if(showLoading){vaultUi.loading=true;vaultUi.error="";vaultRender();}try{const [rows,usageRows]=await Promise.all([vaultFetchProjectRows(vaultUi.projectId),vaultFetchUserUsageRows()]);vaultUi.rows=rows;vaultUi.userUsage=usageRows.reduce((sum,x)=>sum+Number(x.file_size||0),0);vaultUpdateAchievementStats(usageRows);vaultRememberProject(vaultUi.projectId,rows.length>0);vaultUi.error="";}catch(err){vaultUi.rows=[];vaultUi.userUsage=0;vaultUi.error=vaultFriendlyError(err);}finally{vaultUi.loading=false;vaultRender();refreshProjectFileSummaries();} }
  async function openProjectVault(projectId){ ensureVaultModal();const list=read("wp-v6-projects",[]),project=Array.isArray(list)?list.find(p=>p.id===projectId):null;vaultUi.projectId=projectId;vaultUi.projectName=project?.name||vaultCopy("Project Files","Project Files");vaultUi.rows=[];vaultUi.userUsage=0;vaultUi.error="";vaultUi.expanded=new Set();const wrap=$("v845VaultBackdrop");wrap.hidden=false;requestAnimationFrame(()=>wrap.classList.add("open"));vaultRender();if(vaultSignedIn())await vaultLoad(true); }
  function vaultPickFile(logicalName=""){ if(!vaultSignedIn()){vaultOpenAccount();return;}vaultUi.replaceName=logicalName||"";const input=$("v845VaultInput");if(input){input.value="";input.click();} }
  function vaultValidateFile(file){ const ext=String(file?.name||"").split(".").pop().toLowerCase();if(!VAULT_ALLOWED_EXT.has(ext))return vaultCopy("ไฟล์ประเภทนี้ยังไม่รองรับ กรุณาใช้ ZIP, PDF, Office, รูปภาพ หรือไฟล์ข้อความ","This file type is not supported. Use ZIP, PDF, Office documents, images or text files.");if(Number(file?.size||0)<=0)return vaultCopy("ไฟล์นี้ว่างเปล่า","This file is empty.");if(Number(file.size)>VAULT_MAX_FILE_BYTES)return vaultCopy("ไฟล์ใหญ่เกิน 20 MB","The file exceeds the 20 MB limit.");return""; }
  async function vaultUploadFile(file,logicalOverride=""){
    const invalid=vaultValidateFile(file);if(invalid){toast("!",invalid,"error");return;}const {client,user}=vaultCloud();if(!client||!user?.id){vaultOpenAccount();return;}
    const groups=vaultLogicalGroups(),logicalName=(logicalOverride||file.name).trim().slice(0,180),existing=groups.find(g=>g.name===logicalName);
    if(!existing&&groups.length>=VAULT_MAX_PROJECT_FILES){toast("📁",vaultCopy("Project นี้มีไฟล์หลักครบ 8 รายการแล้ว ลบไฟล์เดิมหรืออัปโหลดเป็น Version ใหม่","This project already has 8 logical files. Delete one or upload a new version."),"warning");return;}
    if(vaultUi.userUsage+file.size>VAULT_USER_QUOTA_BYTES){toast("💾",vaultCopy("พื้นที่ File Vault ของคุณเกิน 100 MB แล้ว","Your File Vault would exceed the 100 MB quota."),"error");return;}
    const versions=vaultUi.rows.filter(r=>r.logical_name===logicalName),version=Math.max(0,...versions.map(r=>Number(r.version)||0))+1,projectSeg=vaultSafePath(vaultUi.projectId),fileSeg=vaultSafePath(file.name),path=`${user.id}/${projectSeg}/${Date.now()}_${stableHash(logicalName)}_v${version}_${fileSeg}`;
    vaultUi.loading=true;vaultRender();let uploaded=false;
    try{const up=await client.storage.from(VAULT_BUCKET).upload(path,file,{cacheControl:"3600",upsert:false,contentType:file.type||undefined});if(up.error)throw up.error;uploaded=true;const {error}=await client.from(VAULT_TABLE).insert({user_id:user.id,project_id:vaultUi.projectId,logical_name:logicalName,version,storage_path:path,file_size:file.size,mime_type:file.type||"application/octet-stream"});if(error)throw error;vaultRememberProject(vaultUi.projectId,true);toast("✓",vaultCopy(`อัปโหลด ${logicalName} v${version} แล้ว`,`Uploaded ${logicalName} v${version}`),"success");}
    catch(err){if(uploaded)try{await client.storage.from(VAULT_BUCKET).remove([path]);}catch{}toast("!",vaultFriendlyError(err),"error");}
    finally{vaultUi.loading=false;await vaultLoad(false);await reconcileRewards({notify:true});}
  }
  function vaultRowById(id){return vaultUi.rows.find(r=>String(r.id)===String(id));}
  async function vaultDownload(id){const row=vaultRowById(id),{client}=vaultCloud();if(!row||!client)return;try{const {data,error}=await client.storage.from(VAULT_BUCKET).createSignedUrl(row.storage_path,120,{download:row.logical_name});if(error)throw error;const a=document.createElement("a");a.href=data.signedUrl;a.download=row.logical_name;a.rel="noopener";document.body.appendChild(a);a.click();a.remove();}catch(err){toast("!",vaultFriendlyError(err),"error");}}
  async function vaultRenameFile(oldName){const next=prompt(vaultCopy("ชื่อไฟล์ใหม่","New file name"),oldName)?.trim();if(!next||next===oldName)return;if(next.length>180){toast("!",vaultCopy("ชื่อไฟล์ยาวเกินไป","File name is too long"),"error");return;}if(vaultLogicalGroups().some(g=>g.name.toLowerCase()===next.toLowerCase())){toast("!",vaultCopy("มีไฟล์ชื่อนี้อยู่แล้ว","A file with this name already exists"),"warning");return;}const {client,user}=vaultCloud();if(!client||!user?.id)return;vaultUi.loading=true;vaultRender();try{const {error}=await client.from(VAULT_TABLE).update({logical_name:next}).eq("user_id",user.id).eq("project_id",vaultUi.projectId).eq("logical_name",oldName);if(error)throw error;vaultUi.expanded.delete(oldName);toast("✎",vaultCopy("เปลี่ยนชื่อไฟล์แล้ว","File renamed"),"success");}catch(err){toast("!",vaultFriendlyError(err),"error");}finally{vaultUi.loading=false;await vaultLoad(false);} }
  async function vaultDeleteLogicalFile(name){if(!confirm(vaultCopy(`ลบ ${name} และทุก Version?`,`Delete ${name} and every version?`)))return;const rows=vaultUi.rows.filter(r=>r.logical_name===name),{client,user}=vaultCloud();if(!client||!user?.id)return;vaultUi.loading=true;vaultRender();try{const paths=rows.map(r=>r.storage_path).filter(Boolean);if(paths.length){const rm=await client.storage.from(VAULT_BUCKET).remove(paths);if(rm.error)throw rm.error;}const {error}=await client.from(VAULT_TABLE).delete().eq("user_id",user.id).eq("project_id",vaultUi.projectId).eq("logical_name",name);if(error)throw error;toast("🗑",vaultCopy("ลบไฟล์และ Version ทั้งหมดแล้ว","File and all versions deleted"),"warning");}catch(err){toast("!",vaultFriendlyError(err),"error");}finally{vaultUi.loading=false;await vaultLoad(false);} }
  async function vaultDeleteVersion(id){const row=vaultRowById(id);if(!row||!confirm(vaultCopy(`ลบ ${row.logical_name} v${row.version}?`,`Delete ${row.logical_name} v${row.version}?`)))return;const {client,user}=vaultCloud();if(!client||!user?.id)return;const siblings=vaultUi.rows.filter(r=>r.logical_name===row.logical_name);if(siblings.length===1){await vaultDeleteLogicalFile(row.logical_name);return;}vaultUi.loading=true;vaultRender();try{const rm=await client.storage.from(VAULT_BUCKET).remove([row.storage_path]);if(rm.error)throw rm.error;const {error}=await client.from(VAULT_TABLE).delete().eq("user_id",user.id).eq("id",row.id);if(error)throw error;toast("🗑",vaultCopy("ลบ Version แล้ว","Version deleted"),"warning");}catch(err){toast("!",vaultFriendlyError(err),"error");}finally{vaultUi.loading=false;await vaultLoad(false);} }

  async function syncVaultAchievementStats(){
    if(!navigator.onLine||!vaultSignedIn())return false;
    try{const rows=await vaultFetchUserUsageRows();vaultUpdateAchievementStats(rows);return true;}catch{return false;}
  }

  async function refreshProjectFileSummaries(){
    if(!location.hash.includes("/projects"))return;const nodes=qa("[data-v845-file-summary]");if(!nodes.length)return;const {client,user}=vaultCloud();if(!client||!user?.id){nodes.forEach(el=>el.textContent=`☁ ${vaultCopy("Login เพื่อใช้ File Vault","Sign in for File Vault")}`);return;}
    try{const rows=await vaultFetchUserUsageRows(),map=new Map();vaultUpdateAchievementStats(rows);rows.forEach(r=>{const id=String(r.project_id||"");if(!map.has(id))map.set(id,{names:new Set(),bytes:0});const item=map.get(id);item.names.add(String(r.logical_name||""));item.bytes+=Number(r.file_size||0);});write(KEYS.vaultProjects,[...map.keys()]);nodes.forEach(el=>{const item=map.get(el.dataset.v845FileSummary);el.textContent=item?`☁ ${item.names.size} ${vaultCopy("ไฟล์","files")} · ${vaultFormatBytes(item.bytes)}`:`☁ ${vaultCopy("ยังไม่มีไฟล์","No files")}`;});}
    catch(err){nodes.forEach(el=>el.textContent=`⚠ ${vaultCopy("ตั้งค่า File Vault","Set up File Vault")}`);}
  }

  async function vaultCleanupProject(projectId,{silent=false}={}){
    const known=vaultKnownProjects().has(String(projectId||"")),{client,user}=vaultCloud();
    if(!known)return true;
    if(!client||!user?.id){if(!silent)toast("☁",vaultCopy("Project นี้มีไฟล์ Cloud กรุณา Login ก่อนลบ Project เพื่อให้ระบบลบไฟล์ด้วย","This project has Cloud files. Sign in before deleting the project so its files can be cleaned up."),"warning");return false;}
    if(!navigator.onLine){if(!silent)toast("☁",vaultCopy("กรุณาเชื่อมอินเทอร์เน็ตก่อนลบ Project ที่มีไฟล์ Cloud","Connect to the internet before deleting a project that has Cloud files."),"warning");return false;}
    try{const rows=await vaultFetchProjectRows(projectId),paths=rows.map(r=>r.storage_path).filter(Boolean);if(paths.length){const rm=await client.storage.from(VAULT_BUCKET).remove(paths);if(rm.error)throw rm.error;}const del=await client.from(VAULT_TABLE).delete().eq("user_id",user.id).eq("project_id",projectId);if(del.error)throw del.error;vaultRememberProject(projectId,false);return true;}catch(err){const raw=String(err?.message||err||"");if(/project_file_versions|relation .* does not exist|schema cache/i.test(raw)){vaultRememberProject(projectId,false);return true;}if(!silent)toast("!",vaultFriendlyError(err),"error");return false;}
  }

  document.addEventListener("click",e=>{const btn=e.target.closest?.("[data-v845-project-files]");if(btn){e.preventDefault();openProjectVault(btn.dataset.v845ProjectFiles);}},true);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("v845VaultBackdrop")&&!$("v845VaultBackdrop").hidden)closeProjectVault();});
  window.WorkdayProjectFileVault={open:openProjectVault,refreshSummaries:refreshProjectFileSummaries,cleanupBeforeProjectDelete:id=>vaultCleanupProject(id,{silent:false}),deleteProjectFiles:vaultCleanupProject,isSignedIn:vaultSignedIn};


  function refreshAll() {
    markRouteVisit();
    applyEquippedRewards();
    ensureCoinChip();
    if (location.hash.includes("/rewards")) renderShop();
    if (location.hash.includes("/missions")) renderMissions();
    if (location.hash.includes("/bank")) renderBank();
    if (location.hash.includes("/exchange")) renderExchange();
    if (location.hash.includes("/projects")) setTimeout(refreshProjectFileSummaries,60);
  }

  window.WorkdayRewards = {
    version: VERSION,
    getBalance: () => balance(),
    getLedger: () => ledger().map(x=>({...x})),
    getEquippedMascot: () => MASCOTS.find(m=>m.id===selectedMascotId()) || MASCOTS[0],
    getMascotPresentation: snapshot => mascotPresentation(snapshot),
    getEquippedTheme: () => selectedThemeId(),
    getEquippedEffect: () => selectedEffectId(),
    getEquippedAccessory: () => selectedAccessoryId(),
    getEquippedFrame: () => selectedFrameId(),
    getCatalog: () => ALL_REWARDS.map(r=>({id:r.id,type:r.type,price:r.price,name:rewardName(r),description:rewardDescription(r),icon:r.emoji||r.icon||"🎁",rarity:r.rarity||"common",codeExclusive:!!r.codeExclusive,owned:isOwned(r)})),
    getReward: (type,id) => { const r=rewardBy(type,id); return r?{id:r.id,type:r.type,price:r.price,name:rewardName(r),description:rewardDescription(r),icon:r.emoji||r.icon||"🎁",rarity:r.rarity||"common",codeExclusive:!!r.codeExclusive,owned:isOwned(r)}:null; },
    renderShop,
    renderMissions,
    renderBank,
    getDailyDeals: () => dailyFeaturedRewards().map(r=>({type:r.type,id:r.id,name:rewardName(r),...dailyDealFor(r)})),
    getWeeklyDeals: () => weeklyFeaturedRewards().map(r=>({type:r.type,id:r.id,name:rewardName(r),...weeklyDealFor(r)})),
    getBankStatus: () => { const list=bankLedger(),state=ensureBankV844State(bankState(),list),savings=bankBalance(list),info=bankRateInfo(savings,dayKeyNow(),state); return {savings,state:{...state},tier:info.tier.id,baseRate:info.baseRate,streakBonusRate:info.bonusRate,effectiveRate:info.effectiveRate,streakDays:info.streakDays,nextInterest:bankDailyInterest(savings,dayKeyNow(),state),cap:info.cap}; },
    renderExchange,
    getExchangePortfolio: () => exchangePortfolio(),
    getExchangeTrades: () => exchangeTrades().map(x=>({...x})),
    getExchangeMarket: () => exchangeSnapshots().map(x=>({...x})),
    getTradingAcademy: () => ({state:academyState(),completed:academyCompletedCount(),total:EXCHANGE_ACADEMY.length,beginnerMode:beginnerModeEnabled()}),
    completeTradingAcademyLesson: (id,answerId) => academyCompleteLesson(id,answerId,{notify:false}),
    tradeExchange: exchangeTrade,
    toggleExchangeWatch: exchangeToggleWatch,
    depositToBank: bankDeposit,
    withdrawFromBank: bankWithdraw,
    getBankBalance: () => bankBalance(),
    settleBankInterest,
    claimMission,
    openChest,
    getMascotBond: id => mascotBond(id),
    reconcile: reconcileRewards
  };

  function economySyncPending(){
    const status=window.WorkdayV8Cloud?.getStatus?.()||{status:"local",signedIn:false,ready:true};
    return !!status.conflict || !!status.reconciling || (status.signedIn && status.status==="syncing" && !status.ready);
  }
  async function initialReconcile(attempt=0) {
    const cloudApi = window.WorkdayV8Cloud;
    const status = cloudApi?.getStatus?.() || {status:"local",signedIn:false,ready:true};
    const rememberedUser = !!localStorage.getItem("wp-v8-cloud-user-id");
    const waitingForSession = rememberedUser && !status.signedIn && attempt < 12;
    if (status.conflict) return;
    const waitingForCloud = status.signedIn && status.status !== "offline" && !status.ready && attempt < 20;
    if (waitingForSession || waitingForCloud) { setTimeout(() => initialReconcile(attempt + 1), 500); return; }
    settleBankInterest({notify:false});
    reconcileExchangeAchievements({notify:false});
    await syncVaultAchievementStats();
    await reconcileRewards({notify:true});
  }

  function init() {
    const owned = ownedRewards(); saveOwned(owned);
    applyEquippedRewards();
    ensureCoinChip();
    // V8.5.0: do not settle time-based Economy state before an existing
    // signed-in Cloud session has finished its first reconciliation.
    setTimeout(() => initialReconcile(), 700);
    window.addEventListener("workday:v8-cloud-ready", () => setTimeout(() => initialReconcile(20), 40));
    window.addEventListener("workday:v7-data-changed", () => setTimeout(() => { reconcileRewards({notify:true}); refreshProjectFileSummaries(); }, 80));
    window.addEventListener("workday:v8-data-changed", () => setTimeout(() => { if(economySyncPending())return; settleBankInterest({notify:false}); reconcileExchangeAchievements({notify:false}); syncVaultAchievementStats().finally(()=>reconcileRewards({notify:false})); }, 80));
    window.addEventListener("storage", event => { if (String(event.key||"").startsWith("wp-v81-") || String(event.key||"").startsWith("wp-v82-") || String(event.key||"").startsWith("wp-v83-") || String(event.key||"").startsWith("wp-v831-") || String(event.key||"").startsWith("wp-v84-") || String(event.key||"").startsWith("wp-v841-") || String(event.key||"").startsWith("wp-v845-") || String(event.key||"").startsWith("wp-v846-")) refreshAll(); });
    window.addEventListener("hashchange", () => { markRouteVisit(); setTimeout(refreshAll,40); });
    document.addEventListener("visibilitychange", () => { if (!document.hidden) { updateExchangeClock(); if (!economySyncPending()) { settleBankInterest({notify:true}); reconcileRewards({notify:false}); } } });
    window.addEventListener("online", () => { if(economySyncPending())return; reconcileExchangeAchievements({notify:false}); syncVaultAchievementStats().finally(()=>reconcileRewards({notify:false})); });
    setInterval(() => updateExchangeClock(), 1000);
    setInterval(() => reconcileRewards({notify:true}), 15000);
    setInterval(() => { if(!economySyncPending())settleBankInterest({notify:true}); }, 60000);
    setInterval(() => ensureCoinChip(), 3000);
    setInterval(() => refreshProjectFileSummaries(), 30000);
    setTimeout(() => {
      refreshAll();
      try { window.dispatchEvent(new CustomEvent("workday:v7-data-changed")); } catch {}
    }, 350);
  }

  init();
})();
;

/* ===== SOURCE: v848.js ===== */
(() => {
  "use strict";

  const VERSION = "8.5.0";
  const $ = id => document.getElementById(id);
  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const lang = () => localStorage.getItem("wp-language") === "en" ? "en" : "th";
  const cloud = () => window.WorkdayV8Cloud || null;
  const rewards = () => window.WorkdayRewards || null;

  const state = {
    owner:null,
    ownerChecking:false,
    setupMissing:false,
    codes:[],
    redemptions:[],
    editingId:null,
    loadingAdmin:false
  };

  const copy = (th,en) => lang()==="th" ? th : en;
  function toast(icon,message,type="info"){
    const stack=$("toastStack");
    if(!stack)return;
    const node=document.createElement("div");
    node.className=`app-toast v7-toast toast-${type}`;
    node.setAttribute("role",type==="error"?"alert":"status");
    node.innerHTML=`<span>${icon}</span><div><strong>${esc(message)}</strong></div>`;
    stack.appendChild(node);
    setTimeout(()=>{node.classList.add("out");setTimeout(()=>node.remove(),250);},3600);
  }
  function client(){ return cloud()?.getClient?.() || null; }
  function user(){ return cloud()?.getUser?.() || null; }
  function signedIn(){ return !!cloud()?.isSignedIn?.(); }
  function safeDate(value){
    if(!value)return "—";
    const d=new Date(value);if(Number.isNaN(d.getTime()))return "—";
    return new Intl.DateTimeFormat(lang()==="th"?"th-TH":"en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(d);
  }
  function normalizedCode(value){return String(value||"").trim().toUpperCase().replace(/\s+/g,"");}
  function catalog(){return rewards()?.getCatalog?.() || [];}
  function rewardLabel(item){
    const r=catalog().find(x=>x.type===item?.type&&x.id===item?.id);
    return r?`${r.icon||"🎁"} ${r.name}`:`🎁 ${item?.type||"reward"}:${item?.id||"?"}`;
  }
  function rewardPayload(raw){
    const value=raw&&typeof raw==="object"?raw:{};
    const items=Array.isArray(value.items)?value.items.filter(x=>x&&x.type&&x.id):[];
    const chests=Array.isArray(value.chests)?value.chests.filter(x=>x&&["daily","weekly","mystery"].includes(x.kind)&&Number(x.count)>0).map(x=>({kind:x.kind,count:Math.max(1,Math.min(10,Math.round(Number(x.count)||1)))})):[];
    return {coins:Math.max(0,Math.round(Number(value.coins)||0)),items,chests};
  }
  function rewardSummary(payload,{compact=false}={}){
    const r=rewardPayload(payload),parts=[];
    if(r.coins>0)parts.push(`<span>🪙 <b>+${r.coins.toLocaleString()}</b> Coins</span>`);
    r.items.forEach(item=>parts.push(`<span>${esc(rewardLabel(item))}</span>`));
    r.chests.forEach(ch=>parts.push(`<span>${ch.kind==="daily"?"🎁":ch.kind==="weekly"?"🏆":"🎲"} ${esc(ch.kind[0].toUpperCase()+ch.kind.slice(1))} Chest ×${ch.count}</span>`));
    if(!parts.length)parts.push(`<span>🎁 ${esc(copy("ไม่มีรางวัลที่ตั้งค่าไว้","No reward configured"))}</span>`);
    return `<div class="v848-reward-summary ${compact?"compact":""}">${parts.join("")}</div>`;
  }

  // ---------- Shared modal UI ----------
  function ensureUi(){
    if(!$("v848RedeemBackdrop")){
      const back=document.createElement("div");back.id="v848RedeemBackdrop";back.className="v848-backdrop";back.hidden=true;
      back.innerHTML=`<section class="v848-modal v848-redeem-modal" role="dialog" aria-modal="true" aria-labelledby="v848RedeemTitle"><button id="v848RedeemClose" class="v848-modal-close" type="button" aria-label="Close">×</button><div class="v848-modal-icon">🎟</div><p class="eyebrow">REWARD CODE · V${VERSION}</p><h2 id="v848RedeemTitle">${esc(copy("แลกรับ Reward Code","Redeem Reward Code"))}</h2><p class="v848-modal-help">${esc(copy("กรอก Code ที่ได้รับเพื่อรับ Work Coins, Item ลับ หรือ Chest","Enter a code to unlock Work Coins, exclusive items or chests"))}</p><form id="v848RedeemForm"><label><span>${esc(copy("Reward Code","Reward Code"))}</span><input id="v848RedeemInput" type="text" inputmode="text" autocomplete="off" maxlength="32" placeholder="PEACE99"></label><div id="v848RedeemError" class="v848-inline-error" hidden></div><button id="v848RedeemSubmit" class="primary-btn" type="submit">🎁 ${esc(copy("รับรางวัล","Redeem"))}</button></form><small class="v848-cloud-note">☁ ${esc(copy("Reward Code ต้องเข้าสู่ระบบเพื่อบันทึกสิทธิ์การใช้งาน","Reward Codes require sign-in so redemptions can be recorded"))}</small></section>`;
      document.body.appendChild(back);
      $("v848RedeemClose").onclick=closeRedeem;
      back.addEventListener("click",e=>{if(e.target===back)closeRedeem();});
      $("v848RedeemInput").addEventListener("input",e=>{const pos=e.target.selectionStart;e.target.value=normalizedCode(e.target.value);try{e.target.setSelectionRange(pos,pos);}catch{}});
      $("v848RedeemForm").addEventListener("submit",e=>{e.preventDefault();redeemCode();});
    }
    if(!$("v848RewardBackdrop")){
      const back=document.createElement("div");back.id="v848RewardBackdrop";back.className="v848-backdrop v848-reward-backdrop";back.hidden=true;
      back.innerHTML=`<section class="v848-modal v848-success-modal" role="dialog" aria-modal="true"><button id="v848RewardClose" class="v848-modal-close" type="button" aria-label="Close">×</button><div class="v848-celebration" aria-hidden="true">${Array.from({length:18},(_,i)=>`<i style="--i:${i};--x:${(i*31+7)%94}%">${i%4===0?"🪙":i%3===0?"✦":"●"}</i>`).join("")}</div><div class="v848-success-mark">✓</div><p class="eyebrow">REWARD UNLOCKED</p><h2 id="v848RewardTitle">${esc(copy("รับรางวัลสำเร็จ!","Reward unlocked!"))}</h2><p id="v848RewardCode" class="v848-code-display"></p><div id="v848RewardBody"></div><button id="v848RewardDone" class="primary-btn" type="button">${esc(copy("เยี่ยมมาก!","Awesome!"))}</button></section>`;
      document.body.appendChild(back);
      const close=()=>{back.classList.remove("show");setTimeout(()=>back.hidden=true,140);};
      $("v848RewardClose").onclick=close;$("v848RewardDone").onclick=close;back.addEventListener("click",e=>{if(e.target===back)close();});
    }
  }
  function openBackdrop(back){back.hidden=false;requestAnimationFrame(()=>back.classList.add("show"));}
  function closeRedeem(){const back=$("v848RedeemBackdrop");if(!back)return;back.classList.remove("show");setTimeout(()=>back.hidden=true,140);}
  function redeemError(message){const el=$("v848RedeemError");if(!el)return;el.hidden=!message;el.textContent=message||"";}
  function setRedeemBusy(busy){const btn=$("v848RedeemSubmit"),input=$("v848RedeemInput");if(btn){btn.disabled=busy;btn.textContent=busy?`⏳ ${copy("กำลังตรวจสอบ...","Checking...")}`:`🎁 ${copy("รับรางวัล","Redeem")}`;}if(input)input.disabled=busy;}
  function openRedeem(){
    ensureUi();
    if(!signedIn()){
      cloud()?.openAccount?.({mode:"signin",returnAction:"redeem-code"});
      return;
    }
    redeemError("");const input=$("v848RedeemInput");if(input){input.disabled=false;input.value="";}
    setRedeemBusy(false);openBackdrop($("v848RedeemBackdrop"));setTimeout(()=>input?.focus(),80);
  }
  function friendlyRedeemError(error){
    const m=String(error?.message||error||"");
    if(m.includes("REWARD_CODE_NOT_FOUND"))return copy("ไม่พบ Reward Code นี้ กรุณาตรวจสอบอีกครั้ง","Reward Code not found. Check the code and try again.");
    if(m.includes("REWARD_CODE_INACTIVE"))return copy("Reward Code นี้ถูกปิดใช้งานแล้ว","This Reward Code is inactive.");
    if(m.includes("REWARD_CODE_EXPIRED"))return copy("Reward Code นี้หมดอายุแล้ว","This Reward Code has expired.");
    if(m.includes("REWARD_CODE_MAX_USES"))return copy("Reward Code นี้ถูกใช้ครบจำนวนแล้ว","This Reward Code has reached its maximum uses.");
    if(m.includes("REWARD_CODE_USER_LIMIT")||m.includes("REWARD_CODE_ALREADY_USED"))return copy("คุณใช้ Reward Code นี้ครบจำนวนแล้ว","You have already used this Reward Code the allowed number of times.");
    if(m.includes("REWARD_CODE_LOGIN_REQUIRED"))return copy("กรุณาเข้าสู่ระบบก่อนใช้ Reward Code","Please sign in before redeeming a Reward Code.");
    if(/column reference ["\']?code["\']? is ambiguous/i.test(m))return copy("\u0E10\u0E32\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 Reward Code \u0E22\u0E31\u0E07\u0E43\u0E0A\u0E49 RPC \u0E23\u0E38\u0E48\u0E19\u0E40\u0E01\u0E48\u0E32 \u0E01\u0E23\u0E38\u0E13\u0E32 Run SQL Hotfix V8.4.8.1 \u0E01\u0E48\u0E2D\u0E19","Reward Code RPC is an older version. Run the V8.4.8.1 SQL hotfix first.");
    if(/function .*redeem_reward_code|does not exist|schema cache/i.test(m))return copy("ระบบ Reward Code ยังไม่ได้ติดตั้งใน Supabase กรุณา Run SQL Setup V8.4.8.1 ก่อน","Reward Codes are not installed in Supabase yet. Run the V8.4.8.1 SQL setup first.");
    return `${copy("ไม่สามารถใช้ Code ได้","Unable to redeem code")}: ${m}`;
  }
  function normalizedRedemption(row){
    if(!row)return null;
    return {
      id:row.redemption_id||row.id||"",
      code:row.code||row.code_snapshot||"",
      title:row.title||row.title_snapshot||"Reward Code",
      reward:rewardPayload(row.reward||row.reward_snapshot||{}),
      redeemedAt:row.redeemed_at||row.redeemedAt||new Date().toISOString()
    };
  }
  function applyRedemption(row,{show=false}={}){
    const r=normalizedRedemption(row);if(!r?.id)return null;
    const economy=row?.economy||null;if(economy)window.WorkdayEconomySecurity?.applyEconomy?.(economy);
    const result={coins:Number(r.reward?.coins||0),items:Array.isArray(r.reward?.items)?r.reward.items:[],chests:[]};
    if(show)showRewardSuccess(r,result);
    return result;
  }

  function showRewardSuccess(redemption,result={}){
    ensureUi();closeRedeem();
    const back=$("v848RewardBackdrop"),r=normalizedRedemption(redemption);
    $("v848RewardTitle").textContent=r.title||copy("รับรางวัลสำเร็จ!","Reward unlocked!");
    $("v848RewardCode").textContent=r.code?`🎟 ${r.code}`:"🎟 REWARD CODE";
    const actual=[];
    if(Number(result.coins)>0)actual.push(`<article><span>🪙</span><div><small>WORK COINS</small><strong>+${Number(result.coins).toLocaleString()}</strong></div></article>`);
    (result.items||[]).forEach(x=>actual.push(`<article><span>${esc(x.icon||"🎁")}</span><div><small>${esc(String(x.type||"ITEM").toUpperCase())}</small><strong>${esc(x.name||x.id)}</strong></div></article>`));
    (result.chests||[]).forEach(x=>actual.push(`<article><span>${esc(x.icon||"🎁")}</span><div><small>${esc(String(x.kind||"CHEST").toUpperCase())} CHEST</small><strong>${esc(x.title||x.rewardText||"Reward")}</strong></div></article>`));
    $("v848RewardBody").innerHTML=`<p class="v848-success-help">${esc(copy("รางวัลถูกบันทึกใน Journey แล้ว และจะ Sync ไปกับบัญชีของคุณ","Your reward is saved to your Journey and will sync with your account"))}</p><div class="v848-success-grid">${actual.length?actual.join(""):`<article><span>✓</span><div><small>${esc(copy("ได้รับแล้ว","ALREADY APPLIED"))}</small><strong>${esc(copy("รางวัลนี้อยู่ในบัญชีของคุณแล้ว","This reward is already in your account"))}</strong></div></article>`}</div>`;
    openBackdrop(back);
    cloud()?.syncNow?.();
  }
  async function redeemCode(){
    const c=client(),u=user();if(!c||!u){closeRedeem();openRedeem();return;}
    const cloudState=cloud()?.getStatus?.();
    if(cloudState && (!cloudState.ready || cloudState.reconciling)){redeemError(copy("กำลังเตรียมข้อมูล Cloud กรุณารอสักครู่แล้วกดรับรางวัลอีกครั้ง","Cloud data is still being prepared. Wait a moment, then redeem again."));return;}
    const code=normalizedCode($("v848RedeemInput")?.value);
    if(code.length<3){redeemError(copy("กรุณากรอก Reward Code","Enter a Reward Code"));return;}
    redeemError("");setRedeemBusy(true);
    try{
      const {data,error}=await c.rpc("redeem_reward_code",{p_code:code});
      if(error)throw error;
      const row=Array.isArray(data)?data[0]:data;if(!row)throw new Error("REWARD_CODE_NOT_FOUND");
      applyRedemption(row,{show:true});
      await refreshOwnerDashboard(false);
    }catch(err){redeemError(friendlyRedeemError(err));}
    finally{setRedeemBusy(false);}
  }
  async function syncMyRedemptions(){
    const c=client(),u=user();if(!c||!u)return;
    const cloudState=cloud()?.getStatus?.();
    if(cloudState && (!cloudState.ready || cloudState.reconciling))return;
    try{
      const {data,error}=await c.from("reward_code_redemptions").select("id,code_snapshot,title_snapshot,reward_snapshot,redeemed_at").eq("user_id",u.id).order("redeemed_at",{ascending:true}).limit(200);
      if(error)throw error;
      (data||[]).forEach(row=>applyRedemption(row,{show:false}));
    }catch(err){
      const m=String(err?.message||"");if(!/does not exist|schema cache|permission/i.test(m))console.warn("Reward redemption sync failed",err);
    }
  }

  // ---------- Reward Shop entry ----------
  function enhanceRewards(){
    const root=$("v81RewardsPage");if(!root||$("v848RedeemCard"))return;
    const wallet=q(".v81-wallet-hero",root),card=document.createElement("section");
    card.id="v848RedeemCard";card.className="v848-redeem-card";
    card.innerHTML=`<div class="v848-redeem-art">🎟</div><div><p class="eyebrow">REWARD CODES · V8.5.0</p><h3>${esc(copy("มี Code ลับอยู่ไหม?","Have a secret code?"))}</h3><p>${esc(copy("Login แล้วใช้ Reward Code เพื่อรับ Coins, Code Exclusive Items หรือ Mystery Chest","Sign in and redeem codes for Coins, code-exclusive items or Mystery Chests"))}</p></div><button id="v848OpenRedeem" class="primary-btn" type="button">🎟 ${esc(copy("กรอก Reward Code","Redeem Code"))}</button>`;
    if(wallet)wallet.insertAdjacentElement("afterend",card);else root.prepend(card);
    $("v848OpenRedeem").onclick=openRedeem;
  }

  // ---------- Owner / Developer Control Center ----------
  function setOwnerUi(value){
    state.owner=!!value;document.documentElement.classList.toggle("v848-owner",!!value);
    qa(".v848-owner-nav").forEach(el=>{el.setAttribute("aria-hidden",value?"false":"true");});
    if(!value&&location.hash.includes("/developer"))renderDeveloper();
  }
  async function checkOwner({force=false}={}){
    if(state.ownerChecking)return state.owner;
    const c=client(),u=user();if(!c||!u){state.setupMissing=false;setOwnerUi(false);return false;}
    if(state.owner!==null&&!force)return state.owner;
    state.ownerChecking=true;
    try{
      const {data,error}=await c.rpc("is_workday_owner");
      if(error)throw error;
      state.setupMissing=false;setOwnerUi(data===true);return state.owner;
    }catch(err){
      state.setupMissing=/does not exist|schema cache/i.test(String(err?.message||""));setOwnerUi(false);return false;
    }finally{state.ownerChecking=false;}
  }
  function ownerGuardHtml(){
    if(!signedIn())return `<section class="v848-access-card"><span>🔐</span><h3>${esc(copy("เข้าสู่ระบบ Owner ก่อน","Owner sign-in required"))}</h3><p>${esc(copy("Developer Control Center ใช้ได้เฉพาะบัญชี Owner ที่กำหนดใน Supabase","Developer Control Center is available only to the Owner account configured in Supabase"))}</p><button id="v848OwnerLogin" class="primary-btn" type="button">👤 ${esc(copy("เข้าสู่ระบบ","Sign in"))}</button></section>`;
    if(state.setupMissing)return `<section class="v848-access-card warning"><span>🧩</span><h3>${esc(copy("ยังไม่ได้ติดตั้ง Reward Code Database","Reward Code database is not installed"))}</h3><p>${esc(copy("Run ไฟล์ SUPABASE_REWARD_CODES_SETUP_V8.4.8.1.sql แล้วกำหนด Owner Email ก่อน","Run SUPABASE_REWARD_CODES_SETUP_V8.4.8.1.sql and set the Owner Email first"))}</p></section>`;
    return `<section class="v848-access-card"><span>🛡️</span><h3>${esc(copy("บัญชีนี้ไม่มีสิทธิ์ Owner","This account is not an Owner"))}</h3><p>${esc(copy("Developer Tools ถูกป้องกันด้วย Supabase Owner check ไม่ใช่แค่ซ่อนปุ่มในหน้าเว็บ","Developer Tools are protected by the Supabase Owner check, not only by hiding the UI"))}</p></section>`;
  }
  async function refreshOwnerDashboard(render=true){
    if(!state.owner||state.loadingAdmin)return;
    const c=client();if(!c)return;state.loadingAdmin=true;
    try{
      const [codesRes,redRes]=await Promise.all([
        c.from("reward_codes").select("id,code,title,reward,active,per_user_limit,max_uses,total_uses,expires_at,created_at,updated_at").order("created_at",{ascending:false}),
        c.from("reward_code_redemptions").select("id,code_snapshot,title_snapshot,user_id,user_email,reward_snapshot,redeemed_at").order("redeemed_at",{ascending:false}).limit(30)
      ]);
      if(codesRes.error)throw codesRes.error;if(redRes.error)throw redRes.error;
      state.codes=codesRes.data||[];state.redemptions=redRes.data||[];
    }catch(err){toast("!",`${copy("โหลด Developer Tools ไม่สำเร็จ","Failed to load Developer Tools")}: ${err?.message||err}`,"error");}
    finally{state.loadingAdmin=false;if(render&&location.hash.includes("/developer"))renderDeveloper();}
  }
  function adminStats(){
    const total=state.codes.length,active=state.codes.filter(x=>x.active).length,uses=state.codes.reduce((a,x)=>a+Number(x.total_uses||0),0),users=new Set(state.redemptions.map(x=>x.user_id).filter(Boolean)).size;
    return {total,active,uses,users};
  }
  function codeStatus(code){
    const expired=code.expires_at&&new Date(code.expires_at).getTime()<Date.now();
    const full=code.max_uses!=null&&Number(code.total_uses||0)>=Number(code.max_uses);
    if(!code.active)return ["disabled",copy("ปิดใช้งาน","Inactive")];if(expired)return ["expired",copy("หมดอายุ","Expired")];if(full)return ["full",copy("ใช้ครบแล้ว","Full")];return ["active",copy("ใช้งานอยู่","Active")];
  }
  function itemCheckboxes(selected=[]){
    const selectedKeys=new Set((selected||[]).map(x=>`${x.type}:${x.id}`));
    const rows=catalog().filter(x=>x.codeExclusive||Number(x.price)>0).sort((a,b)=>Number(b.codeExclusive)-Number(a.codeExclusive)||String(a.type).localeCompare(String(b.type))||String(a.name).localeCompare(String(b.name)));
    return rows.map(r=>`<label class="v848-item-check ${r.codeExclusive?"exclusive":""}"><input type="checkbox" data-v848-code-item="${esc(r.type)}:${esc(r.id)}" ${selectedKeys.has(`${r.type}:${r.id}`)?"checked":""}><span>${esc(r.icon||"🎁")}</span><div><strong>${esc(r.name)}</strong><small>${esc(r.codeExclusive?"CODE EXCLUSIVE":`${r.type} · ${r.rarity}`)}</small></div></label>`).join("");
  }
  function codeFormHtml(){
    const edit=state.codes.find(x=>x.id===state.editingId),r=rewardPayload(edit?.reward||{}),ch=Object.fromEntries(r.chests.map(x=>[x.kind,x.count]));
    const expires=edit?.expires_at?new Date(new Date(edit.expires_at).getTime()-new Date(edit.expires_at).getTimezoneOffset()*60000).toISOString().slice(0,16):"";
    return `<section class="v848-admin-card v848-code-editor"><div class="v848-card-head"><div><p class="eyebrow">CODE MANAGER</p><h3>${esc(edit?copy("แก้ไข Reward Code","Edit Reward Code"):copy("สร้าง Reward Code ใหม่","Create Reward Code"))}</h3><p>${esc(copy("ตั้ง Reward Bundle ได้หลายอย่างใน Code เดียว","Combine multiple rewards in one code"))}</p></div>${edit?`<button id="v848CancelEdit" class="outline-btn" type="button">× ${esc(copy("ยกเลิกแก้ไข","Cancel edit"))}</button>`:""}</div><form id="v848CodeForm" class="v848-code-form"><div class="v848-form-grid"><label><span>Code</span><input id="v848CodeValue" required maxlength="32" value="${esc(edit?.code||"")}" placeholder="PEACE99"></label><label><span>${esc(copy("ชื่อกิจกรรม / Pack","Campaign / Pack name"))}</span><input id="v848CodeTitle" required maxlength="80" value="${esc(edit?.title||"")}" placeholder="Owner Pack"></label><label><span>🪙 Coins</span><input id="v848CodeCoins" type="number" min="0" max="1000000" value="${r.coins||0}"></label><label><span>${esc(copy("ใช้ได้ต่อ User","Uses per user"))}</span><input id="v848PerUser" type="number" min="1" max="50" value="${Math.max(1,Number(edit?.per_user_limit||1))}"></label><label><span>${esc(copy("จำนวนใช้สูงสุด","Max uses"))}</span><input id="v848MaxUses" type="number" min="1" value="${edit?.max_uses??""}" placeholder="${esc(copy("ว่าง = ไม่จำกัด","blank = unlimited"))}"></label><label><span>${esc(copy("วันหมดอายุ","Expires"))}</span><input id="v848Expires" type="datetime-local" value="${esc(expires)}"></label></div><div class="v848-chest-builder"><strong>🎁 ${esc(copy("Chest Rewards","Chest Rewards"))}</strong><label>Daily <input id="v848DailyChest" type="number" min="0" max="10" value="${ch.daily||0}"></label><label>Weekly <input id="v848WeeklyChest" type="number" min="0" max="10" value="${ch.weekly||0}"></label><label>Mystery <input id="v848MysteryChest" type="number" min="0" max="10" value="${ch.mystery||0}"></label></div><div class="v848-item-builder"><div><strong>🎟 ${esc(copy("Items ใน Bundle","Bundle items"))}</strong><small>${esc(copy("เลือกได้ทั้งของในร้านและ Code Exclusive Items","Choose normal shop items or code-exclusive items"))}</small></div><div class="v848-item-grid">${itemCheckboxes(r.items)}</div></div><label class="v848-active-toggle"><input id="v848CodeActive" type="checkbox" ${edit?edit.active!==false?"checked":"":"checked"}><i></i><span>${esc(copy("เปิดใช้งาน Code ทันที","Code is active"))}</span></label><div class="v848-form-actions"><button id="v848SaveCode" class="primary-btn" type="submit">${edit?"💾 "+esc(copy("บันทึกการแก้ไข","Save changes")):"＋ "+esc(copy("สร้าง Reward Code","Create Reward Code"))}</button></div></form></section>`;
  }
  function codeListHtml(){
    if(!state.codes.length)return `<div class="v848-empty">🎟 ${esc(copy("ยังไม่มี Reward Code","No Reward Codes yet"))}</div>`;
    return `<div class="v848-code-list">${state.codes.map(code=>{const [status,label]=codeStatus(code),usage=code.max_uses==null?`${Number(code.total_uses||0)} / ∞`:`${Number(code.total_uses||0)} / ${Number(code.max_uses)}`;return `<article class="v848-code-row"><div class="v848-code-token"><span>🎟</span><div><strong>${esc(code.code)}</strong><small>${esc(code.title||"Reward Code")}</small></div></div><div>${rewardSummary(code.reward,{compact:true})}</div><div class="v848-code-meta"><span class="v848-status ${status}">${esc(label)}</span><small>${esc(copy("ใช้แล้ว","Uses"))}: ${esc(usage)}</small><small>${esc(copy("ต่อ User","Per user"))}: ${Number(code.per_user_limit||1)}</small><small>${esc(copy("หมดอายุ","Expires"))}: ${esc(code.expires_at?safeDate(code.expires_at):copy("ไม่กำหนด","Never"))}</small></div><div class="v848-code-actions"><button type="button" data-v848-copy-code="${esc(code.code)}" title="Copy">⧉</button><button type="button" data-v848-edit-code="${esc(code.id)}">✎</button><button type="button" data-v848-toggle-code="${esc(code.id)}" data-next="${code.active?"0":"1"}">${code.active?"⏸":"▶"}</button></div></article>`;}).join("")}</div>`;
  }
  function recentRedemptionsHtml(){
    if(!state.redemptions.length)return `<div class="v848-empty">🕘 ${esc(copy("ยังไม่มีการใช้ Code","No redemptions yet"))}</div>`;
    return `<div class="v848-redemption-list">${state.redemptions.map(row=>`<div class="v848-redemption-row"><span>✓</span><div><strong>${esc(row.code_snapshot||"CODE")} · ${esc(row.title_snapshot||"Reward")}</strong><small>${esc(row.user_email||row.user_id||"User")}</small></div><time>${esc(safeDate(row.redeemed_at))}</time></div>`).join("")}</div>`;
  }
  function economyToolsHtml(){
    const exclusive=catalog().filter(x=>x.codeExclusive);
    return `<section class="v848-admin-card"><div class="v848-card-head"><div><p class="eyebrow">OWNER ECONOMY TOOLS</p><h3>🪙 ${esc(copy("Owner Sandbox","Owner Sandbox"))}</h3><p>${esc(copy("Cheat แบบเป็นทางการสำหรับบัญชี Owner นี้เท่านั้น · รางวัลจะเข้า Coin Ledger และ Cloud Sync ตามปกติ","A formal owner cheat for this Owner account only · rewards enter the normal ledger and Cloud Sync"))}</p></div></div><div class="v848-economy-grid"><article><strong>🪙 ${esc(copy("เพิ่ม Coins ให้ตัวเอง","Grant Coins to myself"))}</strong><div><input id="v848OwnerCoins" type="number" min="1" max="1000000" value="9999"><button id="v848GrantCoins" class="primary-btn" type="button">+ Coins</button></div><div class="v848-quick-coins"><button type="button" data-v848-coins="100">+100</button><button type="button" data-v848-coins="1000">+1,000</button><button type="button" data-v848-coins="9999">+9,999</button></div></article><article><strong>🎟 ${esc(copy("แจก Code Exclusive Item ให้ตัวเอง","Grant a code-exclusive item"))}</strong><div><select id="v848OwnerItem">${exclusive.map(r=>`<option value="${esc(r.type)}:${esc(r.id)}">${esc(r.icon||"🎁")} ${esc(r.name)}</option>`).join("")}</select><button id="v848GrantItem" class="primary-btn" type="button">Grant</button></div></article><article><strong>🎁 ${esc(copy("เปิด Owner Chest","Open Owner Chest"))}</strong><div class="v848-owner-chests"><button type="button" data-v848-owner-chest="daily">🎁 Daily</button><button type="button" data-v848-owner-chest="weekly">🏆 Weekly</button><button type="button" data-v848-owner-chest="mystery">🎲 Mystery</button></div></article></div></section>`;
  }
  function renderDeveloper(){
    const root=$("v848DeveloperPage");if(!root)return;
    root.innerHTML=`<div class="v7-page-heading"><div class="v7-page-title"><span>🛠</span><div><p class="eyebrow">WORKDAY JOURNEY · V8.5.0</p><h2>Developer Control Center</h2><p class="muted">${esc(copy("จัดการ Reward Codes, ดูการ Redeem และใช้ Owner Economy Tools","Manage Reward Codes, review redemptions and use Owner Economy Tools"))}</p></div></div></div>`;
    if(state.owner===null||state.ownerChecking){root.insertAdjacentHTML("beforeend",`<section class="v848-access-card"><span class="v848-spinner">◌</span><h3>${esc(copy("กำลังตรวจสอบสิทธิ์ Owner...","Checking Owner access..."))}</h3></section>`);checkOwner({force:true}).then(ok=>{if(ok)refreshOwnerDashboard();else renderDeveloper();});return;}
    if(!state.owner){root.insertAdjacentHTML("beforeend",ownerGuardHtml());$("v848OwnerLogin")?.addEventListener("click",()=>cloud()?.openAccount?.({mode:"signin",returnAction:"developer-tools"}));return;}
    const stats=adminStats(),email=user()?.email||"Owner";
    root.insertAdjacentHTML("beforeend",`<section class="v848-owner-hero"><div><span>👑</span><div><small>OWNER ACCESS</small><strong>${esc(email)}</strong></div></div><p>${esc(copy("สิทธิ์นี้ตรวจจาก Supabase app_admins","Access verified by Supabase app_admins"))}</p></section><section class="v848-admin-kpis"><article><span>🎟</span><small>${esc(copy("Codes ทั้งหมด","Total codes"))}</small><strong>${stats.total}</strong></article><article><span>🟢</span><small>${esc(copy("กำลังใช้งาน","Active"))}</small><strong>${stats.active}</strong></article><article><span>🎁</span><small>${esc(copy("Redeem ทั้งหมด","Redemptions"))}</small><strong>${stats.uses}</strong></article><article><span>👥</span><small>${esc(copy("User ล่าสุด","Recent users"))}</small><strong>${stats.users}</strong></article></section>${codeFormHtml()}<section class="v848-admin-card"><div class="v848-card-head"><div><p class="eyebrow">REWARD CODES</p><h3>${esc(copy("Code ที่สร้างไว้","Created codes"))}</h3></div><button id="v848RefreshAdmin" class="outline-btn" type="button">↻ ${esc(copy("รีเฟรช","Refresh"))}</button></div>${codeListHtml()}</section><section class="v848-admin-card"><div class="v848-card-head"><div><p class="eyebrow">RECENT REDEEMS</p><h3>${esc(copy("ประวัติการใช้ Code ล่าสุด","Recent redemptions"))}</h3></div></div>${recentRedemptionsHtml()}</section>${economyToolsHtml()}`);
    bindDeveloper();
  }
  function formReward(){
    const items=qa("[data-v848-code-item]:checked",$("v848CodeForm")).map(el=>{const [type,id]=el.dataset.v848CodeItem.split(":");return{type,id};});
    const chests=[["daily","v848DailyChest"],["weekly","v848WeeklyChest"],["mystery","v848MysteryChest"]].map(([kind,id])=>({kind,count:Math.max(0,Math.min(10,Math.round(Number($(id)?.value)||0)))})).filter(x=>x.count>0);
    return {coins:Math.max(0,Math.round(Number($("v848CodeCoins")?.value)||0)),items,chests};
  }
  async function saveCode(){
    if(!state.owner)return;const c=client();if(!c)return;
    const code=normalizedCode($("v848CodeValue")?.value),title=String($("v848CodeTitle")?.value||"").trim();
    if(!/^[A-Z0-9_-]{3,32}$/.test(code)){toast("!",copy("Code ใช้ได้เฉพาะ A-Z, 0-9, _ และ - ความยาว 3–32 ตัว","Code must be 3–32 characters using A-Z, 0-9, _ or -"),"error");return;}
    if(!title){toast("!",copy("กรุณาใส่ชื่อ Campaign / Pack","Enter a Campaign / Pack name"),"error");return;}
    const perUser=Math.max(1,Math.min(50,Math.round(Number($("v848PerUser")?.value)||1))),maxRaw=String($("v848MaxUses")?.value||"").trim(),maxUses=maxRaw?Math.max(1,Math.round(Number(maxRaw)||1)):null,expiresRaw=$("v848Expires")?.value;
    const payload={code,title,reward:formReward(),active:!!$("v848CodeActive")?.checked,per_user_limit:perUser,max_uses:maxUses,expires_at:expiresRaw?new Date(expiresRaw).toISOString():null,updated_at:new Date().toISOString()};
    const btn=$("v848SaveCode");if(btn)btn.disabled=true;
    try{
      let res;if(state.editingId)res=await c.from("reward_codes").update(payload).eq("id",state.editingId);else res=await c.from("reward_codes").insert(payload);
      if(res.error)throw res.error;toast("✓",state.editingId?copy("อัปเดต Reward Code แล้ว","Reward Code updated"):copy("สร้าง Reward Code แล้ว","Reward Code created"),"success");state.editingId=null;await refreshOwnerDashboard(false);renderDeveloper();
    }catch(err){toast("!",`${copy("บันทึก Code ไม่สำเร็จ","Failed to save code")}: ${err?.message||err}`,"error");if(btn)btn.disabled=false;}
  }
  async function toggleCode(id,active){const c=client();if(!c||!state.owner)return;const {error}=await c.from("reward_codes").update({active,updated_at:new Date().toISOString()}).eq("id",id);if(error){toast("!",error.message,"error");return;}await refreshOwnerDashboard(false);renderDeveloper();}
  async function ownerGrant(payload,label){
    const c=client();if(!c||!state.owner)return;
    try{
      const {data,error}=await c.rpc("owner_grant_secure",{p_coins:Math.max(0,Math.round(Number(payload?.coins||0))),p_items:Array.isArray(payload?.items)?payload.items:[],p_label:label});
      if(error)throw error;window.WorkdayEconomySecurity?.applyEconomy?.(data);toast("✓",copy("บันทึกรางวัลผ่าน Server แล้ว","Reward granted by server"),"success");
    }catch(err){toast("!",`${copy("Grant ไม่สำเร็จ","Grant failed")}: ${err?.message||err}`,"error");}
  }

  function bindDeveloper(){
    $("v848CodeForm")?.addEventListener("submit",e=>{e.preventDefault();saveCode();});
    $("v848CancelEdit")?.addEventListener("click",()=>{state.editingId=null;renderDeveloper();});
    $("v848RefreshAdmin")?.addEventListener("click",()=>refreshOwnerDashboard());
    qa("[data-v848-copy-code]").forEach(btn=>btn.onclick=async()=>{try{await navigator.clipboard.writeText(btn.dataset.v848CopyCode);toast("⧉",copy("คัดลอก Code แล้ว","Code copied"),"success");}catch{}});
    qa("[data-v848-edit-code]").forEach(btn=>btn.onclick=()=>{state.editingId=btn.dataset.v848EditCode;renderDeveloper();setTimeout(()=>$("v848CodeValue")?.focus(),50);});
    qa("[data-v848-toggle-code]").forEach(btn=>btn.onclick=()=>toggleCode(btn.dataset.v848ToggleCode,btn.dataset.next==="1"));
    $("v848GrantCoins")?.addEventListener("click",()=>{const amount=Math.max(1,Math.round(Number($("v848OwnerCoins")?.value)||0));ownerGrant({coins:amount},`Owner Coins +${amount}`);});
    qa("[data-v848-coins]").forEach(btn=>btn.onclick=()=>{const amount=Number(btn.dataset.v848Coins)||0;$("v848OwnerCoins").value=amount;ownerGrant({coins:amount},`Owner Coins +${amount}`);});
    $("v848GrantItem")?.addEventListener("click",()=>{const raw=$("v848OwnerItem")?.value||"";const [type,id]=raw.split(":");if(type&&id)ownerGrant({items:[{type,id}]},"Owner Exclusive Item");});
    qa("[data-v848-owner-chest]").forEach(btn=>btn.onclick=()=>ownerGrant({chests:[{kind:btn.dataset.v848OwnerChest,count:1}]},`Owner ${btn.dataset.v848OwnerChest} Chest`));
  }

  function onAuthComplete(event){
    const action=event?.detail?.action||"";
    checkOwner({force:true}).then(ok=>{if(ok)refreshOwnerDashboard(false);});
    setTimeout(syncMyRedemptions,120);
    if(action==="redeem-code")setTimeout(openRedeem,180);
    if(action==="developer-tools")setTimeout(()=>{location.hash="#/developer";renderDeveloper();},180);
  }
  async function bootstrap(){
    ensureUi();enhanceRewards();
    await checkOwner({force:true});
    if(state.owner)await refreshOwnerDashboard(false);
    if(signedIn())await syncMyRedemptions();
    if(location.hash.includes("/developer"))renderDeveloper();
  }

  window.WorkdayV848={version:VERSION,openRedeem,enhanceRewards,renderDeveloper,checkOwner,refreshOwner:()=>checkOwner({force:true}),syncMyRedemptions};
  window.addEventListener("workday:v8-auth-complete",onAuthComplete);
  window.addEventListener("workday:v8-auth-state",event=>{
    if(event?.detail?.signedIn){
      state.owner=null;
      setTimeout(()=>{checkOwner({force:true}).then(ok=>{if(ok)refreshOwnerDashboard(false);if(location.hash.includes("/developer"))renderDeveloper();});syncMyRedemptions();},100);
      return;
    }
    state.owner=null;state.codes=[];state.redemptions=[];state.editingId=null;setOwnerUi(false);
    if(location.hash.includes("/developer"))renderDeveloper();
  });
  window.addEventListener("workday:v8-cloud-ready",()=>setTimeout(()=>{checkOwner({force:true}).then(ok=>{if(ok)refreshOwnerDashboard(false);});syncMyRedemptions();},120));
  window.addEventListener("hashchange",()=>setTimeout(()=>{if(location.hash.includes("/rewards"))enhanceRewards();if(location.hash.includes("/developer"))renderDeveloper();},30));
  document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;if(!$("v848RedeemBackdrop")?.hidden)closeRedeem();if(!$("v848RewardBackdrop")?.hidden)$("v848RewardClose")?.click();});
  setTimeout(bootstrap,900);
})();
;

/* ===== SOURCE: v850.js ===== */
(() => {
  "use strict";

  const VERSION = "8.7.6";
  const $ = id => document.getElementById(id);
  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => [...root.querySelectorAll(sel)];
  const lang = () => localStorage.getItem("wp-language") === "en" ? "en" : "th";

  const ROUTE_GROUPS = [
    { id: "work", label: "WORK", routes: ["dashboard", "journal", "projects", "focus", "skills", "calendar", "reports"] },
    { id: "journey", label: "JOURNEY", routes: ["achievements", "missions"] },
    { id: "economy", label: "ECONOMY", routes: ["rewards", "bank", "exchange"] },
    { id: "system", label: "SYSTEM", routes: ["developer", "settings"] }
  ];

  const ROUTE_LABELS = {
    th: {
      dashboard: "แดชบอร์ด", journal: "บันทึก", projects: "โปรเจกต์", focus: "โฟกัส", skills: "ทักษะ", calendar: "ปฏิทิน",
      reports: "รายงาน", achievements: "ความสำเร็จ", missions: "ภารกิจ", rewards: "รางวัล",
      bank: "Work Bank", exchange: "Exchange", developer: "Developer", settings: "ตั้งค่า", more: "เพิ่มเติม"
    },
    en: {
      dashboard: "Home", journal: "Journal", projects: "Projects", focus: "Focus", skills: "Skills", calendar: "Calendar",
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
    focus: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.4v5.1l3.4 2.1M9.3 2.7h5.4"/></svg>',
    skills: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21V9M12 13 6.5 8M12 11l5.5-5M6.5 8V4M17.5 6V3"/><path d="M5 20c2-3 12-3 14 0"/></svg>',
    workspace: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3.5 10.5 8.5-7 8.5 7"/><path d="M5.6 9.3V20h12.8V9.3M9.5 20v-6.3h5V20"/></svg>',
    rewards: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16v10H4Z"/><path d="M3.2 7.2h17.6V10H3.2ZM12 7.2V20"/><path d="M12 7.2H8.1a2.1 2.1 0 1 1 2.1-2.1c0 1.2 1.8 2.1 1.8 2.1ZM12 7.2h3.9a2.1 2.1 0 1 0-2.1-2.1c0 1.2-1.8 2.1-1.8 2.1Z"/></svg>',
    bank: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3.5 9 8.5-5 8.5 5"/><path d="M5.2 9h13.6M6.7 9v7.6M10.2 9v7.6M13.8 9v7.6M17.3 9v7.6M4.2 16.6h15.6M3.5 20h17"/></svg>',
    exchange: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18.5 9 13l3.2 2.8 6.8-8"/><path d="M15.2 7.8H19V11.6"/><path d="M4 5v13.5h16"/></svg>',
    developer: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.7 5.1 4.2 4.2M12.8 7l4.2 4.2M4.1 19.9l4.4-1 9.8-9.8a2 2 0 0 0-2.8-2.8l-9.8 9.8Z"/><path d="m13.4 4.6 2-2 6 6-2 2"/></svg>',
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M19.3 13.2a7.8 7.8 0 0 0 0-2.4l2-1.5-2-3.5-2.5 1a8 8 0 0 0-2.1-1.2L14.4 3h-4.1L10 5.6a8 8 0 0 0-2.1 1.2l-2.5-1-2 3.5 2 1.5a7.8 7.8 0 0 0 0 2.4l-2 1.5 2 3.5 2.5-1a8 8 0 0 0 2.1 1.2l.3 2.6h4.1l.3-2.6a8 8 0 0 0 2.1-1.2l2.5 1 2-3.5Z"/></svg>',
    more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>'
  };

  const CLASSIC_ICONS = {
    dashboard:"🏠", journal:"📓", projects:"📁", calendar:"📅", reports:"📊",
    achievements:"🏆", missions:"🎯", rewards:"🎁", skills:"🌳", workspace:"🏡", bank:"🏦", exchange:"📈",
    developer:"🛠️", settings:"⚙️", more:"☰"
  };
  const iconStyle = () => document.documentElement.dataset.wdjIconStyle === "classic" ? "classic" : "modern";
  const iconKey = route => `${route}:${iconStyle()}`;

  function activeRoute() {
    const route = location.hash.replace(/^#\/?/, "").split(/[?&]/)[0].toLowerCase();
    return Object.prototype.hasOwnProperty.call(ICONS, route) ? route : "dashboard";
  }

  function label(route) {
    return ROUTE_LABELS[lang()]?.[route] || ROUTE_LABELS.en[route] || route;
  }

  function icon(route) {
    return iconStyle() === "classic" ? `<span class="v8602-classic-icon" aria-hidden="true">${CLASSIC_ICONS[route] || "🏠"}</span>` : (ICONS[route] || ICONS.dashboard);
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
      if (iconHost && iconHost.dataset.v850Icon !== iconKey(route)) {
        iconHost.dataset.v850Icon = iconKey(route);
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
      iconHost.dataset.v850Icon = iconKey(route);
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
    if (titleIcon && titleIcon.dataset.v850Icon !== iconKey(route)) {
      titleIcon.dataset.v850Icon = iconKey(route);
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
      const iconHost = btn.firstElementChild;
      if (iconHost && iconHost.dataset.v850Icon !== iconKey(key)) {
        iconHost.dataset.v850Icon = iconKey(key);
        iconHost.innerHTML = icon(key);
      }
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
;

/* ===== SOURCE: v8501.js ===== */
/* Workday Journey V8.6.0 - Cloud economy bridge (server-authoritative).
   No client-provided legacy balances or inventory may be imported to Cloud. */
(() => {
  "use strict";
  const VERSION = "8.6.0.3";
  const LEDGER = "wp-v81-coin-ledger";
  const OWNED = "wp-v81-owned-rewards";
  // Deliberately NOT wp-prefixed: these are device-only guest backups and
  // cannot be included in generic wp-* Cloud Sync snapshots.
  const GUEST_BACKUP = "wdj-v860-local-guest-economy";
  const CLOUD_OWNER = "wdj-v860-current-cloud-economy-user";
  const DEFAULT_ITEMS = ["mascot:chick", "theme:default", "effect:none", "accessory:none", "frame:none"];
  const read = (k, fallback) => {
    try { const value = JSON.parse(localStorage.getItem(k)); return value ?? fallback; }
    catch { return fallback; }
  };
  const write = (k, value) => localStorage.setItem(k, JSON.stringify(value));
  const cloud = () => window.WorkdayV8Cloud || null;
  const userId = () => cloud()?.getUser?.()?.id || "";

  function announceChange() {
    try { window.dispatchEvent(new CustomEvent("workday:v7-data-changed")); } catch (_) {}
    setTimeout(() => { try { window.WorkdayRewards?.renderShop?.(); } catch (_) {} }, 20);
  }

  function rememberGuestBeforeSignIn() {
    if (localStorage.getItem(CLOUD_OWNER)) return;
    const ledger = read(LEDGER, []), owned = read(OWNED, []);
    write(GUEST_BACKUP, {
      ledger: Array.isArray(ledger) ? ledger : [],
      owned: Array.isArray(owned) ? owned : DEFAULT_ITEMS
    });
  }

  function restoreGuestAfterSignOut() {
    if (!localStorage.getItem(CLOUD_OWNER)) return;
    const guest = read(GUEST_BACKUP, null);
    write(LEDGER, Array.isArray(guest?.ledger) ? guest.ledger : []);
    write(OWNED, Array.isArray(guest?.owned) ? guest.owned : DEFAULT_ITEMS);
    localStorage.removeItem(CLOUD_OWNER);
    announceChange();
  }

  // Kept as a compatibility method: v81.js calls sec.applyEconomy() after a
  // server-approved purchase. It changes the visual cache, NOT the server.
  let economyRevision = 0, fetchPromise = null, fetchedAt = 0, fetchedUser = '', latest = null;
  function applyEconomy(e) {
    if (!e || !userId()) return;
    economyRevision++;
    const oldLedger = read(LEDGER, []);
    const oldEntry = oldLedger.find(entry => entry?.id === "secure:v8501:server-balance");
    const list = oldLedger.filter(entry => entry?.id !== "secure:v8501:server-balance");
    const localSum = list.reduce((sum, entry) => sum + (Number(entry?.amount) || 0), 0);
    const serverBalance = Math.max(0, Math.round(Number(e.balance) || 0));
    const delta = serverBalance - localSum;
    if (delta !== 0) list.push({
      id: "secure:v8501:server-balance", amount: delta,
      type: "server_balance", labelTh: "Supabase verified balance",
      labelEn: "Supabase verified balance",
      createdAt:oldEntry?.amount===delta ? oldEntry.createdAt : new Date().toISOString(),
      meta:oldEntry?.amount===delta ? oldEntry.meta : { securityVersion: VERSION }
    });
    const items = (Array.isArray(e.items) ? e.items : [])
      .filter(item => typeof item?.type === "string" && typeof item?.id === "string")
      .map(item => `${item.type}:${item.id}`);
    const nextOwned = [...new Set([...DEFAULT_ITEMS, ...items])];
    const oldOwned = read(OWNED, []);
    let changed = false;
    if (JSON.stringify(oldLedger) !== JSON.stringify(list)) { write(LEDGER, list); changed=true; }
    if (JSON.stringify(oldOwned) !== JSON.stringify(nextOwned)) { write(OWNED, nextOwned); changed=true; }
    localStorage.setItem(CLOUD_OWNER, userId());
    latest = e; fetchedAt = Date.now(); fetchedUser = userId();
    if (changed) announceChange();
  }

  async function refresh({force=true}={}) {
    const client = cloud()?.getClient?.(), expectedUserId = userId();
    if (!client || !expectedUserId) return null;
    if (!force && fetchedUser===expectedUserId && latest && Date.now()-fetchedAt<20000) return latest;
    if (fetchPromise?.uid === expectedUserId) return fetchPromise.promise;
    const rev = economyRevision;
    const request = (async () => {
      const {data,error} = await client.rpc("get_my_economy");
      if (error) throw error;
      if (userId() !== expectedUserId) return null;
      // Bank/Shop/Code may have confirmed a newer balance while we fetched.
      if (economyRevision === rev) applyEconomy(data);
      return data;
    })();
    fetchPromise = { uid:expectedUserId, promise:request };
    try { return await request; }
    finally { if(fetchPromise?.promise===request) fetchPromise=null; }
  }

  // Backwards-compatible name for callers from V8.5.x. This no longer imports.
  const ensureImported = () => refresh({force:false});

  window.WorkdayEconomySecurity = {
    version: VERSION, ensureImported, refresh, applyEconomy,
    isSecure: () => !!userId()
  };

  window.addEventListener("workday:v8-auth-state", event => {
    if (event.detail?.signedIn) {
      rememberGuestBeforeSignIn();
      setTimeout(() => refresh({force:false}).catch(() => {}), 250);
    } else if (event.detail?.event === "SIGNED_OUT") {
      latest=null; fetchedAt=0; fetchedUser=''; economyRevision++;
      restoreGuestAfterSignOut();
    }
  });
  window.addEventListener("online", () => setTimeout(() => refresh({force:false}).catch(() => {}), 400));
  setTimeout(() => refresh({force:false}).catch(() => {}), 900);
})();
;

/* ===== SOURCE: v851.js ===== */
(() => {
  "use strict";

  const VERSION = "8.7.6";
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
;

/* ===== SOURCE: v852.js ===== */
(() => {
  "use strict";

  const VERSION = "8.7.6";
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
;

/* ===== SOURCE: v853.js ===== */
(() => {
  "use strict";

  const VERSION = "8.7.6";
  const $ = id => document.getElementById(id);
  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const isThai = () => localStorage.getItem("wp-language") !== "en";

  function addClass(selector, className, root = document) {
    const el = q(selector, root);
    if (el) el.classList.add(className);
    return el;
  }

  function ensureSectionHeading(root, id, beforeEl, eyebrow, title, help = "") {
    if (!root || !beforeEl) return null;
    let heading = $(id);
    if (!heading || !root.contains(heading)) {
      heading = document.createElement("div");
      heading.id = id;
      heading.className = "v853-section-heading";
      root.insertBefore(heading, beforeEl);
    }
    heading.innerHTML = `<div><p class="eyebrow">${eyebrow}</p><h3>${title}</h3>${help ? `<p>${help}</p>` : ""}</div><span class="v853-section-line" aria-hidden="true"></span>`;
    return heading;
  }

  function decorateAchievements() {
    const root = $("v7AchievementsPage");
    if (!root) return;
    root.classList.add("v853-gamification-page", "v853-achievements-page");

    addClass(".v7-achievement-summary", "v853-achievement-hero", root);
    addClass(".v847-ach-mode", "v853-achievement-mode", root);
    addClass(".v847-ach-view", "v853-achievement-view", root);
    qa(".v7-tier-section", root).forEach(section => section.classList.add("v853-tier-section"));
    qa(".v7-achievement-card", root).forEach(card => card.classList.add("v853-achievement-card"));
    qa(".v846-ach-filters", root).forEach(filter => filter.classList.add("v853-achievement-filters"));

    const summary = q(".v7-achievement-summary", root);
    if (summary && !q(".v853-achievement-orbit", summary)) {
      const orbit = document.createElement("span");
      orbit.className = "v853-achievement-orbit";
      orbit.setAttribute("aria-hidden", "true");
      orbit.innerHTML = "✦";
      summary.appendChild(orbit);
    }
  }

  function decorateMissions() {
    const root = $("v82MissionsPage");
    if (!root) return;
    root.classList.add("v853-gamification-page", "v853-missions-page");

    const hero = addClass(".v82-mission-hero", "v853-mission-hero", root);
    const list = addClass(".v82-mission-list", "v853-mission-list", root);
    const chests = addClass(".v82-chest-grid", "v853-chest-grid", root);
    addClass(".v82-trial-banner", "v853-trial-banner", root);

    if (list) {
      ensureSectionHeading(
        root,
        "v853MissionHeading",
        list,
        "TODAY'S QUESTS",
        isThai() ? "ภารกิจของวันนี้" : "Today's missions",
        isThai() ? "ทำทีละภารกิจ เก็บ Coin แล้วปลดล็อก Daily Chest" : "Complete each quest, collect Coins and unlock your Daily Chest."
      );
      qa(".v82-mission-card", list).forEach((card, index) => {
        card.classList.add("v853-mission-card");
        card.style.setProperty("--mission-index", String(index + 1));
      });
    }

    if (chests) {
      ensureSectionHeading(
        root,
        "v853ChestHeading",
        chests,
        "CHEST REWARDS",
        isThai() ? "รางวัลปลายทาง" : "Milestone rewards",
        isThai() ? "Daily Chest คือเป้าหมายประจำวัน ส่วน Weekly Chest คือโบนัสสำหรับความสม่ำเสมอ" : "Daily Chest rewards today's progress; Weekly Chest rewards consistency."
      );
      qa(".v82-chest-card", chests).forEach(card => card.classList.add("v853-chest-card"));
    }

    if (hero && !q(".v853-mission-spark", hero)) {
      const spark = document.createElement("span");
      spark.className = "v853-mission-spark";
      spark.setAttribute("aria-hidden", "true");
      spark.textContent = "✦";
      hero.appendChild(spark);
    }
  }

  function insertAfter(reference, node) {
    if (!reference || !node || reference === node) return;
    if (reference.nextElementSibling === node) return;
    reference.insertAdjacentElement("afterend", node);
  }

  function ensureShopJump(root, afterEl) {
    if (!root || !afterEl) return null;
    let bar = $("v853ShopJump");
    if (!bar || !root.contains(bar)) {
      bar = document.createElement("nav");
      bar.id = "v853ShopJump";
      bar.className = "v853-shop-jump";
      bar.setAttribute("aria-label", "Reward Shop shortcuts");
      bar.innerHTML = `
        <button type="button" data-v853-jump=".v844-daily-shop"><span>⚡</span>${isThai() ? "ดีลวันนี้" : "Daily Deals"}</button>
        <button type="button" data-v853-jump=".v832-weekly-shop"><span>🏷️</span>${isThai() ? "ดีลสัปดาห์" : "Weekly Deals"}</button>
        <button type="button" data-v853-jump=".v831-collection"><span>🏆</span>${isThai() ? "คอลเลกชัน" : "Collection"}</button>
        <button type="button" data-v853-jump=".v81-shop-tabs"><span>🎁</span>${isThai() ? "เลือกรางวัล" : "Browse"}</button>`;
      bar.addEventListener("click", event => {
        const button = event.target.closest?.("[data-v853-jump]");
        if (!button) return;
        const target = q(button.dataset.v853Jump, root);
        target?.scrollIntoView?.({ behavior: "smooth", block: "start" });
      });
    }
    insertAfter(afterEl, bar);
    return bar;
  }

  function reorderShop(root) {
    const heading = q(".v7-page-heading", root);
    const wallet = q(".v81-wallet-hero", root);
    const redeem = $("v848RedeemCard");
    const daily = q(".v844-daily-shop", root);
    const weekly = q(".v832-weekly-shop", root);
    const collection = q(".v831-collection", root);
    const tabs = q(".v81-shop-tabs", root);
    const grid = q(".v81-shop-grid", root);
    const finale = q(".v831-finale", root);
    const earn = q(".v81-earn-card", root);

    if (wallet && heading) insertAfter(heading, wallet);
    if (redeem && wallet && root.contains(redeem)) insertAfter(wallet, redeem);
    const jump = ensureShopJump(root, redeem && root.contains(redeem) ? redeem : wallet);
    let cursor = jump || redeem || wallet || heading;
    [daily, weekly, collection].forEach(node => {
      if (node && cursor) {
        insertAfter(cursor, node);
        cursor = node;
      }
    });

    if (tabs) {
      const catalogHeading = ensureSectionHeading(
        root,
        "v853CatalogHeading",
        tabs,
        "REWARD CATALOG",
        isThai() ? "เลือกรางวัลของคุณ" : "Choose your rewards",
        isThai() ? "ซื้อ ปลดล็อก และ Equip ของสะสมด้วย Work Coins" : "Spend Work Coins to unlock and equip collectibles."
      );
      if (cursor && catalogHeading) insertAfter(cursor, catalogHeading);
      if (catalogHeading) insertAfter(catalogHeading, tabs);
      if (grid) insertAfter(tabs, grid);
      cursor = grid || tabs;
    }
    [finale, earn].forEach(node => {
      if (node && cursor) {
        insertAfter(cursor, node);
        cursor = node;
      }
    });
  }

  function decorateShop() {
    const root = $("v81RewardsPage");
    if (!root) return;
    root.classList.add("v853-gamification-page", "v853-rewards-page");

    addClass(".v81-wallet-hero", "v853-wallet-hero", root);
    addClass(".v831-collection", "v853-collection", root);
    addClass(".v844-daily-shop", "v853-deal-section", root);
    addClass(".v832-weekly-shop", "v853-deal-section", root);
    addClass(".v831-finale", "v853-finale", root);
    addClass(".v81-earn-card", "v853-earn-card", root);
    addClass(".v81-shop-tabs", "v853-shop-tabs", root);
    addClass(".v81-shop-grid", "v853-shop-grid", root);

    const redeem = $("v848RedeemCard");
    if (redeem && root.contains(redeem)) {
      redeem.classList.add("v853-redeem-card");
      const eyebrow = q(".eyebrow", redeem);
      if (eyebrow) eyebrow.textContent = `REWARD CODES · V${VERSION}`;
    }

    qa(".v831-mini-reward", root).forEach(card => card.classList.add("v853-deal-card"));
    qa(".v81-reward-card", root).forEach(card => card.classList.add("v853-reward-card"));
    reorderShop(root);
  }

  function decorateRewardModals() {
    addClass("#v848RedeemBackdrop .v848-modal", "v853-redeem-modal");
    addClass("#v848RewardBackdrop .v848-modal", "v853-reward-success-modal");
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

    document.documentElement.dataset.gamificationRefresh = "v853";
    document.body?.setAttribute("data-app-version", VERSION);
  }

  function refresh() {
    document.body?.classList.add("v853-gamification-refresh");
    decorateAchievements();
    decorateMissions();
    decorateShop();
    decorateRewardModals();
    refreshVersionLabels();
  }

  let timer = 0;
  function schedule(delay = 70) {
    clearTimeout(timer);
    timer = setTimeout(refresh, delay);
  }

  window.addEventListener("hashchange", () => schedule(110));
  window.addEventListener("workday:v7-data-changed", () => schedule(130));
  window.addEventListener("workday:v8-data-changed", () => schedule(130));
  window.addEventListener("workday:v8-auth-state", () => schedule(150));
  window.addEventListener("workday:v8-auth-complete", () => schedule(170));
  document.addEventListener("click", event => {
    if (event.target.closest?.(".lang-btn,[data-v802-lang],[data-v847-ach-view],[data-v847-journey-category],[data-v847-feature-category],[data-v81-tab],[data-v82-claim],[data-v82-chest],[data-v81-buy],[data-v81-equip],[data-v844-daily-buy],[data-v832-weekly-buy],#v848OpenRedeem")) schedule(180);
  }, true);

  const observer = new MutationObserver(records => {
    const relevant = records.some(record => [...record.addedNodes].some(node => {
      if (node?.nodeType !== 1) return false;
      return node.matches?.("#v7AchievementsPage,#v82MissionsPage,#v81RewardsPage,#v848RedeemCard,#v848RedeemBackdrop,#v848RewardBackdrop,.v82-mission-list,.v82-mission-card,.v81-wallet-hero,.v81-reward-card,.v7-achievement-summary") ||
        node.querySelector?.("#v7AchievementsPage,#v82MissionsPage,#v81RewardsPage,#v848RedeemCard,#v848RedeemBackdrop,#v848RewardBackdrop,.v82-mission-list,.v82-mission-card,.v81-wallet-hero,.v81-reward-card,.v7-achievement-summary");
    }));
    if (relevant) schedule(90);
  });
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });

  window.WorkdayV853 = { version: VERSION, refresh };
  refresh();
  setTimeout(refresh, 220);
})();
;

/* ===== SOURCE: v854.js ===== */
/* Workday Journey V8.5.4 — Finance Hub Refresh
 * Presentation layer only: moves existing DOM nodes without cloning them.
 * All existing Bank, Exchange, Academy and transaction handlers remain attached.
 */
(() => {
  "use strict";

  const VERSION = "8.7.6";
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
;

/* ===== SOURCE: v855.js ===== */
/* Workday Journey V8.5.5 — Final Polish & Responsive QA
 * Accessibility/visual helpers only: no changes to Coin, Bank, Exchange, or Cloud logic.
 */
(() => {
  "use strict";
  const VERSION = "8.7.6";
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
;

/* ===== SOURCE: v8601.js ===== */
/* V8.6.0.1 - Work Bank server bridge. Guest stays device-local. */
(() => {
  'use strict';
  const BANK_LEDGER = 'wp-v83-bank-ledger';
  const BANK_STATE = 'wp-v83-bank-state';
  const GUEST_COPY = 'wdj-v8601-guest-bank-backup';
  const OWNER_KEY = 'wdj-v8601-cloud-bank-owner';
  const CACHE_TTL = 60000;
  const localRead = (key, fallback) => {
    try { const x = JSON.parse(localStorage.getItem(key)); return x ?? fallback; }
    catch { return fallback; }
  };
  const localWrite = (key, data) => localStorage.setItem(key, JSON.stringify(data));
  const getCloud = () => window.WorkdayV8Cloud;
  const currentUser = () => getCloud()?.getUser?.()?.id || '';
  const client = () => getCloud()?.getClient?.();
  const currentDate = () => new Intl.DateTimeFormat('en-CA', {
    year:'numeric', month:'2-digit', day:'2-digit', timeZone:'Asia/Bangkok'
  }).format(new Date());
  const isBankRoute = () => location.hash.includes('/bank');
  let cache = null, inFlight = null, inFlightRev = -1, busy = false, lastError = '', revision = 0;

  function cacheForUser() {
    const id = currentUser();
    return id && cache?.userId === id ? cache : null;
  }
  function bankLoading() { return !!currentUser() && !cacheForUser() && !!inFlight; }
  function bankError() { return lastError; }
  function publicSnapshot() { return cacheForUser()?.data || null; }

  function rememberGuest(userId) {
    const before = localStorage.getItem(OWNER_KEY);
    if (before === userId) return;
    if (!before) {
      localWrite(GUEST_COPY, {
        ledger: localRead(BANK_LEDGER, []),
        state: localRead(BANK_STATE, {})
      });
    }
    localStorage.setItem(OWNER_KEY, userId);
    cache = null; lastError = ''; revision++;
  }
  function restoreGuest() {
    if (!localStorage.getItem(OWNER_KEY)) return;
    const guest = localRead(GUEST_COPY, { ledger:[], state:{} });
    localWrite(BANK_LEDGER, Array.isArray(guest.ledger) ? guest.ledger : []);
    localWrite(BANK_STATE, guest.state && typeof guest.state === 'object' ? guest.state : {});
    localStorage.removeItem(OWNER_KEY);
    cache = null; lastError = ''; revision++;
    try { window.dispatchEvent(new CustomEvent('workday:v7-data-changed')); } catch (_) {}
    if (isBankRoute()) window.WorkdayRewards?.renderBank?.();
  }

  function applySnapshot(raw, expectedUserId, sourceRevision) {
    if (!raw || currentUser() !== expectedUserId || revision !== sourceRevision) return false;
    const list = Array.isArray(raw.transactions) ? raw.transactions.map(tx => ({
      id: String(tx.id || ''),
      amount: Number(tx.amount) || 0,
      type: String(tx.type || ''),
      labelTh: tx.type === 'deposit' ? 'Deposit to Work Bank' : tx.type === 'withdraw' ? 'Withdraw from Work Bank' : 'Daily Savings interest',
      labelEn: tx.type === 'deposit' ? 'Work Bank deposit' : tx.type === 'withdraw' ? 'Work Bank withdrawal' : 'Daily Savings interest',
      createdAt: tx.createdAt,
      meta: tx.meta || {}
    })) : [];
    const state = raw.state && typeof raw.state === 'object' ? raw.state : {};
    const data = {
      savings: Math.max(0, Number(raw.savings) || 0),
      interestEarned: Math.max(0, Number(raw.interestEarned) || 0),
      transactions: list, state
    };
    rememberGuest(expectedUserId);
    cache = { userId:expectedUserId, data, at:Date.now(), day:currentDate() };
    lastError = '';
    localWrite(BANK_LEDGER, list);
    localWrite(BANK_STATE, state);
    try { window.dispatchEvent(new CustomEvent('workday:v8601-bank-state', {detail:{userId:expectedUserId}})); } catch (_) {}
    if (isBankRoute()) window.WorkdayRewards?.renderBank?.();
    return true;
  }

  async function refresh({force=false}={}) {
    const userId = currentUser();
    if (!userId || !client()) return null;
    rememberGuest(userId);
    const existing = cacheForUser();
    if (!force && existing && existing.day === currentDate() && Date.now()-existing.at < CACHE_TTL) return existing.data;
    if (inFlight && inFlightRev === revision) return inFlight;
    if (!navigator.onLine) {
      lastError = 'OFFLINE';
      if (isBankRoute()) window.WorkdayRewards?.renderBank?.();
      return null;
    }
    const atRevision = revision;
    const request = (async () => {
      try {
        const {data,error} = await client().rpc('get_my_bank');
        if (error) throw error;
        applySnapshot(data,userId,atRevision);
        return cacheForUser()?.data || null;
      } catch (error) {
        if (currentUser() === userId && revision === atRevision) lastError = String(error?.message || error || 'BANK_UNAVAILABLE');
        if (isBankRoute()) window.WorkdayRewards?.renderBank?.();
        throw error;
      } finally { if (inFlight === request) inFlight = null; }
    })();
    inFlight = request;
    inFlightRev = revision;
    return request;
  }

  async function move(direction,amount) {
    const id = currentUser();
    if (!id || !client()) throw new Error('LOGIN_REQUIRED');
    if (!navigator.onLine) throw new Error('OFFLINE');
    if (busy) throw new Error('BANK_TRANSACTION_IN_PROGRESS');
    if (!Number.isSafeInteger(amount) || amount < 1 || amount > 1000000000) throw new Error('INVALID_BANK_AMOUNT');
    let requestId = window.crypto?.randomUUID?.();
    if (!requestId && window.crypto?.getRandomValues) {
      const bytes = window.crypto.getRandomValues(new Uint8Array(16));
      bytes[6]=(bytes[6]&15)|64; bytes[8]=(bytes[8]&63)|128;
      const hex=Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('');
      requestId=[hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');
    }
    if (!requestId) throw new Error('SECURE_REQUEST_ID_UNAVAILABLE');
    busy = true;
    ++revision; // an older get_my_bank response must not overwrite this transfer
    inFlight = null;
    const atRevision = revision;
    try {
      const {data,error} = await client().rpc('bank_move_secure',{
        p_direction:direction, p_amount:amount, p_request_id:requestId
      });
      if (error) throw error;
      if (currentUser() !== id) return null;
      window.WorkdayEconomySecurity?.applyEconomy?.(data?.economy);
      applySnapshot(data?.bank,id,atRevision);
      return data;
    } catch (error) {
      // A network failure can happen AFTER a successful DB commit. Always read
      // the server balance instead of trying to roll back / replay locally.
      if (currentUser() === id) {
        cache = null; lastError = String(error?.message || error);
        try { await refresh({force:true}); } catch (_) {}
      }
      throw error;
    } finally { busy = false; }
  }

  window.WorkdayBankSecurity = {
    version:'8.6.0.1', isSecure:() => !!currentUser(), getCached:publicSnapshot,
    isLoading:bankLoading, isBusy:() => busy, getError:bankError,
    refresh, ensureFresh:() => refresh().catch(() => null), move,
    hasLocalOnlySavings:() => {
      const guest=localRead(GUEST_COPY,null);
      const rows=Array.isArray(guest?.ledger) ? guest.ledger : [];
      return rows.reduce((sum,x)=>sum+(Number(x?.amount)||0),0)>0.001;
    }
  };

  window.addEventListener('workday:v8-auth-state', event => {
    const id = currentUser();
    if (event.detail?.signedIn && id) {
      rememberGuest(id);
      refresh().catch(() => {});
    } else if (event.detail?.event === 'SIGNED_OUT') restoreGuest();
  });
  window.addEventListener('hashchange', () => {
    if (isBankRoute() && currentUser()) refresh().catch(() => {});
  });
  window.addEventListener('online', () => {
    if (isBankRoute() && currentUser()) refresh({force:true}).catch(() => {});
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && isBankRoute() && currentUser()) refresh().catch(() => {});
  });
  setTimeout(() => { if (currentUser()) refresh().catch(() => {}); }, 400);
})();
;

/* ===== SOURCE: v8602.js ===== */
/* Workday Journey V8.6.0.2 - UI Startup & Personalization.
   Presentation preferences only; no economy, auth or transaction logic. */
(() => {
  "use strict";
  const VERSION = "8.7.6";
  const KEYS = { size:"wp-v8602-ui-size", icons:"wp-v8602-icon-style", density:"wp-density" };
  const VALUES = { size:["small","default","large"], icons:["modern","classic"], density:["compact","comfortable","spacious"] };
  const $ = id => document.getElementById(id);
  const root = document.documentElement;
  const thai = () => { try { return localStorage.getItem("wp-language") !== "en"; } catch (_) { return true; } };
  const i18n = (th,en) => thai() ? th : en;
  function read(type) {
    const fallback = {size:"default",icons:"modern",density:"comfortable"}[type];
    let value = fallback;
    try { value = localStorage.getItem(KEYS[type]) || fallback; } catch (_) {}
    return VALUES[type].includes(value) ? value : fallback;
  }
  function save(type,value) {
    if (!VALUES[type]?.includes(value)) return;
    try { localStorage.setItem(KEYS[type],value); } catch (_) {}
    apply();
    if (type === "icons") window.WorkdayV850?.refresh?.();
  }
  function apply() {
    root.dataset.wdjUiSize = read("size");
    root.dataset.wdjIconStyle = read("icons");
    root.dataset.wdjDensity = read("density");
    // Existing layout density and new tokens can work together.
    document.body?.classList.toggle("compact",read("density") === "compact");
    for (const type of Object.keys(KEYS)) {
      document.querySelectorAll(`[data-wdj-setting="${type}"]`).forEach(el => {
        if (el.value !== read(type)) el.value = read(type);
      });
    }
    updatePreview();
  }
  function options(type) {
    const labels = {
      size: { small:["เล็ก (Small)","Small"], default:["มาตรฐาน (Default)","Default"], large:["ใหญ่ (Large)","Large"] },
      icons: {modern:["Modern · ไอคอนเส้น","Modern · Line icons"], classic:["Classic · ไอคอนอีโมจิ","Classic · Emoji icons"]},
      density: {compact:["Compact · กระชับ","Compact"], comfortable:["Comfortable · สบายตา","Comfortable"], spacious:["Spacious · โปร่งสบาย","Spacious"]}
    };
    return VALUES[type].map(v => `<option value="${v}">${i18n(...labels[type][v])}</option>`).join("");
  }
  function card(kind) {
    const extra = kind === "page" ? "card v7-settings-card" : "setting-group";
    return `<section class="wdj-appearance ${extra}" data-wdj-appearance="${kind}">
      <div class="wdj-appearance-head"><div><p class="eyebrow">APPEARANCE</p><h3>${i18n("🎨 ปรับขนาดและไอคอน","🎨 Size & Icon Settings")}</h3>
      <p class="setting-help">${i18n("เลือกสไตล์ที่อ่านง่ายและเหมาะกับหน้าจอของคุณ","Make the interface fit your screen and preferences")}</p></div></div>
      <div class="wdj-appearance-fields">
        <label><span>${i18n("ขนาดกรอบและปุ่ม (UI Size)","UI Size · Cards & Controls")}</span>
          <select data-wdj-setting="size">${options("size")}</select></label>
        <label><span>${i18n("รูปแบบไอคอน (Icon Style)","Icon Style")}</span>
          <select data-wdj-setting="icons">${options("icons")}</select></label>
      </div>
      <div class="wdj-appearance-preview" aria-live="polite"><span class="wdj-preview-icon" aria-hidden="true"></span><div><strong>${i18n("ตัวอย่างการแสดงผล","Live preview")}</strong><small>${i18n("UI Size เปลี่ยนกรอบ/ปุ่ม · Font Size ควบคุมตัวอักษรแยกกัน","UI size changes surfaces and controls; text size remains separate")}</small></div><span class="wdj-preview-pill">75%</span></div>
      <button type="button" class="secondary-btn wdj-appearance-reset" data-wdj-reset>${i18n("คืนค่าหน้าตาเริ่มต้น","Restore appearance defaults")}</button>
    </section>`;
  }
  function updatePreview() {
    const icon = read("icons") === "classic" ? "📅" : "";
    document.querySelectorAll(".wdj-preview-icon").forEach(el => {
      if (icon) el.textContent = icon;
      else el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M7.5 3v4M16.5 3v4M4 10h16M8 14h3M13 14h3"/></svg>';
    });
  }
  function ensureSettings() {
    const page = $("v7SettingsPage");
    const appearance = page?.querySelector("#v7Density")?.closest(".v7-settings-card");
    if (appearance && !page.querySelector('[data-wdj-appearance="page"]')) {
      appearance.insertAdjacentHTML("afterend",card("page"));
    }
    const panel = $("settingsPanel");
    const density = panel?.querySelector("#densitySelect")?.closest(".setting-group");
    if (density && !panel.querySelector('[data-wdj-appearance="drawer"]')) {
      density.insertAdjacentHTML("afterend",card("drawer"));
    }
    // The existing app owns this setting; extend the available options instead of duplicating its listeners.
    for (const id of ["densitySelect","v7Density"]) {
      const select = $(id);
      if (!select) continue;
      let item = select.querySelector('option[value="spacious"]');
      if (!item) {
        item = document.createElement("option"); item.value = "spacious"; select.append(item);
      }
      item.textContent = i18n("Spacious · โปร่งสบาย","Spacious");
      if (select.value !== read("density")) select.value = read("density");
    }
    apply();
  }
  let queued = false;
  function scheduleSettings() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; ensureSettings(); });
  }
  document.addEventListener("change", event => {
    const control = event.target.closest?.("[data-wdj-setting]");
    if (control) save(control.dataset.wdjSetting, control.value);
    if (event.target.matches?.("#densitySelect,#v7Density")) {
      root.dataset.wdjDensity = event.target.value;
      scheduleSettings();
    }
  });
  document.addEventListener("click", event => {
    if (event.target.closest?.("[data-wdj-reset]")) {
      save("size","default"); save("icons","modern");
      const select = $("densitySelect");
      if (select) { select.value = "comfortable"; select.dispatchEvent(new Event("change",{bubbles:true})); }
      scheduleSettings();
    }
    if (event.target.closest?.("#resetSettings")) {
      save("size","default"); save("icons","modern");
      root.dataset.wdjDensity = "comfortable";
      scheduleSettings();
    }
    if (event.target.closest?.(".lang-btn,[data-v802-lang],#settingsOpen")) setTimeout(scheduleSettings,100);
  });
  window.addEventListener("storage",event => {
    if (Object.values(KEYS).includes(event.key)) {
      apply();
      if (event.key === KEYS.icons) window.WorkdayV850?.refresh?.();
    }
  });
  window.addEventListener("workday:v8-auth-complete", () => setTimeout(() => { apply();window.WorkdayV850?.refresh?.();scheduleSettings(); },300));
  window.addEventListener("workday:v7-data-changed", () => setTimeout(apply,80));
  const page = $("v7SettingsPage");
  if (page) new MutationObserver(records => {
    if (records.some(r => r.type === "childList" && r.target === page)) scheduleSettings();
  }).observe(page,{childList:true});
  window.addEventListener("hashchange",scheduleSettings);
  ensureSettings();
  window.WorkdayV8602 = {version:VERSION, refresh:apply};
  // Keep legacy layout hidden until all the app-shell enhancements are installed.
  const done = () => {
    window.WorkdayV850?.refresh?.();
    ensureSettings();
    window.__wdjCompleteBoot?.();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",done,{once:true});
  else done();
})();
;

/* ===== SOURCE: v8603.js ===== */
/* Workday Journey V8.6.0.3 - read-only local scanner + owner-reviewed recovery.
 * This client NEVER creates cloud wallet/savings/shares from browser data.
 * SQL RPCs are the authorization and audit boundaries.
 */
(() => {
  'use strict';
  const VERSION = '8.7.6';
  const BANK_BACKUP = 'wdj-v8601-guest-bank-backup';
  const BANK_OWNER = 'wdj-v8601-cloud-bank-owner';
  const BANK_BOUND = 'wdj-v8603-bank-bound-user';
  const EXCHANGE = 'wp-v84-exchange-trades';
  const EXCHANGE_BOUND = 'wdj-v8603-exchange-bound-user';
  const APPROVED_APPLIED = 'wdj-v8603-applied-exchange';
  const inThai = () => { try { return localStorage.getItem('wp-language') !== 'en'; } catch { return true; } };
  const tr = (th,en) => inThai() ? th : en;
  const esc = x => String(x == null ? '' : x).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cloud = () => window.WorkdayV8Cloud;
  const uid = () => cloud()?.getUser?.()?.id || '';
  const client = () => cloud()?.getClient?.();
  const read = (k,f) => { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } };
  const validAmount = x => Number.isFinite(Number(x)) && Math.abs(Number(x)) <= 10000000;
  let sessionUser = '', scanning = null, ownerLoad = null, ownerRows = [], ownerBalances = new Map(), myRows = [], lastError = '';

  function bankEvidence(userId) {
    const bankOwner = localStorage.getItem(BANK_OWNER);
    // A shared browser's old account MUST NOT be attributed to the new account.
    if ((bankOwner && bankOwner !== userId) ||
        (localStorage.getItem(BANK_BOUND) && localStorage.getItem(BANK_BOUND) !== userId)) return null;
    const backup = read(BANK_BACKUP,null);
    if (!backup || !Array.isArray(backup.ledger) || !backup.ledger.length) return null;
    const ledger = backup.ledger.slice(0,250).filter(x => x && typeof x === 'object' &&
      ['deposit','withdraw','interest'].includes(x.type) && validAmount(x.amount))
      .map(x=>({id:String(x.id||'').slice(0,100),type:x.type,amount:Number(x.amount),
        createdAt:String(x.createdAt||'').slice(0,50)}));
    if (!ledger.length) return null;
    const originalAmount = ledger.reduce((sum,x)=>sum+x.amount,0);
    return {ledger, claimedSavings:Math.max(0,Math.round(originalAmount*100)/100),
      source:'old_bank_backup',ownerBinding:bankOwner===userId?'browser_session':'unknown_guest',
      note:'Local-only evidence. Not verified by server.'};
  }
  function tradeEvidence(userId) {
    const bound = localStorage.getItem(EXCHANGE_BOUND);
    if (bound && bound !== userId) return []; // prevent mixing accounts on same machine
    const original = read(EXCHANGE,[]);
    if (!Array.isArray(original) || !original.length) return [];
    return original.slice(0,250).filter(t => t && typeof t==='object' &&
      ['buy','sell'].includes(t.side) && /^[A-Z0-9]{1,12}$/.test(String(t.symbol||'')) &&
      Number.isSafeInteger(Number(t.qty)) && Number(t.qty)>0 && Number(t.qty)<1000000 &&
      Number.isFinite(Number(t.price)) && Number(t.price)>0 && Number(t.price)<100000000)
      .map(t=>({id:String(t.id||'').slice(0,110),side:t.side,
        symbol:String(t.symbol),qty:Number(t.qty),price:Number(t.price),
        gross:Number(t.gross)||0,fee:Number(t.fee)||0,
        walletAmount:Number(t.walletAmount)||0,realizedPnl:Number(t.realizedPnl)||0,
        marketKey:String(t.marketKey||'').slice(0,30),
        marketSlot:Number(t.marketSlot)||0,createdAt:String(t.createdAt||'').slice(0,50)}));
  }
  function buildSnapshot(userId) {
    const bank = bankEvidence(userId), trades = tradeEvidence(userId);
    if (!bank && !trades.length) return null;
    // Intentionally omit profile, email, auth tokens, and unrelated localStorage.
    return {format:1,bank,trades,source:'original_browser',warning:'unverified_client_evidence'};
  }
  function myBadgeText() {
    if (!myRows.length) return '';
    const pending=myRows.filter(x=>x.status==='pending').length;
    const approved=myRows.filter(x=>x.status==='approved').length;
    if(pending) return tr('ข้อมูลเก่าถูกสำรองแล้ว รอตรวจสอบ','Old data backed up; review pending');
    if(approved) return tr('ตรวจสอบข้อมูลเก่าเรียบร้อยแล้ว','Old data reviewed');
    return tr('ตรวจสอบคำขอกู้คืนเรียบร้อยแล้ว','Recovery request reviewed');
  }
  function updateUserNotice() {
    const message=myBadgeText();
    for (const id of ['v84ExchangePage','v84BankPage','v83BankPage']) {
      const page=document.getElementById(id); if(!page)continue;
      let note=page.querySelector('.wdj-recovery-notice');
      if(!message){note?.remove();continue;}
      if(!note){note=document.createElement('p');note.className='wdj-recovery-notice';page.prepend(note);}
      note.textContent=message;
    }
  }
  async function checkMyCases(expected=uid()) {
    if(!expected || !client())return [];
    const {data,error}=await client().rpc('wdj_get_my_legacy_recovery');
    if(error)throw error;
    if(uid()!==expected)return [];
    myRows=Array.isArray(data)?data:[];
    updateUserNotice();
    return myRows;
  }
  async function restoreVerifiedTrades(expected=uid()) {
    if(!expected || !client())return;
    const {data,error}=await client().rpc('wdj_get_my_recovered_trades');
    if(error)throw error;
    if(uid()!==expected || !Array.isArray(data?.trades) || !data.trades.length) return;
    const saved=read(EXCHANGE,[]);
    // Don't overwrite a user's new local trades; keep the approved copy server-side.
    if(Array.isArray(saved) && saved.length) return;
    if(localStorage.getItem(APPROVED_APPLIED)===expected+':'+data.approvedAt)return;
    localStorage.setItem(EXCHANGE,JSON.stringify(data.trades));
    localStorage.setItem(EXCHANGE_BOUND,expected);
    localStorage.setItem(APPROVED_APPLIED,expected+':'+data.approvedAt);
    try { window.dispatchEvent(new CustomEvent('workday:v8-data-changed')); } catch {}
    if(location.hash.includes('/exchange'))window.WorkdayRewards?.renderExchange?.();
  }
  async function scanAndStage() {
    const userId=uid(); if(!userId || !client() || !navigator.onLine)return;
    if(scanning)return scanning;
    scanning=(async()=>{
      // Check the existing cases before any uploads; never credit anything here.
      await checkMyCases(userId);
      await restoreVerifiedTrades(userId);
      const snapshot=buildSnapshot(userId);
      if(!snapshot)return;
      // Only one pending snapshot is needed from the same browser/account.
      if(myRows.length)return; // No automatic re-submission after an Owner rejects the case.
      const {error}=await client().rpc('wdj_submit_legacy_recovery',{p_snapshot:snapshot});
      if(error)throw error;
      if(snapshot.bank && !localStorage.getItem(BANK_BOUND))
        localStorage.setItem(BANK_BOUND,userId);
      if(snapshot.trades.length && !localStorage.getItem(EXCHANGE_BOUND))
        localStorage.setItem(EXCHANGE_BOUND,userId);
      await checkMyCases(userId);
    })().catch(err=>{lastError=String(err?.message||err);}).finally(()=>{scanning=null;});
    return scanning;
  }

  const ownerPanelId='wdjLegacyRecoveryOwner';
  function isOwnerPage(){return location.hash.includes('/developer');}
  async function getOwnerRows() {
    if(!uid() || !client())return [];
    const ok=await window.WorkdayV848?.checkOwner?.();
    if(!ok) return [];
    const {data,error}=await client().rpc('wdj_owner_list_legacy_recovery',{p_status:'pending'});
    if(error)throw error;
    ownerRows=Array.isArray(data)?data:[];
    // Separate privileged read-only RPC: never infer balances from browser snapshots.
    const {data: balances,error: balanceError}=await client().rpc('wdj_owner_recovery_balances');
    if(balanceError)throw balanceError;
    ownerBalances=new Map((Array.isArray(balances)?balances:[]).map(x=>[String(x.userId),x]));
    return ownerRows;
  }
  function bankClaim(snapshot) {
    const list=Array.isArray(snapshot?.bank?.ledger)?snapshot.bank.ledger:[];
    return Math.max(0,Math.round(list.reduce((sum,x)=>sum+(validAmount(x?.amount)?Number(x.amount):0),0)*100)/100);
  }
  function positionsPreview(trades) {
    const shares=new Map();
    for(const t of trades){const symbol=String(t.symbol||'');const amount=Number(t.qty)||0;
      shares.set(symbol,(shares.get(symbol)||0)+(t.side==='buy'?amount:-amount));}
    return Array.from(shares.entries()).filter(([,n])=>n!==0).map(([s,n])=>`${esc(s)}: ${n}`).join(', ')||tr('ไม่มี','None');
  }
  const evidenceType = type => ({
    deposit:tr('ฝากเงิน','Deposit'),withdraw:tr('ถอนเงิน','Withdraw'),interest:tr('ดอกเบี้ย','Interest'),
    buy:tr('ซื้อ','Buy'),sell:tr('ขาย','Sell')
  })[type] || String(type || '');
  const formatTime = value => {
    const date=new Date(value);
    return Number.isNaN(date.getTime()) ? esc(value||'-') : esc(date.toLocaleString(inThai()?'th-TH-u-ca-gregory':'en-GB',{
      day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false
    }));
  };
  function ownerHeader() {
    return `<div class="v848-card-head"><div>
      <p class="eyebrow">${tr('กู้คืนข้อมูลเก่า','LEGACY RECOVERY')}</p>
      <h3>${tr('กู้คืนเงินฝากและพอร์ตหุ้นเดิม','Old savings & portfolio recovery')}</h3>
      <p>${tr('ข้อมูลจากเบราว์เซอร์ยังไม่ใช่หลักฐานยืนยัน ต้องตรวจสอบกับประวัติธุรกรรมก่อนอนุมัติ และระบบจะไม่คืนยอดให้เองโดยอัตโนมัติ','Browser evidence is untrusted. Compare against transaction history before approving. Nothing is restored automatically.')}</p>
      </div><button class="outline-btn" type="button" data-recovery-refresh>${tr('รีเฟรช','Refresh')}</button></div>`;
  }
  function balanceOverview(r) {
    const b=ownerBalances.get(String(r.userId));
    if(!b)return `<div class="wdj-recovery-balances wdj-recovery-balances--missing">${tr('ยังไม่มีข้อมูลยอดบัญชี กรุณากดรีเฟรช','Account balances unavailable. Please refresh.')}</div>`;
    const fmt=n=>Number(n||0).toLocaleString(inThai()?'th-TH':'en-US',{minimumFractionDigits:0,maximumFractionDigits:2});
    const time=t=>t?formatTime(t):tr('ไม่มีประวัติอัปเดต','No update time');
    const wallet=b.walletExists?fmt(b.wallet):tr('ยังไม่มีบัญชี Wallet','No wallet record');
    const savings=b.bankExists?fmt(b.savings):tr('ยังไม่มีบัญชี Bank','No bank record');
    return `<section class="wdj-recovery-balances" aria-label="${tr('ยอดบัญชีปัจจุบันจากระบบ','Current server account balances')}">
      <div class="wdj-recovery-balance"><span>${tr('Wallet ปัจจุบัน','Current wallet')}</span><strong>${wallet}${b.walletExists?' Coins':''}</strong><small>${tr('อัปเดตล่าสุด','Last updated')}: ${esc(time(b.walletUpdatedAt))}</small></div>
      <div class="wdj-recovery-balance"><span>${tr('Savings ปัจจุบัน','Current savings')}</span><strong>${savings}${b.bankExists?' Coins':''}</strong><small>${tr('อัปเดตล่าสุด','Last updated')}: ${esc(time(b.bankUpdatedAt))}</small></div>
      <p class="wdj-recovery-balance-note">${tr('ยอดจากระบบ ณ เวลาที่กดรีเฟรช ไม่ใช่จำนวนที่ต้องคืนอัตโนมัติ ตรวจธุรกรรมใหม่ก่อนอนุมัติ','Read-only server balances at refresh time, NOT an automatic refund amount. Review later transactions before approval.')}</p>
    </section>`;
  }
  function ownerCard(r) {
    const snap=r.snapshot||{}, bank=bankClaim(snap), trades=Array.isArray(snap.trades)?snap.trades:[];
    const bankInfo=snap.bank?.ownerBinding==='unknown_guest'?
      tr('ข้อมูลสำรองจาก Guest (ยังไม่ยืนยัน)','Unverified guest backup'):
      tr('ข้อมูลสำรองจากเบราว์เซอร์เดิม','Browser session backup');
    const id=esc(r.id);
    return `<article class="wdj-recovery-case" data-recovery-case="${id}">
      <header><strong>${esc(r.email||r.userId||tr('บัญชีผู้ใช้','Account'))}</strong><small>${formatTime(r.createdAt)}</small></header>
      <p>${tr('ยอดเงินฝากที่แจ้งขอกู้คืน','Claimed savings')}: <b>${bank.toLocaleString(inThai()?'th-TH':'en-US')} Coins</b> (${esc(bankInfo)})</p>
      <p>${tr('ประวัติหุ้น','Exchange')}: <b>${trades.length} ${tr('รายการซื้อขาย','trades')}</b> | ${tr('หุ้นคงเหลือ','Positions')}: ${positionsPreview(trades)}</p>
      ${balanceOverview(r)}
      <details><summary>${tr('ตรวจสอบหลักฐานธุรกรรมเดิม','Review original transaction evidence')}</summary><div class="wdj-recovery-evidence">
        ${(snap.bank?.ledger||[]).slice(0,30).map(t=>`<p>${esc(t.createdAt)} | ${esc(evidenceType(t.type))} | ${esc(t.amount)}</p>`).join('')||`<p>${tr('ไม่พบประวัติธนาคาร','No bank history')}</p>`}
        <hr/>${trades.slice(0,50).map(t=>`<p>${esc(t.createdAt)} | ${esc(evidenceType(t.side))} ${esc(t.qty)} ${esc(t.symbol)} @ ${esc(t.price)}</p>`).join('')||`<p>${tr('ไม่พบประวัติซื้อขายหุ้น','No trades')}</p>`}
      </div></details>
      <div class="wdj-recovery-controls">
        <label>${tr('จำนวนเงินฝากที่อนุมัติ (เหรียญจำนวนเต็ม)','Approved savings (whole Coins)')}<input type="number" min="0" max="${Math.min(1000000,Math.floor(bank))}" step="1" data-bank-value value="0"></label>
        <label>${tr('วิธีคืนเงินฝาก','Bank settlement')}<select data-bank-mode>
          <option value="wallet_transfer">${tr('ย้ายเงินจากกระเป๋าไปเงินฝาก (แนะนำ)','Move from wallet (recommended)')}</option>
          <option value="verified_compensation">${tr('ชดเชยเงินฝากที่ตรวจสอบแล้ว (เพิ่มยอดเงิน)','Verified compensation (adds savings)')}</option>
        </select></label>
        <label class="wdj-recovery-check"><input type="checkbox" data-stocks-check ${trades.length?'':'disabled'}> ${tr('กู้คืนประวัติหุ้นที่ตรวจสอบแล้ว','Restore verified stock history')}</label>
        <label class="wdj-recovery-reason">${tr('เหตุผลการตรวจสอบของ Owner (อย่างน้อย 10 ตัวอักษร)','Owner review reason (min 10 characters)')}
          <textarea data-reason rows="2" maxlength="1000" placeholder="${tr('ตรวจสอบกับประวัติในบัญชีแล้ว ระบุเหตุผลประกอบ...','Checked against account history; justification...')}"></textarea></label>
      </div>
      <div class="wdj-recovery-actions"><button type="button" data-decision="approve" class="primary-btn">${tr('อนุมัติรายการที่เลือก','Approve selected')}</button>
        <button type="button" data-decision="reject" class="outline-btn">${tr('ปฏิเสธ','Reject')}</button></div>
    </article>`;
  }
  function renderOwnerPanel() {
    const panel=document.getElementById(ownerPanelId); if(!panel)return;
    const list=panel.querySelector('[data-recovery-list]'); if(!list)return;
    list.innerHTML=ownerRows.length?ownerRows.map(ownerCard).join(''):`<p class="muted">${tr('ไม่มีคำขอกู้คืนที่รอตรวจสอบ','No pending recovery requests.')}</p>`;
  }
  function refreshOwnerLanguage() {
    const panel=document.getElementById(ownerPanelId);
    if(!panel || panel.dataset.recoveryLang===(inThai()?'th':'en'))return;
    const drafts=new Map([...panel.querySelectorAll('[data-recovery-case]')].map(card=>[
      card.dataset.recoveryCase,{
        amount:card.querySelector('[data-bank-value]')?.value,
        mode:card.querySelector('[data-bank-mode]')?.value,
        stocks:card.querySelector('[data-stocks-check]')?.checked,
        reason:card.querySelector('[data-reason]')?.value
      }
    ]));
    const header=panel.querySelector('.v848-card-head');
    if(header)header.outerHTML=ownerHeader();
    if(!ownerLoad) {
      renderOwnerPanel();
      for(const card of panel.querySelectorAll('[data-recovery-case]')){
        const d=drafts.get(card.dataset.recoveryCase);if(!d)continue;
        card.querySelector('[data-bank-value]').value=d.amount;
        card.querySelector('[data-bank-mode]').value=d.mode;
        card.querySelector('[data-stocks-check]').checked=d.stocks;
        card.querySelector('[data-reason]').value=d.reason;
      }
    }
    panel.dataset.recoveryLang=inThai()?'th':'en';
  }
  async function refreshOwnerPanel() {
    const panel=document.getElementById(ownerPanelId);if(!panel || ownerLoad)return;
    ownerLoad=(async()=>{
      const list=panel.querySelector('[data-recovery-list]');
      if(list)list.textContent=tr('กำลังโหลดคำขอกู้คืน...','Loading recovery cases...');
      try{await getOwnerRows();renderOwnerPanel();}
      catch(error){if(list)list.textContent=tr('โหลดคำขอไม่สำเร็จ: ','Unable to load cases: ')+String(error?.message||error);}
    })().finally(()=>{ownerLoad=null;});
    return ownerLoad;
  }
  function ensureOwnerPanel() {
    if(!isOwnerPage())return;
    const page=document.getElementById('v848DeveloperPage');if(!page)return;
    // The base app renders an explicit Owner Access badge when permission is verified.
    if(!page.querySelector('.v848-owner-hero'))return;
    if(page.querySelector('#'+ownerPanelId)){refreshOwnerLanguage();return;}
    const panel=document.createElement('section');panel.id=ownerPanelId;
    panel.className='v848-admin-card wdj-recovery-owner';
    panel.innerHTML=ownerHeader()+`<div data-recovery-list>${tr('กำลังโหลด...','Loading...')}</div>`;
    panel.dataset.recoveryLang=inThai()?'th':'en';
    page.append(panel);
    panel.addEventListener('click', async e=>{
      if(e.target.closest('[data-recovery-refresh]')){await refreshOwnerPanel();return;}
      const action=e.target.closest('[data-decision]');if(!action)return;
      const card=action.closest('[data-recovery-case]');const id=card?.dataset.recoveryCase;
      if(!id)return;
      const amt=Number(card.querySelector('[data-bank-value]').value),
        mode=card.querySelector('[data-bank-mode]').value,
        stocks=card.querySelector('[data-stocks-check]').checked,
        reason=card.querySelector('[data-reason]').value.trim();
      if(reason.length<10){alert(tr('กรุณาระบุเหตุผลอย่างน้อย 10 ตัวอักษร','Please provide a review reason (at least 10 characters).'));return;}
      if(action.dataset.decision==='approve' && (!Number.isSafeInteger(amt)||amt<0||(!amt&&!stocks))){alert(tr('กรุณาระบุยอดเงินฝากจำนวนเต็มที่ถูกต้อง หรือเลือกกู้คืนประวัติหุ้น','Select a valid savings amount or stock history.'));return;}
      const decision=action.dataset.decision;
      const confirmText=decision==='approve'
        ?tr(`ยืนยันอนุมัติคำขอกู้คืน?\nเงินฝาก: ${amt} Coins\nวิธีคืนเงิน: ${mode==='wallet_transfer'?'ย้ายจาก Wallet':'ชดเชยยอดที่ตรวจสอบแล้ว'}\nกู้คืนหุ้น: ${stocks?'ใช่':'ไม่'}\nการดำเนินการนี้จะถูกบันทึกและไม่สามารถย้อนกลับได้`,
          `Approve recovery case ${id}?\nSavings: ${amt} Coins\nMethod: ${mode}\nStocks: ${stocks?'Yes':'No'}\nThis action is audited and cannot be undone.`)
        :tr('ยืนยันปฏิเสธคำขอกู้คืนนี้? ระบบจะบันทึกผลและไม่สามารถย้อนกลับได้',`Reject recovery case ${id}? This action is audited and cannot be undone.`);
      if(!confirm(confirmText))return;
      card.querySelectorAll('button').forEach(btn=>btn.disabled=true);
      try{
        const {error}=await client().rpc('wdj_owner_review_legacy_recovery',{
          p_request_id:id,p_decision:decision,p_bank_amount:decision==='approve'?amt:0,
          p_bank_mode:mode,p_restore_stocks:decision==='approve'&&stocks,p_reason:reason});
        if(error)throw error;
        await refreshOwnerPanel();
      }catch(error){alert(tr('ตรวจสอบคำขอไม่สำเร็จ: ','Recovery review failed: ')+String(error?.message||error));card.querySelectorAll('button').forEach(btn=>btn.disabled=false);}
    });
    refreshOwnerPanel();
  }
  let uiTimer=null;
  function scheduleOwnerUi(){if(uiTimer)return;uiTimer=setTimeout(()=>{uiTimer=null;ensureOwnerPanel();updateUserNotice();},90);}
  function startObserver(){
    const target=document.getElementById('v848DeveloperPage');
    if(target)new MutationObserver(scheduleOwnerUi).observe(target,{childList:true});
    // On route changes the Developer page can be rebuilt; the light check is enough.
    scheduleOwnerUi();
  }
  function onAuth(event){
    if(event?.detail?.signedIn){const userId=uid();if(sessionUser!==userId){sessionUser=userId;myRows=[];}
      setTimeout(scanAndStage,750);scheduleOwnerUi();}
    else if(event?.detail?.event==='SIGNED_OUT'){
      sessionUser='';myRows=[];ownerRows=[];ownerBalances=new Map();updateUserNotice();}
  }
  window.WorkdayLegacyRecovery={version:VERSION,scan:scanAndStage,refreshMy:checkMyCases};
  window.addEventListener('workday:v8-auth-state',onAuth);
  window.addEventListener('workday:v8-cloud-ready',()=>setTimeout(scanAndStage,350));
  window.addEventListener('online',()=>setTimeout(scanAndStage,450));
  window.addEventListener('hashchange',scheduleOwnerUi);
  document.addEventListener('click', e=>{
    if(e.target.closest?.('.lang-btn,[data-v802-lang]'))setTimeout(refreshOwnerLanguage,220);
  },true);
  document.addEventListener('DOMContentLoaded',startObserver,{once:true});
  if(document.readyState!=='loading')startObserver();
  setTimeout(scanAndStage,1100);
})();
;


/* Workday Journey V8.6.0.8 - Read-only Data Safety Center.
 * This UI reads this device only; it never imports balances or writes to remote storage.
 * The snapshot intentionally has a different format from the legacy importable backup.
 */
(function WorkdayDataSafetyCenter(){
  'use strict';
  const MARKER='wdj-v8606-last-export-at'; // Device-only timestamp, never an economy key.
  const MAX_EXPORT_BYTES=25*1024*1024;
  const localFinance=['wp-v84-exchange-trades','wp-v83-bank-ledger','wp-v83-bank-state','wdj-v8601-guest-bank-backup'];
  const $=id=>document.getElementById(id);
  const th=()=>{try{return localStorage.getItem('wp-language')!=='en';}catch(_){return true;}};
  const labels={
    th:{
      title:'Data Safety & Backup',tag:'READ-ONLY',intro:'\u0e15\u0e23\u0e27\u0e08\u0e2a\u0e2d\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e43\u0e19\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e41\u0e25\u0e30\u0e2a\u0e33\u0e23\u0e2d\u0e07\u0e01\u0e48\u0e2d\u0e19\u0e25\u0e49\u0e32\u0e07\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25',
      connected:'\u0e40\u0e0a\u0e37\u0e48\u0e2d\u0e21\u0e15\u0e48\u0e2d\u0e1a\u0e31\u0e0d\u0e0a\u0e35',guest:'Guest / Local',offline:'\u0e2d\u0e2d\u0e1f\u0e44\u0e25\u0e19\u0e4c',pending:'\u0e23\u0e2d\u0e15\u0e23\u0e27\u0e08\u0e2a\u0e2d\u0e1a',
      inDevice:'\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e43\u0e19\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d',lastSync:'\u0e0b\u0e34\u0e07\u0e01\u0e4c\u0e25\u0e48\u0e32\u0e2a\u0e38\u0e14',localFinance:'Bank / Exchange \u0e43\u0e19\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d',lastExport:'\u0e2a\u0e33\u0e23\u0e2d\u0e07\u0e25\u0e48\u0e32\u0e2a\u0e38\u0e14',
      download:'\u0e14\u0e32\u0e27\u0e19\u0e4c\u0e42\u0e2b\u0e25\u0e14\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e2a\u0e33\u0e23\u0e2d\u0e07 (JSON)',rescan:'\u0e15\u0e23\u0e27\u0e08\u0e0b\u0e49\u0e33',
      notice:'\u0e44\u0e1f\u0e25\u0e4c\u0e2d\u0e32\u0e08\u0e21\u0e35\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e2a\u0e48\u0e27\u0e19\u0e15\u0e31\u0e27 \u0e2d\u0e22\u0e48\u0e32\u0e41\u0e0a\u0e23\u0e4c\u0e43\u0e2b\u0e49\u0e04\u0e19\u0e2d\u0e37\u0e48\u0e19; \u0e44\u0e21\u0e48\u0e43\u0e0a\u0e48\u0e44\u0e1f\u0e25\u0e4c\u0e19\u0e33\u0e40\u0e02\u0e49\u0e32\u0e41\u0e25\u0e30\u0e44\u0e21\u0e48\u0e40\u0e1e\u0e34\u0e48\u0e21 Coin \u0e2d\u0e31\u0e15\u0e42\u0e19\u0e21\u0e31\u0e15\u0e34',
      warn:'\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e01\u0e32\u0e23\u0e40\u0e07\u0e34\u0e19\u0e08\u0e32\u0e01\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e2d\u0e32\u0e08\u0e44\u0e21\u0e48\u0e15\u0e23\u0e07\u0e01\u0e31\u0e1a\u0e1a\u0e31\u0e0d\u0e0a\u0e35',
      confirmExport:'\u0e2a\u0e33\u0e23\u0e2d\u0e07\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e08\u0e32\u0e01 Browser \u0e19\u0e35\u0e49\u0e25\u0e07\u0e44\u0e1f\u0e25\u0e4c JSON? \u0e44\u0e1f\u0e25\u0e4c\u0e2d\u0e32\u0e08\u0e21\u0e35\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e2a\u0e48\u0e27\u0e19\u0e15\u0e31\u0e27\u0e41\u0e25\u0e30\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e02\u0e2d\u0e07\u0e1c\u0e39\u0e49\u0e43\u0e0a\u0e49\u0e40\u0e14\u0e34\u0e21\u0e1a\u0e19\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e19\u0e35\u0e49',
      exported:'\u0e2a\u0e33\u0e23\u0e2d\u0e07\u0e44\u0e1f\u0e25\u0e4c\u0e40\u0e23\u0e35\u0e22\u0e1a\u0e23\u0e49\u0e2d\u0e22',
      noData:'\u0e44\u0e21\u0e48\u0e1e\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e43\u0e19\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d',
      error:'\u0e44\u0e21\u0e48\u0e2a\u0e32\u0e21\u0e32\u0e23\u0e16\u0e2a\u0e33\u0e23\u0e2d\u0e07\u0e44\u0e14\u0e49: ',
      destructive:'\u0e04\u0e33\u0e40\u0e15\u0e37\u0e2d\u0e19: \u0e01\u0e32\u0e23\u0e14\u0e33\u0e40\u0e19\u0e34\u0e19\u0e01\u0e32\u0e23\u0e19\u0e35\u0e49\u0e2d\u0e32\u0e08\u0e25\u0e1a\u0e2b\u0e23\u0e37\u0e2d\u0e17\u0e31\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25. \u0e01\u0e23\u0e38\u0e13\u0e32\u0e2a\u0e33\u0e23\u0e2d\u0e07\u0e01\u0e48\u0e2d\u0e19',
      enter:'\u0e1e\u0e34\u0e21\u0e1e\u0e4c',never:'\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e40\u0e04\u0e22',done:'\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08',
    },
    en:{title:'Data Safety & Backup',tag:'READ-ONLY',intro:'Inspect device data and make a backup before resetting your journey.',connected:'Signed in',guest:'Guest / Local',offline:'Offline',pending:'Needs attention',inDevice:'Data on this device',lastSync:'Last sync',localFinance:'Bank / Exchange on device',lastExport:'Last read-only export',download:'Download read-only JSON',rescan:'Check again',notice:'This may contain private data from this browser. Do not share it. It cannot be imported and never adds Coins automatically.',warn:'Device-only finance history might not match your account balance.',confirmExport:'Download a device-only JSON snapshot? It may contain personal journals and data left by previous users of this browser.',exported:'Read-only snapshot downloaded.',noData:'No local data found',error:'Backup failed: ',destructive:'Warning: this may remove or replace data. Export a backup first.',enter:'Type',never:'Never',done:'Completed'}
  };
  const T=k=>(labels[th()?'th':'en'][k]||k);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const localGet=k=>{try{return localStorage.getItem(k);}catch(_){return null;}};
  function safeDate(v){if(!v)return T('never');const d=new Date(v);return Number.isNaN(d.getTime())?T('never'):d.toLocaleString(th()?'th-TH':'en-GB',{dateStyle:'medium',timeStyle:'short'});}
  function deviceSnapshot(){
    const data=Object.create(null), excluded=[];
    // Local-only evidence is included for safekeeping, never used as authoritative wallet/stock amounts.
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(!k)continue;
      const eligible=k.startsWith('wp-')||k==='wdj-v8601-guest-bank-backup';
      if(!eligible)continue;
      if(/^wp-v8-cloud-|^wp-v8606-safety-|secret|password|passwd|token|session|authorization|credential|apikey|api-key|private-key|refresh-key/i.test(k)){
        excluded.push(k);continue;
      }
      const v=localGet(k);
      if(typeof v==='string')data[k]=v;
    }
    return {format:'workday-journey-read-only-snapshot',schemaVersion:1,readOnly:true,exportedAt:new Date().toISOString(),source:'device-local-storage',
      warning:'Not verified financial records; never import this file into an economy account. Contains private information.',
      localKeys:data,excludedKeyCount:excluded.length};
  }
  function view(){
    let keys=0,problem=0;
    try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('wp-'))keys++;}}catch(_){problem++;}
    const hasFinance=localFinance.filter(k=>{const v=localGet(k);return v && v!=='[]' && v!=='{}';});
    const status=window.WorkdayV8Cloud?.getStatus?.()||{};
    const online=typeof navigator.onLine==='boolean'?navigator.onLine:true;
    return {keys,hasFinance,online,status,last:localGet('wp-v8-cloud-last-sync'),exportAt:localGet(MARKER),problem};
  }
  function html(id,compact){
    const s=view(),connected=!!s.status.signedIn;
    let state=T('guest');
    if(!s.online)state=T('offline');
    else if(connected)state=s.status.status==='synced'&&!s.status.conflict?T('connected'):T('pending');
    const deviceOnly= s.hasFinance.length>0;
    return `<section id="${id}" class="wdj-safety card ${compact?'wdj-safety-compact':'v7-settings-card v7-settings-wide'}" aria-label="Data Safety">
      <div class="wdj-safety-head"><div><p class="eyebrow">${esc(T('tag'))} · V8.6.0.8</p><h3>🛡 ${esc(T('title'))}</h3><p>${esc(T('intro'))}</p></div><span class="wdj-safety-indicator ${s.online?'':'wdj-offline'}">${esc(state)}</span></div>
      <div class="wdj-safety-stats">
        <div><span>${esc(T('inDevice'))}</span><strong>${s.keys} keys</strong></div>
        <div><span>${esc(T('lastSync'))}</span><strong>${esc(connected?safeDate(s.last):T('guest'))}</strong></div>
        <div><span>${esc(T('localFinance'))}</span><strong>${s.hasFinance.length} ${deviceOnly?'⚠':''}</strong></div>
        <div><span>${esc(T('lastExport'))}</span><strong>${esc(safeDate(s.exportAt))}</strong></div>
      </div>
      ${deviceOnly?`<p class="wdj-safety-warning">⚠ ${esc(T('warn'))}</p>`:''}
      <div class="wdj-safety-actions"><button type="button" class="primary-btn" data-safety-export>↓ ${esc(T('download'))}</button><button type="button" class="outline-btn" data-safety-rescan>↻ ${esc(T('rescan'))}</button></div>
      <p class="wdj-safety-note">🔒 ${esc(T('notice'))}</p>
    </section>`;
  }
  function mount(){
    const target=$('v7SettingsPage')?.querySelector('.v7-settings-grid');
    if(target && !$('wdjDataSafetyMain'))target.insertAdjacentHTML('beforeend',html('wdjDataSafetyMain',false));
    const side=$('settingsPanel')?.querySelector('.data-tools-setting');
    if(side && !$('wdjDataSafetySide'))side.insertAdjacentHTML('afterend',html('wdjDataSafetySide',true));
  }
  function refresh(){
    const a=$('wdjDataSafetyMain'),b=$('wdjDataSafetySide');
    if(a)a.outerHTML=html('wdjDataSafetyMain',false);
    if(b)b.outerHTML=html('wdjDataSafetySide',true);
    mount();
  }
  function exportReadOnly(){
    if(!window.confirm(T('confirmExport')))return false;
    try{
      const payload=deviceSnapshot();const file=JSON.stringify(payload,null,2);
      if(file.length>MAX_EXPORT_BYTES)throw new Error('Data exceeds 25 MB. Contact the owner before clearing this browser.');
      const blob=new Blob([file],{type:'application/json'});
      const url=URL.createObjectURL(blob),a=document.createElement('a');
      a.download=`workday-journey-device-snapshot-${new Date().toISOString().slice(0,10)}.json`;
      a.href=url;document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),30000);
      // Updating only this device's backup metadata does not alter local project/economy data.
      try{localStorage.setItem(MARKER,new Date().toISOString());}catch(_){}
      refresh();return true;
    }catch(e){window.alert(T('error')+String(e?.message||e));return false;}
  }
  function confirmRisk(kind){
    const token=kind==='import'?'IMPORT':kind==='journey'?'NEW':'RESET';
    const qualifier=kind==='reset'?' / online data may also be deleted':kind==='import'?' / may replace and later sync your data':' / clears journey settings and records';
    if(!window.confirm(`${T('destructive')}\n${kind.toUpperCase()}${qualifier}`))return false;
    const value=window.prompt(`${T('enter')} ${token} to continue:`,'');
    return value===token;
  }
  // Event delegation persists when the settings page re-renders.
  document.addEventListener('click',e=>{
    const btn=e.target.closest?.('[data-safety-export],[data-safety-rescan]');if(!btn)return;
    if(btn.hasAttribute('data-safety-export'))exportReadOnly();else refresh();
  });
  window.WorkdayDataSafety=Object.freeze({confirmRisk,exportReadOnly,scan:view,mount,refresh});
  const page=$('v7SettingsPage');
  if(page)new MutationObserver(()=>{if(!page.querySelector('#wdjDataSafetyMain'))mount();}).observe(page,{childList:true});
  window.addEventListener('hashchange',()=>setTimeout(()=>{mount();refresh();},30));
  window.addEventListener('workday:v8-auth-state',()=>setTimeout(refresh,40));
  window.addEventListener('online',refresh);window.addEventListener('offline',refresh);
  window.addEventListener('storage',e=>{if(e.key===MARKER||e.key==='wp-v8-cloud-last-sync')refresh();});
  document.addEventListener('click',e=>{if(e.target.closest?.('#settingsOpen,.lang-btn,[data-v802-lang]'))setTimeout(refresh,100);},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{mount();refresh();},{once:true});else{mount();refresh();}
})();


/* ===== SOURCE: v8608 - Accessibility & Usability ===== */
(() => {
  'use strict';
  const STORAGE_PREFIX = 'wdj-v8608-a11y-';
  const TYPES = ['contrast','links','targets'];
  const root = document.documentElement;
  const page = document.getElementById('v7SettingsPage');
  const drawer = document.getElementById('settingsPanel');
  const thai = () => { try { return localStorage.getItem('wp-language') !== 'en'; } catch (_) { return true; } };
  const t = (th,en) => thai() ? th : en;
  const get = type => { try { return localStorage.getItem(STORAGE_PREFIX + type) === '1'; } catch (_) { return false; } };
  const set = (type,checked) => {
    if (!TYPES.includes(type)) return;
    try { localStorage.setItem(STORAGE_PREFIX + type, checked ? '1' : '0'); } catch (_) {}
    apply();
  };
  function apply() {
    TYPES.forEach(type => {
      const checked = get(type);
      root.classList.toggle('wdj-a11y-' + type, checked);
      document.querySelectorAll(`[data-wdj-a11y="${type}"]`).forEach(input => {
        if (input.checked !== checked) input.checked = checked;
      });
    });
  }
  function card(kind) {
    const options = [
      ['contrast', t('เพิ่มความชัดของสี','Higher contrast'), t('ตัวอักษรและเส้นขอบชัดขึ้น','Stronger text and borders')],
      ['links', t('ขีดเส้นใต้ลิงก์','Underline links'), t('แยกลิงก์ออกจากข้อความได้ง่าย','Identify links more easily')],
      ['targets', t('ขยายพื้นที่กด','Larger tap targets'), t('กดปุ่มและแท็บได้สะดวกขึ้น','Easier buttons and tabs')]
    ].map(([key,title,help]) => `<label class="wdj-a11y-option"><input type="checkbox" data-wdj-a11y="${key}" ${get(key)?'checked':''}><span><strong>${title}</strong><small>${help}</small></span></label>`).join('');
    return `<section class="wdj-a11y-card ${kind === 'page' ? 'card v7-settings-card' : 'setting-group'}" data-wdj-a11y-card="${kind}" aria-label="${t('การช่วยการเข้าถึง','Accessibility options')}">
      <div class="wdj-a11y-header"><p class="eyebrow">ACCESSIBILITY</p><h3>${t('♿ อ่านง่ายและใช้งานสะดวก','♿ Accessibility & Usability')}</h3>
      <p>${t('ปรับความชัดและการกดปุ่มให้เหมาะกับตัวคุณ โดยไม่เปลี่ยนขนาดฟอนต์เดิม','Adjust clarity and controls without changing your text-size setting')}</p></div>
      <div class="wdj-a11y-options">${options}</div>
      <p class="wdj-a11y-hint">${t('คีย์บอร์ด:','Keyboard:')} <kbd>Tab</kbd> / <kbd>Shift + Tab</kbd> ${t('ย้ายจุดโฟกัส','move focus')} · <kbd>Enter</kbd> ${t('เลือก','activate')} · <kbd>Esc</kbd> ${t('ปิดหน้าต่างที่รองรับ','close supported dialogs')}</p>
      <p class="wdj-a11y-hint">${t('บันทึกการตั้งค่าเฉพาะอุปกรณ์นี้ ไม่กระทบข้อมูลบัญชี','Preferences stay on this device; account data is unchanged')}</p>
    </section>`;
  }
  function updateLabels() {
    const map = {
      settingsOpen: ['เปิดการตั้งค่า','Open settings'],
      settingsClose: ['ปิดการตั้งค่า','Close settings'],
      themeToggle: ['เปลี่ยนธีม','Change theme']
    };
    for (const [id,names] of Object.entries(map)) {
      const item = document.getElementById(id);
      if (item) item.setAttribute('aria-label',t(...names));
    }
  }
  function mount() {
    for (const [kind,container] of [['page',page],['drawer',drawer]]) {
      if (!container) continue;
      const previous = container.querySelector(`[data-wdj-a11y-card="${kind}"]`);
      if (previous && previous.dataset.locale === (thai()?'th':'en')) continue;
      // After the existing appearance card; this is a presentation-only section.
      const anchor = container.querySelector(`[data-wdj-appearance="${kind}"]`);
      if (!anchor) continue;
      const holder = document.createElement('div');
      holder.innerHTML = card(kind);
      const next = holder.firstElementChild;
      next.dataset.locale = thai()?'th':'en';
      if (previous) previous.replaceWith(next);
      else anchor.insertAdjacentElement('afterend',next);
    }
    updateLabels();
    apply();
  }
  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; mount(); });
  }
  document.addEventListener('change', event => {
    const input = event.target.closest?.('[data-wdj-a11y]');
    if (input && TYPES.includes(input.dataset.wdjA11y)) set(input.dataset.wdjA11y,input.checked);
  });
  window.addEventListener('storage', event => { if (event.key?.startsWith(STORAGE_PREFIX)) apply(); });
  document.addEventListener('click',event => {
    if (event.target.closest?.('.lang-btn,[data-v802-lang],#settingsOpen')) setTimeout(schedule,80);
  },true);
  window.addEventListener('hashchange',schedule);
  // Route rendering may replace the settings page; observe that root only, not the entire app.
  if (page) new MutationObserver(records => {
    if (records.some(r => r.type === 'childList' && r.target === page)) schedule();
  }).observe(page,{childList:true});
  if (drawer) {
    const header = drawer.querySelector('.settings-header h2');
    if (header) { header.id ||= 'wdjSettingsDialogTitle'; drawer.setAttribute('aria-labelledby',header.id); }
    drawer.setAttribute('role','dialog');
    drawer.setAttribute('aria-modal','true');
    // Existing v855 focus trap now handles this panel. Restore focus to its opener on close.
    let openedBy = null;
    document.getElementById('settingsOpen')?.addEventListener('click',event => { openedBy = event.currentTarget; },true);
    new MutationObserver(() => {
      if (drawer.getAttribute('aria-hidden') === 'false') {
        requestAnimationFrame(() => {
          if (drawer.getAttribute('aria-hidden') === 'false' && !drawer.contains(document.activeElement)) {
            drawer.querySelector('#settingsClose')?.focus({preventScroll:true});
          }
        });
      } else if (drawer.getAttribute('aria-hidden') === 'true' && drawer.contains(document.activeElement)) {
        const target = openedBy;
        if (target?.isConnected && !target.disabled) requestAnimationFrame(() => target.focus({preventScroll:true}));
      }
    }).observe(drawer,{attributes:true,attributeFilter:['aria-hidden']});
  }
  // Page navigation is announced politely, without moving the user's keyboard focus.
  let announcer = document.getElementById('wdjA11yRouteAnnouncer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'wdjA11yRouteAnnouncer';
    announcer.className = 'v855-sr-only';
    announcer.setAttribute('role','status');
    announcer.setAttribute('aria-live','polite');
    announcer.setAttribute('aria-atomic','true');
    document.body.appendChild(announcer);
  }
  window.addEventListener('hashchange', () => {
    requestAnimationFrame(() => {
      const heading = [...document.querySelectorAll('.v7-page-heading h1,.v7-page-heading h2')]
        .find(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
      if (heading) announcer.textContent = t('เปิดหน้า ','Opened ') + (heading.textContent||'').trim().slice(0,90);
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab') root.classList.add('wdj-keyboard-user');
  },true);
  document.addEventListener('pointerdown', () => root.classList.remove('wdj-keyboard-user'),{passive:true,capture:true});
  mount();
  window.WorkdayV8608 = { version:'8.7.6',refresh:mount };
})();

/* SOURCE: V8.7.6 Virtual Workspace - Friendship & Evolution.
   Read-only journal/project progress; cosmetic, account-scoped device-only affection. */
;(function(){
  'use strict';
  const ROOM_KEY='wdj-v870-workspace-local-v1'; // Preserve V8.7.0 room layouts.
  const LIFE_KEY='wdj-v871-mascot-life-local-v1'; // Retain saved V8.7.1 preferences.
  const BOND_KEY='wdj-v872-mascot-friendship-local-v1'; // Never part of wp-* cloud sync.
  const AMBIENCE_KEY='wdj-v874-workspace-ambience-local-v1'; // Cosmetic preferences, local-only.
  // Original eight IDs are retained for V8.7.0 room backward compatibility.
  // New rewards are cosmetic-only: unlocks derive from read-only existing activity.
  const CATALOG=[
    ['plant','🪴','ต้นไม้','Plant','starter'],['lamp','💡','โคมไฟ','Lamp','starter'],
    ['books','📚','หนังสือ','Books','starter'],['clock','🕰️','นาฬิกา','Clock','starter'],
    ['trophy','🏆','ถ้วยรางวัล','Trophy','starter'],['coffee','☕','กาแฟ','Coffee','starter'],
    ['bear','🧸','ตุ๊กตา','Teddy','starter'],['painting','🖼️','รูปภาพ','Painting','starter'],
    ['cactus','🌵','กระบองเพชร','Cactus','nature'],
    ['reading','📖','มุมอ่านหนังสือ','Reading Nook','cozy'],
    ['rug','🧶','พรมถัก','Woven Rug','cozy'],
    ['goldplant','🌿','ต้นไม้พิเศษ','Special Plant','nature'],
    ['fairylight','🪔','โคมไฟอุ่น','Warm Lantern','cozy'],
    ['bonsai','🌳','บอนไซ','Bonsai','nature'],
    ['fireplace','🔥','เตาผิง','Fireplace','cozy'],
    ['projectcup','🏅','ถ้วยโปรเจกต์','Project Medal','trophy'],
    ['blueprint','📐','พิมพ์เขียว','Blueprint','trophy'],
    ['goldcup','🏆','ถ้วยทอง','Gold Trophy','trophy'],
    ['bookshelf','🗄️','ชั้นหนังสือ','Bookshelf','trophy'],
    ['certificate','📜','ใบประกาศ','Certificate','trophy'],
    ['cloudlamp','☁️','โคมไฟเมฆ','Cloud Lamp','mascot'],
    ['pawframe','🐾','กรอบรอยเท้า','Paw Frame','mascot'],
    ['cushion','🛋️','เบาะ Mascot','Mascot Cushion','mascot'],
    ['starmobile','⭐','ดาวแขวน','Star Mobile','mascot'],
    ['banner','🎀','ธงมิตรภาพ','Friendship Banner','mascot'],
    ['crown','👑','มงกุฎประดับ','Crown Display','mascot']
  ];
  const DECOR_RULES={
    cactus:['journals',2],reading:['journals',3],rug:['journals',5],
    goldplant:['journals',7],fairylight:['journals',10],bonsai:['journals',14],fireplace:['journals',21],
    projectcup:['projects',1],blueprint:['projects',1],bookshelf:['projects',2],certificate:['projects',2],goldcup:['projects',3],
    cloudlamp:['level',2],pawframe:['level',3],cushion:['level',5],starmobile:['level',5],banner:['level',7],crown:['level',10]
  };
  const CATEGORIES=[['all','ทั้งหมด','All'],['starter','เริ่มต้น','Starter'],['nature','ธรรมชาติ','Nature'],['cozy','ห้องน่าอยู่','Cozy'],['trophy','ผลงาน','Projects'],['mascot','Mascot','Mascot']];
  const DEFAULT={theme:'day',items:[{id:'plant',x:2,y:4},{id:'lamp',x:7,y:2}],updatedAt:null};
  const MOODS={
    auto:{icon:'✨',th:'อัตโนมัติ',en:'Auto'},
    idle:{icon:'🌿',th:'พักผ่อน',en:'Idle'},
    work:{icon:'💻',th:'ทำงาน',en:'Working'},
    sleep:{icon:'💤',th:'นอนหลับ',en:'Sleeping'},
    happy:{icon:'🎉',th:'ดีใจ',en:'Happy'},
    dance:{icon:'🎶',th:'เต้นฉลอง',en:'Dance'},
    sparkle:{icon:'🌟',th:'ประกายดาว',en:'Star Glow'},
    victory:{icon:'👑',th:'ท่าชัยชนะ',en:'Victory'}
  };
  const SPECIAL_LEVELS={dance:3,sparkle:5,victory:10};
  const MILESTONES=[{level:3,mood:'dance',icon:'🎶'},{level:5,mood:'sparkle',icon:'🌟'},{level:10,mood:'victory',icon:'👑'}];
  const clone=v=>JSON.parse(JSON.stringify(v));
  const en=()=>document.documentElement.lang==='en'||document.documentElement.getAttribute('lang')==='en-US';
  const txt=(th,eng)=>en()?eng:th;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function loadRoom(){
    try{
      const v=JSON.parse(localStorage.getItem(ROOM_KEY)||'null');
      if(!v||!Array.isArray(v.items))return clone(DEFAULT);
      return {
        theme:v.theme==='night'?'night':'day',
        items:v.items.filter(i=>CATALOG.some(c=>c[0]===i.id)&&Number.isInteger(i.x)&&Number.isInteger(i.y)&&i.x>=0&&i.x<10&&i.y>=0&&i.y<6).slice(0,24),
        updatedAt:v.updatedAt||null
      };
    }catch{return clone(DEFAULT);}
  }
  function loadLife(){
    try{
      const v=JSON.parse(localStorage.getItem(LIFE_KEY)||'null')||{};
      return {
        mascot:typeof v.mascot==='string'&&v.mascot.length<42?v.mascot:'equipped',
        mood:Object.hasOwn(MOODS,v.mood)?v.mood:'auto'
      };
    }catch{return {mascot:'equipped',mood:'auto'};}
  }
  const AMBIENCE_MODES=['auto','day','sunset','night'];
  const WEATHER_MODES=['clear','rain','snow']; // Decorative only; never a live weather report.
  function loadAmbience(){
    try {
      const saved=JSON.parse(localStorage.getItem(AMBIENCE_KEY)||'null');
      const legacy=localStorage.getItem(ROOM_KEY);
      return {
        mode:AMBIENCE_MODES.includes(saved?.mode)?saved.mode:(legacy?loadRoom().theme:'auto'),
        weather:WEATHER_MODES.includes(saved?.weather)?saved.weather:'clear',
        effects:saved?.effects!==false
      };
    }catch{return {mode:'auto',weather:'clear',effects:true};}
  }
  let ambience=loadAmbience();
  function saveAmbience(){
    try{localStorage.setItem(AMBIENCE_KEY,JSON.stringify(ambience));message=txt('บันทึกบรรยากาศในเครื่องแล้ว','Atmosphere saved on this device');}
    catch{message=txt('บันทึกบรรยากาศไม่ได้','Unable to save atmosphere');}
  }
  function autoPhase(date=new Date()){
    const h=date.getHours();
    if(h>=6&&h<17)return 'day';
    if(h>=17&&h<19)return 'sunset';
    return 'night';
  }
  function resolvedPhase(){return ambience.mode==='auto'?autoPhase():ambience.mode;}
  function phaseName(mode){return ({auto:txt('ตามเวลา','Auto'),day:txt('กลางวัน','Day'),sunset:txt('พระอาทิตย์ตก','Sunset'),night:txt('กลางคืน','Night')})[mode]||mode;}
  function weatherName(mode){return ({clear:txt('ท้องฟ้าใส','Clear'),rain:txt('ฝนตก','Rain'),snow:txt('หิมะ','Snow')})[mode]||mode;}
  let data=loadRoom(),life=loadLife(),edit=false,selected='plant',category='all',message='';
  const milestonesSeen=new Map(); // In-memory per account: never writes a reward or user state.
  let celebrationUntil=0, celebrationTimer=0, celebrationType='';
  function milestoneSnapshot(){const v=appProgress();return {journals:v.journals,projects:v.projects,pending:v.pending};}
  function latestMilestone(v){
    if(v.projects>0)return {type:'projects',name:txt('สำเร็จไปอีกหนึ่งโปรเจกต์! 🏆','Project completed! 🏆')};
    if(v.journals>=7)return {type:'journals',name:txt('เขียน Journal ครบ 7 วันแล้ว! 🌱','7 Journal days reached! 🌱')};
    return null;
  }
  function detectMilestone(){
    if(!activePage())return;
    const scope=profileScope();if(!scope)return;
    const next=milestoneSnapshot();if(next.pending)return;
    const prior=milestonesSeen.get(scope);
    milestonesSeen.set(scope,next);
    if(!prior)return; // Initial visit is a baseline, not a new completion.
    const isProject=next.projects>prior.projects;
    const isJournal=next.journals>=7&&prior.journals<7;
    if(!isProject&&!isJournal)return;
    celebrationType=isProject?'projects':'journals';
    celebrationUntil=Date.now()+5600;
    clearTimeout(celebrationTimer);
    updateSceneLive();
    celebrationTimer=setTimeout(()=>{celebrationUntil=0;if(activePage())updateSceneLive();},5700);
  }

  let petUntil=0,petTimer=0;
  function saveRoom(){
    data.updatedAt=new Date().toISOString();
    try{localStorage.setItem(ROOM_KEY,JSON.stringify(data));message=txt('บันทึกห้องในเครื่องแล้ว','Room saved on this device');}
    catch{message=txt('บันทึกไม่ได้: พื้นที่จัดเก็บอาจเต็ม','Could not save: browser storage may be full');}
  }
  function saveLife(){
    try{localStorage.setItem(LIFE_KEY,JSON.stringify({...life,updatedAt:new Date().toISOString()}));message=txt('บันทึก Mascot ในเครื่องแล้ว','Mascot preferences saved locally');}
    catch{message=txt('บันทึกการตั้งค่า Mascot ไม่สำเร็จ','Mascot preferences could not be saved');}
  }
  // Ownership comes only from the existing Reward Shop API. Local room choices
  // never grant an item, equip an item in the Shop, or modify protected economy keys.
  function collection(){
    let list=[];
    try{list=window.WorkdayRewards?.getCatalog?.().filter(r=>r.type==='mascot'&&r.owned)||[];}
    catch{list=[];}
    const chick={id:'chick',icon:'🐣',name:txt('Default Chick','Default Chick'),owned:true};
    if(!list.some(m=>m.id==='chick'))list.unshift(chick);
    const equippedId=window.WorkdayRewards?.getEquippedMascot?.()?.id||'chick';
    const equipped=list.find(m=>m.id===equippedId)||list.find(m=>m.id==='chick')||chick;
    const active=life.mascot==='equipped'?equipped:(list.find(m=>m.id===life.mascot)||equipped);
    return {list,active,equipped};
  }
  // These points only customize the local mascot appearance. They never grant
  // spendable Coins or write to any existing Journal, Project, Shop or cloud keys.
  function safeJson(key, fallback){
    try { const value=JSON.parse(localStorage.getItem(key)||'null'); return value??fallback; }
    catch { return fallback; }
  }
  function appProgress(){
    let pending=false;
    try { const status=window.WorkdayV8Cloud?.getStatus?.(); pending=!!status?.signedIn&&status.ready===false; }
    catch {}
    if(pending)return {journals:0,projects:0,pending:true};
    const rawJournal=safeJson('wp-v6-journal',{});
    const journals=rawJournal&&typeof rawJournal==='object'&&!Array.isArray(rawJournal)
      ?Object.entries(rawJournal).filter(([date,j])=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&j&&typeof j==='object'&&(
        String(j.work||'').trim().length>0||String(j.learned||'').trim().length>0
      )).length:0;
    const rawProjects=safeJson('wp-v6-projects',[]);
    const uniqueProjects=new Set();
    if(Array.isArray(rawProjects))rawProjects.forEach((p,index)=>{
      if(!p||typeof p!=='object'||!(p.status==='completed'||Number(p.progress)>=100))return;
      uniqueProjects.add(String(p.id||`project-${index}`).slice(0,140));
    });
    return {journals:Math.min(200,journals),projects:Math.min(40,uniqueProjects.size),pending:false};
  }
  function localDate(){
    const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function profileScope(){
    try {
      const cloud=window.WorkdayV8Cloud;
      if(cloud?.isSignedIn?.()){
        const id=cloud.getUser?.()?.id;
        return id?`user:${String(id).slice(0,110)}`:null;
      }
    }catch{return null;}
    return 'guest';
  }
  function loadBonds(){
    const v=safeJson(BOND_KEY,{});
    return v&&v.version===1&&v.profiles&&typeof v.profiles==='object'&&!Array.isArray(v.profiles)
      ?v:{version:1,profiles:{}};
  }
  function careDays(id){
    const scope=profileScope();if(!scope)return [];
    const rows=loadBonds().profiles?.[scope]?.[id];
    return Array.isArray(rows)?[...new Set(rows.filter(x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)))].slice(-500):[];
  }
  function recordGreeting(id){
    const scope=profileScope();if(!scope)return {newDay:false,saved:false};
    const state=loadBonds(),today=localDate();
    if(!state.profiles[scope]||typeof state.profiles[scope]!=='object')state.profiles[scope]={};
    const current=careDays(id);
    if(current.includes(today))return {newDay:false,saved:true};
    state.profiles[scope][id]=[...current,today].slice(-500);
    try { localStorage.setItem(BOND_KEY,JSON.stringify(state));return {newDay:true,saved:true}; }
    catch { return {newDay:false,saved:false}; }
  }
  function legacyXp(id){
    try {
      const xp=Number(window.WorkdayRewards?.getMascotBond?.(id)?.xp||0);
      return Number.isFinite(xp)?Math.max(0,Math.min(100000,Math.round(xp))):0;
    }catch{return 0;}
  }
  function friendship(id){
    const activity=appProgress(),days=careDays(id).length;
    const journalXp=activity.journals*15,projectXp=activity.projects*60,careXp=days*8,shopXp=legacyXp(id);
    const xp=journalXp+projectXp+careXp+shopXp;
    const level=Math.floor(xp/100)+1,progress=xp%100;
    const stage=level>=10?'legend':level>=5?'star':level>=3?'buddy':'seed';
    const stageCopy={
      seed:txt('เพื่อนใหม่','New Friend'),buddy:txt('เพื่อนซี้','Close Buddy'),
      star:txt('เพื่อนคู่ใจ','Best Friend'),legend:txt('คู่หูระดับตำนาน','Legendary Partner')
    };
    return {id,xp,level,progress,stage,stageName:stageCopy[stage],journalXp,projectXp,careXp,shopXp,days,activity};
  }
  function decorUnlocked(item,activity,bond){
    const rule=DECOR_RULES[item[0]];
    if(!rule)return true;
    if(rule[0]==='level')return bond.level>=rule[1];
    return !activity.pending&&Number(activity[rule[0]]||0)>=rule[1];
  }
  function decorRequirement(item){
    const rule=DECOR_RULES[item[0]];
    if(!rule)return txt('พร้อมใช้','Available');
    if(rule[0]==='level')return `Mascot Lv. ${rule[1]}`;
    if(rule[0]==='projects')return txt(`Project สำเร็จ ${rule[1]} งาน`,`${rule[1]} completed projects`);
    return txt(`Journal ${rule[1]} วัน`,`${rule[1]} journal days`);
  }
  function decorCollection(activity,bond){
    return CATALOG.map(item=>({item,unlocked:decorUnlocked(item,activity,bond)}));
  }
  function requiredLevel(mood){return SPECIAL_LEVELS[mood]||1;}
  function canUseMood(mood,id){return !!MOODS[mood]&&friendship(id).level>=requiredLevel(mood);}
  function milestoneName(mood){
    const m=MOODS[mood];return m?(en()?m.en:m.th):mood;
  }
  function friendshipMarkup(bond){
    const summary=bond.activity.pending
      ?txt('กำลังรอข้อมูลกิจกรรมของบัญชี…','Waiting for account activity…')
      :txt(`Journal ${bond.activity.journals} วัน · Project สำเร็จ ${bond.activity.projects} งาน`,
        `${bond.activity.journals} Journal days · ${bond.activity.projects} completed projects`);
    const milestones=MILESTONES.map(item=>{
      const reached=bond.level>=item.level;
      return `<div class="wdj-bond-milestone ${reached?'unlocked':'locked'}"><span aria-hidden="true">${reached?item.icon:'🔒'}</span><strong>Lv. ${item.level}</strong><small>${esc(milestoneName(item.mood))}</small></div>`;
    }).join('');
    return `<section class="wdj-life-panel wdj-bond-panel" data-wdj-bond-stage="${bond.stage}">
      <div class="wdj-life-heading"><span>❤️ ${txt('Friendship & Evolution','Friendship & Evolution')}</span><span class="wdj-bond-stage">${esc(bond.stageName)}</span></div>
      <div class="wdj-bond-stats"><div><strong>Lv. ${bond.level.toLocaleString('en-US')}</strong><small>${esc(txt('ระดับความสนิท','Friendship Level'))}</small></div><div><strong>${bond.xp.toLocaleString('en-US')} XP</strong><small>${esc(txt('XP สะสมทั้งหมด','Total XP'))}</small></div></div>
      <div class="wdj-bond-progress-label"><span>${esc(txt('สู่ระดับถัดไป','To next level'))}</span><strong>${bond.progress}/100 XP</strong></div>
      <div class="wdj-bond-track" role="progressbar" aria-label="${esc(txt('ความคืบหน้า Friendship','Friendship progress'))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${bond.progress}"><span style="width:${bond.progress}%"></span></div>
      <p class="wdj-bond-activity">${esc(summary)}</p>
      <div class="wdj-bond-sources"><span>📓 +${bond.journalXp} XP</span><span>🏁 +${bond.projectXp} XP</span><span>💗 +${bond.careXp} XP</span><span>🎁 +${bond.shopXp} XP</span></div>
      <div class="wdj-bond-heading">✨ ${txt('ปลดล็อกท่าทางพิเศษ','Special pose milestones')}</div><div class="wdj-bond-milestones">${milestones}</div>
      <p class="wdj-life-hint">${txt('Journal +15 XP/วัน · Project สำเร็จ +60 XP/งาน · ทักทาย +8 XP/วันต่อ Mascot · นับ XP ที่มีใน Reward Shop ด้วย','Journal +15 XP/day · completed project +60 XP · greeting +8 XP/day per mascot · includes existing Shop XP')}</p>
      <p class="wdj-life-hint">${txt('ความสนิทเป็นของตกแต่ง เก็บในเครื่องนี้เท่านั้น ไม่เพิ่ม Coin หรือเปลี่ยนไอเทมในร้าน','Friendship is cosmetic and stored on this device only. It never changes Coins or Shop items.')}</p>
    </section>`;
  }
  function autoMood(){
    const hour=new Date().getHours();
    if(resolvedPhase()==='night'||hour>=21||hour<6)return 'sleep';
    if(hour>=8&&hour<17)return 'work';
    return 'idle';
  }
  function currentMood(){
    if(Date.now()<petUntil)return 'happy';
    const id=collection().active.id;
    return life.mood==='auto'||!canUseMood(life.mood,id)?autoMood():life.mood;
  }
  function moodCopy(mood){
    return {
      idle:txt('กำลังเดินเล่นในห้องของคุณ 🌿','Just wandering around your cozy room 🌿'),
      work:txt('กำลังตั้งใจทำงานอยู่ 💻','Busy working on something cool 💻'),
      sleep:txt('ขอพักสายตาสักครู่... 💤','Just a little nap... 💤'),
      happy:txt('เย่! ดีใจที่ได้เจอกัน! 🎉','Yay! So happy to see you! 🎉'),
      dance:txt('มาเต้นฉลองไปด้วยกัน! 🎶','Let us dance together! 🎶'),
      sparkle:txt('ดาวแห่งมิตรภาพกำลังเปล่งประกาย! 🌟','Our friendship is shining! 🌟'),
      victory:txt('เราเป็นคู่หูระดับตำนานแล้ว! 👑','Legendary partners forever! 👑')
    }[mood]||'';
  }
  function moodName(mood){const m=MOODS[mood]||MOODS.idle;return en()?m.en:m.th;}
  function activePage(){const node=document.getElementById('wdjWorkspacePage');return node&&!node.classList.contains('v7-route-hidden')&&document.body?.dataset.v7Route==='workspace';}
  function updateMoodVisual(){
    const root=document.getElementById('wdjWorkspacePage');if(!root)return;
    const mood=currentMood(),scene=root.querySelector('.wdj-room-scene');
    if(scene)scene.dataset.wdjMascotMood=mood;
    const status=root.querySelector('[data-wdj-life-status]');
    if(status)status.textContent=`${MOODS[mood]?.icon||''} ${moodName(mood)}`;
    const speech=root.querySelector('[data-wdj-life-speech]');
    if(speech)speech.textContent=moodCopy(mood);
    const pet=root.querySelector('[data-wdj-life-pet]');
    if(pet)pet.setAttribute('aria-label',txt('เล่นกับ Mascot เพื่อให้ดีใจ','Interact with mascot to make it happy'));
  }
  function updateSceneLive(){
    if(!activePage())return;
    const scene=document.querySelector('#wdjWorkspacePage .wdj-room-scene');
    if(!scene)return;
    const phase=resolvedPhase();
    scene.dataset.wdjV874Phase=phase;
    scene.classList.toggle('night',phase==='night');
    const phaseLabel=document.querySelector('#wdjWorkspacePage [data-wdj-phase-status]');
    if(phaseLabel)phaseLabel.textContent=`${ambience.mode==='auto'?'🕒 ':''}${phaseName(phase)}`;
    const celebration=Date.now()<celebrationUntil;
    scene.classList.toggle('wdj-v874-celebrating',celebration);
    scene.dataset.wdjV874Event=celebration?celebrationType:'none';
    const copy=document.querySelector('#wdjWorkspacePage [data-wdj-v874-event-note]');
    if(copy){const snap=milestoneSnapshot(),event=latestMilestone(snap);
      copy.textContent=celebration?(celebrationType==='projects'?txt('🏆 เยี่ยมมาก! Project สำเร็จแล้ว','🏆 Well done! Project completed'):txt('🌱 ยอดเยี่ยม! Journal ครบ 7 วัน','🌱 Great work! Seven Journal days')):(event?event.name:txt('เริ่มบันทึก Journal หรือทำ Project ให้สำเร็จ เพื่อสร้างความทรงจำในห้อง','Log Journals or finish projects to create workspace memories'));}
    updateMoodVisual();
    if(scene.dataset.wdjPixelReady==='yes')paintWorkspace(scene);
  }
  // V8.7.6: All room fixtures and placed decorations use the SAME 10x6 world grid.
  // The scene is painted on a low-resolution canvas, then scaled with nearest-neighbor
  // rendering. Stored {id,x,y} coordinates from V8.7.0 remain untouched.
  const PIXEL_PALETTES={
    day:{wall:'#a9cce3',wall2:'#b9d9e6',wallShade:'#92bad4',floor:'#bd8b72',floor2:'#c99879',line:'#926d66',sky:'#83c7ef',sky2:'#bceaff',light:'#ffdb91'},
    sunset:{wall:'#cc9aaf',wall2:'#e4b3b0',wallShade:'#ac879f',floor:'#96778d',floor2:'#ae8491',line:'#756681',sky:'#ef987e',sky2:'#f8ce9c',light:'#ffb36b'},
    night:{wall:'#455778',wall2:'#536b88',wallShade:'#344765',floor:'#605e78',floor2:'#716a82',line:'#4a486b',sky:'#233961',sky2:'#3d567b',light:'#f0d7a3'}
  };
  // Small authored sprites, intentionally not emoji: color-keyed pixel matrices.
  const PIXEL_SPRITES={
    plant:['....GG....','..G.GG.G..','...GGGG...','..GGGGGG..','....GG....','....GG....','..OOOOOO..','..OooooO..','...OOOO...'],
    cactus:['...GGGG...','...G..G...','..GG..GG..','.GGG..G...','...G..G...','...GGGG...','..OOOOOO..','..OooooO..','...OOOO...'],
    lamp:['....yyyy..','...yyyyyy.','...ywwwwy.','....YYYY..','.....OO...','.....OO...','....OOOO..','..OOOOOO..'],
    books:['.rrr.bbb..','.rwr.bwb..','.rwr.bwb..','.rwr.bwb..','.rrr.bbb..','ooooggggoo','OOOOOOOOOO'],
    trophy:['...yyyy...','.yyyyyyyy.','yyYYYYYYyy','y.yYYYYy.y','..yYYYYy..','...YYYY...','....YY....','...yyyy...','..OOOOOO..'],
    coffee:['..ssssss..','..swwwws..','..swwwwsss','..swwwws.s','..ssssss.s','...ssssss.','..OOOOOO..'],
    clock:['..OOOOOO..','.OwwwwwwO.','OwwwwwwwwO','OwwwswwwwO','OwwwssswwO','OwwwwwwwwO','.OwwwwwwO.','..OOOOOO..'],
    bear:['..OO..OO..','.OooOOooO.','OooooooooO','OoOooooOoO','OoooOOoooO','.OooooooO.','..OOOOOO..','...OooO...'],
    painting:['OOOOOOOOOO','OwwwwwwwwO','OwbbbbbbbO','OwbbwwbbbO','OwbbGGbbbO','OwGGGGGGbO','OwgggggggO','OOOOOOOOOO'],
    rug:['...rrrr...','.rppppppr.','rppppppppr','rppwwwpppr','rppppppppr','.rppppppr.','...rrrr...'],
    bookshelf:['OOOOOOOOOO','OrrrrbbbbO','OyyyyggggO','OOOOOOOOOO','OrrrgggggO','OrrrgggggO','OOOOOOOOOO'],
    banner:['r..p..b..r','rrppppbbrr','.rrppbbr..','..rrbb....','...yy.....'],
    star:['....y.....','...yyy....','yyyyyyyyyy','..yyyyyy..','...yyyy...','...y..y...'],
    chair:['..bbbbbb..','.bwwwwwwb.','bwwwwwwwwb','bbbbbbbbbb','.bbbbbbbb.','..BBBBBB..','..B....B..'],
    fireplace:['OOOOOOOOOO','OooooooooO','Oooyyyyyoo','Oooyrrryoo','Ooorrrrooo','Ooosssssoo','OOOOOOOOOO'],
    blueprint:['bbbbbbbbbb','bwwwwwwwwb','bwbbbbbbwb','bwbwwbbwwb','bwbwbbbbwb','bwwwwwwwwb','bbbbbbbbbb'],
    cloud:['..wwwwww..','.wwwwwwww.','wwwwwwwwww','wwwwwwwwww','.bbbbbbbb.'],
    default:['..pppppp..','.pwwwwwwp.','pwwppppwwp','pwwppppwwp','.pwwwwwwp.','..pppppp..']
  };
  const PIXEL_COLORS={x:'#3b4159',w:'#fff4d8',g:'#68ad6b',G:'#36785e',y:'#fce07c',Y:'#cf9b3d',r:'#e7797a',b:'#629bc4',B:'#466a9a',o:'#c69a72',O:'#805b5c',p:'#eeb0b8',s:'#a0b2bf',l:'#b69bda'};
  const SPRITE_TYPES={goldplant:'plant',bonsai:'plant',pawframe:'painting',painting:'painting',certificate:'painting',clock:'clock',fairylight:'lamp',cloudlamp:'cloud',starmobile:'star',crown:'star',projectcup:'trophy',goldcup:'trophy',bookshelf:'bookshelf',reading:'books',blueprint:'blueprint',fireplace:'fireplace',cushion:'chair',banner:'banner',cactus:'cactus',rug:'rug',coffee:'coffee',bear:'bear',plant:'plant',lamp:'lamp',books:'books',trophy:'trophy'};
  let pixelObserver=null;
  let lastArtSignature='';
  function paintWorkspace(scene){
    const canvas=scene?.querySelector('[data-wdj-room-canvas]');
    if(!canvas||!scene.clientWidth||!scene.clientHeight)return;
    const width=300,height=Math.max(110,Math.round(width*scene.clientHeight/scene.clientWidth));
    const phase=resolvedPhase(),signature=[width,height,phase,JSON.stringify(data.items),edit,selected].join('|');
    if(canvas.width===width&&canvas.height===height&&lastArtSignature===signature)return;
    canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return;
    ctx.imageSmoothingEnabled=false;
    const p=PIXEL_PALETTES[phase]||PIXEL_PALETTES.day;
    const cw=width/10,ch=height/6;
    const fill=(color,x,y,w,h)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
    const cell=(x,y,w,h)=>[x*cw,y*ch,w*cw,h*ch];
    const rect=(color,x,y,w,h)=>fill(color,...cell(x,y,w,h));
    // Walls, paneling and parquet all share the 10 x 6 cell origin.
    fill(p.wall,0,0,width,height);
    fill(p.floor,0,ch*3.5,width,height-ch*3.5);
    for(let y=0;y<3.5;y+=.5){
      fill(y%1===0?p.wall2:p.wallShade,0,Math.floor(y*ch),width,1);
      for(let x=(Math.round(y*2)%2)*.5;x<10;x+=1.5)fill(p.wallShade,x*cw,Math.floor(y*ch),1,Math.min(ch*.5,8));
    }
    fill(p.line,0,ch*3.5-2,width,4);
    for(let y=3.75;y<6;y+=.7){
      fill(p.floor2,0,y*ch,width,2);
      for(let x=(Math.round(y*4)%2)*.75;x<10;x+=1.5)fill(p.line,x*cw,y*ch,2,ch*.7);
    }
    // A pixel-art window (cell-aligned, not % positioned independently).
    const wx=cw*1,wy=ch*.55,ww=cw*2.1,wh=ch*2.15;
    fill('#554b6c',wx-5,wy-5,ww+12,wh+12);
    fill('#f0d1a0',wx-3,wy-3,ww+6,wh+6);
    fill(p.sky,wx+3,wy+3,ww-6,wh-6);
    fill(p.sky2,wx+3,wy+wh*.53,ww-6,wh*.4);
    // Clouds or stars inside the window.
    if(phase==='night'){
      for(const [x,y] of [[.3,.3],[1.5,.6],[.9,1.3],[1.8,1.8]])fill('#fff7d7',wx+x*cw*.8,wy+y*ch*.8,2,2);
      fill('#e9e8bc',wx+ww*.65,wy+wh*.2,10,10);
    }else{
      fill('#f7f6df',wx+ww*.18,wy+wh*.25,ww*.25,5);
      fill('#f7f6df',wx+ww*.25,wy+wh*.22,ww*.15,5);
    }
    fill('#f0d1a0',wx+ww*.49,wy,5,wh);fill('#f0d1a0',wx,wy+wh*.5,ww,5);
    fill('#7b6782',wx-6,wy+wh+3,ww+15,4);
    // Wall print / small hanging shelf.
    const shx=cw*7.65,shy=ch*2.4;
    fill('#5d506e',shx,shy,cw*1.85,5);fill('#bf835e',shx,shy-4,cw*1.85,5);
    for(const [col,x,h] of [['#ef9789',.15,.28],['#91c9b1',.39,.4],['#e8ca84',.8,.3]])fill(col,shx+cw*x,shy-h*ch,cw*.2,h*ch);
    fill('#7b6276',shx+cw*.07,shy+5,cw*.15,8);fill('#7b6276',shx+cw*1.6,shy+5,cw*.15,8);
    // Pixel bed bottom-left, snapped to columns 1..3 / rows 4..5.
    const bx=cw*.85,by=ch*4.2;
    fill('#514760',bx-3,by-6,cw*2.65,ch*1.1+10);
    fill('#8a88ab',bx+2,by-2,cw*2.5,ch*.9);
    fill('#c5d3e5',bx+5,by+3,cw*2.35,ch*.76);
    fill('#fae5d2',bx+8,by+6,cw*.56,ch*.35);
    fill('#7d6d91',bx-4,by+ch*.84,cw*2.65,5);
    // Flat, pixel-edged rug aligned to cells 4..7, row 5.
    const rx=cw*3.9,ry=ch*5.15;
    fill('#6f647c',rx,ry,cw*3.1,ch*.55);
    fill('#dc9e99',rx+4,ry+3,cw*3.1-8,ch*.55-6);
    fill('#f4cfaf',rx+9,ry+6,cw*3.1-18,ch*.55-12);
    // Desk exactly on the same columns/rows as the editable grid.
    const dx=cw*4.05,dy=ch*3.30,dw=cw*2.75;
    fill('#644f62',dx-4,dy-1,dw+10,ch*.35+6);
    fill('#bd8665',dx,dy+2,dw,ch*.29);
    fill('#e3a879',dx,dy-3,dw,6);
    fill('#6f5661',dx+cw*.10,dy+ch*.29,8,ch*.95);
    fill('#6f5661',dx+dw-14,dy+ch*.29,8,ch*.95);
    fill('#c8916d',dx+cw*.1,dy+ch*.29,6,ch*.75);
    fill('#c8916d',dx+dw-12,dy+ch*.29,6,ch*.75);
    // Monitor and keyboard pixels.
    const mx=dx+cw*.87,my=dy-ch*.98;
    fill('#404966',mx-3,my-3,cw*1.1+6,ch*.88+6);
    fill(phase==='night'?'#6689bd':'#82c8d2',mx+2,my+2,cw*1.1-4,ch*.88-5);
    fill('#b2eff1',mx+7,my+7,cw*.55,3);
    fill('#4c5c7b',mx+cw*.5,my+ch*.88,cw*.13,ch*.2);
    fill('#474c68',mx+cw*.24,my+ch*1.04,cw*.65,4);
    fill('#f2e5c8',dx+cw*1,dy+2,cw*.9,2);
    // Pixel chair at columns 5..6, row 4.
    const cx=cw*5.04,cy=ch*4.36;
    fill('#4b5071',cx-4,cy-4,cw*.9,ch*1.25);
    fill('#758fbe',cx,cy,cw*.76,ch*.85);
    fill('#a3b7da',cx+5,cy+5,cw*.76-10,ch*.75);
    fill('#505578',cx-6,cy+ch*.78,cw*.95,ch*.26);
    // Render ALL user items at their exact grid positions.
    const makeSprite=(item)=>{
      const key=SPRITE_TYPES[item.id]||'default';
      const rows=PIXEL_SPRITES[key]||PIXEL_SPRITES.default;
      const step=Math.max(1,Math.floor(Math.min(cw*.82,ch*.78)/11));
      const size=step*10;
      const sx=(item.x+.5)*cw-size/2;
      const sy=(item.y+1)*ch-rows.length*step-Math.max(1,ch*.1);
      if(item.y<3){
        fill('#64546a',sx-3,(item.y+1)*ch-3,size+6,3);
        fill('#d29e72',sx-3,(item.y+1)*ch-5,size+6,3);
      }else{
        fill('#5b4b6266',sx+size*.2,(item.y+1)*ch-4,size*.65,3);
      }
      rows.forEach((line,iy)=>{for(let ix=0;ix<line.length;ix++){
        const color=PIXEL_COLORS[line[ix]];
        if(color)fill(color,sx+ix*step,sy+iy*step,step,step);
      }});
      if(edit&&selected===item.id){
        ctx.strokeStyle='#ffe590';ctx.lineWidth=2;
        ctx.strokeRect(Math.round(item.x*cw+1),Math.round(item.y*ch+1),Math.floor(cw-2),Math.floor(ch-2));
      }
    };
    data.items.forEach(makeSprite);
    scene.dataset.wdjPixelReady='yes';
    lastArtSignature=signature;
  }
  function attachPixelScene(scene){
    if(pixelObserver){pixelObserver.disconnect();pixelObserver=null;}
    lastArtSignature='';paintWorkspace(scene);
    if(typeof ResizeObserver!=='undefined'){
      pixelObserver=new ResizeObserver(()=>{if(scene.isConnected)paintWorkspace(scene);});
      pixelObserver.observe(scene);
    }
  }
  window.addEventListener('resize',()=>{const scene=document.querySelector('#wdjWorkspacePage .wdj-room-scene');if(scene&&activePage())paintWorkspace(scene);});

  function render(){
    const el=document.getElementById('wdjWorkspacePage');if(!el)return;
    const {list,active,equipped}=collection();
    const bond=friendship(active.id);
    const mood=currentMood();
    const phase=resolvedPhase();
    const ambienceButtons=[['auto','🕒'],['day','☀️'],['sunset','🌇'],['night','🌙']].map(([id,icon])=>
      `<button type="button" class="wdj-room-btn ${ambience.mode===id?'active':''}" data-wdj-ambience="${id}" aria-pressed="${ambience.mode===id}">${icon} ${esc(phaseName(id))}</button>`).join('');
    const weatherButtons=[['clear','🌤️'],['rain','🌧️'],['snow','❄️']].map(([id,icon])=>
      `<button type="button" class="wdj-room-btn ${ambience.weather===id?'active':''}" data-wdj-weather="${id}" aria-pressed="${ambience.weather===id}" title="${esc(txt('เอฟเฟกต์จำลอง ไม่ใช่ข้อมูลอากาศจริง','Visual effect; not live weather'))}">${icon} ${esc(weatherName(id))}</button>`).join('');
    const activeMilestone=latestMilestone(bond.activity);
    const petLabel=txt('เล่นกับ Mascot เพื่อให้ดีใจ','Interact with mascot to make it happy');
    const decor=decorCollection(bond.activity,bond);
    const unlockedCount=decor.filter(x=>x.unlocked).length;
    if(!decor.some(x=>x.item[0]===selected&&x.unlocked))selected='plant';
    const visibleDecor=decor.filter(({item})=>category==='all'||item[4]===category);
    const moodButtons=Object.entries(MOODS).filter(([id])=>!SPECIAL_LEVELS[id]).map(([id,meta])=>
      `<button type="button" class="wdj-life-mood-btn ${life.mood===id?'active':''}" data-wdj-life-mood="${id}" aria-pressed="${life.mood===id}"><span aria-hidden="true">${meta.icon}</span>${esc(en()?meta.en:meta.th)}</button>`
    ).join('');
    const specialButtons=Object.entries(SPECIAL_LEVELS).map(([id,need])=>{
      const meta=MOODS[id],unlocked=bond.level>=need;
      return `<button type="button" class="wdj-life-mood-btn wdj-bond-pose ${life.mood===id&&unlocked?'active':''}" data-wdj-life-mood="${id}" aria-pressed="${life.mood===id&&unlocked}" ${unlocked?'':'disabled'} title="${unlocked?esc(txt('ใช้ท่าทางนี้','Play this pose')):esc(txt(`ปลดล็อกที่เลเวล ${need}`,`Unlocks at Level ${need}`))}"><span aria-hidden="true">${unlocked?meta.icon:'🔒'}</span>${esc(en()?meta.en:meta.th)}<small>Lv. ${need}</small></button>`;
    }).join('');
    const mascotButtons=[
      `<button type="button" class="wdj-life-pick ${life.mascot==='equipped'?'active':''}" data-wdj-life-choice="equipped" aria-pressed="${life.mascot==='equipped'}"><span aria-hidden="true">${esc(equipped.icon||'🐣')}</span><strong>${txt('ตามที่ Equip','Use equipped')}</strong><small>${esc(equipped.name||'')}</small></button>`,
      ...list.map(m=>`<button type="button" class="wdj-life-pick ${life.mascot===m.id?'active':''}" data-wdj-life-choice="${esc(m.id)}" aria-pressed="${life.mascot===m.id}"><span aria-hidden="true">${esc(m.icon||'🐣')}</span><strong>${esc(m.name||m.id)}</strong>${m.id===equipped.id?`<small>${txt('กำลัง Equip','Equipped')}</small>`:''}</button>`)
    ].join('');
    const accessoryId=window.WorkdayRewards?.getEquippedAccessory?.();
    const accessory=accessoryId&&accessoryId!=='none'?window.WorkdayRewards?.getReward?.('accessory',accessoryId):null;
    const accent={chick:'#f7c948',cat:'#f0a35e',bear:'#b78560',bunny:'#ef88bd',ghost:'#9d8cff',hamster:'#bf7b4a',fox:'#f28a38',penguin:'#4678b8',dragon:'#8b64ef',developerChick:'#3b82f6'}[active.id]||'#f7c948';
    const moodTip=txt('อัตโนมัติจะเปลี่ยนท่าทางตามเวลาและกลางวัน/กลางคืน · กด Mascot เพื่อให้ดีใจชั่วคราว',
      'Auto reacts to local time and room lighting · tap your mascot for a happy moment');
    const categories=CATEGORIES.map(([id,th,enName])=>{
      const size=id==='all'?decor.length:decor.filter(({item})=>item[4]===id).length;
      return `<button type="button" class="wdj-decor-tab ${category===id?'active':''}" data-wdj-category="${id}" aria-pressed="${category===id}">${esc(en()?enName:th)} <span>${size}</span></button>`;
    }).join('');
    const furnitureCards=visibleDecor.map(({item,unlocked})=>{
      const [id,icon,th,enName]=item;
      const name=en()?enName:th;
      return `<button type="button" class="wdj-room-item wdj-decor-card ${edit&&selected===id?'active':''} ${unlocked?'':'locked'}" data-wdj-item="${esc(id)}" aria-pressed="${edit&&selected===id}" ${unlocked?'':'disabled'} title="${esc(unlocked?txt('เลือกและวางในห้อง','Choose and place in room'):decorRequirement(item))}">
        <span class="wdj-decor-icon" aria-hidden="true">${unlocked?icon:'🔒'}</span>
        <strong>${esc(name)}</strong><small>${esc(unlocked?txt('พร้อมวาง','Unlocked'):decorRequirement(item))}</small>
      </button>`;
    }).join('');
    // Pixel-art objects are painted directly into the same 10x6 canvas as the desk.
    // Keep the original item coordinates in localStorage unchanged. The old emoji
    // markup was intentionally removed so that scene objects never appear offset.
    const objectMarkup='';
    el.innerHTML=`<div class="wdj-room-wrap wdj-life-root wdj-decor-root">
      <header class="wdj-room-head"><div><div class="wdj-room-muted">WORKDAY JOURNEY · PIXEL ROOM UPDATE</div><h2>🏡 ${txt('ห้องทำงานของฉัน','My Virtual Workspace')}</h2><p class="wdj-room-muted">${txt('ห้องส่วนตัวที่เติบโตไปพร้อมกับ Journal, Project และ Mascot','A personal room that grows with your Journals, Projects and Mascot')}</p></div><span class="wdj-room-pill">🧰 ${unlockedCount}/${decor.length} ${txt('ปลดล็อก','unlocked')}</span></header>
      <div class="wdj-room-tools wdj-v874-toolbox"><div class="wdj-v874-toolgroup"><span class="wdj-v874-tool-label">🌤️ ${txt('แสงในห้อง','Room lighting')}</span><div class="wdj-v874-controls" role="group" aria-label="${txt('เลือกช่วงเวลาในห้อง','Room lighting')}">${ambienceButtons}</div></div><div class="wdj-v874-toolgroup"><span class="wdj-v874-tool-label">✨ ${txt('บรรยากาศ','Atmosphere')}</span><div class="wdj-v874-controls" role="group" aria-label="${txt('เลือกเอฟเฟกต์อากาศจำลอง','Select decorative weather effect')}">${weatherButtons}<button type="button" data-wdj-v874-fx class="wdj-room-btn ${ambience.effects?'active':''}" aria-pressed="${ambience.effects}">${ambience.effects?'✨ '+txt('เอฟเฟกต์เปิด','Effects on'):'◌ '+txt('เอฟเฟกต์ปิด','Effects off')}</button></div><small class="wdj-v874-hint">${txt('เอฟเฟกต์ตกแต่งเท่านั้น ไม่ใช่พยากรณ์อากาศ','Decorative effects only; not a weather forecast')}</small></div><div class="wdj-v874-tool-actions"><button type="button" class="wdj-room-btn ${edit?'active':''}" data-wdj-edit aria-pressed="${edit}">${edit?'✓ '+txt('เสร็จสิ้น','Done'):'✏️ '+txt('จัดห้อง','Decorate')}</button> <button type="button" class="wdj-room-btn wdj-room-reset" data-wdj-reset>↺ ${txt('คืนค่าห้อง','Reset room')}</button></div></div>
      <div class="wdj-life-layout">
        <div class="wdj-room-frame"><div class="wdj-room-scene ${phase==='night'?'night':''}" data-wdj-v874-phase="${phase}" data-wdj-v874-weather="${ambience.weather}" data-wdj-v874-fx="${ambience.effects?'on':'off'}" data-wdj-v874-event="${Date.now()<celebrationUntil?celebrationType:'none'}" data-wdj-mascot-mood="${mood}" data-wdj-friend-stage="${bond.stage}" role="group" aria-label="${esc(txt('ฉากห้อง Pixel Art เต็มความกว้าง','Full-width pixel art room scene'))}">
          <canvas class="wdj-room-pixel-canvas" data-wdj-room-canvas aria-hidden="true"></canvas><div class="wdj-v874-sky" aria-hidden="true"><span class="wdj-v874-sunmoon"></span><span class="wdj-v874-stars"></span></div><div class="wdj-v874-weather-layer" aria-hidden="true"></div><div class="wdj-v874-celebration" aria-hidden="true">✨ 🎉 ⭐ 🌟 🎉 ✨</div>
          <div class="wdj-room-window"></div><div class="wdj-room-shelf" aria-hidden="true"></div><div class="wdj-room-rug" aria-hidden="true"></div><div class="wdj-room-bed" aria-hidden="true"></div><div class="wdj-room-desk"><div class="wdj-room-screen"></div></div><div class="wdj-room-chair"></div>
          <button type="button" class="wdj-room-mascot wdj-life-mascot" data-wdj-life-pet data-wdj-mascot-id="${esc(active.id)}" style="--wdj-mascot-accent:${accent}" aria-label="${petLabel}" title="${petLabel}"><span class="wdj-life-ground" aria-hidden="true"></span><span class="wdj-life-character" aria-hidden="true"><span class="wdj-life-emoji">${esc(active.icon||'🐣')}</span>${accessory?.owned?`<span class="wdj-life-accessory">${esc(accessory.icon||'')}</span>`:''}</span><span class="wdj-life-fx" aria-hidden="true"></span><span class="wdj-life-work-keyboard" aria-hidden="true"><i></i><i></i><i></i></span><span class="wdj-bond-scene-badge" aria-hidden="true">${bond.level>=10?'👑':bond.level>=5?'🌟':bond.level>=3?'💗':''}</span></button>
          <div class="wdj-life-speech" aria-hidden="true" data-wdj-life-speech>${esc(moodCopy(mood))}</div>
          ${objectMarkup}
          ${edit?`<div class="wdj-room-edit-grid" aria-label="${txt('ตารางจัดวาง','Placement grid')}">${Array.from({length:60},(_,n)=>{const occupant=data.items.find(i=>i.x===n%10&&i.y===Math.floor(n/10));const itemName=CATALOG.find(x=>x[0]===occupant?.id);return `<button type="button" data-wdj-cell="${n}" data-wdj-cell-occupied="${occupant?'yes':'no'}" aria-label="${esc(occupant?txt('นำออก','Remove')+' '+(itemName?.[en()?3:2]||occupant.id):txt('วางของช่อง','Place item in cell')+' '+(n+1))}"></button>`;}).join('')}</div>`:''}
        </div><div class="wdj-scene-bar"><span>🐾 ${esc(active.name||active.id)} · Lv. ${bond.level} <span data-wdj-life-status>${MOODS[mood].icon} ${moodName(mood)}</span></span><span>🌤️ <span data-wdj-phase-status>${esc(phaseName(phase))}</span> · ${esc(weatherName(ambience.weather))} · 🪑 ${data.items.length}/24 ${txt('ชิ้น','items')}</span></div><div class="wdj-v874-milestone" role="status"><span aria-hidden="true">${activeMilestone?'🏆':'🌱'}</span><span data-wdj-v874-event-note>${esc(activeMilestone?activeMilestone.name:txt('บันทึก Journal หรือทำ Project ให้สำเร็จเพื่อเพิ่มความทรงจำในห้อง','Keep journaling or completing projects to create room memories'))}</span>${activeMilestone?`<button type="button" data-wdj-v874-celebrate class="wdj-v874-celebrate-btn">🎊 ${txt('ฉลอง','Celebrate')}</button>`:''}<span class="wdj-v874-milestone-tag">${txt('ความสำเร็จสะท้อนในห้อง','Progress in your room')}</span></div></div>
        <section class="wdj-room-furniture" aria-label="${txt('คลังของตกแต่ง','Decoration collection')}">
          <div class="wdj-decor-head"><div><strong>🎁 ${txt('Furniture & Decoration Collection','Furniture & Decoration Collection')}</strong><p class="wdj-room-muted">${txt('เลือกของด้านล่าง แล้วแตะช่องในห้องเพื่อวางหรือนำออก','Select an item below, then tap a room cell to place or remove it')}</p></div><span class="wdj-decor-count">${unlockedCount}/${decor.length} ${txt('ชิ้นที่ใช้ได้','available')}</span></div>
          <div class="wdj-decor-tabs" role="group" aria-label="${txt('หมวดหมู่ของตกแต่ง','Decoration categories')}">${categories}</div>
          <div class="wdj-room-items wdj-decor-grid">${furnitureCards}</div>
          <div class="wdj-decor-foot"><span class="wdj-room-tip">${txt('ของล็อกจะเปิดตามจำนวนวัน Journal, Project ที่สำเร็จ และเลเวลของ Mascot','Locked decor unlocks through Journal days, completed Projects and Mascot level')}</span><span class="wdj-room-status" role="status">${esc(message||txt('บันทึกเฉพาะเครื่องนี้ · ไม่หัก Coin','Device-only saving · no Coins spent'))}</span></div>
        </section>
        <div class="wdj-decor-section-heading"><strong>🐾 ${txt('Mascot & Friendship','Mascot & Friendship')}</strong><span class="wdj-room-muted">${txt('เลือกเพื่อนร่วมงานและท่าทางของคุณ','Choose your companion and mood')}</span></div>
        <div class="wdj-life-sidebar">
          <section class="wdj-life-panel wdj-life-identity"><div class="wdj-life-heading"><span>🐾 ${txt('เพื่อนร่วมงานตัวน้อย','Your little companion')}</span><span class="wdj-life-live">● LIVE</span></div><div class="wdj-life-profile"><span class="wdj-life-portrait" aria-hidden="true">${esc(active.icon||'🐣')}</span><div><strong>${esc(active.name||active.id)}</strong><small>❤️ Lv. ${bond.level} · ${esc(bond.stageName)}</small><span class="wdj-life-state" data-wdj-life-status>${MOODS[mood].icon} ${moodName(mood)}</span><small>${txt('แตะ Mascot ในห้องเพื่อทักทาย','Tap mascot in room to say hi')}</small></div></div></section>
          ${friendshipMarkup(bond)}
          <section class="wdj-life-panel"><div class="wdj-life-heading">🎭 ${txt('ท่าทางของ Mascot','Mascot actions')}</div><div class="wdj-life-moods" role="group" aria-label="${txt('เลือกท่าทาง Mascot','Choose mascot action')}">${moodButtons}</div><p class="wdj-life-hint">${moodTip}</p><div class="wdj-bond-heading">🔓 ${txt('ท่าทางตามเลเวล','Level unlocks')}</div><div class="wdj-life-moods wdj-bond-poses">${specialButtons}</div></section>
          <section class="wdj-life-panel"><div class="wdj-life-heading">🎁 ${txt('เลือก Mascot ที่มี','Owned mascots')}</div><div class="wdj-life-collection">${mascotButtons}</div><p class="wdj-life-hint">${txt('เลือกเฉพาะตัวที่ปลดล็อก · ไม่เปลี่ยนตัว Equip ในร้าน','Unlocked only · does not change Shop equipped mascot')}</p><a class="wdj-life-shop-link" href="#/rewards">${txt('เปิด Reward Shop','Open Reward Shop')} ↗</a></section>
        </div>
      </div>
    </div>`;
    updateSceneLive();
    attachPixelScene(el.querySelector('.wdj-room-scene'));
  }
  function focusAfterRender(kind,value){
    const root=document.getElementById('wdjWorkspacePage');if(!root)return;
    const target=[...root.querySelectorAll(`[${kind}]`)].find(n=>n.getAttribute(kind)===value);
    target?.focus?.({preventScroll:true});
  }
  document.addEventListener('click',e=>{
    const target=e.target instanceof Element?e.target.closest('[data-wdj-ambience],[data-wdj-weather],[data-wdj-v874-fx],[data-wdj-v874-celebrate],[data-wdj-edit],[data-wdj-reset],[data-wdj-item],[data-wdj-cell],[data-wdj-life-choice],[data-wdj-life-mood],[data-wdj-life-pet],[data-wdj-category]'):null;
    if(!target||!target.closest('#wdjWorkspacePage'))return;
    if(target.hasAttribute('data-wdj-life-pet')){
      const result=recordGreeting(collection().active.id);
      if(result.newDay){message=txt('ทักทายครั้งแรกวันนี้ +8 Friendship XP 💗','First greeting today +8 Friendship XP 💗');render();}
      else if(!result.saved){message=txt('บันทึก XP ไม่สำเร็จ กรุณาตรวจพื้นที่จัดเก็บ','Could not save XP. Check browser storage.');render();}
      petUntil=Date.now()+4200;
      clearTimeout(petTimer);
      updateMoodVisual();
      petTimer=setTimeout(()=>{petUntil=0;if(activePage())updateMoodVisual();},4250);
      return;
    }
    if(target.hasAttribute('data-wdj-life-choice')){
      const id=target.dataset.wdjLifeChoice;
      if(id!=='equipped'&&!collection().list.some(m=>m.id===id))return;
      life.mascot=id;
      if(!canUseMood(life.mood,collection().active.id))life.mood='auto';
      saveLife();render();focusAfterRender('data-wdj-life-choice',id);return;
    }
    if(target.hasAttribute('data-wdj-life-mood')){
      const id=target.dataset.wdjLifeMood;
      if(!Object.hasOwn(MOODS,id)||!canUseMood(id,collection().active.id))return;
      life.mood=id;petUntil=0;clearTimeout(petTimer);saveLife();render();focusAfterRender('data-wdj-life-mood',id);return;
    }
    if(target.hasAttribute('data-wdj-v874-celebrate')){
      const event=latestMilestone(appProgress());
      if(!event)return;
      celebrationType=event.type;
      celebrationUntil=Date.now()+5200;
      clearTimeout(celebrationTimer);
      updateSceneLive();
      celebrationTimer=setTimeout(()=>{celebrationUntil=0;if(activePage())updateSceneLive();},5250);
      return;
    }
    if(target.hasAttribute('data-wdj-ambience')){
      const next=target.dataset.wdjAmbience;
      if(!AMBIENCE_MODES.includes(next))return;
      ambience.mode=next;
      // Keep the original V8.7.0 day/night preference compatible, but do not
      // overwrite the room layout when Auto or Sunset is selected.
      if(next==='day'||next==='night'){data.theme=next;saveRoom();}
      saveAmbience();render();focusAfterRender('data-wdj-ambience',next);return;
    }
    if(target.hasAttribute('data-wdj-weather')){
      const next=target.dataset.wdjWeather;
      if(!WEATHER_MODES.includes(next))return;
      ambience.weather=next;saveAmbience();render();focusAfterRender('data-wdj-weather',next);return;
    }
    if(target.hasAttribute('data-wdj-v874-fx')){
      ambience.effects=!ambience.effects;saveAmbience();render();document.querySelector('#wdjWorkspacePage [data-wdj-v874-fx]')?.focus?.({preventScroll:true});return;
    }
    if(target.hasAttribute('data-wdj-edit')){edit=!edit;render();document.querySelector('#wdjWorkspacePage [data-wdj-edit]')?.focus?.({preventScroll:true});return;}
    if(target.hasAttribute('data-wdj-category')){
      const next=target.dataset.wdjCategory;
      if(!CATEGORIES.some(x=>x[0]===next))return;
      category=next;render();focusAfterRender('data-wdj-category',next);return;
    }
    if(target.hasAttribute('data-wdj-item')){
      const id=target.dataset.wdjItem;
      const item=CATALOG.find(c=>c[0]===id);
      if(!item||!decorUnlocked(item,appProgress(),friendship(collection().active.id)))return;
      selected=id;edit=true;render();focusAfterRender('data-wdj-item',selected);return;
    }
    if(target.hasAttribute('data-wdj-reset')){
      if(!window.confirm(txt('คืนค่าตำแหน่งของตกแต่งทั้งหมดในเครื่องนี้? การตั้งค่า Mascot จะยังอยู่','Reset decorations on this device? Mascot preferences will remain')))return;
      data=clone(DEFAULT);saveRoom();render();document.querySelector('#wdjWorkspacePage [data-wdj-reset]')?.focus?.({preventScroll:true});return;
    }
    if(target.hasAttribute('data-wdj-cell')&&edit){
      const n=Number(target.dataset.wdjCell),x=n%10,y=Math.floor(n/10);
      const old=data.items.findIndex(i=>i.x===x&&i.y===y);
      if(old>=0)data.items.splice(old,1);
      else if(data.items.length<24&&CATALOG.some(c=>c[0]===selected)&&decorUnlocked(CATALOG.find(c=>c[0]===selected),appProgress(),friendship(collection().active.id)))data.items.push({id:selected,x,y});
      else{message=txt('ไม่สามารถวางของชิ้นนี้ได้ หรือห้องเต็ม 24 ชิ้น','Item locked or room has reached 24 decorations');render();return;}
      saveRoom();render();focusAfterRender('data-wdj-cell',String(n));
    }
  });
  // Never poll Cloud or write a transaction. Only refresh the lightweight animation
  // when the workspace is on screen and local time might change its auto mood.
  setInterval(()=>{if(activePage()){updateSceneLive();}},60000);
  window.addEventListener('storage',e=>{
    if(![ROOM_KEY,LIFE_KEY,BOND_KEY,AMBIENCE_KEY,'wp-v81-equipped-mascot','wp-v81-owned-rewards','wp-v82-mascot-xp','wp-v6-journal','wp-v6-projects'].includes(e.key))return;
    if(e.key===ROOM_KEY)data=loadRoom();
    if(e.key===LIFE_KEY)life=loadLife();
    if(e.key===AMBIENCE_KEY)ambience=loadAmbience();
    if(activePage()){render();detectMilestone();}
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden||!activePage())return;
    data=loadRoom();life=loadLife();ambience=loadAmbience();render();detectMilestone();
  });
  // Same-tab account/equipment updates do not emit the native storage event.
  // These existing application signals let the room refresh safely after login
  // and when verified Shop ownership arrives from the account.
  ['workday:v8-cloud-ready','workday:v8-auth-state','workday:v8-data-changed','workday:v7-data-changed'].forEach(eventName=>{
    window.addEventListener(eventName,()=>{if(activePage()){detectMilestone();render();}});
  });
  window.WorkdayWorkspace={render:()=>{render();detectMilestone();},version:'8.7.6',getFriendship:id=>friendship(String(id||collection().active.id))};
  if(location.hash.replace(/^#\/?/,'').split('?')[0]==='workspace')queueMicrotask(()=>window.WorkdayWorkspace.render());
})();


/* ===== V8.7.6: Focus Studio - local-only, account-scoped productivity timer ===== */
(() => {
  'use strict';
  const ROOT_ID='wdjFocusPage';
  const STATE_PREFIX='wdj-v875-focus-state-v1:';
  const LOG_PREFIX='wdj-v875-focus-history-v1:';
  const PRESETS={pomodoro:{focus:25*60,break:5*60},deep:{focus:50*60,break:10*60}};
  const $=(id)=>document.getElementById(id);
  const safe=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const th=()=>localStorage.getItem('wp-language')!=='en';
  const tr=(a,b)=>th()?a:b;
  const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fallback;}catch{return fallback;}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
  const dateKey=(ms)=>{const d=new Date(ms);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  const formatClock=(seconds)=>{const n=Math.max(0,Math.ceil(seconds));return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;};
  const formatMins=(mins)=>{const m=Math.max(0,Math.round(mins));return m>=60?`${Math.floor(m/60)}h ${m%60}m`:`${m}m`;};
  const uid=()=>window.WorkdayV8Cloud?.getUser?.()?.id||'guest';
  // One browser can contain several signed-in accounts. No wp-* keys are used,
  // preventing this cosmetic feature from joining the existing generic cloud sync.
  const account=()=>String(uid()).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,90)||'guest';
  let scope='';let state=null;let history=[];
  const fresh=()=>({version:1,preset:'pomodoro',projectId:'',session:null,pendingBreak:false});
  const projectList=()=>{
    const list=read('wp-v6-projects',[]);
    return Array.isArray(list)?list.filter(x=>x&&typeof x==='object').slice(0,150).map(x=>({id:String(x.id||''),name:String(x.name||x.title||x.projectName||'').slice(0,130)})).filter(x=>x.id&&x.name):[];
  };
  function ensureScope(){
    const next=account();if(next===scope&&state)return;
    scope=next;const raw=read(STATE_PREFIX+scope,fresh());
    state=raw&&typeof raw==='object'?{...fresh(),...raw}:fresh();
    if(!PRESETS[state.preset])state.preset='pomodoro';
    const s=state.session;
    if(!s||!['running','paused'].includes(s.status)||!['focus','break'].includes(s.kind)||!Number.isFinite(s.durationSec)||s.durationSec<60||s.durationSec>10800){state.session=null;}
    history=read(LOG_PREFIX+scope,[]);
    if(!Array.isArray(history))history=[];
    history=history.filter(x=>x&&typeof x==='object'&&typeof x.id==='string'&&Number.isFinite(x.seconds)&&x.seconds>0).slice(0,240);
  }
  function saveState(){write(STATE_PREFIX+scope,state);}
  function saveHistory(){write(LOG_PREFIX+scope,history.slice(0,240));}
  const secLeft=()=>{
    const s=state?.session;if(!s)return PRESETS[state?.preset||'pomodoro'].focus;
    return s.status==='paused'?Math.max(0,s.remainingSec):Math.max(0,Math.ceil((s.endsAt-Date.now())/1000));
  };
  function celebrate(){
    const box=$('wdjFocusCompleteNotice');if(box){box.textContent=tr('🎉 Focus Session สำเร็จแล้ว! เก็บไว้ในประวัติของเครื่องนี้','🎉 Focus session completed! Saved in this browser.');box.hidden=false;}
  }
  function finishIfDue(){
    ensureScope();const s=state.session;
    if(!s||s.status!=='running'||Date.now()<s.endsAt)return false;
    if(s.kind==='focus'){
      if(!history.some(x=>x.id===s.id)){
        history.unshift({id:s.id,preset:s.preset,seconds:s.durationSec,projectId:s.projectId||'',projectName:s.projectName||'',completedAt:s.endsAt});
        history=history.slice(0,240);saveHistory();
      }
      state.pendingBreak=true;
    }else state.pendingBreak=false;
    state.session=null;saveState();
    if(document.body.dataset.v7Route==='focus'){render();if(s.kind==='focus')celebrate();}
    return true;
  }
  function newSession(kind){
    ensureScope();finishIfDue();if(state.session)return;
    const now=Date.now(),preset=state.preset;
    const proj=projectList().find(x=>x.id===state.projectId);
    const duration=PRESETS[preset][kind];
    state.session={id:`${now}-${Math.random().toString(36).slice(2,12)}`,kind,preset,durationSec:duration,remainingSec:duration,startedAt:now,endsAt:now+duration*1000,status:'running',projectId:kind==='focus'?(proj?.id||''):'',projectName:kind==='focus'?(proj?.name||''):''};
    state.pendingBreak=false;
    saveState();render();
  }
  function pauseResume(){
    ensureScope();finishIfDue();const s=state.session;if(!s)return;
    if(s.status==='running'){
      s.remainingSec=Math.max(0,Math.ceil((s.endsAt-Date.now())/1000));s.status='paused';s.endsAt=null;
    }else{s.status='running';s.endsAt=Date.now()+s.remainingSec*1000;}
    saveState();render();
  }
  function stopSession(){
    ensureScope();const s=state.session;if(!s)return;
    const msg=tr('หยุด Session นี้โดยไม่บันทึกเป็น Session สำเร็จใช่ไหม?','Stop this session without recording a completion?');
    if(!window.confirm(msg))return;
    state.session=null;saveState();render();
  }
  function setPreset(preset){ensureScope();finishIfDue();if(!PRESETS[preset]||state.session)return;state.preset=preset;state.pendingBreak=false;saveState();render();}
  function setProject(id){ensureScope();if(state.session)return;state.projectId=projectList().some(x=>x.id===id)?id:'';saveState();}
  function stats(){
    const today=dateKey(Date.now());const cutoff=Date.now()-7*86400000;
    const focus=history.filter(x=>x?.seconds>0);
    return {today:focus.filter(x=>dateKey(x.completedAt)===today),weekly:focus.filter(x=>x.completedAt>=cutoff),all:focus};
  }
  function stamp(ms){try{return new Intl.DateTimeFormat(th()?'th-TH':'en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(ms));}catch{return '';}}
  function projectOptions(){return projectList().map(p=>`<option value="${safe(p.id)}" ${p.id===state.projectId?'selected':''}>${safe(p.name)}</option>`).join('');}
  function view(){
    const s=state.session;
    const preset=state.preset,sessionType=s?.kind||'focus';
    const secs=s?secLeft():PRESETS[preset].focus;
    const total=s?s.durationSec:PRESETS[preset].focus;
    const progress=Math.max(0,Math.min(100,((total-secs)/total)*100));
    const data=stats();const daily=data.today.reduce((n,x)=>n+x.seconds,0)/60;const weekly=data.weekly.reduce((n,x)=>n+x.seconds,0)/60;const overall=data.all.reduce((n,x)=>n+x.seconds,0)/60;
    const status=s?(s.status==='paused'?tr('หยุดพักชั่วคราว','Paused'):s.kind==='break'?tr('พักสายตา','Short break'):tr('กำลังโฟกัส','Focus in progress')):tr('พร้อมเริ่ม Session','Ready when you are');
    const last=data.all.slice(0,12);
    return `<div class="wdj-focus-page">
      <div class="wdj-focus-heading"><div class="wdj-focus-heading-icon">⏱️</div><div><span class="wdj-focus-eyebrow">FOCUS STUDIO · V8.7</span><h2>Focus Studio</h2><p>${tr('พื้นที่โฟกัสงานของคุณ · จับเวลา ทำงาน และติดตามความสม่ำเสมอ','Your place to focus, stay productive and reflect on completed sessions')}</p></div><span class="wdj-focus-local">🔒 ${tr('บันทึกในเครื่อง','On this device')}</span></div>
      <div class="wdj-focus-layout">
        <section class="wdj-focus-player" aria-label="${tr('นาฬิกาจับเวลาโฟกัส','Focus timer')}">
          <div class="wdj-focus-topline"><span class="wdj-focus-kicker">✦ ${tr('เวลาของคุณมีค่า','MAKE YOUR TIME COUNT')}</span><span class="wdj-focus-status" data-focus-status>${status}</span></div>
          <div class="wdj-focus-presets" role="group" aria-label="${tr('เลือกโหมด','Choose focus mode')}">
            <button type="button" data-focus-preset="pomodoro" ${s?'disabled':''} class="${preset==='pomodoro'?'active':''}">🍅 Pomodoro <small>25 / 5 ${tr('นาที','min')}</small></button>
            <button type="button" data-focus-preset="deep" ${s?'disabled':''} class="${preset==='deep'?'active':''}">🌌 Deep Work <small>50 / 10 ${tr('นาที','min')}</small></button>
          </div>
          <div class="wdj-focus-timer-wrap"><div class="wdj-focus-ring" data-focus-ring style="--focus-progress:${progress.toFixed(2)}%"><div class="wdj-focus-ring-inner"><div class="wdj-focus-ring-icon">${sessionType==='break'?'☕':preset==='deep'?'🌌':'🍅'}</div><div class="wdj-focus-time" data-focus-timer role="timer" aria-live="off">${formatClock(secs)}</div><div class="wdj-focus-time-caption" data-focus-time-caption>${sessionType==='break'?tr('ช่วงเวลาพัก','Break time'):preset==='deep'?tr('ทำงานแบบลึก','Deep focus'):tr('ช่วงเวลาโฟกัส','Focus time')}</div></div></div></div>
          <div class="wdj-focus-controls">${s?`<button type="button" class="wdj-focus-primary" data-focus-action="pause">${s.status==='running'?`⏸ ${tr('พักชั่วคราว','Pause')}`:`▶ ${tr('ทำต่อ','Resume')}`}</button><button type="button" class="wdj-focus-secondary" data-focus-action="stop">⏹ ${tr('ยกเลิก Session','Discard session')}</button>`:`<button type="button" class="wdj-focus-primary" data-focus-action="start">▶ ${tr('เริ่มโฟกัส','Start focusing')}</button>${state.pendingBreak?`<button type="button" class="wdj-focus-secondary" data-focus-action="break">☕ ${tr('เริ่มพัก','Take a break')} ${PRESETS[preset].break/60} ${tr('นาที','min')}</button>`:''}`}</div>
          <div id="wdjFocusCompleteNotice" class="wdj-focus-complete" hidden role="status"></div>
          <p class="wdj-focus-footnote">${tr('เปลี่ยนหน้าได้ Timer ยังเดินต่อ · การจบ Session จึงจะเพิ่มประวัติ ไม่เพิ่ม Coin หรือ XP','You can navigate away while the timer runs · Completed sessions add history only, not Coins or XP.')}</p>
        </section>
        <aside class="wdj-focus-side"><section class="wdj-focus-panel"><div class="wdj-focus-panel-heading"><span>🗂️</span><div><strong>${tr('โฟกัสกับ Project','Focus on a project')}</strong><small>${tr('เลือกงานที่กำลังทำได้','Link your session to an existing project')}</small></div></div>
          <label for="wdjFocusProject">${tr('Project ที่เกี่ยวข้อง','Related project')}</label><select id="wdjFocusProject" ${s?'disabled':''}><option value="">${tr('ไม่ระบุ Project','No project selected')}</option>${projectOptions()}</select>
          <p>${s&&s.kind==='focus'?safe(s.projectName||tr('โฟกัสโดยไม่ระบุ Project','General focus')):tr('อ่านรายชื่อจาก Project Tracker เท่านั้น ไม่แก้ข้อมูล Project','Uses Project Tracker names without changing projects.')}</p>
          </section>
          <section class="wdj-focus-panel wdj-focus-tips"><div class="wdj-focus-panel-heading"><span>🌿</span><div><strong>${tr('เคล็ดลับการโฟกัส','Focus ritual')}</strong><small>${preset==='deep'?'Deep Work':'Pomodoro'}</small></div></div><p>${preset==='deep'?tr('ปิดสิ่งรบกวนและทำงานสำคัญเพียงเรื่องเดียวเป็นเวลา 50 นาที','Block distractions and focus on one high-priority task for 50 minutes.'):tr('เลือกงานหนึ่งอย่าง ทำต่อเนื่อง 25 นาที แล้วพัก 5 นาที','Choose one task, focus for 25 minutes, then take a 5-minute break.')}</p><div class="wdj-focus-tip-tags"><span>🔕 ${tr('ลดสิ่งรบกวน','Quiet mode')}</span><span>💧 ${tr('ดื่มน้ำ','Hydrate')}</span></div></section>
        </aside>
      </div>
      <div class="wdj-focus-section-title"><div><span class="wdj-focus-eyebrow">YOUR FOCUS</span><h3>📊 ${tr('สรุปเวลาโฟกัส','Focus overview')}</h3></div><small>${tr('นับเฉพาะ Session ที่สำเร็จแล้ว','Completed sessions only')}</small></div>
      <div class="wdj-focus-stat-grid"><article><span>☀️ ${tr('วันนี้','Today')}</span><strong>${formatMins(daily)}</strong><small>${data.today.length} ${tr('Session','sessions')}</small></article><article><span>📅 ${tr('7 วันที่ผ่านมา','Last 7 days')}</span><strong>${formatMins(weekly)}</strong><small>${data.weekly.length} ${tr('Session','sessions')}</small></article><article><span>🏆 ${tr('เวลารวม','All-time focus')}</span><strong>${formatMins(overall)}</strong><small>${data.all.length} ${tr('Session','sessions')}</small></article></div>
      <section class="wdj-focus-history"><div class="wdj-focus-section-title"><div><span class="wdj-focus-eyebrow">FOCUS JOURNAL</span><h3>📚 ${tr('ประวัติ Session','Session history')}</h3></div><small>${tr('เก็บใน Browser นี้ สูงสุด 240 รายการ','Stored locally · up to 240 entries')}</small></div>${last.length?`<div class="wdj-focus-history-list">${last.map(x=>`<div class="wdj-focus-history-row"><span class="wdj-focus-history-icon">${x.preset==='deep'?'🌌':'🍅'}</span><div><strong>${x.preset==='deep'?'Deep Work':'Pomodoro'} · ${Math.round(x.seconds/60)} ${tr('นาที','min')}</strong><small>${safe(x.projectName||tr('ไม่ได้ระบุ Project','General focus'))}</small></div><time>${safe(stamp(x.completedAt))}</time></div>`).join('')}</div>`:`<div class="wdj-focus-empty"><div>🌱</div><strong>${tr('ยังไม่มี Session ที่ทำสำเร็จ','No completed sessions yet')}</strong><p>${tr('เริ่มโฟกัส Session แรก แล้วสถิติจะปรากฏที่นี่','Complete your first focus session to start building a record.')}</p></div>`}</section>
    </div>`;
  }
  function updateLive(){
    if(document.body.dataset.v7Route!=='focus')return;
    const root=$(ROOT_ID);if(!root)return;
    const sec=secLeft(),s=state.session,total=s?s.durationSec:PRESETS[state.preset].focus;
    const timer=root.querySelector('[data-focus-timer]');if(timer)timer.textContent=formatClock(sec);
    const ring=root.querySelector('[data-focus-ring]');if(ring)ring.style.setProperty('--focus-progress',`${Math.min(100,Math.max(0,100*(total-sec)/total))}%`);
    document.title=`${state.session?formatClock(sec)+' · ':''}Workday Journey`;
  }
  function render(){
    ensureScope();if(finishIfDue())return;
    const root=$(ROOT_ID);if(!root)return;
    root.innerHTML=view();updateLive();
  }
  document.addEventListener('click',e=>{
    const btn=e.target.closest?.('#wdjFocusPage [data-focus-action], #wdjFocusPage [data-focus-preset]');if(!btn)return;
    e.preventDefault();
    if(btn.dataset.focusPreset){setPreset(btn.dataset.focusPreset);return;}
    switch(btn.dataset.focusAction){case 'start':newSession('focus');break;case 'break':newSession('break');break;case 'pause':pauseResume();break;case 'stop':stopSession();break;}
  });
  document.addEventListener('change',e=>{if(e.target?.id==='wdjFocusProject')setProject(e.target.value);});
  window.addEventListener('storage',e=>{if(e.key&&e.key.startsWith('wdj-v875-focus-')){scope='';ensureScope();if(document.body.dataset.v7Route==='focus')render();}});
  ['workday:v8-auth-state','workday:v8-cloud-ready'].forEach(ev=>window.addEventListener(ev,()=>{scope='';ensureScope();if(document.body.dataset.v7Route==='focus')render();}));
  window.addEventListener('hashchange',()=>{ensureScope();finishIfDue();if(document.body.dataset.v7Route==='focus')updateLive();});
  document.addEventListener('visibilitychange',()=>{ensureScope();if(!document.hidden){if(!finishIfDue())updateLive();}});
  // Wall-clock deadlines avoid timer drift in background tabs. No network polling.
  setInterval(()=>{ensureScope();if(!finishIfDue())updateLive();},1000);
  window.WorkdayFocus={render,getSnapshot:()=>{ensureScope();return {account:scope,active:!!state.session,completed:history.length};}};
  ensureScope();finishIfDue();
  if(location.hash.replace(/^#\/?/,'').split('?')[0]==='focus')queueMicrotask(render);
})();


/* ===== V8.7.6: Skill Tree & Career Growth (cosmetic, local-only preferences) ===== */
(() => {
  'use strict';
  const ROOT='wdjSkillTreePage', PREF='wdj-v876-skill-tree-preference-v1:';
  const $=id=>document.getElementById(id);
  const locale=()=>localStorage.getItem('wp-language')==='en'?'en':'th';
  const tr=(th,en)=>locale()==='en'?en:th;
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const json=(key,fallback)=>{try{const raw=JSON.parse(localStorage.getItem(key)||'null');return raw??fallback;}catch{return fallback;}};
  const nowAccount=()=>String(window.WorkdayV8Cloud?.getUser?.()?.id||'guest').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,90)||'guest';
  const SKILLS=[
    {id:'coding',icon:'💻',th:'Coding & Development',en:'Coding & Development',descTh:'Frontend, Backend, JavaScript และการพัฒนาเว็บ',descEn:'Frontend, backend, JavaScript and web development',tags:['coding','code','program','javascript','typescript','react','vue','next.js','vite','node','express','html','css','frontend','backend','php','python','api','software','เว็บ','เขียนโค้ด','โปรแกรม','พัฒนาเว็บไซต์','พัฒนาระบบ','โค้ด','ฟังก์ชัน'],tone:'blue'},
    {id:'database',icon:'🗄️',th:'Database & Data',en:'Database & Data',descTh:'SQL, ข้อมูล, ระบบจัดเก็บ และการเชื่อมต่อ',descEn:'SQL, data models, storage and integration',tags:['database','sql','query','dbeaver','supabase','postgres','mysql','mssql','data model','etl','schema','table','data warehouse','ฐานข้อมูล','ดึงข้อมูล','จัดการข้อมูล','ตารางข้อมูล','คลังข้อมูล'],tone:'teal'},
    {id:'design',icon:'🎨',th:'UX/UI Design',en:'UX/UI Design',descTh:'ออกแบบหน้าจอ การใช้งาน และระบบดีไซน์',descEn:'Interface design, usability and design systems',tags:['ui','ux','design','layout','figma','tailwind','responsive','wireframe','prototype','user experience','user interface','accessibility','ออกแบบ','เลย์เอาต์','หน้าตา','ประสบการณ์ผู้ใช้','ดีไซน์','ตกแต่งหน้า'],tone:'purple'},
    {id:'analytics',icon:'📊',th:'Power BI & Analytics',en:'Power BI & Analytics',descTh:'Dashboard, DAX, รายงานและการวิเคราะห์',descEn:'Dashboards, DAX, reporting and analytics',tags:['power bi','powerbi','dax','analytics','dashboard','visualization','measure','chart','graph','insight','report','kpi','กราฟ','รายงาน','วิเคราะห์','แดชบอร์ด','สรุปข้อมูล','ตัวชี้วัด'],tone:'amber'},
    {id:'communication',icon:'🗣️',th:'Communication',en:'Communication',descTh:'Presentation, Documentation และการสื่อสาร',descEn:'Presentations, documentation and collaboration',tags:['presentation','present','meeting','training','trainer','manual','document','guide','english','communication','team','mentor','handover','review','ประชุม','พรีเซนต์','นำเสนอ','คู่มือ','สอน','อธิบาย','ภาษาอังกฤษ','สื่อสาร','เอกสาร','พูดคุย'],tone:'pink'},
    {id:'problem',icon:'🧩',th:'Problem Solving',en:'Problem Solving',descTh:'Debug, Test, ปรับปรุงและแก้ปัญหา',descEn:'Debugging, testing, improvements and troubleshooting',tags:['debug','fix','bug','troubleshoot','issue','error','test','testing','optimize','refactor','security','performance','root cause','resolve','แก้ไข','ทดสอบ','ตรวจสอบ','ปัญหา','ปรับปรุง','ข้อผิดพลาด','เพิ่มประสิทธิภาพ'],tone:'green'}
  ];
  const LEVEL_STEPS=[0,60,160,320,540,830,1190,1620,2120,2700,3350];
  const MAX_LEVEL=10;
  const levelFor=xp=>{let level=1;for(let i=1;i<LEVEL_STEPS.length;i++){if(xp>=LEVEL_STEPS[i])level=i+1;}return Math.min(MAX_LEVEL,level);};
  const progressFor=xp=>{const level=levelFor(xp);if(level>=MAX_LEVEL)return {level,percent:100,current:xp,next:xp,delta:0};const low=LEVEL_STEPS[level-1],high=LEVEL_STEPS[level];return {level,percent:Math.max(0,Math.min(100,100*(xp-low)/(high-low))),current:xp-low,next:high-low,delta:high-xp};};
  const localizedDate=x=>{const n=Date.parse(x);return Number.isFinite(n)?new Intl.DateTimeFormat(locale()==='th'?'th-TH':'en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(n)):'';};
  const tagged=text=>{
    const words=String(text||'').toLowerCase();
    const rated=SKILLS.map(skill=>({id:skill.id,score:skill.tags.reduce((sum,tag)=>sum+(tag.length<4&&/^[a-z]+$/.test(tag)?new RegExp('(^|[^a-z])'+tag.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'($|[^a-z])','i').test(words):words.includes(tag)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
    return rated.slice(0,3).map(x=>x.id);
  };
  let scope='',selected='coding',history=[];
  function ensureScope(){const account=nowAccount();if(scope===account)return;scope=account;const saved=json(PREF+scope,{});selected=SKILLS.some(x=>x.id===saved?.selected)?saved.selected:'coding';}
  function savePreference(){try{localStorage.setItem(PREF+scope,JSON.stringify({selected}));}catch{}}
  function collect(){
    const totals=Object.fromEntries(SKILLS.map(x=>[x.id,{xp:0,journals:0,projects:0,focus:0,evidence:[]}]));
    const journals=json('wp-v6-journal',{});
    if(journals&&typeof journals==='object'&&!Array.isArray(journals)){
      Object.entries(journals).slice(0,1200).forEach(([day,j])=>{
        if(!j||typeof j!=='object')return;
        const body=[j.work,j.learned].map(x=>String(x||'').trim()).join(' ');
        if(body.trim().length<10)return;
        tagged(body).forEach(id=>{const item=totals[id];item.xp+=15;item.journals++;item.evidence.push({type:'journal',th:'Journal',en:'Journal',name:day,date:day});});
      });
    }
    const projects=json('wp-v6-projects',[]);
    const projectMap=new Map();
    if(Array.isArray(projects))projects.slice(0,400).forEach(p=>{
      if(!p||typeof p!=='object')return;
      const ids=tagged([p.name,p.title,p.category,p.description].filter(Boolean).join(' '));
      if(p.id)projectMap.set(String(p.id),ids);
      const completed=p.status==='completed'||Number(p.progress)>=100;
      const progress=Math.max(0,Math.min(100,Number(p.progress)||0));
      // Derived, never awarded or accumulated on Save. Decreasing progress decreases derived XP.
      const points=10+Math.floor(progress/25)*10+(completed?50:0);
      ids.forEach(id=>{const item=totals[id];item.xp+=points;item.projects++;item.evidence.push({type:'project',th:completed?'Project สำเร็จ':'Project',en:completed?'Completed project':'Project',name:String(p.name||p.title||'Project').slice(0,90),date:String(p.updatedAt||p.createdAt||'')});});
    });
    const focus=json('wdj-v875-focus-history-v1:'+scope,[]);
    if(Array.isArray(focus)){
      // Only linked sessions count; no unlinked time is assigned to an arbitrary skill.
      focus.slice(0,240).forEach(f=>{
        if(!f||!Number.isFinite(f.seconds)||f.seconds<60||!f.projectId)return;
        const ids=projectMap.get(String(f.projectId))||tagged(f.projectName||'');
        const points=Math.min(20,Math.floor(f.seconds/1500)*5);
        if(!points)return;
        ids.forEach(id=>{const item=totals[id];item.xp+=points;item.focus++;item.evidence.push({type:'focus',th:'Focus Session',en:'Focus session',name:String(f.projectName||'Project').slice(0,90),date:Number.isFinite(Number(f.completedAt))?new Date(Number(f.completedAt)).toISOString():''});});
      });
    }
    return totals;
  }
  const milestone=(level)=>level>=10?['🌟','Master','ผู้เชี่ยวชาญ']:level>=7?['💎','Expert','ระดับสูง']:level>=5?['🏅','Pro','ชำนาญ']:level>=3?['🌱','Growing','กำลังเติบโต']:['🔰','Learner','เริ่มต้น'];
  function render(){
    ensureScope();const root=$(ROOT);if(!root)return;
    const totals=collect(),current=totals[selected]||totals.coding,chosen=SKILLS.find(x=>x.id===selected)||SKILLS[0];
    const sum=SKILLS.reduce((n,s)=>n+totals[s.id].xp,0),levels=SKILLS.reduce((n,s)=>n+levelFor(totals[s.id].xp),0),started=SKILLS.filter(s=>totals[s.id].xp>0).length;
    const summary=SKILLS.map(s=>({s,data:totals[s.id],p:progressFor(totals[s.id].xp)}));
    const prog=progressFor(current.xp),stage=milestone(prog.level);
    const orderedEvidence=[...current.evidence].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).slice(0,8);
    root.innerHTML=`<div class="wdj-skill-page">
      <section class="wdj-skill-hero"><div class="wdj-skill-hero-copy"><div class="wdj-skill-eyebrow">🌳 CAREER GROWTH · V8.7</div><h2>${tr('ต้นไม้ทักษะของฉัน','My Skill Tree')}</h2><p>${tr('เห็นเส้นทางการเติบโตจาก Journal, Projects และ Focus Studio ในพื้นที่เดียว','Explore your career growth through journals, projects and completed focus sessions.')}</p><span class="wdj-skill-local">🔒 ${tr('คะแนนประเมินเพื่อสะท้อนความก้าวหน้า · ไม่ใช่การรับรองทักษะ','Indicative growth points · not a skills certification')}</span></div><div class="wdj-skill-hero-art" aria-hidden="true">🌱<span>✦</span></div></section>
      <section class="wdj-skill-kpis" aria-label="${tr('สรุปทักษะ','Skill overview')}"><div><span>${tr('Growth XP รวม','Total growth XP')}</span><strong>${sum.toLocaleString()}</strong><small>${tr('คำนวณจากข้อมูลที่มี','Derived from existing activity')}</small></div><div><span>${tr('สายทักษะที่เริ่มเติบโต','Active skill paths')}</span><strong>${started} / 6</strong><small>${tr('จากทั้งหมด 6 สาย','of six career tracks')}</small></div><div><span>${tr('เลเวลรวม','Combined levels')}</span><strong>${levels}</strong><small>${tr('แต่ละสายเริ่มที่ Lv.1','Each track starts at Lv.1')}</small></div></section>
      <div class="wdj-skill-section-title"><div><span class="wdj-skill-eyebrow">YOUR CAREER MAP</span><h3>${tr('เลือกสายทักษะบนแผนผัง','Explore your skill branches')}</h3></div><span>${tr('แตะเพื่อดู XP และหลักฐาน','Choose a node for details')}</span></div>
      <section class="wdj-skill-map" aria-label="${tr('แผนผังทักษะ','Skill tree')}"><div class="wdj-skill-trunk" aria-hidden="true"><span>✨</span><strong>${tr('MY GROWTH','MY GROWTH')}</strong><small>WORKDAY JOURNEY</small></div><div class="wdj-skill-branches">${summary.map(({s,data,p},index)=>`<button type="button" data-skill-id="${s.id}" class="wdj-skill-node wdj-skill-tone-${s.tone} ${selected===s.id?'is-selected':''} ${data.xp>0?'is-active':'is-empty'}" aria-pressed="${selected===s.id}" aria-label="${escapeHtml(s.en)} Level ${p.level}"><span class="wdj-skill-node-icon">${s.icon}</span><span class="wdj-skill-node-main"><strong>${escapeHtml(s[locale()])}</strong><small>Lv.${p.level} · ${data.xp.toLocaleString()} XP</small></span><span class="wdj-skill-node-progress"><i style="width:${p.percent.toFixed(1)}%"></i></span></button>`).join('')}</div></section>
      <section class="wdj-skill-detail" aria-live="polite"><div class="wdj-skill-detail-head"><span class="wdj-skill-detail-icon wdj-skill-tone-${chosen.tone}">${chosen.icon}</span><div><span class="wdj-skill-eyebrow">SELECTED SKILL PATH</span><h3>${escapeHtml(chosen[locale()])}</h3><p>${escapeHtml(locale()==='th'?chosen.descTh:chosen.descEn)}</p></div><span class="wdj-skill-level">Lv. ${prog.level}</span></div>
        <div class="wdj-skill-xp-head"><strong>${current.xp.toLocaleString()} XP</strong><span>${prog.level>=MAX_LEVEL?tr('ถึงระดับสูงสุดในเวอร์ชันนี้','Current maximum level'):tr(`อีก ${prog.delta.toLocaleString()} XP จะขึ้น Lv.${prog.level+1}`,`${prog.delta.toLocaleString()} XP to Lv.${prog.level+1}`)}</span></div><div class="wdj-skill-xp-bar"><i style="width:${prog.percent.toFixed(1)}%"></i></div>
        <div class="wdj-skill-evidence-kpis"><div><strong>${current.journals}</strong><span>${tr('วัน Journal','Journal days')}</span></div><div><strong>${current.projects}</strong><span>${tr('Project ที่เกี่ยวข้อง','Related projects')}</span></div><div><strong>${current.focus}</strong><span>${tr('Focus Session','Focus sessions')}</span></div></div>
        <div class="wdj-skill-milestone-head"><h4>${tr('Milestones','Milestones')}</h4><small>${tr('ปลดล็อกอัตโนมัติตาม Level','Automatically reached by leveling')}</small></div><div class="wdj-skill-milestones">${[[3,'🌱',tr('เริ่มเติบโต','Growing')],[5,'🏅',tr('ชำนาญ','Pro')],[7,'💎',tr('ระดับสูง','Expert')],[10,'🌟',tr('ผู้เชี่ยวชาญ','Master')]].map(([n,emoji,label])=>`<div class="${prog.level>=n?'is-earned':'is-locked'}"><span>${prog.level>=n?emoji:'🔒'}</span><strong>Lv.${n}</strong><small>${label}</small></div>`).join('')}</div>
        <div class="wdj-skill-evidence-head"><h4>${tr('กิจกรรมที่เกี่ยวข้อง','Related activity')}</h4><small>${tr('แสดงสูงสุด 8 รายการล่าสุด','Up to 8 recent entries')}</small></div>${orderedEvidence.length?`<div class="wdj-skill-evidence-list">${orderedEvidence.map(e=>`<div><span class="wdj-skill-evidence-icon">${e.type==='journal'?'📓':e.type==='project'?'🧩':'⏱️'}</span><span><strong>${escapeHtml(e.name)}</strong><small>${escapeHtml(locale()==='th'?e.th:e.en)}</small></span><time>${escapeHtml(e.type==='journal'?e.date:localizedDate(e.date))}</time></div>`).join('')}</div>`:`<div class="wdj-skill-empty">🌿 ${tr('ยังไม่พบ Journal หรือ Project ที่มีคำเกี่ยวข้องกับทักษะนี้','No related journal or project content found for this skill yet.')}</div>`}
      </section><section class="wdj-skill-footnote"><strong>💡 ${tr('XP คำนวณอย่างไร?','How is growth XP calculated?')}</strong><p>${tr('Journal ที่มีรายละเอียดอย่างน้อย 10 ตัวอักษร: +15 XP ต่อวันและสายทักษะ · Project: +10 XP เริ่มต้น, +10 ต่อความคืบหน้า 25% และ +50 เมื่อสำเร็จ · Focus ที่ผูกกับ Project: +5 XP ต่อ 25 นาที (สูงสุด +20 ต่อ Session) โดยจับคู่คำสำคัญภาษาไทย/อังกฤษ ไม่บวกซ้ำเมื่อกด Save','Journal with 10+ characters: +15 XP per date and matched skill. Project: +10 base, +10 per 25% progress, +50 at completion. Linked focus: +5 per 25 minutes (max +20 per session). Matching uses TH/EN keywords, not save clicks.')}</p><p>${tr('เป็นการสะท้อนความก้าวหน้าจากข้อความ ไม่ใช่การประเมินคุณภาพงาน ข้อมูลต้นฉบับไม่ถูกแก้ไข และไม่มีการแจก Coin','This is a descriptive activity estimate, not a quality judgment. Source data is read-only and no Coins are awarded.')}</p></section>
    </div>`;
  }
  document.addEventListener('click',event=>{const btn=event.target.closest?.('#wdjSkillTreePage [data-skill-id]');if(!btn)return;ensureScope();const id=btn.dataset.skillId;if(!SKILLS.some(s=>s.id===id))return;selected=id;savePreference();render();const next=document.querySelector('#wdjSkillTreePage [data-skill-id="'+id+'"]');next?.focus({preventScroll:true});});
  window.addEventListener('storage',e=>{if(!e.key||e.key==='wp-v6-journal'||e.key==='wp-v6-projects'||e.key.startsWith('wdj-v875-focus-')||e.key.startsWith(PREF)){scope='';if(document.body?.dataset.v7Route==='skills')render();}});
  ['workday:v7-data-changed','workday:v8-data-changed','workday:v8-auth-state','workday:v8-cloud-ready'].forEach(e=>window.addEventListener(e,()=>{if(e.includes('auth')||e.includes('cloud'))scope='';if(document.body?.dataset.v7Route==='skills')render();}));
  window.WorkdaySkills={render,getSnapshot:()=>{ensureScope();const values=collect();return {account:scope,skills:Object.fromEntries(SKILLS.map(s=>[s.id,values[s.id].xp]))};}};
  if(location.hash.replace(/^#\/?/,'').split('?')[0]==='skills')queueMicrotask(render);
})();
