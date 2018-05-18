import { SlidehubPlugin } from '../core/SlidehubPlugin';
import { listener } from '../util/passive-event-listener';

export { PageWidgetPlugin };

class PageWidgetPlugin extends SlidehubPlugin {
  constructor(slidehub) {
    const description = 'Displays the page numbers';
    super(slidehub, 'PageWidgetPlugin', description);

    this.boundExposeItemCount = this.exposeItemCount.bind(this);
    this.boundExposeCurrentItem = this.exposeCurrentItem.bind(this);
    this.currentPageNode = null;
    this.totalPagesNode = null;
  }

  enable() {
    this.insertMarkup();
    this.slidehub.node.addEventListener('SlidehubHoverDocument', this.boundExposeItemCount, listener.passive);
    this.slidehub.node.addEventListener('SlidehubHoverItem', this.boundExposeCurrentItem, listener.passive);
    super.enable();
  }

  disable() {
    this.removeMarkup();
    this.slidehub.node.removeEventListener('SlidehubHoverDocument', this.boundExposeItemCount);
    this.slidehub.node.removeEventListener('SlidehubHoverItem', this.boundExposeCurrentItem);
    super.disable();
  }

  insertMarkup() {
    const widgetMarkup = `<div class="sh-page-widget">
      <span class="sh-page-widget__current-page" data-slidehub-current-page>0</span>
      <span class="sh-page-widget__total-pages" data-slidehub-total-pages>0</span>
    </div>`;

    const hookNode = document.querySelector('[data-slidehub-page-widget]');
    hookNode.insertAdjacentHTML('beforeend', widgetMarkup);

    this.totalPagesNode = hookNode.querySelector('[data-slidehub-total-pages]');
    this.currentPageNode = hookNode.querySelector('[data-slidehub-current-page]');

    this.totalPagesNode.textContent = this.slidehub.selectedDocument.itemCount();
    this.currentPageNode.textContent = this.slidehub.selectedDocument.selectedItemNode.dataset.page;
  }

  removeMarkup() {
    const hookNode = document.querySelector('[data-slidehub-page-widget]');
    hookNode.innerHTML = '';
  }

  exposeItemCount(event) {
    this.totalPagesNode.textContent = event.detail.doc.itemCount();
  }

  exposeCurrentItem(event) {
    this.currentPageNode.textContent = event.detail.itemNode.dataset.page;
  }
}
