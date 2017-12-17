/**
 * Item Linking.
 *
 * Opens the document source (e.g. a PDF document) by pressing <kbd>Enter</kbd>
 * or double-clicking with a pointer device.
 */

import { config } from '../config';
import { listener } from '../util';
import { getActiveItem } from '../core/item-navigation';
import { getActiveDocument } from '../core/document-navigation';

export { ItemLinking };

const ItemLinking = {
  enabled: true,
  name: 'item-linking',
  description: 'Link pages to PDF source',
  enable() {
    document.addEventListener('keydown', handleKeyDown, listener.passive);
    document.addEventListener('dblclick', handleDoubleClick, listener.passive);
  },
  disable() {
    document.removeEventListener('keydown', handleKeyDown, listener.passive);
    document.removeEventListener('dblclick', handleDoubleClick, listener.passive);
  }
};

/**
 * @param {KeyboardEvent} event
 */
function handleKeyDown(event) {
  if (event.keyCode !== 13) {
    return;
  }

  const openInNewTab = event.ctrlKey;
  handleOpenIntent(event.target, openInNewTab);
}

/**
 * @param {MouseEvent} event
 */
function handleDoubleClick(event) {
  if (event.button !== 0) {
    return;
  }

  const doc = event.target.closest(config.selector.doc);
  if (doc) {
    const openInNewTab = true;
    handleOpenIntent(event.target, openInNewTab);
  }
}

/**
 *
 * @param {HTMLElement} targetElement
 * @param {boolean} openInNewTab
 */
function handleOpenIntent(targetElement, openInNewTab) {
  // Focusable elements have a default behavior (e.g. activating a link)
  // That behavior shall not be altered/extended.
  if (isInteractive(targetElement)) {
    return;
  }

  openDocumentSource(openInNewTab);
}

/**
 * Opens the document source for the current active document in the browser.
 *
 * @param {boolean} openInNewTab
 */
function openDocumentSource(openInNewTab) {
  const activeDoc = getActiveDocument();
  const docSource = activeDoc.dataset.docSource;
  const itemIndex = getActiveItem().dataset.page;
  const fragment = itemIndex !== '0' ? `#page=${itemIndex}` : '';
  const itemSource = docSource + fragment;

  if (openInNewTab) {
    window.open(itemSource);
  } else {
    window.location.href = itemSource;
  }
}

/**
 * Returns true if element is interactive, false otherwise.
 *
 * @param {HTMLElement} element
 * @returns {boolean}
 */
function isInteractive(element) {
  const tag = element.tagName.toLowerCase();
  let potentiallyInteractive = false;

  switch (true) {
    case ['a', 'area'].includes(tag):
      if (!element.hasAttribute('href')) {
        return false;
      }

      potentiallyInteractive = true;
      break;
    case ['input', 'select', 'textarea', 'button'].includes(tag):
      if (element.disabled) {
        return false;
      }

      potentiallyInteractive = true;
      break;
    case ['iframe', 'object', 'embed'].includes(tag):
      potentiallyInteractive = true;
      break;
    default:
      if (element.hasAttribute('contenteditable')) {
        potentiallyInteractive = true;
      }
      break;
  }

  if (potentiallyInteractive && element.offsetParent !== null) {
    return true;
  }

  return false;
}
