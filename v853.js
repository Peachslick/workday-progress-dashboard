(() => {
  "use strict";

  const VERSION = "8.6.0.1";
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
