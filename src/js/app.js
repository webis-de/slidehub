/*
* Application entry point.
*
* Loads core modules and plugins.
*/

import * as plugins from './plugins';
import { ImageLoader, DocumentLoader, Modal, loadPlugin } from './core';

export { initialize };

function initialize() {
  loadCoreModules();
  loadPlugins();
}

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
