import { clamp } from '../util';
import { config } from '../config';

export {
  navigateDocument,
  getSelectedDocument,
  selectDocument,
  getHighlightedDocument,
  highlightDocument
};

/**
 * Navigates through documents in a certain direction.
 *
 * @param {number} direction
 */
function navigateDocument(direction) {
  const targetDoc = getTargetDoc(direction);

  if (targetDoc === null) {
    return;
  }

  selectDocument(targetDoc);

  const offset = getVerticalOffsets(targetDoc);
  const extraPart = targetDoc.clientHeight / 2;
  if (offset.top < 0) {
    window.scrollBy(0, -(Math.abs(offset.top) + extraPart));
  } else if (offset.bottom < 0) {
    window.scrollBy(0, Math.abs(offset.bottom) + extraPart);
  }
}

/**
 * Finds the target document given a navigation distance.
 *
 * @param {number} distance
 * @returns {HTMLElement}
 */
function getTargetDoc(distance) {
  const currentIndex = getDocumentPos();
  const docs = getDocuments();
  const targetIndex = clamp(currentIndex + distance, 0, docs.length - 1);

  return docs.item(targetIndex);
}

/**
 * Returns an object containing vertical offsets for an element with the
 * viewport.
 *
 * @param {HTMLElement} element
 * @returns {object}
 */
function getVerticalOffsets(element) {
  const docEl = document.documentElement;
  return {
    top: element.offsetTop - window.scrollY,
    bottom: window.scrollY + docEl.clientHeight - (element.offsetTop + element.offsetHeight)
  };
}

/**
 * Finds the position of the currently selected document.
 *
 * @returns {number}
 */
function getDocumentPos() {
  return Array.from(getDocuments()).indexOf(getSelectedDocument());
}

/**
 * Returns all SlideHub documents as a HTMLCollection.
 *
 * @returns {HTMLCollection}
 */
function getDocuments() {
  return getSelectedDocument().parentElement.children;
}

const selectClassName = 'selected';

/**
 * Returns the currently selected document.
 *
 * @returns {Element}
 */
function getSelectedDocument() {
  return document.querySelector(`${config.selector.doc}.${selectClassName}`);
}

/**
 * Sets a new selected document.
 *
 * @param {Element} doc
 */
function selectDocument(doc) {
  const selectedDocument = getSelectedDocument();
  // Remove selected class from currently selected document
  if (selectedDocument) {
    selectedDocument.classList.remove(selectClassName);
  }

  // Set new selected document
  doc.classList.add(selectClassName);

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

const highlightClassName = 'highlighted';

/**
 * Returns the currently highlighted document.
 *
 * @returns {Element}
 */
function getHighlightedDocument() {
  return document.querySelector(`${config.selector.doc}.${highlightClassName}`);
}

/**
 * Sets a new highlighted document.
 *
 * @param {Element} doc
 */
function highlightDocument(doc) {
  const highlightedDocument = getHighlightedDocument();
  // Remove highlighted class from currently highlighted document
  if (highlightedDocument) {
    highlightedDocument.classList.remove(highlightClassName);
  }

  // Set new highlighted document
  doc.classList.add(highlightClassName);

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}
