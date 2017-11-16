/*
* Loads documents when needed.
*/

import { config } from '../config';
import { setActiveDocument } from './document-navigation';
import { setActiveItem, determineItemWidth } from './item-navigation';
import { getOuterWidth, getFloatPropertyValue } from '../util';
import { startImageObserver } from './image-loader';

export { DocumentLoader };

let slidehubContainer;

/*
Store often accessed properties once instead of recomputing them every time.
*/
const loaderSettings = {
  classes: {
    doc: config.selector.doc.slice(1),
    scrollbox: config.selector.scrollbox.slice(1),
    itemContainer: config.selector.itemContainer.slice(1),
    item: config.selector.item.slice(1)
  }
};

const DocumentLoader = {
  enable() {
    document.addEventListener('DOMContentLoaded', function() {
      createSlidehubContainer();
      startDocumentObservation();
    });
  }
};

/*
Hooks the Slidehub container element into the DOM.

Requires an element with a custom attribute `data-slidehub`. A new <div> element
will be created inside of it. No existing markup will be changed or removed.
*/
function createSlidehubContainer() {
  slidehubContainer = document.createElement('div');
  slidehubContainer.classList.add('slidehub-container');

  // Expose highlight color override to the DOM as a CSS custom property.
  // This allows CSS to use inside of a rule declaration.
  if (config.highlightColor && config.highlightColor !== '') {
    slidehubContainer.style.setProperty('--c-highlight', config.highlightColor);
  }

  document.querySelector('[data-slidehub]').appendChild(slidehubContainer);
}

function startDocumentObservation() {
  const observer = new IntersectionObserver(observationHandler, { threshold: 1 });

  loadDocuments().then(() => {
    const firstDoc = document.querySelector(config.selector.doc);
    setActiveDocument(firstDoc);
    determineItemWidth();

    observer.observe(slidehubContainer.lastElementChild);
  });
}

function observationHandler(entries, observer) {
  for (const entry of entries) {
    if (!entry.isIntersecting) {
      continue;
    }

    observer.unobserve(entry.target);

    loadDocuments()
      .then(() => {
        observer.observe(slidehubContainer.lastElementChild);
      })
      .catch(message => {
        console.info(message);

        if ('disconnect' in IntersectionObserver.prototype) {
          observer.disconnect();
        }
      });
  }
}

function loadDocuments() {
  const batchSize = 10;

  if (documentsData.length === 0) {
    return Promise.reject('No documents left to load.');
  }

  return loadBatch(batchSize).then(docs => {
    docs.forEach(docMarkup => onDocLoaded(docMarkup));
    console.info('Loaded document batch.');
  });
}

function loadBatch(batchSize) {
  const documents = [];

  for (let i = 0; i < batchSize && documentsData.length > 0; i++) {
    const data = documentsData.shift();
    const docName = data[0];
    const itemCount = data[1];

    if (itemCount === 0) {
      continue;
    }

    documents.push(createDocument(docName, itemCount));
  }

  return Promise.all(documents);
}

function createDocument(docName, itemCount) {
  let items = '';
  for (var i = 0; i < itemCount; i++) {
    const source = `${config.assets.images}/${docName}-${i}.png`;
    items += `
      <div class="${loaderSettings.classes.item}" data-page="${i + 1}">
        <img data-src="${source}" alt="page ${i + 1}">
      </div>
    `;
  }

  const docSource = `${config.assets.documents}/${docName}`;

  const metaSlide = `
    <div class="${loaderSettings.classes.item}" data-page="0">
      <div class="doc-meta">
        <h2 class="doc-meta__title">
          <a href="${docSource}">${docName}</a>
        </h2>
        by author, ${itemCount} pages, 2018
      </div>
    </div>
  `;

  return `
    <div
      class="${loaderSettings.classes.doc}"
      id="${docName.replace(/\.pdf$/, '')}"
      data-doc-source="${docSource}"
    >
      <div class="${loaderSettings.classes.scrollbox}">
        <div class="${loaderSettings.classes.itemContainer}">
          ${config.metaSlide ? metaSlide : ''}
          ${items}
        </div>
      </div>
    </div>
  `;
}

function onDocLoaded(docMarkup) {
  slidehubContainer.insertAdjacentHTML('beforeend', docMarkup);

  const doc = slidehubContainer.lastElementChild;
  setActiveItem(doc.querySelector(config.selector.item));
  startImageObserver(doc);
  setDocumentWidth(doc.querySelector(config.selector.itemContainer));
}

function setDocumentWidth(itemContainer) {
  const itemContainerWidth =
    getFloatPropertyValue(itemContainer, 'margin-left') +
    getFloatPropertyValue(itemContainer, 'border-left-width') +
    getOuterChildrenWidth(itemContainer) +
    getFloatPropertyValue(itemContainer, 'border-right-width') +
    getFloatPropertyValue(itemContainer, 'margin-right');

  itemContainer.style.setProperty('width', itemContainerWidth + 'px');
}

/*
* Computes the total outer width of an element by accumulating its children’s
* horizontal dimension property values (i.e. margin-left, width, margin-right)
*/
function getOuterChildrenWidth(element) {
  return Array.from(element.children).reduce((sum, child) => {
    return sum + getOuterWidth(child);
  }, 0);
}
