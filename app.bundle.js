!function(t){function e(o){if(n[o])return n[o].exports;var r=n[o]={i:o,l:!1,exports:{}};return t[o].call(r.exports,r,r.exports,e),r.l=!0,r.exports}var n={};e.m=t,e.c=n,e.d=function(t,n,o){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:o})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=4)}([function(t,e,n){"use strict";var o=n(17);n.d(e,"f",function(){return o.a});var r=n(18);n.d(e,"a",function(){return r.a});var i=n(19);n.d(e,"c",function(){return i.a});var s=n(20);n.d(e,"d",function(){return s.a});var c=n(21);n.d(e,"e",function(){return c.a});var a=n(22);n.d(e,"b",function(){return a.a});n(23)},function(t,e,n){"use strict";const o={assetPath:"https://www.uni-weimar.de/medien/webis/tmp/slides/data",itemWidth:300,preserveAspectRatio:!0,class:{main:".doc-container",view:".doc-view",scrollbox:".doc-scrollbox",doc:".doc",item:".doc__page"}};e.a=o},function(t,e,n){"use strict";function o(t){const e=A;s(e)||c(e,t),r(e,t),a(e)||u(e)||l(e,t)}function r(t,e){const n=`${e>0?"next":"previous"}ElementSibling`;let o=Math.abs(e);for(;o--;)i(t,n)}function i(t,e){const n=_(t)[e];null!==n&&O(t,n)}function s(t){return d(t)%j.a.itemWidth%1==0}function c(t,e){const n=d(t),o=m(t)-Object(k.d)(t);h(t,Object(k.a)(Math.round(n),0,o))}function a(t){if(t.querySelector(j.a.class.doc).childElementCount<=Object(k.d)(t))return!0}function u(t){const e=t.getBoundingClientRect(),n=_(t).getBoundingClientRect();return e.left<=n.left&&n.right<=e.right&&e.top<=n.top&&n.bottom<=e.bottom}function l(t,e){const n=_(t),o=d(t),r=b(n);let i;i=e>0?o-r:o+Object(k.d)(t)-r,h(t,o+e)}function d(t){return f(t)/j.a.itemWidth}function f(t){return t.querySelector(j.a.class.scrollbox).scrollLeft}function h(t,e){t.querySelector(j.a.class.doc);const n=g(t)-Object(k.d)(t);v(t,(e=Object(k.a)(e,0,n))*j.a.itemWidth)}function v(t,e,n=!1){t.querySelector(j.a.class.scrollbox).scrollLeft=e}function b(t){return parseInt(t.dataset.page)}function m(t){return t.querySelector(j.a.class.doc).childElementCount-1}function g(t){return t.querySelector(j.a.class.doc).childElementCount}function p(){return A}function y(t){A&&A.classList.remove("active"),(A=t).classList.add("active"),document.activeElement.blur()}function w(t){const e=E(t);for(const t of Object.values(e))if(t<0)return t;return 0}function E(t){const e=t.getBoundingClientRect();return{left:e.left,right:document.documentElement.clientWidth-e.right,top:e.top,bottom:document.documentElement.clientHeight-e.bottom}}function _(t){return t.querySelector(`${j.a.class.item}.active`)}function O(t,e){_(t).classList.remove("active"),e.classList.add("active"),document.activeElement.blur()}function I(){const t=A.previousElementSibling;null!==t&&y(t);const e=w(A);e<0&&(console.log(e),document.documentElement.scrollTop-=-e)}function L(){const t=A.nextElementSibling;null!==t&&y(t);const e=w(A);e<0&&(console.log(e),document.documentElement.scrollTop+=-e)}n.d(e,"e",function(){return o}),n.d(e,"a",function(){return _}),n.d(e,"f",function(){return O}),n.d(e,"b",function(){return p}),n.d(e,"g",function(){return y}),n.d(e,"d",function(){return I}),n.d(e,"c",function(){return L});var j=n(1),k=n(0);let A},function(t,e,n){"use strict";function o(){u=new IntersectionObserver(r,l)}function r(t,e){for(const n of t)if(n.isIntersecting){const t=n.target,o=Array.from(t.querySelectorAll("img[data-src]"));o.forEach(t=>{t.hasAttribute("data-src")&&(t.setAttribute("src",t.getAttribute("data-src")),t.removeAttribute("data-src"))}),o[0].addEventListener("load",()=>i(n.target)),e.unobserve(n.target)}}function i(t){a.a.preserveAspectRatio&&s(t)}function s(t){const e=t.querySelector(`${a.a.class.item} > img`),n=e.naturalWidth/e.naturalHeight;t.style.setProperty("--page-aspect-ratio",n)}function c(t){u.observe(t)}n.d(e,"a",function(){return d}),n.d(e,"b",function(){return c});var a=n(1);let u;const l={rootMargin:`500px 0px`},d={enable(){o()}}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(5),r=(n.n(o),n(6)),i=(n.n(r),n(7)),s=(n.n(i),n(8)),c=(n.n(s),n(9)),a=(n.n(c),n(10)),u=(n.n(a),n(11)),l=(n.n(u),n(12)),d=(n.n(l),n(13)),f=(n.n(d),n(14));Object(f.a)()},function(t,e){},function(t,e){},function(t,e){},function(t,e){},function(t,e){},function(t,e){},function(t,e){},function(t,e){},function(t,e){!function(t,e){"use strict";function n(t){this.time=t.time,this.target=t.target,this.rootBounds=t.rootBounds,this.boundingClientRect=t.boundingClientRect,this.intersectionRect=t.intersectionRect||{top:0,bottom:0,left:0,right:0,width:0,height:0},this.isIntersecting=!!t.intersectionRect;var e=this.boundingClientRect,n=e.width*e.height,o=this.intersectionRect,r=o.width*o.height;this.intersectionRatio=n?r/n:this.isIntersecting?1:0}function o(t,e){var n=e||{};if("function"!=typeof t)throw new Error("callback must be a function");if(n.root&&1!=n.root.nodeType)throw new Error("root must be an Element");this._checkForIntersections=i(this._checkForIntersections.bind(this),this.THROTTLE_TIMEOUT),this._callback=t,this._observationTargets=[],this._queuedEntries=[],this._rootMarginValues=this._parseRootMargin(n.rootMargin),this.thresholds=this._initThresholds(n.threshold),this.root=n.root||null,this.rootMargin=this._rootMarginValues.map(function(t){return t.value+t.unit}).join(" ")}function r(){return t.performance&&performance.now&&performance.now()}function i(t,e){var n=null;return function(){n||(n=setTimeout(function(){t(),n=null},e))}}function s(t,e,n,o){"function"==typeof t.addEventListener?t.addEventListener(e,n,o||!1):"function"==typeof t.attachEvent&&t.attachEvent("on"+e,n)}function c(t,e,n,o){"function"==typeof t.removeEventListener?t.removeEventListener(e,n,o||!1):"function"==typeof t.detatchEvent&&t.detatchEvent("on"+e,n)}function a(t,e){var n=Math.max(t.top,e.top),o=Math.min(t.bottom,e.bottom),r=Math.max(t.left,e.left),i=Math.min(t.right,e.right),s=i-r,c=o-n;return s>=0&&c>=0&&{top:n,bottom:o,left:r,right:i,width:s,height:c}}function u(t){var e;try{e=t.getBoundingClientRect()}catch(t){}return e?(e.width&&e.height||(e={top:e.top,right:e.right,bottom:e.bottom,left:e.left,width:e.right-e.left,height:e.bottom-e.top}),e):{top:0,bottom:0,left:0,right:0,width:0,height:0}}function l(t,e){for(var n=e;n;){if(n==t)return!0;n=d(n)}return!1}function d(t){var e=t.parentNode;return e&&11==e.nodeType&&e.host?e.host:e}if("IntersectionObserver"in t&&"IntersectionObserverEntry"in t&&"intersectionRatio"in t.IntersectionObserverEntry.prototype)"isIntersecting"in t.IntersectionObserverEntry.prototype||Object.defineProperty(t.IntersectionObserverEntry.prototype,"isIntersecting",{get:function(){return this.intersectionRatio>0}});else{var f=[];o.prototype.THROTTLE_TIMEOUT=100,o.prototype.POLL_INTERVAL=null,o.prototype.observe=function(t){if(!this._observationTargets.some(function(e){return e.element==t})){if(!t||1!=t.nodeType)throw new Error("target must be an Element");this._registerInstance(),this._observationTargets.push({element:t,entry:null}),this._monitorIntersections()}},o.prototype.unobserve=function(t){this._observationTargets=this._observationTargets.filter(function(e){return e.element!=t}),this._observationTargets.length||(this._unmonitorIntersections(),this._unregisterInstance())},o.prototype.disconnect=function(){this._observationTargets=[],this._unmonitorIntersections(),this._unregisterInstance()},o.prototype.takeRecords=function(){var t=this._queuedEntries.slice();return this._queuedEntries=[],t},o.prototype._initThresholds=function(t){var e=t||[0];return Array.isArray(e)||(e=[e]),e.sort().filter(function(t,e,n){if("number"!=typeof t||isNaN(t)||t<0||t>1)throw new Error("threshold must be a number between 0 and 1 inclusively");return t!==n[e-1]})},o.prototype._parseRootMargin=function(t){var e=(t||"0px").split(/\s+/).map(function(t){var e=/^(-?\d*\.?\d+)(px|%)$/.exec(t);if(!e)throw new Error("rootMargin must be specified in pixels or percent");return{value:parseFloat(e[1]),unit:e[2]}});return e[1]=e[1]||e[0],e[2]=e[2]||e[0],e[3]=e[3]||e[1],e},o.prototype._monitorIntersections=function(){this._monitoringIntersections||(this._monitoringIntersections=!0,this._checkForIntersections(),this.POLL_INTERVAL?this._monitoringInterval=setInterval(this._checkForIntersections,this.POLL_INTERVAL):(s(t,"resize",this._checkForIntersections,!0),s(e,"scroll",this._checkForIntersections,!0),"MutationObserver"in t&&(this._domObserver=new MutationObserver(this._checkForIntersections),this._domObserver.observe(e,{attributes:!0,childList:!0,characterData:!0,subtree:!0}))))},o.prototype._unmonitorIntersections=function(){this._monitoringIntersections&&(this._monitoringIntersections=!1,clearInterval(this._monitoringInterval),this._monitoringInterval=null,c(t,"resize",this._checkForIntersections,!0),c(e,"scroll",this._checkForIntersections,!0),this._domObserver&&(this._domObserver.disconnect(),this._domObserver=null))},o.prototype._checkForIntersections=function(){var t=this._rootIsInDom(),e=t?this._getRootRect():{top:0,bottom:0,left:0,right:0,width:0,height:0};this._observationTargets.forEach(function(o){var i=o.element,s=u(i),c=this._rootContainsTarget(i),a=o.entry,l=t&&c&&this._computeTargetAndRootIntersection(i,e),d=o.entry=new n({time:r(),target:i,boundingClientRect:s,rootBounds:e,intersectionRect:l});a?t&&c?this._hasCrossedThreshold(a,d)&&this._queuedEntries.push(d):a&&a.isIntersecting&&this._queuedEntries.push(d):this._queuedEntries.push(d)},this),this._queuedEntries.length&&this._callback(this.takeRecords(),this)},o.prototype._computeTargetAndRootIntersection=function(n,o){if("none"!=t.getComputedStyle(n).display){for(var r=u(n),i=d(n),s=!1;!s;){var c=null,l=1==i.nodeType?t.getComputedStyle(i):{};if("none"==l.display)return;if(i==this.root||i==e?(s=!0,c=o):i!=e.body&&i!=e.documentElement&&"visible"!=l.overflow&&(c=u(i)),c&&!(r=a(c,r)))break;i=d(i)}return r}},o.prototype._getRootRect=function(){var t;if(this.root)t=u(this.root);else{var n=e.documentElement,o=e.body;t={top:0,left:0,right:n.clientWidth||o.clientWidth,width:n.clientWidth||o.clientWidth,bottom:n.clientHeight||o.clientHeight,height:n.clientHeight||o.clientHeight}}return this._expandRectByRootMargin(t)},o.prototype._expandRectByRootMargin=function(t){var e=this._rootMarginValues.map(function(e,n){return"px"==e.unit?e.value:e.value*(n%2?t.width:t.height)/100}),n={top:t.top-e[0],right:t.right+e[1],bottom:t.bottom+e[2],left:t.left-e[3]};return n.width=n.right-n.left,n.height=n.bottom-n.top,n},o.prototype._hasCrossedThreshold=function(t,e){var n=t&&t.isIntersecting?t.intersectionRatio||0:-1,o=e.isIntersecting?e.intersectionRatio||0:-1;if(n!==o)for(var r=0;r<this.thresholds.length;r++){var i=this.thresholds[r];if(i==n||i==o||i<n!=i<o)return!0}},o.prototype._rootIsInDom=function(){return!this.root||l(e,this.root)},o.prototype._rootContainsTarget=function(t){return l(this.root||e,t)},o.prototype._registerInstance=function(){f.indexOf(this)<0&&f.push(this)},o.prototype._unregisterInstance=function(){var t=f.indexOf(this);-1!=t&&f.splice(t,1)},t.IntersectionObserver=o,t.IntersectionObserverEntry=n}}(window,document)},function(t,e,n){"use strict";function o(){r(),i()}function r(){c.b.enable(),c.a.enable(),c.c.enable()}function i(){document.addEventListener("DOMContentLoaded",function(){for(const t of Object.values(s))Object(c.d)(t)})}n.d(e,"a",function(){return o});var s=n(15),c=n(27)},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(16);n.d(e,"KeyboardNavigationModule",function(){return o.a});var r=n(24);n.d(e,"WheelNavigationModule",function(){return r.a});var i=n(25);n.d(e,"ItemLinkingModule",function(){return i.a});var s=n(26);n.d(e,"ActivateOnHoverModule",function(){return s.a})},function(t,e,n){"use strict";function o(t){if(t.keyCode in c){t.preventDefault();const e=c[t.keyCode];a[e].trigger(t)}}var r=n(0),i=n(2);const s={enabled:!0,name:"keyboard-navigation",description:"Navigate pages with keyboard",enable(){document.addEventListener("keydown",o,r.f.active)},disable(){document.removeEventListener("keydown",o,r.f.active)}};e.a=s;const c=Object.freeze({35:"endKey",36:"homeKey",37:"arrowLeft",38:"arrowUp",39:"arrowRight",40:"arrowDown"}),a=Object.freeze({homeKey:{direction:-1,trigger:function(){}},endKey:{direction:1,trigger:function(){}},arrowLeft:{direction:-1,trigger:function(t){Object(i.e)(this.direction*(t.shiftKey?3:1))}},arrowRight:{direction:1,trigger:function(t){Object(i.e)(this.direction*(t.shiftKey?3:1))}},arrowUp:{trigger:function(){Object(i.d)()}},arrowDown:{trigger:function(){Object(i.c)()}},tabKey:{trigger:function(t){t.shiftKey?Object(i.d)():Object(i.c)()}}})},function(t,e,n){"use strict";let o=!1;try{const t=Object.defineProperty({},"passive",{get:function(){o=!0}});window.addEventListener("test",null,t)}catch(t){}const r={active:!!o&&{passive:!1},passive:!!o&&{passive:!0}};e.a=r},function(t,e,n){"use strict";e.a=function(t,e,n){return Math.max(e,Math.min(t,n))}},function(t,e,n){"use strict";e.a=function(t,e){const n=getComputedStyle(t).getPropertyValue(e);return""===n?0:parseFloat(n)}},function(t,e,n){"use strict";e.a=function(t){const e=t.querySelector(o.a.class.item),n=Object(r.e)(e),i=Object(r.c)(t,"width");return Math.floor(i/n)};var o=n(1),r=n(0)},function(t,e,n){"use strict";e.a=function(t){const e=Object(o.c)(t,"width");return Object(o.c)(t,"margin-left")+e+Object(o.c)(t,"margin-right")};var o=n(0)},function(t,e,n){"use strict";e.a=function(t){let e=0;return Array.from(t.children).forEach(t=>{e+=Object(o.e)(t)}),e};var o=n(0)},function(t,e,n){"use strict"},function(t,e,n){"use strict";function o(){document.addEventListener("keydown",i,u.f.passive),document.addEventListener("keyup",s,u.f.passive),window.addEventListener("blur",c,u.f.passive)}function r(){document.removeEventListener("keydown",i,u.f.passive),document.removeEventListener("keyup",s,u.f.passive),window.removeEventListener("blur",c,u.f.passive)}function i(t){"shiftKey"===h[t.keyCode]&&Object(d.b)().querySelector(l.a.class.doc).style.setProperty("cursor","ew-resize")}function s(t){"shiftKey"===h[t.keyCode]&&Object(d.b)().querySelector(l.a.class.doc).style.setProperty("cursor","auto")}function c(){Object(d.b)().querySelector(l.a.class.doc).style.setProperty("cursor","auto")}function a(t){const e=t.target.closest(l.a.class.view);if(null===e)return;Object(d.g)(e);const n=Math.abs(t.deltaX/t.deltaY)<1?v.vertical:v.horizontal;if(n===v.horizontal&&console.log("Horizontal scrolling ..."),n===v.vertical&&t.shiftKey){t.preventDefault();const e=t[n.delta];Object(d.e)(Math.sign(e))}}var u=n(0),l=n(1),d=n(2);const f={enabled:!0,name:"wheel-navigation",description:"Navigate pages with mouse wheel",enable(){o(),document.addEventListener("wheel",a,u.f.active)},disable(){r(),document.removeEventListener("wheel",a,u.f.active)}};e.a=f;const h={16:"shiftKey"},v={vertical:{delta:"deltaY"},horizontal:{delta:"deltaX"}}},function(t,e,n){"use strict";function o(t){13===t.keyCode&&(i(t.target)||r(t.ctrlKey))}function r(t){const e=Object(c.b)(),n=e.getAttribute("data-doc-source"),o=Object(c.a)(e).getAttribute("data-page"),r=n+("0"!==o?`#page=${o}`:"");t?window.open(r):window.location.href=r}function i(t){const e=t.tagName.toLowerCase();let n=!1;switch(!0){case["a","area"].includes(e):if(!1===t.hasAttribute("href"))return!1;n=!0;break;case["input","select","textarea","button"].includes(e):if(t.disabled)return!1;n=!0;break;case["iframe","object","embed"].includes(e):n=!0;break;default:"true"===t.getAttribute("contenteditable")&&(n=!0)}return!(!n||null===t.offsetParent)}n.d(e,"a",function(){return a});var s=n(0),c=n(2);const a={enabled:!0,name:"item-linking",description:"Link pages to PDF source",enable(){document.addEventListener("keydown",o,s.f.passive)},disable(){document.removeEventListener("keydown",o,s.f.passive)}}},function(t,e,n){"use strict";function o(t){const e=t.target.closest(i.a.class.view),n=t.target.closest(i.a.class.item);null!==e&&null!==n&&(Object(s.g)(e),Object(s.f)(e,n))}var r=n(0),i=n(1),s=n(2);const c={enabled:!1,name:"activate-on-hover",description:"Activate pages on hover",enable(){document.addEventListener("mousemove",o,r.f.passive)},disable(){document.removeEventListener("mousemove",o,r.f.passive)}};e.a=c},function(t,e,n){"use strict";var o=n(3);n.d(e,"b",function(){return o.a});var r=n(28);n.d(e,"a",function(){return r.a});n(2);var i=n(29);n.d(e,"c",function(){return i.a});var s=n(30);n.d(e,"d",function(){return s.a})},function(t,e,n){"use strict";function o(t,e){for(const n of t)!1!==n.isIntersecting&&(e.unobserve(n.target),r().then(()=>{const t=document.querySelector(l.a.class.main);e.observe(t.lastElementChild)}).catch(t=>{console.info(t),"disconnect"in IntersectionObserver.prototype?e.disconnect():console.error("IntersectionObserver.disconnect not available.")}))}function r(){const t=document.querySelector(l.a.class.main);return 0===documentsData.length?Promise.reject("No documents left to load."):i(10).then(e=>{console.info("Loaded document batch."),e.forEach(e=>s(t,e))})}function i(t){const e=[];for(let n=0;n<t&&documentsData.length>0;n++){const t=documentsData.shift();e.push(c(t[0],t[1]))}return Promise.all(e)}function s(t,e){t.insertAdjacentHTML("beforeend",e);const n=t.lastElementChild;Object(h.b)(n),a(n.querySelector(l.a.class.doc))}function c(t,e){return new Promise((n,o)=>{let r="";for(var i=0;i<e;i++){const e=`${l.a.assetPath}/${t}-${i}.png`;r+=`\n        <div class="${l.a.class.item.slice(1)}" data-page="${i+1}">\n          <img data-src="${e}" alt="page ${i+1}">\n        </div>\n      `}const s=`${l.a.assetPath}/${t}`;n(`\n      <div\n        class="${l.a.class.view.slice(1)}"\n        id="${t}"\n        data-doc-source="${s}"\n        data-page-count="${e+1}">\n        <div class="doc-scrollbox">\n          <div class="${l.a.class.doc.slice(1)}">\n            <div class="${l.a.class.item.slice(1)} active" data-page="0">\n              <div class="doc-meta">\n                <h2 class="doc-meta__title">\n                  <a href="${s}">${t}</a>\n                </h2>\n                by author, ${e} pages, 2018\n              </div>\n            </div>\n            ${r}\n          </div>\n        </div>\n      </div>\n    `)})}function a(t){const e=Object(f.c)(t,"margin-left")+Object(f.c)(t,"border-left-width")+Object(f.b)(t)+Object(f.c)(t,"border-right-width")+Object(f.c)(t,"margin-right");t.style.setProperty("width",e+"px")}function u(){const t=document.querySelector(l.a.class.item),e=Object(f.e)(t);e!==l.a.itemWidth&&(console.info("Pre-configured page width does not match actual page width.","Updating configuration."),l.a.itemWidth=e)}var l=n(1),d=n(2),f=n(0),h=n(3);const v={enable(){document.addEventListener("DOMContentLoaded",function(){const t=new IntersectionObserver(o,{threshold:1});r().then(()=>{const e=document.querySelector(l.a.class.view);Object(d.g)(e),u();const n=document.querySelector(l.a.class.main);t.observe(n.lastElementChild)})})}};e.a=v},function(t,e,n){"use strict";function o(t){const e=t.currentTarget.getAttribute("data-target-modal"),n=document.querySelector(`.${e}`);null!==n&&(l=document.activeElement,document.body.setAttribute("aria-hidden","true"),n.setAttribute("aria-hidden","false"),n.classList.remove("closed"),a(n)[0].focus(),n.addEventListener("keydown",s,u.f.passive),n.addEventListener("keydown",c,u.f.active),n.addEventListener("click",i,u.f.passive))}function r(t){const e=t.target.closest(".modal");null!==e&&(document.body.setAttribute("aria-hidden","false"),e.setAttribute("aria-hidden","true"),e.classList.add("closed"),e.removeEventListener("keydown",s,u.f.passive),e.removeEventListener("keydown",c,u.f.active),e.removeEventListener("click",i,u.f.passive),l.focus())}function i(t){t.target===t.currentTarget&&r(t)}function s(t){27===t.keyCode&&r(t)}function c(t){if(9!==t.keyCode)return;const e=document.activeElement,n=a(t.currentTarget).filter(t=>t.tabIndex>-1);n.length<2?t.preventDefault():t.shiftKey?e===n[0]&&(n[n.length-1].focus(),t.preventDefault()):e===n[n.length-1]&&(n[0].focus(),t.preventDefault())}function a(t=document){return Array.from(t.querySelectorAll(f))}var u=n(0);let l;const d={enable(){document.addEventListener("DOMContentLoaded",function(){Array.from(document.querySelectorAll("button[data-target-modal]")).forEach(t=>{t.removeAttribute("disabled"),t.addEventListener("click",o)}),Array.from(document.querySelectorAll(".modal__close")).forEach(t=>{t.addEventListener("click",r)})})}};e.a=d;const f="a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable=true]"},function(t,e,n){"use strict";function o(t){const e=`\n    <div class="form-group form-group--switch">\n      <span class="form-label" id="feature-${t.name}">${t.description}</span>\n      <button role="switch" aria-checked="false" aria-labelledby="feature-${t.name}" data-feature="${t.name}">\n        <span class="state state--true" aria-label="on"></span>\n        <span class="state state--false" aria-label="off"></span>\n      </button>\n    </div>\n  `,n=document.querySelector(".features-fieldset");n.insertAdjacentHTML("beforeend",e);const o=n.querySelector(`[data-feature="${t.name}"]`),i=o.hasAttribute("aria-pressed")?"aria-pressed":"aria-checked";t.enabled?o.setAttribute(i,"true"):o.setAttribute(i,"false"),o.addEventListener("click",e=>r(e.currentTarget,t))}function r(t,e){const n=t.hasAttribute("aria-pressed")?"aria-pressed":"aria-checked",o="true"===t.getAttribute(n);t.setAttribute(n,String(!o)),i(t,n,e)}function i(t,e,n){switch(!0){case t.hasAttribute("data-feature"):"true"===t.getAttribute(e)?(n.enable(),console.info(`Enabled ${n.name}.`)):(n.disable(),console.info(`Disabled ${n.name}.`));break;default:console.warn("No action is associated with the control",t)}}e.a=function(t){t.enabled&&t.enable(),o(t)}}]);
//# sourceMappingURL=app.bundle.js.map