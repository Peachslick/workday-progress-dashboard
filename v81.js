(() => {
  "use strict";

  const API = window.WorkdayJourneyAPI;
  if (!API) return;

  const VERSION = "8.2.0";
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
    retro: "wp-v81-retro-rewards-v1",
    tab: "wp-v81-shop-tab",
    rebalance: "wp-v82-coin-rebalance-v1",
    missions: "wp-v82-daily-missions",
    activity: "wp-v82-daily-activity",
    chests: "wp-v82-chests",
    themeTrial: "wp-v82-theme-trial",
    mascotXp: "wp-v82-mascot-xp"
  };

  const ECONOMY = { workday:15, journal:10, project:50 };
  const TIER_COINS = { common: 20, rare: 40, epic: 80, legendary: 150 };

  const TEXT = {
    th: {
      rewards: "รางวัล",
      rewardsSub: "Mascot, Theme, Effect และประวัติ Work Coins",
      shopTitle: "Reward Shop",
      shopHelp: "สะสม Work Coins จากการทำงานจริง แล้วใช้ปลดล็อก Mascot, Theme และ Effect",
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
      history: "Coin History",
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
      rewardsSub: "Mascots, themes, effects and Work Coin history",
      shopTitle: "Reward Shop",
      shopHelp: "Earn Work Coins from real progress and unlock Mascots, Themes and Effects",
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
      history: "Coin History",
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
    { id:"chick", type:"mascot", price:0, emoji:"🐣", nameKey:"chick", accent:"#f7c948" },
    { id:"cat", type:"mascot", price:100, emoji:"🐱", nameKey:"cat", accent:"#f0a35e" },
    { id:"bear", type:"mascot", price:200, emoji:"🐻", nameKey:"bear", accent:"#b78560" },
    { id:"bunny", type:"mascot", price:300, emoji:"🐰", nameKey:"bunny", accent:"#ef88bd" },
    { id:"ghost", type:"mascot", price:500, emoji:"👻", nameKey:"ghost", accent:"#9d8cff" }
  ];
  const THEMES = [
    { id:"default", type:"theme", price:0, icon:"◐", nameKey:"defaultTheme", descKey:"defaultTheme" },
    { id:"sakura", type:"theme", price:150, icon:"🌸", nameKey:"themeSakura", descKey:"themeSakuraDesc" },
    { id:"aurora", type:"theme", price:250, icon:"🌌", nameKey:"themeAurora", descKey:"themeAuroraDesc" },
    { id:"golden", type:"theme", price:400, icon:"✨", nameKey:"themeGolden", descKey:"themeGoldenDesc" }
  ];
  const EFFECTS = [
    { id:"none", type:"effect", price:0, icon:"○", nameKey:"noneEffect", descKey:"noneEffect" },
    { id:"sparkle", type:"effect", price:120, icon:"✦", nameKey:"effectSparkle", descKey:"effectSparkleDesc" },
    { id:"halo", type:"effect", price:200, icon:"◉", nameKey:"effectHalo", descKey:"effectHaloDesc" },
    { id:"celebration", type:"effect", price:350, icon:"🎉", nameKey:"effectCelebration", descKey:"effectCelebrationDesc" }
  ];
  const ALL_REWARDS = [...MASCOTS, ...THEMES, ...EFFECTS];

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
    set.add("mascot:chick"); set.add("theme:default"); set.add("effect:none");
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
      const amount = TIER_COINS[tier] || 5;
      const name = API.translate(a.titleKey) || a.id;
      events.push({ id:`earn:achievement:${a.id}`, amount, type:"achievement", labelTh:`${t("achievementReward")} · ${name}`, labelEn:`Achievement · ${name}`, createdAt:a.unlockedAt || new Date().toISOString(), meta:{achievementId:a.id,tier,name} });
    });
    return events;
  }

  function coreTargetAmount(item) {
    if (!item) return 0;
    if (item.type === "workday" || String(item.id||"").startsWith("earn:workday:")) return ECONOMY.workday;
    if (item.type === "journal" || String(item.id||"").startsWith("earn:journal:")) return ECONOMY.journal;
    if (item.type === "project" || String(item.id||"").startsWith("earn:project:")) return ECONOMY.project;
    if (item.type === "achievement" || String(item.id||"").startsWith("earn:achievement:")) return TIER_COINS[String(item.meta?.tier||"common").toLowerCase()] || TIER_COINS.common;
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

  function rewardName(reward) { return t(reward.nameKey); }
  function isOwned(reward) { return reward.price === 0 || ownedRewards().has(rewardKey(reward)); }
  function isEquipped(reward) {
    if (reward.type === "mascot") return selectedMascotId() === reward.id;
    if (reward.type === "theme") return selectedThemeId() === reward.id;
    if (reward.type === "effect") return selectedEffectId() === reward.id;
    return false;
  }
  function purchaseReward(reward) {
    if (!reward || reward.price <= 0 || isOwned(reward)) return;
    const current = balance();
    if (current < reward.price) { toast("🪙", t("insufficient"), "error"); return; }
    if (!confirm(t("purchaseConfirm", {coins:reward.price,name:rewardName(reward)}))) return;
    const list = ledger();
    const id = `spend:${reward.type}:${reward.id}`;
    if (!list.some(item => item.id === id)) {
      list.push({ id, amount:-reward.price, type:"purchase", labelTh:`ซื้อ ${rewardName(reward)}`, labelEn:`Purchased ${rewardName(reward)}`, createdAt:new Date().toISOString(), meta:{rewardType:reward.type,rewardId:reward.id,name:rewardName(reward)} });
      write(KEYS.ledger, list);
    }
    const owned = ownedRewards(); owned.add(rewardKey(reward)); saveOwned(owned);
    toast("🎁", `${t("purchased")}: ${rewardName(reward)}`, "success");
    refreshAll();
  }
  function equipReward(reward) {
    if (!reward || !isOwned(reward)) return;
    if (reward.type === "mascot") localStorage.setItem(KEYS.mascot, reward.id);
    if (reward.type === "theme") { localStorage.setItem(KEYS.theme, reward.id); localStorage.removeItem(KEYS.themeTrial); }
    if (reward.type === "effect") localStorage.setItem(KEYS.effect, reward.id);
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
    return { id, emoji:def.emoji, name:rewardName(def), message:copy[pKey] || copy.work, accessory:accessories[pKey] || snapshot.accessory || "", accent:def.accent };
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
    if (effect === "halo") {
      return `<i class="v81-fx-halo h1"></i><i class="v81-fx-halo h2"></i><i class="v81-fx-halo h3"></i><i class="v81-fx-halo-core"></i>`;
    }
    if (effect === "celebration") {
      const shapes=["●","◆","✦","■","▲"];
      return `<i class="v81-fx-celebrate-glow one"></i><i class="v81-fx-celebrate-glow two"></i>` + Array.from({length:34}, (_,i) => {
        const x=(i*29+5)%98, size=6+(i%5)*2, delay=-((i*13)%85)/10, duration=5.2+(i%7)*.42, spin=(i%2?1:-1), drift=spin*35, rot=spin*720;
        return `<i class="v81-fx-confetti c${i%6}" style="--x:${x}%;--size:${size}px;--delay:${delay}s;--dur:${duration}s;--drift:${drift}px;--rot:${rot}deg">${shapes[i%shapes.length]}</i>`;
      }).join("");
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
  function rewardCard(reward) {
    const owned = isOwned(reward), equipped = isEquipped(reward), currentBalance = balance();
    const visual = reward.type === "mascot" ? reward.emoji : reward.icon;
    const bond = reward.type === "mascot" ? mascotBond(reward.id) : null;
    const desc = reward.type === "mascot" ? `${lang()==="th" ? "เปลี่ยนบุคลิกและข้อความตาม Workday Progress" : "Changes personality and messages with Workday Progress"} · Bond Lv.${bond.level} (${bond.progress}/100 XP)` : t(reward.descKey);
    let action = "";
    if (equipped) action = `<button type="button" class="v81-reward-btn equipped" disabled>✓ ${esc(t("equipped"))}</button>`;
    else if (owned) action = `<button type="button" class="v81-reward-btn" data-v81-equip="${esc(reward.type)}:${esc(reward.id)}">${esc(t("equip"))}</button>`;
    else action = `<button type="button" class="v81-reward-btn buy" data-v81-buy="${esc(reward.type)}:${esc(reward.id)}" ${currentBalance<reward.price?"data-low=\"1\"":""}>🪙 ${reward.price.toLocaleString()} · ${esc(t("buy"))}</button>`;
    return `<article class="v81-reward-card ${owned?"owned":"locked"} ${equipped?"active":""}" data-kind="${esc(reward.type)}" data-reward="${esc(reward.id)}"><div class="v81-reward-visual" style="--reward-accent:${esc(reward.accent||"#6d8cff")}">${visual}</div><div class="v81-reward-copy"><div class="v81-reward-title"><strong>${esc(rewardName(reward))}</strong>${owned?`<span>${esc(t("owned"))}</span>`:`<span>🪙 ${reward.price}</span>`}</div><p>${esc(desc)}</p></div>${action}</article>`;
  }

  function renderShop() {
    const root = $("v81RewardsPage");
    if (!root) return;
    const tab = localStorage.getItem(KEYS.tab) || "mascots";
    const list = ledger().slice().sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
    const bal = balance(list), earned = lifetimeEarned(list), spent = lifetimeSpent(list);
    const tabContent = tab === "mascots" ? MASCOTS.map(rewardCard).join("") : tab === "themes" ? THEMES.map(rewardCard).join("") : tab === "effects" ? EFFECTS.map(rewardCard).join("") : `<div class="v81-history-list">${list.length ? list.slice(0,120).map(item=>`<div class="v81-history-row ${Number(item.amount)>=0?"earn":"spend"}"><span class="v81-history-icon">${Number(item.amount)>=0?"＋":"−"}</span><div><strong>${esc(historyLabel(item))}</strong><small>${esc(formatHistoryDate(item.createdAt))}</small></div><b>${esc(historyValue(item))}</b></div>`).join("") : `<div class="empty-state">🪙 ${esc(t("coinHistoryEmpty"))}</div>`}</div>`;

    root.innerHTML = `<div class="v7-page-heading"><div class="v7-page-title"><span>🎁</span><div><p class="eyebrow">WORKDAY JOURNEY · V8.2</p><h2>${esc(t("shopTitle"))}</h2><p class="muted">${esc(t("shopHelp"))}</p></div></div></div>
      <section class="v81-wallet-hero"><div class="v81-wallet-main"><span>🪙</span><div><small>${esc(t("coinBalance"))}</small><strong>${bal.toLocaleString(lang()==="th"?"th-TH":"en-US")}</strong></div></div><div class="v81-wallet-stat"><small>${esc(t("lifetimeEarned"))}</small><b>+${earned.toLocaleString()}</b></div><div class="v81-wallet-stat"><small>${esc(t("lifetimeSpent"))}</small><b>-${spent.toLocaleString()}</b></div></section>
      <section class="v81-earn-card"><div><p class="eyebrow">${esc(t("howToEarn"))}</p><h3>${esc(t("retroTitle"))}</h3><p>${esc(t("retroHelp"))}</p></div><div class="v81-earn-grid"><span>🕒 <b>+15</b> ${esc(t("earnWorkday"))}</span><span>📓 <b>+10</b> ${esc(t("earnJournal"))}</span><span>🧩 <b>+50</b> ${esc(t("earnProject"))}</span><span>🏆 <b>+20 / +40 / +80 / +150</b> ${esc(t("earnAchievement"))}</span><span>🎯 <b>+5 – +20</b> ${lang()==="th"?"Daily Mission":"Daily Mission"}</span><span>🎁 <b>+5 – +100</b> ${lang()==="th"?"Daily / Weekly Chest":"Daily / Weekly Chest"}</span></div></section>
      <div class="v81-shop-tabs">${[["mascots","🐣",t("mascots")],["themes","🎨",t("themes")],["effects","✨",t("effects")],["history","📜",t("history")]].map(([id,icon,label])=>`<button type="button" data-v81-tab="${id}" class="${tab===id?"active":""}">${icon}<span>${esc(label)}</span></button>`).join("")}</div>
      <section class="v81-shop-grid ${tab==="history"?"history":""}">${tabContent}</section>`;

    qa("[data-v81-tab]", root).forEach(btn => btn.addEventListener("click", () => { localStorage.setItem(KEYS.tab, btn.dataset.v81Tab); renderShop(); }));
    qa("[data-v81-buy]", root).forEach(btn => btn.addEventListener("click", () => { const [type,id]=btn.dataset.v81Buy.split(":"); purchaseReward(rewardBy(type,id)); }));
    qa("[data-v81-equip]", root).forEach(btn => btn.addEventListener("click", () => { const [type,id]=btn.dataset.v81Equip.split(":"); equipReward(rewardBy(type,id)); }));
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
  function openChest(kind){
    const dailyKey=dayKeyNow(), key=kind==="daily"?dailyKey:weekKey(), id=`chest:${kind}:${key}`;
    if(ledger().some(x=>x.id===id))return;
    if(kind==="daily"&&missionClaimCount(dailyKey)<3){toast("🎁",lang()==="th"?"ทำ Daily Missions ให้ครบ 3 ภารกิจก่อน":"Complete all 3 Daily Missions first","error");return;}
    if(kind==="weekly"&&completedDailyInWeek()<5){toast("🎁",lang()==="th"?"เปิด Daily Chest ให้ครบ 5 วันในสัปดาห์ก่อน":"Open Daily Chests on 5 days this week first","error");return;}
    const reward=chestReward(kind,key), list=ledger(); let amount=0, rewardText=reward.text;
    if(reward.type==="coins") amount=reward.coins;
    if(reward.type==="trial"){const trial=grantThemeTrial(reward.hours,`${kind}:${key}`);if(trial){const theme=rewardBy("theme",trial.themeId);rewardText=`${rewardName(theme)} · ${reward.hours}h Trial`;}else{amount=kind==="daily"?20:70;rewardText=`+${amount} Coins`;}}
    if(reward.type==="xp"){const mascot=selectedMascotId();addMascotXp(mascot,reward.xp);rewardText=`+${reward.xp} XP · ${rewardName(rewardBy("mascot",mascot))}`;}
    list.push({id,amount,type:"chest",labelTh:`${kind==="daily"?"Daily":"Weekly"} Chest · ${rewardText}`,labelEn:`${kind==="daily"?"Daily":"Weekly"} Chest · ${rewardText}`,createdAt:new Date().toISOString(),meta:{kind,key,rewardType:reward.type,rewardText}}); write(KEYS.ledger,list);
    toast("🎁",rewardText,"success");applyEquippedRewards(true);refreshAll();
  }
  function progressText(value,target){ if(target<=1)return value>=target?(lang()==="th"?"สำเร็จแล้ว":"Completed"):`${Math.round(value)}/${Math.round(target)}`; return `${Math.round(value)}/${Math.round(target)} min`; }
  function renderMissions(){
    const root=$("v82MissionsPage"); if(!root)return; markRouteVisit();
    const key=dayKeyNow(), set=dailyMissionSet(key), c=missionContext(key), claimed=missionClaimCount(key), dailyOpen=dailyChestOpened(key), weeklyDone=completedDailyInWeek(), weeklyOpen=weeklyChestOpened(), trial=activeThemeTrial();
    const cards=set.ids.map(id=>{const d=MISSION_DEFS[id],p=missionProgress(id,c),done=p.value+1e-6>=p.target,got=missionClaimed(key,id),pct=Math.max(0,Math.min(100,p.value/Math.max(.0001,p.target)*100));return `<article class="v82-mission-card ${done?"done":""} ${got?"claimed":""}"><div class="v82-mission-icon">${d.icon}</div><div class="v82-mission-copy"><div><strong>${esc(lang()==="th"?d.th:d.en)}</strong><span>+${d.reward} 🪙</span></div><p>${esc(lang()==="th"?d.descTh:d.descEn)}</p><div class="v82-mission-progress"><i><b style="width:${pct}%"></b></i><small>${esc(progressText(p.value,p.target))}</small></div></div><button type="button" data-v82-claim="${id}" ${!done||got?"disabled":""}>${got?"✓ "+(lang()==="th"?"รับแล้ว":"Claimed"):(done?(lang()==="th"?"รับ Coin":"Claim Coins"):(lang()==="th"?"กำลังทำ":"In progress"))}</button></article>`;}).join("");
    const dailyReady=claimed>=3&&!dailyOpen, weeklyReady=weeklyDone>=5&&!weeklyOpen;
    root.innerHTML=`<div class="v7-page-heading"><div class="v7-page-title"><span>🎯</span><div><p class="eyebrow">WORKDAY JOURNEY · V8.2</p><h2>${lang()==="th"?"Daily Missions":"Daily Missions"}</h2><p class="muted">${lang()==="th"?"ภารกิจสุ่มใหม่ทุกวัน ทำให้ครบเพื่อเปิด Daily Chest และสะสมวันสำหรับ Weekly Chest":"Fresh missions every day. Complete all three to open a Daily Chest and build toward the Weekly Chest."}</p></div></div></div>${trial?`<section class="v82-trial-banner">🌈 <div><strong>${esc(rewardName(rewardBy("theme",trial.themeId)))} Theme Trial</strong><span>${lang()==="th"?"ใช้งานได้ถึง":"Active until"} ${esc(formatHistoryDate(trial.expiresAt))}</span></div></section>`:""}<section class="v82-mission-hero"><div><span>🎯</span><div><small>${lang()==="th"?"ภารกิจวันนี้":"TODAY'S MISSIONS"}</small><strong>${claimed}/3</strong></div></div><div><small>${lang()==="th"?"รับ Coin วันนี้จาก Mission":"Mission Coins Today"}</small><b>+${ledger().filter(x=>String(x.id||"").startsWith(`earn:mission:${key}:`)).reduce((a,x)=>a+Number(x.amount||0),0)} 🪙</b></div></section><section class="v82-mission-list">${cards}</section><section class="v82-chest-grid"><article class="v82-chest-card daily ${dailyReady?"ready":""}"><div class="v82-chest-art">🎁</div><div><p class="eyebrow">DAILY CHEST</p><h3>${dailyOpen?(lang()==="th"?"เปิดแล้ววันนี้":"Opened today"):(dailyReady?(lang()==="th"?"พร้อมเปิด!":"Ready to open!"):(lang()==="th"?`ทำภารกิจ ${claimed}/3`:`Missions ${claimed}/3`))}</h3><p>${lang()==="th"?"สุ่ม 5–30 Coins, Theme Trial 24h หรือ Mascot XP":"Random 5–30 Coins, a 24h Theme Trial, or Mascot XP"}</p></div><button type="button" data-v82-chest="daily" ${!dailyReady?"disabled":""}>${dailyOpen?"✓ OPENED":"OPEN CHEST"}</button></article><article class="v82-chest-card weekly ${weeklyReady?"ready":""}"><div class="v82-chest-art">🏆</div><div><p class="eyebrow">WEEKLY CHEST</p><h3>${weeklyOpen?(lang()==="th"?"เปิดแล้วสัปดาห์นี้":"Opened this week"):(weeklyReady?(lang()==="th"?"พร้อมเปิด!":"Ready to open!"):`${weeklyDone}/5 DAYS`)}</h3><p>${lang()==="th"?"เปิด Daily Chest ครบ 5 วัน · รางวัลใหญ่ 40–100 Coins, Theme Trial 48h หรือ Mascot XP":"Open Daily Chests on 5 days · bigger rewards: 40–100 Coins, 48h Theme Trial, or Mascot XP"}</p></div><button type="button" data-v82-chest="weekly" ${!weeklyReady?"disabled":""}>${weeklyOpen?"✓ OPENED":"OPEN WEEKLY"}</button></article></section>`;
    qa("[data-v82-claim]",root).forEach(btn=>btn.addEventListener("click",()=>claimMission(btn.dataset.v82Claim)));
    qa("[data-v82-chest]",root).forEach(btn=>btn.addEventListener("click",()=>openChest(btn.dataset.v82Chest)));
  }

  function refreshAll() {
    markRouteVisit();
    applyEquippedRewards();
    ensureCoinChip();
    if (location.hash.includes("/rewards")) renderShop();
    if (location.hash.includes("/missions")) renderMissions();
  }

  window.WorkdayRewards = {
    version: VERSION,
    getBalance: () => balance(),
    getLedger: () => ledger().map(x=>({...x})),
    getEquippedMascot: () => MASCOTS.find(m=>m.id===selectedMascotId()) || MASCOTS[0],
    getMascotPresentation: snapshot => mascotPresentation(snapshot),
    getEquippedTheme: () => selectedThemeId(),
    getEquippedEffect: () => selectedEffectId(),
    renderShop,
    renderMissions,
    claimMission,
    openChest,
    getMascotBond: id => mascotBond(id),
    reconcile: reconcileRewards
  };

  function initialReconcile(attempt=0) {
    const cloudApi = window.WorkdayV8Cloud;
    const status = cloudApi?.getStatus?.() || {status:"local",signedIn:false};
    const rememberedUser = !!localStorage.getItem("wp-v8-cloud-user-id");
    const waitingForSession = rememberedUser && !status.signedIn && attempt < 12;
    const waitingForCloud = status.signedIn && (status.status === "syncing" || status.status === "error") && attempt < 20;
    if (waitingForSession || waitingForCloud) { setTimeout(() => initialReconcile(attempt + 1), 500); return; }
    reconcileRewards({notify:true});
  }

  function init() {
    const owned = ownedRewards(); saveOwned(owned);
    applyEquippedRewards();
    ensureCoinChip();
    setTimeout(() => initialReconcile(), 700);
    window.addEventListener("workday:v7-data-changed", () => setTimeout(() => reconcileRewards({notify:true}), 80));
    window.addEventListener("workday:v8-data-changed", () => setTimeout(() => reconcileRewards({notify:false}), 80));
    window.addEventListener("storage", event => { if (String(event.key||"").startsWith("wp-v81-") || String(event.key||"").startsWith("wp-v82-")) refreshAll(); });
    window.addEventListener("hashchange", () => { markRouteVisit(); setTimeout(refreshAll,40); });
    document.addEventListener("visibilitychange", () => { if (!document.hidden) reconcileRewards({notify:false}); });
    window.addEventListener("online", () => reconcileRewards({notify:false}));
    setInterval(() => reconcileRewards({notify:true}), 15000);
    setInterval(() => ensureCoinChip(), 3000);
    setTimeout(() => {
      refreshAll();
      try { window.dispatchEvent(new CustomEvent("workday:v7-data-changed")); } catch {}
    }, 350);
  }

  init();
})();
