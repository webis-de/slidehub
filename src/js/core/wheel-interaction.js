/**
 * Wheel Navigation.
 */

import { listener } from '../util/passive-event-listener';
import { navigateItemInDocument, exposeScrollboxWidth } from '../core/item-navigation';
import { getHighlightedDocument } from '../core/document-navigation';

export { WheelInteraction, initWheelInteraction };

const WheelInteraction = {
  name: 'wheel-interaction',
  description: 'Navigate pages with Shift + Mouse Wheel',
  enable() {
    enableModifier();
  }
};

/**
 *
 * @param {Element} doc
 */
function initWheelInteraction(doc) {
  doc.addEventListener('wheel', handleWheelNavigation, listener.active);
}

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
  // const doc = event.target.closest(config.selector.doc);
  const doc = event.currentTarget;
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
 * Displays a special cursor when the modifier is pressed.
 *
 * @param {KeyboardEvent} event
 */
function onModifierDown(event) {
  const doc = getHighlightedDocument();
  if (doc && event.keyCode === 16) {
    doc.style.setProperty('cursor', 'ew-resize');
  }
}

/**
 * Removes the special cursor when the modifier is no longer pressed.
 *
 * @param {KeyboardEvent} event
 */
function onModifierUp(event) {
  const doc = getHighlightedDocument();
  if (doc && event.keyCode === 16) {
    doc.style.setProperty('cursor', 'auto');
  }
}

/**
 * Removes the special cursor when the user somehow leaves the page.
 */
function onModifierBlur() {
  const doc = getHighlightedDocument();
  if (doc) {
    doc.style.setProperty('cursor', 'auto');
  }
}
