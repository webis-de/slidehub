'use strict'

/*
* Configuration
*/
const config = {
    webRoot: '.',
    itemWidth: 300,

    // How to position scrollable content
    // true:  use CSS transforms
    // false: use the views `scrollLeft`/`scrollTop` property
    moveViewItemsWithTransform: true,

    minimalDocumentHeight: true,

    // HTML classes that are used in the application
    class: {
        main: '.main-content',
        view: '.doc-view',
        doc:  '.doc',
        item: '.doc__page'
    },

    modifierKey: 'shiftKey'
}

const state = {
    activeView: null,
    viewObserver: null,
    visibleItems: null
}

// Maps key codes to key names
const modifierKeyNames = Object.freeze({
    16: 'shiftKey',
    17: 'ctrlKey',
    18: 'altKey'
})

/*
* Maps key codes to key names.
* It’s used within keyboard-related event handlers in order to work with the
* keys’ names instead of key codes.
*
* Removing an entry here disables its application-related interactions
*/
const controlKeyName = Object.freeze({
    // 9: 'tabKey',
    35: 'endKey',
    36: 'homeKey',
    37: 'arrowLeft',
    38: 'arrowUp',
    39: 'arrowRight',
    40: 'arrowDown'
})

/*
* Maps control keys to a trigger function that is executed when the key is
* pressed.
*/
const controlKey = Object.freeze({
    homeKey: {
        trigger: function(event) {
            setViewPos(state.activeView, 0)
        }
    },
    endKey: {
        trigger: function(event) {
            setViewPos(state.activeView, getLastItem())
        }
    },
    arrowLeft: {
        direction: -1,
        trigger: function(event) {
            moveDocumentView(this.direction * (event.ctrlKey ? 3 : 1))
        }
    },
    arrowRight: {
        direction: 1,
        trigger: function(event) {
            moveDocumentView(this.direction * (event.ctrlKey ? 3 : 1))
        }
    },
    arrowUp: {
        trigger: function(event) {
            goToPreviousView()
        }
    },
    arrowDown: {
        trigger: function(event) {
            goToNextView()
        }
    },
    tabKey: {
        trigger: function(event) {
            if (event.shiftKey) {
                goToPreviousView()
            } else {
                goToNextView()
            }
        }
    }
})

function initialize(webRoot) {
    config.webRoot = webRoot
    initializeLazyLoader()

    document.addEventListener('DOMContentLoaded', function() {
        loadDocumentAsync()
            .then(onFirstDocumentLoaded, onDocumentReject)
            .catch(message => { console.error(message) })

        enableModalButtons()
        enableModifier()

        document.addEventListener(
            'wheel',
            handleWheelNavigation,
            // Permitted to call preventDefault
            supportsPassive ? { passive: false } : false
        )

        document.addEventListener(
            'keydown',
            handleKeyboardInput,
            // Permitted to call preventDefault
            supportsPassive ? { passive: false } : false
        )

        document.addEventListener(
            'keydown',
            handleItemLinking,
            // Permitted to call preventDefault
            supportsPassive ? { passive: false } : false
        )

        document.addEventListener(
            'focusin',
            activateDocumentOnFocus,
            // Not permitted to call preventDefault
            supportsPassive ? { passive: true } : false
        )

        /*document.body.addEventListener(
            'mousemove',
            handleMouseMoveFocus,
            // Not permitted to call preventDefault
            supportsPassive ? { passive: true } : false
        )*/
    })
}





////////////////////////////////////////////////////////////////////////////////////////////////////
// LOADING DOCUMENTS

function loadDocumentAsync() {
    return new Promise((resolve, reject) => {
        const mainContent = document.querySelector(config.class.main)
        const docData = documentsData[0]

        if (docData === undefined) {
            reject('No more documents to load.')
        }

        loadDoc(mainContent, docData)
        const view = mainContent.lastElementChild
        state.viewObserver.observe(view)
        setDocumentWidth(view.querySelector(config.class.doc))
        enableDocumentScrolling(view)
        activateViewOnHover(view)
        activateItemsOnHover(view)
        resolve()
    })
}

function loadDoc(mainContent, docData) {
    const viewTemplate = document.createElement('template')
    viewTemplate.innerHTML = createDocumentMarkup(docData[0], docData[1])
    mainContent.appendChild(viewTemplate.content)
}

