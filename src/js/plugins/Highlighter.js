import { SlidehubPlugin } from '../core/SlidehubPlugin';
import { config } from '../config';
import { listener } from '../util/passive-event-listener';

export { Highlighter };

/**
 * Highlighter.
 *
 * Highlights documents/items on hover
 */
class Highlighter extends SlidehubPlugin {
  constructor(slidehub) {
    const description = 'Highlights documents/items on hover';
    super(slidehub, 'Highlighter', description);

    this.boundHandleHighlight = this.handleHighlight.bind(this);
  }

  enable() {
    document.addEventListener('mousemove', this.boundHandleHighlight, listener.passive);
    super.enable();
  }

  disable() {
    document.removeEventListener('mousemove', this.boundHandleHighlight);
    super.disable();
  }

  /**
   * @param {MouseEvent} event
   */
  handleHighlight(event) {
    if (event.target instanceof Element) {
      const docNode = event.target.closest(config.selector.doc);
      if (docNode) {
        const doc = this.slidehub.documents.get(docNode.id);
        this.slidehub.highlightDocument(doc);

        if (config.keepSelectedPageInFirstColumn) {
          return;
        }

        const itemNode = event.target.closest(config.selector.item);
        if (itemNode) {
          doc.highlightItem(itemNode);
        }
      }
    }
  }
};
