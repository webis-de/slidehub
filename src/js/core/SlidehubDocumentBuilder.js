import { config } from '../config';
import { getFloatPropertyValue } from '../util/get-float-property-value';

export { SlidehubDocumentBuilder };

/**
 * Document Loader.
 *
 * Loads documents dynamically when needed.
 */
class SlidehubDocumentBuilder {
  constructor(slidehub) {
    this._slidehub = slidehub;
    this.batchSize = 5;
    this.prevIterator = null;
    this.nextIterator = null;
    this.observer = new IntersectionObserver(this.documentObservationHandler.bind(this));

    this.classes = {
      doc: config.selector.doc.slice(1),
      scrollbox: config.selector.scrollbox.slice(1),
      itemContainer: config.selector.itemContainer.slice(1),
      item: config.selector.item.slice(1)
    };
  }

  get slidehub() {
    return this._slidehub;
  }

  build() {
    this.insertDocumentFrames();

    this.loadTargetDocument();

    // Load one batch in both directions
    this.loadBatch(this.nextIterator, 'beforeend', this.batchSize);
    this.loadBatch(this.prevIterator, 'afterbegin', this.batchSize);
  }

  /**
   * Prepares the DOM with empty frames for all documents.
   *
   * @private
   */
  insertDocumentFrames() {
    let documentFramesMarkup = '';

    for (const doc of this.slidehub.documents.values()) {
      const documentSource = `${config.assets.documents}/${doc.name}`;
      documentFramesMarkup += `<div
        class="${this.classes.doc}"
        id="${doc.name}"
        data-doc-source="${documentSource}"
        style="--pages: ${doc.imageCount + (config.metaSlide ? 1 : 0)}"
      ></div>`;
    }

    this.slidehub.node.insertAdjacentHTML('beforeend', documentFramesMarkup);
  }

  /**
   * Starts off the document loading process. Determines which document should be
   * loaded and sets up two iterators. They will be used to load new documents
   * when needed.
   *
   * @returns {SlidehubDocument}
   */
  loadTargetDocument() {
    const fragmentIdentifier = getFragmentIdentifier(window.location.toString());

    let documentName;

    if (this.slidehub.documents.has(fragmentIdentifier)) {
      // Prioritize the fragment identifier
      documentName = fragmentIdentifier;
    } else if (document.documentElement.scrollTop === 0) {
      // If the viewport was not scrolled already, just start from the top
      documentName = this.slidehub.documents.keys().next().value;
    } else {
      // The page was scrolled (e.g. the page was reloaded with a non-zero scroll position)
      // In this case, Slidehub attempts to load the document in the center of the view.
      const slidehubWidth = this.slidehub.node.clientWidth;
      const centerDocument = document.elementFromPoint(slidehubWidth / 2, window.innerHeight / 2);
      documentName = centerDocument.id;
    }

    // Obtain two iterators as pointers for which documents need to be
    // loaded next.
    this.prevIterator = this.slidehub.documents.iteratorFor(documentName).reverse();
    this.nextIterator = this.slidehub.documents.iteratorFor(documentName);

    // The target document will be loaded next by retrieving the iterator result
    // from nextIterator. Since prevIterator points to the same document, it
    // needs to be advanced manually, so it can’t be used to load that document
    // again.
    this.prevIterator.next();

    return this.loadInitialDocument(this.nextIterator.next(), this.slidehub.documents.has(fragmentIdentifier));
  }

  /**
   * Manages loading the very first Slidehub document.
   *
   * @param {IteratorResult} iteratorResult
   * @param {boolean} centerDocumentInView
   * @returns {SlidehubDocument}
   */
  loadInitialDocument(iteratorResult, centerDocumentInView) {
    const initialDocument = this.loadDocument(iteratorResult, 'beforeend');

    // selectDocument(initialDocument);
    this.slidehub.selectDocument(initialDocument);

    if (centerDocumentInView) {
      const documentHeight = getFloatPropertyValue(initialDocument.node, 'height');

      // After a short while, scroll the viewport to center the document
      // In the future, `Element.scrollIntoView({ block: 'center' })` should work
      setTimeout(() => window.scrollBy(0, -(window.innerHeight / 2 - documentHeight / 2)), 200);
    }

    return initialDocument;
  }