/*
* Creates the full markup of one document
*/
function createDocumentMarkup(docName, itemCount) {
    const assetPath = `${config.webRoot}/data`
    let items = ''
    for (var i = 0; i < itemCount; i++) {
        const source = `${assetPath}/${docName}-${i}.png`
        items += `<div class="${config.class.item.slice(1)}" data-page="${i + 1}">
            <img data-src="${source}" alt="page ${i + 1}">
        </div>`
    }

    const anchorTarget = `${assetPath}/${docName}`

    return `<div class="${config.class.view.slice(1)}" id="${docName}" data-page-count="${itemCount + 1}">
        <div class="${config.class.doc.slice(1)}">
            <div class="${config.class.item.slice(1)} doc-info active" data-page="0">
                <h2 class="doc-title">
                    <a href="${anchorTarget}">${docName}</a>
                </h2>
                by <span class="doc-author">author</span>,
                <span class="doc-pages-count">${itemCount}</span> pages,
                2018
            </div>
            ${items}
        </div>
    </div>`
}

function setDocumentWidth(doc) {
    const documentOuterWidth =
        getFloatPropertyValue(doc, 'margin-left') +
        getFloatPropertyValue(doc, 'border-left-width') +
        getComputedOuterChildrenWidth(doc) +
        getFloatPropertyValue(doc, 'border-right-width') +
        getFloatPropertyValue(doc, 'margin-right')
    doc.style.setProperty('width', documentOuterWidth + 'px')
}

function enableDocumentScrolling(view) {
    let prevX
    let touched = false
    let transitionValue
    let doc

    view.addEventListener('touchstart', function(event) {
        if (config.moveViewItemsWithTransform) {
            view.style.setProperty('will-change', 'transform')
        }

        touched = true
        doc = view.querySelector(config.class.doc)
        transitionValue = getComputedStyle(doc).getPropertyValue('transition')
        doc.style.setProperty('transition', 'none')

        prevX = event.targetTouches[0].clientX
    }, supportsPassive ? { passive: true }: false)

    view.addEventListener('touchmove', function(event) {
        if (touched) {
            const currentX = event.targetTouches[0].clientX
            const offset = currentX - prevX
            const newItemX = getViewPixelPos(view) - offset
            const disableTransition = true
            setViewPixelPos(view, newItemX, disableTransition)
            prevX = currentX
        }
    }, supportsPassive ? { passive: true }: false)

    view.addEventListener('touchend', function(event) {
        if (touched) {
            const newPos = getViewPos(view)
            setViewPos(view, Math.round(newPos))

            if (config.moveViewItemsWithTransform) {
                view.style.setProperty('will-change', 'auto')
            }

            touched = false
            doc.style.setProperty('transition', transitionValue)
        }
    }, supportsPassive ? { passive: true }: false)
}

function onFirstDocumentLoaded() {
    const firstView = document.querySelector(config.class.view)
    setActiveView(firstView)

    evaluateItemWidth()
    setFullyVisibleItems()
    onDocumentLoaded()
}

function onDocumentLoaded() {
    documentsData.shift() // Delete first element
    console.info('Document loaded. Remaining:', documentsData.length)
    loadDocumentAsync()
        .then(onDocumentLoaded, onDocumentReject)
        .catch(message => { console.log(message) })
}

function onDocumentReject(message) {
    console.info(message)
}

function evaluateItemWidth() {
    const itemSample = document.querySelector(config.class.item)
    const itemOuterWidth = getOuterWidth(itemSample)
    // const itemOuterWidth = Math.ceil(getOuterWidth(itemSample))

    if (itemOuterWidth !== config.itemWidth) {
        console.info(
            'Pre-configured page width does not match actual page width.',
            'Updating configuration.'
        )
        config.itemWidth = itemOuterWidth
    }
}

function setFullyVisibleItems() {
    state.visibleItems = getFullyVisibleItems()
}

function getFullyVisibleItems() {
    const itemSample = document.querySelector(config.class.item)
    const itemOuterWidth = getOuterWidth(itemSample)

    const viewSample = document.querySelector(config.class.view)
    const viewWidth = getFloatPropertyValue(viewSample, 'width')
    return Math.floor(viewWidth / itemOuterWidth)
}





