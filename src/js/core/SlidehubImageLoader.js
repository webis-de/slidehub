import { config } from '../config';

export { SlidehubImageLoader };

/**
 * Loads document images when needed (i.e. lazy-loading).
 */
class SlidehubImageLoader {
  constructor(slidehub) {
    this.slidehub = slidehub;
    this.imageObserver = null;

    if ('IntersectionObserver' in window) {
      const imageObserverOptions = {
        root: slidehub.node,
        rootMargin: '500px 1000px'
      };

      this.imageObserver = new IntersectionObserver(imageObservationHandler, imageObserverOptions);
    }
  }

  start() {
    if (this.imageObserver) {
      this.observeExistingDocuments();
      this.observeNewDocuments();
    } else {
      const images = Array.from(this.slidehub.node.querySelectorAll('img[data-src]'));
      images.forEach(image => loadImage(image));
    }
  }

  /**
   *
   */
  observeExistingDocuments() {
    const documentNodes = Array.from(this.slidehub.node.querySelectorAll(config.selector.doc));
    documentNodes.forEach(docNode => this.startImageObserver(docNode));
  }

  /**
   * Starts the image observer on all lazy-loading images.
   *
   * @param {HTMLElement} docNode
   */
  startImageObserver(docNode) {
    const images = Array.from(docNode.querySelectorAll('img[data-src]'));
    images.forEach(image => this.imageObserver.observe(image));
  }

  /**
   *
   */
  observeNewDocuments() {
    const mutationObserverOptions = {
      childList: true
    };

    const mutationObserver = new MutationObserver(this.mutationHandler.bind(this));

    const documentNodes = Array.from(this.slidehub.node.querySelectorAll(config.selector.doc));
    documentNodes.forEach(docNode => {
      mutationObserver.observe(docNode, mutationObserverOptions);
    });
  }

  /**
   *
   * @param {*} mutationsList
   */
  mutationHandler(mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.addedNodes.length !== 0) {
        this.startImageObserver(mutation.target);
      }
    }
  }
};

/**
 * Handles lazy-loading document images.
 *
 * @param {*} entries
 * @param {IntersectionObserver} observer
 */
function imageObservationHandler(entries, observer) {
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
  const docNode = image.closest(config.selector.doc);

  if (docNode && !docNode.style.cssText.includes('--page-aspect-ratio')) {
    const aspectRatio = image.naturalWidth / image.naturalHeight;
    docNode.style.setProperty('--page-aspect-ratio', aspectRatio.toString());
  }
}
