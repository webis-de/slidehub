/*
* Item Linking.
*
* Open an items’ source document (e.g. a PDF page) by pressing <kbd>Return</kbd>.
*/

import { listener } from '../util';
import { getActiveItem } from '../core/view-navigation';
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

function handleKeyDown(event) {
  if (event.keyCode !== 13) {
    return;
  }

  const openInNewTab = event.ctrlKey;
  handleOpenIntent(event.target, openInNewTab);
}

function handleDoubleClick(event) {
  if (event.button !== 0) {
    return;
  }

  const openInNewTab = true;
  handleOpenIntent(event.target, openInNewTab);
}

function handleOpenIntent(eventTarget, openInNewTab) {
  // Focusable elements have a default behavior (e.g. activating a link)
  // That behavior shall not be altered/extended.
  if (isInteractive(eventTarget)) {
    return;
  }

  openItem(openInNewTab);
}

function openItem(openInNewTab) {
  const view = getActiveDocument();
  const docSource = view.getAttribute('data-doc-source');
  const itemIndex = getActiveItem(view).getAttribute('data-page');
  const fragment = itemIndex !== '0' ? `#page=${itemIndex}` : '';
  const itemSource = docSource + fragment;

  if (openInNewTab) {
    window.open(itemSource);
  } else {
    window.location.href = itemSource;
  }
}

function isInteractive(element) {
  const tag = element.tagName.toLowerCase();
  let potentiallyInteractive = false;
  switch (true) {
    case ['a', 'area'].includes(tag):
      if (element.hasAttribute('href') === false) {
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
      if (element.getAttribute('contenteditable') === 'true') {
        potentiallyInteractive = true;
      }
      break;
  }

  if (potentiallyInteractive && element.offsetParent !== null) {
    return true;
  }

  return false;
}
