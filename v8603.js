/* Workday Journey V8.6.0.3 - read-only local scanner + owner-reviewed recovery.
 * This client NEVER creates cloud wallet/savings/shares from browser data.
 * SQL RPCs are the authorization and audit boundaries.
 */
(() => {
  'use strict';
  const VERSION = '8.6.0.3';
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
  let sessionUser = '', scanning = null, ownerLoad = null, ownerRows = [], myRows = [], lastError = '';

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
    return Array.from(shares.entries()).filter(([,n])=>n!==0).map(([s,n])=>`${esc(s)}: ${n}`).join(', ')||'None';
  }
  function ownerCard(r) {
    const snap=r.snapshot||{}, bank=bankClaim(snap), trades=Array.isArray(snap.trades)?snap.trades:[];
    const bankInfo=snap.bank?.ownerBinding==='unknown_guest'?'Unverified guest backup':'Browser session backup';
    const id=esc(r.id);
    return `<article class="wdj-recovery-case" data-recovery-case="${id}">
      <header><strong>${esc(r.email||r.userId||'Account')}</strong><small>${esc(new Date(r.createdAt).toLocaleString())}</small></header>
      <p>Bank claim: <b>${bank.toLocaleString()} Coins</b> (${esc(bankInfo)})</p>
      <p>Exchange: <b>${trades.length} trades</b> | Positions: ${positionsPreview(trades)}</p>
      <details><summary>Review original transaction evidence</summary><div class="wdj-recovery-evidence">
        ${(snap.bank?.ledger||[]).slice(0,30).map(t=>`<p>${esc(t.createdAt)} | ${esc(t.type)} | ${esc(t.amount)}</p>`).join('')||'<p>No bank history</p>'}
        <hr/>${trades.slice(0,50).map(t=>`<p>${esc(t.createdAt)} | ${esc(t.side)} ${esc(t.qty)} ${esc(t.symbol)} @ ${esc(t.price)}</p>`).join('')||'<p>No trades</p>'}
      </div></details>
      <div class="wdj-recovery-controls">
        <label>Approved savings (whole Coins)<input type="number" min="0" max="${Math.min(1000000,Math.floor(bank))}" step="1" data-bank-value value="0"></label>
        <label>Bank settlement<select data-bank-mode><option value="wallet_transfer">Move from wallet (recommended)</option><option value="verified_compensation">Verified compensation (adds savings)</option></select></label>
        <label class="wdj-recovery-check"><input type="checkbox" data-stocks-check ${trades.length?'':'disabled'}> Restore verified stock history</label>
        <label class="wdj-recovery-reason">Owner review reason (min 10 characters)<textarea data-reason rows="2" maxlength="1000" placeholder="Checked against account history; justification..."></textarea></label>
      </div>
      <div class="wdj-recovery-actions"><button type="button" data-decision="approve" class="primary-btn">Approve selected</button>
        <button type="button" data-decision="reject" class="outline-btn">Reject</button></div>
    </article>`;
  }
  function renderOwnerPanel() {
    const panel=document.getElementById(ownerPanelId); if(!panel)return;
    const list=panel.querySelector('[data-recovery-list]'); if(!list)return;
    list.innerHTML=ownerRows.length?ownerRows.map(ownerCard).join(''):'<p class="muted">No pending recovery requests.</p>';
  }
  async function refreshOwnerPanel() {
    const panel=document.getElementById(ownerPanelId);if(!panel || ownerLoad)return;
    ownerLoad=(async()=>{
      const list=panel.querySelector('[data-recovery-list]');
      if(list)list.textContent='Loading recovery cases...';
      try{await getOwnerRows();renderOwnerPanel();}
      catch(error){if(list)list.textContent='Unable to load cases: '+String(error?.message||error);}
    })().finally(()=>{ownerLoad=null;});
    return ownerLoad;
  }
  function ensureOwnerPanel() {
    if(!isOwnerPage())return;
    const page=document.getElementById('v848DeveloperPage');if(!page)return;
    // The base app renders an explicit Owner Access badge when permission is verified.
    if(!page.querySelector('.v848-owner-hero'))return;
    if(page.querySelector('#'+ownerPanelId))return;
    const panel=document.createElement('section');panel.id=ownerPanelId;
    panel.className='v848-admin-card wdj-recovery-owner';
    panel.innerHTML='<div class="v848-card-head"><div><p class="eyebrow">LEGACY RECOVERY</p><h3>Old savings & portfolio recovery</h3><p>Browser evidence is untrusted. Compare against transaction history before approving. Nothing is restored automatically.</p></div><button class="outline-btn" type="button" data-recovery-refresh>Refresh</button></div><div data-recovery-list>Loading...</div>';
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
      if(reason.length<10){alert('Please provide a review reason (at least 10 characters).');return;}
      if(action.dataset.decision==='approve' && (!Number.isSafeInteger(amt)||amt<0||(!amt&&!stocks))){alert('Select a valid savings amount or stock history.');return;}
      const decision=action.dataset.decision;
      if(!confirm(`Confirm ${decision} recovery case ${id}? Bank: ${amt} Coins, mode: ${mode}, Stocks: ${stocks}. This is auditable and cannot be undone.`))return;
      card.querySelectorAll('button').forEach(btn=>btn.disabled=true);
      try{
        const {error}=await client().rpc('wdj_owner_review_legacy_recovery',{
          p_request_id:id,p_decision:decision,p_bank_amount:decision==='approve'?amt:0,
          p_bank_mode:mode,p_restore_stocks:decision==='approve'&&stocks,p_reason:reason});
        if(error)throw error;
        await refreshOwnerPanel();
      }catch(error){alert('Recovery review failed: '+String(error?.message||error));card.querySelectorAll('button').forEach(btn=>btn.disabled=false);}
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
      sessionUser='';myRows=[];ownerRows=[];updateUserNotice();}
  }
  window.WorkdayLegacyRecovery={version:VERSION,scan:scanAndStage,refreshMy:checkMyCases};
  window.addEventListener('workday:v8-auth-state',onAuth);
  window.addEventListener('workday:v8-cloud-ready',()=>setTimeout(scanAndStage,350));
  window.addEventListener('online',()=>setTimeout(scanAndStage,450));
  window.addEventListener('hashchange',scheduleOwnerUi);
  document.addEventListener('DOMContentLoaded',startObserver,{once:true});
  if(document.readyState!=='loading')startObserver();
  setTimeout(scanAndStage,1100);
})();
