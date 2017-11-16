/*
* Loads documents when needed.
*/

import { config } from '../config';
import { setActiveDocument } from './document-navigation';
import { setActiveItem, determineItemWidth } from './view-navigation';
import { getOuterWidth, getFloatPropertyValue } from '../util';
import { startImageObserver } from './image-loader';

export { DocumentLoader };

let slidehubContainer;

const DocumentLoader = {
  enable() {
    document.addEventListener('DOMContentLoaded', function() {
      createSlidehubContainer();
      const documentObserver = new IntersectionObserver(documentObserverHandler, { threshold: 1 });

      loadDocuments().then(() => {
        const firstView = document.querySelector(config.selector.view);
        setActiveDocument(firstView);
        determineItemWidth();

        documentObserver.observe(slidehubContainer.lastElementChild);
      });
    });
  }
};

function createSlidehubContainer() {
  slidehubContainer = document.createElement('div');
  slidehubContainer.classList.add('slidehub-container');

  if (config.highlightColor && config.highlightColor !== '') {
    slidehubContainer.style.setProperty('--c-highlight', config.highlightColor);
  }

  document.querySelector('[data-slidehub]').appendChild(slidehubContainer);
}

function documentObserverHandler(entries, observer) {
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
        } else {
          console.error('IntersectionObserver.disconnect not available.');
        }
      });
  }
}

function loadDocuments() {
  const batchSize = 10;

  if (documentsData.length === 0) {
    return Promise.reject('No documents left to load.');
  }

  return loadDocumentBatch(batchSize).then(docs => {
    console.info('Loaded document batch.');
    docs.forEach(doc => onDocumentLoaded(doc));
  });
}

function loadDocumentBatch(batchSize) {
  const documents = [];

  for (let i = 0; i < batchSize && documentsData.length > 0; i++) {
    const data = documentsData.shift();
    documents.push(createDocument(data[0], data[1]));
  }

  return Promise.all(documents);
}

function onDocumentLoaded(doc) {
  slidehubContainer.insertAdjacentHTML('beforeend', doc);

  const view = slidehubContainer.lastElementChild;
  setActiveItem(view.querySelector(config.selector.item));
  startImageObserver(view);
  setDocumentWidth(view.querySelector(config.selector.doc));
}

function createDocument(docName, itemCount) {
  return new Promise((resolve, reject) => {
    let items = '';
    for (var i = 0; i < itemCount; i++) {
      const source = `${config.assets.images}/${docName}-${i}.png`;
      items += `
        <div class="${config.selector.item.slice(1)}" data-page="${i + 1}">
          <img data-src="${source}" alt="page ${i + 1}">
        </div>
      `;
    }

    const docSource = `${config.assets.documents}/${docName}`;

    const metaSlide = `
      <div class="${config.selector.item.slice(1)}" data-page="0">
        <div class="doc-meta">
          <h2 class="doc-meta__title">
            <a href="${docSource}">${docName}</a>
          </h2>
          by author, ${itemCount} pages, 2018
        </div>
      </div>
    `;

    const docMarkup = `
      <div
        class="${config.selector.view.slice(1)}"
        id="${docName.replace(/\.pdf$/, '')}"
        data-doc-source="${docSource}"
      >
        <div class="doc-scrollbox">
          <div class="${config.selector.doc.slice(1)}">
            ${config.metaSlide ? metaSlide : ''}
            ${items}
          </div>
        </div>
      </div>
    `;

    resolve(docMarkup);
  });
}

function setDocumentWidth(doc) {
  const documentOuterWidth =
    getFloatPropertyValue(doc, 'margin-left') +
    getFloatPropertyValue(doc, 'border-left-width') +
    getOuterChildrenWidth(doc) +
    getFloatPropertyValue(doc, 'border-right-width') +
    getFloatPropertyValue(doc, 'margin-right');

  doc.style.setProperty('width', documentOuterWidth + 'px');
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
