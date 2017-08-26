'use strict'

/*
* Configuration
*/
const config = {
    itemWidth: 300,
    minimalDocumentHeight: true,
    class: {
        main: '.main-content',
        container: '.doc-view',
        document: '.doc',
        item: '.doc__page'
    },
    modifierKey: 'altKey'
}

let imgSrcRoot
let containerObserver
let visibleItems

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
            goToItem(0)
        }
    },
    endKey: {
        trigger: function(event) {
            goToItem(getLastPage())
        }
    },
    arrowLeft: {
        direction: -1,
        trigger: function(event) {
            const count = event.ctrlKey ? 3 : 1
            moveByItems(this.direction, count)
        }
    },
    arrowRight: {
        direction: 1,
        trigger: function(event) {
            const count = event.ctrlKey ? 3 : 1
            moveByItems(this.direction, count)
        }
    },
    arrowUp: {
        trigger: function(event) {
            goToPreviousContainer()
        }
    },
    arrowDown: {
        trigger: function(event) {
            goToNextContainer()
        }
    },
    tabKey: {
        trigger: function(event) {
            if (event.shiftKey) {
                goToPreviousContainer()
            } else {
                goToNextContainer()
            }
        }
    }
})

function initialize(srcRoot) {
    imgSrcRoot = srcRoot
    initializeLazyLoader()

    document.addEventListener('DOMContentLoaded', function() {
        enableModalButtons()
        enableKeyboardNavigation()
        enableMousePageNavigation()
        activateDocumentWithFocus()
        focusDocumentWithMouseMove()

        loadDocumentAsync()
            .then(onFirstDocumentLoaded, onDocumentReject)
            .catch(message => { console.error(message) })
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
        const container = mainContent.lastElementChild
        containerObserver.observe(container)
        setDocumentWidth(container.querySelector(config.class.document))
        enableDocumentScrolling(container)
        resolve()
    })
}

function loadDoc(mainContent, docData) {
    const containerTemplate = document.createElement('template')
    containerTemplate.innerHTML = createDocumentMarkup(docData[0], docData[1])
    mainContent.appendChild(containerTemplate.content)
}

