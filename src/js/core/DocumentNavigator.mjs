/**
 * Document Navigator.
 *
 * **Usage**:
 *
 * ```
 * const navigateDocument = new DocumentNavigator(slidehub);
 * navigateDocument.up(3);
 * navigateDocument.down(1);
 * ```
 */
class DocumentNavigator {
  /**
   * @param {Slidehub} slidehub
   * @public
   */
  constructor(slidehub) {
    this.slidehub = slidehub;
    this.iterator = null;
  }

  /**
   * Navigate document up (in reverse document loading order, if that makes sense).
   *
   * @param {Number} distance
   */
  up(distance) {
    const selectedDocumentName = this.slidehub.selectedDocument.name;
    this.iterator = this.slidehub.documents.iteratorFor(selectedDocumentName).reverse();
    this.by(distance);
  }

  /**
   * Navigate document down.
   *
   * @param {Number} distance
   */
  down(distance) {
    const selectedDocumentName = this.slidehub.selectedDocument.name;
    this.iterator = this.slidehub.documents.iteratorFor(selectedDocumentName);
    this.by(distance);
  }

  /**
   * Navigates through documents by a certain distance. With `distance = 3`,
   * two documents would be skipped, arriving at the third document.
   *
   * @param {number} distance
   * @private
   */
  by(distance) {
    this.iterator.next();

    let iteratorResult;
    let targetDoc;
    for (let i = 0; i < distance; i++) {
      iteratorResult = this.iterator.next();
      if (!iteratorResult.done) {
        targetDoc = iteratorResult.value[1];
      }
    }

    if (targetDoc !== undefined) {
      this.slidehub.selectDocument(targetDoc);
      this.scrollDocumentIntoView(targetDoc);
    }
  }

  /**
   * @param {SlidehubDocument} doc
   * @private
   */
  scrollDocumentIntoView(doc) {
    const offset = getVerticalOffsets(doc.node);
    const extraPart = doc.node.clientHeight / 2;
    if (offset.top < 0) {
      window.scrollBy(0, -(Math.abs(offset.top) + extraPart));
    } else if (offset.bottom < 0) {
      window.scrollBy(0, Math.abs(offset.bottom) + extraPart);
    }
  }


};

/**
 * Returns an object containing vertical offsets for an element with the
 * viewport.
 *
 * @param {HTMLElement} element
 * @returns {Object}
 */
function getVerticalOffsets(element) {
  const docEl = document.documentElement;
  return {
    top: element.offsetTop - window.scrollY,
    bottom: window.scrollY + docEl.clientHeight - (element.offsetTop + element.offsetHeight)
  };
}

export { DocumentNavigator };
