/**
 * Active Document Highlighting.
 *
 * Highlights the active document (and its items) on hover.
 */

import { listener } from '../util';
import { config } from '../config';
import { setActiveItem } from '../core/item-navigation';
import { selectDocument } from '../core/document-navigation';

export { ActiveDocumentHighlighting };

const ActiveDocumentHighlighting = {
  enabled: false,
  name: 'highlight-active-document',
  description: 'Highlight the active document on hover',
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
      selectDocument(doc);

      const item = event.target.closest(config.selector.item);
      if (item) {
        setActiveItem(doc, item);
      }
    }
  }
}
