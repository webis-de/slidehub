import { clamp } from '../util';
import { config } from '../config';

export { navigateDocument, getActiveDocument, setActiveDocument };

let activeDocument;

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

  setActiveDocument(targetDoc);

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
 * Finds the position of the currently active document.
 *
 * @returns {number}
 */
function getDocumentPos() {
  return Array.from(getDocuments()).indexOf(getActiveDocument());
}

/**
 * Returns all SlideHub documents as a HTMLCollection.
 *
 * @returns {HTMLCollection}
 */
function getDocuments() {
  return getActiveDocument().parentElement.children;
}

/**
 * Returns the currently active document.
 *
 * @returns {Element}
 */
function getActiveDocument() {
  if (!activeDocument) {
    activeDocument = document.querySelector(config.selector.doc);
  }

  return activeDocument;
}

/**
 * Sets a new active document.
 *
 * @param {Element} doc
 */
function setActiveDocument(doc) {
  // Remove active class from currently active document
  if (activeDocument) {
    activeDocument.classList.remove('active');
  }

  // Set new active document
  activeDocument = doc;
  activeDocument.classList.add('active');
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}
