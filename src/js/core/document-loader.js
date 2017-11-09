/*
* Loads documents when needed.
*/

import { config } from '../config';
import { setActiveDocument } from './document-navigation';
import { getComputedOuterChildrenWidth, getOuterWidth, getFloatPropertyValue } from '../util';
import { startImageObserver } from './image-loader';

export const DocumentLoader = {
  enable() {
    document.addEventListener('DOMContentLoaded', function() {
      const documentObserver = new IntersectionObserver(documentObserverHandler, { threshold: 1 });

      loadDocuments().then(() => {
        const firstView = document.querySelector(config.selector.view);
        setActiveDocument(firstView);
        evaluateItemWidth();

        const container = document.querySelector(config.selector.main);
        documentObserver.observe(container.lastElementChild);
      });
    });
  }
};

function documentObserverHandler(entries, observer) {
  for (const entry of entries) {
    if (!entry.isIntersecting) {
      continue;
    }

    observer.unobserve(entry.target);

    // add loading indicator

    loadDocuments()
      .then(() => {
        // remove loading indicator
        const container = document.querySelector(config.selector.main);
        observer.observe(container.lastElementChild);
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
  const container = document.querySelector(config.selector.main);

  if (documentsData.length === 0) {
    return Promise.reject('No documents left to load.');
  }

  return loadDocumentBatch(batchSize).then(docs => {
    console.info('Loaded document batch.');
    docs.forEach(doc => onDocumentLoaded(container, doc));
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

function onDocumentLoaded(container, doc) {
  container.insertAdjacentHTML('beforeend', doc);

  const view = container.lastElementChild;
  startImageObserver(view);
  setDocumentWidth(view.querySelector(config.selector.doc));
}

function createDocument(docName, itemCount) {
  return new Promise((resolve, reject) => {
    let items = '';
    for (var i = 0; i < itemCount; i++) {
      const source = `${config.assetPath}/${docName}-${i}.png`;
      items += `
        <div class="${config.selector.item.slice(1)}" data-page="${i + 1}">
          <img data-src="${source}" alt="page ${i + 1}">
        </div>
      `;
    }

    const docSource = `${config.assetPath}/${docName}`;

    const docMarkup = `
      <div
        class="${config.selector.view.slice(1)}"
        id="${docName}"
        data-doc-source="${docSource}"
        data-page-count="${itemCount + 1}">
        <div class="doc-scrollbox">
          <div class="${config.selector.doc.slice(1)}">
            <div class="${config.selector.item.slice(1)} active" data-page="0">
              <div class="doc-meta">
                <h2 class="doc-meta__title">
                  <a href="${docSource}">${docName}</a>
                </h2>
                by author, ${itemCount} pages, 2018
              </div>
            </div>
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
    getComputedOuterChildrenWidth(doc) +
    getFloatPropertyValue(doc, 'border-right-width') +
    getFloatPropertyValue(doc, 'margin-right');

  doc.style.setProperty('width', documentOuterWidth + 'px');
}

function evaluateItemWidth() {
  const itemSample = document.querySelector(config.selector.item);
  const itemOuterWidth = getOuterWidth(itemSample);

  if (itemOuterWidth !== config.itemWidth) {
    console.info(
      'Pre-configured page width does not match actual page width.',
      'Updating configuration.'
    );
    config.itemWidth = itemOuterWidth;
  }
}
