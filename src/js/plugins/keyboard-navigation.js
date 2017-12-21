/**
 * Keyboard Navigation.
 */

import { listener } from '../util';
import { navigateItem, navigateItemToBoundary } from '../core/item-navigation';
import { navigateDocument } from '../core/document-navigation';

export { KeyboardNavigationModule };

const KeyboardNavigationModule = {
  enabled: true,
  name: 'keyboard-navigation',
  description: 'Navigate documents and its pages with the keyboard',
  enable() {
    document.addEventListener('keydown', handleKeyboardInput, listener.active);
  },
  disable() {
    document.removeEventListener('keydown', handleKeyboardInput, listener.active);
  }
};

/**
 * Handles keyboard interactions with documents and items.
 *
 * @param {KeyboardEvent} event
 */
function handleKeyboardInput(event) {
  if (event.keyCode in controlKeyNames) {
    event.preventDefault();
    const keyName = controlKeyNames[event.keyCode];
    controlKey[keyName].trigger(event);
  }
}

/**
 * Maps key codes to key names.
 * It’s used within keyboard-related event handlers in order to work with the
 * keys’ names instead of key codes.
 *
 * Removing an entry here disables its application-related interactions
 */
const controlKeyNames = Object.freeze({
  33: 'pageUp',
  34: 'pageDown',
  35: 'endKey',
  36: 'homeKey',
  37: 'arrowLeft',
  38: 'arrowUp',
  39: 'arrowRight',
  40: 'arrowDown'
});

/**
 * Maps control keys to a trigger function that is executed when the key is
 * pressed.
 *
 * @typedef {object} ControlKeyObject
 * @property {number} direction
 * @property {function(): void} trigger
 *
 * @type {Object.<string, ControlKeyObject>}
 */
const controlKey = Object.freeze({
  homeKey: {
    direction: -1,
    trigger: function() {
      navigateItemToBoundary(this.direction);
    }
  },
  endKey: {
    direction: 1,
    trigger: function() {
      navigateItemToBoundary(this.direction);
    }
  },
  pageUp: {
    direction: -1,
    trigger: function() {
      navigateDocument(this.direction * 3);
    }
  },
  pageDown: {
    direction: 1,
    trigger: function() {
      navigateDocument(this.direction * 3);
    }
  },
  arrowLeft: {
    direction: -1,
    trigger: function(event) {
      navigateItem(this.direction * (event.shiftKey ? 3 : 1));
    }
  },
  arrowRight: {
    direction: 1,
    trigger: function(event) {
      navigateItem(this.direction * (event.shiftKey ? 3 : 1));
    }
  },
  arrowUp: {
    direction: -1,
    trigger: function(event) {
      navigateDocument(this.direction * (event.shiftKey ? 3 : 1));
    }
  },
  arrowDown: {
    direction: 1,
    trigger: function(event) {
      navigateDocument(this.direction * (event.shiftKey ? 3 : 1));
    }
  }
});
