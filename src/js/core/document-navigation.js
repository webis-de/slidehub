export { navigateDocument, getActiveDocument, setActiveDocument };

let activeDocument;

/*
Navigates through documents in a certain direction.
*/
function navigateDocument(direction) {
  // Choose `nextElementSibling` or `previousElementSibling` based on direction
  const prop = `${direction < 0 ? 'previous' : 'next'}ElementSibling`;
  const targetDoc = getActiveDocument()[prop];

  if (targetDoc === null) {
    return;
  }

  setActiveDocument(targetDoc);

  const offset = getOutOfViewOffset(targetDoc, direction);
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

function setActiveDocument(view) {
  // Remove active class from currently active view
  if (activeDocument) {
    activeDocument.classList.remove('active');
  }

  // Set new active view
  activeDocument = view;
  activeDocument.classList.add('active');
  document.activeElement.blur();
}

function getOutOfViewOffset(doc, direction) {
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
