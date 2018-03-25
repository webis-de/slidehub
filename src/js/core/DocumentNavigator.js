import { clamp } from '../util/clamp';

export { DocumentNavigator };

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
   * @public
   */
  up(distance) {
    this.iterator = this.slidehub.documents.iteratorFor(this.slidehub.selectedDocument.name).reverse();
    this.by(distance);
  }

  /**
   * Navigate document down.
   *
   * @param {Number} distance
   * @public
   */
  down(distance) {
    this.iterator = this.slidehub.documents.iteratorFor(this.slidehub.selectedDocument.name);
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
    for (let i = 0; i < distance; i++) {
      iteratorResult = this.iterator.next();
      if (iteratorResult.done) {
        return;
      }
    }

    const targetDoc = iteratorResult.value[1];
    this.slidehub.selectDocument(targetDoc);
    this.scrollDocumentIntoView(targetDoc);
  }

  /**
   * @param {SlidehubDocument} doc
   */
  scrollDocumentIntoView(doc) {
    const offset = this.getVerticalOffsets(doc.node);
    const extraPart = doc.node.clientHeight / 2;
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
   * @returns {SlidehubDocument}
   */
  getTargetDoc(distance) {
    const documentNodes = this.getDocumentNodes();
    const targetDocumentPos = clamp(this.selectedDocPos + distance, 0, documentNodes.length - 1);
    const targetDocumentNode = documentNodes.item(targetDocumentPos);

    return this.slidehub.documents.get(targetDocumentNode.id);
  }

  /**
   * Returns an object containing vertical offsets for an element with the
   * viewport.
   *
   * @param {HTMLElement} element
   * @returns {object}
   */
  getVerticalOffsets(element) {
    const docEl = document.documentElement;
    return {
      top: element.offsetTop - window.scrollY,
      bottom: window.scrollY + docEl.clientHeight - (element.offsetTop + element.offsetHeight)
    };
  }

  /**
   * Returns all Slidehub documents as a HTMLCollection.
   *
   * @returns {HTMLCollection}
   */
  getDocumentNodes() {
    return this.slidehub.selectedDocument.node.parentElement.children;
  }
};
