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
