/*
* Loads document images when needed (i.e. lazy-loading).
*/

import { config } from '../config';

export { ImageLoader, startImageObserver };

let imageObserver;

const observerOptions = {
  rootMargin: `500px 1000px`
};

const ImageLoader = {
  enable() {
    initialize();
  }
};

/*
* Observes document views in order to load their item images only when
* they’re visible.
*/
function initialize() {
  imageObserver = new IntersectionObserver(imageLoadHandler, observerOptions);
}

function imageLoadHandler(entries, observer) {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const image = entry.target;
      image.setAttribute('src', image.getAttribute('data-src'));
      image.removeAttribute('data-src');

      image.addEventListener('load', () => handleItemImageLoaded(image));

      // Unobserve the current target because no further action is required
      observer.unobserve(image);
    }
  }
}

function handleItemImageLoaded(image) {
  if (config.preserveAspectRatio) {
    const view = image.closest(config.selector.view);
    setItemAspectRatio(view, image);
  }
}

function setItemAspectRatio(view, image) {
  if (!view.style.cssText.includes('--page-aspect-ratio')) {
    const aspectRatio = image.naturalWidth / image.naturalHeight;
    view.style.setProperty('--page-aspect-ratio', aspectRatio);
  }
}

function startImageObserver(view) {
  if (imageObserver) {
    const images = view.querySelectorAll('img[data-src]');
    images.forEach(image => imageObserver.observe(image));
  }
}
