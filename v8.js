(() => {
  "use strict";

  const API = window.WorkdayJourneyAPI;
  if (!API) return;

  const VERSION = "8.0.1";
  const CLOUD_SCHEMA = 1;
  const CLOUD_TABLE = "workday_user_state";
  const $ = id => document.getElementById(id);
  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const lang = () => localStorage.getItem("wp-language") === "en" ? "en" : "th";
  const readJson = (key, fallback) => { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
  const writeJson = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  const dateKey = date => API.dateKey(date);

  const KEYS = {
    cloudLastSync: "wp-v8-cloud-last-sync",
    cloudLastHash: "wp-v8-cloud-last-hash",
    cloudLastUpdated: "wp-v8-cloud-last-updated-at",
    cloudError: "wp-v8-cloud-last-error",
    cloudUserId: "wp-v8-cloud-user-id",
    dataUpdated: "wp-v8-data-updated-at",
    notifRead: "wp-v8-notification-read",
    journalDrafts: "wp-v8-journal-drafts",
    projectDraft: "wp-v8-project-draft",
    scheduleTemplates: "wp-v8-schedule-templates",
    pendingJournalDate: "wp-v8-open-journal-date"
  };

  const TEXT = {
    th: {
      cloudLocal:"Local", cloudSynced:"ซิงก์แล้ว", cloudSyncing:"กำลังซิงก์", cloudOffline:"ออฟไลน์", cloudError:"ซิงก์มีปัญหา", account:"บัญชีและ Cloud Sync", accountHelp:"ใช้งานแบบ Local ได้เหมือนเดิม หรือเข้าสู่ระบบเพื่อซิงก์ข้อมูลข้าม PC, iPad และมือถือ", cloudNotConfigured:"Deployment นี้ยังไม่ได้ตั้งค่า Supabase", cloudNotConfiguredHelp:"ตั้งค่า supabase-config.js และรัน supabase-setup.sql ก่อนเปิด Cloud Sync", email:"อีเมล", password:"รหัสผ่าน", signIn:"เข้าสู่ระบบ", createAccount:"สร้างบัญชี", signOut:"ออกจากระบบ", checkEmail:"สร้างบัญชีแล้ว กรุณาตรวจอีเมลเพื่อยืนยันก่อนเข้าสู่ระบบ", signedInAs:"เข้าสู่ระบบเป็น", syncNow:"ซิงก์ตอนนี้", uploadDevice:"ใช้ข้อมูลเครื่องนี้", loadCloud:"ใช้ข้อมูล Cloud", lastSync:"ซิงก์ล่าสุด", never:"ยังไม่เคย", cloudReady:"Cloud Sync พร้อมใช้งาน", cloudUploaded:"อัปโหลดข้อมูลเครื่องนี้ขึ้น Cloud แล้ว", cloudLoaded:"โหลดข้อมูล Cloud แล้ว", cloudConflict:"พบข้อมูลทั้งในเครื่องและ Cloud", cloudConflictHelp:"เลือกชุดข้อมูลที่จะใช้เป็นข้อมูลหลัก ระบบจะไม่เขียนทับเงียบ ๆ", thisDevice:"เครื่องนี้", cloudCopy:"Cloud", cloudAutoHelp:"หลังเลือกแล้ว การเปลี่ยนแปลงใหม่จะซิงก์อัตโนมัติเมื่อออนไลน์", authFailed:"เข้าสู่ระบบไม่สำเร็จ", signupFailed:"สร้างบัญชีไม่สำเร็จ", syncFailed:"Cloud Sync ไม่สำเร็จ", localDefault:"Local เป็นค่าเริ่มต้น · Login เพื่อ Sync ข้ามอุปกรณ์", restoreCloud:"มีบัญชีอยู่แล้ว? เข้าสู่ระบบเพื่อกู้ข้อมูลจาก Cloud",
      notifications:"การแจ้งเตือน", markAllRead:"อ่านทั้งหมด", noNotifications:"ยังไม่มีการแจ้งเตือน", journalMissing:"Journal ยังไม่ได้บันทึก", journalMissingBody:"วันที่ {date} เป็นวันทำงานที่ผ่านแล้ว แต่ยังไม่มี Daily Journal", backupOld:"ควรสำรองข้อมูล", backupNever:"ยังไม่เคย Export Backup", backupOldBody:"Backup ล่าสุดผ่านมา {days} วันแล้ว", milestoneClose:"ใกล้ถึง {hours} ชั่วโมง", milestoneBody:"เหลืออีกประมาณ {left} ชั่วโมงทำงาน", achievementUnlocked:"Achievement ใหม่", cloudNeedsSync:"ข้อมูลในเครื่องรอซิงก์", cloudNeedsSyncBody:"กลับมาออนไลน์หรือกด Sync Now เพื่ออัปเดต Cloud",
      draftSaved:"บันทึกร่างล่าสุด {time}", draftRestored:"กู้ร่างที่ยังไม่ได้บันทึกกลับมาแล้ว", scheduleTemplates:"Calendar / Schedule Templates", scheduleTemplateHelp:"เลือกตารางทำงานสำเร็จรูป หรือบันทึกตารางปัจจุบันเพื่อใช้และแชร์กับเพื่อน", templateIntern:"Internship · จ–ศ · 07:00–16:10", templateOffice8:"Office · จ–ศ · 08:00–17:00", templateOffice9:"Office · จ–ศ · 09:00–18:00", applyTemplate:"ใช้ Template", saveCurrentTemplate:"บันทึกตารางปัจจุบัน", exportTemplate:"Export Template", importTemplate:"Import Template", templateName:"ชื่อ Template", templateSaved:"บันทึก Template แล้ว", templateApplied:"ใช้ตารางใหม่แล้ว ระบบจะ Reload", templateImported:"Import Template สำเร็จ", templateInvalid:"ไฟล์ Template ไม่ถูกต้อง", templateApplyConfirm:"เปลี่ยนตารางทำงานปัจจุบันตาม Template นี้หรือไม่?",
      dataHealth:"Data Health & Storage", dataHealthHelp:"ตรวจสุขภาพข้อมูล Local, Backup, Cloud Sync และเวอร์ชัน PWA", journals:"Journals", projects:"Projects", achievements:"Achievements", localStorage:"Local storage", appVersion:"App version", statusGood:"ปกติ", statusWarning:"ควรตรวจสอบ", checkUpdate:"Check for Update", clearCache:"Clear App Cache", reloadLatest:"Reload Latest Version", cacheCleared:"ล้าง App Cache แล้ว", updateChecked:"ตรวจสอบอัปเดตแล้ว", storageIssue:"พบข้อมูล Local ที่อ่านไม่ได้ {n} รายการ", backupHealth:"Backup", cloudHealth:"Cloud Sync",
      publicJourney:"Public Journey Card", publicJourneyHelp:"สร้างลิงก์สรุป Journey สำหรับ Portfolio โดยไม่แนบ Journal, Leave, Calendar หรือข้อมูลส่วนตัวอื่น", includeName:"แสดงชื่อใน Public Card", copyPublicLink:"คัดลอกลิงก์ Public", downloadPublicCard:"ดาวน์โหลดภาพ", sharePublic:"แชร์", publicLinkCopied:"คัดลอก Public Link แล้ว", publicSummary:"Journey Summary", workHours:"ชั่วโมงทำงาน", workdays:"วันทำงาน", projectCount:"Projects", achievementCount:"Achievements", journeyProgress:"Journey", publicSafe:"ข้อมูลสาธารณะชุดนี้ไม่มี Journal, Leave หรือ Calendar รายวัน", close:"ปิด",
      cloudSetup:"Cloud Setup", autoDraft:"Auto Save Draft", diagnostics:"Diagnostics", mobileReady:"Mobile ready"
    },
    en: {
      cloudLocal:"Local", cloudSynced:"Synced", cloudSyncing:"Syncing", cloudOffline:"Offline", cloudError:"Sync issue", account:"Account & Cloud Sync", accountHelp:"Keep using Local Mode, or sign in to sync your journey across PC, iPad and mobile", cloudNotConfigured:"Supabase is not configured for this deployment", cloudNotConfiguredHelp:"Configure supabase-config.js and run supabase-setup.sql before enabling Cloud Sync", email:"Email", password:"Password", signIn:"Sign in", createAccount:"Create account", signOut:"Sign out", checkEmail:"Account created. Check your email to confirm it, then sign in.", signedInAs:"Signed in as", syncNow:"Sync now", uploadDevice:"Use this device data", loadCloud:"Use cloud data", lastSync:"Last sync", never:"Never", cloudReady:"Cloud Sync is ready", cloudUploaded:"This device data was uploaded to Cloud", cloudLoaded:"Cloud data loaded", cloudConflict:"Both this device and Cloud contain data", cloudConflictHelp:"Choose which copy should become the source of truth. V8 will not silently overwrite either copy.", thisDevice:"This device", cloudCopy:"Cloud", cloudAutoHelp:"After resolving this once, new changes sync automatically while online.", authFailed:"Sign in failed", signupFailed:"Account creation failed", syncFailed:"Cloud Sync failed", localDefault:"Local by default · Sign in to sync across devices", restoreCloud:"Already have an account? Sign in to restore Cloud data",
      notifications:"Notifications", markAllRead:"Mark all read", noNotifications:"No notifications yet", journalMissing:"Journal is missing", journalMissingBody:"{date} was a completed workday but still has no Daily Journal", backupOld:"Backup recommended", backupNever:"No backup has been exported yet", backupOldBody:"Your latest backup is {days} days old", milestoneClose:"Approaching {hours} hours", milestoneBody:"About {left} working hours remaining", achievementUnlocked:"Achievement unlocked", cloudNeedsSync:"Local changes are waiting to sync", cloudNeedsSyncBody:"Reconnect or press Sync Now to update Cloud",
      draftSaved:"Draft saved {time}", draftRestored:"Unsaved draft restored", scheduleTemplates:"Calendar / Schedule Templates", scheduleTemplateHelp:"Choose a ready-made schedule or save your current schedule to reuse and share", templateIntern:"Internship · Mon–Fri · 07:00–16:10", templateOffice8:"Office · Mon–Fri · 08:00–17:00", templateOffice9:"Office · Mon–Fri · 09:00–18:00", applyTemplate:"Apply Template", saveCurrentTemplate:"Save current schedule", exportTemplate:"Export Template", importTemplate:"Import Template", templateName:"Template name", templateSaved:"Template saved", templateApplied:"Schedule updated. The app will reload.", templateImported:"Template imported", templateInvalid:"Invalid template file", templateApplyConfirm:"Replace the current work schedule with this template?",
      dataHealth:"Data Health & Storage", dataHealthHelp:"Check Local data, backups, Cloud Sync and PWA version health", journals:"Journals", projects:"Projects", achievements:"Achievements", localStorage:"Local storage", appVersion:"App version", statusGood:"Healthy", statusWarning:"Needs attention", checkUpdate:"Check for Update", clearCache:"Clear App Cache", reloadLatest:"Reload Latest Version", cacheCleared:"App cache cleared", updateChecked:"Update check completed", storageIssue:"{n} Local data items could not be parsed", backupHealth:"Backup", cloudHealth:"Cloud Sync",
      publicJourney:"Public Journey Card", publicJourneyHelp:"Create a portfolio-safe Journey link without Journal, Leave, Calendar or other private details", includeName:"Include display name", copyPublicLink:"Copy public link", downloadPublicCard:"Download card", sharePublic:"Share", publicLinkCopied:"Public link copied", publicSummary:"Journey Summary", workHours:"Work Hours", workdays:"Workdays", projectCount:"Projects", achievementCount:"Achievements", journeyProgress:"Journey", publicSafe:"This public payload contains no Journal, Leave or daily Calendar data", close:"Close",
      cloudSetup:"Cloud Setup", autoDraft:"Auto Save Draft", diagnostics:"Diagnostics", mobileReady:"Mobile ready"
    }
  };
  const t = (key, vars={}) => { let out = TEXT[lang()][key] || TEXT.en[key] || key; Object.entries(vars).forEach(([k,v]) => out = out.replaceAll(`{${k}}`, String(v))); return out; };

  const ORIG_SET = Storage.prototype.setItem;
  const ORIG_REMOVE = Storage.prototype.removeItem;
  const rawSet = (key, value) => ORIG_SET.call(localStorage, key, String(value));
  const rawRemove = key => ORIG_REMOVE.call(localStorage, key);

  const cloud = {
    client:null, configured:false, session:null, user:null, status:"local", localDirty:false,
    applying:false, syncTimer:null, conflictRow:null, authSubscription:null, reconciling:false
  };

  const isCloudMetaKey = key => String(key||"").startsWith("wp-v8-cloud-") || key === KEYS.dataUpdated;
  const isSyncableKey = key => String(key||"").startsWith("wp-") && !isCloudMetaKey(key) && !String(key).startsWith("wp-notify-");

  function hashString(value) {
    let h = 2166136261;
    for (let i=0;i<value.length;i++) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16).padStart(8,"0");
  }
  function collectLocalData() {
    const data={};
    const keys=[];
    for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(isSyncableKey(key))keys.push(key);}
    keys.sort().forEach(key=>{data[key]=localStorage.getItem(key);});
    return data;
  }
  function snapshotHash(data=collectLocalData()) { return hashString(JSON.stringify(data)); }
  function buildCloudPayload() { return {schemaVersion:CLOUD_SCHEMA,appVersion:VERSION,exportedAt:new Date().toISOString(),data:collectLocalData()}; }
  function meaningfulLocalData() {
    if(localStorage.getItem("wp-setup-completed")==="true") return true;
    const journals=readJson("wp-v6-journal",{}),projects=readJson("wp-v6-projects",[]);
    return Object.keys(journals||{}).length>0 || (Array.isArray(projects)&&projects.length>0) || !!localStorage.getItem("wp-profile-avatar-image");
  }
  function setCloudMeta(key,value){ if(value==null)rawRemove(key); else rawSet(key,value); }
  function markLocalChanged(key) {
    if(cloud.applying || !isSyncableKey(key)) return;
    setCloudMeta(KEYS.dataUpdated,new Date().toISOString());
    cloud.localDirty=true;
    updateCloudIndicators();
    if(cloud.user && navigator.onLine && !cloud.conflictRow && localStorage.getItem("wp-setup-completed")==="true") scheduleCloudUpload();
  }

  try {
    Storage.prototype.setItem = function(key,value){
      const old=this.getItem(key); ORIG_SET.call(this,key,value);
      if(this===localStorage && old!==String(value)) markLocalChanged(key);
    };
    Storage.prototype.removeItem = function(key){
      const had=this.getItem(key)!==null; ORIG_REMOVE.call(this,key);
      if(this===localStorage && had) markLocalChanged(key);
    };
  } catch (_) {
    // Some privacy-focused browsers may prevent prototype replacement.
    // The periodic hash check below still keeps Cloud Sync working.
  }

  function scheduleCloudUpload(delay=1800){
    clearTimeout(cloud.syncTimer);
    cloud.syncTimer=setTimeout(()=>uploadCloudState({silent:true}),delay);
  }

  function safeDateLabel(iso){
    if(!iso)return t("never"); const d=new Date(iso); if(Number.isNaN(d.getTime()))return t("never");
    return new Intl.DateTimeFormat(lang()==="th"?"th-TH":"en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(d);
  }
  function formatDateKey(key){
    const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key||"")); if(!m)return key;
    return lang()==="th"?`${m[3]}/${m[2]}/${Number(m[1])+543}`:`${m[3]}/${m[2]}/${m[1]}`;
  }
  function parseDDMMYYYY(text){
    const m=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(text||"").trim());if(!m)return"";
    let y=Number(m[3]); if(y>2400)y-=543; const mo=Number(m[2]),d=Number(m[1]); const dt=new Date(y,mo-1,d);
    if(dt.getFullYear()!==y||dt.getMonth()!==mo-1||dt.getDate()!==d)return"";
    return `${y}-${String(mo).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  }

  function dispatchDataChanged(){ window.dispatchEvent(new CustomEvent("workday:v7-data-changed")); window.dispatchEvent(new CustomEvent("workday:v8-data-changed")); }
  function toast(icon,message,type="info"){
    const stack=$("toastStack"); if(!stack)return;
    const node=document.createElement("div");node.className=`app-toast v7-toast toast-${type}`;node.setAttribute("role",type==="error"?"alert":"status");node.innerHTML=`<span>${icon}</span><div><strong>${esc(message)}</strong></div>`;stack.appendChild(node);
    setTimeout(()=>{node.classList.add("out");setTimeout(()=>node.remove(),250);},3400);
  }

  // ---------- Account / Cloud Sync ----------
  function configLooksValid(){
    const cfg=window.WORKDAY_SUPABASE_CONFIG||{};
    return /^https:\/\//i.test(String(cfg.url||"").trim()) && String(cfg.publishableKey||"").trim().length>20;
  }
  function initSupabase(){
    cloud.configured=configLooksValid() && !!window.supabase?.createClient;
    if(!cloud.configured){updateCloudIndicators();return;}
    const cfg=window.WORKDAY_SUPABASE_CONFIG;
    try{
      cloud.client=window.supabase.createClient(cfg.url.replace(/\/$/,""),cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
      cloud.client.auth.onAuthStateChange((event,session)=>{
        cloud.session=session||null; cloud.user=session?.user||null;
        if(event==="SIGNED_OUT"){cloud.status="local";cloud.localDirty=false;cloud.conflictRow=null;updateCloudIndicators();renderAccountModal();return;}
        if(session?.user){
          const previousUser=localStorage.getItem(KEYS.cloudUserId)||"";
          if(previousUser&&previousUser!==session.user.id){setCloudMeta(KEYS.cloudLastHash,null);setCloudMeta(KEYS.cloudLastSync,null);setCloudMeta(KEYS.cloudLastUpdated,null);cloud.localDirty=false;}
          setCloudMeta(KEYS.cloudUserId,session.user.id);
          cloud.status=navigator.onLine?"syncing":"offline";updateCloudIndicators();if(event==="SIGNED_IN"||event==="INITIAL_SESSION")setTimeout(()=>reconcileCloudOnLogin(),50);
        }
      });
      cloud.client.auth.getSession().then(({data})=>{
        cloud.session=data?.session||null; cloud.user=cloud.session?.user||null;
        if(cloud.user){const previousUser=localStorage.getItem(KEYS.cloudUserId)||"";if(previousUser&&previousUser!==cloud.user.id){setCloudMeta(KEYS.cloudLastHash,null);setCloudMeta(KEYS.cloudLastSync,null);setCloudMeta(KEYS.cloudLastUpdated,null);}setCloudMeta(KEYS.cloudUserId,cloud.user.id);cloud.status=navigator.onLine?"syncing":"offline";reconcileCloudOnLogin();}else cloud.status="local";
        updateCloudIndicators(); renderAccountModal();
      }).catch(()=>{});
    }catch(err){cloud.configured=false;cloud.status="error";setCloudMeta(KEYS.cloudError,String(err?.message||err));updateCloudIndicators();}
  }

  async function fetchCloudRow(){
    if(!cloud.client||!cloud.user) return null;
    const {data,error}=await cloud.client.from(CLOUD_TABLE).select("payload,updated_at,client_updated_at").eq("user_id",cloud.user.id).maybeSingle();
    if(error)throw error; return data||null;
  }
  function markSynced(hash,updatedAt){
    setCloudMeta(KEYS.cloudLastHash,hash);setCloudMeta(KEYS.cloudLastSync,new Date().toISOString());if(updatedAt)setCloudMeta(KEYS.cloudLastUpdated,updatedAt);setCloudMeta(KEYS.cloudError,null);
    cloud.localDirty=false;cloud.status="synced";updateCloudIndicators();refreshNotificationCenter();refreshDataHealth();
  }
  async function uploadCloudState({silent=false}={}){
    if(!cloud.client||!cloud.user||!navigator.onLine)return false;
    if(cloud.conflictRow && silent) return false;
    cloud.status="syncing";updateCloudIndicators();
    const payload=buildCloudPayload(),hash=snapshotHash(payload.data),now=new Date().toISOString();
    try{
      const {data,error}=await cloud.client.from(CLOUD_TABLE).upsert({user_id:cloud.user.id,payload,client_updated_at:now},{onConflict:"user_id"}).select("updated_at").single();
      if(error)throw error;markSynced(hash,data?.updated_at||now);if(!silent)toast("☁",t("cloudUploaded"),"success");return true;
    }catch(err){cloud.status="error";setCloudMeta(KEYS.cloudError,String(err?.message||err));updateCloudIndicators();refreshNotificationCenter();if(!silent)toast("!",`${t("syncFailed")}: ${err?.message||err}`,"error");return false;}
  }
  function applyCloudPayload(payload,updatedAt){
    if(!payload?.data||typeof payload.data!=="object")throw new Error("Invalid cloud payload");
    cloud.applying=true;
    try{
      const preserve={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(isCloudMetaKey(k))preserve[k]=localStorage.getItem(k);}
      const remove=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(isSyncableKey(k))remove.push(k);}remove.forEach(k=>ORIG_REMOVE.call(localStorage,k));
      Object.entries(payload.data).forEach(([k,v])=>{if(isSyncableKey(k)&&typeof v==="string")ORIG_SET.call(localStorage,k,v);});
      Object.entries(preserve).forEach(([k,v])=>ORIG_SET.call(localStorage,k,v));
      const hash=snapshotHash(payload.data);setCloudMeta(KEYS.cloudLastHash,hash);setCloudMeta(KEYS.cloudLastSync,new Date().toISOString());setCloudMeta(KEYS.cloudLastUpdated,updatedAt||new Date().toISOString());setCloudMeta(KEYS.dataUpdated,payload.exportedAt||updatedAt||new Date().toISOString());cloud.localDirty=false;
    }finally{cloud.applying=false;}
  }
  async function loadCloudState({reload=true,silent=false}={}){
    if(!cloud.client||!cloud.user||!navigator.onLine)return false;cloud.status="syncing";updateCloudIndicators();
    try{const row=await fetchCloudRow();if(!row?.payload){if(!silent)toast("☁",t("cloudReady"),"info");cloud.status="synced";updateCloudIndicators();return false;}applyCloudPayload(row.payload,row.updated_at);cloud.status="synced";if(!silent)toast("☁",t("cloudLoaded"),"success");if(reload)setTimeout(()=>location.reload(),180);return true;}
    catch(err){cloud.status="error";setCloudMeta(KEYS.cloudError,String(err?.message||err));updateCloudIndicators();if(!silent)toast("!",`${t("syncFailed")}: ${err?.message||err}`,"error");return false;}
  }
  async function reconcileCloudOnLogin(){
    if(!cloud.user||!navigator.onLine||cloud.reconciling)return;cloud.reconciling=true;cloud.status="syncing";updateCloudIndicators();
    try{
      const row=await fetchCloudRow();const localData=collectLocalData(),localHash=snapshotHash(localData);
      if(!row?.payload?.data){await uploadCloudState({silent:true});renderAccountModal();return;}
      const cloudHash=snapshotHash(row.payload.data),lastHash=localStorage.getItem(KEYS.cloudLastHash)||"",lastCloudUpdated=localStorage.getItem(KEYS.cloudLastUpdated)||"";
      if(localHash===cloudHash){markSynced(localHash,row.updated_at);renderAccountModal();return;}
      if(!meaningfulLocalData()){applyCloudPayload(row.payload,row.updated_at);location.reload();return;}
      const localChanged=!!lastHash&&localHash!==lastHash;
      const cloudChanged=!!lastCloudUpdated&&String(row.updated_at||"")!==lastCloudUpdated;
      if(localChanged&&!cloudChanged){await uploadCloudState({silent:true});renderAccountModal();return;}
      if(!localChanged&&cloudChanged){applyCloudPayload(row.payload,row.updated_at);location.reload();return;}
      cloud.conflictRow=row;cloud.status="error";updateCloudIndicators();openConflictModal(row);
    }catch(err){cloud.status="error";setCloudMeta(KEYS.cloudError,String(err?.message||err));updateCloudIndicators();}
    finally{cloud.reconciling=false;}
  }
  async function syncNow(){
    if(!cloud.user){openAccountModal();return;}
    if(!navigator.onLine){cloud.status="offline";updateCloudIndicators();toast("☁",t("cloudOffline"),"warning");return;}
    cloud.reconciling=false;
    await reconcileCloudOnLogin();
    if(cloud.status==="synced"&&!cloud.conflictRow)toast("✓",t("cloudSynced"),"success");
  }

  async function authSignIn(){
    if(!cloud.configured||!cloud.client)return;const email=$("v8AuthEmail")?.value.trim(),password=$("v8AuthPassword")?.value||"";if(!email||password.length<6){toast("!",t("authFailed"),"error");return;}
    setAuthBusy(true);const {error}=await cloud.client.auth.signInWithPassword({email,password});setAuthBusy(false);if(error){toast("!",`${t("authFailed")}: ${error.message}`,"error");return;}renderAccountModal();
  }
  async function authSignUp(){
    if(!cloud.configured||!cloud.client)return;const email=$("v8AuthEmail")?.value.trim(),password=$("v8AuthPassword")?.value||"";if(!email||password.length<6){toast("!",t("signupFailed"),"error");return;}
    setAuthBusy(true);const redirectTo=`${location.origin}${location.pathname}`;const {data,error}=await cloud.client.auth.signUp({email,password,options:{emailRedirectTo:redirectTo}});setAuthBusy(false);if(error){toast("!",`${t("signupFailed")}: ${error.message}`,"error");return;}toast("✉",data?.session?t("cloudReady"):t("checkEmail"),"success");renderAccountModal();
  }
  async function authSignOut(){if(!cloud.client)return;await cloud.client.auth.signOut();cloud.user=null;cloud.session=null;cloud.status="local";updateCloudIndicators();renderAccountModal();}
  async function deleteCloudState(){
    if(!cloud.client||!cloud.user)return true;
    try{const {error}=await cloud.client.from(CLOUD_TABLE).delete().eq("user_id",cloud.user.id);if(error)throw error;setCloudMeta(KEYS.cloudLastHash,null);setCloudMeta(KEYS.cloudLastSync,null);setCloudMeta(KEYS.cloudLastUpdated,null);cloud.localDirty=false;return true;}catch(err){toast("!",`${t("syncFailed")}: ${err?.message||err}`,"error");return false;}
  }
  window.WorkdayV8Cloud={isSignedIn:()=>!!cloud.user,deleteCloudState,syncNow,openAccount:openAccountModal};
  function setAuthBusy(busy){["v8SignIn","v8SignUp","v8SignOut","v8SyncNow","v8UploadDevice","v8LoadCloud"].forEach(id=>{const el=$(id);if(el)el.disabled=busy;});}

  // ---------- Core V8 UI ----------
  function ensureUi(){
    const actions=q(".topbar-actions");
    if(actions&&!$("v8CloudBtn")){
      const cloudBtn=document.createElement("button");cloudBtn.id="v8CloudBtn";cloudBtn.className="v8-top-btn v8-cloud-btn";cloudBtn.type="button";cloudBtn.innerHTML=`<span class="v8-top-icon">☁</span><span id="v8CloudLabel">${esc(t("cloudLocal"))}</span><i id="v8CloudDot"></i>`;cloudBtn.addEventListener("click",openAccountModal);
      const profile=$("profileQuickBtn");profile?.insertAdjacentElement("afterend",cloudBtn);
      const bell=document.createElement("button");bell.id="v8NotifBtn";bell.className="v8-top-btn v8-notif-btn";bell.type="button";bell.setAttribute("aria-label",t("notifications"));bell.innerHTML=`<span class="v8-top-icon">🔔</span><b id="v8NotifBadge" hidden>0</b>`;bell.addEventListener("click",toggleNotificationPanel);cloudBtn.insertAdjacentElement("afterend",bell);
    }
    if(!$("v8NotifPanel")){
      const panel=document.createElement("aside");panel.id="v8NotifPanel";panel.className="v8-notif-panel";panel.hidden=true;panel.innerHTML=`<div class="v8-panel-head"><div><p class="eyebrow">NOTIFICATION CENTER</p><h3>${esc(t("notifications"))}</h3></div><button id="v8NotifClose" class="icon-btn" type="button">×</button></div><div id="v8NotifList" class="v8-notif-list"></div><div class="v8-panel-foot"><button id="v8NotifReadAll" class="text-btn" type="button">${esc(t("markAllRead"))}</button></div>`;document.body.appendChild(panel);$("v8NotifClose").onclick=()=>setNotificationPanel(false);$("v8NotifReadAll").onclick=markAllNotificationsRead;
    }
    if(!$("v8AuthBackdrop")){
      const wrap=document.createElement("div");wrap.id="v8AuthBackdrop";wrap.className="v8-modal-backdrop";wrap.hidden=true;wrap.innerHTML=`<section class="v8-auth-modal" role="dialog" aria-modal="true" aria-labelledby="v8AuthTitle"><button id="v8AuthClose" class="v8-modal-close" type="button">×</button><div class="v8-auth-hero"><span>☁</span><div><p class="eyebrow">WORKDAY JOURNEY · V8</p><h2 id="v8AuthTitle">${esc(t("account"))}</h2><p>${esc(t("accountHelp"))}</p></div></div><div id="v8AuthBody"></div></section>`;document.body.appendChild(wrap);$("v8AuthClose").onclick=closeAccountModal;wrap.addEventListener("click",e=>{if(e.target===wrap)closeAccountModal();});
    }
    if(!$("v8ConflictBackdrop")){
      const wrap=document.createElement("div");wrap.id="v8ConflictBackdrop";wrap.className="v8-modal-backdrop v8-conflict-backdrop";wrap.hidden=true;wrap.innerHTML=`<section class="v8-conflict-modal" role="dialog" aria-modal="true"><div class="v8-conflict-icon">↔</div><h2>${esc(t("cloudConflict"))}</h2><p>${esc(t("cloudConflictHelp"))}</p><div id="v8ConflictMeta" class="v8-conflict-meta"></div><div class="v8-conflict-actions"><button id="v8ConflictLocal" class="primary-btn" type="button">💻 ${esc(t("thisDevice"))}</button><button id="v8ConflictCloud" class="outline-btn" type="button">☁ ${esc(t("cloudCopy"))}</button></div><small>${esc(t("cloudAutoHelp"))}</small></section>`;document.body.appendChild(wrap);
      $("v8ConflictLocal").onclick=async()=>{wrap.hidden=true;await uploadCloudState();cloud.conflictRow=null;};$("v8ConflictCloud").onclick=()=>{const row=cloud.conflictRow;if(!row)return;wrap.hidden=true;applyCloudPayload(row.payload,row.updated_at);cloud.conflictRow=null;location.reload();};
    }
    if(!$("v8PublicBackdrop")){
      const wrap=document.createElement("div");wrap.id="v8PublicBackdrop";wrap.className="v8-public-backdrop";wrap.hidden=true;wrap.innerHTML=`<section class="v8-public-view"><button id="v8PublicClose" class="v8-modal-close" type="button">×</button><div id="v8PublicViewBody"></div></section>`;document.body.appendChild(wrap);$("v8PublicClose").onclick=closePublicView;
    }
    ensureSetupCloudPrompt();ensureSetupTemplates();
  }

  function openAccountModal(){ensureUi();const el=$("v8AuthBackdrop");el.hidden=false;requestAnimationFrame(()=>el.classList.add("open"));renderAccountModal();}
  function closeAccountModal(){const el=$("v8AuthBackdrop");if(!el)return;el.classList.remove("open");setTimeout(()=>el.hidden=true,160);}
  function renderAccountModal(){
    const body=$("v8AuthBody");if(!body)return;
    if(!cloud.configured){body.innerHTML=`<div class="v8-cloud-unconfigured"><span>🧩</span><h3>${esc(t("cloudNotConfigured"))}</h3><p>${esc(t("cloudNotConfiguredHelp"))}</p><code>supabase-config.js + supabase-setup.sql</code></div>`;return;}
    if(!cloud.user){
      // Dashboard time/progress is refreshed every second. V8 also observes those DOM
      // changes to enhance the current route. Do not rebuild the auth form while the
      // user is typing, otherwise the inputs are replaced and appear to refresh/reset.
      if($("v8AuthEmail") && $("v8AuthPassword") && $("v8SignIn") && $("v8SignUp")) return;
      body.innerHTML=`<div class="v8-auth-form"><label><span>${esc(t("email"))}</span><input id="v8AuthEmail" type="email" autocomplete="email" placeholder="you@example.com"></label><label><span>${esc(t("password"))}</span><input id="v8AuthPassword" type="password" autocomplete="current-password" minlength="6" placeholder="••••••••"></label><div class="v8-auth-actions"><button id="v8SignIn" class="primary-btn" type="button">${esc(t("signIn"))}</button><button id="v8SignUp" class="outline-btn" type="button">${esc(t("createAccount"))}</button></div><p class="v8-auth-note">🔐 ${esc(t("localDefault"))}</p></div>`;$("v8SignIn").onclick=authSignIn;$("v8SignUp").onclick=authSignUp;return;}
    const last=localStorage.getItem(KEYS.cloudLastSync);body.innerHTML=`<div class="v8-account-card"><div class="v8-account-avatar">☁</div><div><span>${esc(t("signedInAs"))}</span><strong>${esc(cloud.user.email||cloud.user.id)}</strong><small>${esc(t("lastSync"))}: ${esc(safeDateLabel(last))}</small></div></div><div class="v8-cloud-state"><i data-state="${esc(cloud.status)}"></i><strong>${esc(cloudStatusLabel())}</strong></div><div class="v8-auth-actions grid"><button id="v8SyncNow" class="primary-btn" type="button">↻ ${esc(t("syncNow"))}</button><button id="v8UploadDevice" class="outline-btn" type="button">💻↑ ${esc(t("uploadDevice"))}</button><button id="v8LoadCloud" class="outline-btn" type="button">☁↓ ${esc(t("loadCloud"))}</button><button id="v8SignOut" class="secondary-btn" type="button">${esc(t("signOut"))}</button></div>`;
    $("v8SyncNow").onclick=syncNow;$("v8UploadDevice").onclick=()=>uploadCloudState();$("v8LoadCloud").onclick=()=>loadCloudState();$("v8SignOut").onclick=authSignOut;
  }
  function openConflictModal(row){ensureUi();const meta=$("v8ConflictMeta"),localStamp=localStorage.getItem(KEYS.dataUpdated),cloudStamp=row?.client_updated_at||row?.updated_at;meta.innerHTML=`<div><span>💻 ${esc(t("thisDevice"))}</span><strong>${esc(safeDateLabel(localStamp))}</strong></div><div><span>☁ ${esc(t("cloudCopy"))}</span><strong>${esc(safeDateLabel(cloudStamp))}</strong></div>`;$("v8ConflictBackdrop").hidden=false;requestAnimationFrame(()=>$("v8ConflictBackdrop").classList.add("open"));}
  function cloudStatusLabel(){if(!navigator.onLine&&cloud.user)return t("cloudOffline");return ({local:t("cloudLocal"),synced:t("cloudSynced"),syncing:t("cloudSyncing"),offline:t("cloudOffline"),error:t("cloudError")})[cloud.status]||t("cloudLocal");}
  function updateCloudIndicators(){
    const label=$("v8CloudLabel"),btn=$("v8CloudBtn"),dot=$("v8CloudDot");if(label)label.textContent=cloudStatusLabel();if(btn){btn.dataset.state=cloud.user?(navigator.onLine?cloud.status:"offline"):"local";btn.title=cloud.user?(cloud.user.email||t("account")):t("account");}if(dot)dot.dataset.state=btn?.dataset.state||"local";
    const priv=$("v7PrivateLabel");if(priv)priv.textContent=cloud.user?(cloud.status==="synced"?`☁ ${t("cloudSynced")}`:`☁ ${cloudStatusLabel()}`):t("localDefault");
    renderAccountModal();
  }

  // ---------- Auto Save Draft ----------
  let draftTimer=null,projectDraftTimer=null;
  function getJournalDateFromUi(){return parseDDMMYYYY($("v7JournalDate")?.value)||$("v7JournalDatePicker")?.value||"";}
  function saveJournalDraft(){
    const form=$("v7JournalForm");if(!form)return;const key=getJournalDateFromUi();if(!key)return;const drafts=readJson(KEYS.journalDrafts,{});
    drafts[key]={date:key,work:$("v7JournalWork")?.value||"",learned:$("v7JournalLearned")?.value||"",mood:$("v7JournalMood")?.value||"productive",projectIds:qa(".v7-project-checks input:checked",form).map(x=>x.value),updatedAt:new Date().toISOString()};writeJson(KEYS.journalDrafts,drafts);renderDraftStatus(drafts[key].updatedAt);
  }
  function clearJournalDraft(key){const drafts=readJson(KEYS.journalDrafts,{});if(key&&drafts[key]){delete drafts[key];writeJson(KEYS.journalDrafts,drafts);}}
  function renderDraftStatus(stamp){const form=$("v7JournalForm");if(!form)return;let el=$("v8JournalDraftStatus");if(!el){el=document.createElement("small");el.id="v8JournalDraftStatus";el.className="v8-draft-status";q(".v7-journal-actions",form)?.insertAdjacentElement("beforebegin",el);}if(el)el.textContent=stamp?`💾 ${t("draftSaved",{time:new Intl.DateTimeFormat(lang()==="th"?"th-TH":"en-GB",{hour:"2-digit",minute:"2-digit"}).format(new Date(stamp))})}`:`💾 ${t("autoDraft")}`;}
  function restoreJournalDraft(){
    const form=$("v7JournalForm");if(!form)return;const key=getJournalDateFromUi();if(!key)return;const journals=readJson("wp-v6-journal",{});if(journals?.[key]){renderDraftStatus("");return;}const draft=readJson(KEYS.journalDrafts,{})?.[key];if(!draft){renderDraftStatus("");return;}
    const work=$("v7JournalWork"),learned=$("v7JournalLearned"),mood=$("v7JournalMood");if(work&&!work.value)work.value=draft.work||"";if(learned&&!learned.value)learned.value=draft.learned||"";if(mood&&draft.mood)mood.value=draft.mood;qa(".v7-project-checks input",form).forEach(x=>x.checked=(draft.projectIds||[]).includes(x.value));renderDraftStatus(draft.updatedAt);form.dataset.v8DraftRestored="1";
  }
  function saveProjectDraft(){const form=$("v7ProjectForm");if(!form||$("v7ProjectId")?.value)return;writeJson(KEYS.projectDraft,{name:$("v7ProjectName")?.value||"",category:$("v7ProjectCategory")?.value||"",progress:$("v7ProjectProgress")?.value||"0",status:$("v7ProjectStatus")?.value||"active",description:$("v7ProjectDescription")?.value||"",updatedAt:new Date().toISOString()});renderProjectDraftStatus();}
  function restoreProjectDraft(){const form=$("v7ProjectForm");if(!form||$("v7ProjectId")?.value)return;const d=readJson(KEYS.projectDraft,null);if(!d)return;if(!$("v7ProjectName")?.value){$("v7ProjectName").value=d.name||"";$("v7ProjectCategory").value=d.category||"";$("v7ProjectProgress").value=d.progress||"0";$("v7ProjectStatus").value=d.status||"active";$("v7ProjectDescription").value=d.description||"";}renderProjectDraftStatus(d.updatedAt);}
  function renderProjectDraftStatus(stamp){const form=$("v7ProjectForm");if(!form)return;let el=$("v8ProjectDraftStatus");if(!el){el=document.createElement("small");el.id="v8ProjectDraftStatus";el.className="v8-draft-status";q(".v7-form-actions",form)?.insertAdjacentElement("beforebegin",el);}const d=readJson(KEYS.projectDraft,null);const s=stamp||d?.updatedAt;el.textContent=s?`💾 ${t("draftSaved",{time:new Intl.DateTimeFormat(lang()==="th"?"th-TH":"en-GB",{hour:"2-digit",minute:"2-digit"}).format(new Date(s))})}`:`💾 ${t("autoDraft")}`;}

  // ---------- Notification Center ----------
  function notificationReadSet(){const v=readJson(KEYS.notifRead,[]);return new Set(Array.isArray(v)?v:[]);}
  function saveNotificationRead(set){writeJson(KEYS.notifRead,[...set].slice(-300));}
  function missingJournalNotifications(){
    const cfg=API.getConfig(),now=API.getNow(),today=dateKey(now),journals=readJson("wp-v6-journal",{}),out=[];let checked=0;
    const [eh,em]=String(cfg.workdayEnd||"23:59").split(":").map(Number),nowMin=now.getHours()*60+now.getMinutes();
    for(let d=new Date(now.getFullYear(),now.getMonth(),now.getDate());checked<14&&d>=new Date(`${cfg.startDate}T00:00:00`);d.setDate(d.getDate()-1)){
      const key=dateKey(d),scheduled=API.getScheduledMinutes(d),leave=API.getLeaveMinutes(d),due=key<today||(key===today&&nowMin>=((eh||0)*60+(em||0)));if(scheduled<=0||leave>=scheduled||!due)continue;checked++;if(!journals[key])out.push({id:`journal:${key}`,icon:"📓",title:t("journalMissing"),body:t("journalMissingBody",{date:formatDateKey(key)}),route:"journal",date:key,tone:"warning"});if(out.length>=3)break;
    }return out;
  }
  function buildNotifications(){
    const list=[...missingJournalNotifications()],stats=API.getStats(),hours=stats.elapsedMinutes/60;
    const backup=localStorage.getItem("wp-v6-last-backup-at"),reminder=Number(localStorage.getItem("wp-v6-backup-reminder-days")||14);
    if(!backup)list.push({id:"backup:none",icon:"💾",title:t("backupOld"),body:t("backupNever"),route:"settings",tone:"warning"});else{const days=Math.floor((Date.now()-new Date(backup).getTime())/86400000);if(reminder>0&&days>=reminder)list.push({id:`backup:${new Date(backup).toISOString().slice(0,10)}`,icon:"💾",title:t("backupOld"),body:t("backupOldBody",{days}),route:"settings",tone:"warning"});}
    [900,1000].forEach(target=>{const left=target-hours;if(left>0&&left<=24)list.push({id:`milestone:${target}`,icon:"⏱",title:t("milestoneClose",{hours:target}),body:t("milestoneBody",{left:left.toFixed(1)}),route:"achievements",tone:"info"});});
    API.getAchievements(stats).filter(a=>a.unlocked&&a.unlockedAt).sort((a,b)=>String(b.unlockedAt).localeCompare(String(a.unlockedAt))).slice(0,4).forEach(a=>list.push({id:`ach:${a.id}:${a.unlockedAt}`,icon:a.icon||"🏆",title:t("achievementUnlocked"),body:API.translate(a.titleKey),route:"achievements",tone:"success"}));
    if(cloud.user&&(cloud.localDirty||cloud.status==="error"))list.unshift({id:"cloud:pending",icon:"☁",title:t("cloudNeedsSync"),body:t("cloudNeedsSyncBody"),route:"settings",tone:cloud.status==="error"?"error":"info"});
    return list.slice(0,12);
  }
  function initializeNotificationReadState(){
    const marker="wp-v8-notifications-initialized";if(localStorage.getItem(marker)==="1")return;
    const set=notificationReadSet();API.getAchievements(API.getStats()).filter(a=>a.unlocked&&a.unlockedAt).forEach(a=>set.add(`ach:${a.id}:${a.unlockedAt}`));saveNotificationRead(set);localStorage.setItem(marker,"1");
  }
  function refreshNotificationCenter(){ensureUi();const list=buildNotifications(),read=notificationReadSet(),unread=list.filter(n=>!read.has(n.id));const badge=$("v8NotifBadge");if(badge){badge.hidden=!unread.length;badge.textContent=unread.length>9?"9+":String(unread.length);}const host=$("v8NotifList");if(!host)return;host.innerHTML=list.length?list.map(n=>`<button class="v8-notif-item ${read.has(n.id)?"read":"unread"}" data-v8-notif="${esc(n.id)}" data-route="${esc(n.route||"")}" data-date="${esc(n.date||"")}" type="button"><span class="v8-notif-icon ${esc(n.tone||"info")}">${n.icon}</span><div><strong>${esc(n.title)}</strong><p>${esc(n.body)}</p></div>${read.has(n.id)?"":"<i></i>"}</button>`).join(""):`<div class="v8-empty-notif">🔕<strong>${esc(t("noNotifications"))}</strong></div>`;qa("[data-v8-notif]",host).forEach(btn=>btn.onclick=()=>{const set=notificationReadSet();set.add(btn.dataset.v8Notif);saveNotificationRead(set);if(btn.dataset.date)localStorage.setItem(KEYS.pendingJournalDate,btn.dataset.date);if(btn.dataset.route)location.hash=`#/${btn.dataset.route}`;setNotificationPanel(false);setTimeout(enhanceRoute,100);refreshNotificationCenter();});}
  function markAllNotificationsRead(){const set=notificationReadSet();buildNotifications().forEach(n=>set.add(n.id));saveNotificationRead(set);refreshNotificationCenter();}
  function toggleNotificationPanel(){setNotificationPanel($("v8NotifPanel")?.hidden!==false);}
  function setNotificationPanel(open){const p=$("v8NotifPanel");if(!p)return;p.hidden=!open;p.classList.toggle("open",open);if(open)refreshNotificationCenter();}

  // ---------- Schedule Templates ----------
  const BUILTIN_TEMPLATES = [
    {id:"intern",nameKey:"templateIntern",workdayStart:"07:00",workdayEnd:"16:10",workdays:[1,2,3,4,5],breaks:[{start:"09:00",end:"09:20"},{start:"11:00",end:"11:40"},{start:"14:00",end:"14:10"}]},
    {id:"office8",nameKey:"templateOffice8",workdayStart:"08:00",workdayEnd:"17:00",workdays:[1,2,3,4,5],breaks:[{start:"12:00",end:"13:00"}]},
    {id:"office9",nameKey:"templateOffice9",workdayStart:"09:00",workdayEnd:"18:00",workdays:[1,2,3,4,5],breaks:[{start:"12:00",end:"13:00"}]}
  ];
  function templateName(item){return item.nameKey?t(item.nameKey):(item.name||item.id);}
  function allScheduleTemplates(){const custom=readJson(KEYS.scheduleTemplates,[]);return [...BUILTIN_TEMPLATES,...(Array.isArray(custom)?custom:[])];}
  function currentScheduleTemplate(name="Current") {const cfg=API.getConfig();return{id:`custom-${Date.now().toString(36)}`,name,workdayStart:cfg.workdayStart,workdayEnd:cfg.workdayEnd,workdays:[...(cfg.workdays||[1,2,3,4,5])],breaks:(cfg.breaks||[]).map(b=>({start:b.start,end:b.end}))};}
  function applyTemplateToSetup(tpl){if(!tpl)return;const start=$("setupWorkStart"),end=$("setupWorkEnd");if(start){start.value=tpl.workdayStart;start.dispatchEvent(new Event("input",{bubbles:true}));}if(end){end.value=tpl.workdayEnd;end.dispatchEvent(new Event("input",{bubbles:true}));}qa(".setup-workday").forEach(x=>x.checked=tpl.workdays.includes(Number(x.value)));for(let i=1;i<=3;i++){const br=tpl.breaks[i-1],en=$("setupBreakEnabled"+i),s=$("setupBreakStart"+i),e=$("setupBreakEnd"+i);if(en)en.checked=!!br;if(s)s.value=br?.start||"12:00";if(e)e.value=br?.end||"13:00";[en,s,e].forEach(x=>x?.dispatchEvent(new Event("change",{bubbles:true})));}}
  function ensureSetupTemplates(){const step=q('[data-setup-step="3"]');if(!step||$("v8SetupTemplates"))return;const box=document.createElement("div");box.id="v8SetupTemplates";box.className="v8-setup-templates";box.innerHTML=`<div><strong>🗓 ${esc(t("scheduleTemplates"))}</strong><small>${esc(t("scheduleTemplateHelp"))}</small></div><div class="v8-template-chips">${BUILTIN_TEMPLATES.map(x=>`<button type="button" data-v8-setup-template="${x.id}">${esc(templateName(x))}</button>`).join("")}</div>`;q(".setup-form-grid",step)?.insertAdjacentElement("beforebegin",box);qa("[data-v8-setup-template]",box).forEach(btn=>btn.onclick=()=>applyTemplateToSetup(BUILTIN_TEMPLATES.find(x=>x.id===btn.dataset.v8SetupTemplate)));}
  function ensureSetupCloudPrompt(){const step=q('[data-setup-step="1"]');if(!step||$("v8SetupCloud"))return;const box=document.createElement("div");box.id="v8SetupCloud";box.className="v8-setup-cloud";box.innerHTML=`<span>☁</span><div><strong>${esc(t("restoreCloud"))}</strong><small>${esc(t("localDefault"))}</small></div><button type="button" class="outline-btn">${esc(t("signIn"))}</button>`;q(".setup-form-grid",step)?.insertAdjacentElement("beforebegin",box);box.querySelector("button").onclick=openAccountModal;}
  function applyTemplateToJourney(tpl){if(!tpl||!confirm(t("templateApplyConfirm")))return;const raw=readJson("wp-journey-config",{});writeJson("wp-journey-config",{...raw,workdayStart:tpl.workdayStart,workdayEnd:tpl.workdayEnd,workdays:[...tpl.workdays],breaks:tpl.breaks.map(b=>({...b}))});toast("✓",t("templateApplied"),"success");setTimeout(()=>location.reload(),350);}
  function downloadJson(name,obj){const blob=new Blob([JSON.stringify(obj,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);}
  function ensureCalendarTemplates(){const root=$("v7CalendarIntro");if(!root||$("v8ScheduleTemplatesCard"))return;const card=document.createElement("section");card.id="v8ScheduleTemplatesCard";card.className="card v8-template-card";root.appendChild(card);renderTemplateCard();}
  function renderTemplateCard(){const card=$("v8ScheduleTemplatesCard");if(!card)return;const list=allScheduleTemplates();card.innerHTML=`<div class="v8-card-head"><div><p class="eyebrow">TEMPLATES</p><h3>${esc(t("scheduleTemplates"))}</h3><p>${esc(t("scheduleTemplateHelp"))}</p></div></div><div class="v8-template-toolbar"><select id="v8TemplateSelect">${list.map(x=>`<option value="${esc(x.id)}">${esc(templateName(x))}</option>`).join("")}</select><button id="v8TemplateApply" class="primary-btn" type="button">${esc(t("applyTemplate"))}</button></div><div class="v8-template-actions"><button id="v8TemplateSave" class="outline-btn" type="button">＋ ${esc(t("saveCurrentTemplate"))}</button><button id="v8TemplateExport" class="outline-btn" type="button">↓ ${esc(t("exportTemplate"))}</button><button id="v8TemplateImport" class="outline-btn" type="button">↑ ${esc(t("importTemplate"))}</button><input id="v8TemplateFile" type="file" accept="application/json,.json" hidden></div>`;
    $("v8TemplateApply").onclick=()=>applyTemplateToJourney(allScheduleTemplates().find(x=>x.id===$("v8TemplateSelect").value));
    $("v8TemplateSave").onclick=()=>{const name=prompt(t("templateName"),"My Schedule");if(!name)return;const custom=readJson(KEYS.scheduleTemplates,[]),item=currentScheduleTemplate(name.trim()||"My Schedule");custom.push(item);writeJson(KEYS.scheduleTemplates,custom);toast("✓",t("templateSaved"),"success");renderTemplateCard();};
    $("v8TemplateExport").onclick=()=>{const item=allScheduleTemplates().find(x=>x.id===$("v8TemplateSelect").value);if(item)downloadJson(`workday-schedule-${item.id}.json`,{type:"workday-schedule-template",version:1,template:item});};
    $("v8TemplateImport").onclick=()=>$("v8TemplateFile").click();$("v8TemplateFile").onchange=async e=>{const file=e.target.files?.[0];e.target.value="";if(!file)return;try{const data=JSON.parse(await file.text()),tpl=data?.template;if(data?.type!=="workday-schedule-template"||!tpl?.workdayStart||!tpl?.workdayEnd||!Array.isArray(tpl.workdays)||!Array.isArray(tpl.breaks))throw 0;const custom=readJson(KEYS.scheduleTemplates,[]);custom.push({...tpl,id:`custom-${Date.now().toString(36)}`,name:tpl.name||file.name.replace(/\.json$/i,"")});writeJson(KEYS.scheduleTemplates,custom);toast("✓",t("templateImported"),"success");renderTemplateCard();}catch{toast("!",t("templateInvalid"),"error");}};
  }

  // ---------- Data Health + PWA Diagnostics ----------
  function storageBytes(){let n=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i)||"",v=localStorage.getItem(k)||"";n+=(k.length+v.length)*2;}return n;}
  function formatBytes(n){if(n<1024)return`${n} B`;if(n<1048576)return`${(n/1024).toFixed(1)} KB`;return`${(n/1048576).toFixed(2)} MB`;}
  function parseIssues(){const keys=["wp-v6-journal","wp-v6-projects","wp-day-overrides","wp-journey-config","wp-v8-journal-drafts","wp-v8-schedule-templates"];let bad=0;keys.forEach(k=>{const raw=localStorage.getItem(k);if(!raw)return;try{JSON.parse(raw);}catch{bad++;}});return bad;}
  async function checkForUpdate(){try{const reg=await navigator.serviceWorker?.getRegistration();await reg?.update();toast("✓",t("updateChecked"),"success");}catch(e){toast("!",String(e?.message||e),"error");}}
  async function clearAppCache(){try{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith("workday-journey-")).map(k=>caches.delete(k)));toast("✓",t("cacheCleared"),"success");}catch(e){toast("!",String(e?.message||e),"error");}}
  async function reloadLatest(){await clearAppCache();try{const reg=await navigator.serviceWorker?.getRegistration();await reg?.update();}catch{}location.reload();}
  function dataHealthHtml(){const journals=Object.keys(readJson("wp-v6-journal",{})).length,projects=(readJson("wp-v6-projects",[])||[]).length,ach=API.getAchievements(API.getStats()),unlocked=ach.filter(a=>a.unlocked).length,bad=parseIssues(),backup=localStorage.getItem("wp-v6-last-backup-at"),lastSync=localStorage.getItem(KEYS.cloudLastSync);return `<section id="v8DataHealth" class="card v7-settings-card v7-settings-wide v8-data-health"><div class="v8-card-head"><div><p class="eyebrow">DATA HEALTH</p><h3>🩺 ${esc(t("dataHealth"))}</h3><p>${esc(t("dataHealthHelp"))}</p></div><span class="v8-health-chip ${bad?"warn":"good"}">${esc(bad?t("statusWarning"):t("statusGood"))}</span></div><div class="v8-health-grid"><div><span>📓 ${esc(t("journals"))}</span><strong>${journals}</strong></div><div><span>🧩 ${esc(t("projects"))}</span><strong>${projects}</strong></div><div><span>🏆 ${esc(t("achievements"))}</span><strong>${unlocked}/${ach.length}</strong></div><div><span>💽 ${esc(t("localStorage"))}</span><strong>${formatBytes(storageBytes())}</strong></div><div><span>💾 ${esc(t("backupHealth"))}</span><strong>${esc(safeDateLabel(backup))}</strong></div><div><span>☁ ${esc(t("cloudHealth"))}</span><strong>${esc(cloud.user?safeDateLabel(lastSync):t("cloudLocal"))}</strong></div><div><span>🏷 ${esc(t("appVersion"))}</span><strong>v${VERSION}</strong></div><div><span>🔎 JSON</span><strong>${bad?esc(t("storageIssue",{n:bad})):esc(t("statusGood"))}</strong></div></div><div class="v8-diagnostic-actions"><button id="v8OpenCloud" class="outline-btn" type="button">☁ ${esc(t("account"))}</button><button id="v8CheckUpdate" class="outline-btn" type="button">↻ ${esc(t("checkUpdate"))}</button><button id="v8ClearCache" class="outline-btn" type="button">🧹 ${esc(t("clearCache"))}</button><button id="v8ReloadLatest" class="primary-btn" type="button">⚡ ${esc(t("reloadLatest"))}</button></div></section>`;}
  function ensureDataHealth(){const grid=q("#v7SettingsPage .v7-settings-grid");if(!grid||$("v8DataHealth"))return;grid.insertAdjacentHTML("beforeend",dataHealthHtml());$("v8OpenCloud").onclick=openAccountModal;$("v8CheckUpdate").onclick=checkForUpdate;$("v8ClearCache").onclick=clearAppCache;$("v8ReloadLatest").onclick=reloadLatest;}
  function refreshDataHealth(){if(location.hash.includes("settings")){const old=$("v8DataHealth");if(old)old.remove();ensureDataHealth();}}

  // ---------- Public Journey Card ----------
  function publicPayload(includeName=false){const stats=API.getStats(),ach=API.getAchievements(stats),projects=(readJson("wp-v6-projects",[])||[]).filter(p=>!p.archived),cfg=API.getConfig();return{v:1,n:includeName?(cfg.profileName||""):"",h:Math.round(stats.elapsedMinutes/6)/10,d:stats.fullCompletedDays,p:projects.length,a:ach.filter(x=>x.unlocked).length,at:ach.length,j:Math.round(stats.percent*10)/10,s:cfg.startDate,e:cfg.endDate,ts:new Date().toISOString()};}
  function encodePublic(obj){const bytes=new TextEncoder().encode(JSON.stringify(obj));let binary="";bytes.forEach(b=>binary+=String.fromCharCode(b));return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");}
  function decodePublic(value){try{let b=value.replace(/-/g,"+").replace(/_/g,"/");while(b.length%4)b+="=";const binary=atob(b),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));return JSON.parse(new TextDecoder().decode(bytes));}catch{return null;}}
  function publicUrl(includeName=false){const url=new URL(location.href);url.searchParams.set("journey",encodePublic(publicPayload(includeName)));url.hash="";return url.toString();}
  function publicCardMarkup(data){const name=data.n?`<p class="v8-public-name">${esc(data.n)}</p>`:"";return `<div class="v8-public-brand"><span>%</span><div><p>WORKDAY JOURNEY</p><h1>${esc(t("publicSummary"))}</h1>${name}</div></div><div class="v8-public-progress"><strong>${Number(data.j||0).toFixed(1)}%</strong><span>${esc(t("journeyProgress"))}</span><i><b style="width:${Math.max(0,Math.min(100,Number(data.j)||0))}%"></b></i></div><div class="v8-public-stats"><div><span>⏱ ${esc(t("workHours"))}</span><strong>${Number(data.h||0).toLocaleString()}h</strong></div><div><span>📅 ${esc(t("workdays"))}</span><strong>${Number(data.d||0)}</strong></div><div><span>🧩 ${esc(t("projectCount"))}</span><strong>${Number(data.p||0)}</strong></div><div><span>🏆 ${esc(t("achievementCount"))}</span><strong>${Number(data.a||0)}/${Number(data.at||0)}</strong></div></div><p class="v8-public-safe">🔐 ${esc(t("publicSafe"))}</p>`;}
  function ensurePublicShareCard(){const root=$("v7ReportsPage");if(!root||$("v8PublicShareCard"))return;const card=document.createElement("section");card.id="v8PublicShareCard";card.className="card v8-public-share-card";card.innerHTML=`<div class="v8-card-head"><div><p class="eyebrow">PORTFOLIO</p><h3>🔗 ${esc(t("publicJourney"))}</h3><p>${esc(t("publicJourneyHelp"))}</p></div></div><label class="v8-public-name-toggle"><input id="v8PublicIncludeName" type="checkbox"><span>${esc(t("includeName"))}</span></label><div class="v8-public-preview" id="v8PublicPreview">${publicCardMarkup(publicPayload(false))}</div><div class="v8-public-actions"><button id="v8CopyPublic" class="outline-btn" type="button">🔗 ${esc(t("copyPublicLink"))}</button><button id="v8DownloadPublic" class="outline-btn" type="button">📸 ${esc(t("downloadPublicCard"))}</button><button id="v8SharePublic" class="primary-btn" type="button">↗ ${esc(t("sharePublic"))}</button></div>`;root.appendChild(card);const update=()=>{$("v8PublicPreview").innerHTML=publicCardMarkup(publicPayload($("v8PublicIncludeName").checked));};$("v8PublicIncludeName").onchange=update;$("v8CopyPublic").onclick=async()=>{const url=publicUrl($("v8PublicIncludeName").checked);await navigator.clipboard?.writeText(url);toast("✓",t("publicLinkCopied"),"success");};$("v8DownloadPublic").onclick=()=>downloadPublicImage(publicPayload($("v8PublicIncludeName").checked));$("v8SharePublic").onclick=async()=>{const url=publicUrl($("v8PublicIncludeName").checked);if(navigator.share)try{await navigator.share({title:"Workday Journey",text:t("publicSummary"),url});}catch{}else{await navigator.clipboard?.writeText(url);toast("✓",t("publicLinkCopied"),"success");}};}
  function downloadPublicImage(data){const c=document.createElement("canvas");c.width=1200;c.height=675;const x=c.getContext("2d"),g=x.createLinearGradient(0,0,1200,675);g.addColorStop(0,"#eef4ff");g.addColorStop(1,"#f8fffb");x.fillStyle=g;x.fillRect(0,0,c.width,c.height);x.fillStyle="#1b2a44";x.font="700 48px sans-serif";x.fillText("WORKDAY JOURNEY",80,100);x.font="800 110px sans-serif";x.fillStyle="#356ae6";x.fillText(`${Number(data.j||0).toFixed(1)}%`,80,240);x.fillStyle="#1b2a44";x.font="600 32px sans-serif";x.fillText(data.n||"Journey Summary",80,305);const rows=[["Work Hours",`${data.h}h`],["Workdays",String(data.d)],["Projects",String(data.p)],["Achievements",`${data.a}/${data.at}`]];rows.forEach(([a,b],i)=>{const xx=80+(i%2)*500,yy=410+Math.floor(i/2)*110;x.fillStyle="#6c7a90";x.font="500 24px sans-serif";x.fillText(a,xx,yy);x.fillStyle="#1b2a44";x.font="800 42px sans-serif";x.fillText(b,xx,yy+48);});x.fillStyle="#6c7a90";x.font="400 18px sans-serif";x.fillText("Public summary · No Journal, Leave or private Calendar data",80,630);const a=document.createElement("a");a.href=c.toDataURL("image/png");a.download="workday-journey-public.png";a.click();}
  function showPublicView(data){ensureUi();const body=$("v8PublicViewBody");body.innerHTML=publicCardMarkup(data);$("v8PublicBackdrop").hidden=false;document.body.classList.add("v8-public-open");}
  function closePublicView(){const el=$("v8PublicBackdrop");if(el)el.hidden=true;document.body.classList.remove("v8-public-open");const url=new URL(location.href);url.searchParams.delete("journey");history.replaceState(null,"",url.pathname+url.search+location.hash);}
  function detectPublicLink(){const data=decodePublic(new URL(location.href).searchParams.get("journey")||"");if(data&&data.v===1)showPublicView(data);}

  // ---------- Route Enhancements ----------
  function enhanceRoute(){
    ensureUi();ensureSetupTemplates();ensureSetupCloudPrompt();restoreJournalDraft();restoreProjectDraft();
    if(location.hash.includes("calendar"))ensureCalendarTemplates();
    if(location.hash.includes("settings"))ensureDataHealth();
    if(location.hash.includes("reports"))ensurePublicShareCard();
    const pending=localStorage.getItem(KEYS.pendingJournalDate);if(pending&&location.hash.includes("journal")&&$("v7JournalDate")){localStorage.removeItem(KEYS.pendingJournalDate);const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(pending);if(m){$("v7JournalDate").value=`${m[3]}/${m[2]}/${m[1]}`;$("v7JournalDate").dispatchEvent(new Event("change",{bubbles:true}));}}
    updateCloudIndicators();refreshNotificationCenter();
  }

  document.addEventListener("input",e=>{
    if(["v7JournalWork","v7JournalLearned"].includes(e.target.id)){clearTimeout(draftTimer);draftTimer=setTimeout(saveJournalDraft,450);}
    if(["v7ProjectName","v7ProjectCategory","v7ProjectProgress","v7ProjectDescription"].includes(e.target.id)){clearTimeout(projectDraftTimer);projectDraftTimer=setTimeout(saveProjectDraft,450);}
  },true);
  document.addEventListener("change",e=>{
    if(e.target.id==="v7JournalMood"||e.target.closest?.(".v7-project-checks")){clearTimeout(draftTimer);draftTimer=setTimeout(saveJournalDraft,180);}
    if(e.target.id==="v7ProjectStatus")saveProjectDraft();
  },true);
  document.addEventListener("submit",e=>{
    if(e.target.id==="v7JournalForm"){const key=getJournalDateFromUi();setTimeout(()=>clearJournalDraft(key),20);}
    if(e.target.id==="v7ProjectForm"){setTimeout(()=>rawRemove(KEYS.projectDraft),20);}
  },true);

  const observer=new MutationObserver(()=>{clearTimeout(observer._timer);observer._timer=setTimeout(enhanceRoute,80);});
  const main=q("main.dashboard");if(main)observer.observe(main,{childList:true,subtree:true});

  window.addEventListener("hashchange",()=>setTimeout(enhanceRoute,60));
  window.addEventListener("workday:v7-data-changed",()=>setTimeout(enhanceRoute,60));
  window.addEventListener("workday:journey-cleared",()=>{rawRemove(KEYS.journalDrafts);rawRemove(KEYS.projectDraft);rawRemove(KEYS.notifRead);cloud.localDirty=true;updateCloudIndicators();});
  window.addEventListener("online",()=>{if(cloud.user){cloud.status="syncing";syncNow();}else updateCloudIndicators();});
  window.addEventListener("offline",()=>{if(cloud.user)cloud.status="offline";updateCloudIndicators();});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&cloud.user&&navigator.onLine)syncNow();});
  document.addEventListener("click",e=>{if(!e.target.closest?.("#v8NotifPanel,#v8NotifBtn")&&$("v8NotifPanel")?.hidden===false)setNotificationPanel(false);});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){setNotificationPanel(false);closeAccountModal();}});

  // ---------- Boot ----------
  function boot(){
    ensureUi();
    if(!localStorage.getItem(KEYS.dataUpdated))setCloudMeta(KEYS.dataUpdated,new Date().toISOString());
    const currentHash=snapshotHash(),lastHash=localStorage.getItem(KEYS.cloudLastHash)||"";cloud.localDirty=!!lastHash&&lastHash!==currentHash;
    initializeNotificationReadState();initSupabase();enhanceRoute();detectPublicLink();
    setInterval(()=>{refreshNotificationCenter();updateCloudIndicators();},30000);
    setInterval(()=>{if(!cloud.user||!navigator.onLine||cloud.conflictRow||localStorage.getItem("wp-setup-completed")!=="true")return;const h=snapshotHash(),last=localStorage.getItem(KEYS.cloudLastHash)||"";if(last&&h!==last){cloud.localDirty=true;updateCloudIndicators();scheduleCloudUpload(900);}},5000);
  }
  boot();
})();
