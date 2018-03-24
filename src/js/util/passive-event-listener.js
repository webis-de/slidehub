export { listener };

/**
 * Feature detection for passive event listeners as per:
 * https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
 */

let supportsPassive = false;

try {
  const opts = Object.defineProperty({}, 'passive', {
    get: function () {
      supportsPassive = true;
    }
  });

  window.addEventListener('testPassive', null, opts);
  window.removeEventListener('testPassive', null, opts);
} catch (e) {}

/**
 * @typedef {object} AddEventListenerOptionsObject
 * @property {boolean|AddEventListenerOptions} active
 * @property {boolean|AddEventListenerOptions} passive
 */

/**
 * Stores the third argument for `addEventListener` for both cases
 * @type {AddEventListenerOptionsObject}
 */
const listener = {
  active: supportsPassive ? { passive: false } : false,
  passive: supportsPassive ? { passive: true } : false
};
