/* Workday Journey V8.7.10.3.7.2 — opt-in legacy reconciliation.
 * Untrusted device evidence. Only a reviewed server RPC can import shares.
 * Never updates wallet, bank or achievements from browser storage. */
(() => {
  'use strict';
  const VERSION = '8.8.0';
  const KEY = 'wp-v84-exchange-trades';
  const BOUND = 'wdj-v8603-exchange-bound-user';
  const $ = id => document.getElementById(id);
  const c = () => window.WorkdayV8Cloud;
  const uid = () => c()?.getUser?.()?.id || '';
  const db = () => c()?.getClient?.() || null;
  const th = () => localStorage.getItem('wp-language') !== 'en';
  const tr = (thai, english) => th() ? thai : english;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  const date = v => { const x = new Date(v); return Number.isFinite(x.getTime()) ? x.toLocaleString(th()?'th-TH':'en-US') : esc(v); };
  const ALLOWED = new Set(['FOCS','TECH','COFF','ENGY','SAFE','DATA','AUTO','LOGI']);
  let my = [], owner = [], currentOwnerId = '', preview = null, userBusy = false, ownerBusy = false;
  let prevUser = '', userLoadedAt = 0, ownerLoadedAt = 0, queued = false;

  function deviceTrades() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
      if(!Array.isArray(raw)) return [];
      // Do not silently discard malformed entries and then submit a partial trade history.
      if(raw.length < 1 || raw.length > 250) return [];
      if(raw.some(x => !x || typeof x !== 'object' || !['buy','sell'].includes(x.side) ||
          !ALLOWED.has(x.symbol) || !Number.isSafeInteger(Number(x.qty)) || Number(x.qty)<1 || Number(x.qty)>5000 ||
          !Number.isFinite(Number(x.price)) || Number(x.price)<=0 ||
          !Number.isSafeInteger(Number(x.gross)) || !Number.isSafeInteger(Number(x.fee)) ||
          !Number.isSafeInteger(Number(x.walletAmount)) || !Number.isInteger(Number(x.marketSlot)) ||
          !/^\d{4}-\d{2}-\d{2}T/.test(String(x.createdAt||'')) ||
          !/^\d{4}-\d{2}-\d{2}$/.test(String(x.marketKey||'')))) return [];
      return raw.map(x => ({id:String(x.id||'').slice(0,110), side:x.side,symbol:x.symbol,
        qty:Number(x.qty),price:Number(x.price),gross:Number(x.gross),fee:Number(x.fee),
        walletAmount:Number(x.walletAmount),marketKey:String(x.marketKey),
        marketSlot:Number(x.marketSlot),createdAt:String(x.createdAt)}));
    } catch { return []; }
  }
  function positions(list){
    const p = new Map();
    [...list].sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)).forEach(x=>{
      p.set(x.symbol,(p.get(x.symbol)||0)+(x.side==='buy'?x.qty:-x.qty));
    });
    return [...p].filter(([,n])=>n!==0).map(([s,n])=>`${s}: ${n}`).join(' · ') || '—';
  }
  function ready() { return !!uid() && !!db() && c()?.getStatus?.()?.ready; }
  function tradeRowsHTML(rows) {
    return `<div class="wdj-universal-trades">${rows.map(x=>`<div><b>${x.side==='buy'?'BUY':'SELL'} ${esc(x.symbol)} × ${esc(x.qty)}</b><span>${esc(date(x.createdAt))} · ${esc(x.price)} Coin · Fee ${esc(x.fee)}</span></div>`).join('')}</div>`;
  }
  async function getMy(force=false) {
    if (!ready())return;
    if(!force && Date.now()-userLoadedAt<45000)return;
    const user=uid();
    const {data,error}=await db().rpc('wdj_universal_my_requests');
    if(error)throw error;
    if(uid()!==user)return;
    my=Array.isArray(data)?data:[];userLoadedAt=Date.now();
  }
  function myPanel() {
    const page=$('v84ExchangePage');
    if(!page || !uid()) { $('wdjUniversalDevicePanel')?.remove();return; }
    const list=deviceTrades(), bound=localStorage.getItem(BOUND);
    const mismatch=!!bound && bound!==uid();
    let panel=$('wdjUniversalDevicePanel');
    if(!panel){panel=document.createElement('section');panel.id='wdjUniversalDevicePanel';panel.className='wdj-universal-panel';page.appendChild(panel);}
    const last=my[0];
    const msg=last ? ({pending:tr('คำขออยู่ระหว่างตรวจสอบ','Your request is under review'),
      approved:tr(`กู้ข้อมูลสำเร็จ ${last.imported||0} รายการ (ที่มีแล้ว ${last.matched||0})`,`Restored ${last.imported||0} trades (already existed: ${last.matched||0})`),
      rejected:tr('คำขอก่อนหน้าไม่ผ่านการตรวจสอบ โปรดติดต่อผู้ดูแล','A previous request was not approved; contact the owner')})[last.status] : '';
    panel.innerHTML=`<div class="wdj-universal-head"><div><small>PORTFOLIO RECOVERY</small>
      <h3>${tr('ตรวจสอบหุ้นเดิมจากอุปกรณ์','Review old device portfolio')}</h3>
      <p>${tr('เฉพาะบัญชีที่เข้าสู่ระบบ · ไม่เปลี่ยน Coin และไม่คืนหุ้นอัตโนมัติ','Signed-in accounts only · never changes Coins or automatically credits shares')}</p></div></div>
      ${last?`<p class="wdj-universal-status">${esc(msg)} · ${esc(date(last.createdAt))}</p>`:''}
      ${mismatch?`<p class="wdj-universal-warning">${tr('ข้อมูลเครื่องนี้เคยผูกกับบัญชีอื่น จึงไม่อนุญาตส่งคำขอจากเครื่องนี้','This device history belongs to a different account and cannot be submitted here')}</p>`:
      list.length?`<p>${tr(`พบประวัติในเครื่อง ${list.length} รายการ`,`Found ${list.length} device trades`)}</p>
        <details><summary>${tr('ดูรายการในอุปกรณ์','Review device evidence')}</summary>${tradeRowsHTML(list)}</details>
        <label class="wdj-universal-consent"><input type="checkbox" data-confirm-owner /> ${tr('ยืนยันว่าประวัตินี้เป็นของบัญชีฉัน และอนุญาตให้ Owner ตรวจสอบ','I confirm this device history belongs to my account and consent to owner review')}</label>
        <button class="outline-btn" data-submit-universal type="button" ${userBusy||last?.status==='pending'?'disabled':''}>${tr('ส่งคำขอตรวจสอบส่วนที่ยังขาด','Request review of missing trades')}</button>`:
      `<p>${tr('ยังไม่พบประวัติเดิมใน Browser นี้ หากใช้เครื่องอื่นให้เปิดจากเครื่องนั้น หรือเก็บไฟล์สำรองไว้สำหรับให้ Owner ตรวจสอบ','No legacy trade history found here. Try the original device; keep your backups for owner review.')}</p>`}
      <p class="wdj-universal-footnote">${tr('ข้อมูลจาก Browser ใช้ประกอบการตรวจสอบเท่านั้น Owner ต้องอนุมัติ และอาจปฏิเสธข้อมูลที่ยืนยันไม่ได้','Browser records are evidence only. Owner verification is required; unsupported records may be rejected.')}</p>`;
    const button=panel.querySelector('[data-submit-universal]');
    if(button)button.onclick=async()=>{
      if(userBusy||!ready()||mismatch)return;
      if(!panel.querySelector('[data-confirm-owner]')?.checked){alert(tr('กรุณายืนยันความเป็นเจ้าของข้อมูลก่อน','Please confirm ownership before submitting'));return;}
      if(!confirm(tr(`ส่งรายการซื้อขาย ${list.length} รายการให้ Owner ตรวจสอบ? จะไม่มีการเพิ่ม Coin หรือหุ้นทันที`,`Submit ${list.length} historical trades for owner review? Nothing will be credited automatically.`)))return;
      userBusy=true;button.disabled=true;
      try{
        const authId=uid();const {error}=await db().rpc('wdj_universal_submit',{p_trades:list});
        if(error)throw error;
        if(uid()!==authId)return;
        // Mark ownership only after an explicit user-confirmed successful submission.
        if(!localStorage.getItem(BOUND))localStorage.setItem(BOUND,authId);
        await getMy(true);myPanel();
      }catch(e){alert(tr('ส่งคำขอไม่สำเร็จ: ','Request failed: ')+String(e.message||e));}
      finally{userBusy=false;button.disabled=false;}
    };
  }
  async function getOwner(force=false){
    if(!ready() || !document.querySelector('#v848DeveloperPage .v848-owner-hero'))return;
    if(!force && Date.now()-ownerLoadedAt<45000)return;
    const user=uid();const {data,error}=await db().rpc('wdj_universal_owner_list');
    if(error)throw error;if(uid()!==user)return;
    owner=Array.isArray(data)?data:[];ownerLoadedAt=Date.now();
  }
  function ownerPanel(){
    const page=$('v848DeveloperPage');
    if(!page || !page.querySelector('.v848-owner-hero')){$('wdjUniversalOwnerPanel')?.remove();return;}
    let el=$('wdjUniversalOwnerPanel');
    if(!el){el=document.createElement('section');el.id='wdjUniversalOwnerPanel';el.className='v848-admin-card wdj-universal-owner';page.appendChild(el);}
    el.innerHTML=`<div class="wdj-universal-head"><div><small>LEGACY TRADE RECONCILIATION</small>
      <h3>${tr('ตรวจคำขอกู้หุ้นเพิ่มเติม','Review additional legacy trades')}</h3>
      <p>${tr('ตรวจทุกธุรกรรมก่อนอนุมัติ · ไม่คืน Coin หรือรางวัล Achievement','Review original evidence before approving · no Coin or Achievement credits')}</p></div>
      <button class="outline-btn" data-refresh-universal type="button">${tr('รีเฟรช','Refresh')}</button></div>
      ${owner.length?owner.map(r=>`<article class="wdj-universal-case" data-request-id="${esc(r.id)}">
      <strong>${esc(r.email||r.userId||'Account')}</strong><small>${esc(date(r.createdAt))}</small>
      <p>${esc((r.trades||[]).length)} ${tr('รายการ · จำนวนสุทธิ','records · net holdings')}: ${esc(positions(r.trades||[]))}</p>
      <details><summary>${tr('ดูหลักฐานทั้งหมด','Inspect submitted trades')}</summary>${tradeRowsHTML(r.trades||[])}</details>
      <button class="outline-btn" data-preview-universal type="button">${tr('ตรวจเทียบ Cloud','Compare with Cloud')}</button>
      <div class="wdj-universal-preview" data-universal-result>${tr('กดตรวจเทียบก่อนอนุมัติ','Run comparison before approval')}</div>
      <label class="wdj-universal-consent"><input type="checkbox" data-checked-proof /> ${tr('ตรวจสอบหลักฐานภายนอกและยอมรับว่าจะไม่ปรับยอด Coin อัตโนมัติ','I verified independent evidence and understand Coins will not be changed')}</label>
      <textarea data-owner-reason rows="2" maxlength="1000" placeholder="${tr('เหตุผลและหลักฐานประกอบ อย่างน้อย 15 ตัวอักษร','Reason and independent verification, at least 15 characters')}"></textarea>
      <div class="wdj-universal-buttons"><button class="primary-btn" data-universal-decision="approve" disabled type="button">${tr('อนุมัติส่วนที่ขาด','Approve missing only')}</button>
      <button class="outline-btn" data-universal-decision="reject" type="button">${tr('ปฏิเสธ','Reject')}</button></div></article>`).join(''):
      `<p>${tr('ไม่มีคำขอใหม่','No pending recovery requests')}</p>`}`;
    el.querySelector('[data-refresh-universal]').onclick=async()=>{try{await getOwner(true);ownerPanel();}catch(e){alert(String(e.message||e));}};
    for(const card of el.querySelectorAll('[data-request-id]')){
      const requestId=card.dataset.requestId;
      card.querySelector('[data-preview-universal]').onclick=async()=>{
        const btn=card.querySelector('[data-preview-universal]');btn.disabled=true;
        try{
          const {data,error}=await db().rpc('wdj_universal_owner_preview',{p_request_id:requestId});
          if(error)throw error;
          preview={id:requestId,...data};currentOwnerId=requestId;
          const text=card.querySelector('[data-universal-result]');
          text.innerHTML=`<strong>${esc(tr(`มีอยู่แล้ว ${data.matched} · ยังขาด ${data.missing} · ${data.blocked?`หยุด: ${data.reason}`:'พร้อมให้ตรวจหลักฐาน'}`,
            `Existing ${data.matched} · Missing ${data.missing} · ${data.blocked?`Blocked: ${data.reason}`:'Awaiting evidence verification'}`))}</strong>
            <div class="wdj-universal-trades">${(Array.isArray(data.lines)?data.lines:[]).map(line=>`<div><b>${esc(line.state==='missing'?tr('ขาด','MISSING'):tr('มีแล้ว','EXISTS'))}: ${esc(line.side)} ${esc(line.symbol)} × ${esc(line.qty)}</b><span>${esc(date(line.at))}</span></div>`).join('')}</div>`;
          card.querySelector('[data-universal-decision="approve"]').disabled=!!data.blocked || !data.missing;
        }catch(e){card.querySelector('[data-universal-result]').textContent=String(e.message||e);}
        finally{btn.disabled=false;}
      };
      for(const button of card.querySelectorAll('[data-universal-decision]'))button.onclick=async()=>{
        if(ownerBusy)return;
        const decision=button.dataset.universalDecision;
        const reason=card.querySelector('[data-owner-reason]').value.trim();
        if(reason.length<15){alert(tr('กรุณาระบุเหตุผลอย่างน้อย 15 ตัวอักษร','Please enter at least 15 characters of justification'));return;}
        if(decision==='approve' && (currentOwnerId!==requestId || !preview || preview.blocked || !preview.missing || !card.querySelector('[data-checked-proof]').checked)){
          alert(tr('ต้องตรวจเทียบข้อมูลและยืนยันหลักฐานก่อนอนุมัติ','Run comparison and verify independent evidence before approval'));return;
        }
        if(!confirm(decision==='approve'?tr(`นำเข้าเฉพาะ ${preview.missing} รายการที่ยังขาด? Coin และ Bank ไม่เปลี่ยน`,`Import ${preview.missing} verified missing trades? Wallet and Bank will not change.`):tr('ปฏิเสธคำขอนี้?','Reject this request?')))return;
        ownerBusy=true;card.querySelectorAll('button').forEach(b=>b.disabled=true);
        try{
          const {data,error}=await db().rpc('wdj_universal_owner_review',{p_request_id:requestId,p_decision:decision,p_reason:reason});
          if(error)throw error;
          currentOwnerId='';preview=null;
          alert(decision==='approve'?tr(`กู้สำเร็จ ${data.imported} รายการ · Wallet ไม่เปลี่ยน`,`Imported ${data.imported} records · Wallet unchanged`):tr('ปฏิเสธคำขอแล้ว','Request rejected'));
          await getOwner(true);ownerPanel();
        }catch(e){alert(tr('ทำรายการไม่สำเร็จ: ','Review failed: ')+String(e.message||e));}
        finally{ownerBusy=false;}
      };
    }
  }
  async function refresh(){
    const user=uid();if(!ready()||!user){my=[];owner=[];prevUser='';return;}
    if(prevUser!==user){prevUser=user;my=[];owner=[];userLoadedAt=0;ownerLoadedAt=0;preview=null;currentOwnerId='';}
    const path=location.hash;
    if(path.includes('/exchange')){
      try{await getMy();myPanel();}catch(e){console.warn('Recovery account status unavailable:',e.message||e);}
    }
    if(path.includes('/developer')){
      try{await getOwner();ownerPanel();}catch(e){console.warn('Recovery owner list unavailable:',e.message||e);}
    }
  }
  function schedule(){if(queued)return;queued=true;setTimeout(()=>{queued=false;refresh();},250);}
  window.addEventListener('workday:v8-auth-state',schedule);
  window.addEventListener('workday:v8-cloud-ready',schedule);
  window.addEventListener('hashchange',schedule);
  window.addEventListener('online',schedule);
  function init(){
    const exchange=$('v84ExchangePage'),dev=$('v848DeveloperPage');
    for(const node of [exchange,dev])if(node)new MutationObserver(mutations=>{
      // Rendering our own panel must NOT retrigger rendering in an infinite loop.
      if(mutations.some(m => !m.target.closest?.('#wdjUniversalDevicePanel,#wdjUniversalOwnerPanel') &&
         [...m.addedNodes,...m.removedNodes].some(n=>n.nodeType===1 &&
           n.id!=='wdjUniversalDevicePanel' && n.id!=='wdjUniversalOwnerPanel')))schedule();
    }).observe(node,{childList:true});
    schedule();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
  window.WorkdayUniversalRecovery={version:VERSION,refresh:()=>{userLoadedAt=0;ownerLoadedAt=0;return refresh();}};
})();
