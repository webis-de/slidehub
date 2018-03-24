import { config } from '../config';
import { listener } from '../util/passive-event-listener';

export { SlidehubMouseInteraction };

const scrolling = {
  vertical: {
    delta: 'deltaY'
  },
  horizontal: {
    delta: 'deltaX'
  }
};

/**
 * Mouse Interaction.
 */
class SlidehubMouseInteraction {
  constructor(slidehub) {
    this.slidehub = slidehub;
  }

  start() {
    this.enableModifier();
    this.initExistingDocuments();
  }

  initExistingDocuments() {
    const documents = Array.from(this.slidehub.node.querySelectorAll(config.selector.doc));
    documents.forEach(docNode => this.initMouseInteraction(docNode));
  }

  /**
   *
   * @param {Element} docNode
   */
  initMouseInteraction(docNode) {
    docNode.addEventListener('wheel', this.handleWheelInteraction.bind(this), listener.active);
    docNode.addEventListener('click', this.handleClickSelection.bind(this), listener.passive);
  }

  /**
   * Handles wheel navigation.
   *
   * @param {WheelEvent} event
   */
  handleWheelInteraction(event) {
    // Don’t handle scrolling on elements that are not inside a document
    const docNode = event.currentTarget;
    if (!docNode) {
      return;
    }

    const ratio = Math.abs(event.deltaX / event.deltaY);
    const scrollingDirection = ratio < 1 ? scrolling.vertical : scrolling.horizontal;

    // When scrolling vertically, only trigger navigation when modifier is pressed
    if (scrollingDirection === scrolling.vertical && event.shiftKey) {
      // Prevent vertical scrolling
      event.preventDefault();

      const delta = event[scrollingDirection.delta];
      this.slidehub.selectedDocument.navigateItem.by(Math.sign(delta));
    }
  }

  handleClickSelection(event) {
    const doc = this.slidehub.documents.get(event.currentTarget.id);
    if (doc.node) {
      this.slidehub.selectDocument(doc);

      if (config.keepSelectedPageInFirstColumn) {
        return;
      }

      const item = event.target.closest(config.selector.item);
      if (item) {
        doc.selectItem(item);
      }
    }
  }

  /**
   * Wrapper for enabling all event listeners related to modifier handling.
   */
  enableModifier() {
    document.addEventListener('keydown', this.onModifierDown.bind(this), listener.passive);
    document.addEventListener('keyup', this.onModifierUp.bind(this), listener.passive);
    window.addEventListener('blur', this.onModifierBlur.bind(this), listener.passive);
  }

  /**
   * Displays a special cursor when the modifier is pressed.
   *
   * @param {KeyboardEvent} event
   */
  onModifierDown(event) {
    const doc = this.slidehub.highlightedDocument;
    if (doc && event.keyCode === 16) {
      doc.node.style.setProperty('cursor', 'ew-resize');
    }
  }

  /**
   * Removes the special cursor when the modifier is no longer pressed.
   *
   * @param {KeyboardEvent} event
   */
  onModifierUp(event) {
    const doc = this.slidehub.highlightedDocument;
    if (doc && event.keyCode === 16) {
      doc.node.style.setProperty('cursor', 'auto');
    }
  }

  /**
   * Removes the special cursor when the user somehow leaves the page.
   */
  onModifierBlur() {
    const doc = this.slidehub.highlightedDocument;
    if (doc) {
      doc.node.style.setProperty('cursor', 'auto');
    }
  }
};

/**
 * Modifier keys.
 */