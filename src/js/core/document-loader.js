/**
 * Document Loader.
 *
 * Loads documents dynamically when needed.
 */

import { config } from '../config';
import { startImageObserver } from './image-loader';
import { selectDocument } from './document-navigation';
import { selectItem, storeItemOuterWidth, exposeScrollboxWidth } from './item-navigation';
import { LinkedMap, getFloatPropertyValue, getOuterWidth } from '../util';

export { DocumentLoader };

/**
 * @typedef {object} Store
 * @property {LinkedMap} documents
 * @property {IterableIterator} prevIterator
 * @property {IterableIterator} nextIterator
 * @property {IntersectionObserver} observer
 * @property {number} batchSize
 * @property {StorePropertyClasses} classes
 *
 * @typedef {object} StorePropertyClasses
 * @property {string} slidehub
 * @property {string} doc
 * @property {string} scrollbox
 * @property {string} itemContainer
 * @property {string} item
 *
 * @typedef {object} DocumentData
 * @property {string} name
 * @property {number} itemCount
 * @property {boolean} loaded
 */

/**
 * Store often accessed properties once instead of recomputing them every time.
 *
 * @type {Store}
 */
const store = {
  documents: null,

  // The two iterators that are used to load documents when the user moves up
  // or down.
  prevIterator: null,
  nextIterator: null,
  observer: new IntersectionObserver(documentObservationHandler),

  // Number of items surrounding a document that should be loaded once that
  // document is loaded.
  batchSize: 5,

  classes: {
    slidehub: config.selector.slidehub.slice(1),
    doc: config.selector.doc.slice(1),
    scrollbox: config.selector.scrollbox.slice(1),
    itemContainer: config.selector.itemContainer.slice(1),
    item: config.selector.item.slice(1)
  }
};

const DocumentLoader = {
  enable() {
    store.documents = parseDocumentsData(documentsData);

    document.addEventListener('DOMContentLoaded', function() {
      const slidehubContainer = createSlidehubContainer();
      insertDocumentFrames(slidehubContainer);

      const targetDoc = loadTargetDocument();
      exposeScrollboxWidth();
      storeItemOuterWidthInDOM(slidehubContainer, targetDoc);

      // Load one batch in both directions
      loadBatch(store.nextIterator, 'beforeend', store.batchSize);
      loadBatch(store.prevIterator, 'afterbegin', store.batchSize);
    });
  }
};

/**
 * Parses the initial document data into a more managable data structure.
 * The resulting structure keeps track of a documents’ loaded state.
 *
 * @param {Array<[string, number]>} documentsData
 * @return {LinkedMap}
 */
function parseDocumentsData(documentsData) {
  const documents = new LinkedMap();

  documentsData.forEach(([name, itemCount]) => {
    const value = {
      name,
      itemCount,
      loaded: false
    };

    documents.set(name, value);
  });

  return documents;
}

/**
 * Hooks the Slidehub container element into the DOM.
 *
 * Requires an element with a custom attribute `data-slidehub`. A new <div> element
 * will be created inside of it. No existing markup will be changed or removed.
 *
 * @returns {HTMLElement}
 */
function createSlidehubContainer() {
  const slidehubContainer = document.createElement('div');
  slidehubContainer.classList.add(store.classes.slidehub);

  // Expose highlight color override to the DOM as a CSS custom property.
  // This allows CSS to use inside of a rule declaration.
  if (config.selectColor && config.selectColor !== '') {
    slidehubContainer.style.setProperty('--c-selected', config.selectColor);
  }

  document.querySelector('[data-slidehub]').appendChild(slidehubContainer);

  return slidehubContainer;
}

/**
 * Prepares the DOM with empty frames for all documents.
 *
 * @param {HTMLElement} slidehubContainer
 */
function insertDocumentFrames(slidehubContainer) {
  let documentFramesMarkup = '';

  for (const documentData of store.documents.values()) {
    const documentSource = `${config.assets.documents}/${documentData.name}`;
    documentFramesMarkup += `
      <div
        class="${store.classes.doc}"
        id="${documentData.name}"
        data-doc-source="${documentSource}"
        style="--pages: ${documentData.itemCount + (config.metaSlide ? 1 : 0)}"
      >
      </div>
    `;
  }

  slidehubContainer.insertAdjacentHTML('beforeend', documentFramesMarkup);
}

/**
 * Starts off the document loading process. Determines which document should be
 * loaded and sets up two iterators. They will be used to load new documents
 * when needed.
 *
 * @returns {HTMLElement}
 */
function loadTargetDocument() {
  const documentName = determineTargetDocument();

  // Obtain two iterators as pointers for which documents need to be
  // loaded next.
  store.prevIterator = store.documents.iteratorFor(documentName).reverse();
  store.nextIterator = store.documents.iteratorFor(documentName);

  // The target document will be loaded next by retrieving the iterator result
  // from nextIterator. Since prevIterator points to the same document, it
  // needs to be advanced manually, so it can’t be used to load that document
  // again.
  store.prevIterator.next();

  return loadInitialDocument(store.nextIterator.next());
}

/**
 * Finds the name for the initial document that should be loaded.
 *
 * @return {string}
 */
