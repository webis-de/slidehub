/**
 * Item Linking.
 *
 * Opens the document source (e.g. a PDF document) by pressing <kbd>Enter</kbd>
 * or double-clicking with a pointer device.
 */

import { listener } from '../util/passive-event-listener';
import { getSelectedItem, getHighlightedItem } from '../core/item-navigation';
import { getSelectedDocument, getHighlightedDocument } from '../core/document-navigation';

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
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('dblclick', handleDoubleClick);
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
  const doc = getSelectedDocument();
  const item = getSelectedItem(doc);
  handleOpenIntent(doc, item, openInNewTab);
}

/**
 * @param {MouseEvent} event
 */
function handleDoubleClick(event) {
  if (event.button !== 0) {
    return;
  }

  const doc = getHighlightedDocument();
  const item = getHighlightedItem(doc);
  if (item) {
    const openInNewTab = true;
    handleOpenIntent(doc, item, openInNewTab);
  }
}

/**
 *
 * @param {HTMLElement} doc
 * @param {HTMLElement} item
 * @param {boolean} openInNewTab
 */
function handleOpenIntent(doc, item, openInNewTab) {
  // Focusable elements have a default behavior (e.g. activating a link)
  // That behavior shall not be altered/extended.
  if (isInteractive(item)) {
    return;
  }

  openDocumentSource(doc, item, openInNewTab);
}

/**
 * Opens the document source for the current selected document in the browser.
 *
 * @param {HTMLElement} doc
 * @param {HTMLElement} item
 * @param {boolean} openInNewTab
 */
function openDocumentSource(doc, item, openInNewTab) {
  const itemIndex = item.dataset.page;
  const fragment = itemIndex !== '0' ? `#page=${itemIndex}` : '';
  const itemSource = doc.dataset.docSource + fragment;

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
