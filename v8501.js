/* Workday Journey V8.6.0 - Cloud economy bridge (server-authoritative).
   No client-provided legacy balances or inventory may be imported to Cloud. */
(() => {
  "use strict";
  const VERSION = "8.6.0";
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
  function applyEconomy(e) {
    if (!e || !userId()) return;
    const list = read(LEDGER, []).filter(entry => entry?.id !== "secure:v8501:server-balance");
    const localSum = list.reduce((sum, entry) => sum + (Number(entry?.amount) || 0), 0);
    const serverBalance = Math.max(0, Math.round(Number(e.balance) || 0));
    const delta = serverBalance - localSum;
    if (delta !== 0) list.push({
      id: "secure:v8501:server-balance", amount: delta,
      type: "server_balance", labelTh: "ยอดยืนยันจาก Supabase",
      labelEn: "Supabase verified balance", createdAt: new Date().toISOString(),
      meta: { securityVersion: VERSION }
    });
    write(LEDGER, list);
    const items = (Array.isArray(e.items) ? e.items : [])
      .filter(item => typeof item?.type === "string" && typeof item?.id === "string")
      .map(item => `${item.type}:${item.id}`);
    write(OWNED, [...new Set([...DEFAULT_ITEMS, ...items])]);
    localStorage.setItem(CLOUD_OWNER, userId());
    announceChange();
  }

  async function refresh() {
    const client = cloud()?.getClient?.(), expectedUserId = userId();
    if (!client || !expectedUserId) return null;
    const { data, error } = await client.rpc("get_my_economy");
    if (error) throw error;
    // Never apply a response from a previously signed-in account after logout
    // or while switching accounts.
    if (userId() !== expectedUserId) return null;
    applyEconomy(data);
    return data;
  }

  // Backwards-compatible name for callers from V8.5.x. This no longer imports.
  const ensureImported = refresh;

  window.WorkdayEconomySecurity = {
    version: VERSION, ensureImported, refresh, applyEconomy,
    isSecure: () => !!userId()
  };

  window.addEventListener("workday:v8-auth-state", event => {
    if (event.detail?.signedIn) {
      if (event.detail.event === "SIGNED_IN") rememberGuestBeforeSignIn();
      setTimeout(() => refresh().catch(() => {}), 250);
    } else if (event.detail?.event === "SIGNED_OUT") {
      restoreGuestAfterSignOut();
    }
  });
  window.addEventListener("online", () => setTimeout(() => refresh().catch(() => {}), 400));
  setTimeout(() => refresh().catch(() => {}), 900);
})();
