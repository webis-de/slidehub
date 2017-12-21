/**
 * Highlighter.
 *
 * Highlights documents/items on hover
 */

import { config } from '../config';
import { listener } from '../util';

export { Highlighter };

const Highlighter = {
  enabled: true,
  name: 'highlighter',
  description: 'Highlight documents/items on hover',
  enable() {
    document.addEventListener('mousemove', handleHighlightOnHover, listener.passive);
  },
  disable() {
    document.removeEventListener('mousemove', handleHighlightOnHover);
  }
};

const highlightClassName = 'highlighted';

/**
 * @param {MouseEvent} event
 */
function handleHighlightOnHover(event) {
  if (event.target instanceof Element) {
    const doc = event.target.closest(config.selector.doc);
    if (doc) {
      highlightDocument(doc);

      const item = event.target.closest(config.selector.item);
      if (item) {
        highlightItem(doc, item);
      }
    }
  }
}

/**
 * Adds a highlight class to the document under the cursor.
 *
 * @param {Element} doc
 */
function highlightDocument(doc) {
  const currentHighlight = document.querySelector(`${config.selector.doc}.${highlightClassName}`);
  if (currentHighlight) {
    currentHighlight.classList.remove(highlightClassName);
  }

  doc.classList.add(highlightClassName);
}

/**
 * Adds a highlight class to the item under the cursor.
 *
 * @param {Element} doc
 * @param {Element} item
 */
function highlightItem(doc, item) {
  const currentHighlight = doc.querySelector(`${config.selector.item}.${highlightClassName}`);
  if (currentHighlight) {
    currentHighlight.classList.remove(highlightClassName);
  }

  item.classList.add(highlightClassName);
}
