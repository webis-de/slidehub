export { navigateDocument, getActiveDocument, setActiveDocument };

let activeDocument;

/*
Navigates through documents in a certain direction.
*/
function navigateDocument(direction) {
  // Choose `nextElementSibling` or `previousElementSibling` based on direction
  const prop = direction < 0 ? 'previousElementSibling' : 'nextElementSibling';
  const targetDoc = getActiveDocument()[prop];

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
    window.scrollBy(0, direction * (missingPart + extraPart));
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

function getOutOfViewportOffset(doc, direction) {
  const documentEl = document.documentElement;

  if (direction < 0) {
    const viewportOffsetTop = window.scrollY;
    return doc.offsetTop - viewportOffsetTop;
  } else {
    const viewportOffsetBot = window.scrollY + documentEl.clientHeight;
    const docOffsetBot = doc.offsetTop + doc.offsetHeight;
    return viewportOffsetBot - docOffsetBot;
  }
}
