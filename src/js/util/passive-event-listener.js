export { listener };

/**
 * Feature detection for passive event listeners as per:
 * https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
 */

let supportsPassive = false;

try {
  const opts = Object.defineProperty({}, 'passive', {
    get: function() {
      supportsPassive = true;
    }
  });

  window.addEventListener('test', null, opts);
} catch (event) {}

// Stores the third argument for `addEventListener` for both cases
const listener = {
  active: supportsPassive ? { passive: false } : false,
  passive: supportsPassive ? { passive: true } : false
};
