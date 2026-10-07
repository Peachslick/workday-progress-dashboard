(() => {
  "use strict";

  const VERSION = "8.5.0";
  const $ = id => document.getElementById(id);
  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const lang = () => localStorage.getItem("wp-language") === "en" ? "en" : "th";
  const cloud = () => window.WorkdayV8Cloud || null;
  const rewards = () => window.WorkdayRewards || null;

  const state = {
    owner:null,
    ownerChecking:false,
    setupMissing:false,
    codes:[],
    redemptions:[],
    editingId:null,
    loadingAdmin:false
  };

  const copy = (th,en) => lang()==="th" ? th : en;
  function toast(icon,message,type="info"){
    const stack=$("toastStack");
    if(!stack)return;
    const node=document.createElement("div");
    node.className=`app-toast v7-toast toast-${type}`;
    node.setAttribute("role",type==="error"?"alert":"status");
    node.innerHTML=`<span>${icon}</span><div><strong>${esc(message)}</strong></div>`;
    stack.appendChild(node);
    setTimeout(()=>{node.classList.add("out");setTimeout(()=>node.remove(),250);},3600);
  }
  function client(){ return cloud()?.getClient?.() || null; }
  function user(){ return cloud()?.getUser?.() || null; }
  function signedIn(){ return !!cloud()?.isSignedIn?.(); }
  function safeDate(value){
    if(!value)return "—";
    const d=new Date(value);if(Number.isNaN(d.getTime()))return "—";
    return new Intl.DateTimeFormat(lang()==="th"?"th-TH":"en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(d);
  }
  function normalizedCode(value){return String(value||"").trim().toUpperCase().replace(/\s+/g,"");}
  function catalog(){return rewards()?.getCatalog?.() || [];}
  function rewardLabel(item){
    const r=catalog().find(x=>x.type===item?.type&&x.id===item?.id);
    return r?`${r.icon||"🎁"} ${r.name}`:`🎁 ${item?.type||"reward"}:${item?.id||"?"}`;
  }
  function rewardPayload(raw){
    const value=raw&&typeof raw==="object"?raw:{};
    const items=Array.isArray(value.items)?value.items.filter(x=>x&&x.type&&x.id):[];
    const chests=Array.isArray(value.chests)?value.chests.filter(x=>x&&["daily","weekly","mystery"].includes(x.kind)&&Number(x.count)>0).map(x=>({kind:x.kind,count:Math.max(1,Math.min(10,Math.round(Number(x.count)||1)))})):[];
    return {coins:Math.max(0,Math.round(Number(value.coins)||0)),items,chests};
  }
  function rewardSummary(payload,{compact=false}={}){
    const r=rewardPayload(payload),parts=[];
    if(r.coins>0)parts.push(`<span>🪙 <b>+${r.coins.toLocaleString()}</b> Coins</span>`);
    r.items.forEach(item=>parts.push(`<span>${esc(rewardLabel(item))}</span>`));
    r.chests.forEach(ch=>parts.push(`<span>${ch.kind==="daily"?"🎁":ch.kind==="weekly"?"🏆":"🎲"} ${esc(ch.kind[0].toUpperCase()+ch.kind.slice(1))} Chest ×${ch.count}</span>`));
    if(!parts.length)parts.push(`<span>🎁 ${esc(copy("ไม่มีรางวัลที่ตั้งค่าไว้","No reward configured"))}</span>`);
    return `<div class="v848-reward-summary ${compact?"compact":""}">${parts.join("")}</div>`;
  }

  // ---------- Shared modal UI ----------
  function ensureUi(){
    if(!$("v848RedeemBackdrop")){
      const back=document.createElement("div");back.id="v848RedeemBackdrop";back.className="v848-backdrop";back.hidden=true;
      back.innerHTML=`<section class="v848-modal v848-redeem-modal" role="dialog" aria-modal="true" aria-labelledby="v848RedeemTitle"><button id="v848RedeemClose" class="v848-modal-close" type="button" aria-label="Close">×</button><div class="v848-modal-icon">🎟</div><p class="eyebrow">REWARD CODE · V${VERSION}</p><h2 id="v848RedeemTitle">${esc(copy("แลกรับ Reward Code","Redeem Reward Code"))}</h2><p class="v848-modal-help">${esc(copy("กรอก Code ที่ได้รับเพื่อรับ Work Coins, Item ลับ หรือ Chest","Enter a code to unlock Work Coins, exclusive items or chests"))}</p><form id="v848RedeemForm"><label><span>${esc(copy("Reward Code","Reward Code"))}</span><input id="v848RedeemInput" type="text" inputmode="text" autocomplete="off" maxlength="32" placeholder="PEACE99"></label><div id="v848RedeemError" class="v848-inline-error" hidden></div><button id="v848RedeemSubmit" class="primary-btn" type="submit">🎁 ${esc(copy("รับรางวัล","Redeem"))}</button></form><small class="v848-cloud-note">☁ ${esc(copy("Reward Code ต้องเข้าสู่ระบบเพื่อบันทึกสิทธิ์การใช้งาน","Reward Codes require sign-in so redemptions can be recorded"))}</small></section>`;
      document.body.appendChild(back);
      $("v848RedeemClose").onclick=closeRedeem;
      back.addEventListener("click",e=>{if(e.target===back)closeRedeem();});
      $("v848RedeemInput").addEventListener("input",e=>{const pos=e.target.selectionStart;e.target.value=normalizedCode(e.target.value);try{e.target.setSelectionRange(pos,pos);}catch{}});
      $("v848RedeemForm").addEventListener("submit",e=>{e.preventDefault();redeemCode();});
    }
    if(!$("v848RewardBackdrop")){
      const back=document.createElement("div");back.id="v848RewardBackdrop";back.className="v848-backdrop v848-reward-backdrop";back.hidden=true;
      back.innerHTML=`<section class="v848-modal v848-success-modal" role="dialog" aria-modal="true"><button id="v848RewardClose" class="v848-modal-close" type="button" aria-label="Close">×</button><div class="v848-celebration" aria-hidden="true">${Array.from({length:18},(_,i)=>`<i style="--i:${i};--x:${(i*31+7)%94}%">${i%4===0?"🪙":i%3===0?"✦":"●"}</i>`).join("")}</div><div class="v848-success-mark">✓</div><p class="eyebrow">REWARD UNLOCKED</p><h2 id="v848RewardTitle">${esc(copy("รับรางวัลสำเร็จ!","Reward unlocked!"))}</h2><p id="v848RewardCode" class="v848-code-display"></p><div id="v848RewardBody"></div><button id="v848RewardDone" class="primary-btn" type="button">${esc(copy("เยี่ยมมาก!","Awesome!"))}</button></section>`;
      document.body.appendChild(back);
      const close=()=>{back.classList.remove("show");setTimeout(()=>back.hidden=true,140);};
      $("v848RewardClose").onclick=close;$("v848RewardDone").onclick=close;back.addEventListener("click",e=>{if(e.target===back)close();});
    }
  }
  function openBackdrop(back){back.hidden=false;requestAnimationFrame(()=>back.classList.add("show"));}
  function closeRedeem(){const back=$("v848RedeemBackdrop");if(!back)return;back.classList.remove("show");setTimeout(()=>back.hidden=true,140);}
  function redeemError(message){const el=$("v848RedeemError");if(!el)return;el.hidden=!message;el.textContent=message||"";}
  function setRedeemBusy(busy){const btn=$("v848RedeemSubmit"),input=$("v848RedeemInput");if(btn){btn.disabled=busy;btn.textContent=busy?`⏳ ${copy("กำลังตรวจสอบ...","Checking...")}`:`🎁 ${copy("รับรางวัล","Redeem")}`;}if(input)input.disabled=busy;}
  function openRedeem(){
    ensureUi();
    if(!signedIn()){
      cloud()?.openAccount?.({mode:"signin",returnAction:"redeem-code"});
      return;
    }
    redeemError("");const input=$("v848RedeemInput");if(input){input.disabled=false;input.value="";}
    setRedeemBusy(false);openBackdrop($("v848RedeemBackdrop"));setTimeout(()=>input?.focus(),80);
  }
  function friendlyRedeemError(error){
    const m=String(error?.message||error||"");
    if(m.includes("REWARD_CODE_NOT_FOUND"))return copy("ไม่พบ Reward Code นี้ กรุณาตรวจสอบอีกครั้ง","Reward Code not found. Check the code and try again.");
    if(m.includes("REWARD_CODE_INACTIVE"))return copy("Reward Code นี้ถูกปิดใช้งานแล้ว","This Reward Code is inactive.");
    if(m.includes("REWARD_CODE_EXPIRED"))return copy("Reward Code นี้หมดอายุแล้ว","This Reward Code has expired.");
    if(m.includes("REWARD_CODE_MAX_USES"))return copy("Reward Code นี้ถูกใช้ครบจำนวนแล้ว","This Reward Code has reached its maximum uses.");
    if(m.includes("REWARD_CODE_USER_LIMIT")||m.includes("REWARD_CODE_ALREADY_USED"))return copy("คุณใช้ Reward Code นี้ครบจำนวนแล้ว","You have already used this Reward Code the allowed number of times.");
    if(m.includes("REWARD_CODE_LOGIN_REQUIRED"))return copy("กรุณาเข้าสู่ระบบก่อนใช้ Reward Code","Please sign in before redeeming a Reward Code.");
    if(/column reference ["\']?code["\']? is ambiguous/i.test(m))return copy("\u0E10\u0E32\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 Reward Code \u0E22\u0E31\u0E07\u0E43\u0E0A\u0E49 RPC \u0E23\u0E38\u0E48\u0E19\u0E40\u0E01\u0E48\u0E32 \u0E01\u0E23\u0E38\u0E13\u0E32 Run SQL Hotfix V8.4.8.1 \u0E01\u0E48\u0E2D\u0E19","Reward Code RPC is an older version. Run the V8.4.8.1 SQL hotfix first.");
    if(/function .*redeem_reward_code|does not exist|schema cache/i.test(m))return copy("ระบบ Reward Code ยังไม่ได้ติดตั้งใน Supabase กรุณา Run SQL Setup V8.4.8.1 ก่อน","Reward Codes are not installed in Supabase yet. Run the V8.4.8.1 SQL setup first.");
    return `${copy("ไม่สามารถใช้ Code ได้","Unable to redeem code")}: ${m}`;
  }
  function normalizedRedemption(row){
    if(!row)return null;
    return {
      id:row.redemption_id||row.id||"",
      code:row.code||row.code_snapshot||"",
      title:row.title||row.title_snapshot||"Reward Code",
      reward:rewardPayload(row.reward||row.reward_snapshot||{}),
      redeemedAt:row.redeemed_at||row.redeemedAt||new Date().toISOString()
    };
  }
  function applyRedemption(row,{show=false}={}){
    const r=normalizedRedemption(row);if(!r?.id)return null;
    const economy=row?.economy||null;if(economy)window.WorkdayEconomySecurity?.applyEconomy?.(economy);
    const result={coins:Number(r.reward?.coins||0),items:Array.isArray(r.reward?.items)?r.reward.items:[],chests:[]};
    if(show)showRewardSuccess(r,result);
    return result;
  }

  function showRewardSuccess(redemption,result={}){
    ensureUi();closeRedeem();
    const back=$("v848RewardBackdrop"),r=normalizedRedemption(redemption);
    $("v848RewardTitle").textContent=r.title||copy("รับรางวัลสำเร็จ!","Reward unlocked!");
    $("v848RewardCode").textContent=r.code?`🎟 ${r.code}`:"🎟 REWARD CODE";
    const actual=[];
    if(Number(result.coins)>0)actual.push(`<article><span>🪙</span><div><small>WORK COINS</small><strong>+${Number(result.coins).toLocaleString()}</strong></div></article>`);
    (result.items||[]).forEach(x=>actual.push(`<article><span>${esc(x.icon||"🎁")}</span><div><small>${esc(String(x.type||"ITEM").toUpperCase())}</small><strong>${esc(x.name||x.id)}</strong></div></article>`));
    (result.chests||[]).forEach(x=>actual.push(`<article><span>${esc(x.icon||"🎁")}</span><div><small>${esc(String(x.kind||"CHEST").toUpperCase())} CHEST</small><strong>${esc(x.title||x.rewardText||"Reward")}</strong></div></article>`));
    $("v848RewardBody").innerHTML=`<p class="v848-success-help">${esc(copy("รางวัลถูกบันทึกใน Journey แล้ว และจะ Sync ไปกับบัญชีของคุณ","Your reward is saved to your Journey and will sync with your account"))}</p><div class="v848-success-grid">${actual.length?actual.join(""):`<article><span>✓</span><div><small>${esc(copy("ได้รับแล้ว","ALREADY APPLIED"))}</small><strong>${esc(copy("รางวัลนี้อยู่ในบัญชีของคุณแล้ว","This reward is already in your account"))}</strong></div></article>`}</div>`;
    openBackdrop(back);
    cloud()?.syncNow?.();
  }
  async function redeemCode(){
    const c=client(),u=user();if(!c||!u){closeRedeem();openRedeem();return;}
    const cloudState=cloud()?.getStatus?.();
    if(cloudState && (!cloudState.ready || cloudState.reconciling)){redeemError(copy("กำลังเตรียมข้อมูล Cloud กรุณารอสักครู่แล้วกดรับรางวัลอีกครั้ง","Cloud data is still being prepared. Wait a moment, then redeem again."));return;}
    const code=normalizedCode($("v848RedeemInput")?.value);
    if(code.length<3){redeemError(copy("กรุณากรอก Reward Code","Enter a Reward Code"));return;}
    redeemError("");setRedeemBusy(true);
    try{
      const {data,error}=await c.rpc("redeem_reward_code",{p_code:code});
      if(error)throw error;
      const row=Array.isArray(data)?data[0]:data;if(!row)throw new Error("REWARD_CODE_NOT_FOUND");
      applyRedemption(row,{show:true});
      await refreshOwnerDashboard(false);
    }catch(err){redeemError(friendlyRedeemError(err));}
    finally{setRedeemBusy(false);}
  }
  async function syncMyRedemptions(){
    const c=client(),u=user();if(!c||!u)return;
    const cloudState=cloud()?.getStatus?.();
    if(cloudState && (!cloudState.ready || cloudState.reconciling))return;
    try{
      const {data,error}=await c.from("reward_code_redemptions").select("id,code_snapshot,title_snapshot,reward_snapshot,redeemed_at").eq("user_id",u.id).order("redeemed_at",{ascending:true}).limit(200);
      if(error)throw error;
      (data||[]).forEach(row=>applyRedemption(row,{show:false}));
    }catch(err){
      const m=String(err?.message||"");if(!/does not exist|schema cache|permission/i.test(m))console.warn("Reward redemption sync failed",err);
    }
  }

  // ---------- Reward Shop entry ----------
  function enhanceRewards(){
    const root=$("v81RewardsPage");if(!root||$("v848RedeemCard"))return;
    const wallet=q(".v81-wallet-hero",root),card=document.createElement("section");
    card.id="v848RedeemCard";card.className="v848-redeem-card";
    card.innerHTML=`<div class="v848-redeem-art">🎟</div><div><p class="eyebrow">REWARD CODES · V8.5.0</p><h3>${esc(copy("มี Code ลับอยู่ไหม?","Have a secret code?"))}</h3><p>${esc(copy("Login แล้วใช้ Reward Code เพื่อรับ Coins, Code Exclusive Items หรือ Mystery Chest","Sign in and redeem codes for Coins, code-exclusive items or Mystery Chests"))}</p></div><button id="v848OpenRedeem" class="primary-btn" type="button">🎟 ${esc(copy("กรอก Reward Code","Redeem Code"))}</button>`;
    if(wallet)wallet.insertAdjacentElement("afterend",card);else root.prepend(card);
    $("v848OpenRedeem").onclick=openRedeem;
  }

  // ---------- Owner / Developer Control Center ----------
  function setOwnerUi(value){
    state.owner=!!value;document.documentElement.classList.toggle("v848-owner",!!value);
    qa(".v848-owner-nav").forEach(el=>{el.setAttribute("aria-hidden",value?"false":"true");});
    if(!value&&location.hash.includes("/developer"))renderDeveloper();
  }
  async function checkOwner({force=false}={}){
    if(state.ownerChecking)return state.owner;
    const c=client(),u=user();if(!c||!u){state.setupMissing=false;setOwnerUi(false);return false;}
    if(state.owner!==null&&!force)return state.owner;
    state.ownerChecking=true;
    try{
      const {data,error}=await c.rpc("is_workday_owner");
      if(error)throw error;
      state.setupMissing=false;setOwnerUi(data===true);return state.owner;
    }catch(err){
      state.setupMissing=/does not exist|schema cache/i.test(String(err?.message||""));setOwnerUi(false);return false;
    }finally{state.ownerChecking=false;}
  }
  function ownerGuardHtml(){
    if(!signedIn())return `<section class="v848-access-card"><span>🔐</span><h3>${esc(copy("เข้าสู่ระบบ Owner ก่อน","Owner sign-in required"))}</h3><p>${esc(copy("Developer Control Center ใช้ได้เฉพาะบัญชี Owner ที่กำหนดใน Supabase","Developer Control Center is available only to the Owner account configured in Supabase"))}</p><button id="v848OwnerLogin" class="primary-btn" type="button">👤 ${esc(copy("เข้าสู่ระบบ","Sign in"))}</button></section>`;
    if(state.setupMissing)return `<section class="v848-access-card warning"><span>🧩</span><h3>${esc(copy("ยังไม่ได้ติดตั้ง Reward Code Database","Reward Code database is not installed"))}</h3><p>${esc(copy("Run ไฟล์ SUPABASE_REWARD_CODES_SETUP_V8.4.8.1.sql แล้วกำหนด Owner Email ก่อน","Run SUPABASE_REWARD_CODES_SETUP_V8.4.8.1.sql and set the Owner Email first"))}</p></section>`;
    return `<section class="v848-access-card"><span>🛡️</span><h3>${esc(copy("บัญชีนี้ไม่มีสิทธิ์ Owner","This account is not an Owner"))}</h3><p>${esc(copy("Developer Tools ถูกป้องกันด้วย Supabase Owner check ไม่ใช่แค่ซ่อนปุ่มในหน้าเว็บ","Developer Tools are protected by the Supabase Owner check, not only by hiding the UI"))}</p></section>`;
  }
  async function refreshOwnerDashboard(render=true){
    if(!state.owner||state.loadingAdmin)return;
    const c=client();if(!c)return;state.loadingAdmin=true;
    try{
      const [codesRes,redRes]=await Promise.all([
        c.from("reward_codes").select("id,code,title,reward,active,per_user_limit,max_uses,total_uses,expires_at,created_at,updated_at").order("created_at",{ascending:false}),
        c.from("reward_code_redemptions").select("id,code_snapshot,title_snapshot,user_id,user_email,reward_snapshot,redeemed_at").order("redeemed_at",{ascending:false}).limit(30)
      ]);
      if(codesRes.error)throw codesRes.error;if(redRes.error)throw redRes.error;
      state.codes=codesRes.data||[];state.redemptions=redRes.data||[];
    }catch(err){toast("!",`${copy("โหลด Developer Tools ไม่สำเร็จ","Failed to load Developer Tools")}: ${err?.message||err}`,"error");}
    finally{state.loadingAdmin=false;if(render&&location.hash.includes("/developer"))renderDeveloper();}
  }
  function adminStats(){
    const total=state.codes.length,active=state.codes.filter(x=>x.active).length,uses=state.codes.reduce((a,x)=>a+Number(x.total_uses||0),0),users=new Set(state.redemptions.map(x=>x.user_id).filter(Boolean)).size;
    return {total,active,uses,users};
  }
  function codeStatus(code){
    const expired=code.expires_at&&new Date(code.expires_at).getTime()<Date.now();
    const full=code.max_uses!=null&&Number(code.total_uses||0)>=Number(code.max_uses);
    if(!code.active)return ["disabled",copy("ปิดใช้งาน","Inactive")];if(expired)return ["expired",copy("หมดอายุ","Expired")];if(full)return ["full",copy("ใช้ครบแล้ว","Full")];return ["active",copy("ใช้งานอยู่","Active")];
  }
  function itemCheckboxes(selected=[]){
    const selectedKeys=new Set((selected||[]).map(x=>`${x.type}:${x.id}`));
    const rows=catalog().filter(x=>x.codeExclusive||Number(x.price)>0).sort((a,b)=>Number(b.codeExclusive)-Number(a.codeExclusive)||String(a.type).localeCompare(String(b.type))||String(a.name).localeCompare(String(b.name)));
    return rows.map(r=>`<label class="v848-item-check ${r.codeExclusive?"exclusive":""}"><input type="checkbox" data-v848-code-item="${esc(r.type)}:${esc(r.id)}" ${selectedKeys.has(`${r.type}:${r.id}`)?"checked":""}><span>${esc(r.icon||"🎁")}</span><div><strong>${esc(r.name)}</strong><small>${esc(r.codeExclusive?"CODE EXCLUSIVE":`${r.type} · ${r.rarity}`)}</small></div></label>`).join("");
  }
  function codeFormHtml(){
    const edit=state.codes.find(x=>x.id===state.editingId),r=rewardPayload(edit?.reward||{}),ch=Object.fromEntries(r.chests.map(x=>[x.kind,x.count]));
    const expires=edit?.expires_at?new Date(new Date(edit.expires_at).getTime()-new Date(edit.expires_at).getTimezoneOffset()*60000).toISOString().slice(0,16):"";
    return `<section class="v848-admin-card v848-code-editor"><div class="v848-card-head"><div><p class="eyebrow">CODE MANAGER</p><h3>${esc(edit?copy("แก้ไข Reward Code","Edit Reward Code"):copy("สร้าง Reward Code ใหม่","Create Reward Code"))}</h3><p>${esc(copy("ตั้ง Reward Bundle ได้หลายอย่างใน Code เดียว","Combine multiple rewards in one code"))}</p></div>${edit?`<button id="v848CancelEdit" class="outline-btn" type="button">× ${esc(copy("ยกเลิกแก้ไข","Cancel edit"))}</button>`:""}</div><form id="v848CodeForm" class="v848-code-form"><div class="v848-form-grid"><label><span>Code</span><input id="v848CodeValue" required maxlength="32" value="${esc(edit?.code||"")}" placeholder="PEACE99"></label><label><span>${esc(copy("ชื่อกิจกรรม / Pack","Campaign / Pack name"))}</span><input id="v848CodeTitle" required maxlength="80" value="${esc(edit?.title||"")}" placeholder="Owner Pack"></label><label><span>🪙 Coins</span><input id="v848CodeCoins" type="number" min="0" max="1000000" value="${r.coins||0}"></label><label><span>${esc(copy("ใช้ได้ต่อ User","Uses per user"))}</span><input id="v848PerUser" type="number" min="1" max="50" value="${Math.max(1,Number(edit?.per_user_limit||1))}"></label><label><span>${esc(copy("จำนวนใช้สูงสุด","Max uses"))}</span><input id="v848MaxUses" type="number" min="1" value="${edit?.max_uses??""}" placeholder="${esc(copy("ว่าง = ไม่จำกัด","blank = unlimited"))}"></label><label><span>${esc(copy("วันหมดอายุ","Expires"))}</span><input id="v848Expires" type="datetime-local" value="${esc(expires)}"></label></div><div class="v848-chest-builder"><strong>🎁 ${esc(copy("Chest Rewards","Chest Rewards"))}</strong><label>Daily <input id="v848DailyChest" type="number" min="0" max="10" value="${ch.daily||0}"></label><label>Weekly <input id="v848WeeklyChest" type="number" min="0" max="10" value="${ch.weekly||0}"></label><label>Mystery <input id="v848MysteryChest" type="number" min="0" max="10" value="${ch.mystery||0}"></label></div><div class="v848-item-builder"><div><strong>🎟 ${esc(copy("Items ใน Bundle","Bundle items"))}</strong><small>${esc(copy("เลือกได้ทั้งของในร้านและ Code Exclusive Items","Choose normal shop items or code-exclusive items"))}</small></div><div class="v848-item-grid">${itemCheckboxes(r.items)}</div></div><label class="v848-active-toggle"><input id="v848CodeActive" type="checkbox" ${edit?edit.active!==false?"checked":"":"checked"}><i></i><span>${esc(copy("เปิดใช้งาน Code ทันที","Code is active"))}</span></label><div class="v848-form-actions"><button id="v848SaveCode" class="primary-btn" type="submit">${edit?"💾 "+esc(copy("บันทึกการแก้ไข","Save changes")):"＋ "+esc(copy("สร้าง Reward Code","Create Reward Code"))}</button></div></form></section>`;
  }
  function codeListHtml(){
    if(!state.codes.length)return `<div class="v848-empty">🎟 ${esc(copy("ยังไม่มี Reward Code","No Reward Codes yet"))}</div>`;
    return `<div class="v848-code-list">${state.codes.map(code=>{const [status,label]=codeStatus(code),usage=code.max_uses==null?`${Number(code.total_uses||0)} / ∞`:`${Number(code.total_uses||0)} / ${Number(code.max_uses)}`;return `<article class="v848-code-row"><div class="v848-code-token"><span>🎟</span><div><strong>${esc(code.code)}</strong><small>${esc(code.title||"Reward Code")}</small></div></div><div>${rewardSummary(code.reward,{compact:true})}</div><div class="v848-code-meta"><span class="v848-status ${status}">${esc(label)}</span><small>${esc(copy("ใช้แล้ว","Uses"))}: ${esc(usage)}</small><small>${esc(copy("ต่อ User","Per user"))}: ${Number(code.per_user_limit||1)}</small><small>${esc(copy("หมดอายุ","Expires"))}: ${esc(code.expires_at?safeDate(code.expires_at):copy("ไม่กำหนด","Never"))}</small></div><div class="v848-code-actions"><button type="button" data-v848-copy-code="${esc(code.code)}" title="Copy">⧉</button><button type="button" data-v848-edit-code="${esc(code.id)}">✎</button><button type="button" data-v848-toggle-code="${esc(code.id)}" data-next="${code.active?"0":"1"}">${code.active?"⏸":"▶"}</button></div></article>`;}).join("")}</div>`;
  }
  function recentRedemptionsHtml(){
    if(!state.redemptions.length)return `<div class="v848-empty">🕘 ${esc(copy("ยังไม่มีการใช้ Code","No redemptions yet"))}</div>`;
    return `<div class="v848-redemption-list">${state.redemptions.map(row=>`<div class="v848-redemption-row"><span>✓</span><div><strong>${esc(row.code_snapshot||"CODE")} · ${esc(row.title_snapshot||"Reward")}</strong><small>${esc(row.user_email||row.user_id||"User")}</small></div><time>${esc(safeDate(row.redeemed_at))}</time></div>`).join("")}</div>`;
  }
  function economyToolsHtml(){
    const exclusive=catalog().filter(x=>x.codeExclusive);
    return `<section class="v848-admin-card"><div class="v848-card-head"><div><p class="eyebrow">OWNER ECONOMY TOOLS</p><h3>🪙 ${esc(copy("Owner Sandbox","Owner Sandbox"))}</h3><p>${esc(copy("Cheat แบบเป็นทางการสำหรับบัญชี Owner นี้เท่านั้น · รางวัลจะเข้า Coin Ledger และ Cloud Sync ตามปกติ","A formal owner cheat for this Owner account only · rewards enter the normal ledger and Cloud Sync"))}</p></div></div><div class="v848-economy-grid"><article><strong>🪙 ${esc(copy("เพิ่ม Coins ให้ตัวเอง","Grant Coins to myself"))}</strong><div><input id="v848OwnerCoins" type="number" min="1" max="1000000" value="9999"><button id="v848GrantCoins" class="primary-btn" type="button">+ Coins</button></div><div class="v848-quick-coins"><button type="button" data-v848-coins="100">+100</button><button type="button" data-v848-coins="1000">+1,000</button><button type="button" data-v848-coins="9999">+9,999</button></div></article><article><strong>🎟 ${esc(copy("แจก Code Exclusive Item ให้ตัวเอง","Grant a code-exclusive item"))}</strong><div><select id="v848OwnerItem">${exclusive.map(r=>`<option value="${esc(r.type)}:${esc(r.id)}">${esc(r.icon||"🎁")} ${esc(r.name)}</option>`).join("")}</select><button id="v848GrantItem" class="primary-btn" type="button">Grant</button></div></article><article><strong>🎁 ${esc(copy("เปิด Owner Chest","Open Owner Chest"))}</strong><div class="v848-owner-chests"><button type="button" data-v848-owner-chest="daily">🎁 Daily</button><button type="button" data-v848-owner-chest="weekly">🏆 Weekly</button><button type="button" data-v848-owner-chest="mystery">🎲 Mystery</button></div></article></div></section>`;
  }
  function renderDeveloper(){
    const root=$("v848DeveloperPage");if(!root)return;
    root.innerHTML=`<div class="v7-page-heading"><div class="v7-page-title"><span>🛠</span><div><p class="eyebrow">WORKDAY JOURNEY · V8.5.0</p><h2>Developer Control Center</h2><p class="muted">${esc(copy("จัดการ Reward Codes, ดูการ Redeem และใช้ Owner Economy Tools","Manage Reward Codes, review redemptions and use Owner Economy Tools"))}</p></div></div></div>`;
    if(state.owner===null||state.ownerChecking){root.insertAdjacentHTML("beforeend",`<section class="v848-access-card"><span class="v848-spinner">◌</span><h3>${esc(copy("กำลังตรวจสอบสิทธิ์ Owner...","Checking Owner access..."))}</h3></section>`);checkOwner({force:true}).then(ok=>{if(ok)refreshOwnerDashboard();else renderDeveloper();});return;}
    if(!state.owner){root.insertAdjacentHTML("beforeend",ownerGuardHtml());$("v848OwnerLogin")?.addEventListener("click",()=>cloud()?.openAccount?.({mode:"signin",returnAction:"developer-tools"}));return;}
    const stats=adminStats(),email=user()?.email||"Owner";
    root.insertAdjacentHTML("beforeend",`<section class="v848-owner-hero"><div><span>👑</span><div><small>OWNER ACCESS</small><strong>${esc(email)}</strong></div></div><p>${esc(copy("สิทธิ์นี้ตรวจจาก Supabase app_admins","Access verified by Supabase app_admins"))}</p></section><section class="v848-admin-kpis"><article><span>🎟</span><small>${esc(copy("Codes ทั้งหมด","Total codes"))}</small><strong>${stats.total}</strong></article><article><span>🟢</span><small>${esc(copy("กำลังใช้งาน","Active"))}</small><strong>${stats.active}</strong></article><article><span>🎁</span><small>${esc(copy("Redeem ทั้งหมด","Redemptions"))}</small><strong>${stats.uses}</strong></article><article><span>👥</span><small>${esc(copy("User ล่าสุด","Recent users"))}</small><strong>${stats.users}</strong></article></section>${codeFormHtml()}<section class="v848-admin-card"><div class="v848-card-head"><div><p class="eyebrow">REWARD CODES</p><h3>${esc(copy("Code ที่สร้างไว้","Created codes"))}</h3></div><button id="v848RefreshAdmin" class="outline-btn" type="button">↻ ${esc(copy("รีเฟรช","Refresh"))}</button></div>${codeListHtml()}</section><section class="v848-admin-card"><div class="v848-card-head"><div><p class="eyebrow">RECENT REDEEMS</p><h3>${esc(copy("ประวัติการใช้ Code ล่าสุด","Recent redemptions"))}</h3></div></div>${recentRedemptionsHtml()}</section>${economyToolsHtml()}`);
    bindDeveloper();
  }
  function formReward(){
    const items=qa("[data-v848-code-item]:checked",$("v848CodeForm")).map(el=>{const [type,id]=el.dataset.v848CodeItem.split(":");return{type,id};});
    const chests=[["daily","v848DailyChest"],["weekly","v848WeeklyChest"],["mystery","v848MysteryChest"]].map(([kind,id])=>({kind,count:Math.max(0,Math.min(10,Math.round(Number($(id)?.value)||0)))})).filter(x=>x.count>0);
    return {coins:Math.max(0,Math.round(Number($("v848CodeCoins")?.value)||0)),items,chests};
  }
  async function saveCode(){
    if(!state.owner)return;const c=client();if(!c)return;
    const code=normalizedCode($("v848CodeValue")?.value),title=String($("v848CodeTitle")?.value||"").trim();
    if(!/^[A-Z0-9_-]{3,32}$/.test(code)){toast("!",copy("Code ใช้ได้เฉพาะ A-Z, 0-9, _ และ - ความยาว 3–32 ตัว","Code must be 3–32 characters using A-Z, 0-9, _ or -"),"error");return;}
    if(!title){toast("!",copy("กรุณาใส่ชื่อ Campaign / Pack","Enter a Campaign / Pack name"),"error");return;}
    const perUser=Math.max(1,Math.min(50,Math.round(Number($("v848PerUser")?.value)||1))),maxRaw=String($("v848MaxUses")?.value||"").trim(),maxUses=maxRaw?Math.max(1,Math.round(Number(maxRaw)||1)):null,expiresRaw=$("v848Expires")?.value;
    const payload={code,title,reward:formReward(),active:!!$("v848CodeActive")?.checked,per_user_limit:perUser,max_uses:maxUses,expires_at:expiresRaw?new Date(expiresRaw).toISOString():null,updated_at:new Date().toISOString()};
    const btn=$("v848SaveCode");if(btn)btn.disabled=true;
    try{
      let res;if(state.editingId)res=await c.from("reward_codes").update(payload).eq("id",state.editingId);else res=await c.from("reward_codes").insert(payload);
      if(res.error)throw res.error;toast("✓",state.editingId?copy("อัปเดต Reward Code แล้ว","Reward Code updated"):copy("สร้าง Reward Code แล้ว","Reward Code created"),"success");state.editingId=null;await refreshOwnerDashboard(false);renderDeveloper();
    }catch(err){toast("!",`${copy("บันทึก Code ไม่สำเร็จ","Failed to save code")}: ${err?.message||err}`,"error");if(btn)btn.disabled=false;}
  }
  async function toggleCode(id,active){const c=client();if(!c||!state.owner)return;const {error}=await c.from("reward_codes").update({active,updated_at:new Date().toISOString()}).eq("id",id);if(error){toast("!",error.message,"error");return;}await refreshOwnerDashboard(false);renderDeveloper();}
  async function ownerGrant(payload,label){
    const c=client();if(!c||!state.owner)return;
    try{
      const {data,error}=await c.rpc("owner_grant_secure",{p_coins:Math.max(0,Math.round(Number(payload?.coins||0))),p_items:Array.isArray(payload?.items)?payload.items:[],p_label:label});
      if(error)throw error;window.WorkdayEconomySecurity?.applyEconomy?.(data);toast("✓",copy("บันทึกรางวัลผ่าน Server แล้ว","Reward granted by server"),"success");
    }catch(err){toast("!",`${copy("Grant ไม่สำเร็จ","Grant failed")}: ${err?.message||err}`,"error");}
  }

  function bindDeveloper(){
    $("v848CodeForm")?.addEventListener("submit",e=>{e.preventDefault();saveCode();});
    $("v848CancelEdit")?.addEventListener("click",()=>{state.editingId=null;renderDeveloper();});
    $("v848RefreshAdmin")?.addEventListener("click",()=>refreshOwnerDashboard());
    qa("[data-v848-copy-code]").forEach(btn=>btn.onclick=async()=>{try{await navigator.clipboard.writeText(btn.dataset.v848CopyCode);toast("⧉",copy("คัดลอก Code แล้ว","Code copied"),"success");}catch{}});
    qa("[data-v848-edit-code]").forEach(btn=>btn.onclick=()=>{state.editingId=btn.dataset.v848EditCode;renderDeveloper();setTimeout(()=>$("v848CodeValue")?.focus(),50);});
    qa("[data-v848-toggle-code]").forEach(btn=>btn.onclick=()=>toggleCode(btn.dataset.v848ToggleCode,btn.dataset.next==="1"));
    $("v848GrantCoins")?.addEventListener("click",()=>{const amount=Math.max(1,Math.round(Number($("v848OwnerCoins")?.value)||0));ownerGrant({coins:amount},`Owner Coins +${amount}`);});
    qa("[data-v848-coins]").forEach(btn=>btn.onclick=()=>{const amount=Number(btn.dataset.v848Coins)||0;$("v848OwnerCoins").value=amount;ownerGrant({coins:amount},`Owner Coins +${amount}`);});
    $("v848GrantItem")?.addEventListener("click",()=>{const raw=$("v848OwnerItem")?.value||"";const [type,id]=raw.split(":");if(type&&id)ownerGrant({items:[{type,id}]},"Owner Exclusive Item");});
    qa("[data-v848-owner-chest]").forEach(btn=>btn.onclick=()=>ownerGrant({chests:[{kind:btn.dataset.v848OwnerChest,count:1}]},`Owner ${btn.dataset.v848OwnerChest} Chest`));
  }

  function onAuthComplete(event){
    const action=event?.detail?.action||"";
    checkOwner({force:true}).then(ok=>{if(ok)refreshOwnerDashboard(false);});
    setTimeout(syncMyRedemptions,120);
    if(action==="redeem-code")setTimeout(openRedeem,180);
    if(action==="developer-tools")setTimeout(()=>{location.hash="#/developer";renderDeveloper();},180);
  }
  async function bootstrap(){
    ensureUi();enhanceRewards();
    await checkOwner({force:true});
    if(state.owner)await refreshOwnerDashboard(false);
    if(signedIn())await syncMyRedemptions();
    if(location.hash.includes("/developer"))renderDeveloper();
  }

  window.WorkdayV848={version:VERSION,openRedeem,enhanceRewards,renderDeveloper,checkOwner,refreshOwner:()=>checkOwner({force:true}),syncMyRedemptions};
  window.addEventListener("workday:v8-auth-complete",onAuthComplete);
  window.addEventListener("workday:v8-auth-state",event=>{
    if(event?.detail?.signedIn){
      state.owner=null;
      setTimeout(()=>{checkOwner({force:true}).then(ok=>{if(ok)refreshOwnerDashboard(false);if(location.hash.includes("/developer"))renderDeveloper();});syncMyRedemptions();},100);
      return;
    }
    state.owner=null;state.codes=[];state.redemptions=[];state.editingId=null;setOwnerUi(false);
    if(location.hash.includes("/developer"))renderDeveloper();
  });
  window.addEventListener("workday:v8-cloud-ready",()=>setTimeout(()=>{checkOwner({force:true}).then(ok=>{if(ok)refreshOwnerDashboard(false);});syncMyRedemptions();},120));
  window.addEventListener("hashchange",()=>setTimeout(()=>{if(location.hash.includes("/rewards"))enhanceRewards();if(location.hash.includes("/developer"))renderDeveloper();},30));
  document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;if(!$("v848RedeemBackdrop")?.hidden)closeRedeem();if(!$("v848RewardBackdrop")?.hidden)$("v848RewardClose")?.click();});
  setTimeout(bootstrap,900);
})();
