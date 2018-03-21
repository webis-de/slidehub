/**
 * Application entry point.
 */

import './lib/intersection-observer';

import { Slidehub } from './core/Slidehub';

/**
 * An Immediately Invoked Function Expression, called like that because it’s
 * immediately executed when a JavaScript file like this is sourced.
 *
 * Starts the engines for Slidehub.
 */
(function () {
  new Slidehub();
})();
