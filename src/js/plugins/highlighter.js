/**
 * Highlighter.
 *
 * Highlights documents/items on hover
 */

import { config } from '../config';
import { listener } from '../util';
import { highlightDocument } from '../core/document-navigation';
import { highlightItem } from '../core/item-navigation';

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
