/*!
 *  @preserve
 *  
 *  @module      iframe-resizer/child 5.4.1 (iife) 
 *
 *  @license     GPL-3.0 for non-commercial use only.
 *               For commercial use, you must purchase a license from
 *               https://iframe-resizer.com/pricing
 * 
 *  @description Keep same and cross domain iFrames sized to their content 
 *
 *  @author      David J. Bradshaw <info@iframe-resizer.com>
 * 
 *  @see         {@link https://iframe-resizer.com}
 * 
 *  @copyright  (c) 2013 - 2025, David J. Bradshaw. All rights reserved.
 */


!function(){"use strict";const e="font-weight: normal;",t="font-weight: bold;",n="font-style: italic;",o=e+n,i="default",r={collapsed:!1,defaultEvent:void 0,event:void 0,label:"AutoConsoleGroup",showTime:!0},a={profile:0,profileEnd:0,timeStamp:0,trace:0};const{fromEntries:l,keys:s}=Object,c=e=>[e,console[e]],u=e=>t=>[t,function(n){e[t]=n}],d=(e,t)=>l(s(e).map(t));const m=()=>!(typeof window>"u")&&(null==window?void 0:window.matchMedia("(prefers-color-scheme: dark)").matches),f=m()?"color: #A9C7FB;":"color: #135CD2;",p=m()?"color: #E3E3E3;":"color: #1F1F1F;",h="5.4.1",y=10,g="data-iframe-size",b="data-iframe-overflowed",v="data-iframe-ignore",w="bottom",z="right",$="resizeParent",S="setOffsetSize",E="resizeObserver",j="overflowObserver",k="mutationObserver",O=(e,t,n,o)=>e.addEventListener(t,n,o||!1),M=(e,t,n)=>e.removeEventListener(t,n,!1),P=["<iy><yi>Puchspk Spjluzl Rlf</><iy><iy>","<iy><yi>Tpzzpun Spjluzl Rlf</><iy><iy>","Aopz spiyhyf pz hchpshisl dpao ivao Jvttlyjphs huk Vwlu-Zvbyjl spjluzlz.<iy><iy><i>Jvttlyjphs Spjluzl</><iy>Mvy jvttlyjphs bzl, <p>pmyhtl-ylzpgly</> ylxbpylz h svd jvza vul aptl spjluzl mll. Mvy tvyl pumvythapvu cpzpa <b>oaawz://pmyhtl-ylzpgly.jvt/wypjpun</>.<iy><iy><i>Vwlu Zvbyjl Spjluzl</><iy>Pm fvb hyl bzpun aopz spiyhyf pu h uvu-jvttlyjphs vwlu zvbyjl wyvqlja aolu fvb jhu bzl pa mvy myll bukly aol alytz vm aol NWS C3 Spjluzl. Av jvumpyt fvb hjjlwa aolzl alytz, wslhzl zla aol <i>spjluzl</> rlf pu <p>pmyhtl-ylzpgly</> vwapvuz av <i>NWSc3</>.<iy><iy>Mvy tvyl pumvythapvu wslhzl zll: <b>oaawz://pmyhtl-ylzpgly.jvt/nws</>","<i>NWSc3 Spjluzl Clyzpvu</><iy><iy>Aopz clyzpvu vm <p>pmyhtl-ylzpgly</> pz ilpun bzlk bukly aol alytz vm aol <i>NWS C3</> spjluzl. Aopz spjluzl hssvdz fvb av bzl <p>pmyhtl-ylzpgly</> pu Vwlu Zvbyjl wyvqljaz, iba pa ylxbpylz fvby wyvqlja av il wbispj, wyvcpkl haaypibapvu huk il spjluzlk bukly clyzpvu 3 vy shaly vm aol NUB Nlulyhs Wbispj Spjluzl.<iy><iy>Pm fvb hyl bzpun aopz spiyhyf pu h uvu-vwlu zvbyjl wyvqlja vy dlizpal, fvb dpss ullk av wbyjohzl h svd jvza vul aptl jvttlyjphs spjluzl.<iy><iy>Mvy tvyl pumvythapvu cpzpa <b>oaawz://pmyhtl-ylzpgly.jvt/wypjpun</>.","<iy><yi>Zvsv spjluzl kvlz uva zbwwvya jyvzz-kvthpu</><iy><iy>Av bzl <p>pmyhtl-ylzpgly</> dpao jyvzz kvthpu pmyhtlz fvb ullk lpaoly aol Wyvmlzzpvuhs vy Ibzpulzz spjluzlz. Mvy klahpsz vu bwnyhkl wypjpun wslhzl jvuahja pumv@pmyhtl-ylzpgly.jvt."];Object.fromEntries(["2cgs7fdf4xb","1c9ctcccr4z","1q2pc4eebgb","ueokt0969w","w2zxchhgqz","1umuxblj2e5"].map(((e,t)=>[e,Math.max(0,t-1)])));const C=e=>(e=>e.replaceAll(/[A-Za-z]/g,(e=>String.fromCodePoint((e<="Z"?90:122)>=(e=e.codePointAt(0)+19)?e:e-26))))(P[e]),A=e=>{let t=!1;return function(){return t?void 0:(t=!0,Reflect.apply(e,this,arguments))}},T=e=>e,N=e=>Math.round(1e3*e)/1e3,I=e=>""!=`${e}`&&void 0!==e;let x=!0;var R;const q=(R=function(n={}){const l={},s={},m=[],f={...r,...n};let p;function h(){m.length=0}function y(){delete f.event,h()}const g=()=>!m.some((([e])=>"error"===e||"warn"===e))&&!!f.collapsed;function b(){if(0!==m.length){console[g()?"groupCollapsed":"group"](`%c${f.label}%c ${(e=>{const t=e.event||e.defaultEvent;return t?`${t}`:""})(f)} %c${f.showTime?p:""}`,e,t,o);for(const[e,...t]of m)console[e](...t);console.groupEnd(),y()}else y()}function v(){p=function(){const e=new Date,t=(t,n)=>e[t]().toString().padStart(n,"0");return`@ ${t("getHours",2)}:${t("getMinutes",2)}:${t("getSeconds",2)}.${t("getMilliseconds",3)}`}(),queueMicrotask((()=>queueMicrotask(b)))}function w(e,...t){0===m.length&&v(),m.push([e,...t])}function z(e=i,...t){w("log",`${e}: ${performance.now()-l[e]} ms`,...t)}return{...d(f,u(f)),...d(console,(e=>[e,(...t)=>w(e,...t)])),...d(a,c),count:function(e=i){s[e]?s[e]+=1:s[e]=1,w("log",`${e}: ${s[e]}`)},countReset:function(e=i){delete s[e]},endAutoGroup:b,errorBoundary:e=>(...t)=>{let n;try{n=e(...t)}catch(e){w("error",e)}return n},purge:h,time:function(e=i){l[e]=performance.now()},timeEnd:function(e=i){z(e),delete l[e]},timeLog:z}},R?.__esModule?R.default:R)({label:"iframeResizer(child)"});const L=(B="info",(...e)=>!x||q[B](...e));var B;const{assert:F,debug:D,endAutoGroup:W,error:V,errorBoundary:H,event:U,purge:Z,warn:J}=q,_=e=>{return q.warn((t=T,e=>window.chrome?t(e.replaceAll("<br>","\n").replaceAll("<rb>","[31;1m").replaceAll("</>","[m").replaceAll("<b>","[1m").replaceAll("<i>","[3m").replaceAll("<u>","[4m")):t(e.replaceAll("<br>","\n").replaceAll(/<[/a-z]+>/gi,"")))(e));var t},Q=_,G=(e=>(t,n="renamed to")=>(o,i,r="",a="")=>e(a,`<rb>Deprecated ${t}(${o.replace("()","")})</>\n\nThe <b>${o}</> ${t.toLowerCase()} has been ${n} <b>${i}</>. ${r}Use of the old ${t.toLowerCase()} will be removed in a future version of <i>iframe-resizer</>.`))(((e,t)=>_(t))),X=G("Method"),Y=G("Method","replaced with"),K=G("Option"),ee="--ifr-start",te="--ifr-end",ne=[],oe=new WeakSet,ie=e=>"object"==typeof e&&oe.add(e);let re={},ae=0;const le=setInterval((()=>{if(ne.length<10)return;if(re.hasTags&&re.len<25)return;ne.sort();const e=Math.min(ne.reduce(((e,t)=>e+t),0)/ne.length,ne[Math.floor(ne.length/2)]),t=N(e);t>ae&&(ae=t,U("performanceObserver")),e<=4||(clearInterval(le),_(`<rb>Performance Warning</>\n\nCalculating the page size is taking an excessive amount of time (${N(e)}ms).\n\nTo improve performance add the <b>data-iframe-size</> attribute to the ${re.Side.toLowerCase()} most element on the page. For more details see: <u>https://iframe-resizer.com/perf</>.`))}),5e3);function se(e){e.getEntries().forEach((e=>{if(e.name===te){const{duration:t}=performance.measure("--ifr-measure",ee,te);re=e.detail,ne.push(t),ne.length>100&&ne.shift()}}))}function ce(){new PerformanceObserver(se).observe({entryTypes:["mark"]}),ie(document.documentElement),ie(document.body)}"undefined"!=typeof document&&"undefined"!=typeof PerformanceObserver&&("loading"===document.readyState?document.addEventListener("DOMContentLoaded",ce):ce()),"undefined"!=typeof window&&function(){const o={contentVisibilityAuto:!0,opacityProperty:!0,visibilityProperty:!0},i={height:()=>(J("Custom height calculation function not defined"),ct.auto()),width:()=>(J("Custom width calculation function not defined"),ut.auto())},r={bodyOffset:1,bodyScroll:1,offset:1,documentElementOffset:1,documentElementScroll:1,boundingClientRect:1,max:1,min:1,grow:1,lowestElement:1},a={},l="checkVisibility"in window,s="auto",c="[iFrameSizer]",u={max:1,min:1,bodyScroll:1,documentElementScroll:1},d="scroll";let m,P,R,B,F,D=!0,V="",G=0,ne="",oe="",ie=!0,re=!1,ae=!0,le=!1,se=!1,ce=!1,ue=1,de=s,me="",fe=!0,pe="",he={},ye=!1,ge=0,be=!1,ve="",we=T,ze=[],$e="child",Se=null,Ee=!1,je="",ke=[],Oe=window.parent,Me="*",Pe=0,Ce=!1,Ae="",Te=1,Ne=d,Ie=window,xe=()=>{J("onMessage function not defined")},Re=()=>{},qe=null,Le=null;function Be(){var e,t,n;!function(){const e=e=>"true"===e,t=pe.slice(13).split(":");ve=t[0],G=void 0===t[1]?G:Number(t[1]),re=void 0===t[2]?re:e(t[2]),ye=void 0===t[3]?ye:e(t[3]),D=void 0===t[6]?D:e(t[6]),ne=t[7],de=void 0===t[8]?de:t[8],V=t[9],oe=t[10],Pe=void 0===t[11]?Pe:Number(t[11]),he.enable=void 0!==t[12]&&e(t[12]),$e=void 0===t[13]?$e:t[13],Ne=void 0===t[14]?Ne:t[14],be=void 0===t[15]?be:e(t[15]),m=void 0===t[16]?m:Number(t[16]),P=void 0===t[17]?P:Number(t[17]),ie=void 0===t[18]?ie:e(t[18]),t[19],Ae=t[20]||Ae,ge=void 0===t[21]?ge:Number(t[21])}(),e={id:ve,enabled:ye},q.label(`${e.id}`),x=e.enabled,function(){function e(e){xe=e?.onMessage||xe,Re=e?.onReady||Re,"number"==typeof e?.offset&&(K("offset","offsetSize"),ie&&(m=e?.offset),re&&(P=e?.offset)),"number"==typeof e?.offsetSize&&(ie&&(m=e?.offsetSize),re&&(P=e?.offsetSize)),Object.prototype.hasOwnProperty.call(e,"sizeSelector")&&(je=e.sizeSelector),Object.prototype.hasOwnProperty.call(e,"ignoreSelector")&&(me=e.ignoreSelector),Me=e?.targetOrigin||Me,de=e?.heightCalculationMethod||de,Ne=e?.widthCalculationMethod||Ne}function t(e,t){return"function"==typeof e&&(i[t]=e,e="custom"),e}if(1===ge)return;const n=window.iframeResizer||window.iFrameResizer;"object"==typeof n&&(e(n),de=t(de,"height"),Ne=t(Ne,"width"),L(`Set TargetOrigin for parent: %c${Me}`,f))}(),_e(),function(){try{Ee=1===ge||"iframeParentListener"in window.parent}catch(e){}}(),ge<0?Q(`${C(ge+2)}${C(2)}`):Ae.codePointAt(0)>4||ge<2&&Q(C(3)),Ae&&""!==Ae&&"false"!==Ae?Ae!==h&&_(`<b>Version mismatch</>\n\nThe parent and child pages are running different versions of <i>iframe resizer</>.\n\nParent page: ${Ae} - Child page: ${h}.\n`):_("<rb>Legacy version detected on parent page</>\n\nDetected legacy version of parent page script. It is recommended to update the parent page to use <b>@iframe-resizer/parent</>.\n\nSee <u>https://iframe-resizer.com/setup/</> for more details.\n"),Xe(),Ye(),function(){let e=!1;const t=t=>document.querySelectorAll(`[${t}]`).forEach((n=>{e=!0,n.removeAttribute(t),n.toggleAttribute(g,!0)}));t("data-iframe-height"),t("data-iframe-width"),e&&_("<rb>Deprecated Attributes</>\n          \nThe <b>data-iframe-height</> and <b>data-iframe-width</> attributes have been deprecated and replaced with the single <b>data-iframe-size</> attribute. Use of the old attributes will be removed in a future version of <i>iframe-resizer</>.")}(),"BackCompat"===document.compatMode&&_("<rb>Quirks Mode Detected</>\n\nThis iframe is running in the browser's legacy <b>Quirks Mode</>, this may cause issues with the correct operation of <i>iframe-resizer</>. It is recommended that you switch to the modern <b>Standards Mode</>.\n\nFor more information see <u>https://iframe-resizer.com/quirks-mode</>.\n"),We(),1!==ge&&(Ie.parentIframe=Object.freeze({autoResize:e=>(!0===e&&!1===D?(D=!0,ht("autoResizeEnabled","Auto Resize enabled")):!1===e&&!0===D&&(D=!1),bt(0,0,"autoResize",JSON.stringify(D)),D),close(){bt(0,0,"close")},getId:()=>ve,getOrigin:()=>(X("getOrigin()","getParentOrigin()"),R),getParentOrigin:()=>R,getPageInfo(e){if("function"==typeof e)return qe=e,bt(0,0,"pageInfo"),void Y("getPageInfo()","getParentProps()","See <u>https://iframe-resizer.com/upgrade</> for details. ");qe=null,bt(0,0,"pageInfoStop")},getParentProps(e){if("function"!=typeof e)throw new TypeError("parentIframe.getParentProps(callback) callback not a function");return Le=e,bt(0,0,"parentInfo"),()=>{Le=null,bt(0,0,"parentInfoStop")}},getParentProperties(e){X("getParentProperties()","getParentProps()"),this.getParentProps(e)},moveToAnchor(e){he.findTarget(e)},reset(){gt()},setOffsetSize(e){m=e,P=e,ht(S,`parentIframe.setOffsetSize(${e})`)},scrollBy(e,t){bt(t,e,"scrollBy")},scrollTo(e,t){bt(t,e,"scrollTo")},scrollToOffset(e,t){bt(t,e,"scrollToOffset")},sendMessage(e,t){bt(0,0,"message",JSON.stringify(e),t)},setHeightCalculationMethod(e){de=e,Xe()},setWidthCalculationMethod(e){Ne=e,Ye()},setTargetOrigin(e){Me=e},resize(e,t){ht("parentIframe.resize()",`parentIframe.resize(${e||""}${t?`,${t}`:""})`,e,t)},size(e,t){X("size()","resize()"),this.resize(e,t)}}),Ie.parentIFrame=Ie.parentIframe),function(){function e(e){bt(0,0,e.type,`${e.screenY}:${e.screenX}`)}function t(t,n){O(window.document,t,e)}!0===be&&(t("mouseenter"),t("mouseleave"))}(),he=function(){const e=()=>({x:document.documentElement.scrollLeft,y:document.documentElement.scrollTop});function t(t){const n=t.getBoundingClientRect(),o=e();return{x:parseInt(n.left,y)+parseInt(o.x,y),y:parseInt(n.top,y)+parseInt(o.y,y)}}function n(e){function n(e){const n=t(e);bt(n.y,n.x,"scrollToOffset")}const o=e.split("#")[1]||e,i=decodeURIComponent(o),r=document.getElementById(i)||document.getElementsByName(i)[0];void 0===r?bt(0,0,"inPageLink",`#${o}`):n(r)}function o(){const{hash:e,href:t}=window.location;""!==e&&"#"!==e&&n(t)}function i(){for(const e of document.querySelectorAll('a[href^="#"]'))"#"!==e.getAttribute("href")&&O(e,"click",(t=>{t.preventDefault(),n(e.getAttribute("href"))}))}function r(){O(window,"hashchange",o)}function a(){setTimeout(o,128)}function l(){i(),r(),a()}return he.enable&&(1===ge?_("In page linking requires a Professional or Business license. Please see <u>https://iframe-resizer.com/pricing</> for more details."):l()),{findTarget:n}}(),void 0===ne&&(ne=`${G}px`),Ze("margin",(t="margin",(n=ne).includes("-")&&(J(`Negative CSS value ignored for ${t}`),n=""),n)),Ze("background",V),Ze("padding",oe),function(){const e=document.createElement("div");e.style.clear="both",e.style.display="block",e.style.height="0",document.body.append(e)}(),function(){const e=e=>e.style.setProperty("height","auto","important");e(document.documentElement),e(document.body)}(),function(e){Qe({method:e,eventType:"After Print",eventName:"afterprint"}),Qe({method:e,eventType:"Before Print",eventName:"beforeprint"}),Qe({method:e,eventType:"Ready State Change",eventName:"readystatechange"})}("add"),function(){const e=new Set,t=[];let n=!1,o=0;const i=t=>{for(const n of t){const{addedNodes:t,removedNodes:o}=n;for(const n of t)e.add(n);for(const t of o)e.delete(t)}},r=16,a=2,l=200;let s=1;function c(e){_e(),Ve(e),e.forEach(tt),e.clear()}function u(){U("mutationObserver");const d=performance.now(),m=d-o;if(m>r*s+++a&&m<l)return setTimeout(u,r*s),void(o=d);s=1,t.forEach(i),t.length=0,e.size>0&&c(e),We(),Fe(),n=!1,ht(k,"Mutation Observed")}function d(e){t.push(e),n||(o=performance.now(),n=!0,requestAnimationFrame(u))}function m(){const e=new window.MutationObserver(d),t=document.querySelector("body"),n={attributes:!1,attributeOldValue:!1,characterData:!1,characterDataOldValue:!1,childList:!0,subtree:!0};return e.observe(t,n),e}m()}(),Se=new ResizeObserver(Ke),Se.observe(document.body),et.add(document.body),tt(document.body),ie!==re&&(we=(e=>{const t=e.side||w,n=e.onChange||T,o=(e,n)=>0===e||e>n[t],i={root:e.root,rootMargin:"0px",threshold:1},r=window.requestAnimationFrame,a=(e=!1)=>n(e),l=(e,t)=>e.toggleAttribute(b,t),s=new IntersectionObserver((function(e){for(const i of e){const{boundingClientRect:e,rootBounds:r,target:a}=i,s=e[t],c=!((n=a).hidden||null===n.offsetParent||"none"===n.style.display)&&o(s,r);l(a,c)}var n;r(a)}),i),c=new WeakSet;return function(){const e=new window.MutationObserver((()=>{L("Detected changes in element attributes"),a(!0)})),t=document.querySelector("body"),n={attributes:!0,attributeFilter:[v],subtree:!0};e.observe(t,n)}(),function(e){for(const t of e)t.nodeType!==Node.ELEMENT_NODE||c.has(t)||(s.observe(t),c.add(t))}})({onChange:De,root:document.documentElement,side:ie?w:z})),Ve(it(document)()),queueMicrotask(Re),ht("init","Init message from host page",void 0,void 0,h),document.title&&""!==document.title&&bt(0,0,"title",document.title)}function Fe(){ze=document.querySelectorAll(`[${b}]:not([${v}]):not([${v}] *)`),se=ze.length>0}function De(e){Fe(),(se||e)&&ht(j,"Overflow updated")}function We(){ke=document.querySelectorAll(`[${g}]`),ce=ke.length>0}function Ve(e){ce||we(e)}let He=0;function Ue(){const n=document.querySelectorAll(`*[${v}]`);le=n.length>0,le&&n.length!==He&&(function(n){const o=1===n.length?"":"s";J(`%c[${v}]%c found on %c${n.length}%c element${o}`,t,e,t,e)}(n),He=n.length)}function Ze(e,t){void 0!==t&&""!==t&&"null"!==t&&(document.body.style.setProperty(e,t),L(`Set body ${e}: %c${t}`,f))}function Je(e,t,n){if(""!==n)for(const e of document.querySelectorAll(n))e.toggleAttribute(t,!0)}function _e(){Je(0,g,je),Je(0,v,me)}function Qe(e){({add(t){function n(){ht(e.eventName,e.eventType)}a[t]=n,O(window,t,n,{passive:!0})},remove(e){const t=a[e];delete a[e],M(window,e,t)}})[e.method](e.eventName)}function Ge(e,t,n,o){return t!==e&&(e in n||(J(`${e} is not a valid option for ${o}CalculationMethod.`),e=t),e in r&&_(`<rb>Deprecated ${o}CalculationMethod (${e})</>\n\nThis version of <i>iframe-resizer</> can auto detect the most suitable ${o} calculation method. It is recommended that you remove this option.`)),e}function Xe(){de=Ge(de,s,ct,"height")}function Ye(){Ne=Ge(Ne,d,ut,"width")}function Ke(e){if(!Array.isArray(e)||0===e.length)return;const t=e[0].target;ht(E,`Element resized <${function(e){switch(!0){case!I(e):return"";case I(e.id):return`${e.nodeName}#${e.id}`;case I(e.name):return`${e.nodeName} (${e.name}`;case I(e.className):return`${e.nodeName}.${e.className}`;default:return e.nodeName}}(t)}>`)}const et=new WeakSet;function tt(e){if(e.nodeType!==Node.ELEMENT_NODE)return;if(!et.has(e)){const t=getComputedStyle(e)?.position;""!==t&&"static"!==t&&(Se.observe(e),et.add(e))}const t=it(e)();for(const e of t){if(et.has(e)||e?.nodeType!==Node.ELEMENT_NODE)continue;const t=getComputedStyle(e)?.position;""!==t&&"static"!==t&&(Se.observe(e),et.add(e))}}function nt(e){performance.mark(ee);const t=(n=e).charAt(0).toUpperCase()+n.slice(1);var n;let i=0,r=document.documentElement,a=ce?0:document.documentElement.getBoundingClientRect().bottom;const s=ce?ke:se?ze:it(document)();let c=s.length;for(const t of s)ce||!l||t.checkVisibility(o)?(i=t.getBoundingClientRect()[e]+parseFloat(getComputedStyle(t).getPropertyValue(`margin-${e}`)),i>a&&(a=i,r=t)):c-=1;return L(`${t} position calculated from:`,r),performance.mark(te,{detail:{Side:t,len:c,hasTags:ce,logging:ye}}),a}const ot=e=>[e.bodyOffset(),e.bodyScroll(),e.documentElementOffset(),e.documentElementScroll(),e.boundingClientRect()],it=e=>()=>{Ue();const t=["* ","not(head)","not(meta)","not(base)","not(title)","not(script)","not(link)","not(style)","not(map)","not(area)","not(option)","not(optgroup)","not(template)","not(track)","not(wbr)","not(nobr)"];return le&&t.push(`not([${v}])`,`not([${v}] *)`),e.querySelectorAll(t.join(":"))},rt={height:0,width:0},at={height:0,width:0},lt=[f,p,f];function st(e){function t(){return at[o]=i,rt[o]=l,i}const n=e===ct,o=n?"height":"width",i=e.boundingClientRect(),r=Math.ceil(i),a=Math.floor(i),l=(e=>e.documentElementScroll()+Math.max(0,e.getOffset()))(e),s=`HTML: %c${i}px %cPage: %c${l}px`;let c=0;switch(!0){case!e.enabled():return l;case ce:L("Found element with data-iframe-size attribute"),c=e.taggedElement();break;case!se&&0===at[o]&&0===rt[o]:L(`Initial page size values: ${s}`,...lt),c=t();break;case Ce&&i===at[o]&&l===rt[o]:L(`Size unchanged: ${s}`,...lt),c=Math.max(i,l);break;case 0===i:L(`Page is hidden: ${s}`,...lt),c=l;break;case!se&&i!==at[o]&&l<=rt[o]:L(`New <html> size: ${s} `,...lt),L(`Previous <html> size: %c${at[o]}px`,f),c=t();break;case!n:c=e.taggedElement();break;case!se&&i<at[o]:L(`<html> size decreased: ${s}`,...lt),c=t();break;case l===a||l===r:L(`<html> size equals page size: ${s}`,...lt),c=t();break;case i>l:L(`Page size < <html> size: ${s}`,...lt),c=t();break;case se:L("Found element overflowing <html> "),c=e.taggedElement();break;default:L(`Using <html> size: ${s}`,...lt),c=t()}return L(`Content ${o}: %c${c}px`,f),c+=function(e){const t=e.getOffset();return 0!==t&&L(`Page offsetSize: %c${t}px`,f),t}(e),c}const ct={enabled:()=>ie,getOffset:()=>m,auto:()=>st(ct),bodyOffset:()=>{const{body:e}=document,t=getComputedStyle(e);return e.offsetHeight+parseInt(t.marginTop,y)+parseInt(t.marginBottom,y)},bodyScroll:()=>document.body.scrollHeight,offset:()=>ct.bodyOffset(),custom:()=>i.height(),documentElementOffset:()=>document.documentElement.offsetHeight,documentElementScroll:()=>document.documentElement.scrollHeight,boundingClientRect:()=>Math.max(document.documentElement.getBoundingClientRect().bottom,document.body.getBoundingClientRect().bottom),max:()=>Math.max(...ot(ct)),min:()=>Math.min(...ot(ct)),grow:()=>ct.max(),lowestElement:()=>nt(w),taggedElement:()=>nt(w)},ut={enabled:()=>re,getOffset:()=>P,auto:()=>st(ut),bodyScroll:()=>document.body.scrollWidth,bodyOffset:()=>document.body.offsetWidth,custom:()=>i.width(),documentElementScroll:()=>document.documentElement.scrollWidth,documentElementOffset:()=>document.documentElement.offsetWidth,boundingClientRect:()=>Math.max(document.documentElement.getBoundingClientRect().right,document.body.getBoundingClientRect().right),max:()=>Math.max(...ot(ut)),min:()=>Math.min(...ot(ut)),rightMostElement:()=>nt(z),scroll:()=>Math.max(ut.bodyScroll(),ut.documentElementScroll()),taggedElement:()=>nt(z)},dt=(e,t)=>!(Math.abs(e-t)<=Pe);function mt(e,t,n,o,i){const r=void 0===n?ct[de]():n,a=void 0===o?ut[Ne]():o;switch(!0){case ie&&dt(ue,r)||re&&dt(Te,a)||"init"===e:ue=r,Te=a;case e===S:bt(ue,Te,e,i);break;case!e!==$&&(ie&&de in u||re&&Ne in u):gt();break;case e===E:case e===j:case e===k:Z();break;default:Z(),L("No change in content size detected")}B=!1}let ft=!1;const pt=A((()=>Q(C(4)))),ht=H(((e,t,n,o,i)=>{F=performance.now(),U(e),D||e===$?document.hidden||(ft||(B=!0,mt(e,0,n,o,i),requestAnimationFrame((()=>{ft=!1}))),ft=!0):L("Resizing disabled")}));function yt(e){ue=ct[de](),Te=ut[Ne](),bt(ue,Te,e)}function gt(e){const t=de;de=s,Ce||(Ce=!0,requestAnimationFrame((()=>{Ce=!1}))),yt("reset"),de=t}const bt=H((function(e,t,o,i,r){ge<-1||(U(o),void 0!==r||(r=Me),function(){const a=`${ve}:${e}:${t}:${o}${void 0===i?"":`:${i}`}`;if(Ee)try{window.parent.iframeParentListener(c+a)}catch(e){if(1!==ge)throw e;return void pt()}else Oe.postMessage(c+a,r);B&&L(function(){const e=N(performance.now()-F);return"init"===o?`Initialised iFrame in %c${e}ms`:`Size calculated in %c${e}ms`}(),f),L("Sending message to host page via "+(Ee?"sameDomain":"postMessage")),L(`%c${a}`,n)}(),W())})),vt=H((function(e){const{freeze:t}=Object,{parse:n}=JSON,o=e=>bt(0,0,`${e}Stop`),i={init:function(){pe=e.data,Oe=e.source,R=e.origin,Be(),ae=!1,setTimeout((()=>{fe=!1}),128)},reset(){fe||yt("resetPage")},resize(){ht($,"Parent window requested size check")},moveToAnchor(){he.findTarget(a())},inPageLink(){this.moveToAnchor()},pageInfo(){const e=a();qe?setTimeout((()=>qe(n(e)))):o("pageInfo")},parentInfo(){const e=a();Le?setTimeout((()=>Le(t(n(e))))):o("parentInfo")},message(){const e=a();setTimeout((()=>xe(n(e))))}},r=()=>e.data.split("]")[1].split(":")[0],a=()=>e.data.slice(e.data.indexOf(":")+1),l=()=>e.data.split(":")[2]in{true:1,false:1};function s(){const t=r();t in i?i[t]():"iframeResize"in window||void 0!==window.jQuery&&""in window.jQuery.prototype||l()||J(`Unexpected message (${e.data})`)}c===`${e.data}`.slice(0,13)&&(U(r()),!1!==ae?l()&&i.init():s())}));function wt(){"loading"!==document.readyState&&window.parent.postMessage("[iFrameResizerChild]Ready","*")}function zt(e){return vt(e),Ie}"iframeChildListener"in window?J("Already setup"):(window.iframeChildListener=e=>setTimeout((()=>vt({data:e,sameDomain:!0}))),O(window,"message",vt),O(window,"readystatechange",wt),wt());try{top?.document?.getElementById("banner")&&(Ie={},window.mockMsgListener=zt,M(window,"message",vt),define([],(()=>zt)))}catch(e){}}()}();
