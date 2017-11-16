/*
* Application entry point.
*
* Loads core modules and plugins.
*/

import './lib/intersection-observer.js';
import * as plugins from './plugins';
import { ImageLoader, DocumentLoader, Modal, loadPlugin } from './core';

(function() {
  loadCoreModules();
  loadPlugins();
})();

function loadCoreModules() {
  ImageLoader.enable();
  DocumentLoader.enable();
  Modal.enable();
}

function loadPlugins() {
  document.addEventListener('DOMContentLoaded', function() {
    for (const plugin of Object.values(plugins)) {
      loadPlugin(plugin);
    }
  });
}
