/**
 * Application entry point.
 */

import { polyfillIntersectionObserver } from './lib/intersection-observer.mjs';
import { Slidehub } from './core/Slidehub.mjs';

polyfillIntersectionObserver(window, document);

/**
 * An Immediately Invoked Function Expression, called like that because it’s
 * immediately executed when a JavaScript file like this is sourced.
 *
 * Starts the engines for Slidehub.
 */
(function () {
  new Slidehub();
})();
