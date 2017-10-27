/*
* Loads document images when needed (i.e. lazy-loading).
*/

import { config } from '../config';

export { ImageLoader, observeView };

const ImageLoader = {
  enable() {
    initialize();
  }
};

let viewObserver;

/*
* Observes document views in order to load their item images only when
* they’re visible.
*/
function initialize() {
  const options = {
    rootMargin: `500px 0px`
  };

  viewObserver = new IntersectionObserver(viewObservationHandler, options);
}

function viewObservationHandler(entries, observer) {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const view = entry.target;
      const images = Array.from(view.querySelectorAll('img[data-src]'));
      // For each image …
      images.forEach(img => {
        // … swap out the `data-src` attribute with the `src` attribute.
        // This will start loading the images.
        if (img.hasAttribute('data-src')) {
          img.setAttribute('src', img.getAttribute('data-src'));
          img.removeAttribute('data-src');
        }
      });

      images[0].addEventListener('load', () => handleFirstItemImageLoaded(entry.target));

      // Unobserve the current target because no further action is required
      observer.unobserve(entry.target);
    }
  }
}

function handleFirstItemImageLoaded(view) {
  if (config.preserveAspectRatio) {
    setItemAspectRatio(view);
  }
}

function setItemAspectRatio(view) {
  const imgSample = view.querySelector(`${config.class.item} > img`);
  const aspectRatio = imgSample.naturalWidth / imgSample.naturalHeight;
  view.style.setProperty('--page-aspect-ratio', aspectRatio);
}

function observeView(view) {
  viewObserver.observe(view);
}