function determineTargetDocument() {
  const fragmentIdentifier = getFragmentIdentifier(window.location.toString());
  if (store.documents.has(fragmentIdentifier)) {
    return fragmentIdentifier;
  }

  // Return key to first entry
  return store.documents.keys().next().value;
}

/**
 * Returns the fragment identifier of a URL if it is present.
 * Returns null if the fragment identifier is the empty string or if there is none.
 *
 * @param {string} url
 * @return {string|null}
 */
function getFragmentIdentifier(url) {
  const hashPosition = url.indexOf('#');
  if (hashPosition > 0) {
    return url.substring(hashPosition + 1);
  }

  return null;
}

/**
 * Manages loading the very first Slidehub document.
 *
 * @param {IteratorResult} iteratorResult
 * @returns {HTMLElement}
 */
function loadInitialDocument(iteratorResult) {
  const initialDocument = loadDocument(iteratorResult, 'beforeend');

  selectDocument(initialDocument);

  return initialDocument;
}

/**
 * A wrapper for calling loadDocument multiple times.
 *
 * @param {IterableIterator} documentIterable
 * @param {'afterbegin'|'beforeend'} insertPosition
 * @param {number} batchSize
 */
function loadBatch(documentIterable, insertPosition, batchSize) {
  while (batchSize--) {
    loadDocument(documentIterable.next(), insertPosition);
  }
}

/**
 * Loads a new document by creating and injecting the markup into the DOM.
 * Once this is done, the document is marked as loaded.
 *
 * @param {IteratorResult} iteratorResult
 * @param {'afterbegin'|'beforeend'} insertPosition
 */
function loadDocument(iteratorResult, insertPosition) {
  if (iteratorResult.done) {
    return;
  }

  const documentData = iteratorResult.value[1];
  if (documentData.loaded) {
    console.warn(documentData.name, 'was already loaded. Skipping.');
    return;
  }

  documentData.insertPosition = insertPosition;
  if (documentData.insertPosition === 'afterbegin') {
    documentData.iterator = store.prevIterator;
  } else {
    documentData.iterator = store.nextIterator;
  }

  console.log(`Loading ${documentData.name}.`);

  const doc = insertDocument(documentData);

  selectItem(doc, doc.querySelector(config.selector.item));
  startImageObserver(doc);

  store.observer.observe(doc);

  documentData.loaded = true;

  return doc;
}

/**
 * Inserts document markup into the DOM.
 *
 * @param {DocumentData} documentData
 */
function insertDocument(documentData) {
  const innerDocumentMarkup = createDocumentMarkup(documentData);
  const doc = document.getElementById(documentData.name);
  doc.insertAdjacentHTML('beforeend', innerDocumentMarkup);

  return doc;
}

/**
 * Computes and stores the outer width of items in the DOM in the form on a
 * custom property. This way, it is accessible from within CSS.
 *
 * TO DO: Check for box-sizing value and compute accordingly.
 *
 * @param {HTMLElement} slidehubContainer
 * @param {HTMLElement} doc
 */
function storeItemOuterWidthInDOM(slidehubContainer, doc) {
  const item = doc.querySelector(config.selector.item);
  const itemOuterWidth = getOuterWidth(item);

  storeItemOuterWidth(itemOuterWidth);

  slidehubContainer.style.setProperty('--page-outer-width', itemOuterWidth + 'px');
}

/**
 * Creates the complete markup for a document under the following assumptions:
 * - A file named documentData.name exists on the document assets path
 * - The document’s item images are on the image assets path
 *
 * @param {DocumentData} documentData
 * @return {string}
 */
function createDocumentMarkup(documentData) {
  let items = '';
  for (var i = 0; i < documentData.itemCount; i++) {
    const imageSource = `${config.assets.images}/${documentData.name}-${i}.png`;
    items += `
      <div class="${store.classes.item}" data-page="${i + 1}">
        <img data-src="${imageSource}" alt="page ${i + 1}">
      </div>
    `;
  }

  const documentSource = `${config.assets.documents}/${documentData.name}`;

  const metaSlide = `
    <div class="${store.classes.item}" data-page="0">
      <div class="doc-meta">
        <h2 class="doc-meta__title">
          <a href="${documentSource}">${documentData.name}</a>
        </h2>
        by author, ${documentData.itemCount} pages, 2018
      </div>
    </div>
  `;

  const dummyPage = `
    <div class="${store.classes.item} dummy-page" aria-hidden="true" style="visibility: hidden;">
    </div>
  `;

  return `
    <div class="${store.classes.scrollbox}">
      <div class="${store.classes.itemContainer}">
        ${config.metaSlide ? metaSlide : ''}
        ${items}
        ${dummyPage}
      </div>
    </div>
  `;
}

/**
 * Handles lazy-loading documents.
 *
 * @param {Array<IntersectionObserverEntry>} entries
 * @param {IntersectionObserver} observer
 */
function documentObservationHandler(entries, observer) {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const documentData = store.documents.get(entry.target.id);
      loadDocument(documentData.iterator.next(), documentData.insertPosition);

      observer.unobserve(entry.target);
    }
  }
}