////////////////////////////////////////////////////////////////////////////////////////////////////
// NAVIGATION

function handleKeyboardInput(event) {
    // Get key name from key code
    const keyName = controlKeyName[event.keyCode]

    // If the pressed key is no control key …
    if (keyName === undefined) {
        return
    }

    event.preventDefault()

    controlKey[keyName].trigger(event)
}

function activateDocumentOnFocus(event) {
    const view = event.target.closest(config.class.view)
    if (view !== null) {
        setActiveView(view)
    }
}

function handleMouseMoveFocus(event) {
    console.log('mousemove')
    const view = event.target.closest(config.class.view)
    const item = event.target.closest(config.class.item)

    if (view === null || item === null) {
        return
    }

    setActiveView(view)
    setActiveItem(view, item)
}

function activateViewOnHover(view) {
    view.addEventListener('mouseenter', function(event) {
        setActiveView(event.currentTarget)
    })
}

function activateItemsOnHover(view) {
    const items = Array.from(view.querySelectorAll(config.class.item))
    items.forEach(item => item.addEventListener('mouseenter', function(event) {
        const view = event.currentTarget.closest(config.class.view)
        setActiveItem(view, event.currentTarget)
    }))
}

function handleItemLinking(event) {
    if (event.keyCode !== 13) {
        return
    }

    if (isFocusable(event.target)) {
        return
    }

    if (state.activeView !== null) {
        openItem(state.activeView, event.ctrlKey)
    }
}

function openItem(view, ctrlKey) {
    const documentAnchor = view.querySelector(`${config.class.item} a`)

    if (documentAnchor === null) {
        return
    }

    const itemIndex = getActiveItem(view).getAttribute('data-page')
    const documentLink = `${documentAnchor.href}#page=${itemIndex}`

    if (ctrlKey) {
        window.open(documentLink)
    } else {
        window.location.href = documentLink
    }
}

function enableModifier() {
    const modifier = config.modifierKey.replace('Key', '')
    document.documentElement.setAttribute('data-modifier', modifier)
    const modifierKBDElements = Array.from(document.querySelectorAll('.shortcut__modifier'))
    modifierKBDElements.forEach(element => element.innerText = modifier)

    document.addEventListener('keydown', function(event) {
        const modifier = modifierKeyNames[event.keyCode]
        if (modifier === config.modifierKey) {
            const doc = state.activeView.querySelector(config.class.doc)
            doc.style.setProperty('cursor', 'ew-resize')
        }
    })

    document.addEventListener('keyup', function(event) {
        const modifier = modifierKeyNames[event.keyCode]
        if (modifier === config.modifierKey) {
            const doc = state.activeView.querySelector(config.class.doc)
            doc.style.setProperty('cursor', 'auto')
        }
    })

    window.addEventListener('blur', function(event) {
        const doc = state.activeView.querySelector(config.class.doc)
        doc.style.setProperty('cursor', 'auto')
    })
}

function handleWheelNavigation(event) {
    // No special scrolling without modifier
    if (event[config.modifierKey] === false) {
        return
    }

    // No special scrolling when not scrolling vertically
    if (event.deltaY === 0) {
        return
    }

    const view = event.target.closest(config.class.view)
    if (view === null) {
        return
    }

    // Prevent vertical scrolling
    event.preventDefault()

    // Prevent unnecessary actions when there is nothing to scroll
    const numItems = view.querySelector(config.class.doc).childElementCount
    if (numItems <= state.visibleItems) {
        return
    }

    moveDocumentView(Math.sign(event.deltaY))
}

function moveDocumentView(distance) {
    const view = state.activeView
    if (view === null) {
        return
    }

    const pageCount = getItemCount(view)
    const currentIndex = parseInt(getActiveItem(view).getAttribute('data-page'))
    let targetIndex = currentIndex + distance
    if (targetIndex < 0) {
        targetIndex = 0
    } else if (targetIndex >= pageCount) {
        targetIndex = pageCount - 1
    }
    const targetItem = getItemByIndex(view, targetIndex)
    setActiveItem(view, targetItem)

    const itemsBeforeScrollPos = getViewPos(view)
    let nextItem = 0
    if (itemsBeforeScrollPos % 1 !== 0) {
        const roundOp = distance > 0 ? Math.ceil : Math.floor
        nextItem = Math.round(itemsBeforeScrollPos) + distance
    } else {
        nextItem = itemsBeforeScrollPos + distance
    }

    setViewPos(view, nextItem)
}

