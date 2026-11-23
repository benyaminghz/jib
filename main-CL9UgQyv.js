import{v as Je,n as ke}from"./marketService-BhK0rVYK.js";const oe="AES-GCM",Ve=12;function pe(e){let t="";for(const n of e)t+=String.fromCharCode(n);return btoa(t)}function ie(e){const t=atob(e),n=new Uint8Array(t.length);for(let i=0;i<t.length;i++)n[i]=t.charCodeAt(i);return n}function Ze(e){return ie(e.replace(/-/g,"+").replace(/_/g,"/"))}async function xe(e){if(e.byteLength!==32)throw new Error("a scope key is 32 bytes");return crypto.subtle.importKey("raw",e,oe,!1,["encrypt","decrypt"])}async function Ne(e,t){const n=crypto.getRandomValues(new Uint8Array(Ve)),i=new TextEncoder().encode(JSON.stringify(t)),r=await crypto.subtle.encrypt({name:oe,iv:n},e,i);return{nonce:pe(n),body:pe(new Uint8Array(r))}}async function Xe(e,t,n){try{const i=await crypto.subtle.decrypt({name:oe,iv:ie(t)},e,ie(n));return JSON.parse(new TextDecoder().decode(i))}catch{return null}}function Ye(e){if(!e||e.length<2)return null;const t=new URLSearchParams(e.replace(/^#/,"")),n=t.get("hid"),i=t.get("pair"),r=t.get("scope"),a=t.get("k");if(!n||!i||!r||!a)return null;const l=Ze(a);return l.byteLength!==32?null:{url:t.get("url")??location.origin,hid:n,code:i,scope:r,key:l}}const Qe="muchtoman",et=1;let N=null;function x(){if(N)return N;const e=new Promise((t,n)=>{const i=indexedDB.open(Qe,et);i.onupgradeneeded=()=>{const r=i.result;r.objectStoreNames.contains("record")||r.createObjectStore("record",{keyPath:"id"}).createIndex("scope","scope"),r.objectStoreNames.contains("outbox")||r.createObjectStore("outbox",{keyPath:"id"}),r.objectStoreNames.contains("meta")||r.createObjectStore("meta")},i.onsuccess=()=>{const r=i.result,a=()=>{N===e&&(N=null)};r.onclose=a,r.onversionchange=()=>{r.close(),a()},t(r)},i.onerror=()=>n(i.error)});return N=e,e.catch(()=>{N===e&&(N=null)}),e}function Q(e){return new Promise((t,n)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>n(e.error)})}async function tt(e){if(e.length===0)return;const n=(await x()).transaction("record","readwrite"),i=n.objectStore("record");for(const r of e)i.put(r);await new Promise((r,a)=>{n.oncomplete=()=>r(),n.onerror=()=>a(n.error)})}async function nt(){const e=await x();return(await Q(e.transaction("record").objectStore("record").getAll())).filter(n=>!n.deleted)}async function Ae(e){const t=await x(),n=await Q(t.transaction("record").objectStore("record").get(e));return n?.deleted?void 0:n}async function Ee(e){const n=(await x()).transaction(["outbox","record"],"readwrite");n.objectStore("outbox").put(e),n.objectStore("record").put({id:e.id,scope:e.scope,updatedAt:e.updatedAt,device:e.device,kind:e.kind,ownerMemberId:e.ownerMemberId,authorMemberId:e.authorMemberId,deleted:e.deleted,value:e.value}),await new Promise((i,r)=>{n.oncomplete=()=>i(),n.onerror=()=>r(n.error)})}async function it(){const e=await x();return await Q(e.transaction("outbox").objectStore("outbox").getAll())}async function rt(e){if(e.length===0)return;const n=(await x()).transaction("outbox","readwrite");for(const i of e)n.objectStore("outbox").delete(i);await new Promise((i,r)=>{n.oncomplete=()=>i(),n.onerror=()=>r(n.error)})}async function ce(e){const t=await x();return await Q(t.transaction("meta").objectStore("meta").get(e))}async function ee(e,t){const i=(await x()).transaction("meta","readwrite");i.objectStore("meta").put(t,e),await new Promise((r,a)=>{i.oncomplete=()=>r(),i.onerror=()=>a(i.error)})}function Le(e,t){return Math.max(t,(e??0)+1)}function Oe(e=Date.now()){const t=crypto.getRandomValues(new Uint8Array(16));for(let i=0;i<6;i++)t[i]=Math.floor(e/2**(8*(5-i)))&255;t[6]=t[6]&15|112,t[8]=t[8]&63|128;const n=[...t].map(i=>i.toString(16).padStart(2,"0")).join("");return`${n.slice(0,8)}-${n.slice(8,12)}-${n.slice(12,16)}-${n.slice(16,20)}-${n.slice(20)}`}function re(){return Oe().replaceAll("-","")}function at(e){return[...new TextEncoder().encode(e)].map(t=>t.toString(16).padStart(2,"0")).join("")}function lt(e,t){return`txn:${e}:${at(t)}`}async function ot(e,t,n=Oe()){const i=lt(e.member,`m:${n}`),r=await Ae(i),a=Le(r?.updatedAt,Date.now()),l={...t,kind:"transaction",ownerMemberId:e.member,sourceKind:"manual",categoryEditorId:e.member},{nonce:o,body:u}=await Ne(e.key,l);await Ee({id:i,scope:e.scope,updatedAt:a,device:e.device,kind:"transaction",ownerMemberId:e.member,deleted:!1,value:l,nonce:o,body:u})}async function Ce(e,t=!1){const n=`member:${e.member}`,i=await Ae(n),r=i?.value;if(r?.name===e.name&&r.sharesSms===t)return;const a=Le(i?.updatedAt,Date.now()),l={kind:"member",memberId:e.member,name:e.name,sharesSms:t},{nonce:o,body:u}=await Ne(e.key,l);await Ee({id:n,scope:e.scope,updatedAt:a,device:e.device,kind:"member",ownerMemberId:e.member,deleted:!1,value:l,nonce:o,body:u})}async function se(e,t,n){return fetch(`${e.base}${t}`,{...n,headers:{...n?.headers??{},authorization:`Bearer ${e.token}`}})}async function ct(e){const t=`sync_identity_ok:${e.member}:${e.device}`;if(await ce(t))return;const n=await se(e,"/v1/identity",{method:"POST",body:JSON.stringify({memberId:e.member,deviceId:e.device})});if(!n.ok)throw new Error(`identity failed: ${n.status}`);await ee(t,!0)}async function st(e){const t=await ce("seq")??0,n=await se(e,`/v1/sync?since=${t}`);if(!n.ok)throw new Error(`pull failed: ${n.status}`);const{seq:i,records:r}=await n.json(),a=[];for(const l of r){const o=await Xe(e.key,l.nonce,l.body);o!=null&&a.push({id:l.id,scope:l.scope,updatedAt:l.updatedAt,device:l.device,kind:l.kind,ownerMemberId:l.ownerMemberId,authorMemberId:l.authorMemberId,deleted:l.deleted,value:o})}return await tt(a),await ee("seq",i),a.length}async function ut(e){const t=await it();if(t.length===0)return 0;const n=await se(e,"/v1/sync",{method:"POST",body:JSON.stringify({records:t.map(i=>({id:i.id,scope:i.scope,updatedAt:i.updatedAt,device:i.device,kind:i.kind??"legacy",ownerMemberId:i.ownerMemberId??"",deleted:i.deleted,nonce:i.nonce,body:i.body}))})});if(!n.ok)throw new Error(`push failed: ${n.status}`);return await rt(t.map(i=>i.id)),t.length}async function dt(e){await ct(e);const t=await ut(e),n=await st(e);return{sent:t,received:n}}const be=["واریز","بستانکار","افزایش یافت","دریافت وجه","نشست"],he=["برداشت","بدهکار","خرید","پرداخت","انتقال","کاهش یافت","کارمزد","قبض","پرید"],ve=["مبلغ","مقدار"],ft=["مانده","موجودی"],mt=["بدهی","تسهیلات","وام","قسط","چک","کارت اعتباری"],pt=["پویا","کد تایید","یادآوری بازپرداخت","خوش آمدید","اعتبار تا"],bt=["ورود","وارد"];function ht(e){let t="";for(const n of e){const i=n.codePointAt(0);n>="0"&&n<="9"?t+=n:i>=1776&&i<=1785?t+=String(i-1776):i>=1632&&i<=1641&&(t+=String(i-1632))}return t}function vt(e){return e.replace(/ي/g,"ی").replace(/ك/g,"ک").replace(/‌/g,"").replace(/ /g," ").toLowerCase()}const ye=/[0-9۰-۹٠-٩][0-9۰-۹٠-٩,،٬.٫]*[0-9۰-۹٠-٩]|[0-9۰-۹٠-٩]/g,yt=/(?<![0-9۰-۹٠-٩.\/\-_])[0-9۰-۹٠-٩]{1,4}[/.][0-9۰-۹٠-٩]{1,2}(?:[/.][0-9۰-۹٠-٩]{1,2})?(?:[ _-]{1,3}[0-9۰-۹٠-٩]{1,2}:[0-9۰-۹٠-٩]{2}(?::[0-9۰-۹٠-٩]{2})?)?(?![0-9۰-۹٠-٩])/;function ge(e){if(!e)return!1;const t=e.codePointAt(0);return e>="0"&&e<="9"||t>=1776&&t<=1785||t>=1632&&t<=1641}function gt(e,t,n){const i=e[t-1],r=e[n];return!!(i==="*"||r==="*"||i==="-"&&ge(e[t-2])||r==="-"&&ge(e[n+1]))}function wt(e,t){const n=e.slice(t,t+14);return n.includes("تومان")||n.includes("تومن")?1:n.includes("ریال")||n.includes("ر.ی")?10:null}function $t(e){return(e.includes("تومان")||e.includes("تومن"))&&!e.includes("ریال")?1:10}function F(e,t,n={}){const i=n.window??48;for(const r of t){let a=0;for(;;){const l=e.indexOf(r,a);if(l<0)break;const o=l+r.length;a=o;const u=e.slice(o,o+16);if(!n.veto?.some(d=>u.includes(d))){ye.lastIndex=0;for(const d of e.matchAll(ye)){const f=d.index;if(f<o)continue;if(f-o>i)break;if(gt(e,f,f+d[0].length))continue;const b=ht(d[0]);if(!b)continue;const g=Number(b);if(!(g===0&&!n.allowZero))return{value:g,divisor:wt(e,f+d[0].length)}}}}}return null}function we(e,t){return Math.round(e.value*(10/(e.divisor??t)))}function St(e){let t=0;for(;t<e.length;){const n=e.indexOf("رمز",t);if(n<0)return!1;const i=n===0?" ":e[n-1];if(!/\p{L}/u.test(i)){const r=e.slice(n+2,n+2+40);if(/[0-9۰-۹٠-٩]/.test(r))return!0}t=n+1}return!1}function It(e,t){let n=e.indexOf(t);for(;n>=0;){const i=n===0?void 0:e[n-1],r=e[n+t.length];if((!i||!/\p{L}/u.test(i))&&(!r||!/\p{L}/u.test(r)))return!0;n=e.indexOf(t,n+1)}return!1}function Mt(e){return pt.some(t=>e.includes(t))||bt.some(t=>It(e,t))}function Tt(e){const t=vt(e),n=$t(t);if(Mt(t))return{amountRial:null,direction:null,balanceRial:null,printedAt:""};const i=F(t,ft,{allowZero:!0,veto:mt});let r=be.some(f=>t.includes(f)),a=he.some(f=>t.includes(f));t.includes("پرداخت گروهی")&&t.includes("واریز گروهی")&&(r=!0,a=!1);const l=t.split("نوع تراکنش:").slice(1).join("نوع تراکنش:").trim().slice(0,60);l.length>0&&(r=l.includes("بازپرداخت")||l.includes("واریز"),a=l.includes("خرید")||l.includes("انتقال")||l.includes("برداشت"));const o=(r?F(t,be):null)??(a?F(t,he):null),u=St(t)?o??F(t,ve):F(t,ve)??o,d=u==null?null:r&&!a?"in":a&&!r?"out":null;return{amountRial:u?we(u,n):null,direction:d,balanceRial:i?we(i,n):null,printedAt:e.match(yt)?.[0]?.trim()??""}}const kt="https://pouyarn.github.io/Zheton",K={title:"ماشین‌حساب‌های مالی | ژتون",description:"هفت ماشین‌حساب فارسی برای مهریه، تأخیر تادیه، تورم، قدرت خرید حقوق، حباب سکه، هزینهٔ عادت روزانه و قسط وام.",heading:"ماشین‌حساب‌ها",lead:"هفت محاسبهٔ مالی با نرخ روز یا دادهٔ رسمی. بدون ثبت‌نام، بدون ارسال داده."},ue=Object.freeze([{id:"mehrieh",href:"/tools/mehrieh/",title:"محاسبهٔ ارزش مهریه با نرخ سکه | ژتون",description:"ارزش مهریه را بر اساس تعداد سکه و نرخ زندهٔ سکهٔ امامی، بهار، نیم، ربع و گرمی حساب کن؛ با ورودی دستی نرخ. تخمینی و بدون ثبت‌نام.",heading:"ارزش مهریه",lead:"تعداد سکه را با نرخ روز حساب کن. این یک تخمین از هزینهٔ جایگزینی است، نه ارزیابی رسمی.",blurb:"ارزش سکه‌های مهریه با نرخ روز سکه"},{id:"takhir-tadieh",href:"/tools/takhir-tadieh/",title:"محاسبهٔ خسارت تأخیر تادیه با تورم | ژتون",description:"خسارت تأخیر تادیه را با شاخص قیمت مصرف‌کننده و مادهٔ ۵۲۲ قانون آیین دادرسی مدنی تخمین بزن. مبلغ بدهی، سال سررسید و سال پرداخت را وارد کن.",heading:"خسارت تأخیر تادیه",lead:"تخمین جبران کاهش قدرت خرید بدهی، بر پایهٔ شاخص قیمت مصرف‌کننده.",blurb:"تخمین خسارت تأخیر با شاخص CPI"},{id:"tavarom",href:"/tools/tavarom/",title:"محاسبهٔ تورم و قدرت خرید تومان | ژتون",description:"قدرت خرید مبلغی تومان را از سالی به سال دیگر با شاخص CPI محاسبه کن؛ هم‌ارز اسمی و تورم انباشته را ببین. دادهٔ ۱۳۸۰ تا ۱۴۰۵.",heading:"تورم و قدرت خرید",lead:"ببین مبلغی در سال مبدأ، به قیمت‌های سال مقصد چقدر می‌ارزد.",blurb:"قدرت خرید تومان بین دو سال"},{id:"hoghugh",href:"/tools/hoghugh/",title:"قدرت خرید حقوق ۱۴۰۰ تا ۱۴۰۵ | ژتون",description:"قدرت خرید حقوق ۱۴۰۰ را با قیمت‌های ۱۴۰۵ بسنج: چقدر ارزشش کم شده و در ۱۴۰۵ چقدر حقوق لازم است تا همان قدرت خرید حفظ شود.",heading:"قدرت خرید حقوق",lead:"حقوق ۱۴۰۰ را با قیمت‌های ۱۴۰۵ بسنج.",blurb:"حقوق ۱۴۰۰ در قیمت‌های ۱۴۰۵"},{id:"hobab-sekke",href:"/tools/hobab-sekke/",title:"محاسبهٔ حباب سکه | ژتون",description:"حباب سکه را با وزن، عیار، قیمت سکه و قیمت گرم طلای ۱۸ عیار حساب کن؛ ارزش ذاتی و درصد حباب را ببین. نرخ زنده یا دستی.",heading:"حباب سکه",lead:"فاصلهٔ قیمت سکه از ارزش طلای داخلش، به درصد.",blurb:"فاصلهٔ قیمت سکه از ارزش ذاتی طلا"},{id:"hazine-adi",href:"/tools/hazine-adi/",title:"هزینهٔ سالانهٔ قهوه و سیگار | ژتون",description:"هزینهٔ سالانه و چندسالهٔ قهوه یا سیگار را با هزینهٔ روزانه و نرخ تورم قابل انتخاب محاسبه کن؛ هزینهٔ هر سال و مجموع را ببین.",heading:"هزینهٔ قهوه و سیگار",lead:"هزینهٔ سالانهٔ یک عادت روزانه، با تورم قابل انتخاب.",blurb:"هزینهٔ سالانه و چندسالهٔ یک عادت"},{id:"ghast-vam",href:"/tools/ghast-vam/",title:"محاسبهٔ قسط وام | ژتون",description:"قسط ماهانهٔ وام را با مبلغ اصل، نرخ سالانه و تعداد ماه حساب کن؛ مجموع بازپرداخت و سود را هم ببین. فرمول قسط ثابت (PMT).",heading:"قسط وام",lead:"قسط ماهانه، مجموع بازپرداخت و سود وام.",blurb:"قسط ماهانه و مجموع بازپرداخت وام"}]);function E(e){return ue.find(t=>t.id===e)}function xt(e){let t=e.split(/[?#]/,1)[0]??"";if(t.length>1&&(t=t.replace(/\/+$/,"")),t!=="/tools"&&!t.startsWith("/tools/"))return null;if(t==="/tools")return{kind:"index"};const n=ue.find(i=>i.href.replace(/\/$/,"")===t);return n?{kind:"tool",tool:n}:{kind:"not-found"}}function Nt(e){let t=e.split(/[?#]/,1)[0]??"/";return t.startsWith("/")||(t=`/${t}`),t!=="/"&&!t.endsWith("/")&&(t=`${t}/`),`${kt}${t}`}function At(e){let t=document.head.querySelector(`meta[name="${e}"]`);return t==null&&(t=document.createElement("meta"),t.name=e,document.head.append(t)),t}function Et(){let e=document.head.querySelector('link[rel="canonical"]');return e==null&&(e=document.createElement("link"),e.rel="canonical",document.head.append(e)),e}function te(e,t,n){document.title=e,At("description").content=t,Et().href=Nt(n)}const Pe=Object.freeze([{year:1380,index:2.36},{year:1381,index:2.72},{year:1382,index:3.14},{year:1383,index:3.62},{year:1384,index:4.1},{year:1385,index:4.62},{year:1386,index:5.47},{year:1387,index:6.86},{year:1388,index:7.6},{year:1389,index:8.55},{year:1390,index:10.38},{year:1391,index:13.55},{year:1392,index:18.25},{year:1393,index:21.1},{year:1394,index:23.61},{year:1395,index:25.78},{year:1396,index:28.34},{year:1397,index:37.01},{year:1398,index:52.25},{year:1399,index:71.33},{year:1400,index:100},{year:1401,index:147.5},{year:1402,index:207.53},{year:1403,index:280.17},{year:1404,index:406.24,estimated:!0},{year:1405,index:589.06,estimated:!0}]),Re=new Map(Pe.map(e=>[e.year,e]));function _(e){if(!Number.isInteger(e))return null;const t=Re.get(e);return t==null?null:t.index}function G(){return Pe.map(e=>e.year)}function Lt(e){return Re.get(e)?.estimated===!0}function Ot(e,t){const n=_(e),i=_(t);return n==null||i==null||n<=0||i<=0?null:i/n}function T(e){return Number.isFinite(e)&&e>=0}function ae(e){return Number.isFinite(e)&&e>0}function k(e){return Number.isFinite(e)?e:null}function Ct(e,t){return!T(e)||!T(t)?null:k(e*t)}function de(e,t,n){if(!T(e))return null;const i=Ot(t,n),r=_(t),a=_(n);if(i==null||r==null||a==null)return null;const l=e*i,o=e/i;if(!Number.isFinite(l)||!Number.isFinite(o))return null;const u=Math.abs(n-t),d=u===0?null:(Math.pow(i,1/u)-1)*100;return{amountToman:e,fromYear:t,toYear:n,cpiFrom:r,cpiTo:a,equivalentToman:l,purchasingPowerToman:o,cumulativeInflationPercent:(i-1)*100,annualizedInflationPercent:d!=null&&Number.isFinite(d)?d:null}}function Pt(e,t,n){if(!T(e))return null;const i=de(e,t,n);return i==null?null:{salaryToman:e,fromYear:t,toYear:n,purchasingPowerToman:i.purchasingPowerToman,requiredSalaryToman:i.equivalentToman,lossPercent:e===0?0:(1-i.purchasingPowerToman/e)*100,cumulativeInflationPercent:i.cumulativeInflationPercent}}function Rt(e,t,n){if(!T(e))return null;const i=de(e,t,n);if(i==null)return null;const r=e+Math.max(0,i.equivalentToman-e);return{principalToman:e,fromYear:t,toYear:n,cpiFrom:i.cpiFrom,cpiTo:i.cpiTo,damagesToman:Math.max(0,i.equivalentToman-e),totalToman:r,cumulativeInflationPercent:i.cumulativeInflationPercent}}const je=750;function jt(e,t,n,i=je){return!T(e)||!T(n)||!ae(t)||t>1e3||!ae(i)||i>1e3?null:k(e*(t/i)*n)}function _t(e,t){return!T(e)||!ae(t)?null:k((e-t)/t*100)}function qt(e,t,n,i,r=je){const a=jt(t,n,i,r);if(a==null)return null;const l=_t(e,a);return l==null?null:{coinPriceToman:e,weightGrams:t,purityPermille:n,goldPurityPermille:r,goldPricePerGramToman:i,intrinsicToman:a,bubblePercent:l,premiumToman:e-a}}function _e(e,t,n){return T(e)&&Number.isFinite(t)&&t>0&&t<=366&&Number.isFinite(n)&&n>-100&&n<=1e4}function $e(e,t=365,n=0,i=0){if(!_e(e,t,n)||!Number.isInteger(i)||i<0)return null;const a=e*t*Math.pow(1+n/100,i);return k(a)}function Ht(e,t=365,n=0,i=1){if(!_e(e,t,n)||!Number.isInteger(i)||i<1||i>1e3)return null;const r=e*t,a=n/100,l=Math.abs(a)<1e-12?r*i:r*(Math.pow(1+a,i)-1)/a;return k(l)}function Ft(e,t,n,i){if(!Number.isInteger(i)||i<1||i>1e3)return null;const r=$e(e,t,n,0),a=$e(e,t,n,i-1),l=Ht(e,t,n,i);return r==null||a==null||l==null?null:{dailyCostToman:e,daysPerYear:t,inflationPercent:n,years:i,firstYearToman:r,finalYearToman:a,totalToman:l}}function qe(e,t,n){if(!T(e)||!Number.isFinite(t)||t<0||t>1e3||!Number.isInteger(n)||n<1||n>1200)return null;const i=t/1200;if(i===0)return k(e/n);const r=e*i/(1-Math.pow(1+i,-n));return k(r)}function Dt(e,t,n){const i=qe(e,t,n);return i==null?null:k(i*n)}function Bt(e,t,n){const i=qe(e,t,n),r=Dt(e,t,n);return i==null||r==null?null:{principalToman:e,annualRatePercent:t,months:n,monthlyRate:t/1200,installmentToman:i,totalToman:r,interestToman:Math.max(0,r-e)}}const q=Object.freeze([{id:"emami",label:"سکهٔ تمام امامی",weightGrams:8.133,purityPermille:900,rateKey:"coin_emami"},{id:"bahar",label:"سکهٔ تمام بهار آزادی",weightGrams:8.133,purityPermille:900,rateKey:"coin_bahar"},{id:"nim",label:"نیم‌سکه",weightGrams:4.0665,purityPermille:900,rateKey:"coin_nim"},{id:"rob",label:"ربع‌سکه",weightGrams:2.0333,purityPermille:900,rateKey:"coin_rob"},{id:"gerami",label:"سکهٔ گرمی",weightGrams:1,purityPermille:900,rateKey:"coin_gerami"}]);function W(e){return q.find(t=>t.id===e)}const Ut="gold18",He="rates:last-good:v1";function Fe(e){if(e==null||typeof e!="object"||Array.isArray(e))return null;const t=e,n=t.toman;if(n==null||typeof n!="object"||Array.isArray(n))return null;const i={};for(const[a,l]of Object.entries(n))typeof l=="number"&&Number.isFinite(l)&&l>0&&(i[a]=l);return Object.keys(i).length===0?null:{updatedAt:typeof t.updatedAt=="number"&&Number.isFinite(t.updatedAt)?ke(t.updatedAt):0,toman:i}}function le(e,t){const n=e?.toman[t];return typeof n=="number"&&Number.isFinite(n)&&n>0?n:null}function De(){try{return typeof localStorage>"u"?null:localStorage}catch{return null}}function Be(){const e=De();if(e==null)return null;try{return Fe(JSON.parse(e.getItem(He)??"null"))}catch{return null}}function zt(e){const t=De();if(t!=null)try{t.setItem(He,JSON.stringify(e))}catch{}}async function Ue(){const e=["https://pouyarn.github.io/Zheton/rates.json","./rates.json"];for(const t of e)try{const[n,i]=await Promise.all([fetch(t,{headers:{accept:"application/json"},signal:AbortSignal.timeout(6e3)}),fetch(`${t}.sig`,{headers:{accept:"text/plain"},signal:AbortSignal.timeout(6e3)})]);if(!n.ok||!i.ok)continue;const r=new Uint8Array(await n.arrayBuffer()),a=(await i.text()).trim(),l=new TextDecoder("utf-8").decode(r),o=JSON.parse(l),u=typeof o.kid=="string"?o.kid:"k1";if(!await Je(r,a,u))continue;const f=Fe(o);if(f)return zt(f),f}catch{continue}return null}function ze(e){if(e.updatedAt<=0)return"زمان نامشخص";try{return new Intl.DateTimeFormat("fa-IR",{dateStyle:"short",timeStyle:"short"}).format(new Date(ke(e.updatedAt)))}catch{return"زمان نامشخص"}}const Ke="۰۱۲۳۴۵۶۷۸۹";function p(e,t=0){if(!Number.isFinite(e))return"—";const n=Math.min(Math.max(Math.trunc(t),0),10),i=e<0?"−":"",r=Math.abs(e).toLocaleString("en-US",{minimumFractionDigits:n,maximumFractionDigits:n,useGrouping:!0});return(i+r.replace(".","٫")).replace(/[0-9]/g,a=>Ke[Number(a)])}function Ge(e){return Number.isFinite(e)?String(Math.trunc(e)).replace(/[0-9]/g,t=>Ke[Number(t)]):"—"}function H(e,t=0){return`${p(e,t)} تومان`}function A(e,t=1){return`${p(e,t)}٪`}function J(e){if(typeof e!="string")return null;let t=e.trim();if(t===""||(t=t.replace(/[۰-۹]/g,i=>String(i.codePointAt(0)-1776)).replace(/[٠-٩]/g,i=>String(i.codePointAt(0)-1632)).replace(/[٬,،\s]/g,"").replace(/٫/g,"."),!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(t)))return null;const n=Number(t);return Number.isFinite(n)?n:null}function v(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function fe(e){const t=document.createElement("div");return t.innerHTML=e.trim(),t.firstElementChild}function w(e,t){const n=e.querySelector(`#${t}`);return n==null?null:J(n.value)}function D(e,t){return e.querySelector(`#${t}`)?.value??""}function Se(e,t,n){const i=e.querySelector(`#${t}`);i!=null&&(i.value=String(n))}function L(e,t,n,i=[],r){return`
    <div class="result-label">${v(e)}</div>
    <div class="result-figure">
      <span class="figure">${v(t)}</span>${n?`<span class="unit">${v(n)}</span>`:""}
    </div>
    ${i.length?`<dl class="result-rows">${i.map(a=>`
          <div>
            <dt>${v(a.label)}</dt>
            <dd>${v(a.value)}${a.hint?`<span class="hint">${v(a.hint)}</span>`:""}</dd>
          </div>`).join("")}</dl>`:""}
    ${r?`<p class="fineprint">${v(r)}</p>`:""}
  `}function O(e){return`<p class="error" role="alert">${v(e)}</p>`}function $(e="عددها را وارد کن تا نتیجه را ببینی."){return`<p class="muted result-empty">${v(e)}</p>`}function C(e,t,n){const i=e.querySelector(`#${t}`);i!=null&&(i.addEventListener("submit",r=>{r.preventDefault(),n()}),i.addEventListener("input",n),n())}function V(e,t,n=i=>String(i)){return e.map(i=>`<option value="${i}"${i===t?" selected":""}>${v(n(i))}</option>`).join("")}const Z=e=>`${Ge(e)}${Lt(e)?" (تقریبی)":""}`;function P(e,t){return fe(`
    <div>
      <header class="hero tool-hero">
        <a class="crumb" href="/tools/">← همهٔ ماشین‌حساب‌ها</a>
        <h1>${v(e.heading)}</h1>
        <p class="hero-label">${v(e.lead)}</p>
      </header>
      <div class="page stack">${t}</div>
    </div>
  `)}function R(e){return e.querySelector("#result")}function M(e){return H(Math.round(e))}function We(e){return q.map(t=>`<option value="${t.id}"${t.id===e?" selected":""}>${v(t.label)}</option>`).join("")}function Kt(e){const t=E("mehrieh");e.replaceChildren(P(t,`
      <form class="panel" id="calc">
        <label for="coin">نوع سکه</label>
        <select id="coin">${We("emami")}</select>
        <div class="field-grid">
          <div>
            <label for="count">تعداد سکه</label>
            <input id="count" inputmode="numeric" value="۱۱۰" autocomplete="off" />
          </div>
          <div>
            <label for="price">قیمت هر سکه (تومان)</label>
            <input id="price" inputmode="numeric" autocomplete="off" placeholder="مثلاً ۱۸۰,۰۰۰,۰۰۰" />
          </div>
        </div>
        <p class="fineprint" id="rates-note">نرخ زنده در حال دریافت است…</p>
        <button class="primary" type="submit">حساب کن</button>
      </form>
      <section class="panel result" id="result" aria-live="polite">${$()}</section>
      <p class="fineprint">
        فرمول: تعداد سکه × قیمت هر سکه. این عدد هزینهٔ جایگزینی امروز است؛ عیار، فرسودگی،
        کارمزد و ارزش کلکسیونی در آن نیامده و ارزیابی رسمی یا شرعی نیست.
      </p>
      `));const n=R(e),i=e.querySelector("#coin"),r=e.querySelector("#price"),a=e.querySelector("#rates-note");let l=null,o=null;const u=()=>{const b=w(e,"count"),g=w(e,"price");if(b==null||g==null){n.innerHTML=$();return}const I=Ct(b,g);if(I==null){n.innerHTML=O("تعداد سکه و قیمت باید عددی و صفر یا بزرگ‌تر باشند.");return}const m=W(i.value)??q[0];n.innerHTML=L("ارزش تقریبی مهریه",p(Math.round(I)),"تومان",[{label:"نوع سکه",value:m.label},{label:"تعداد",value:`${p(b,Number.isInteger(b)?0:2)} سکه`},{label:"قیمت هر سکه",value:H(g)}],"تخمین هزینهٔ جایگزینی؛ نه ارزیابی رسمی یا کارشناسی.")},d=(b,g,I=!1)=>{l=b;const m=W(i.value)??q[0],S=le(b,m.rateKey);if(S==null){a.textContent=`نرخ ${m.label} در دادهٔ زنده نبود؛ نرخ را دستی وارد کن.`,u();return}const c=J(r.value);(I||r.value.trim()===""||c==null||c===o)&&(r.value=String(Math.round(S))),o=S,a.textContent=`نرخ ${m.label}: ${H(S)}${g?" (ذخیره‌شده)":""} — ${ze(b)}`,u()};C(e,"calc",u),i.addEventListener("change",()=>{l?d(l,!1,!0):(r.value="",o=null,a.textContent="نرخ زنده در دسترس نیست؛ قیمت سکهٔ انتخاب‌شده را دستی وارد کن.",u())});const f=Be();f&&d(f,!0),Ue().then(b=>{b?d(b,!1):f||(a.textContent="نرخ زنده در دسترس نیست؛ قیمت هر سکه را دستی وارد کن.")})}function Gt(e){const t=E("takhir-tadieh");e.replaceChildren(P(t,`
      <form class="panel" id="calc">
        <label for="principal">مبلغ بدهی (تومان)</label>
        <input id="principal" inputmode="numeric" value="۱۰,۰۰۰,۰۰۰" autocomplete="off" />
        <div class="field-grid">
          <div>
            <label for="due">سال سررسید</label>
            <select id="due">${V(G(),1400,Z)}</select>
          </div>
          <div>
            <label for="paid">سال پرداخت</label>
            <select id="paid">${V(G(),1405,Z)}</select>
          </div>
        </div>
        <button class="primary" type="submit">تخمین بزن</button>
      </form>
      <section class="panel result" id="result" aria-live="polite">${$()}</section>
      <p class="fineprint">
        فرض حقوقی: مادهٔ ۵۲۲ قانون آیین دادرسی مدنی به دادگاه اجازه می‌دهد کاهش ارزش پول را
        بر پایهٔ شاخص تورم رسمی، از زمان سررسید تا پرداخت، جبران کند. این ابزار همان ایده را
        با شاخص سالانهٔ CPI تخمین می‌زند و خودش هیچ تصمیم حقوقی نمی‌گیرد. جریمهٔ قراردادی،
        سود توافقی، هزینهٔ دادرسی و قواعد خاص بانکی در آن نیست؛ عدد دادگاه می‌تواند متفاوت باشد.
      </p>
      `));const n=R(e);C(e,"calc",()=>{const r=w(e,"principal"),a=Number(D(e,"due")),l=Number(D(e,"paid"));if(r==null){n.innerHTML=$();return}const o=Rt(r,a,l);if(o==null){n.innerHTML=O("مبلغ یا سال‌ها معتبر نیستند.");return}n.innerHTML=L("خسارت تأخیر تادیه (تخمین)",p(Math.round(o.damagesToman)),"تومان",[{label:"مبلغ اصل",value:M(o.principalToman)},{label:"مجموع با خسارت",value:M(o.totalToman)},{label:"تورم انباشته",value:A(o.cumulativeInflationPercent)},{label:"شاخص CPI سررسید",value:p(o.cpiFrom,1),hint:"پایهٔ ۱۴۰۰ = ۱۰۰"},{label:"شاخص CPI پرداخت",value:p(o.cpiTo,1)}],"اگر شاخص کاهش پیدا کند، خسارت صفر است؛ خسارت منفی معنا ندارد.")})}function Wt(e){const t=E("tavarom");e.replaceChildren(P(t,`
      <form class="panel" id="calc">
        <label for="amount">مبلغ (تومان)</label>
        <input id="amount" inputmode="numeric" value="۱۰,۰۰۰,۰۰۰" autocomplete="off" />
        <div class="field-grid">
          <div>
            <label for="from">از سال</label>
            <select id="from">${V(G(),1400,Z)}</select>
          </div>
          <div>
            <label for="to">به سال</label>
            <select id="to">${V(G(),1405,Z)}</select>
          </div>
        </div>
        <button class="primary" type="submit">حساب کن</button>
      </form>
      <section class="panel result" id="result" aria-live="polite">${$()}</section>
      <p class="fineprint">
        داده: شاخص بهای کالاها و خدمات مصرفی، میانگین سالانه، پایهٔ ۱۴۰۰ = ۱۰۰ (بانک مرکزی /
        مرکز آمار). ۱۴۰۴ و ۱۴۰۵ تقریبی‌اند. فرمول قدرت خرید: مبلغ × شاخص مبدأ ÷ شاخص مقصد.
      </p>
      `));const n=R(e);C(e,"calc",()=>{const r=w(e,"amount"),a=Number(D(e,"from")),l=Number(D(e,"to"));if(r==null){n.innerHTML=$();return}const o=de(r,a,l);if(o==null){n.innerHTML=O("مبلغ یا سال‌ها معتبر نیستند.");return}n.innerHTML=L(`قدرت خرید در ${Ge(l)}`,p(Math.round(o.purchasingPowerToman)),"تومان",[{label:"هم‌ارز اسمی در سال مقصد",value:M(o.equivalentToman),hint:"مبلغی که همان سبد را در سال مقصد می‌خرد"},{label:"تورم انباشته",value:A(o.cumulativeInflationPercent)},{label:"تورم سالانهٔ میانگین",value:o.annualizedInflationPercent==null?"—":A(o.annualizedInflationPercent)},{label:"شاخص CPI مبدأ",value:p(o.cpiFrom,1),hint:"پایهٔ ۱۴۰۰ = ۱۰۰"},{label:"شاخص CPI مقصد",value:p(o.cpiTo,1)}],"این عدد میانگین سبد مصرفی است؛ اگر مخارج تو با سبد رسمی فرق دارد، عدد هم فرق می‌کند.")})}const Ie=1400,Me=1405;function Jt(e){const t=E("hoghugh");e.replaceChildren(P(t,`
      <form class="panel" id="calc">
        <label for="salary">حقوق در سال ۱۴۰۰ (تومان)</label>
        <input id="salary" inputmode="numeric" value="۱۰,۰۰۰,۰۰۰" autocomplete="off" />
        <p class="fineprint">مقایسهٔ ثابت: ۱۴۰۰ → ۱۴۰۵، با همان شاخص CPI.</p>
        <button class="primary" type="submit">حساب کن</button>
      </form>
      <section class="panel result" id="result" aria-live="polite">${$()}</section>
      <p class="fineprint">
        فرض: حقوق در تمام دوره ثابت مانده و افزایش یا ترفیع نگرفته است. ۱۴۰۵ تقریبی است.
        اگر در این دوره حقوقت تغییر کرده، حقوق فعلی را با همین ابزار برای بازهٔ سال تغییر
        مقایسه کن.
      </p>
      `));const n=R(e);C(e,"calc",()=>{const r=w(e,"salary");if(r==null){n.innerHTML=$();return}const a=Pt(r,Ie,Me);if(a==null){n.innerHTML=O("حقوق را درست وارد کن.");return}n.innerHTML=L("قدرت خرید حقوق ۱۴۰۰ در قیمت‌های ۱۴۰۵",p(Math.round(a.purchasingPowerToman)),"تومان",[{label:"حقوق لازم در ۱۴۰۵ برای همان قدرت خرید",value:M(a.requiredSalaryToman)},{label:"افت قدرت خرید",value:A(a.lossPercent)},{label:"تورم انباشتهٔ ۱۴۰۰ تا ۱۴۰۵",value:A(a.cumulativeInflationPercent)},{label:"شاخص CPI ۱۴۰۰",value:p(_(Ie)??0,1),hint:"پایهٔ ۱۴۰۰ = ۱۰۰"},{label:"شاخص CPI ۱۴۰۵",value:p(_(Me)??0,1)}],"حقوق ثابت فرض شده؛ هر افزایش حقوقی که گرفته باشی، این عدد را بهتر می‌کند.")})}function Vt(e){const t=E("hobab-sekke");e.replaceChildren(P(t,`
      <form class="panel" id="calc">
        <label for="coin">نوع سکه</label>
        <select id="coin">${We("emami")}</select>
        <div class="field-grid">
          <div>
            <label for="weight">وزن (گرم)</label>
            <input id="weight" inputmode="decimal" value="۸٫۱۳۳" autocomplete="off" />
          </div>
          <div>
            <label for="purity">عیار (از ۱۰۰۰)</label>
            <input id="purity" inputmode="numeric" value="۹۰۰" autocomplete="off" />
          </div>
          <div>
            <label for="coin-price">قیمت سکه (تومان)</label>
            <input id="coin-price" inputmode="numeric" autocomplete="off" placeholder="مثلاً ۱۸۰,۰۰۰,۰۰۰" />
          </div>
          <div>
            <label for="gold-price">قیمت گرم طلای ۱۸ عیار (تومان)</label>
            <input id="gold-price" inputmode="numeric" autocomplete="off" placeholder="مثلاً ۱۸,۰۰۰,۰۰۰" />
          </div>
        </div>
        <p class="fineprint" id="rates-note">نرخ زنده در حال دریافت است…</p>
        <button class="primary" type="submit">حساب کن</button>
      </form>
      <section class="panel result" id="result" aria-live="polite">${$()}</section>
      <p class="fineprint">
        فرمول: ارزش ذاتی = وزن × (عیار سکه ÷ عیار مبنای نرخ) × قیمت هر گرم؛ حباب =
        (قیمت سکه − ارزش ذاتی) ÷ ارزش ذاتی × ۱۰۰. عیار مبنای نرخ ۱۸ عیار (۷۵۰) است.
        کارمزد، مالیات و ارزش کلکسیونی در محاسبه نیست.
      </p>
      `));const n=R(e),i=e.querySelector("#coin"),r=e.querySelector("#coin-price"),a=e.querySelector("#rates-note");let l=null,o=null,u=null;const d=()=>{const m=w(e,"coin-price"),S=w(e,"weight"),c=w(e,"purity"),s=w(e,"gold-price");if(m==null||S==null||c==null||s==null){n.innerHTML=$();return}const h=qt(m,S,c,s);if(h==null){n.innerHTML=O("قیمت‌ها و وزن باید صفر یا بزرگ‌تر باشند و عیارها بین ۱ و ۱۰۰۰.");return}n.innerHTML=L("حباب سکه",p(h.bubblePercent,1),"٪",[{label:"ارزش ذاتی (طلای داخل سکه)",value:M(h.intrinsicToman)},{label:"قیمت سکه",value:H(h.coinPriceToman)},{label:"اختلاف با ارزش ذاتی",value:`${M(h.premiumToman)}`,hint:h.premiumToman<0?"زیر ارزش ذاتی (حباب منفی)":"بیش از ارزش ذاتی"},{label:"وزن / عیار سکه",value:`${p(h.weightGrams,3)} گرم / ${p(h.purityPermille)} از ۱۰۰۰`}],"حباب مثبت یعنی سکه از طلایش گران‌تر است. حباب منفی نادر است و معمولاً فرصت فروش طلا نیست؛ کارمزد بازار را هم در نظر بگیر.")},f=()=>{const m=W(i.value)??q[0];Se(e,"weight",m.weightGrams),Se(e,"purity",m.purityPermille)},b=m=>{const S=W(i.value)??q[0],c=l?le(l,S.rateKey):null;if(c==null)return;const s=J(r.value);(m||r.value.trim()===""||s==null||s===o)&&(r.value=String(Math.round(c))),o=c},g=(m,S,c=!1)=>{l=m,b(c);const s=e.querySelector("#gold-price"),h=le(m,Ut);if(h!=null){const U=J(s.value);(c||s.value.trim()===""||U==null||U===u)&&(s.value=String(Math.round(h))),u=h,a.textContent=`نرخ طلای ۱۸ عیار: ${H(h)}${S?" (ذخیره‌شده)":""} — ${ze(m)}`}else a.textContent="نرخ طلا در دادهٔ زنده نبود؛ قیمت‌ها را دستی وارد کن.";d()};C(e,"calc",d),i.addEventListener("change",()=>{f(),l?g(l,!1,!0):(r.value="",o=null,d())}),f();const I=Be();I&&g(I,!0),Ue().then(m=>{m?g(m,!1):I||(a.textContent="نرخ زنده در دسترس نیست؛ قیمت‌ها را دستی وارد کن.")})}const Zt=[0,10,20,30,40,50];function Xt(e){const t=E("hazine-adi");e.replaceChildren(P(t,`
      <form class="panel" id="calc">
        <label for="daily">هزینهٔ روزانه (قهوه، سیگار یا هر عادت) — تومان</label>
        <input id="daily" inputmode="numeric" value="۱۰۰,۰۰۰" autocomplete="off" />
        <div class="field-grid">
          <div>
            <label for="days">روز در سال</label>
            <input id="days" inputmode="numeric" value="۳۶۵" autocomplete="off" />
          </div>
          <div>
            <label for="inflation">تورم سالانه</label>
            <select id="inflation">
              ${Zt.map(r=>`<option value="${r}"${r===40?" selected":""}>${p(r)}٪</option>`).join("")}
            </select>
          </div>
          <div>
            <label for="years">چند سال</label>
            <input id="years" inputmode="numeric" value="۵" autocomplete="off" />
          </div>
        </div>
        <button class="primary" type="submit">حساب کن</button>
      </form>
      <section class="panel result" id="result" aria-live="polite">${$()}</section>
      <p class="fineprint">
        فرض: هزینهٔ روزانه امروز است، هر روز سال تکرار می‌شود و قیمت یک‌بار در سال با نرخ
        انتخابی مرکب می‌شود. این هزینهٔ اسمی است، نه هزینهٔ فرصت سرمایه‌گذاری آن پول.
      </p>
      `));const n=R(e);C(e,"calc",()=>{const r=w(e,"daily"),a=w(e,"days"),l=w(e,"years"),o=Number(D(e,"inflation"));if(r==null||a==null||l==null){n.innerHTML=$();return}const u=Ft(r,a,o,l);if(u==null){n.innerHTML=O("هزینه، روزها و سال‌ها باید معتبر باشند (سال بین ۱ تا ۱۰۰۰).");return}n.innerHTML=L(`هزینهٔ ${p(u.years)} سال`,p(Math.round(u.totalToman)),"تومان",[{label:"سال اول",value:M(u.firstYearToman)},{label:"سال آخر",value:M(u.finalYearToman),hint:`با تورم ${A(u.inflationPercent,0)} مرکب`},{label:"میانگین سالانه",value:M(u.totalToman/u.years)},{label:"هزینهٔ روزانه",value:H(r)}],"اگر همان پول را سرمایه‌گذاری می‌کردی، عدد دیگری می‌شد؛ این فقط خرج اسمی عادت است.")})}function Yt(e){const t=E("ghast-vam");e.replaceChildren(P(t,`
      <form class="panel" id="calc">
        <label for="principal">مبلغ وام (تومان)</label>
        <input id="principal" inputmode="numeric" value="۱۰۰,۰۰۰,۰۰۰" autocomplete="off" />
        <div class="field-grid">
          <div>
            <label for="rate">نرخ سالانه (٪)</label>
            <input id="rate" inputmode="decimal" value="۲۳" autocomplete="off" />
          </div>
          <div>
            <label for="months">تعداد ماه</label>
            <input id="months" inputmode="numeric" value="۶۰" autocomplete="off" />
          </div>
        </div>
        <button class="primary" type="submit">حساب کن</button>
      </form>
      <section class="panel result" id="result" aria-live="polite">${$()}</section>
      <p class="fineprint">
        قسط ثابت (PMT)؛ r نرخ ماهانه است:
        <code class="formula" dir="ltr">PMT = P × r / (1 − (1 + r)⁻ⁿ),  r = annual rate / 1200</code>
        فرض: نرخ ثابت، پرداخت پایان هر ماه، بدون کارمزد، بیمه، تنفس یا قسط آخر متفاوت.
      </p>
      `));const n=R(e);C(e,"calc",()=>{const r=w(e,"principal"),a=w(e,"rate"),l=w(e,"months");if(r==null||a==null||l==null){n.innerHTML=$();return}const o=Bt(r,a,l);if(o==null){n.innerHTML=O("مبلغ و نرخ باید صفر یا بزرگ‌تر و تعداد ماه بین ۱ تا ۱۲۰۰ باشد.");return}n.innerHTML=L("قسط ماهانه",p(Math.round(o.installmentToman)),"تومان",[{label:"مجموع بازپرداخت",value:M(o.totalToman)},{label:"مجموع سود",value:M(o.interestToman)},{label:"نرخ ماهانه",value:A(o.monthlyRate*100,2),hint:"نرخ اسمی، مرکب ماهانه"},{label:"تعداد قسط",value:`${p(o.months)} ماه`}],"نرخ مؤثر واقعی با کارمزد و بیمه بالاتر می‌شود؛ این عدد فقط خود وام است.")})}function Qt(e){e.replaceChildren(fe(`
      <div>
        <header class="hero tool-hero">
          <a class="crumb" href="/">ژتون</a>
          <h1>${v(K.heading)}</h1>
          <p class="hero-label">${v(K.lead)}</p>
        </header>
        <div class="page stack">
          <div class="tools-grid">
            ${ue.map(t=>`
              <a class="tool-card" href="${t.href}">
                <span class="tool-card-body">
                  <span class="tool-card-title">${v(t.heading)}</span>
                  <span class="muted">${v(t.blurb)}</span>
                </span>
                <span class="tool-card-go" aria-hidden="true">←</span>
              </a>`).join("")}
          </div>
          <p class="fineprint">
            نرخ‌ها از همان سرویس نرخ ژتون می‌آیند و روی دستگاه ذخیره می‌شوند؛ هیچ
            ورودی‌ای به سرور فرستاده نمی‌شود. محاسبه‌ها تخمینی‌اند، نه مشاورهٔ مالی یا حقوقی.
          </p>
        </div>
      </div>
    `))}function en(e){e.replaceChildren(fe(`
      <div>
        <header class="hero tool-hero">
          <a class="crumb" href="/">ژتون</a>
          <h1>این صفحه پیدا نشد</h1>
          <p class="hero-label">نشانی اشتباه است یا این ماشین‌حساب هنوز ساخته نشده.</p>
        </header>
        <div class="page stack">
          <a class="panel tools-entry" href="/tools/">
            <span class="tools-entry-body">
              <strong>همهٔ ماشین‌حساب‌ها</strong>
              <span class="muted">هفت ابزار مالی</span>
            </span>
            <span aria-hidden="true">←</span>
          </a>
        </div>
      </div>
    `))}const tn=Object.freeze({mehrieh:Kt,"takhir-tadieh":Gt,tavarom:Wt,hoghugh:Jt,"hobab-sekke":Vt,"hazine-adi":Xt,"ghast-vam":Yt});function nn(e){const t=xt(location.pathname);return t==null?!1:(t.kind==="index"?(te(K.title,K.description,"/tools/"),Qt(e)):t.kind==="tool"?(te(t.tool.title,t.tool.description,t.tool.href),tn[t.tool.id]?.(e)):(te("این صفحه پیدا نشد | ژتون","نشانی درخواستی در ماشین‌حساب‌ها پیدا نشد.",location.pathname),en(e)),window.scrollTo(0,0),!0)}const y=document.getElementById("app"),rn="۰۱۲۳۴۵۶۷۸۹",X=e=>Math.round(e).toLocaleString("en-US").replace(/[0-9]/g,t=>rn[Number(t)]),z=e=>X(e/10),ne=(e,t=0)=>(e.length*.66+t).toFixed(2);function me(e){const t=document.createElement("div");return t.innerHTML=e.trim(),t.firstElementChild}function j(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}async function an(){const e=await ce("session");if(!e)return null;const t={...e,member:e.member??re(),name:e.name?.trim()||"عضو خانواده"};return(!e.member||!e.name)&&await ee("session",t),{...t,key:await xe(new Uint8Array(t.key))}}async function ln(e,t){const n=re(),i=re(),r=await fetch(`${e.url}/v1/pair`,{method:"POST",headers:{authorization:`Bearer ${e.hid}.${"0".repeat(64)}`},body:JSON.stringify({code:e.code,memberId:n,deviceId:i})});if(!r.ok)throw new Error("این کد دیگه معتبر نیست.");const{secret:a}=await r.json(),l={base:e.url,token:`${e.hid}.${a}`,device:i,member:n,name:t.trim().slice(0,32),scope:e.scope,key:[...e.key]};await ee("session",l);const o={...l,key:await xe(e.key)};return await Ce(o),o}const on=`
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
       stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20 12a8 8 0 1 1-2.34-5.66" /><path d="M20 4v4.6h-4.6" />
  </svg>`;function Te(e){y.replaceChildren(me(`
      <div>
        <header class="hero"><h1>ژتون</h1></header>
        <div class="page stack">
          <div class="panel"><p>از بخش خانواده روی گوشی یکی از اعضا، کد دعوت رو اسکن کن.</p></div>
          <a class="panel tools-entry" href="/tools/">
            <span class="tools-entry-body">
              <strong>ماشین‌حساب‌ها</strong>
              <span class="muted">مهریه، تورم، حباب سکه، قسط وام…</span>
            </span>
            <span aria-hidden="true">←</span>
          </a>
          ${e?`<p class="error">${j(e)}</p>`:""}
        </div>
      </div>
    `))}function cn(e,t){const n=`muchtoman://join${t}`;y.replaceChildren(me(`
      <div>
        <header class="hero">
          <h1>پیوستن به خانواده</h1>
          <p class="hero-label">اگر اپ اندروید نصب شده، دعوت رو مستقیم داخل اپ باز کن.</p>
        </header>
        <div class="page stack">
          <button id="open-native" class="primary">باز کردن در اپ اندروید</button>
          <div class="muted">یا در همین مرورگر ادامه بده:</div>
          <form id="join" class="panel">
            <label for="name">اسم تو</label>
            <input id="name" maxlength="32" required />
            <button type="submit">پیوستن در مرورگر</button>
          </form>
          <a class="panel tools-entry" href="/tools/">
            <span class="tools-entry-body">
              <strong>ماشین‌حساب‌ها</strong>
              <span class="muted">مهریه، تورم، حباب سکه، قسط وام…</span>
            </span>
            <span aria-hidden="true">←</span>
          </a>
          <p id="join-error" class="error"></p>
        </div>
      </div>
    `)),y.querySelector("#open-native").addEventListener("click",()=>{location.href=n}),y.querySelector("#join").addEventListener("submit",async i=>{i.preventDefault();const r=y.querySelector("#name").value.trim();if(r)try{const a=await ln(e,r);await B(a,"به خانواده پیوستی."),Y(a)}catch(a){y.querySelector("#join-error").textContent=a instanceof Error?a.message:String(a)}})}function sn(e){if(e==null||typeof e!="object")return!1;const t=e;return typeof t.at=="number"&&typeof t.amountRial=="number"}async function B(e,t,n=!1){const i=await nt(),r=new Map,a=new Map;for(const c of i){if(c.value==null||typeof c.value!="object")continue;const s=c.value,h=c.kind??"legacy";h==="member"&&s.kind==="member"&&typeof s.memberId=="string"&&s.memberId===c.ownerMemberId&&r.set(s.memberId,c.value),h==="category"&&s.kind==="category"&&typeof s.target=="string"&&a.set(s.target,c.value)}const l=i.filter(c=>{const s=c.kind??"legacy";return(s==="transaction"||s==="legacy")&&sn(c.value)}).map(c=>{const s=c.value,h=(c.kind??"legacy")==="legacy"?c.authorMemberId||"":c.ownerMemberId||c.authorMemberId||"",U=a.get(c.id);return{id:c.id,entry:s,ownerName:r.get(h)?.name||(h===e.member?e.name:"عضو خانواده"),categoryName:U?.categoryName||s.categoryName||"دسته‌بندی نشده"}}).sort((c,s)=>s.entry.at-c.entry.at),o=l.filter(c=>c.entry.direction==="in").reduce((c,s)=>c+s.entry.amountRial,0),u=l.filter(c=>c.entry.direction==="out").reduce((c,s)=>c+s.entry.amountRial,0),d=[...r.values()].sort((c,s)=>c.name.localeCompare(s.name,"fa")),[f,b,g]=[z(o-u),z(o),z(u)];y.replaceChildren(me(`
      <div>
        <header class="hero">
          <p class="hero-label">این ماه</p>
          <div class="figure total" style="--fit:${ne(f,1.3)}">${f}<span class="unit">تومان</span></div>
          <div class="hero-actions">
            <button id="sync" class="hero-action" type="button">
              <span class="disc">${on}</span>
              همگام کن
            </button>
          </div>
          ${t?`<p class="strip${n?" warn":""}">${j(t)}</p>`:""}
        </header>
        <div class="page stack">
          <div class="panel">
            <div class="flow">
              <div style="--fit:${ne(b)}">
                <div class="muted">درآمد این ماه</div>
                <span class="figure amount in">${b}</span>
              </div>
              <div style="--fit:${ne(g)}">
                <div class="muted">خرج این ماه</div>
                <span class="figure amount">${g}</span>
              </div>
            </div>
            ${o>0||u>0?`
              <div class="bar">
                ${o>0?`<span class="in" style="flex:${o}"></span>`:""}
                ${u>0?`<span class="out" style="flex:${u}"></span>`:""}
              </div>`:""}
          </div>
          ${d.length?`<div class="muted">اعضا: ${d.map(c=>j(c.name)).join("، ")}</div>`:""}
          <a class="panel tools-entry" href="/tools/">
            <span class="tools-entry-body">
              <strong>ماشین‌حساب‌ها</strong>
              <span class="muted">مهریه، تورم، حباب سکه، قسط وام…</span>
            </span>
            <span aria-hidden="true">←</span>
          </a>
          <div class="panel">
            <label for="paste">متن پیامک بانکی رو اینجا بچسبون</label>
            <textarea id="paste" rows="3"></textarea>
            <button id="read" type="button">خواندن پیامک</button>
            <form id="manual">
              <label for="amount">مبلغ (تومان)</label>
              <input id="amount" inputmode="numeric" required />
              <label for="direction">نوع تراکنش</label>
              <select id="direction"><option value="out">خرج</option><option value="in">درآمد</option></select>
              <label for="merchant">بابت چه چیزی؟</label>
              <input id="merchant" />
              <button class="primary" type="submit">ثبت</button>
            </form>
          </div>
          <div class="section">
            <h2>تراکنش‌ها</h2>
            ${l.length?`<span class="muted">${X(l.length)} مورد</span>`:""}
          </div>
          ${l.length?`
            <div class="band" id="rows">
              ${l.map(c=>`
                <div class="row">
                  <div class="grow">
                    <div>${j(c.entry.merchant||"بدون نام")}</div>
                    <div class="muted">${j(c.ownerName)} • ${j(c.categoryName)}</div>
                  </div>
                  <div class="figure amount ${c.entry.direction==="in"?"in":""}">
                    ${c.entry.direction==="in"?"+":"−"}${z(c.entry.amountRial)}
                  </div>
                </div>`).join("")}
            </div>`:`
            <div class="panel" id="rows">
              <p>هنوز تراکنشی ثبت نشده</p>
              <p class="muted">اولین چیزی که ثبت کنی، همین‌جا می‌مونه.</p>
            </div>`}
        </div>
      </div>
    `));const I=y.querySelector("#amount"),m=y.querySelector("#direction"),S=y.querySelector("#merchant");y.querySelector("#read").addEventListener("click",()=>{const c=y.querySelector("#paste").value,s=Tt(c);s.amountRial!=null&&(I.value=String(Math.round(s.amountRial/10))),s.direction&&(m.value=s.direction),I.focus()}),y.querySelector("#manual").addEventListener("submit",async c=>{c.preventDefault();const s=Number(I.value.replace(/[^0-9]/g,""));!Number.isFinite(s)||s<=0||(await ot(e,{at:Date.now(),amountRial:s*10,direction:m.value,bank:"MANUAL",categoryId:"",categoryName:"",categoryKind:"expense",categoryUpdatedAt:0,merchant:S.value.trim(),note:""}),await B(e,"ثبت شد."),Y(e))}),y.querySelector("#sync").addEventListener("click",()=>{Y(e,!0)})}async function Y(e,t=!1){try{const{sent:n,received:i}=await dt(e);(t||i>0)&&await B(e,t?`${X(n)} مورد فرستادیم، ${X(i)} مورد گرفتیم.`:void 0)}catch{t&&await B(e,"اتصال نشد. تغییرات ذخیره شدن و بعداً فرستاده می‌شن.",!0)}}async function un(){if(y&&("serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js").catch(()=>{}),!nn(y)))try{const e=Ye(location.hash);if(e){const n=location.hash;history.replaceState(null,"",location.pathname),cn(e,n);return}const t=await an();if(!t){Te();return}await Ce(t),await B(t),Y(t)}catch(e){Te(e instanceof Error?e.message:String(e))}}un();
