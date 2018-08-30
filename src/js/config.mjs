/**
 * @typedef {object} Config
 * @property {ConfigPropertyAssets} assets
 * @property {boolean} staticContent
 * @property {boolean} metaSlide
 * @property {boolean} keepSelectedPageInFirstColumn
 * @property {boolean} preserveAspectRatio
 * @property {string|null} selectColor
 * @property {string|null} highlightColor
 * @property {ConfigPropertyClassName} className
 * @property {*} selector
 *
 * @typedef {object} ConfigPropertyAssets
 * @property {string} documents
 * @property {string} images
 *
 * @typedef {object} ConfigPropertyClassName
 * @property {string} slidehub
 * @property {string} doc
 * @property {string} scrollbox
 * @property {string} itemContainer
 * @property {string} item
 * @property {string} selected
 * @property {string} highlighted
 */

/**
 * Global configuration object.
 *
 * @type {Config}
 */
const config = {
  // Location of the data directory containing PDF/PNG assets
  assets: {
    documents: 'https://www.uni-weimar.de/medien/webis/tmp/slides/data',
    images: 'https://www.uni-weimar.de/medien/webis/tmp/slides/data'
  },

  // If set to true, it is assumed that the document markup is already present.
  staticContent: false,

  // Create a meta slide for each document?
  metaSlide: true,

  // Allows navigating pages so that the last page can be placed in the first
  // column of a document container.
  keepSelectedPageInFirstColumn: true,

  // Preserve aspect ratio of document items?
  preserveAspectRatio: false,

  // Overrides the default select color.
  // Takes string values that represent a valid CSS color value; for example:
  // 'transparent', 'Highlight', 'tomato', '#f90', 'hsl(220, 50%, 40%)'
  // Setting `null` uses the default color.
  selectColor: null,

  // Overrides the default highlight color.
  highlightColor: null,

  // Selectors for UI components
  className: {
    slidehub: 'slidehub-container',
    doc: 'sh-doc',
    scrollbox: 'sh-doc-scrollbox',
    itemContainer: 'sh-page-container',
    item: 'sh-page',
    selected: 'sh-selected',
    highlighted: 'sh-highlighted'
  },

  selector: {}
};

for (const prop in config.className) {
  config.selector[prop] = `.${config.className[prop]}`;
}

export { config };