function getViewPos(view) {
    return getViewPixelPos(view) / config.itemWidth
}

function getViewPixelPos(view) {
    if (config.moveViewItemsWithTransform) {
        const doc = view.querySelector(config.class.doc)
        // Negate the value in order to match scrollbar position values
        const itemPos = -1 * getTranslateX(doc)
        return itemPos
    }

    return view.scrollLeft
}

function setViewPos(view, itemPos) {
    if (view === null) {
        return
    }

    const doc = view.querySelector(config.class.doc)
    const maxPos = getOuterWidth(doc) - getOuterWidth(view)
    if (itemPos < 0) {
        itemPos = 0
    }

    let itemX = itemPos * config.itemWidth
    if (itemX > maxPos) {
        itemX = maxPos
    }

    setViewPixelPos(view, itemX)
}

function setViewPixelPos(view, itemX, disableTransition = false) {
    const doc = view.querySelector(config.class.doc)

    if (config.moveViewItemsWithTransform) {
        doc.style.setProperty('transform', `translateX(${-itemX}px)`)
    } else {
        view.scrollLeft = itemX
    }
}

function getTranslateX(element) {
    const matrix = getComputedStyle(element).getPropertyValue('transform')

    if (matrix === 'none') {
        return 0
    }

    return parseFloat(matrix.split(',')[4])
}

function goToPreviousView() {
    const target = state.activeView.previousElementSibling
    if (target !== null) {
        setActiveView(target)
    }
}

function goToNextView() {
    const target = state.activeView.nextElementSibling
    if (target !== null) {
        setActiveView(target)
    }
}

function getLastItem() {
    const doc = state.activeView.querySelector(config.class.doc)
    return doc.childElementCount - 1
}

function setActiveView(view) {
    const views = document.querySelectorAll(`${config.class.view}.active`)
    Array.from(views).forEach(element => element.classList.remove('active'))
    state.activeView = view
    state.activeView.classList.add('active')
    // view.focus()
    // view.scrollIntoView(false)
}

function getItemCount(view) {
    return parseInt(view.getAttribute('data-page-count'))
}

function getActiveItem(view) {
    return view.querySelector(`${config.class.item}.active`)
}

function setActiveItem(view, targetItem) {
    const activeItem = getActiveItem(view)
    activeItem.classList.remove('active')
    targetItem.classList.add('active')
    // const targetIndex = targetItem.getAttribute('data-page')
    // view.setAttribute('data-active-page', targetIndex)
}

function getItemByIndex(view, index) {
    const doc = view.querySelector(config.class.doc)
    return doc.children[index]
}





////////////////////////////////////////////////////////////////////////////////////////////////////
// MODAL WINDOW

let focusedElementBeforeModal

/*
* Based on some ideas from “The Incredible Accessible Modal Window” by Greg Kraus
* https://github.com/gdkraus/accessible-modal-dialog
*/
function enableModalButtons() {
    Array.from(document.querySelectorAll('.open-modal')).forEach(button => {
        button.removeAttribute('disabled')
        button.addEventListener('click', openModal)
    })

    Array.from(document.querySelectorAll('.close-modal')).forEach(button => {
        button.addEventListener('click', closeModal)
    })
}

function openModal(event) {
    const targetClass = event.currentTarget.getAttribute('data-target-modal')
    const modal = document.querySelector(`.${targetClass}`)

    if (modal === null) {
        return
    }

    // Save last focused element
    focusedElementBeforeModal = document.activeElement

    document.body.setAttribute('aria-hidden', 'true')
    modal.setAttribute('aria-hidden', 'false')

    modal.classList.remove('closed')

    getFocusableElements(modal)[0].focus()

    // Setup event listeners
    modal.addEventListener('keydown', closeModalOnEscape)
    modal.addEventListener('keydown', trapTabKey)
    modal.addEventListener('click', closeModalOnBackground)
}

