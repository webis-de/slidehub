/**
 * Application entry point.
 *
 * Loads core modules and plugins.
 */

import './lib/intersection-observer.js';
import * as plugins from './plugins';
import { ImageLoader, DocumentLoader, Modal, loadPlugin } from './core';

/**
 * An Immediately Invoked Function Expression, called like that because it’s
 * immediately executed when a JavaScript file like this is sourced.
 *
 * Starts the engines for SlideHub.
 */
(function() {
  loadCoreModules();
  loadPlugins();
})();

/**
 * Loads core modules.
 */
function loadCoreModules() {
  ImageLoader.enable();
  DocumentLoader.enable();
  Modal.enable();
}

/**
 * Loads all plugins from the ./plugins directory.
 */
function loadPlugins() {
  document.addEventListener('DOMContentLoaded', function() {
    for (const plugin of Object.values(plugins)) {
      loadPlugin(plugin);
    }
  });
}
