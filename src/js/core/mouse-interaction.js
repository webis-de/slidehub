/**
 * Wheel Navigation.
 */

import { config } from '../config';
import { listener } from '../util/passive-event-listener';
import { navigateItemInDocument, selectItem } from '../core/item-navigation';
import { getHighlightedDocument, selectDocument } from '../core/document-navigation';

export { MouseInteraction, initMouseInteraction };

const MouseInteraction = {
  name: 'mouse-interaction',
  description: 'Navigate pages with Shift + Mouse Wheel',
  enable() {
    enableModifier();
  }
};

/**
 *
 * @param {Element} doc
 */
function initMouseInteraction(doc) {
  doc.addEventListener('wheel', handleWheelInteraction, listener.active);
  doc.addEventListener('click', handleClickSelection, listener.passive);
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
function handleWheelInteraction(event) {
  // Don’t handle scrolling on elements that are not inside a document
  // const doc = event.target.closest(config.selector.doc);
  const doc = event.currentTarget;
  if (doc === null) {
    return;
  }

  const ratio = Math.abs(event.deltaX / event.deltaY);
  const scrollingDirection = ratio < 1 ? scrolling.vertical : scrolling.horizontal;

  // When scrolling vertically, only trigger navigation when modifier is pressed
  if (scrollingDirection === scrolling.vertical && event.shiftKey) {
    // Prevent vertical scrolling
    event.preventDefault();

    const delta = event[scrollingDirection.delta];
    navigateItemInDocument(doc, Math.sign(delta));
  }
}

function handleClickSelection(event) {
  const doc = event.currentTarget;
  if (doc) {
    selectDocument(doc);

    const item = event.target.closest(config.selector.item);
    if (item) {
      selectItem(doc, item);
    }
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