function closeModal(event) {
    const modal = event.target.closest('.modal')

    if (modal === null) {
        return
    }

    document.body.setAttribute('aria-hidden', 'false')
    modal.setAttribute('aria-hidden', 'true')

    modal.classList.add('closed')

    // Clean up event listeners
    modal.removeEventListener('keydown', closeModalOnEscape)
    modal.removeEventListener('keydown', trapTabKey)
    modal.removeEventListener('click', closeModalOnBackground)

    // Restore previously focused element
    focusedElementBeforeModal.focus()
}

function closeModalOnBackground(event) {
    if (event.target === event.currentTarget) {
        closeModal(event)
    }
}

function closeModalOnEscape(event) {
    if (event.keyCode === 27) {
        closeModal(event)
    }
}

/*
* Make it impossible to focus an element outside the modal
*/
function trapTabKey(event) {
    if (event.keyCode !== 9) {
        return
    }

    const activeElement = document.activeElement
    const focusable = getFocusableElements(event.currentTarget)

    if (focusable.length < 2) {
        event.preventDefault()
        return
    }

    if (event.shiftKey) {
        if (activeElement === focusable[0]) {
            focusable[focusable.length - 1].focus()
            event.preventDefault()
        }
    } else {
        if (activeElement === focusable[focusable.length - 1]) {
            focusable[0].focus()
            event.preventDefault()
        }
    }
}

function getFocusableElements(ancestor = document) {
    const elements = Array.from(ancestor.querySelectorAll('*'))
    return elements.filter(element => isFocusable(element))
}

function isFocusable(element) {
    return element.tabIndex > -1 && element.offsetParent !== null
}





////////////////////////////////////////////////////////////////////////////////////////////////////
// LAZY LOADING PAGES

/*
* Observes document views in order to load their item images only when
* they’re visible.
*/
function initializeLazyLoader() {
    const options = {
        rootMargin: `500px 0px`
    }

    state.viewObserver = new IntersectionObserver(viewObservationHandler, options)
}

function viewObservationHandler(entries, observer) {
    for (const entry of entries) {
        if (entry.isIntersecting) {
            const view = entry.target
            const images = Array.from(view.querySelectorAll('img[data-src]'))
            // For each image …
            images.forEach(img => {
                // … swap out the `data-src` attribute with the `src` attribute.
                // This will start loading the images.
                if (img.hasAttribute('data-src')) {
                    img.setAttribute('src', img.getAttribute('data-src'))
                    img.removeAttribute('data-src')
                }
            })

            images[0].addEventListener('load', function() {
                handleFirstItemImageLoaded(entry.target)
            })

            // Unobserve the current target because no further action is required
            observer.unobserve(entry.target)
        }
    }
}

function handleFirstItemImageLoaded(view) {
    if (config.minimalDocumentHeight) {
        setItemAspectRatio(view)
    }
}

function setItemAspectRatio(view) {
    const imgSample = view.querySelector(`${config.class.item} > img`)
    const aspectRatio = imgSample.naturalWidth / imgSample.naturalHeight
    view.style.setProperty('--page-aspect-ratio', aspectRatio)
}





////////////////////////////////////////////////////////////////////////////////////////////////////
// MISC

/*
* https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
*/
let supportsPassive = false
try {
    const opts = Object.defineProperty({}, 'passive', {
        get: function() {
          supportsPassive = true
        }
    });
    window.addEventListener('test', null, opts)
} catch (event) {}

function getFloatPropertyValue(element, property) {
    const value = getComputedStyle(element).getPropertyValue(property)

    if (value === '') {
        return 0
    }

    return parseFloat(value)
}

/*
* Computes the total outer width of an element by accumulating its children’s
* horizontal dimension property values (i.e. margin-left, width, margin-right)
*/
function getComputedOuterChildrenWidth(element) {
    let outerWidth = 0

    Array.from(element.children).forEach(child => {
        outerWidth += getOuterWidth(child)
    })

    return outerWidth
}

/*
* Computes the total outer width of an element.
* The outer width is defined as the width plus any horizontal margins.
* This is assumes the the `box-sizing` box model.
*/
function getOuterWidth(element) {
    const width = getFloatPropertyValue(element, 'width')
    const marginLeft = getFloatPropertyValue(element, 'margin-left')
    const marginRight = getFloatPropertyValue(element, 'margin-right')

    return marginLeft + width + marginRight
}