/*
* Creates the full markup of one document
*/
function createDocumentMarkup(docName, itemCount) {
    let items = ''
    for (var i = 0; i < itemCount; i++) {
        const source = `${imgSrcRoot}/data/${docName}-${i}.png`
        items += `<div class="${config.class.item.slice(1)}">
            <img data-src="${source}" alt="page ${i + 1}">
        </div>`
    }

    const anchorTarget = `${imgSrcRoot}/data/${docName}`

    return `<div class="${config.class.container.slice(1)}" id="${docName}">
        <div class="${config.class.document.slice(1)}">
            <div class="${config.class.item.slice(1)} doc-info">
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

function enableDocumentScrolling(container) {
    let prevX
    let touched = false

    const thirdParameter = supportsPassive ? { passive: true }: false

    container.addEventListener('touchstart', function(event) {
        activateContainer(container)
        touched = true
        prevX = event.targetTouches[0].clientX
    }, thirdParameter)

    container.addEventListener('touchmove', function(event) {
        if (touched) {
            const currentX = event.targetTouches[0].clientX
            const offset = currentX - prevX

            container.scrollLeft -= offset
            prevX = currentX
        }
    }, thirdParameter)

    container.addEventListener('touchend', function(event) {
        if (touched) {
            const itemsBeforeScrollPos = container.scrollLeft / config.itemWidth
            goToItem(Math.round(itemsBeforeScrollPos))
            touched = false
        }
    }, thirdParameter)
}

function onFirstDocumentLoaded() {
    const firstContainer = document.querySelector(config.class.container)
    activateContainer(firstContainer)

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
    visibleItems = getFullyVisibleItems()
}

function getFullyVisibleItems() {
    const itemSample = document.querySelector(config.class.item)
    const itemOuterWidth = getOuterWidth(itemSample)

    const containerSample = document.querySelector(config.class.container)
    const containerWidth = getFloatPropertyValue(containerSample, 'width')
    return Math.floor(containerWidth / itemOuterWidth)
}





////////////////////////////////////////////////////////////////////////////////////////////////////
// NAVIGATION

function enableKeyboardNavigation() {
    document.addEventListener('keydown', function(event) {
        // Get key name from key code
        const keyName = controlKeyName[event.keyCode]

        // If the pressed key is no control key …
        if (keyName === undefined) {
            return
        }

        event.preventDefault()

        controlKey[keyName].trigger(event)
    })
}

function activateDocumentWithFocus() {
    document.addEventListener('focusin', function(event) {
        const container = event.target.closest(config.class.container)
        if (container !== null) {
            activateContainer(container)
        }
    })
}

function focusDocumentWithMouseMove() {
    document.body.addEventListener('mousemove', function(event) {
        const container = event.target.closest(config.class.container)
        if (container !== null) {
            activateContainer(container)
        }
    })
}

function enableModifier() {
    const modifier = config.modifierKey.replace('Key', '')
    document.documentElement.setAttribute('data-modifier', modifier)
    const modifierKBDElements = document.querySelectorAll('.shortcut__modifier')
    modifierKBDElements.forEach(el => el.innerText = modifier)
    // kbdEl.innerText = modifier

    document.addEventListener('keydown', function(event) {
        const modifier = modifierKeyNames[event.keyCode]
        if (modifier === config.modifierKey) {
            document.documentElement.classList.add('modifier-pressed')
        }
    })

    document.addEventListener('keyup', function(event) {
        const modifier = modifierKeyNames[event.keyCode]
        if (modifier === config.modifierKey) {
            document.documentElement.classList.remove('modifier-pressed')
        }
    })

    window.addEventListener('blur', function(event) {
        document.documentElement.classList.remove('modifier-pressed')
    })
}

function enableMousePageNavigation() {
    enableModifier()

    document.addEventListener('wheel', function(event) {
        // No special scrolling without modifier
        if (event[config.modifierKey] === false) {
            return
        }

        // No special scrolling when not scrolling vertically
        if (event.deltaY === 0) {
            return
        }

        const container = event.target.closest(config.class.container)
        if (container === null) {
            return
        }

        // Prevent vertical scrolling
        event.preventDefault()

        // Prevent unnecessary actions when there is nothing to scroll
        const numItems = container.querySelector(config.class.document).childElementCount
        if (numItems <= visibleItems) {
            return
        }

        moveByItems(Math.sign(event.deltaY))
    }, { passive: false })
}

function moveByItems(direction, count = 1) {
    const container = getActiveContainer()
    if (container === null) {
        return
    }

    const itemsBeforeScrollPos = container.scrollLeft / config.itemWidth
    let nextPage = 0
    if (itemsBeforeScrollPos % 1 !== 0) {
        const roundOp = direction > 0 ? Math.ceil : Math.floor
        nextPage = roundOp(itemsBeforeScrollPos) + direction * count
    } else {
        nextPage = itemsBeforeScrollPos + direction * count
    }

    goToItem(nextPage)
}

function goToItem(item) {
    const container = getActiveContainer()
    if (container !== null) {
        container.scrollLeft = item * config.itemWidth
    }
}

function goToPreviousContainer() {
    const target = getActiveContainer().previousElementSibling
    if (target !== null) {
        activateContainer(target)
    }
}

function goToNextContainer() {
    const target = getActiveContainer().nextElementSibling
    if (target !== null) {
        activateContainer(target)
    }
}

function getLastPage() {
    const container = getActiveContainer()
    return container.querySelectorAll(config.class.item).length - 1
}

function getActiveContainer() {
    // First check for an element holding the `active` class
    const activeElement = document.querySelector('.active')
    if (activeElement !== null) {
        return activeElement
    }

    const containerClassName = config.class.container.slice(1)
    if (document.activeElement.classList.contains(containerClassName)) {
        return document.activeElement
    }

    return null
}

function activateContainer(container) {
    document.querySelectorAll('.active').forEach(el => el.classList.remove('active'))
    container.classList.add('active')
    // container.focus()
    // container.scrollIntoView(false)
}





////////////////////////////////////////////////////////////////////////////////////////////////////
// MODAL WINDOW

let focusedElementBeforeModal

/*
* Based on some ideas from “The Incredible Accessible Modal Window” by Greg Kraus
* https://github.com/gdkraus/accessible-modal-dialog
*/
function enableModalButtons() {
    document.querySelectorAll('.open-modal').forEach(button => {
        button.addEventListener('click', openModal)
    })

    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', closeModal)
    })
}

function openModal() {
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

function closeModal() {
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

function closeModalOnBackground() {
    if (event.target === event.currentTarget) {
        closeModal()
    }
}

function closeModalOnEscape() {
    if (event.keyCode === 27) {
        closeModal()
    }
}

/*
* Make it impossible to focus an element outside the modal
*/
function trapTabKey() {
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
    return elements.filter(el => el.tabIndex > -1 && el.offsetParent !== null)
}





////////////////////////////////////////////////////////////////////////////////////////////////////
// LAZY LOADING PAGES

/*
* Observes document containers in order to load their page images only when
* they’re visible.
*/
function initializeLazyLoader() {
    const options = {
        rootMargin: `500px 0px`
    }

    containerObserver = new IntersectionObserver(containerHandler, options)
}

function containerHandler(entries, observer) {
    for (const entry of entries) {
        if (entry.isIntersecting) {
            const containerImages = entry.target.querySelectorAll('img[data-src]')
            // For each image …
            containerImages.forEach(img => {
                // … swap out the `data-src` attribute with the `src` attribute.
                // This will start loading the images.
                if (img.hasAttribute('data-src')) {
                    img.setAttribute('src', img.getAttribute('data-src'))
                    img.removeAttribute('data-src')
                }
            })

            containerImages[0].addEventListener('load', function() {
                handleFirstItemImageLoaded(entry.target)
            })

            // Unobserve the current target because no further action is required
            observer.unobserve(entry.target)
        }
    }
}

function handleFirstItemImageLoaded(container) {
    if (config.minimalDocumentHeight) {
        setPageAspectRatio(container)
    }
}

function setPageAspectRatio(container) {
    const imgSample = container.querySelector(`${config.class.item} > img`)
    const aspectRatio = imgSample.naturalWidth / imgSample.naturalHeight
    container.style.setProperty('--page-aspect-ratio', aspectRatio)
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
