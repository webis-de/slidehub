import { clamp } from '../util';

export { navigateDocument, getActiveDocument, setActiveDocument };

let activeDocument;

/*
Navigates through documents in a certain direction.
*/
function navigateDocument(direction) {
  const targetDoc = getTargetDoc(direction);

  if (targetDoc === null) {
    return;
  }

  setActiveDocument(targetDoc);

  const offset = getOutOfViewportOffset(targetDoc, direction);
  if (offset < 0) {
    // The missing part is indicated by a negative value, so we need to flip it
    const missingPart = -offset;
    // Adding a little extra so a new document is already partially visisble
    const extraPart = targetDoc.clientHeight / 2;
    window.scrollBy(0, Math.sign(direction) * (missingPart + extraPart));
  }
}

function getTargetDoc(distance) {
  const docs = getDocuments();
  const currentIndex = getDocumentPos();
  const targetIndex = clamp(currentIndex + distance, 0, docs.length - 1);
  return docs[targetIndex];
}

function getDocumentPos() {
  return Array.from(getDocuments()).indexOf(getActiveDocument());
}

function getDocuments() {
  return getActiveDocument().parentElement.children;
}

function getOutOfViewportOffset(element, direction) {
  if (direction < 0) {
    return element.offsetTop - window.scrollY;
  } else {
    const viewportOffsetBot = window.scrollY + document.documentElement.clientHeight;
    const elOffsetBot = element.offsetTop + element.offsetHeight;
    return viewportOffsetBot - elOffsetBot;
  }
}

function getActiveDocument() {
  return activeDocument;
}

function setActiveDocument(doc) {
  // Remove active class from currently active document
  if (activeDocument) {
    activeDocument.classList.remove('active');
  }

  // Set new active document
  activeDocument = doc;
  activeDocument.classList.add('active');
  document.activeElement.blur();
}
