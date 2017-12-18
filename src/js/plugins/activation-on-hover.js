/**
 * Active Document Highlighting.
 *
 * Highlights the active document (and its items) on hover.
 */

import { listener } from '../util';
import { config } from '../config';
import { setActiveItem } from '../core/item-navigation';
import { setActiveDocument } from '../core/document-navigation';

export { ActivationOnHover };

const ActivationOnHover = {
  enabled: true,
  name: 'activation-on-hover',
  description: 'Highlights the active document on hover',
  enable() {
    document.addEventListener('touchstart', setTouched, listener.passive);
    document.addEventListener('mouseup', resetTouched, listener.passive);
    document.addEventListener('mousemove', handleHighlightOnHover, listener.passive);
  },
  disable() {
    document.removeEventListener('touchstart', setTouched, listener.passive);
    document.removeEventListener('mouseup', resetTouched, listener.passive);
    document.removeEventListener('mousemove', handleHighlightOnHover, listener.passive);
  }
};

let touched = false;

/**
 * Sets the touched state to true.
 */
function setTouched() {
  touched = true;
}

/**
 * Sets the touched state to false.
 */
function resetTouched() {
  touched = false;
}

/**
 * @param {MouseEvent} event
 */
function handleHighlightOnHover(event) {
  if (touched) {
    return;
  }

  if (event.target instanceof Element) {
    const doc = event.target.closest(config.selector.doc);
    if (doc) {
      setActiveDocument(doc);

      const item = event.target.closest(config.selector.item);
      if (item) {
        setActiveItem(item);
      }
    }
  }
}
