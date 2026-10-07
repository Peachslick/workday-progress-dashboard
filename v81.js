(() => {
  "use strict";

  const API = window.WorkdayJourneyAPI;
  if (!API) return;

  const VERSION = "8.5.0";
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
  function purchaseReward(reward, source="shop") {
    if (!reward || reward.price <= 0 || isOwned(reward)) return;
    if (!rewardAvailable(reward)) { toast("🎓", t("finaleEnded"), "error"); return; }
    const deal = source === "weekly" ? weeklyDealFor(reward) : source === "daily" ? dailyDealFor(reward) : null;
    const payPrice = deal ? deal.price : reward.price;
    const current = balance();
    if (current < payPrice) { toast("🪙", t("insufficient"), "error"); return; }
    const sourceName = source === "daily" ? (lang()==="th"?"ดีลประจำวัน":"Daily Deal") : (lang()==="th"?"ดีลประจำสัปดาห์":"Weekly Deal");
    const confirmText = deal
      ? (lang()==="th"
          ? `${sourceName} ลด ${deal.discount}% · ใช้ ${payPrice.toLocaleString()} Coins (ปกติ ${reward.price.toLocaleString()}) เพื่อซื้อ ${rewardName(reward)}?`
          : `${sourceName} ${deal.discount}% off · Spend ${payPrice.toLocaleString()} Coins (normally ${reward.price.toLocaleString()}) for ${rewardName(reward)}?`)
      : t("purchaseConfirm", {coins:payPrice,name:rewardName(reward)});
    if (!confirm(confirmText)) return;
    const list = ledger();
    const id = `spend:${reward.type}:${reward.id}`;
    if (!list.some(item => item.id === id)) {
      const dealSuffix = deal ? ` · ${source === "daily" ? (lang()==="th"?"ดีลประจำวัน":"Daily Deal") : (lang()==="th"?"ดีลประจำสัปดาห์":"Weekly Deal")} -${deal.discount}%` : "";
      list.push({
        id,
        amount:-payPrice,
        type:"purchase",
        labelTh:`ซื้อ ${rewardName(reward)}${dealSuffix}`,
        labelEn:`Purchased ${rewardName(reward)}${dealSuffix}`,
        createdAt:new Date().toISOString(),
        meta:{rewardType:reward.type,rewardId:reward.id,name:rewardName(reward),source:deal?source:"shop",rotation:deal?.key||null,discountPct:deal?.discount||0,originalPrice:reward.price,paidPrice:payPrice}
      });
      write(KEYS.ledger, list);
    }
    const owned = ownedRewards(); owned.add(rewardKey(reward)); saveOwned(owned);
    toast("🎁", deal ? `${t("purchased")}: ${rewardName(reward)} · -${deal.discount}%` : `${t("purchased")}: ${rewardName(reward)}`, "success");
    refreshAll();
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
    setTimeout(()=>window.WorkdayV848?.enhanceRewards?.(),0);
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
  function bankLedger(){
    const value=read(KEYS.bankLedger,[]); return Array.isArray(value)?value:[];
  }
  function bankState(){
    const value=read(KEYS.bankState,{}); return value&&typeof value==="object"&&!Array.isArray(value)?value:{};
  }
  function saveBankState(value){ write(KEYS.bankState,value&&typeof value==="object"?value:{}); }
  function roundBank(value){ return Math.round((Number(value)||0)*100)/100; }
  function bankBalance(list=bankLedger()){ return roundBank(list.reduce((sum,item)=>sum+Number(item?.amount||0),0)); }
  function bankInterestEarned(list=bankLedger()){ return roundBank(list.filter(x=>x?.type==="interest").reduce((sum,item)=>sum+Math.max(0,Number(item?.amount||0)),0)); }
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
  function bankDeposit(rawAmount){
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
    const dep=$("v83DepositAmount"),wd=$("v83WithdrawAmount");
    q("[data-v83-deposit]",root)?.addEventListener("click",()=>bankDeposit(dep?.value));q("[data-v83-withdraw]",root)?.addEventListener("click",()=>bankWithdraw(wd?.value));
    qa("[data-v83-deposit-pct]",root).forEach(btn=>btn.addEventListener("click",()=>{if(dep)dep.value=Math.floor(wallet*Number(btn.dataset.v83DepositPct||0)/100)||"";}));
    qa("[data-v83-withdraw-pct]",root).forEach(btn=>btn.addEventListener("click",()=>{if(wd)wd.value=Math.floor(savings*Number(btn.dataset.v83WithdrawPct||0)/100)||"";}));
    [dep,wd].filter(Boolean).forEach(input=>input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();input===dep?bankDeposit(input.value):bankWithdraw(input.value);}}));
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
    grantExternalReward,
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
