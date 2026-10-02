(() => {
  "use strict";

  const API = window.WorkdayJourneyAPI;
  if (!API) return;

  const VERSION = "8.1.0";
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
    tab: "wp-v81-shop-tab"
  };

  const TIER_COINS = { common: 5, rare: 10, epic: 20, legendary: 35 };

  const TEXT = {
    th: {
      rewards: "รางวัล",
      rewardsSub: "Mascot, Theme, Effect และประวัติ Work Coins",
      shopTitle: "Reward Shop",
      shopHelp: "สะสม Work Coins จากการทำงานจริง แล้วใช้ปลดล็อก Mascot, Theme และ Effect",
      coinBalance: "Work Coins",
      lifetimeEarned: "ได้รับทั้งหมด",
      lifetimeSpent: "ใช้ไปทั้งหมด",
      retroTitle: "Previous Progress Rewarded",
      retroHelp: "V8.1 จะให้ Coin ย้อนหลังจาก Workday, Journal, Project และ Achievement ที่คุณทำสำเร็จก่อนอัปเดต โดยให้เพียงครั้งเดียว",
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
      themeSakuraDesc: "โทนชมพูอ่อนและกลีบดอกไม้สำหรับ Dashboard",
      themeAurora: "Aurora",
      themeAuroraDesc: "แสงเหนือสีฟ้าเขียวแบบนุ่ม ๆ",
      themeGolden: "Golden",
      themeGoldenDesc: "โทนทองสำหรับ Journey ระดับตำนาน",
      effectSparkle: "Profile Sparkle",
      effectSparkleDesc: "ประกายเล็ก ๆ รอบ Profile และ Mascot",
      effectHalo: "Soft Halo",
      effectHaloDesc: "วงแสงนุ่ม ๆ รอบ Profile ที่ใช้งานอยู่",
      effectCelebration: "Celebration Aura",
      effectCelebrationDesc: "Aura แบบฉลองรอบ Profile และ Mascot",
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
      retroTitle: "Previous Progress Rewarded",
      retroHelp: "V8.1 grants one-time retroactive Coins for completed Workdays, Journals, Projects and Achievements from before this update",
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
      themeSakuraDesc: "A soft pink floral dashboard atmosphere",
      themeAurora: "Aurora",
      themeAuroraDesc: "A subtle blue-green aurora glow",
      themeGolden: "Golden",
      themeGoldenDesc: "A golden atmosphere for legendary journeys",
      effectSparkle: "Profile Sparkle",
      effectSparkleDesc: "Small sparkles around the active Profile and Mascot",
      effectHalo: "Soft Halo",
      effectHaloDesc: "A soft halo around the active Profile",
      effectCelebration: "Celebration Aura",
      effectCelebrationDesc: "A celebratory aura around Profile and Mascot",
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
        events.push({ id:`earn:workday:${key}`, amount:10, type:"workday", labelTh:`${t("workdayComplete")} · ${key}`, labelEn:`Completed Workday · ${key}`, createdAt:isoFromDateKey(key), meta:{date:key} });
      }
    }

    const journals = read("wp-v6-journal", {});
    if (journals && typeof journals === "object" && !Array.isArray(journals)) {
      Object.entries(journals).forEach(([key, entry]) => {
        events.push({ id:`earn:journal:${key}`, amount:5, type:"journal", labelTh:`${t("journalEntry")} · ${key}`, labelEn:`Daily Journal · ${key}`, createdAt:entry?.updatedAt || entry?.createdAt || isoFromDateKey(key), meta:{date:key} });
      });
    }

    const projects = read("wp-v6-projects", []);
    if (Array.isArray(projects)) projects.forEach((project, index) => {
      if (Number(project?.progress || 0) < 100) return;
      const pid = project?.id || `legacy-${stableHash(`${project?.name||"project"}|${project?.createdAt||index}`)}`;
      const name = String(project?.name || "Project");
      events.push({ id:`earn:project:${pid}`, amount:20, type:"project", labelTh:`${t("projectComplete")} · ${name}`, labelEn:`Project Completed · ${name}`, createdAt:project?.updatedAt || project?.createdAt || new Date().toISOString(), meta:{projectId:pid,name} });
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

  let reconcileBusy = false;
  async function reconcileRewards({notify=true}={}) {
    if (reconcileBusy) return {added:0,count:0};
    reconcileBusy = true;
    try {
      const list = ledger();
      const ids = new Set(list.map(item => item.id));
      const additions = candidateEvents().filter(item => !ids.has(item.id));
      if (additions.length) {
        const next = [...list, ...additions].sort((a,b) => new Date(a.createdAt||0) - new Date(b.createdAt||0));
        write(KEYS.ledger, next);
      }
      const firstMigration = localStorage.getItem(KEYS.retro) !== "done";
      if (firstMigration) localStorage.setItem(KEYS.retro, "done");
      const total = additions.reduce((sum,item)=>sum+Math.max(0,Number(item.amount)||0),0);
      if (notify && additions.length) {
        if (firstMigration) toast("🪙", t("retroAwarded", {coins:total}), "success");
        else toast("🪙", `+${total} ${t("coinBalance")}`, "success");
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
    if (reward.type === "theme") localStorage.setItem(KEYS.theme, reward.id);
    if (reward.type === "effect") localStorage.setItem(KEYS.effect, reward.id);
    applyEquippedRewards();
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

  function applyEquippedRewards() {
    const root = document.documentElement;
    root.dataset.rewardTheme = selectedThemeId();
    root.dataset.rewardEffect = selectedEffectId();
    root.dataset.rewardMascot = selectedMascotId();
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
  function formatHistoryDate(iso) {
    const d = new Date(iso || Date.now());
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat(lang()==="th"?"th-TH":"en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(d);
  }
  function rewardCard(reward) {
    const owned = isOwned(reward), equipped = isEquipped(reward), currentBalance = balance();
    const visual = reward.type === "mascot" ? reward.emoji : reward.icon;
    const desc = reward.type === "mascot" ? (lang()==="th" ? "เปลี่ยนบุคลิกและข้อความตาม Workday Progress" : "Changes personality and messages with Workday Progress") : t(reward.descKey);
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
    const tabContent = tab === "mascots" ? MASCOTS.map(rewardCard).join("") : tab === "themes" ? THEMES.map(rewardCard).join("") : tab === "effects" ? EFFECTS.map(rewardCard).join("") : `<div class="v81-history-list">${list.length ? list.slice(0,120).map(item=>`<div class="v81-history-row ${Number(item.amount)>=0?"earn":"spend"}"><span class="v81-history-icon">${Number(item.amount)>=0?"＋":"−"}</span><div><strong>${esc(historyLabel(item))}</strong><small>${esc(formatHistoryDate(item.createdAt))}</small></div><b>${Number(item.amount)>=0?"+":""}${Number(item.amount)} 🪙</b></div>`).join("") : `<div class="empty-state">🪙 ${esc(t("coinHistoryEmpty"))}</div>`}</div>`;

    root.innerHTML = `<div class="v7-page-heading"><div class="v7-page-title"><span>🎁</span><div><p class="eyebrow">WORKDAY JOURNEY · V8.1</p><h2>${esc(t("shopTitle"))}</h2><p class="muted">${esc(t("shopHelp"))}</p></div></div></div>
      <section class="v81-wallet-hero"><div class="v81-wallet-main"><span>🪙</span><div><small>${esc(t("coinBalance"))}</small><strong>${bal.toLocaleString(lang()==="th"?"th-TH":"en-US")}</strong></div></div><div class="v81-wallet-stat"><small>${esc(t("lifetimeEarned"))}</small><b>+${earned.toLocaleString()}</b></div><div class="v81-wallet-stat"><small>${esc(t("lifetimeSpent"))}</small><b>-${spent.toLocaleString()}</b></div></section>
      <section class="v81-earn-card"><div><p class="eyebrow">${esc(t("howToEarn"))}</p><h3>${esc(t("retroTitle"))}</h3><p>${esc(t("retroHelp"))}</p></div><div class="v81-earn-grid"><span>🕒 <b>+10</b> ${esc(t("earnWorkday"))}</span><span>📓 <b>+5</b> ${esc(t("earnJournal"))}</span><span>🧩 <b>+20</b> ${esc(t("earnProject"))}</span><span>🏆 <b>+5 / +10 / +20 / +35</b> ${esc(t("earnAchievement"))}</span></div></section>
      <div class="v81-shop-tabs">${[["mascots","🐣",t("mascots")],["themes","🎨",t("themes")],["effects","✨",t("effects")],["history","📜",t("history")]].map(([id,icon,label])=>`<button type="button" data-v81-tab="${id}" class="${tab===id?"active":""}">${icon}<span>${esc(label)}</span></button>`).join("")}</div>
      <section class="v81-shop-grid ${tab==="history"?"history":""}">${tabContent}</section>`;

    qa("[data-v81-tab]", root).forEach(btn => btn.addEventListener("click", () => { localStorage.setItem(KEYS.tab, btn.dataset.v81Tab); renderShop(); }));
    qa("[data-v81-buy]", root).forEach(btn => btn.addEventListener("click", () => { const [type,id]=btn.dataset.v81Buy.split(":"); purchaseReward(rewardBy(type,id)); }));
    qa("[data-v81-equip]", root).forEach(btn => btn.addEventListener("click", () => { const [type,id]=btn.dataset.v81Equip.split(":"); equipReward(rewardBy(type,id)); }));
  }

  function refreshAll() {
    applyEquippedRewards();
    ensureCoinChip();
    if (location.hash.includes("/rewards")) renderShop();
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
    window.addEventListener("storage", event => { if (String(event.key||"").startsWith("wp-v81-")) refreshAll(); });
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
