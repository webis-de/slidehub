import { SlidehubPlugin } from '../core/SlidehubPlugin.mjs';
import { listener } from '../util/passive-event-listener.mjs';

class PageWidgetPlugin extends SlidehubPlugin {
  constructor(slidehub) {
    const description = 'Displays the page numbers';
    super(slidehub, 'PageWidgetPlugin', description);

    this.boundExposeItemCount = this.exposeItemCount.bind(this);
    this.boundExposeCurrentItem = this.exposeCurrentItem.bind(this);
    this.widgetHookNode = document.querySelector('[data-slidehub-page-widget]');
    this.currentPageNode = null;
    this.totalPagesNode = null;
  }

  enable() {
    this.insertWidgetMarkup();
    this.slidehub.node.addEventListener('SlidehubHoverDocument', this.boundExposeItemCount, listener.passive);
    this.slidehub.node.addEventListener('SlidehubHoverItem', this.boundExposeCurrentItem, listener.passive);
    super.enable();
  }

  disable() {
    this.removeWidgetMarkup();
    this.slidehub.node.removeEventListener('SlidehubHoverDocument', this.boundExposeItemCount);
    this.slidehub.node.removeEventListener('SlidehubHoverItem', this.boundExposeCurrentItem);
    super.disable();
  }

  insertWidgetMarkup() {
    const widgetMarkup = `<div class="sh-page-widget" aria-hidden="hidden">
      Page
      <span class="sh-page-widget__current-page" data-slidehub-current-page>0</span><span data-slidehub-total-pages>0</span>
    </div>`;

    this.widgetHookNode.insertAdjacentHTML('beforeend', widgetMarkup);

    const widgetNode = this.widgetHookNode.firstElementChild;
    this.currentPageNode = widgetNode.firstElementChild;
    this.totalPagesNode = widgetNode.lastElementChild;

    this.totalPagesNode.textContent = this.slidehub.selectedDocument.itemCount();
    this.currentPageNode.textContent = this.slidehub.selectedDocument.selectedItemNode.dataset.page;
  }

  removeWidgetMarkup() {
    while (this.widgetHookNode.lastChild) {
      this.widgetHookNode.removeChild(this.widgetHookNode.lastChild);
    }

    this.totalPagesNode = null;
    this.currentPageNode = null;
  }

  exposeItemCount(event) {
    this.totalPagesNode.textContent = event.detail.doc.itemCount();
  }

  exposeCurrentItem(event) {
    this.currentPageNode.textContent = event.detail.itemNode.dataset.page;
  }
}

export { PageWidgetPlugin };
