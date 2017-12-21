/**
 * Wheel Navigation.
 */

import { listener, getOuterWidth } from '../util';
import { config } from '../config';
import { navigateItem, exposeScrollboxWidth } from '../core/item-navigation';
import { getSelectedDocument } from '../core/document-navigation';

export { WheelNavigation };

const WheelNavigation = {
  enabled: true,
  name: 'item-navigation',
  description: 'Navigate pages with the mouse wheel by holding down Shift',
  enable() {
    enableModifier();
    document.addEventListener('wheel', handleWheelNavigation, listener.active);
  },
  disable() {
    disableModifier();
    document.removeEventListener('wheel', handleWheelNavigation, listener.active);
  }
};

const scrolling = {
  vertical: {
    delta: 'deltaY'
  },
  horizontal: {
    delta: 'deltaX'
  }
};

/**
 * Handles wheel navigation.
 *
 * @param {WheelEvent} event
 */
function handleWheelNavigation(event) {
  // Don’t handle scrolling on elements that are not inside a document
  const doc = event.target.closest(config.selector.doc);
  if (doc === null) {
    return;
  }

  const ratio = Math.abs(event.deltaX / event.deltaY);
  const scrollingDirection = ratio < 1 ? scrolling.vertical : scrolling.horizontal;

  if (scrollingDirection === scrolling.horizontal) {
    exposeScrollboxWidth();
  }

  // When scrolling vertically, only trigger navigation when modifier is pressed
  if (scrollingDirection === scrolling.vertical && event.shiftKey) {
    // Prevent vertical scrolling
    event.preventDefault();

    const delta = event[scrollingDirection.delta];
    navigateItem(doc, Math.sign(delta));
  }
}

/**
 * Modifier keys.
 */

// Maps key codes to key names
const modifierKeyNames = {
  16: 'shiftKey'
};

/**
 * Wrapper for enabling all event listeners related to modifier handling.
 */
function enableModifier() {
  document.addEventListener('keydown', onModifierDown, listener.passive);
  document.addEventListener('keyup', onModifierUp, listener.passive);
  window.addEventListener('blur', onModifierBlur, listener.passive);
}

/**
 * Wrapper for disabling all event listeners related to modifier handling.
 */
function disableModifier() {
  document.removeEventListener('keydown', onModifierDown, listener.passive);
  document.removeEventListener('keyup', onModifierUp, listener.passive);
  window.removeEventListener('blur', onModifierBlur, listener.passive);
}

/**
 * Displays a special cursor when the modifier is pressed.
 *
 * @param {KeyboardEvent} event
 */
function onModifierDown(event) {
  const modifierKey = modifierKeyNames[event.keyCode];
  if (modifierKey === 'shiftKey') {
    const doc = getSelectedDocument().querySelector(config.selector.itemContainer);
    doc.style.setProperty('cursor', 'ew-resize');
  }
}

/**
 * Removes the special cursor when the modifier is no longer pressed.
 *
 * @param {KeyboardEvent} event
 */
function onModifierUp(event) {
  const modifierKey = modifierKeyNames[event.keyCode];
  if (modifierKey === 'shiftKey') {
    const doc = getSelectedDocument().querySelector(config.selector.itemContainer);
    doc.style.setProperty('cursor', 'auto');
  }
}

/**
 * Removes the special cursor when the user somehow leaves the page.
 */
function onModifierBlur() {
  const doc = getSelectedDocument().querySelector(config.selector.itemContainer);
  doc.style.setProperty('cursor', 'auto');
}
