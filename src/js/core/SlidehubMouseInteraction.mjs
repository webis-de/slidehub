import { config } from '../config.mjs';
import { listener } from '../util/passive-event-listener.mjs';
import { debounce } from '../util/debounce.mjs';

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
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;

    this.initStoreMousePosition();
    this.initHoverDocumentOnScroll();
    this.initModifiers();

    this.slidehub.documents.forEach(doc => {
      if (doc.loaded) {
        this.initInteraction(doc);
      } else {
        doc.node.addEventListener('SlidehubDocumentContentLoaded', () => {
          this.initInteraction(doc);
        });
      }
    });
  }

  /**
   * Whenever the mouse moves, store its position.
   *
   * @private
   */
  initStoreMousePosition() {
    document.addEventListener('mousemove', this.storeMousePosition.bind(this), listener.passive);
  }

  /**
   * Stores the position of the mouse cursor.
   *
   * @param {MouseEvent} event
   * @private
   */
  storeMousePosition(event) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  /**
   * The firing rate of the listener needs to be slowed down because the
   * `scroll` event is rapidly firing. Not doing so will decrease the
   * performance significantly.
   *
   * It’s sufficient to debounce the listener. This means the listener will
   * be triggered **once** after the event has stopped firing.
   *
   * @private
   */
  initHoverDocumentOnScroll() {
    document.addEventListener(
      'scroll',
      debounce(this.handleScrollDocumentHover.bind(this), 25),
      listener.passive
    );
  }

  /**
   * @param {SlidehubDocument} doc
   * @private
   */
  initInteraction(doc) {
    this.initMouseInteraction(doc.node);
    this.initScrollInteraction(doc.scrollboxNode);
  }

  /**
   * Wrapper for initializing all event listeners related to mouse interaction.
   *
   * @param {HTMLElement} docNode
   * @private
   */
  initMouseInteraction(docNode) {
    docNode.addEventListener('wheel', this.handleWheelInteraction.bind(this), listener.active);
    docNode.addEventListener('click', this.handleClickSelect.bind(this), listener.passive);
    docNode.addEventListener('mousemove', this.handleMoveHover.bind(this), listener.passive);
  }

  /**
   * Wrapper for initializing all event listeners related to scroll interaction.
   *
   * @param {HTMLElement} scrollboxNode
   * @private
   */
  initScrollInteraction(scrollboxNode) {
    scrollboxNode.addEventListener(
      'scroll',
      debounce(this.handleScrollDocumentHover.bind(this), 25),
      listener.passive
    );
  }

  /**
   * Finds and hovers the item/document under the current mouse cursor position.
   * @private
   */
  handleScrollDocumentHover() {
    const targetElement = document.elementFromPoint(this.mouseX, this.mouseY);
    const docElement = targetElement.closest(config.selector.doc);

    if (!docElement) {
      return;
    }

    const doc = this.slidehub.documents.get(docElement.id);

    if (!doc.loaded) {
      return;
    }

    this.slidehub.hoverDocument(doc);

    const itemElement = targetElement.closest(config.selector.item);
    if (itemElement) {
      doc.hoverItem(itemElement);
    }
  }

  /**
   * Handles wheel navigation.
   *
   * @param {WheelEvent} event
   * @private
   */
  handleWheelInteraction(event) {
    // Don’t handle scrolling on elements that are not inside a document
    const doc = this.slidehub.documents.get(event.currentTarget.id);

    if (!doc.loaded) {
      return;
    }

    const ratio = Math.abs(event.deltaX / event.deltaY);
    const scrollingDirection = ratio < 1 ? scrolling.vertical : scrolling.horizontal;

    // When scrolling vertically, only trigger navigation when modifier is pressed
    if (scrollingDirection === scrolling.vertical && event.shiftKey) {
      // Prevent vertical scrolling
      event.preventDefault();

      const delta = event[scrollingDirection.delta];

      doc.navigateItem.by(Math.sign(delta));
    }
  }

  /**
   * Selects documents/items on click.
   *
   * @param {MouseEvent} event
   * @private
   */
  handleClickSelect(event) {
    const doc = this.slidehub.documents.get(event.currentTarget.id);

    if (!doc.loaded) {
      return;
    }

    this.slidehub.selectDocument(doc);

    if (config.keepSelectedPageInFirstColumn) {
      return;
    }

    const item = event.target.closest(config.selector.item);
    if (item) {
      doc.selectItem(item);
    }
  }

  /**
   * Highlights documents/items on hover.
   *
   * @param {MouseEvent} event
   * @private
   */
  handleMoveHover(event) {
    const doc = this.slidehub.documents.get(event.currentTarget.id);

    if (!doc.loaded) {
      return;
    }

    this.slidehub.hoverDocument(doc);

    const item = event.target.closest(config.selector.item);
    if (item) {
      doc.hoverItem(item);
    }
  }

  /**
   * Wrapper for enabling all event listeners related to modifier handling.
   *
   * @private
   */
  initModifiers() {
    document.addEventListener('keydown', this.onModifierDown.bind(this), listener.passive);
    document.addEventListener('keyup', this.onModifierUp.bind(this), listener.passive);
    window.addEventListener('blur', this.onModifierBlur.bind(this), listener.passive);
  }

  /**
   * Displays a special cursor when the modifier is pressed.
   *
   * @param {KeyboardEvent} event
   * @private
   */
  onModifierDown(event) {
    const doc = this.slidehub.hoveredDocument;
    if (doc && event.keyCode === 16) {
      doc.node.style.setProperty('cursor', 'ew-resize');
    }
  }

  /**
   * Removes the special cursor when the modifier is no longer pressed.
   *
   * @param {KeyboardEvent} event
   * @private
   */
  onModifierUp(event) {
    const doc = this.slidehub.hoveredDocument;
    if (doc && event.keyCode === 16) {
      doc.node.style.removeProperty('cursor');
    }
  }

  /**
   * Removes the special cursor when the user somehow leaves the page.
   *
   * @private
   */
  onModifierBlur() {
    const doc = this.slidehub.hoveredDocument;
    if (doc) {
      doc.node.style.removeProperty('cursor');
    }
  }
};

export { SlidehubMouseInteraction };