  /**
   * A wrapper for calling loadDocument multiple times.
   *
   * @param {IterableIterator} documentIterable
   * @param {'afterbegin'|'beforeend'} insertPosition
   * @param {number} batchSize
   */
  loadBatch(documentIterable, insertPosition, batchSize) {
    while (batchSize--) {
      this.loadDocument(documentIterable.next(), insertPosition);
    }
  }

  /**
   * Loads a new document by creating and injecting the markup into the DOM.
   * Once this is done, the document is marked as loaded.
   *
   * @param {IteratorResult} iteratorResult
   * @param {'afterbegin'|'beforeend'} insertPosition
   * @returns {SlidehubDocument}
   */
  loadDocument(iteratorResult, insertPosition) {
    if (iteratorResult.done) {
      return;
    }

    const doc = iteratorResult.value[1];
    if (doc.loaded) {
      console.warn(doc.name, 'was already loaded. Skipping.');
      return;
    }

    doc.insertPosition = insertPosition;
    if (doc.insertPosition === 'afterbegin') {
      doc.iterator = this.prevIterator;
    } else {
      doc.iterator = this.nextIterator;
    }

    console.info(`Loading ${doc.name}.`);

    doc.setNode(this.insertDocument(doc));

    // doc.selectItem(doc.node.querySelector(config.selector.item));

    this.observer.observe(doc.node);

    doc.loaded = true;
    doc.node.setAttribute('data-loaded', '');

    return doc;
  }

  /**
   * Inserts document markup into the DOM.
   *
   * @param {SlidehubDocument} doc
   */
  insertDocument(doc) {
    const innerDocumentMarkup = this.createDocumentMarkup(doc);
    const docNode = document.getElementById(doc.name);
    docNode.insertAdjacentHTML('beforeend', innerDocumentMarkup);

    return docNode;
  }

  /**
   * Creates the complete markup for a document under the following assumptions:
   * - A file named documentData.name exists on the document assets path
   * - The document’s item images are on the image assets path
   *
   * @param {SlidehubDocument} doc
   * @returns {string}
   */
  createDocumentMarkup(doc) {
    let items = '';
    for (var i = 0; i < doc.imageCount; i++) {
      const imageSource = `${config.assets.images}/${doc.name}-${i}.png`;
      items += `<div class="${this.classes.item}" data-page="${i + 1}">
        <img data-src="${imageSource}" alt="page ${i + 1}">
      </div>`;
    }

    const documentSource = `${config.assets.documents}/${doc.name}`;

    const metaSlide = `<div class="${this.classes.item} ${this.classes.item}--text" data-page="0">
      <div class="doc-meta">
        <h2 class="doc-meta__title">
          <a href="${documentSource}">${doc.name}</a>
        </h2>
        by author, ${doc.imageCount} pages, 2018
      </div>
    </div>`;

    const dummyPage = `<div
      class="${this.classes.item} dummy-page"
      aria-hidden="true"
      style="visibility: hidden;"
    ></div>`;

    return `<div class="${this.classes.scrollbox}">
      <div class="${this.classes.itemContainer}">
        ${config.metaSlide ? metaSlide : ''}
        ${items}
        ${dummyPage}
      </div>
    </div>`;
  }

  /**
   * Handles lazy-loading documents.
   *
   * @param {Array<IntersectionObserverEntry>} entries
   * @param {IntersectionObserver} observer
   */
  documentObservationHandler(entries, observer) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const documentData = this.slidehub.documents.get(entry.target.id);
        this.loadDocument(documentData.iterator.next(), documentData.insertPosition);

        observer.unobserve(entry.target);
      }
    }
  }
};

/**
 * Returns the fragment identifier of a URL if it is present.
 * Returns null if the fragment identifier is the empty string or if there is none.
 *
 * @param {string} url
 * @returns {string|null}
 */
function getFragmentIdentifier(url) {
  const hashPosition = url.indexOf('#');
  if (hashPosition > 0) {
    return url.substring(hashPosition + 1);
  }

  return null;
}
