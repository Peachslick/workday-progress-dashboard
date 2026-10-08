/* Workday Journey V8.6.0.2 - UI Startup & Personalization.
   Presentation preferences only; no economy, auth or transaction logic. */
(() => {
  "use strict";
  const VERSION = "8.6.0.2";
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
