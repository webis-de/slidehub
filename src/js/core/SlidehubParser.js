/**
 * Parses the document data.
 */

import { config } from '../config';
import { LinkedMap } from '../util/linked-map';
import { SlidehubDocument } from './SlidehubDocument';

export { parseDocumentsData, parseDocumentsMarkup };

/**
 * Parses the initial document data into a more managable data structure.
 * The resulting structure keeps track of a documents’ loaded state.
 *
 * @param {Slidehub} slidehub
 * @param {Array<[string, number]>} documentsData
 * @returns {LinkedMap}
 */
function parseDocumentsData(slidehub, documentsData) {
  const documents = new LinkedMap();

  documentsData.forEach(([name, imageCount]) => {
    const doc = new SlidehubDocument(slidehub, name, imageCount);
    documents.set(doc.name, doc);
  });

  return documents;
}

/**
 * @param {Slidehub} slidehub
 * @returns {LinkedMap}
 */
function parseDocumentsMarkup(slidehub) {
  const documents = new LinkedMap();

  const documentNodes = slidehub.node.querySelectorAll(config.selector.doc);
  documentNodes.forEach(docNode => {
    const imageCount = docNode.querySelectorAll('img').length - 1;
    const doc = new SlidehubDocument(slidehub, docNode.id, imageCount);
    doc.setNode(docNode);
    documents.set(doc.name, doc);
  });

  return documents;
}
