/**
 * Wheel Navigation.
 */

import { config } from '../config';
import { listener } from '../util';
import { navigateItemInDocument, exposeScrollboxWidth } from '../core/item-navigation';

export { WheelNavigation };

const WheelNavigation = {
  enabled: true,
  name: 'wheel-navigation',
  description: 'Navigate pages with Shift + Mouse Wheel',
  enable() {
    enableModifier();
    document.addEventListener('mousemove', storeCurrentDocument, listener.passive);
    document.addEventListener('wheel', handleWheelNavigation, listener.active);
  },
  disable() {
    disableModifier();
    document.removeEventListener('mousemove', storeCurrentDocument);
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
    navigateItemInDocument(doc, Math.sign(delta));
  }
}

/**
 * Modifier keys.
 */

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

let currentDocument;

/**
 * @param {MouseEvent} event
 */
function storeCurrentDocument(event) {
  currentDocument = event.target.closest(config.selector.doc);
}

/**
 * Displays a special cursor when the modifier is pressed.
 *
 * @param {KeyboardEvent} event
 */
function onModifierDown(event) {
  if (currentDocument && event.keyCode === 16) {
    currentDocument.style.setProperty('cursor', 'ew-resize');
  }
}

/**
 * Removes the special cursor when the modifier is no longer pressed.
 *
 * @param {KeyboardEvent} event
 */
function onModifierUp(event) {
  if (currentDocument && event.keyCode === 16) {
    currentDocument.style.setProperty('cursor', 'auto');
  }
}

/**
 * Removes the special cursor when the user somehow leaves the page.
 */
function onModifierBlur() {
  if (currentDocument) {
    currentDocument.style.setProperty('cursor', 'auto');
  }
}
