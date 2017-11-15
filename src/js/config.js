export const config = {
  // Location of the data directory containing PDF/PNG assets
  assetPath: 'https://www.uni-weimar.de/medien/webis/tmp/slides/data',

  // Create a meta slide for each document?
  metaSlide: true,

  // Preserve aspect ratio of document items?
  preserveAspectRatio: true,

  // Selectors for UI components
  selector: {
    view: '.doc-view',
    scrollbox: '.doc-scrollbox',
    doc: '.doc',
    item: '.doc__page'
  }
};
