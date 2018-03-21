/**
 * Loads document images when needed (i.e. lazy-loading).
 */

import { config } from '../config';

export { loadImages };

let imageObserver;

const imageObserverOptions = {
  rootMargin: '500px 1000px'
};

const mutationObserverOptions = {
  childList: true
};

/**
 *
 * @param {HTMLElement} slidehubNode
 */
function loadImages(slidehubNode) {
  if ('IntersectionObserver' in window) {
    imageObserver = new IntersectionObserver(imageLoadHandler, imageObserverOptions);

    observeExistingDocuments(slidehubNode);
    observeNewDocuments(slidehubNode);
  } else {
    const images = Array.from(slidehubNode.querySelectorAll('img[data-src]'));
    images.forEach(image => loadImage(image));
  }
}

/**
 *
 * @param {HTMLElement} slidehubNode
 */
function observeExistingDocuments(slidehubNode) {
  const documents = Array.from(slidehubNode.querySelectorAll(config.selector.doc));
  documents.forEach(doc => startImageObserver(doc));
}

/**
 *
 * @param {HTMLElement} slidehubNode
 */
function observeNewDocuments(slidehubNode) {
  const mutationObserver = new MutationObserver(mutationHandler);

  const documents = Array.from(slidehubNode.querySelectorAll(config.selector.doc));
  documents.forEach(doc => mutationObserver.observe(doc, mutationObserverOptions));
}

/**
 *
 * @param {*} mutationsList
 */
function mutationHandler(mutationsList) {
  for (const mutation of mutationsList) {
    if (mutation.addedNodes.length !== 0) {
      startImageObserver(mutation.target);
    }
  }
}

/**
 * Handles lazy-loading document images.
 *
 * @param {*} entries
 * @param {IntersectionObserver} observer
 */
function imageLoadHandler(entries, observer) {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      loadImage(entry.target);
      observer.unobserve(entry.target);
    }
  }
}

/**
 * Replaces the data-src attribute with the src attribute, causing the browser to load the image.
 *
 * @param {HTMLImageElement} image
 */
function loadImage(image) {
  if (!image.dataset.src) {
    console.error('Couldn’t load image due to missing data-src attribute.', image);
    return;
  }

  image.setAttribute('src', image.dataset.src);
  image.removeAttribute('data-src');
  image.addEventListener('load', () => handleItemImageLoaded(image));
}

/**
 * Plain wrapper for triggering certain actions once an image has loaded.
 *
 * @param {HTMLImageElement} image
 */
function handleItemImageLoaded(image) {
  if (config.preserveAspectRatio) {
    setItemAspectRatio(image);
  }
}

/**
 * Calculates the aspect ratio of an image and stores it in the DOM as a
 * custom CSS property.
 *
 * @param {HTMLImageElement} image
 */
function setItemAspectRatio(image) {
  const doc = image.closest(config.selector.doc);

  if (doc && !doc.style.cssText.includes('--page-aspect-ratio')) {
    const aspectRatio = image.naturalWidth / image.naturalHeight;
    doc.style.setProperty('--page-aspect-ratio', aspectRatio.toString());
  }
}

/**
 * Starts the image observer on all lazy-loading images.
 *
 * @param {HTMLElement} doc
 */
function startImageObserver(doc) {
  const images = Array.from(doc.querySelectorAll('img[data-src]'));
  images.forEach(image => imageObserver.observe(image));
}
