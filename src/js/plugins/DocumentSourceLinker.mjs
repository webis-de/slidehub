import { SlidehubPlugin } from '../core/SlidehubPlugin.mjs';
import { config } from '../config.mjs';

/**
 * Item Linking.
 *
 * Opens the document source (e.g. a PDF document) by pressing <kbd>Enter</kbd>
 * or double-clicking with a pointer device.
 */
class DocumentSourceLinker extends SlidehubPlugin {
  constructor(slidehub) {
    const description = 'Links documents to their source document';
    super(slidehub, 'DocumentSourceLinker', description);

    this.boundEnterHandler = this.enterHandler.bind(this);
    this.boundDoubleClickHandler = this.doubleClickHandler.bind(this);
  }

  enable() {
    document.addEventListener('keydown', this.boundEnterHandler, { passive: true });
    document.addEventListener('dblclick', this.boundDoubleClickHandler, { passive: true });
    super.enable();
  }

  disable() {
    document.removeEventListener('keydown', this.boundEnterHandler);
    document.removeEventListener('dblclick', this.boundDoubleClickHandler);
    super.disable();
  }

  /**
   * @param {KeyboardEvent} event
   */
  enterHandler(event) {
    if (event.keyCode !== 13) {
      return;
    }

    // Focusable elements have a default behavior (e.g. activating a link)
    // That behavior shall not be altered/extended.
    if (isInteractive(document.activeElement)) {
      return;
    }

    const openInNewTab = event.ctrlKey;
    const doc = this.slidehub.selectedDocument;
    DocumentSourceLinker.openDocumentSource(doc.node, doc.selectedItemNode, openInNewTab);
  }

  /**
   * @param {MouseEvent} event
   */
  doubleClickHandler(event) {
    if (event.button !== 0) {
      return;
    }

    const itemNode = event.target.closest(config.selector.item);

    if (itemNode === null) {
      return;
    }

    const docNode = itemNode.closest(config.selector.doc);
    if (docNode) {
      const openInNewTab = true;
      DocumentSourceLinker.openDocumentSource(docNode, itemNode, openInNewTab);
    }
  }

  /**
   * Opens the document source for the current selected document in the browser.
   *
   * @param {HTMLElement} docNode
   * @param {HTMLElement} item
   * @param {boolean} openInNewTab
   */
  static openDocumentSource(docNode, item, openInNewTab) {
    const itemIndex = item.dataset.page;
    const fragment = itemIndex !== '0' ? `#page=${itemIndex}` : '';
    const itemSource = docNode.dataset.docSource + fragment;

    if (openInNewTab) {
      window.open(itemSource);
    } else {
      window.location.href = itemSource;
    }
  }
};

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

export { DocumentSourceLinker };
