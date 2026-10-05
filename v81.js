(() => {
  "use strict";

  const API = window.WorkdayJourneyAPI;
  if (!API) return;

  const VERSION = "8.4";
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
    exchangeAchievements: "wp-v84-exchange-achievements"
  };

  const ECONOMY = { workday:15, journal:10, project:50 };
  const TIER_COINS = { common: 20, rare: 40, epic: 80, legendary: 150 };
  const BANK_DAILY_CAP = 15;
  const BANK_TIERS = [
    { id:"starter", min:0, max:499.999, rate:.001, icon:"🌱", th:"Starter Saver", en:"Starter Saver" },
    { id:"smart", min:500, max:1499.999, rate:.002, icon:"💼", th:"Smart Saver", en:"Smart Saver" },
    { id:"pro", min:1500, max:4999.999, rate:.003, icon:"💎", th:"Pro Saver", en:"Pro Saver" },
    { id:"elite", min:5000, max:Infinity, rate:.004, icon:"👑", th:"Elite Saver", en:"Elite Saver" }
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
    { id:"dragon", type:"mascot", price:1500, emoji:"🐉", th:"Journey Dragon", en:"Journey Dragon", accent:"#8b64ef", rarity:"legendary", finale:true }
  ];
  const THEMES = [
    { id:"default", type:"theme", price:0, icon:"◐", nameKey:"defaultTheme", descKey:"defaultTheme", rarity:"common" },
    { id:"sakura", type:"theme", price:150, icon:"🌸", nameKey:"themeSakura", descKey:"themeSakuraDesc", rarity:"rare" },
    { id:"aurora", type:"theme", price:250, icon:"🌌", nameKey:"themeAurora", descKey:"themeAuroraDesc", rarity:"epic" },
    { id:"golden", type:"theme", price:400, icon:"✨", nameKey:"themeGolden", descKey:"themeGoldenDesc", rarity:"epic" },
    { id:"midnight", type:"theme", price:400, icon:"🌙", th:"Midnight Office", en:"Midnight Office", descTh:"โทนน้ำเงินเที่ยงคืนเต็มหน้า พร้อมแสงเมืองและประกาย Office Night", descEn:"A full-page midnight-blue office atmosphere with city glow and subtle night lights", rarity:"rare" },
    { id:"sakuraNight", type:"theme", price:600, icon:"🌸", th:"Sakura Night", en:"Sakura Night", descTh:"ซากุระยามค่ำคืน โทนม่วงชมพูเข้มพร้อมกลีบดอกไม้เรืองแสง", descEn:"Night sakura in deep violet and pink with glowing drifting petals", rarity:"epic" },
    { id:"auroraGalaxy", type:"theme", price:900, icon:"🪐", th:"Aurora Galaxy", en:"Aurora Galaxy", descTh:"ออโรราผสมกาแล็กซีเต็มจอ มีดาวและเนบิวลาเคลื่อนไหวแบบ Premium", descEn:"Premium full-screen aurora galaxy with stars, nebula light and animated depth", rarity:"legendary" },
    { id:"goldenExecutive", type:"theme", price:1200, icon:"🏆", th:"Golden Executive", en:"Golden Executive", descTh:"Theme Finale สีดำทองหรู พร้อมแสงทองพาดผ่านและบรรยากาศ Legendary", descEn:"A luxurious finale black-and-gold theme with sweeping golden light", rarity:"legendary", finale:true }
  ];
  const EFFECTS = [
    { id:"none", type:"effect", price:0, icon:"○", nameKey:"noneEffect", descKey:"noneEffect", rarity:"common" },
    { id:"sparkle", type:"effect", price:120, icon:"✦", nameKey:"effectSparkle", descKey:"effectSparkleDesc", rarity:"common" },
    { id:"halo", type:"effect", price:200, icon:"◉", nameKey:"effectHalo", descKey:"effectHaloDesc", rarity:"rare" },
    { id:"celebration", type:"effect", price:350, icon:"🎉", nameKey:"effectCelebration", descKey:"effectCelebrationDesc", rarity:"rare" },
    { id:"fallingStars", type:"effect", price:350, icon:"🌠", th:"Falling Stars", en:"Falling Stars", descTh:"ดาวตกพาดผ่านหน้าจอเป็นระยะ พร้อมประกายแสงบาง ๆ รอบ Journey", descEn:"Shooting stars sweep across the screen with a soft luminous trail", rarity:"rare" },
    { id:"fireflies", type:"effect", price:500, icon:"✨", th:"Fireflies", en:"Fireflies", descTh:"หิ่งห้อยเรืองแสงลอยรอบหน้าจอแบบนุ่มนวล ดูสงบแต่โดดเด่น", descEn:"Soft glowing fireflies drift around the screen for a calm premium atmosphere", rarity:"epic" },
    { id:"galaxyTrail", type:"effect", price:750, icon:"💫", th:"Galaxy Trail", en:"Galaxy Trail", descTh:"อนุภาคกาแล็กซีหมุนและไหลผ่านหน้าจอ พร้อมแสงสีม่วงน้ำเงิน", descEn:"Galaxy particles orbit and flow across the screen with violet-blue light", rarity:"epic" },
    { id:"legendaryCelebration", type:"effect", price:1000, icon:"👑", th:"Legendary Celebration", en:"Legendary Celebration", descTh:"Finale Effect ระดับ Legendary: ดาว แสง วง Aura และ Confetti เต็มหน้าจอ", descEn:"Legendary finale effect with stars, aura rings, light bursts and full-screen confetti", rarity:"legendary", finale:true }
  ];
  const ACCESSORIES = [
    { id:"none", type:"accessory", price:0, icon:"○", th:"No Accessory", en:"No Accessory", descTh:"ใช้ Accessory ตามสถานะ Workday แบบเดิม", descEn:"Use the default Workday-state accessory", rarity:"common" },
    { id:"glasses", type:"accessory", price:120, icon:"👓", th:"Office Glasses", en:"Office Glasses", descTh:"แว่นออฟฟิศสำหรับ Mascot ที่อยากดูจริงจังขึ้นอีกนิด", descEn:"Office glasses for a smarter, focused Mascot look", rarity:"common" },
    { id:"headphones", type:"accessory", price:180, icon:"🎧", th:"Focus Headphones", en:"Focus Headphones", descTh:"หูฟังโหมด Focus แสดงบน Mascot และ Avatar ที่ใช้ Mascot", descEn:"Focus headphones shown on your Mascot and Mascot avatar", rarity:"rare" },
    { id:"laptop", type:"accessory", price:250, icon:"💻", th:"Work Laptop", en:"Work Laptop", descTh:"Laptop คู่ใจสำหรับโหมดทำงานจริงจังของ Mascot", descEn:"A work laptop companion for your productive Mascot", rarity:"rare" },
    { id:"crown", type:"accessory", price:500, icon:"👑", th:"Journey Crown", en:"Journey Crown", descTh:"มงกุฎ Limited สำหรับช่วง Finale ของ Workday Journey", descEn:"A limited crown made for the Workday Journey finale", rarity:"legendary", finale:true }
  ];
  const FRAMES = [
    { id:"none", type:"frame", price:0, icon:"○", th:"No Frame", en:"No Frame", descTh:"ใช้กรอบ Profile แบบมาตรฐาน", descEn:"Use the standard profile avatar frame", rarity:"common" },
    { id:"neonBlue", type:"frame", price:200, icon:"🔵", th:"Neon Blue Frame", en:"Neon Blue Frame", descTh:"กรอบ Neon สีฟ้า แสดงที่ Avatar ใน Sidebar, Topbar และ Profile", descEn:"Blue neon frame shown on Sidebar, Topbar and Profile avatars", rarity:"common" },
    { id:"sakuraFrame", type:"frame", price:300, icon:"🌸", th:"Sakura Frame", en:"Sakura Frame", descTh:"กรอบชมพูซากุระพร้อม Glow เบา ๆ รอบ Avatar", descEn:"Sakura-pink profile frame with a soft glow", rarity:"rare" },
    { id:"auroraFrame", type:"frame", price:450, icon:"🌌", th:"Aurora Frame", en:"Aurora Frame", descTh:"กรอบ Aurora ไล่สีพร้อมแสงเคลื่อนไหวรอบ Profile", descEn:"Animated aurora gradient frame around your profile avatar", rarity:"epic" },
    { id:"championGold", type:"frame", price:750, icon:"🏆", th:"Journey Champion Frame", en:"Journey Champion Frame", descTh:"กรอบทอง Legendary รุ่น Finale สำหรับโชว์ Journey ช่วงสุดท้าย", descEn:"Legendary gold finale frame for your completed Journey", rarity:"legendary", finale:true }
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
    const deal = source === "weekly" ? weeklyDealFor(reward) : null;
    const payPrice = deal ? deal.price : reward.price;
    const current = balance();
    if (current < payPrice) { toast("🪙", t("insufficient"), "error"); return; }
    const confirmText = deal
      ? (lang()==="th"
          ? `Weekly Deal ลด ${deal.discount}% · ใช้ ${payPrice.toLocaleString()} Coins (ปกติ ${reward.price.toLocaleString()}) เพื่อซื้อ ${rewardName(reward)}?`
          : `Weekly Deal ${deal.discount}% off · Spend ${payPrice.toLocaleString()} Coins (normally ${reward.price.toLocaleString()}) for ${rewardName(reward)}?`)
      : t("purchaseConfirm", {coins:payPrice,name:rewardName(reward)});
    if (!confirm(confirmText)) return;
    const list = ledger();
    const id = `spend:${reward.type}:${reward.id}`;
    if (!list.some(item => item.id === id)) {
      const dealSuffix = deal ? ` · Weekly Deal -${deal.discount}%` : "";
      list.push({
        id,
        amount:-payPrice,
        type:"purchase",
        labelTh:`ซื้อ ${rewardName(reward)}${dealSuffix}`,
        labelEn:`Purchased ${rewardName(reward)}${dealSuffix}`,
        createdAt:new Date().toISOString(),
        meta:{rewardType:reward.type,rewardId:reward.id,name:rewardName(reward),source:deal?"weekly":"shop",week:deal?.week||null,discountPct:deal?.discount||0,originalPrice:reward.price,paidPrice:payPrice}
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
    else if(!available) action = `<button type="button" class="v81-reward-btn finale-ended" disabled>🎓 ${esc(t("finaleEnded"))}</button>`;
    else action = `<button type="button" class="v81-reward-btn buy" data-v81-buy="${esc(reward.type)}:${esc(reward.id)}" ${currentBalance<reward.price?'data-low="1"':""}>🪙 ${reward.price.toLocaleString()} · ${esc(t("buy"))}</button>`;
    return `<article class="v81-reward-card ${owned?"owned":"locked"} ${equipped?"active":""} rarity-${esc(reward.rarity||"common")} ${reward.finale?"finale":""}" data-kind="${esc(reward.type)}" data-reward="${esc(reward.id)}"><div class="v831-card-badges"><span class="v831-rarity ${esc(reward.rarity||"common")}">${esc(rarityName(reward))}</span>${reward.finale?`<span class="v831-limited">${esc(t("limited"))}</span>`:""}</div><div class="v81-reward-visual" style="--reward-accent:${esc(reward.accent||"#6d8cff")}">${visual}</div><div class="v81-reward-copy"><div class="v81-reward-title"><strong>${esc(rewardName(reward))}</strong>${owned?`<span>${esc(t("owned"))}</span>`:`<span>🪙 ${reward.price}</span>`}</div><p>${esc(desc)}</p></div>${action}</article>`;
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
  function weeklyDealFor(reward){
    const week=weekKey();
    // Weighted weekly discount pool: normal deals are common, while 50% is a rare mega deal.
    // Deterministic seed keeps the exact same price for the whole weekly rotation.
    const discounts=[20,20,25,25,30,30,35,35,40,40,50];
    const discount=discounts[seedNumber(`weekly-deal:${week}:${reward.type}:${reward.id}`)%discounts.length];
    const price=Math.max(1,Math.round(Number(reward.price||0)*(100-discount)/100));
    return {week,discount,price,originalPrice:Number(reward.price||0)};
  }
  function weeklyResetLabel(){
    const now=API.getNow(), next=weekStartDate(addDays(now,7)); next.setHours(0,0,0,0); const ms=Math.max(0,next-now),d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000);
    return lang()==="th"?`ดีลใหม่ใน ${d} วัน ${h} ชม.`:`New deals in ${d}d ${h}h`;
  }
  function miniRewardCard(reward,kind){
    const owned=isOwned(reward),equipped=isEquipped(reward),available=rewardAvailable(reward),deal=kind==="weekly"?weeklyDealFor(reward):null;
    let action="";
    if(equipped) action=`<button type="button" disabled>✓ ${esc(t("equipped"))}</button>`;
    else if(owned) action=`<button type="button" data-v81-equip="${esc(reward.type)}:${esc(reward.id)}">${esc(t("equip"))}</button>`;
    else if(!available) action=`<button type="button" disabled>${esc(t("finaleEnded"))}</button>`;
    else if(deal) action=`<button type="button" class="v832-weekly-buy" data-v832-weekly-buy="${esc(reward.type)}:${esc(reward.id)}"><s>🪙 ${reward.price.toLocaleString()}</s><strong>🪙 ${deal.price.toLocaleString()}</strong></button>`;
    else action=`<button type="button" data-v81-buy="${esc(reward.type)}:${esc(reward.id)}">🪙 ${reward.price}</button>`;
    const isMega=!!deal&&deal.discount===50;
    const label=kind==="finale"?esc(t("limited")):(isMega?(lang()==="th"?"🔥 ดีลใหญ่":"🔥 MEGA DEAL"):esc(t("featured")));
    const typeLabels={mascot:lang()==="th"?"มาสคอต":"Mascot",accessory:lang()==="th"?"ของแต่ง":"Accessory",frame:lang()==="th"?"กรอบโปรไฟล์":"Profile Frame",theme:lang()==="th"?"ธีม":"Theme",effect:lang()==="th"?"เอฟเฟกต์":"Effect"};
    const typeLabel=typeLabels[reward.type]||reward.type;
    return `<article class="v831-mini-reward rarity-${esc(reward.rarity||"common")} ${deal?"v832-weekly-deal":""} ${isMega?"v834-mega-deal":""}">${deal?`<span class="v832-discount-badge ${isMega?"v834-mega-badge":""}">-${deal.discount}%</span>`:""}<div class="v831-mini-visual">${visualForReward(reward)}</div><div class="v831-mini-copy ${deal?"v832-deal-copy":""}"><span>${label}</span><strong>${esc(rewardName(reward))}</strong><small>${esc(rarityName(reward))} · ${esc(typeLabel)}</small></div>${action}</article>`;
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

    root.innerHTML = `<div class="v7-page-heading"><div class="v7-page-title"><span>🎁</span><div><p class="eyebrow">WORKDAY JOURNEY · V8.4</p><h2>${esc(t("shopTitle"))}</h2><p class="muted">${esc(t("shopHelp"))}</p></div></div></div>
      <section class="v81-wallet-hero"><div class="v81-wallet-main"><span>🪙</span><div><small>${esc(t("coinBalance"))}</small><strong>${bal.toLocaleString(lang()==="th"?"th-TH":"en-US")}</strong></div></div><div class="v81-wallet-stat"><small>${esc(t("lifetimeEarned"))}</small><b>+${earned.toLocaleString()}</b></div><div class="v81-wallet-stat"><small>${esc(t("lifetimeSpent"))}</small><b>-${spent.toLocaleString()}</b></div></section>
      ${collectionMarkup()}
      ${weeklyMarkup()}
      ${finaleMarkup()}
      <section class="v81-earn-card"><div><p class="eyebrow">${esc(t("howToEarn"))}</p><h3>${esc(t("retroTitle"))}</h3><p>${esc(t("retroHelp"))}</p></div><div class="v81-earn-grid"><span>🕒 <b>+15</b> ${esc(t("earnWorkday"))}</span><span>📓 <b>+10</b> ${esc(t("earnJournal"))}</span><span>🧩 <b>+50</b> ${esc(t("earnProject"))}</span><span>🏆 <b>+20 / +40 / +80 / +150</b> ${esc(t("earnAchievement"))}</span><span>🎯 <b>+5 – +20</b> Daily Mission</span><span>🎁 <b>+5 – +100</b> Daily / Weekly Chest</span></div></section>
      <div class="v81-shop-tabs">${[["mascots","🐣",t("mascots")],["accessories","🎩",t("accessories")],["frames","🖼",t("frames")],["themes","🎨",t("themes")],["effects","✨",t("effects")],["history","📜",t("history")]].map(([id,icon,label])=>`<button type="button" data-v81-tab="${id}" class="${tab===id?"active":""}">${icon}<span>${esc(label)}</span></button>`).join("")}</div>
      <section class="v81-shop-grid ${tab==="history"?"history":""}">${tabContent}</section>`;

    qa("[data-v831-category]",root).forEach(btn=>btn.addEventListener("click",()=>{const map={mascot:"mascots",accessory:"accessories",frame:"frames",theme:"themes",effect:"effects"};localStorage.setItem(KEYS.tab,map[btn.dataset.v831Category]||"mascots");renderShop();}));
    qa("[data-v81-tab]", root).forEach(btn => btn.addEventListener("click", () => { localStorage.setItem(KEYS.tab, btn.dataset.v81Tab); renderShop(); }));
    qa("[data-v81-buy]", root).forEach(btn => btn.addEventListener("click", () => { const [type,id]=btn.dataset.v81Buy.split(":"); purchaseReward(rewardBy(type,id)); }));
    qa("[data-v832-weekly-buy]", root).forEach(btn => btn.addEventListener("click", () => { const [type,id]=btn.dataset.v832WeeklyBuy.split(":"); purchaseReward(rewardBy(type,id),"weekly"); }));
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
    root.innerHTML=`<div class="v7-page-heading"><div class="v7-page-title"><span>🎯</span><div><p class="eyebrow">WORKDAY JOURNEY · V8.4</p><h2>${lang()==="th"?"Daily Missions":"Daily Missions"}</h2><p class="muted">${lang()==="th"?"ภารกิจสุ่มใหม่ทุกวัน ทำให้ครบเพื่อเปิด Daily Chest และสะสมวันสำหรับ Weekly Chest":"Fresh missions every day. Complete all three to open a Daily Chest and build toward the Weekly Chest."}</p></div></div></div>${trial?`<section class="v82-trial-banner">🌈 <div><strong>${esc(rewardName(rewardBy("theme",trial.themeId)))} Theme Trial</strong><span>${lang()==="th"?"ใช้งานได้ถึง":"Active until"} ${esc(formatHistoryDate(trial.expiresAt))}</span></div></section>`:""}<section class="v82-mission-hero"><div><span>🎯</span><div><small>${lang()==="th"?"ภารกิจวันนี้":"TODAY'S MISSIONS"}</small><strong>${claimed}/3</strong></div></div><div><small>${lang()==="th"?"รับ Coin วันนี้จาก Mission":"Mission Coins Today"}</small><b>+${ledger().filter(x=>String(x.id||"").startsWith(`earn:mission:${key}:`)).reduce((a,x)=>a+Number(x.amount||0),0)} 🪙</b></div></section><section class="v82-mission-list">${cards}</section><section class="v82-chest-grid"><article class="v82-chest-card daily ${dailyReady?"ready":""}"><div class="v82-chest-art">🎁</div><div><p class="eyebrow">DAILY CHEST</p><h3>${dailyOpen?(lang()==="th"?"เปิดแล้ววันนี้":"Opened today"):(dailyReady?(lang()==="th"?"พร้อมเปิด!":"Ready to open!"):(lang()==="th"?`ทำภารกิจ ${claimed}/3`:`Missions ${claimed}/3`))}</h3><p>${lang()==="th"?"สุ่ม 5–30 Coins, Theme Trial 24h หรือ Mascot XP":"Random 5–30 Coins, a 24h Theme Trial, or Mascot XP"}</p></div><button type="button" data-v82-chest="daily" ${!dailyReady?"disabled":""}>${dailyOpen?"✓ OPENED":"OPEN CHEST"}</button></article><article class="v82-chest-card weekly ${weeklyReady?"ready":""}"><div class="v82-chest-art">🏆</div><div><p class="eyebrow">WEEKLY CHEST</p><h3>${weeklyOpen?(lang()==="th"?"เปิดแล้วสัปดาห์นี้":"Opened this week"):(weeklyReady?(lang()==="th"?"พร้อมเปิด!":"Ready to open!"):`${weeklyDone}/5 DAYS`)}</h3><p>${lang()==="th"?"เปิด Daily Chest ครบ 5 วัน · รางวัลใหญ่ 40–100 Coins, Theme Trial 48h หรือ Mascot XP":"Open Daily Chests on 5 days · bigger rewards: 40–100 Coins, 48h Theme Trial, or Mascot XP"}</p></div><button type="button" data-v82-chest="weekly" ${!weeklyReady?"disabled":""}>${weeklyOpen?"✓ OPENED":"OPEN WEEKLY"}</button></article></section>`;
    qa("[data-v82-claim]",root).forEach(btn=>btn.addEventListener("click",()=>claimMission(btn.dataset.v82Claim)));
    qa("[data-v82-chest]",root).forEach(btn=>btn.addEventListener("click",()=>openChest(btn.dataset.v82Chest)));
  }


  // ---------- V8.3 Work Bank + Savings + Daily Interest ----------
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
  function bankTier(amount=bankBalance()){
    const value=Math.max(0,Number(amount)||0); return BANK_TIERS.find(t=>value>=t.min&&value<=t.max)||BANK_TIERS[BANK_TIERS.length-1];
  }
  function bankDailyInterest(amount=bankBalance()){
    const value=Math.max(0,Number(amount)||0),tier=bankTier(value); return roundBank(Math.min(BANK_DAILY_CAP,value*tier.rate));
  }
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
  function settleBankInterest({notify=false}={}){
    const today=dayKeyNow(),state=bankState(),list=bankLedger(); let amount=bankBalance(list);
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
      const tier=bankTier(amount),interest=roundBank(Math.min(BANK_DAILY_CAP,amount*tier.rate));
      if(interest>0){
        list.push({id,amount:interest,type:"interest",labelTh:`ดอกเบี้ยรายวัน · ${bankDateLabel(key)}`,labelEn:`Daily Interest · ${bankDateLabel(key)}`,createdAt:isoFromDateKey(key),meta:{date:key,rate:tier.rate,tier:tier.id,balanceBefore:amount,cap:BANK_DAILY_CAP}});
        amount=roundBank(amount+interest); total=roundBank(total+interest); changed=true;
      }
      state.lastInterestDate=key;
    }
    if(changed)write(KEYS.bankLedger,list); saveBankState(state);
    if(notify&&total>0)toast("🏦",`${lang()==="th"?"รับดอกเบี้ยแล้ว":"Interest credited"} +${formatBankCoin(total)} Coins`,`success`);
    return total;
  }
  function bankDeposit(rawAmount){
    settleBankInterest({notify:false});
    const amount=Math.floor(Number(rawAmount)||0),wallet=balance();
    if(amount<1){toast("🏦",lang()==="th"?"กรุณาระบุจำนวน Coin ที่ต้องการฝาก":"Enter the amount of Coins to deposit","error");return;}
    if(amount>wallet){toast("🪙",t("insufficient"),"error");return;}
    const now=new Date().toISOString(),tx=bankTxId("deposit"),walletList=ledger(),bankList=bankLedger(),state=bankState(),wasEmpty=bankBalance(bankList)<=0;
    walletList.push({id:`${tx}:wallet`,amount:-amount,type:"bank_deposit",labelTh:`ฝากเข้า Work Bank · ${amount} Coins`,labelEn:`Work Bank Deposit · ${amount} Coins`,createdAt:now,meta:{bankTx:tx}});
    bankList.push({id:`${tx}:savings`,amount,type:"deposit",labelTh:`ฝากจาก Wallet · ${amount} Coins`,labelEn:`Deposit from Wallet · ${amount} Coins`,createdAt:now,meta:{bankTx:tx}});
    if(!state.openedAt)state.openedAt=now; if(wasEmpty||!state.lastInterestDate)state.lastInterestDate=dayKeyNow();
    write(KEYS.ledger,walletList);write(KEYS.bankLedger,bankList);saveBankState(state);
    toast("🏦",`${lang()==="th"?"ฝากสำเร็จ":"Deposited"} ${amount.toLocaleString(bankLocale())} Coins`,`success`);refreshAll();
  }
  function bankWithdraw(rawAmount){
    settleBankInterest({notify:false});
    const savings=bankBalance(),amount=Math.floor(Number(rawAmount)||0);
    if(amount<1){toast("🏦",lang()==="th"?"กรุณาระบุจำนวน Coin ที่ต้องการถอน":"Enter the amount of Coins to withdraw","error");return;}
    if(amount>Math.floor(savings)){toast("🏦",lang()==="th"?"ยอด Savings ไม่เพียงพอ":"Not enough Savings","error");return;}
    const now=new Date().toISOString(),tx=bankTxId("withdraw"),walletList=ledger(),bankList=bankLedger(),state=bankState();
    walletList.push({id:`${tx}:wallet`,amount,type:"bank_withdraw",labelTh:`ถอนจาก Work Bank · ${amount} Coins`,labelEn:`Work Bank Withdrawal · ${amount} Coins`,createdAt:now,meta:{bankTx:tx}});
    bankList.push({id:`${tx}:savings`,amount:-amount,type:"withdraw",labelTh:`ถอนกลับ Wallet · ${amount} Coins`,labelEn:`Withdraw to Wallet · ${amount} Coins`,createdAt:now,meta:{bankTx:tx}});
    if(roundBank(savings-amount)<=0)state.lastInterestDate=dayKeyNow();
    write(KEYS.ledger,walletList);write(KEYS.bankLedger,bankList);saveBankState(state);
    toast("🏦",`${lang()==="th"?"ถอนสำเร็จ":"Withdrawn"} ${amount.toLocaleString(bankLocale())} Coins`,`success`);refreshAll();
  }
  function bankProjection(days,starting=bankBalance()){
    let value=Math.max(0,Number(starting)||0),interest=0;
    for(let i=0;i<days;i++){const gain=roundBank(Math.min(BANK_DAILY_CAP,value*bankTier(value).rate));value=roundBank(value+gain);interest=roundBank(interest+gain);}
    return {balance:value,interest};
  }
  function bankHistoryLabel(item){return lang()==="th"?(item.labelTh||item.labelEn||item.type):(item.labelEn||item.labelTh||item.type);}
  function renderBank(){
    const root=$("v83BankPage");if(!root)return;
    settleBankInterest({notify:true});
    const wallet=balance(),list=bankLedger().slice().sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)),savings=bankBalance(list),tier=bankTier(savings),daily=bankDailyInterest(savings),earned=bankInterestEarned(list),p7=bankProjection(7,savings),p30=bankProjection(30,savings),state=bankState();
    const tierIndex=BANK_TIERS.findIndex(x=>x.id===tier.id),next=BANK_TIERS[tierIndex+1]||null,nextGap=next?Math.max(0,roundBank(next.min-savings)):0;
    const tierCards=BANK_TIERS.map(item=>`<article class="v83-tier-card ${item.id===tier.id?"active":""}"><span>${item.icon}</span><div><strong>${esc(lang()==="th"?item.th:item.en)}</strong><small>${item.max===Infinity?`${item.min.toLocaleString()}+`:`${item.min.toLocaleString()}–${Math.floor(item.max).toLocaleString()}`} Coins</small></div><b>${(item.rate*100).toFixed(2)}%<small>/day</small></b></article>`).join("");
    const history=list.length?list.slice(0,60).map(item=>{const n=Number(item.amount||0),kind=item.type==="interest"?"interest":n>=0?"deposit":"withdraw";return `<div class="v83-bank-history-row ${kind}"><span>${item.type==="interest"?"✨":item.type==="deposit"?"↓":"↑"}</span><div><strong>${esc(bankHistoryLabel(item))}</strong><small>${esc(formatHistoryDate(item.createdAt))}</small></div><b>${n>=0?"+":""}${formatBankCoin(n)} 🪙</b></div>`;}).join(""):`<div class="empty-state">🏦 ${lang()==="th"?"ยังไม่มีรายการฝากถอน":"No bank transactions yet"}</div>`;
    root.innerHTML=`<div class="v7-page-heading"><div class="v7-page-title"><span>🏦</span><div><p class="eyebrow">WORKDAY JOURNEY · V8.4</p><h2>Work Bank</h2><p class="muted">${lang()==="th"?"ฝาก Work Coins เพื่อรับดอกเบี้ยรายวันแบบทบต้น และถอนกลับ Wallet ได้ทุกเวลา":"Save Work Coins for compounding daily interest and withdraw to your Wallet anytime."}</p></div></div></div>
      <section class="v83-bank-hero"><div class="v83-bank-balance"><div class="v83-bank-orb">🏦</div><div><small>${lang()==="th"?"SAVINGS BALANCE":"SAVINGS BALANCE"}</small><strong>${formatBankCoin(savings)} <i>🪙</i></strong><span>${tier.icon} ${esc(lang()==="th"?tier.th:tier.en)} · ${(tier.rate*100).toFixed(2)}% / day</span></div></div><div class="v83-bank-kpis"><article><small>${lang()==="th"?"Wallet ใช้จ่ายได้":"Wallet available"}</small><b>${wallet.toLocaleString(bankLocale())} 🪙</b></article><article><small>${lang()==="th"?"ดอกเบี้ยรอบถัดไป":"Next daily interest"}</small><b>+${formatBankCoin(daily)} 🪙</b></article><article><small>${lang()==="th"?"ดอกเบี้ยสะสม":"Interest earned"}</small><b>+${formatBankCoin(earned)} 🪙</b></article></div></section>
      <section class="v83-bank-actions"><article class="v83-bank-action-card deposit"><div><span>↓</span><div><p class="eyebrow">DEPOSIT</p><h3>${lang()==="th"?"ฝากเข้า Savings":"Move to Savings"}</h3><p>${lang()==="th"?"Coin ที่ฝากจะไม่สามารถซื้อ Reward ได้จนกว่าจะถอนกลับ Wallet":"Saved Coins cannot be spent in the Reward Shop until withdrawn."}</p></div></div><div class="v83-bank-input"><span>🪙</span><input id="v83DepositAmount" type="number" min="1" step="1" inputmode="numeric" placeholder="0"><button type="button" data-v83-deposit>DEPOSIT</button></div><div class="v83-bank-quick">${[25,50,100].map(p=>`<button type="button" data-v83-deposit-pct="${p}">${p===100?"MAX":p+"%"}</button>`).join("")}</div></article>
      <article class="v83-bank-action-card withdraw"><div><span>↑</span><div><p class="eyebrow">WITHDRAW</p><h3>${lang()==="th"?"ถอนกลับ Wallet":"Return to Wallet"}</h3><p>${lang()==="th"?`ถอนได้สูงสุด ${Math.floor(savings).toLocaleString(bankLocale())} Coins · เศษดอกเบี้ยจะคงอยู่ใน Savings`:`Withdraw up to ${Math.floor(savings).toLocaleString(bankLocale())} Coins · fractional interest stays in Savings.`}</p></div></div><div class="v83-bank-input"><span>🪙</span><input id="v83WithdrawAmount" type="number" min="1" step="1" inputmode="numeric" placeholder="0"><button type="button" data-v83-withdraw>WITHDRAW</button></div><div class="v83-bank-quick">${[25,50,100].map(p=>`<button type="button" data-v83-withdraw-pct="${p}">${p===100?"MAX":p+"%"}</button>`).join("")}</div></article></section>
      <section class="v83-bank-growth"><article><p class="eyebrow">SAVINGS TIER</p><h3>${tier.icon} ${esc(lang()==="th"?tier.th:tier.en)}</h3><div class="v83-tier-list">${tierCards}</div>${next?`<p class="v83-next-tier">${lang()==="th"?`อีก ${formatBankCoin(nextGap)} Coins ถึง ${next.icon} ${next.th}`:`${formatBankCoin(nextGap)} Coins to ${next.icon} ${next.en}`}</p>`:`<p class="v83-next-tier max">👑 ${lang()==="th"?"คุณอยู่ Tier สูงสุดแล้ว":"You are at the highest tier"}</p>`}</article><article class="v83-projection"><p class="eyebrow">INTEREST FORECAST</p><h3>${lang()==="th"?"ประมาณการเติบโต":"Growth projection"}</h3><div><span><small>7 DAYS</small><b>+${formatBankCoin(p7.interest)} 🪙</b><em>${formatBankCoin(p7.balance)} total</em></span><span><small>30 DAYS</small><b>+${formatBankCoin(p30.interest)} 🪙</b><em>${formatBankCoin(p30.balance)} total</em></span></div><p>${lang()==="th"?`ดอกเบี้ยทบต้นทุกวัน สูงสุด ${BANK_DAILY_CAP} Coins/วัน · ระบบเครดิตเมื่อเปิดเว็บหลังขึ้นวันใหม่`:`Interest compounds daily, capped at ${BANK_DAILY_CAP} Coins/day · credited on the first app visit after a new day starts.`}</p></article></section>
      <section class="v83-bank-history"><div class="v83-bank-section-head"><div><p class="eyebrow">BANK LEDGER</p><h3>${lang()==="th"?"ประวัติ Savings":"Savings history"}</h3></div><span>${state.openedAt?`${lang()==="th"?"เปิดบัญชี":"Opened"} ${esc(formatHistoryDate(state.openedAt))}`:(lang()==="th"?"ยังไม่ได้ฝาก Coin":"No deposit yet")}</span></div><div class="v83-bank-history-list">${history}</div></section>`;
    const dep=$("v83DepositAmount"),wd=$("v83WithdrawAmount");
    q("[data-v83-deposit]",root)?.addEventListener("click",()=>bankDeposit(dep?.value));q("[data-v83-withdraw]",root)?.addEventListener("click",()=>bankWithdraw(wd?.value));
    qa("[data-v83-deposit-pct]",root).forEach(btn=>btn.addEventListener("click",()=>{if(dep)dep.value=Math.floor(wallet*Number(btn.dataset.v83DepositPct||0)/100)||"";}));
    qa("[data-v83-withdraw-pct]",root).forEach(btn=>btn.addEventListener("click",()=>{if(wd)wd.value=Math.floor(savings*Number(btn.dataset.v83WithdrawPct||0)/100)||"";}));
    [dep,wd].filter(Boolean).forEach(input=>input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();input===dep?bankDeposit(input.value):bankWithdraw(input.value);}}));
  }

  // ---------- V8.4 Work Exchange ----------
  const EXCHANGE_EPOCH_KEY = "2026-05-05";
  const EXCHANGE_FEE_RATE = 0.01;
  const EXCHANGE_SLOTS = [9,11,13,15];
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
    {id:"first-trade",icon:"📈",th:"First Trade",en:"First Trade",descTh:"ซื้อหรือขายหุ้นครั้งแรก",descEn:"Complete your first trade"},
    {id:"investor",icon:"💼",th:"Investor",en:"Investor",descTh:"ถือหุ้นพร้อมกันอย่างน้อย 3 บริษัท",descEn:"Hold at least 3 companies at once"},
    {id:"green-portfolio",icon:"💚",th:"Green Portfolio",en:"Green Portfolio",descTh:"Portfolio มีกำไรรวมเป็นบวก",descEn:"Reach a positive total portfolio P/L"},
    {id:"market-winner",icon:"🔥",th:"Market Winner",en:"Market Winner",descTh:"กำไรรวมแตะ 100 Coins",descEn:"Reach 100 Coins of total P/L"},
    {id:"diamond-hands",icon:"💎",th:"Diamond Hands",en:"Diamond Hands",descTh:"ถือหุ้นตัวเดิมต่อเนื่องอย่างน้อย 5 วัน",descEn:"Hold the same stock for at least 5 days"},
    {id:"exchange-master",icon:"🏆",th:"Exchange Master",en:"Exchange Master",descTh:"Portfolio Value แตะ 2,500 Coins",descEn:"Reach a 2,500 Coin portfolio value"}
  ];

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
    for(let i=0;i<EXCHANGE_SLOTS.length;i++){
      const noise=(exchangeSeedUnit(`${symbol}|${key}|${i}`)*2-1)*stock.vol;
      const eventStep=event/EXCHANGE_SLOTS.length;
      price=Math.max(5,price*(1+stock.drift/EXCHANGE_SLOTS.length+noise+eventStep));
      slots.push(exchangeRound(price));
    }
    const values=[open,...slots],row={key,open:exchangeRound(open),slots,close:slots.at(-1),high:exchangeRound(Math.max(...values)),low:exchangeRound(Math.min(...values)),prevClose:exchangeRound(prevClose)};
    exchangeDayCache.set(cacheKey,row); return row;
  }
  function exchangeMarketContext(now=API.getNow()){
    const cfg=API.getConfig(),end=dateFromKey(cfg.endDate),endMinutes=String(cfg.workdayEnd||"16:10").split(":").map(Number),endAt=new Date(end.getFullYear(),end.getMonth(),end.getDate(),endMinutes[0]||16,endMinutes[1]||10);
    const final=now.getTime()>endAt.getTime();
    let anchor=final?new Date(end):new Date(now.getFullYear(),now.getMonth(),now.getDate());
    if(!exchangeBusinessDay(anchor))anchor=exchangePrevBusiness(anchor);
    const mins=now.getHours()*60+now.getMinutes();let slot=3,phase="closed",isOpen=false;
    if(!final&&exchangeBusinessDay(new Date(now.getFullYear(),now.getMonth(),now.getDate()))){
      if(mins<540){anchor=exchangePrevBusiness(new Date(now.getFullYear(),now.getMonth(),now.getDate()));slot=3;phase="preopen";}
      else if(mins<660){slot=0;phase="open";isOpen=true;}
      else if(mins<780){slot=1;phase="open";isOpen=true;}
      else if(mins<900){slot=2;phase="open";isOpen=true;}
      else if(mins<960){slot=3;phase="open";isOpen=true;}
      else{slot=3;phase="closed";}
    }
    const key=dateKey(anchor);let nextLabel="";
    if(final)nextLabel=lang()==="th"?"Journey สิ้นสุดแล้ว":"Journey ended";
    else if(isOpen){const next=slot<3?EXCHANGE_SLOTS[slot+1]:16;nextLabel=slot<3?`${String(next).padStart(2,"0")}:00`:(lang()==="th"?"ปิดตลาด 16:00":"Closes 16:00");}
    else{const nextDay=exchangeNextBusiness(new Date(now.getFullYear(),now.getMonth(),now.getDate()));nextLabel=mins<540&&exchangeBusinessDay(new Date(now.getFullYear(),now.getMonth(),now.getDate()))?"09:00":`${dateKey(nextDay)} · 09:00`;}
    return {now,final,key,slot,isOpen,phase,nextLabel,canTrade:isOpen&&!final};
  }
  function exchangeSnapshot(stock,ctx=exchangeMarketContext()){
    const day=exchangeDayPath(stock.symbol,ctx.key),price=ctx.slot>=0?day.slots[Math.min(3,ctx.slot)]:day.prevClose;
    const seen=[day.open,...day.slots.slice(0,Math.min(3,ctx.slot)+1)],changePct=day.prevClose?((price-day.prevClose)/day.prevClose*100):0;
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
    const ctx=exchangeMarketContext();if(!ctx.canTrade){toast("📈",lang()==="th"?"ซื้อขายได้เฉพาะช่วงตลาดเปิด 09:00–16:00 วันจันทร์–ศุกร์":"Trading is available only while the market is open, 09:00–16:00 Monday–Friday","warning");return;}
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
    const trades=exchangeTrades(),ctx=exchangeMarketContext(),portfolio=exchangePortfolio(trades,exchangeSnapshots(ctx)),now=Date.now(),conditions={
      "first-trade":trades.length>=1,
      investor:portfolio.positions.length>=3,
      "green-portfolio":trades.length>0&&portfolio.totalPnl>0,
      "market-winner":portfolio.totalPnl>=100,
      "diamond-hands":portfolio.positions.some(p=>p.firstBuyAt&&(now-new Date(p.firstBuyAt).getTime())>=5*86400000),
      "exchange-master":portfolio.value>=2500
    },state=exchangeAchievementState();let added=[];
    EXCHANGE_ACHIEVEMENTS.forEach(a=>{if(conditions[a.id]&&!state[a.id]){state[a.id]=new Date().toISOString();added.push(a);}});if(added.length){write(KEYS.exchangeAchievements,state);if(notify)toast("🏆",lang()==="th"?`ปลดล็อก Trading Achievement: ${added.map(a=>a.th).join(", ")}`:`Trading achievement unlocked: ${added.map(a=>a.en).join(", ")}`,"success");}return{state,conditions};
  }
  function exchangeTraderRank(portfolio,trades){const score=(portfolio.totalPnl>=300?3:portfolio.totalPnl>=100?2:portfolio.totalPnl>0?1:0)+(portfolio.value>=2500?3:portfolio.value>=1200?2:portfolio.value>=400?1:0)+(trades.length>=10?2:trades.length>=3?1:0);return score>=7?{icon:"👑",th:"ตำนานตลาด",en:"Market Legend"}:score>=5?{icon:"💎",th:"โปรเทรดเดอร์",en:"Pro Trader"}:score>=3?{icon:"📈",th:"นักลงทุน",en:"Investor"}:score>=1?{icon:"🌱",th:"เทรดเดอร์มือใหม่",en:"Rookie Trader"}:{icon:"🧭",th:"นักสำรวจตลาด",en:"Explorer"};}
  function exchangeFinaleInfo(ctx,portfolio,trades){const cfg=API.getConfig(),end=dateFromKey(cfg.endDate),days=Math.max(0,Math.ceil((end.getTime()-ctx.now.getTime())/86400000)),rank=exchangeTraderRank(portfolio,trades),best=[...portfolio.positions].sort((a,b)=>b.pnl-a.pnl)[0],worst=[...portfolio.positions].sort((a,b)=>a.pnl-b.pnl)[0],bestTrade=[...trades].filter(t=>t.side==="sell").sort((a,b)=>(b.realizedPnl||0)-(a.realizedPnl||0))[0];return{days,rank,best,worst,bestTrade};}
  function exchangeEventEffectText(event){const parts=Object.entries(event.effects||{}).map(([s,v])=>`${s} ${v>0?"↑":"↓"}${Math.abs(v)>=.035?"↑":""}`);return parts.join(" · ");}
  function exchangeTradeHistoryMarkup(trades){if(!trades.length)return `<div class="empty-state">📜 ${lang()==="th"?"ยังไม่มีประวัติการซื้อขาย":"No trades yet"}</div>`;return trades.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,60).map(tr=>`<div class="v84-history-row ${tr.side}"><span>${tr.side==="buy"?"BUY":"SELL"}</span><div><strong>${tr.symbol} · ${tr.qty} ${lang()==="th"?"หุ้น":"shares"} @ ${Number(tr.price).toFixed(2)}</strong><small>${esc(formatHistoryDate(tr.createdAt))} · Fee ${Number(tr.fee||0)} 🪙</small></div><b>${tr.walletAmount>=0?"+":""}${Number(tr.walletAmount||0).toLocaleString()} 🪙</b></div>`).join("");}
  function renderExchange(){
    const root=$("v84ExchangePage");if(!root)return;const ctx=exchangeMarketContext(),snaps=exchangeSnapshots(ctx),portfolio=exchangePortfolio(exchangeTrades(),snaps),trades=exchangeTrades(),watch=exchangeWatchlist(),selected=exchangeSelected(),snap=snaps.find(s=>s.symbol===selected)||snaps[0],range=exchangeRange(),points=exchangeHistory(selected,range,ctx),event=exchangeEventForKey(ctx.key),sentiment=exchangeSentiment(snaps),earned=reconcileExchangeAchievements({notify:false}).state;
    const movers=[...snaps].sort((a,b)=>b.changePct-a.changePct),gainers=movers.slice(0,2),losers=[...snaps].sort((a,b)=>a.changePct-b.changePct).slice(0,2),pos=portfolio.positions.find(p=>p.symbol===selected),held=pos?.qty||0,wallet=balance(),maxBuy=exchangeMaxBuy(snap.price,wallet),finale=exchangeFinaleInfo(ctx,portfolio,trades),statusClass=ctx.isOpen?"open":ctx.final?"final":"closed";
    const watchRows=[...watch].map(symbol=>snaps.find(s=>s.symbol===symbol)).filter(Boolean);const watchMarkup=watchRows.length?watchRows.map(s=>`<button type="button" class="v84-watch-chip ${s.changePct>=0?"up":"down"}" data-v84-select="${s.symbol}"><span>${s.icon}</span><strong>${s.symbol}</strong><b>${s.price.toFixed(2)}</b><small>${s.changePct>=0?"+":""}${s.changePct.toFixed(2)}%</small></button>`).join(""):`<span class="v84-watch-empty">⭐ ${lang()==="th"?"กดดาวหุ้นที่สนใจเพื่อเพิ่ม Watchlist":"Star a stock to add it to your watchlist"}</span>`;
    const stockRows=snaps.map(s=>`<button type="button" class="v84-stock-row ${s.symbol===selected?"active":""}" data-v84-select="${s.symbol}"><span class="v84-stock-icon">${s.icon}</span><div><strong>${s.symbol}</strong><small>${esc(lang()==="th"?s.th:s.name)}</small></div><span class="v84-risk ${s.risk}">${esc(exchangeRiskLabel(s.risk))}</span><b>${s.price.toFixed(2)}</b><em class="${s.changePct>=0?"up":"down"}">${s.changePct>=0?"+":""}${s.changePct.toFixed(2)}%</em><i data-v84-watch="${s.symbol}" class="${watch.has(s.symbol)?"on":""}" title="Watchlist">${watch.has(s.symbol)?"★":"☆"}</i></button>`).join("");
    const portfolioRows=portfolio.positions.length?portfolio.positions.map(p=>`<button type="button" class="v84-portfolio-row" data-v84-select="${p.symbol}"><span>${p.stock.icon}</span><div><strong>${p.symbol}</strong><small>${p.qty} ${lang()==="th"?"หุ้น":"shares"} · Avg ${p.avgCost.toFixed(2)}</small></div><b>${p.value.toFixed(2)} 🪙</b><em class="${p.pnl>=0?"up":"down"}">${p.pnl>=0?"+":""}${p.pnl.toFixed(2)} (${p.pnlPct>=0?"+":""}${p.pnlPct.toFixed(1)}%)</em></button>`).join(""):`<div class="empty-state">💼 ${lang()==="th"?"ยังไม่มีหุ้นใน Portfolio":"Your portfolio is empty"}</div>`;
    const ach=EXCHANGE_ACHIEVEMENTS.map(a=>`<article class="v84-ach ${earned[a.id]?"unlocked":"locked"}"><span>${earned[a.id]?a.icon:"🔒"}</span><div><strong>${esc(lang()==="th"?a.th:a.en)}</strong><small>${esc(lang()==="th"?a.descTh:a.descEn)}</small></div>${earned[a.id]?`<b>✓</b>`:""}</article>`).join("");
    root.innerHTML=`<div class="v7-page-heading"><div class="v7-page-title"><span>📈</span><div><p class="eyebrow">WORKDAY JOURNEY · V8.4</p><h2>Work Exchange</h2><p class="muted">${lang()==="th"?"ตลาดหุ้นจำลองที่ใช้ Work Coins เท่านั้น · ราคาอัปเดตตามรอบตลาดและเหมือนกันใน Seed เดียวกัน · ไม่มีเงินจริง":"A simulated Work Coin market with deterministic price rounds. No real money is involved."}</p></div></div><div class="v84-market-status ${statusClass}"><i></i><div><strong>${esc(exchangeStatusLabel(ctx))}</strong><small>${lang()==="th"?"รอบถัดไป":"Next"}: ${esc(ctx.nextLabel)}</small></div></div></div>
      <section class="v84-kpis"><article><span>🪙</span><div><small>${lang()==="th"?"Wallet":"Wallet"}</small><strong>${wallet.toLocaleString()} 🪙</strong></div></article><article><span>💼</span><div><small>Portfolio Value</small><strong>${portfolio.value.toFixed(2)} 🪙</strong></div></article><article class="${portfolio.totalPnl>=0?"up":"down"}"><span>📊</span><div><small>Total P/L</small><strong>${portfolio.totalPnl>=0?"+":""}${portfolio.totalPnl.toFixed(2)} 🪙</strong><em>${portfolio.returnPct>=0?"+":""}${portfolio.returnPct.toFixed(2)}%</em></div></article><article class="${sentiment.tone}"><span>${sentiment.icon}</span><div><small>Market Sentiment</small><strong>${esc(lang()==="th"?sentiment.th:sentiment.en)}</strong></div></article></section>
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
    const qty=$("v84TradeQty"),preview=$("v84TradePreview");const updatePreview=()=>{if(!qty||!preview)return;const n=Math.max(0,Math.floor(Number(qty.value)||0)),gross=Math.round(snap.price*n),fee=n?Math.max(1,Math.round(gross*EXCHANGE_FEE_RATE)):0;preview.innerHTML=`<span>${lang()==="th"?"มูลค่า":"Value"} <b>${gross.toLocaleString()} 🪙</b></span><span>Fee 1% <b>${fee.toLocaleString()} 🪙</b></span><span>${lang()==="th"?"ซื้อรวม":"Buy total"} <b>${(gross+fee).toLocaleString()} 🪙</b></span><span>${lang()==="th"?"ขายสุทธิ":"Sell net"} <b>${Math.max(0,gross-fee).toLocaleString()} 🪙</b></span>`;};qty?.addEventListener("input",updatePreview);updatePreview();
    qa("[data-v84-qty]",root).forEach(btn=>btn.addEventListener("click",()=>{if(!qty)return;qty.value=btn.dataset.v84Qty==="max"?String(Math.max(held,maxBuy)):btn.dataset.v84Qty;updatePreview();}));
    qa("[data-v84-trade]",root).forEach(btn=>btn.addEventListener("click",()=>exchangeTrade(btn.dataset.v84Trade,selected,qty?.value)));
  }


  function refreshAll() {
    markRouteVisit();
    applyEquippedRewards();
    ensureCoinChip();
    if (location.hash.includes("/rewards")) renderShop();
    if (location.hash.includes("/missions")) renderMissions();
    if (location.hash.includes("/bank")) renderBank();
    if (location.hash.includes("/exchange")) renderExchange();
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
    renderShop,
    renderMissions,
    renderBank,
    renderExchange,
    getExchangePortfolio: () => exchangePortfolio(),
    getExchangeTrades: () => exchangeTrades().map(x=>({...x})),
    getExchangeMarket: () => exchangeSnapshots().map(x=>({...x})),
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

  function initialReconcile(attempt=0) {
    const cloudApi = window.WorkdayV8Cloud;
    const status = cloudApi?.getStatus?.() || {status:"local",signedIn:false};
    const rememberedUser = !!localStorage.getItem("wp-v8-cloud-user-id");
    const waitingForSession = rememberedUser && !status.signedIn && attempt < 12;
    const waitingForCloud = status.signedIn && (status.status === "syncing" || status.status === "error") && attempt < 20;
    if (waitingForSession || waitingForCloud) { setTimeout(() => initialReconcile(attempt + 1), 500); return; }
    settleBankInterest({notify:false});
    reconcileRewards({notify:true});
  }

  function init() {
    const owned = ownedRewards(); saveOwned(owned);
    applyEquippedRewards();
    ensureCoinChip();
    settleBankInterest({notify:false});
    setTimeout(() => initialReconcile(), 700);
    window.addEventListener("workday:v7-data-changed", () => setTimeout(() => reconcileRewards({notify:true}), 80));
    window.addEventListener("workday:v8-data-changed", () => setTimeout(() => { settleBankInterest({notify:false}); reconcileRewards({notify:false}); }, 80));
    window.addEventListener("storage", event => { if (String(event.key||"").startsWith("wp-v81-") || String(event.key||"").startsWith("wp-v82-") || String(event.key||"").startsWith("wp-v83-") || String(event.key||"").startsWith("wp-v831-") || String(event.key||"").startsWith("wp-v84-")) refreshAll(); });
    window.addEventListener("hashchange", () => { markRouteVisit(); setTimeout(refreshAll,40); });
    document.addEventListener("visibilitychange", () => { if (!document.hidden) { settleBankInterest({notify:true}); reconcileRewards({notify:false}); } });
    window.addEventListener("online", () => reconcileRewards({notify:false}));
    setInterval(() => reconcileRewards({notify:true}), 15000);
    setInterval(() => settleBankInterest({notify:true}), 60000);
    setInterval(() => ensureCoinChip(), 3000);
    setTimeout(() => {
      refreshAll();
      try { window.dispatchEvent(new CustomEvent("workday:v7-data-changed")); } catch {}
    }, 350);
  }

  init();
})();
