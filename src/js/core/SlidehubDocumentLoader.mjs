/**
 * Document Loader.
 *
 * Loads documents dynamically when needed.
 */
class SlidehubDocumentLoader {
  constructor(slidehub) {
    this.slidehub = slidehub;
    this.batchSize = 5;
    this.prevIterator = null;
    this.nextIterator = null;
    this.observer = new IntersectionObserver(this.documentObservationHandler.bind(this));

    this.loadTargetDocument();

    // Load one batch in both directions
    this.loadBatch(this.nextIterator, 'beforeend', this.batchSize);
    this.loadBatch(this.prevIterator, 'afterbegin', this.batchSize);
  }

  /**
   * Starts off the document loading process. Determines which document should be
   * loaded and sets up two iterators. They will be used to load new documents
   * when needed.
   */
  loadTargetDocument() {
    // Obtain two iterators as pointers for which documents need to be
    // loaded next.
    const targetDocument = this.slidehub.targetDocument;
    this.prevIterator = this.slidehub.documents.iteratorFor(targetDocument.name).reverseIterator();
    this.nextIterator = this.slidehub.documents.iteratorFor(targetDocument.name);

    // The target document will be loaded next by retrieving the iterator result
    // from nextIterator. Since prevIterator points to the same document, it
    // needs to be advanced manually, so it can’t be used to load that document
    // again.
    this.prevIterator.next();

    this.loadDocument(this.nextIterator.next(), 'beforeend');
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

    doc.load();

    this.observer.observe(doc.node);
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
        const doc = this.slidehub.documents.get(entry.target.id);
        this.loadDocument(doc.iterator.next(), doc.insertPosition);

        observer.unobserve(entry.target);
      }
    }
  }
};

export { SlidehubDocumentLoader };
