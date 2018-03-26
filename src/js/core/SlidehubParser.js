/**
 * Parses the document data.
 */

import { config } from '../config';
import { documentsData } from '../documents-data';
import { ReverseIterableMap } from '../lib/reverse-iterable-map';
import { SlidehubDocument } from './SlidehubDocument';

export { parseDocumentsData, parseDocumentsMarkup };

/**
 * Parses the initial document data into a more managable data structure.
 * The resulting structure keeps track of a documents’ loaded state.
 *
 * @param {Slidehub} slidehub
 * @returns {ReverseIterableMap}
 */
function parseDocumentsData(slidehub) {
  const documents = new ReverseIterableMap();

  documentsData.forEach(([name, imageCount]) => {
    const doc = new SlidehubDocument(slidehub, name, imageCount);
    documents.set(doc.name, doc);
  });

  return documents;
}

/**
 * @param {Slidehub} slidehub
 * @returns {ReverseIterableMap}
 */
function parseDocumentsMarkup(slidehub) {
  const documents = new ReverseIterableMap();

  const documentNodes = slidehub.node.querySelectorAll(config.selector.doc);
  documentNodes.forEach(docNode => {
    const imageCount = docNode.querySelectorAll('img').length - 1;
    const doc = new SlidehubDocument(slidehub, docNode.id, imageCount);
    doc.setNode(docNode);
    documents.set(doc.name, doc);
  });

  return documents;
}
