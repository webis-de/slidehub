!function(t){function e(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,e),o.l=!0,o.exports}var n={};e.m=t,e.c=n,e.d=function(t,n,r){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:r})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=0)}([function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=n(1),o=(n.n(r),n(2)),i=(n.n(o),n(3)),s=(n.n(i),n(4)),c=(n.n(s),n(5)),a=(n.n(c),n(6)),u=(n.n(a),n(7)),l=(n.n(u),n(8)),d=(n.n(l),n(9));n.n(d)()()},function(t,e){},function(t,e){},function(t,e){},function(t,e){},function(t,e){},function(t,e){},function(t,e){},function(t,e){!function(t,e){"use strict";function n(t){this.time=t.time,this.target=t.target,this.rootBounds=t.rootBounds,this.boundingClientRect=t.boundingClientRect,this.intersectionRect=t.intersectionRect||{top:0,bottom:0,left:0,right:0,width:0,height:0},this.isIntersecting=!!t.intersectionRect;var e=this.boundingClientRect,n=e.width*e.height,r=this.intersectionRect,o=r.width*r.height;this.intersectionRatio=n?o/n:this.isIntersecting?1:0}function r(t,e){var n=e||{};if("function"!=typeof t)throw new Error("callback must be a function");if(n.root&&1!=n.root.nodeType)throw new Error("root must be an Element");this._checkForIntersections=i(this._checkForIntersections.bind(this),this.THROTTLE_TIMEOUT),this._callback=t,this._observationTargets=[],this._queuedEntries=[],this._rootMarginValues=this._parseRootMargin(n.rootMargin),this.thresholds=this._initThresholds(n.threshold),this.root=n.root||null,this.rootMargin=this._rootMarginValues.map(function(t){return t.value+t.unit}).join(" ")}function o(){return t.performance&&performance.now&&performance.now()}function i(t,e){var n=null;return function(){n||(n=setTimeout(function(){t(),n=null},e))}}function s(t,e,n,r){"function"==typeof t.addEventListener?t.addEventListener(e,n,r||!1):"function"==typeof t.attachEvent&&t.attachEvent("on"+e,n)}function c(t,e,n,r){"function"==typeof t.removeEventListener?t.removeEventListener(e,n,r||!1):"function"==typeof t.detatchEvent&&t.detatchEvent("on"+e,n)}function a(t,e){var n=Math.max(t.top,e.top),r=Math.min(t.bottom,e.bottom),o=Math.max(t.left,e.left),i=Math.min(t.right,e.right),s=i-o,c=r-n;return s>=0&&c>=0&&{top:n,bottom:r,left:o,right:i,width:s,height:c}}function u(t){var e;try{e=t.getBoundingClientRect()}catch(t){}return e?(e.width&&e.height||(e={top:e.top,right:e.right,bottom:e.bottom,left:e.left,width:e.right-e.left,height:e.bottom-e.top}),e):{top:0,bottom:0,left:0,right:0,width:0,height:0}}function l(t,e){for(var n=e;n;){if(n==t)return!0;n=d(n)}return!1}function d(t){var e=t.parentNode;return e&&11==e.nodeType&&e.host?e.host:e}if("IntersectionObserver"in t&&"IntersectionObserverEntry"in t&&"intersectionRatio"in t.IntersectionObserverEntry.prototype)"isIntersecting"in t.IntersectionObserverEntry.prototype||Object.defineProperty(t.IntersectionObserverEntry.prototype,"isIntersecting",{get:function(){return this.intersectionRatio>0}});else{var h=[];r.prototype.THROTTLE_TIMEOUT=100,r.prototype.POLL_INTERVAL=null,r.prototype.observe=function(t){if(!this._observationTargets.some(function(e){return e.element==t})){if(!t||1!=t.nodeType)throw new Error("target must be an Element");this._registerInstance(),this._observationTargets.push({element:t,entry:null}),this._monitorIntersections()}},r.prototype.unobserve=function(t){this._observationTargets=this._observationTargets.filter(function(e){return e.element!=t}),this._observationTargets.length||(this._unmonitorIntersections(),this._unregisterInstance())},r.prototype.disconnect=function(){this._observationTargets=[],this._unmonitorIntersections(),this._unregisterInstance()},r.prototype.takeRecords=function(){var t=this._queuedEntries.slice();return this._queuedEntries=[],t},r.prototype._initThresholds=function(t){var e=t||[0];return Array.isArray(e)||(e=[e]),e.sort().filter(function(t,e,n){if("number"!=typeof t||isNaN(t)||t<0||t>1)throw new Error("threshold must be a number between 0 and 1 inclusively");return t!==n[e-1]})},r.prototype._parseRootMargin=function(t){var e=(t||"0px").split(/\s+/).map(function(t){var e=/^(-?\d*\.?\d+)(px|%)$/.exec(t);if(!e)throw new Error("rootMargin must be specified in pixels or percent");return{value:parseFloat(e[1]),unit:e[2]}});return e[1]=e[1]||e[0],e[2]=e[2]||e[0],e[3]=e[3]||e[1],e},r.prototype._monitorIntersections=function(){this._monitoringIntersections||(this._monitoringIntersections=!0,this._checkForIntersections(),this.POLL_INTERVAL?this._monitoringInterval=setInterval(this._checkForIntersections,this.POLL_INTERVAL):(s(t,"resize",this._checkForIntersections,!0),s(e,"scroll",this._checkForIntersections,!0),"MutationObserver"in t&&(this._domObserver=new MutationObserver(this._checkForIntersections),this._domObserver.observe(e,{attributes:!0,childList:!0,characterData:!0,subtree:!0}))))},r.prototype._unmonitorIntersections=function(){this._monitoringIntersections&&(this._monitoringIntersections=!1,clearInterval(this._monitoringInterval),this._monitoringInterval=null,c(t,"resize",this._checkForIntersections,!0),c(e,"scroll",this._checkForIntersections,!0),this._domObserver&&(this._domObserver.disconnect(),this._domObserver=null))},r.prototype._checkForIntersections=function(){var t=this._rootIsInDom(),e=t?this._getRootRect():{top:0,bottom:0,left:0,right:0,width:0,height:0};this._observationTargets.forEach(function(r){var i=r.element,s=u(i),c=this._rootContainsTarget(i),a=r.entry,l=t&&c&&this._computeTargetAndRootIntersection(i,e),d=r.entry=new n({time:o(),target:i,boundingClientRect:s,rootBounds:e,intersectionRect:l});a?t&&c?this._hasCrossedThreshold(a,d)&&this._queuedEntries.push(d):a&&a.isIntersecting&&this._queuedEntries.push(d):this._queuedEntries.push(d)},this),this._queuedEntries.length&&this._callback(this.takeRecords(),this)},r.prototype._computeTargetAndRootIntersection=function(n,r){if("none"!=t.getComputedStyle(n).display){for(var o=u(n),i=d(n),s=!1;!s;){var c=null,l=1==i.nodeType?t.getComputedStyle(i):{};if("none"==l.display)return;if(i==this.root||i==e?(s=!0,c=r):i!=e.body&&i!=e.documentElement&&"visible"!=l.overflow&&(c=u(i)),c&&!(o=a(c,o)))break;i=d(i)}return o}},r.prototype._getRootRect=function(){var t;if(this.root)t=u(this.root);else{var n=e.documentElement,r=e.body;t={top:0,left:0,right:n.clientWidth||r.clientWidth,width:n.clientWidth||r.clientWidth,bottom:n.clientHeight||r.clientHeight,height:n.clientHeight||r.clientHeight}}return this._expandRectByRootMargin(t)},r.prototype._expandRectByRootMargin=function(t){var e=this._rootMarginValues.map(function(e,n){return"px"==e.unit?e.value:e.value*(n%2?t.width:t.height)/100}),n={top:t.top-e[0],right:t.right+e[1],bottom:t.bottom+e[2],left:t.left-e[3]};return n.width=n.right-n.left,n.height=n.bottom-n.top,n},r.prototype._hasCrossedThreshold=function(t,e){var n=t&&t.isIntersecting?t.intersectionRatio||0:-1,r=e.isIntersecting?e.intersectionRatio||0:-1;if(n!==r)for(var o=0;o<this.thresholds.length;o++){var i=this.thresholds[o];if(i==n||i==r||i<n!=i<r)return!0}},r.prototype._rootIsInDom=function(){return!this.root||l(e,this.root)},r.prototype._rootContainsTarget=function(t){return l(this.root||e,t)},r.prototype._registerInstance=function(){h.indexOf(this)<0&&h.push(this)},r.prototype._unregisterInstance=function(){var t=h.indexOf(this);-1!=t&&h.splice(t,1)},t.IntersectionObserver=r,t.IntersectionObserverEntry=n}}(window,document)},function(t,e,n){"use strict";function r(t,e){for(const n of t)!1!==n.isIntersecting&&(e.unobserve(n.target),o().then(()=>{const t=document.querySelector(et.class.main);e.observe(t.lastElementChild)}).catch(t=>{console.info(t),"disconnect"in IntersectionObserver.prototype?e.disconnect():console.error("IntersectionObserver.disconnect not available.")}))}function o(){const t=document.querySelector(et.class.main);return 0===documentsData.length?Promise.reject("No documents left to load."):i(10).then(e=>{console.info("Loaded document batch."),e.forEach(e=>s(t,e))})}function i(t){const e=[];for(let n=0;n<t&&documentsData.length>0;n++){const t=documentsData.shift();e.push(c(t[0],t[1]))}return Promise.all(e)}function s(t,e){t.insertAdjacentHTML("beforeend",e);const n=t.lastElementChild;rt.viewObserver.observe(n),a(n.querySelector(et.class.doc)),u(n)}function c(t,e){return new Promise((n,r)=>{let o="";for(var i=0;i<e;i++){const e=`${et.assetPath}/${t}-${i}.png`;o+=`\n        <div class="${et.class.item.slice(1)}" data-page="${i+1}">\n          <img data-src="${e}" alt="page ${i+1}">\n        </div>\n      `}const s=`${et.assetPath}/${t}`;n(`\n      <div\n        class="${et.class.view.slice(1)}"\n        id="${t}"\n        data-doc-source="${s}"\n        data-page-count="${e+1}">\n        <div class="${et.class.doc.slice(1)}">\n          <div class="${et.class.item.slice(1)} doc-info active" data-page="0">\n            <h2 class="doc-title">\n              <a href="${s}">${t}</a>\n            </h2>\n            by <span class="doc-author">author</span>,\n            <span class="doc-pages-count">${e}</span> pages,\n            2018\n          </div>\n          ${o}\n        </div>\n      </div>\n    `)})}function a(t){const e=Q(t,"margin-left")+Q(t,"border-left-width")+Z(t)+Q(t,"border-right-width")+Q(t,"margin-right");t.style.setProperty("width",e+"px")}function u(t){let e,n,r,o;t.addEventListener("touchstart",function(n){et.moveViewItemsWithTransform&&t.style.setProperty("will-change","transform"),rt.touched=!0,o=t.querySelector(et.class.doc),r=getComputedStyle(o).getPropertyValue("transition"),o.style.setProperty("transition","none"),e=n.targetTouches[0].clientX},!!at&&{passive:!0}),t.addEventListener("touchmove",function(r){if(rt.touched){const o=r.targetTouches[0],i=o.clientX-e,s=o.clientY-n;if(Math.abs(i/s)<1)return;f(r);const c=A(t)-i;T(t,c,!0),e=o.clientX,n=o.clientY}},!!at&&{passive:!0}),t.addEventListener("touchend",function(e){if(rt.touched){const e=L(t);k(t,Math.round(e)),et.moveViewItemsWithTransform&&t.style.setProperty("will-change","auto"),rt.touched=!1,o.style.setProperty("transition",r)}},!!at&&{passive:!0})}function l(){const t=tt(document.querySelector(et.class.item));t!==et.itemWidth&&(console.info("Pre-configured page width does not match actual page width.","Updating configuration."),et.itemWidth=t)}function d(){const t=tt(document.querySelector(et.class.item)),e=Q(document.querySelector(et.class.view),"width");return Math.floor(e/t)}function h(t){if(t.keyCode in it){t.preventDefault();const e=it[t.keyCode];st[e].trigger(t)}}function f(t){const e=t.target.closest(et.class.view),n=t.target.closest(et.class.item);null!==e&&null!==n&&(q(e),P(e,n))}function m(t){13===t.keyCode&&(N(t.target)||null!==rt.activeView&&v(rt.activeView,t.ctrlKey))}function v(t,e){const n=t.getAttribute("data-doc-source"),r=C(t).getAttribute("data-page"),o=n+("0"!==r?`#page=${r}`:"");e?window.open(o):window.location.href=o}function g(){const t=et.modifierKey.replace("Key","");Array.from(document.querySelectorAll('[aria-label="Modifier"]')).forEach(e=>{e.innerText=t,e.setAttribute("aria-label",t)}),document.addEventListener("keydown",b,lt),document.addEventListener("keyup",y,lt),window.addEventListener("blur",w,lt)}function p(){document.removeEventListener("keydown",b,lt),document.removeEventListener("keyup",y,lt),window.removeEventListener("blur",w,lt)}function b(t){ot[t.keyCode]===et.modifierKey&&rt.activeView.querySelector(et.class.doc).style.setProperty("cursor","ew-resize")}function y(t){ot[t.keyCode]===et.modifierKey&&rt.activeView.querySelector(et.class.doc).style.setProperty("cursor","auto")}function w(){rt.activeView.querySelector(et.class.doc).style.setProperty("cursor","auto")}function E(t){const e=Math.abs(t.deltaX/t.deltaY)<1,n=e?t.deltaY:t.deltaX;if(e&&!1===t[et.modifierKey])return;e||console.log("handle horizontal wheel scrolling properly");const r=t.target.closest(et.class.view);null!==r&&(t.preventDefault(),r.querySelector(et.class.doc).childElementCount<=rt.visibleItems||_(Math.sign(n)))}function _(t){const e=rt.activeView;null!==e&&k(e,L(e)+t)}function I(t){const e=rt.activeView,n=C(e),r=parseInt(n.getAttribute("data-page")),o=J(r+t,0,M(e)-1),i=x(e,o);P(e,i);const s=i.getBoundingClientRect(),c=e.getBoundingClientRect(),a=Q(i,"margin-left"),u=Q(i,"margin-right"),l=o-r;!1!==(s.left>=c.left&&s.right+a+u<=c.left+c.width)||_(l)}function L(t){return A(t)/et.itemWidth}function A(t){return et.moveViewItemsWithTransform?-1*O(t.querySelector(et.class.doc)):t.scrollLeft}function k(t,e){if(null===t)return;t.querySelector(et.class.doc);T(t,(e=J(e,0,M(t)-rt.visibleItems))*et.itemWidth)}function T(t,e,n=!1){const r=t.querySelector(et.class.doc);et.moveViewItemsWithTransform?r.style.setProperty("transform",`translateX(${-e}px)`):t.scrollLeft=e}function O(t){const e=getComputedStyle(t).getPropertyValue("transform");return"none"===e?0:parseFloat(e.split(",")[4])}function R(){const t=rt.activeView.previousElementSibling;null!==t&&q(t)}function S(){const t=rt.activeView.nextElementSibling;null!==t&&q(t)}function q(t){const e=document.querySelectorAll(`${et.class.view}.active`);Array.from(e).forEach(t=>t.classList.remove("active")),rt.activeView=t,rt.activeView.classList.add("active"),document.activeElement.blur()}function M(t){return parseInt(t.getAttribute("data-page-count"))}function C(t){return t.querySelector(`${et.class.item}.active`)}function P(t,e){C(t).classList.remove("active"),e.classList.add("active"),document.activeElement.blur()}function x(t,e){return t.querySelector(et.class.doc).children[e]}function V(){Array.from(document.querySelectorAll("button[data-target-modal]")).forEach(t=>{t.removeAttribute("disabled"),t.addEventListener("click",$)}),Array.from(document.querySelectorAll(".modal__close")).forEach(t=>{t.addEventListener("click",K)})}function $(t){const e=t.currentTarget.getAttribute("data-target-modal"),n=document.querySelector(`.${e}`);null!==n&&(rt.lastFocusedElement=document.activeElement,document.body.setAttribute("aria-hidden","true"),n.setAttribute("aria-hidden","false"),n.classList.remove("closed"),j(n)[0].focus(),n.addEventListener("keydown",D,lt),n.addEventListener("keydown",W,ut),n.addEventListener("click",F,lt))}function K(t){const e=t.target.closest(".modal");null!==e&&(document.body.setAttribute("aria-hidden","false"),e.setAttribute("aria-hidden","true"),e.classList.add("closed"),e.removeEventListener("keydown",D,lt),e.removeEventListener("keydown",W,ut),e.removeEventListener("click",F,lt),rt.lastFocusedElement.focus())}function F(t){t.target===t.currentTarget&&K(t)}function D(t){27===t.keyCode&&K(t)}function W(t){if(9!==t.keyCode)return;const e=document.activeElement,n=j(t.currentTarget).filter(t=>t.tabIndex>-1);n.length<2?t.preventDefault():t.shiftKey?e===n[0]&&(n[n.length-1].focus(),t.preventDefault()):e===n[n.length-1]&&(n[0].focus(),t.preventDefault())}function j(t=document){return Array.from(t.querySelectorAll(ct))}function N(t){const e=t.tagName.toLowerCase();let n=!1;switch(!0){case["a","area"].includes(e):if(!1===t.hasAttribute("href"))return!1;n=!0;break;case["input","select","textarea","button"].includes(e):if(t.disabled)return!1;n=!0;break;case["iframe","object","embed"].includes(e):n=!0;break;default:"true"===t.getAttribute("contenteditable")&&(n=!0)}return!(!n||null===t.offsetParent)}function H(){const t=document.querySelectorAll("[aria-pressed], [aria-checked]");Array.from(t).forEach(t=>{const e=t.getAttribute("data-feature"),n=t.hasAttribute("aria-pressed")?"aria-pressed":"aria-checked";nt[e].enabled?t.setAttribute(n,"true"):t.setAttribute(n,"false"),t.addEventListener("click",t=>B(t.currentTarget))})}function B(t){const e=t.hasAttribute("aria-pressed")?"aria-pressed":"aria-checked",n="true"===t.getAttribute(e);t.setAttribute(e,String(!n)),z(t,e)}function z(t,e){switch(!0){case t.hasAttribute("data-feature"):const n=t.getAttribute("data-feature"),r=nt[n];"true"===t.getAttribute(e)?(r.enable(),console.info(`Enabled ${n}.`)):(r.disable(),console.info(`Disabled ${n}.`));break;default:console.warn("No action is associated with the control",t)}}function X(){const t={rootMargin:`500px 0px`};rt.viewObserver=new IntersectionObserver(U,t)}function U(t,e){for(const n of t)if(n.isIntersecting){const t=n.target,r=Array.from(t.querySelectorAll("img[data-src]"));r.forEach(t=>{t.hasAttribute("data-src")&&(t.setAttribute("src",t.getAttribute("data-src")),t.removeAttribute("data-src"))}),r[0].addEventListener("load",()=>Y(n.target)),e.unobserve(n.target)}}function Y(t){et.preserveAspectRatio&&G(t)}function G(t){const e=t.querySelector(`${et.class.item} > img`),n=e.naturalWidth/e.naturalHeight;t.style.setProperty("--page-aspect-ratio",n)}function J(t,e,n){return Math.max(e,Math.min(t,n))}function Q(t,e){const n=getComputedStyle(t).getPropertyValue(e);return""===n?0:parseFloat(n)}function Z(t){let e=0;return Array.from(t.children).forEach(t=>{e+=tt(t)}),e}function tt(t){const e=Q(t,"width");return Q(t,"margin-left")+e+Q(t,"margin-right")}const et={assetPath:"https://www.uni-weimar.de/medien/webis/tmp/slides/data",itemWidth:300,moveViewItemsWithTransform:!0,preserveAspectRatio:!0,class:{main:".main-content",view:".doc-view",doc:".doc",item:".doc__page"},modifierKey:"shiftKey"},nt={core:{enabled:!0,enable:function(){V(),H()},disable:function(){console.info("Not very effective. (Can’t disable core feature.)")}},wheelNavigation:{enabled:!0,enable:function(){g(),document.addEventListener("wheel",E,ut)},disable:function(){p(),document.removeEventListener("wheel",E,ut)}},keyboardNavigation:{enabled:!0,enable:function(){document.addEventListener("keydown",h,ut)},disable:function(){document.removeEventListener("keydown",h,ut)}},itemLinking:{enabled:!0,enable:function(){document.addEventListener("keydown",m,lt)},disable:function(){document.removeEventListener("keydown",m,lt)}},activatingOnHover:{enabled:!1,enable:function(){document.addEventListener("mousemove",f,lt)},disable:function(){document.removeEventListener("mousemove",f,lt)}}},rt={activeView:null,viewObserver:null,visibleItems:null,lastFocusedElement:null,touched:!1},ot=Object.freeze({16:"shiftKey",17:"ctrlKey",18:"altKey"}),it=Object.freeze({35:"endKey",36:"homeKey",37:"arrowLeft",38:"arrowUp",39:"arrowRight",40:"arrowDown"}),st=Object.freeze({homeKey:{direction:-1,trigger:function(){I(this.direction*M(rt.activeView))}},endKey:{direction:1,trigger:function(){I(this.direction*M(rt.activeView))}},arrowLeft:{direction:-1,trigger:function(t){I(this.direction*(t.ctrlKey?3:1))}},arrowRight:{direction:1,trigger:function(t){I(this.direction*(t.ctrlKey?3:1))}},arrowUp:{trigger:function(){R()}},arrowDown:{trigger:function(){S()}},tabKey:{trigger:function(t){t.shiftKey?R():S()}}});t.exports=function(){X(),document.addEventListener("DOMContentLoaded",function(){const t=new IntersectionObserver(r,{threshold:1});o().then(()=>{q(document.querySelector(et.class.view)),l(),rt.visibleItems=d();const e=document.querySelector(et.class.main);t.observe(e.lastElementChild)}),Object.values(nt).forEach(t=>{t.enabled&&t.enable()})})};const ct="a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable=true]";let at=!1;try{const t=Object.defineProperty({},"passive",{get:function(){at=!0}});window.addEventListener("test",null,t)}catch(t){}const ut=!!at&&{passive:!1},lt=!!at&&{passive:!0}}]);
//# sourceMappingURL=app.bundle.js.map