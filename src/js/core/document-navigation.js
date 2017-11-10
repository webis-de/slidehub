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

  const offset = getVerticalOffsets(targetDoc);
  const extraPart = targetDoc.clientHeight / 2;
  if (offset.top < 0) {
    window.scrollBy(0, -(Math.abs(offset.top) + extraPart));
  } else if (offset.bottom < 0) {
    window.scrollBy(0, Math.abs(offset.bottom) + extraPart);
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

function getVerticalOffsets(element) {
  const docEl = document.documentElement;
  return {
    top: element.offsetTop - window.scrollY,
    bottom: window.scrollY + docEl.clientHeight - (element.offsetTop + element.offsetHeight)
  };
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
