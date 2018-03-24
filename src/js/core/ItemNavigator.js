import { config } from '../config';
import { clamp } from '../util/clamp';

export { ItemNavigator };

/**
 * Item Navigator
 *
 * **Usage**:
 *
 * ```
 * const navigateItem = new ItemNavigator(slidehub, doc);
 * navigateItem.by(3);
 * ```
 */
class ItemNavigator {
  /**
   * @param {Slidehub} slidehub
   * @param {SlidehubDocument} doc
   * @public
   */
  constructor(slidehub, doc) {
    this.slidehub = slidehub;
    this._doc = doc;
    this._itemPos = 0;
    this._selectedItemPos = 0;
  }

  /**
   * Navigate item down.
   *
   * @param {Number} distance
   * @public
   */
  left(distance) {
    this.by(-distance);
  }

  /**
   * Navigate item down.
   *
   * @param {Number} distance
   * @public
   */
  right(distance) {
    this.by(distance);
  }

  /**
   * Main interface for item navigation. The algorithm works like this:
   *
   * 1. Determine the new position of the selected item.
   *
   *    1.1. If the new position is different than the current position, update it.
   *
   * 2. If the current item position is not aligned properly (i.e. is not an integer),
   *    its position will be rounded to the next closest integer position.
   *
   * 3. If the `keepSelectedPageInFirstColumn` option is turned on
   *    and all items are visible within their document, return.
   *
   * 4. Determine the new position of the item.
   *
   *    4.1. If the new position is the same as the current position, return.
   *
   *    4.2. If the `keepSelectedPageInFirstColumn` option is turned on
   *    and the selected item is already visible, return.
   *
   *    4.3. Update the item position with the new value.
   *
   * @param {Number} vector
   * @private
   */
  by(vector) {
    const newSelectedItemPos = this.determineNewSelectedItemPos(vector);
    if (newSelectedItemPos !== this.selectedItemPos) {
      this.updateSelectedItemPos(newSelectedItemPos);
    }

    // If the current item position is not properly aligned …
    if (!Number.isInteger(this.itemPos)) {
      this.updateItemPos(Math.round(this.itemPos));
    }

    // If all items are already visible, we’re done here.
    if (!config.keepSelectedPageInFirstColumn && this.allItemsVisible()) {
      return;
    }

    const newItemPos = this.determineNewItemPos(vector);

    // Nothing to do, current position is already the destination.
    if (newItemPos === this.itemPos) {
      return;
    }

    // If the selected item is already inside the view, we’re done here.
    // When an item can be moved to the first column, this behavior is disabled
    // as I prefer keeping the selected item in the first column in this case.
    if (!config.keepSelectedPageInFirstColumn && this.selectedItemIsVisible()) {
      return;
    }

    this.updateItemPos(newItemPos);
  }

  /**
   * @returns {SlidehubDocument}
   * @public
   */
  get doc() {
    return this._doc;
  }

  /**
   * @returns {Number}
   * @public
   */
  get itemPos() {
    return this._itemPos;
  }

  /**
   * @param {Number} itemPos
   * @private
   */
  set itemPos(itemPos) {
    this._itemPos = itemPos;
  }

  /**
   * Updates the position of the item.
   *
   * @param {Number} newItemPos
   * @private
   */
  updateItemPos(newItemPos) {
    this.itemPos = newItemPos;
    this.doc.scrollboxNode.scrollLeft = newItemPos * this.slidehub.itemWidth;
  }

  /**
   * Determines the new position of the item based on a direction vector.
   *
   * @param {Number} vector
   * @returns {Number}
   * @private
   */
  determineNewItemPos(vector) {
    const newItemPos = this.itemPos + vector;
    const visibleItems = this.slidehub.visibleItems;

    // For certain settings, some item positions don’t need to accessible because they are already
    // visible
    const invalidItemPositions = config.keepSelectedPageInFirstColumn ? 0 : visibleItems - 1;
    const maxPos = this.doc.itemCount() - invalidItemPositions;

    return clamp(newItemPos, 0, maxPos);
  }

  /**
   * @returns {Number}
   * @public
   */
  get selectedItemPos() {
    return this._selectedItemPos;
  }

  /**
   * @param {Number} selectedItemPos
   * @private
   */
  set selectedItemPos(selectedItemPos) {
    this._selectedItemPos = selectedItemPos;
  }

  /**
   * Updates the position of the selected item.
   *
   * @param {Number} newSelectedItemPos
   * @private
   */
  updateSelectedItemPos(newSelectedItemPos) {
    this.selectedItemPos = newSelectedItemPos;
    this.doc.selectItem(this.doc.items.item(newSelectedItemPos));
  }

  /**
   * Determines the new position of the selected item based on `distance`.
   *
   * @param {Number} vector
   * @returns {Number}
   * @private
   */
  determineNewSelectedItemPos(vector) {
    const newSelectedItemPos = this.selectedItemPos + vector;
    return clamp(newSelectedItemPos, 0, this.doc.itemCount());
  }

  /**
   * Tests whether a document’s items are all visible.
   *
   * @returns {boolean}
   * @private
   */
  allItemsVisible() {
    return this.doc.itemCount < this.slidehub.numberOfVisibleItems;
  }

  /**
   * Tests whether a document’s selected item is already visible.
   *
   * @returns {boolean}
   * @private
   */
  selectedItemIsVisible() {
    const docRect = this.doc.node.getBoundingClientRect();
    const itemRect = this.doc.selectedItemNode.getBoundingClientRect();

    return (
      docRect.left <= itemRect.left &&
      itemRect.right <= docRect.right &&
      docRect.top <= itemRect.top &&
      itemRect.bottom <= docRect.bottom
    );
  }
};
