!function(t){function e(r){if(n[r])return n[r].exports;var i=n[r]={i:r,l:!1,exports:{}};return t[r].call(i.exports,i,i.exports,e),i.l=!0,i.exports}var n={};e.m=t,e.c=n,e.d=function(t,n,r){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:r})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=5)}([function(t,e,n){"use strict";var r=n(11);n.d(e,"d",function(){return r.a});var i=n(12);n.d(e,"b",function(){return i.a});var o=n(13);n.d(e,"c",function(){return o.a});n(14);var s=n(15);n.d(e,"a",function(){return s.a});var c=n(16);n.d(e,"e",function(){return c.a})},function(t,e,n){"use strict";n.d(e,"a",function(){return r});const r={assets:{documents:"https://www.uni-weimar.de/medien/webis/tmp/slides/data",images:"https://www.uni-weimar.de/medien/webis/tmp/slides/data"},metaSlide:!0,allowLastPageInFirstColumn:!0,preserveAspectRatio:!1,highlightColor:null,selector:{slidehub:".slidehub-container",doc:".doc",scrollbox:".doc-scrollbox",itemContainer:".page-container",item:".page"}}},function(t,e,n){"use strict";function r(t){(function(){if(i()%m==0)return!0;return!1})()||function(t){const e=i(),n=a()-1,r=Object(f.e)(Object(v.a)(),m),s=n-r;o(Object(f.b)(Math.round(e),0,s))}(),function(t){const e=Array.from(c()).indexOf(u()),n=Object(f.b)(e+t,0,a()-1);l(c().item(n))}(t),function(){const t=Object(v.a)(),e=Object(f.e)(t,m);return a()<=e}()||function(){const t=Object(v.a)().getBoundingClientRect(),e=u().getBoundingClientRect();return t.left<=e.left&&e.right<=t.right&&t.top<=e.top&&e.bottom<=t.bottom}()||o(i()+t)}function i(){return s().scrollLeft/m}function o(t){const e=Object(f.e)(Object(v.a)(),m),n=h.a.allowLastPageInFirstColumn?1:e,r=a()-n;t=Object(f.b)(t,0,r),s().scrollLeft=t*m}function s(){return Object(v.a)().querySelector(h.a.selector.scrollbox)}function c(){return u().parentElement.querySelectorAll("[data-page]")}function a(){return c().length}function u(){return Object(v.a)().querySelector(`${h.a.selector.item}.active`)}function l(t){const e=t.parentElement,n=u();n&&e.contains(n)&&n.classList.remove("active"),t.classList.add("active"),document.activeElement instanceof HTMLElement&&document.activeElement.blur()}function d(t){m=t,Object.freeze(m)}n.d(e,"c",function(){return r}),n.d(e,"a",function(){return u}),n.d(e,"d",function(){return l}),n.d(e,"b",function(){return a}),n.d(e,"e",function(){return d});var h=n(1),f=n(0),v=n(3);let m},function(t,e,n){"use strict";function r(t){const e=function(t){const e=Array.from(i()).indexOf(o()),n=i(),r=Object(c.b)(e+t,0,n.length-1);return n.item(r)}(t);if(null===e)return;s(e);const n=function(t){const e=document.documentElement;return{top:t.offsetTop-window.scrollY,bottom:window.scrollY+e.clientHeight-(t.offsetTop+t.offsetHeight)}}(e),r=e.clientHeight/2;n.top<0?window.scrollBy(0,-(Math.abs(n.top)+r)):n.bottom<0&&window.scrollBy(0,Math.abs(n.bottom)+r)}function i(){return o().parentElement.children}function o(){return u||(u=document.querySelector(a.a.selector.doc)),u}function s(t){u&&u.classList.remove("active"),(u=t).classList.add("active"),document.activeElement instanceof HTMLElement&&document.activeElement.blur()}n.d(e,"b",function(){return r}),n.d(e,"a",function(){return o}),n.d(e,"c",function(){return s});var c=n(0),a=n(1);let u},function(t,e,n){"use strict";function r(t,e){for(const n of t)if(n.isIntersecting){const t=n.target;t.setAttribute("src",t.getAttribute("data-src")),t.removeAttribute("data-src"),t.addEventListener("load",()=>(function(t){o.a.preserveAspectRatio&&function(t){const e=t.closest(o.a.selector.doc);if(e&&e instanceof HTMLElement&&!e.style.cssText.includes("--page-aspect-ratio")){const n=t.naturalWidth/t.naturalHeight;e.style.setProperty("--page-aspect-ratio",n.toString())}}(t)})(t)),e.unobserve(t)}}function i(t){if(s){Array.from(t.querySelectorAll("img[data-src]")).forEach(t=>s.observe(t))}}n.d(e,"a",function(){return a}),n.d(e,"b",function(){return i});var o=n(1);let s;const c={rootMargin:"500px 1000px"},a={enable(){s=new IntersectionObserver(r,c)}}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=n(6);n.n(r),n(7)},function(t,e){},function(t,e,n){"use strict";var r=n(8),i=(n.n(r),n(9)),o=n(20);o.b.enable(),o.a.enable(),o.c.enable(),document.addEventListener("DOMContentLoaded",function(){for(const t of Object.values(i))Object(o.d)(t)})},function(t,e){!function(t,e){"use strict";function n(t){this.time=t.time,this.target=t.target,this.rootBounds=t.rootBounds,this.boundingClientRect=t.boundingClientRect,this.intersectionRect=t.intersectionRect||{top:0,bottom:0,left:0,right:0,width:0,height:0},this.isIntersecting=!!t.intersectionRect;var e=this.boundingClientRect,n=e.width*e.height,r=this.intersectionRect,i=r.width*r.height;this.intersectionRatio=n?i/n:this.isIntersecting?1:0}function r(t,e){var n=e||{};if("function"!=typeof t)throw new Error("callback must be a function");if(n.root&&1!=n.root.nodeType)throw new Error("root must be an Element");this._checkForIntersections=function(t,e){var n=null;return function(){n||(n=setTimeout(function(){t(),n=null},e))}}(this._checkForIntersections.bind(this),this.THROTTLE_TIMEOUT),this._callback=t,this._observationTargets=[],this._queuedEntries=[],this._rootMarginValues=this._parseRootMargin(n.rootMargin),this.thresholds=this._initThresholds(n.threshold),this.root=n.root||null,this.rootMargin=this._rootMarginValues.map(function(t){return t.value+t.unit}).join(" ")}function i(t,e,n,r){"function"==typeof t.addEventListener?t.addEventListener(e,n,r||!1):"function"==typeof t.attachEvent&&t.attachEvent("on"+e,n)}function o(t,e,n,r){"function"==typeof t.removeEventListener?t.removeEventListener(e,n,r||!1):"function"==typeof t.detatchEvent&&t.detatchEvent("on"+e,n)}function s(t){var e;try{e=t.getBoundingClientRect()}catch(t){}return e?(e.width&&e.height||(e={top:e.top,right:e.right,bottom:e.bottom,left:e.left,width:e.right-e.left,height:e.bottom-e.top}),e):{top:0,bottom:0,left:0,right:0,width:0,height:0}}function c(t,e){for(var n=e;n;){if(n==t)return!0;n=a(n)}return!1}function a(t){var e=t.parentNode;return e&&11==e.nodeType&&e.host?e.host:e}if("IntersectionObserver"in t&&"IntersectionObserverEntry"in t&&"intersectionRatio"in t.IntersectionObserverEntry.prototype)"isIntersecting"in t.IntersectionObserverEntry.prototype||Object.defineProperty(t.IntersectionObserverEntry.prototype,"isIntersecting",{get:function(){return this.intersectionRatio>0}});else{var u=[];r.prototype.THROTTLE_TIMEOUT=100,r.prototype.POLL_INTERVAL=null,r.prototype.observe=function(t){if(!this._observationTargets.some(function(e){return e.element==t})){if(!t||1!=t.nodeType)throw new Error("target must be an Element");this._registerInstance(),this._observationTargets.push({element:t,entry:null}),this._monitorIntersections(),this._checkForIntersections()}},r.prototype.unobserve=function(t){this._observationTargets=this._observationTargets.filter(function(e){return e.element!=t}),this._observationTargets.length||(this._unmonitorIntersections(),this._unregisterInstance())},r.prototype.disconnect=function(){this._observationTargets=[],this._unmonitorIntersections(),this._unregisterInstance()},r.prototype.takeRecords=function(){var t=this._queuedEntries.slice();return this._queuedEntries=[],t},r.prototype._initThresholds=function(t){var e=t||[0];return Array.isArray(e)||(e=[e]),e.sort().filter(function(t,e,n){if("number"!=typeof t||isNaN(t)||t<0||t>1)throw new Error("threshold must be a number between 0 and 1 inclusively");return t!==n[e-1]})},r.prototype._parseRootMargin=function(t){var e=(t||"0px").split(/\s+/).map(function(t){var e=/^(-?\d*\.?\d+)(px|%)$/.exec(t);if(!e)throw new Error("rootMargin must be specified in pixels or percent");return{value:parseFloat(e[1]),unit:e[2]}});return e[1]=e[1]||e[0],e[2]=e[2]||e[0],e[3]=e[3]||e[1],e},r.prototype._monitorIntersections=function(){this._monitoringIntersections||(this._monitoringIntersections=!0,this.POLL_INTERVAL?this._monitoringInterval=setInterval(this._checkForIntersections,this.POLL_INTERVAL):(i(t,"resize",this._checkForIntersections,!0),i(e,"scroll",this._checkForIntersections,!0),"MutationObserver"in t&&(this._domObserver=new MutationObserver(this._checkForIntersections),this._domObserver.observe(e,{attributes:!0,childList:!0,characterData:!0,subtree:!0}))))},r.prototype._unmonitorIntersections=function(){this._monitoringIntersections&&(this._monitoringIntersections=!1,clearInterval(this._monitoringInterval),this._monitoringInterval=null,o(t,"resize",this._checkForIntersections,!0),o(e,"scroll",this._checkForIntersections,!0),this._domObserver&&(this._domObserver.disconnect(),this._domObserver=null))},r.prototype._checkForIntersections=function(){var e=this._rootIsInDom(),r=e?this._getRootRect():{top:0,bottom:0,left:0,right:0,width:0,height:0};this._observationTargets.forEach(function(i){var o=i.element,c=s(o),a=this._rootContainsTarget(o),u=i.entry,l=e&&a&&this._computeTargetAndRootIntersection(o,r),d=i.entry=new n({time:t.performance&&performance.now&&performance.now(),target:o,boundingClientRect:c,rootBounds:r,intersectionRect:l});u?e&&a?this._hasCrossedThreshold(u,d)&&this._queuedEntries.push(d):u&&u.isIntersecting&&this._queuedEntries.push(d):this._queuedEntries.push(d)},this),this._queuedEntries.length&&this._callback(this.takeRecords(),this)},r.prototype._computeTargetAndRootIntersection=function(n,r){if("none"!=t.getComputedStyle(n).display){for(var i=s(n),o=a(n),c=!1;!c;){var u=null,l=1==o.nodeType?t.getComputedStyle(o):{};if("none"==l.display)return;if(o==this.root||o==e?(c=!0,u=r):o!=e.body&&o!=e.documentElement&&"visible"!=l.overflow&&(u=s(o)),u&&!(i=function(t,e){var n=Math.max(t.top,e.top),r=Math.min(t.bottom,e.bottom),i=Math.max(t.left,e.left),o=Math.min(t.right,e.right),s=o-i,c=r-n;return s>=0&&c>=0&&{top:n,bottom:r,left:i,right:o,width:s,height:c}}(u,i)))break;o=a(o)}return i}},r.prototype._getRootRect=function(){var t;if(this.root)t=s(this.root);else{var n=e.documentElement,r=e.body;t={top:0,left:0,right:n.clientWidth||r.clientWidth,width:n.clientWidth||r.clientWidth,bottom:n.clientHeight||r.clientHeight,height:n.clientHeight||r.clientHeight}}return this._expandRectByRootMargin(t)},r.prototype._expandRectByRootMargin=function(t){var e=this._rootMarginValues.map(function(e,n){return"px"==e.unit?e.value:e.value*(n%2?t.width:t.height)/100}),n={top:t.top-e[0],right:t.right+e[1],bottom:t.bottom+e[2],left:t.left-e[3]};return n.width=n.right-n.left,n.height=n.bottom-n.top,n},r.prototype._hasCrossedThreshold=function(t,e){var n=t&&t.isIntersecting?t.intersectionRatio||0:-1,r=e.isIntersecting?e.intersectionRatio||0:-1;if(n!==r)for(var i=0;i<this.thresholds.length;i++){var o=this.thresholds[i];if(o==n||o==r||o<n!=o<r)return!0}},r.prototype._rootIsInDom=function(){return!this.root||c(e,this.root)},r.prototype._rootContainsTarget=function(t){return c(this.root||e,t)},r.prototype._registerInstance=function(){u.indexOf(this)<0&&u.push(this)},r.prototype._unregisterInstance=function(){var t=u.indexOf(this);-1!=t&&u.splice(t,1)},t.IntersectionObserver=r,t.IntersectionObserverEntry=n}}(window,document)},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=n(10);n.d(e,"KeyboardNavigationModule",function(){return r.a});var i=n(17);n.d(e,"WheelNavigation",function(){return i.a});var o=n(18);n.d(e,"ItemLinking",function(){return o.a});var s=n(19);n.d(e,"ActiveDocumentHighlighting",function(){return s.a})},function(t,e,n){"use strict";function r(t){if(t.keyCode in a){t.preventDefault();const e=a[t.keyCode];u[e].trigger(t)}}n.d(e,"a",function(){return c});var i=n(0),o=n(2),s=n(3);const c={enabled:!0,name:"keyboard-navigation",description:"Navigate documents and its pages with the keyboard",enable(){document.addEventListener("keydown",r,i.d.active)},disable(){document.removeEventListener("keydown",r,i.d.active)}},a=Object.freeze({33:"pageUp",34:"pageDown",35:"endKey",36:"homeKey",37:"arrowLeft",38:"arrowUp",39:"arrowRight",40:"arrowDown"}),u=Object.freeze({homeKey:{direction:-1,trigger:function(){Object(o.c)(this.direction*Object(o.b)())}},endKey:{direction:1,trigger:function(){Object(o.c)(this.direction*Object(o.b)())}},pageUp:{direction:-1,trigger:function(){Object(s.b)(3*this.direction)}},pageDown:{direction:1,trigger:function(){Object(s.b)(3*this.direction)}},arrowLeft:{direction:-1,trigger:function(t){Object(o.c)(this.direction*(t.shiftKey?3:1))}},arrowRight:{direction:1,trigger:function(t){Object(o.c)(this.direction*(t.shiftKey?3:1))}},arrowUp:{direction:-1,trigger:function(t){Object(s.b)(this.direction*(t.shiftKey?3:1))}},arrowDown:{direction:1,trigger:function(t){Object(s.b)(this.direction*(t.shiftKey?3:1))}}})},function(t,e,n){"use strict";n.d(e,"a",function(){return i});let r=!1;try{const t=Object.defineProperty({},"passive",{get:function(){r=!0}});window.addEventListener("testPassive",null,t),window.removeEventListener("testPassive",null,t)}catch(t){}const i={active:!!r&&{passive:!1},passive:!!r&&{passive:!0}}},function(t,e,n){"use strict";function r(t,e,n){return Math.max(e,Math.min(t,n))}n.d(e,"a",function(){return r})},function(t,e,n){"use strict";function r(t,e){const n=getComputedStyle(t).getPropertyValue(e);return""===n?0:parseFloat(n)}n.d(e,"a",function(){return r})},function(t,e,n){"use strict"},function(t,e,n){"use strict";n.d(e,"a",function(){return r});class r{constructor(t=null){if(this._map=new Map,this._first=null,this._last=null,t)for(const[e,n]of t)this.set(e,n)}get[Symbol.toStringTag](){return"LinkedMap"}get first(){return this._first}set first(t){this._first=t}get last(){return this._last}set last(t){this._last=t}get size(){return this._map.size}clear(){this._map.clear(),this._first=null,this._last=null}has(t){return this._map.has(t)}get(t){return this._map.get(t).value}getLast(){return this.last.value}getFirst(){return this.first.value}add(t,e){let n=this._map.get(t);return n?n.value=e:(n=new i(t,e),this._map.set(t,n)),n}set(t,e){const n=this.add(t,e);return null===this.first&&null===this.last?(this.first=n,this.last=n):(n.prev=this.last,this.last.next=n,this.last=n),this}setFront(t,e){const n=this.add(t,e);return null===this.first&&null===this.last?(this.first=n,this.last=n):(n.next=this.first,this.first.prev=n,this.first=n),this}delete(t){if(this.has(t)){const e=this._map.get(t);return this.first===this.last?(this.first=null,this.last=null):this.first===e?(e.next.prev=null,this.first=e.next):this.last===e?(e.prev.next=null,this.last=e.prev):(e.prev.next=e.next,e.next.prev=e.prev),this._map.delete(t),!0}return!1}forEach(t,e){for(const[n,r]of this.entries())t(r,n,e)}forEachReverse(t,e){for(const[n,r]of this.entries().reverse())t(r,n,e)}[Symbol.iterator](){return this.entries()}reverse(){return this.entries().reverse()}entries(){return this.iterableIterator(function(t){return[t.key,t.value]})}keys(){return this.iterableIterator(function(t){return t.key})}values(){return this.iterableIterator(function(t){return t.value})}iteratorFor(t){let e=this._map.get(t);return this.iterableIterator(function(t){return[t.key,t.value]},e)}iterableIterator(t,e){let n=e||this.first;const r=this.last;let i="next";return{reverse(){return n=e||r,i="prev",this},[Symbol.iterator](){return this},next:function(){let e;return n&&(e=t(n),n=n[i]),function(t){return{value:t,done:void 0===t}}(e)}}}}class i{constructor(t,e){this._key=t,this._value=e,this._next=null,this._prev=null}get key(){return this._key}get value(){return this._value}set value(t){this._value=t}get next(){return this._next}set next(t){this._next=t}get prev(){return this._prev}set prev(t){this._prev=t}}},function(t,e,n){"use strict";function r(t,e){const n=Object(o.c)(t,"width"),r=Math.floor(n/e);return function(t){document.querySelector(i.a.selector.slidehub).style.setProperty("--visible-pages",t.toString())}(r),r}n.d(e,"a",function(){return r});var i=n(1),o=n(0)},function(t,e,n){"use strict";function r(t){const e=t.target.closest(a.a.selector.doc);if(null===e)return;const n=Math.abs(t.deltaX/t.deltaY)<1?h.vertical:h.horizontal;if(n===h.horizontal&&(Object(l.c)(e),console.log("Horizontal scrolling ...")),n===h.vertical&&t.shiftKey){Object(l.c)(e),t.preventDefault();const r=t[n.delta];Object(u.c)(Math.sign(r))}}function i(t){if("shiftKey"===f[t.keyCode]){Object(l.a)().querySelector(a.a.selector.itemContainer).style.setProperty("cursor","ew-resize")}}function o(t){if("shiftKey"===f[t.keyCode]){Object(l.a)().querySelector(a.a.selector.itemContainer).style.setProperty("cursor","auto")}}function s(){Object(l.a)().querySelector(a.a.selector.itemContainer).style.setProperty("cursor","auto")}n.d(e,"a",function(){return d});var c=n(0),a=n(1),u=n(2),l=n(3);const d={enabled:!0,name:"item-navigation",description:"Navigate pages with the mouse wheel by holding down Shift",enable(){document.addEventListener("keydown",i,c.d.passive),document.addEventListener("keyup",o,c.d.passive),window.addEventListener("blur",s,c.d.passive),document.addEventListener("wheel",r,c.d.active)},disable(){document.removeEventListener("keydown",i,c.d.passive),document.removeEventListener("keyup",o,c.d.passive),window.removeEventListener("blur",s,c.d.passive),document.removeEventListener("wheel",r,c.d.active)}},h={vertical:{delta:"deltaY"},horizontal:{delta:"deltaX"}},f={16:"shiftKey"}},function(t,e,n){"use strict";function r(t){if(13!==t.keyCode)return;const e=t.ctrlKey;o(t.target,e)}function i(t){if(0!==t.button)return;if(t.target.closest(s.a.selector.doc)){o(t.target,!0)}}function o(t,e){(function(t){const e=t.tagName.toLowerCase();let n=!1;switch(!0){case["a","area"].includes(e):if(!t.hasAttribute("href"))return!1;n=!0;break;case["input","select","textarea","button"].includes(e):if(t.disabled)return!1;n=!0;break;case["iframe","object","embed"].includes(e):n=!0;break;default:t.hasAttribute("contenteditable")&&(n=!0)}if(n&&null!==t.offsetParent)return!0;return!1})(t)||function(t){const e=Object(u.a)().dataset.docSource,n=Object(a.a)().dataset.page,r=e+("0"!==n?`#page=${n}`:"");t?window.open(r):window.location.href=r}(e)}n.d(e,"a",function(){return l});var s=n(1),c=n(0),a=n(2),u=n(3);const l={enabled:!0,name:"item-linking",description:"Link pages to PDF source",enable(){document.addEventListener("keydown",r,c.d.passive),document.addEventListener("dblclick",i,c.d.passive)},disable(){document.removeEventListener("keydown",r,c.d.passive),document.removeEventListener("dblclick",i,c.d.passive)}}},function(t,e,n){"use strict";function r(t){if(t.target instanceof Element){const e=t.target.closest(o.a.selector.doc);if(e){Object(c.c)(e);const n=t.target.closest(o.a.selector.item);n&&Object(s.d)(n)}}}n.d(e,"a",function(){return a});var i=n(0),o=n(1),s=n(2),c=n(3);const a={enabled:!0,name:"highlight-active-document",description:"Highlight the active document on hover",enable(){document.addEventListener("mousemove",r,i.d.passive)},disable(){document.removeEventListener("mousemove",r)}}},function(t,e,n){"use strict";var r=n(4);n.d(e,"b",function(){return r.a});var i=n(21);n.d(e,"a",function(){return i.a});n(2);var o=n(22);n.d(e,"c",function(){return o.a});var s=n(23);n.d(e,"d",function(){return s.a})},function(t,e,n){"use strict";function r(){const t=function(){const t=function(t){const e=t.indexOf("#");if(e>0)return t.substring(e+1);return null}(window.location.toString());if(d.documents.has(t))return t;return d.documents.keys().next().value}();return d.prevIterator=d.documents.iteratorFor(t).reverse(),d.nextIterator=d.documents.iteratorFor(t),d.prevIterator.next(),function(t){const e=o(t,"beforeend");return Object(a.c)(e),e}(d.nextIterator.next())}function i(t,e,n){for(;n--;)o(t.next(),e)}function o(t,e){if(t.done)return;const n=t.value[1];if(n.loaded)return void console.warn(n.name,"was already loaded. Skipping.");n.insertPosition=e,"afterbegin"===n.insertPosition?n.iterator=d.prevIterator:n.iterator=d.nextIterator,console.log(`Loading ${n.name}.`);const r=function(t){const e=function(t){let e="";for(var n=0;n<t.itemCount;n++){const r=`${s.a.assets.images}/${t.name}-${n}.png`;e+=`\n      <div class="${d.classes.item}" data-page="${n+1}">\n        <img data-src="${r}" alt="page ${n+1}">\n      </div>\n    `}const r=`${s.a.assets.documents}/${t.name}`,i=`\n    <div class="${d.classes.item}" data-page="0">\n      <div class="doc-meta">\n        <h2 class="doc-meta__title">\n          <a href="${r}">${t.name}</a>\n        </h2>\n        by author, ${t.itemCount} pages, 2018\n      </div>\n    </div>\n  `,o=`\n    <div class="${d.classes.item} dummy-page" aria-hidden="true" style="visibility: hidden;">\n    </div>\n  `;return`\n    <div class="${d.classes.scrollbox}">\n      <div class="${d.classes.itemContainer}">\n        ${s.a.metaSlide?i:""}\n        ${e}\n        ${o}\n      </div>\n    </div>\n  `}(t),n=document.getElementById(t.name);return n.insertAdjacentHTML("beforeend",e),n}(n);return Object(u.d)(r.querySelector(s.a.selector.item)),Object(c.b)(r),d.observer.observe(r),n.loaded=!0,r}n.d(e,"a",function(){return h});var s=n(1),c=n(4),a=n(3),u=n(2),l=n(0);const d={documents:null,prevIterator:null,nextIterator:null,observer:new IntersectionObserver(function(t,e){for(const n of t)if(n.isIntersecting){const t=d.documents.get(n.target.id);o(t.iterator.next(),t.insertPosition),e.unobserve(n.target)}}),batchSize:5,classes:{slidehub:s.a.selector.slidehub.slice(1),doc:s.a.selector.doc.slice(1),scrollbox:s.a.selector.scrollbox.slice(1),itemContainer:s.a.selector.itemContainer.slice(1),item:s.a.selector.item.slice(1)}},h={enable(){d.documents=function(t){const e=new l.a;return t.forEach(([t,n])=>{const r={name:t,itemCount:n,loaded:!1};e.set(t,r)}),e}(documentsData),document.addEventListener("DOMContentLoaded",function(){const t=function(){const t=document.createElement("div");return t.classList.add(d.classes.slidehub),s.a.highlightColor&&""!==s.a.highlightColor&&t.style.setProperty("--c-highlight",s.a.highlightColor),document.querySelector("[data-slidehub]").appendChild(t),t}();!function(t){let e="";for(const t of d.documents.values()){const n=`${s.a.assets.documents}/${t.name}`;e+=`\n      <div\n        class="${d.classes.doc}"\n        id="${t.name}"\n        data-doc-source="${n}"\n        style="--pages: ${t.itemCount+(s.a.metaSlide?1:0)}"\n      >\n      </div>\n    `}t.insertAdjacentHTML("beforeend",e)}(t);!function(t,e){const n=e.querySelector(s.a.selector.item),r=Object(l.c)(n,"width"),i=Object(l.c)(n,"margin-left")+r+Object(l.c)(n,"margin-right");Object(u.e)(i),t.style.setProperty("--page-outer-width",i+"px")}(t,r()),i(d.nextIterator,"beforeend",d.batchSize),i(d.prevIterator,"afterbegin",d.batchSize)})}}},function(t,e,n){"use strict";function r(t){null!==t&&(l=document.activeElement,document.body.setAttribute("aria-hidden","true"),t.setAttribute("aria-hidden","false"),function(t){a(t)[0].focus()}(t),document.addEventListener("keydown",s,u.d.passive),t.addEventListener("keydown",c,u.d.active),t.addEventListener("click",o,u.d.passive))}function i(t){null!==t&&(document.body.setAttribute("aria-hidden","false"),t.setAttribute("aria-hidden","true"),document.removeEventListener("keydown",s,u.d.passive),t.removeEventListener("keydown",c,u.d.active),t.removeEventListener("click",o,u.d.passive),l.focus())}function o(t){const e=document.querySelector('.modal[aria-hidden="false"]');e===t.target&&i(e)}function s(t){27===t.keyCode&&i(document.querySelector('.modal[aria-hidden="false"]'))}function c(t){if(9!==t.keyCode)return;const e=document.activeElement,n=a(t.currentTarget).filter(t=>t.tabIndex>-1);n.length<2?t.preventDefault():t.shiftKey?e===n[0]&&(n[n.length-1].focus(),t.preventDefault()):e===n[n.length-1]&&(n[0].focus(),t.preventDefault())}function a(t=document){return Array.from(t.querySelectorAll(h))}n.d(e,"a",function(){return d});var u=n(0);let l;const d={enable(){document.addEventListener("DOMContentLoaded",function(){Array.from(document.querySelectorAll("button[data-target-modal]")).forEach(t=>{t.removeAttribute("disabled"),t.addEventListener("click",t=>{const e=t.currentTarget.dataset.targetModal;r(document.querySelector(`.${e}`))})});Array.from(document.querySelectorAll("button[data-close-modal]")).forEach(t=>{t.addEventListener("click",t=>{i(t.currentTarget.closest(".modal"))})})})}},h="a[href], input:not(:disabled), textarea:not(:disabled), button:not(:disabled), [tabindex]"},function(t,e,n){"use strict";function r(t){t.enabled&&t.enable(),function(t){const e=function(t){const e=document.querySelector(".features-fieldset");if(!e)return null;const n=`\n    <div class="form-group form-group--switch">\n      <span class="form-label" id="${t.name}-label">${t.description}</span>\n      <button role="switch" aria-checked="false" aria-labelledby="${t.name}-label" data-feature="${t.name}">\n        <span class="state state--true" aria-label="on"></span>\n        <span class="state state--false" aria-label="off"></span>\n      </button>\n    </div>\n  `;e.insertAdjacentHTML("beforeend",n);const r=e.querySelector(`[data-feature="${t.name}"]`);return r.setAttribute("aria-checked",t.enabled.toString()),r}(t);e&&(o.set(t.name,t),e.addEventListener("click",i))}(t)}function i(t){const e=t.currentTarget;if(e instanceof HTMLElement){const t=o.get(e.dataset.feature),n="true"===e.getAttribute("aria-checked");e.setAttribute("aria-checked",String(!n)),function(t,e,n){switch(!0){case t.hasAttribute("data-feature"):"true"===t.getAttribute(e)?(n.enable(),console.info("Enabled",n.name)):(n.disable(),console.info("Disabled",n.name));break;default:console.warn("No action is associated with the control",t)}}(e,"aria-checked",t)}}n.d(e,"a",function(){return r});const o=new Map}]);
//# sourceMappingURL=app.bundle.js.map