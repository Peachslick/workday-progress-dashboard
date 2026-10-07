(() => {
  "use strict";
  const VERSION="8.5.0.1", LEDGER="wp-v81-coin-ledger", OWNED="wp-v81-owned-rewards";
  const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??f}catch{return f}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const cloud=()=>window.WorkdayV8Cloud||null;
  function localEconomy(){const l=read(LEDGER,[]),o=read(OWNED,[]);return{balance:Math.max(0,Math.round(l.reduce((a,x)=>a+Number(x?.amount||0),0))),lifetimeEarned:Math.max(0,Math.round(l.reduce((a,x)=>a+Math.max(0,Number(x?.amount||0)),0))),lifetimeSpent:Math.max(0,Math.round(Math.abs(l.reduce((a,x)=>a+Math.min(0,Number(x?.amount||0)),0)))),items:(Array.isArray(o)?o:[]).map(k=>{const [type,...rest]=String(k).split(":");return{type,id:rest.join(":")}}).filter(x=>x.type&&x.id)};}
  function applyEconomy(e){if(!e)return;const list=read(LEDGER,[]).filter(x=>x?.id!=="secure:v8501:server-balance"),current=list.reduce((a,x)=>a+Number(x?.amount||0),0),target=Math.max(0,Math.round(Number(e.balance)||0)),delta=target-current;if(delta!==0)list.push({id:"secure:v8501:server-balance",amount:delta,type:"server_balance",labelTh:"ยอดยืนยันจาก Supabase",labelEn:"Supabase verified balance",createdAt:new Date().toISOString(),meta:{securityVersion:VERSION}});write(LEDGER,list);const defaults=["mascot:chick","theme:default","effect:none","accessory:none","frame:none"],items=(Array.isArray(e.items)?e.items:[]).map(x=>`${x.type}:${x.id}`);write(OWNED,[...new Set([...defaults,...items])]);try{window.dispatchEvent(new CustomEvent("workday:v7-data-changed"));}catch{}setTimeout(()=>{try{window.WorkdayRewards?.renderShop?.();}catch{}},20);}
  async function ensureImported(){const c=cloud()?.getClient?.(),u=cloud()?.getUser?.();if(!c||!u)return null;let {data,error}=await c.rpc("get_my_economy");if(error)throw error;if(!data?.legacyImported){const legacy=localEconomy();({data,error}=await c.rpc("import_legacy_economy",{p_balance:legacy.balance,p_lifetime_earned:legacy.lifetimeEarned,p_lifetime_spent:legacy.lifetimeSpent,p_items:legacy.items}));if(error)throw error;}applyEconomy(data);return data;}
  async function refresh(){const c=cloud()?.getClient?.(),u=cloud()?.getUser?.();if(!c||!u)return null;const {data,error}=await c.rpc("get_my_economy");if(error)throw error;applyEconomy(data);return data;}
  window.WorkdayEconomySecurity={version:VERSION,ensureImported,refresh,applyEconomy,isSecure:()=>!!cloud()?.getUser?.()};
  window.addEventListener("workday:v8-auth-state",e=>{if(e.detail?.signedIn)setTimeout(()=>ensureImported().catch(()=>{}),250)});
  window.addEventListener("online",()=>setTimeout(()=>refresh().catch(()=>{}),400));
  setTimeout(()=>ensureImported().catch(()=>{}),900);
})();
