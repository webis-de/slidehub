/*
* Item Linking.
*
* Open an items’ source document (e.g. a PDF page) by pressing <kbd>Return</kbd>.
*/

import { listener } from '../util';
import { getActiveView, getActiveItem } from '../core/view-navigation';

export { ItemLinkingModule };

const ItemLinkingModule = {
  enabled: true,
  name: 'item-linking',
  description: 'Link pages to PDF source',
  enable() {
    document.addEventListener('keydown', handleItemLinking, listener.passive);
  },
  disable() {
    document.removeEventListener('keydown', handleItemLinking, listener.passive);
  }
};

function handleItemLinking(event) {
  if (event.keyCode !== 13) {
    return;
  }

  // Focusable elements have a default behavior (e.g. activating a link)
  // That behavior shall not be altered/extended.
  if (isInteractive(event.target)) {
    return;
  }

  openItem(event.ctrlKey);
}

function openItem(ctrlKey) {
  const view = getActiveView();
  const docSource = view.getAttribute('data-doc-source');
  const itemIndex = getActiveItem(view).getAttribute('data-page');
  const fragment = itemIndex !== '0' ? `#page=${itemIndex}` : '';
  const itemSource = docSource + fragment;

  if (ctrlKey) {
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
