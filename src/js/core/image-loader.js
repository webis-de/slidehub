/**
 * Loads document images when needed (i.e. lazy-loading).
 */

import { config } from '../config';

export { ImageLoader, startImageObserver };

let imageObserver;

const observerOptions = {
  rootMargin: '500px 1000px'
};

const ImageLoader = {
  enable() {
    if ('IntersectionObserver' in window) {
      imageObserver = new IntersectionObserver(imageLoadHandler, observerOptions);
    }
  }
};

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
  if (imageObserver) {
    images.forEach(image => imageObserver.observe(image));
  } else {
    images.forEach(image => loadImage(image));
  }
}
