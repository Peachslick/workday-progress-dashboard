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
