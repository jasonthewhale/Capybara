// calculate the sum of every dark pattern
let countdown_value = 0;
let popup_value = 0;
let malicious_link_count = 0;
let display_count_down_count = 0;
let prechecked_value = 0;
let stock_value = 0;
let countdownElements = [];
let stockElements = [];
let precheckedElements = [];
let hiddenElements = [];
let currentCountdownIndex = -1;
let currentStockIndex = -1;
let currentPrecheckedIndex = -1;
let currentHiddenIndex = -1;
let typeElement;
let patternType = 'countdown';
let leftElement;
let rightElement;
let numElement;

// clone the body of the page
let oldBody = document.body.cloneNode(true);
const pureNumber = /^\d+$/;
// regex for countdown
const countdown = /(?:\d{1,2}\s*:\s*){1,3}\d{1,2}|(?:\d{1,2}\s*(?:days?|hours?|minutes?|seconds?|[a-zA-Z]{1,3}\.?)\s*){2,4}/gi;
// regex for not countdown
const notCountdown = /(?:\d{1,2}\s*:\s*){4,}\d{1,2}|(?:\d{1,2}\s*(?:days?|hours?|minutes?|seconds?|[a-zA-Z]{1,3}\.?)\s*){5,}/gi;
// stock keywords for only...left
const stockKey = /(?:only\s*\d+\s*left)|(?:almost\s*sold\s*out)/i;

// Get the current URL
const currentPageURL = window.location.href;
const countdownValues = {}; 
countdownValues[currentPageURL] = 0;

// List of keywords to check for
const keywords = ['expire', 'expires', 'offer', 'offers', 'promotion', 'promotions', 'discount', 'discounts', 'forgot', 'receive', 'voucher', 'reward', 'rewards'];

// Add a flag to track if a centered popup has been found
let centeredPopupFound = false; 

var imageUrl = chrome.runtime.getURL('images/floating_background.png');

window.onload = async function() {
    // Get all form inputs (checkboxes and radio buttons)
    const formInputs = document.querySelectorAll('input');

    // Iterate through form inputs
    formInputs.forEach(input => {
    // Check if the input is visible
    const isHidden = input.hidden;
    const isDisplayNone = window.getComputedStyle(input).getPropertyValue('display') === 'none';
    const rect = input.getBoundingClientRect();

    const isVisible = (
        rect.top > 0 &&
        rect.left > 0 &&
        rect.bottom < (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right < (window.innerWidth || document.documentElement.clientWidth)
    );

    if (input.checked && !isHidden && !isDisplayNone && isVisible) {
        // Highlight the preselected input label
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) {
            console.log(input, rect);
            prechecked_value++;
            // addCornerBorder(label);
            label.style.border = '3px solid black';
            if (!precheckedElements.includes(label)) {
                precheckedElements.push(label);
                sortElements(precheckedElements);
            }
        }
    } 

    });

    const isSearchEnginePage = window.location.href.includes('google.com/search');

    // Configuration for the observer (observe changes to attributes)
    const config = { attributes: true, attributeOldValue: true, childList: true, subtree: true, attributeFilter: ['style', 'class'] };

    if (!isSearchEnginePage) {
        setTimeout(function() {
            handleOverlaying(document.body);
        }, 0);
    }

    // Create a new MutationObserver instance
    const observer = new MutationObserver(async function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Check each added node in the mutation
                mutation.addedNodes.forEach(function(node) {
                    handleOverlaying(node);
                    traverseDOM(oldBody, document.body);
                });

                // Handle removed nodes
                mutation.removedNodes.forEach(function(node) {
                    handleRemovedNodes(node);
                });

            } else if (mutation.type === 'attributes' && (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                const target = mutation.target;
                const previousStyle = mutation.oldValue;
                const currentStyle = target.getAttribute('style');
                const previousClass = mutation.oldValue;
                const currentClass = target.getAttribute('class');
                
                const previousDisplay = getDisplayValue(previousStyle, previousClass);
                const currentDisplay = getDisplayValue(currentStyle, currentClass);

                if (previousDisplay !== currentDisplay) {
                    // console.log('display: ', target);
                    handleOverlaying(target);
                }
            }
        });

        // disconnect the observer to avoid duplicate checking
        // observer.disconnect();

        // Check countdown after every mutation
        // countdown_value = 0;
        // Set sleep time to avoid too frequent mutations
        // await new Promise(resolve => { setTimeout(resolve, 1500) });
        // Change to async function for stability
        // await traverseDOM(oldBody, document.body);

        if (display_count_down_count != countdown_value) {
            display_count_down_count = countdown_value;
        }

        if (centeredPopupFound) {
            popup_value = 1;
        } else {
            popup_value = 0;
        }

        chrome.runtime.sendMessage({
            countdown_value: countdown_value, 
            malicious_link_count: malicious_link_count, 
            prechecked_value: prechecked_value, 
            popup_value: popup_value,
            stock_value: stock_value,
        }, function(response) {
            // console.log("checked ", countdown_value, malicious_link_count, prechecked_value, popup_value);
        });

        // reconnect the observer
        observer.observe(document.body, config);
    });

    // Start observing the DOM with the given configuration
    // observer.observe(document.body, config);

    // Check hidden every 5 secs
    setInterval(async () => {
        // disconnect the observer to avoid duplicate checking
        observer.disconnect();
        findHidden(document.body);
        // console.log(`Found ${hiddenElements.length} malicious nodes`);
        // reconnect the observer
        observer.observe(document.body, config);
    }, 3000);
}

let overlayingDivs = [];

async function findDeepestOverlayingDiv(node, depth) {
    let deepestOverlayingDiv = null;
    let textContent = node.textContent.toLowerCase();
    let foundKeyword = keywords.find(keyword => textContent.includes(keyword));
    let includesImg;

    const maxDepth = 5;

    if (depth >= maxDepth) {
        return null;
    }

    // iterate all child nodes
    for (let i = 0; i < node.childNodes.length; i++) {
        const childNode = node.childNodes[i];

        if (childNode instanceof HTMLElement &&
            childNode.childNodes.length > 0 &&
            (foundKeyword || includesImg)
        ) {
            if (isElementOverlaying(childNode) || isElementFixedAndVisible(childNode)) {
                // if current node is overlaying，set it as deepest overlaying div
                deepestOverlayingDiv = childNode;
                // console.log('deep: ', deepestOverlayingDiv, deepestOverlayingDiv.getBoundingClientRect());
            }

            const childDeepestOverlayingDiv = await findDeepestOverlayingDiv(childNode, depth + 1);

            if (childDeepestOverlayingDiv !== null) {
                // if there is deeper overlaying div，update the deepest overlaying div
                deepestOverlayingDiv = childDeepestOverlayingDiv;
            }
        }

        // Add a delay here to yield to the main thread
        if (i % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }

    return deepestOverlayingDiv;
}

// Check if the element is overlaying
function isElementOverlaying(element) {
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    // Define a threshold for overlap
    const overlapThreshold = 0.9;

    // Calculate the area of intersection with the viewport
    const intersectionArea = Math.max(0, Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0)) *
        Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));

    // Calculate the area of the viewport
    const viewportArea = viewportWidth * viewportHeight;

    // Determine if the element covers a significant portion of the viewport
    return rect.width >= viewportWidth * 0.95 && rect.height >= viewportHeight * 0.95 && intersectionArea / viewportArea >= overlapThreshold;
}

function isElementFixedAndVisible(element) {
    const computedStyle = window.getComputedStyle(element);
    const isFixed = computedStyle.position === 'fixed';
    const isVisible = element.offsetParent !== null;

    return isFixed && isVisible;
}


function getDisplayValue(styleString, classString) {
    const styleMatch = styleString && styleString.match(/(?:^|\s)display:\s*([^;]*)(?:;|$)/i);
    const classMatch = classString && classString.match(/(?:^|\s)display:\s*([^;]*)(?:;|$)/i);
    
    return styleMatch ? styleMatch[1] : classMatch ? classMatch[1] : null;
}

async function handleOverlaying(element) {
    const deepestOverlayingDiv = await findDeepestOverlayingDiv(element, 0);
    if (deepestOverlayingDiv !== null) {
        console.log("deepest overlaying: ", deepestOverlayingDiv);
        centeredPopupFound = false;
        findCenteredPopup(deepestOverlayingDiv, 0);
    }
}

function findCenteredPopup(element, depth) {
    const maxDepth = 1;
    if (centeredPopupFound || depth > maxDepth) return; 

    let textContent = element.textContent.toLowerCase();
    let foundKeyword = keywords.find(keyword => textContent.includes(keyword));

    // Get the position and size information of the element
    const boundingBox = element.getBoundingClientRect();

    // Get the width and height of the viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Define a margin value
    const margin = 20;

    // Check if the element is centered with the margin
    if (
        Math.abs(boundingBox.left + boundingBox.width / 2 - viewportWidth / 2) < margin &&
        Math.abs(boundingBox.top + boundingBox.height / 2 - viewportHeight / 2) < margin &&
        boundingBox.height < viewportHeight * 0.8 &&
        boundingBox.width < viewportWidth * 0.7 &&
        foundKeyword
    ) {
        console.log('centered popup:', element);

        // addCornerBorder(element);
        // element.style.border = "5px solid black"
        addOverlay(element);
        centeredPopupFound = true;
        return;
    }

    // Recursively iterate through child div elements
    const childDivs = element.querySelectorAll('div');
    for (const childDiv of childDivs) {
        findCenteredPopup(childDiv, depth + 1);
    }
} 

function sortElements(elements) {
    elements.sort((a, b) => {
        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();
        
        if (rectA.top !== rectB.top) {
            return rectA.top - rectB.top;
        } else {
            return rectA.left - rectB.left;
        }
    });
}

// add cornerborder to the corresponding element
function addCornerBorder(element) {
    const cornerSize = '3px solid black';
    const cornerOffset = '0px';

    const cornerStyle = `
        position: absolute;
        width: 10px;
        height: 10px;
        z-index: 9999999;
        !important;
    `;

    const fragment = document.createDocumentFragment();

    const topLeftCorner = document.createElement('div');
    topLeftCorner.classList.add('corner-element');
    topLeftCorner.style = `
        ${cornerStyle}
        top: ${cornerOffset};
        left: ${cornerOffset};
        border-left: ${cornerSize};
        border-top: ${cornerSize};
    `;

    const topRightCorner = document.createElement('div');
    topRightCorner.classList.add('corner-element');
    topRightCorner.style = `
        ${cornerStyle}
        top: ${cornerOffset};
        right: ${cornerOffset};
        border-right: ${cornerSize};
        border-top: ${cornerSize};
    `;

    const bottomLeftCorner = document.createElement('div');
    bottomLeftCorner.classList.add('corner-element');
    bottomLeftCorner.style = `
        ${cornerStyle}
        bottom: ${cornerOffset};
        left: ${cornerOffset};
        border-left: ${cornerSize};
        border-bottom: ${cornerSize};
    `;

    const bottomRightCorner = document.createElement('div');
    bottomRightCorner.classList.add('corner-element');
    bottomRightCorner.style = `
        ${cornerStyle}
        bottom: ${cornerOffset};
        right: ${cornerOffset};
        border-right: ${cornerSize};
        border-bottom: ${cornerSize};
    `;

    fragment.appendChild(topLeftCorner);
    fragment.appendChild(topRightCorner);
    fragment.appendChild(bottomLeftCorner);
    fragment.appendChild(bottomRightCorner);

    element.appendChild(fragment);
}

function removeCornerBorder(element) {
    const cornerElements = element.querySelectorAll('.corner-element');

    cornerElements.forEach(cornerElement => {
        cornerElement.remove();
    });
}

// pop up button
function toggleFloatingButton() {
        const button = document.createElement('div');
        const leftBtn = document.createElement('button');
        const rightBtn = document.createElement('button');
        const close = document.createElement('button');
        const num = document.createElement('p');
        const type = document.createElement('p');

        leftBtn.classList.add('left-btn');
        leftElement = leftBtn;
        rightBtn.classList.add('right-btn');
        rightElement = rightBtn;
        num.classList.add('total-count');
        numElement = num;
        type.classList.add('type');
        typeElement = type;
        close.classList.add('close-floating');

        button.classList.add('floating-button');
        // type.innerText = patternType;

        button.style.position = 'fixed';
        button.style.bottom = '20px'; 
        button.style.right = '20px';  
        button.style.zIndex = '99999';
        button.style.cursor = 'move';

        let isDragging = false;
        let startPosX, startPosY;
        let startMouseX, startMouseY;

        button.addEventListener('mousedown', (e) => {
            isDragging = true;
            startPosX = parseFloat(button.style.right);
            startPosY = parseFloat(button.style.bottom);
            startMouseX = e.clientX;
            startMouseY = e.clientY;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const offsetX = e.clientX - startMouseX;
            const offsetY = e.clientY - startMouseY;

            const newRight = startPosX - offsetX;
            const newBottom = startPosY - offsetY;
        
            // Get the size of the viewport
            const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        
            // calculate boundary
            const maxRight = viewportWidth - button.offsetWidth;
            const maxBottom = viewportHeight - button.offsetHeight;
        
            // limit button inside
            const limitedRight = Math.min(maxRight, Math.max(0, newRight));
            const limitedBottom = Math.min(maxBottom, Math.max(0, newBottom));
        
            button.style.right = `${limitedRight}px`;
            button.style.bottom = `${limitedBottom}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        document.body.appendChild(button);
        button.appendChild(close);
        button.appendChild(num);
        button.appendChild(leftBtn);
        button.appendChild(rightBtn);
        button.appendChild(type);

        close.addEventListener('click', function() {
            button.remove();
            removeBackground();
            removeCornerBorder(document.body);
        });

        setDefaultCount(currentCountdownIndex, countdownElements);
}

function setDefaultCount(currentIndex, elements) {
    if (elements.length > 0) {
        leftElement.innerText = (currentIndex > 0) ? currentIndex : elements.length;
    } else {
        leftElement.innerText = '';
    }
    numElement.innerText = (currentIndex >= 0) ? currentIndex + 1 : '';
    if (elements.length > 0) {
        rightElement.innerText = (currentIndex < elements.length - 1) ? currentIndex + 2 : 1;
    } else {
        rightElement.innerText = '';
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "toggleFloatingButton") {
        const existingButton = document.querySelector('.floating-button');

        if (!existingButton) {
            toggleFloatingButton();
        }
    }
    if (message.type) {
        patternType = message.type
        typeElement.innerText = patternType;
        // console.log(patternType);
        showPattern();
    }

    if (message.default) {
        patternType = message.default
        typeElement.innerText = patternType;
        console.log(message.default);
        showPattern(); 
    }

    rightElement.removeEventListener('click', handleRightButtonClickWrapper);
    leftElement.removeEventListener('click', handleLeftButtonClickWrapper);

    rightElement.addEventListener('click', handleRightButtonClickWrapper);  
    leftElement.addEventListener('click', handleLeftButtonClickWrapper);
});

function showPattern() {
    const existingBackground = document.querySelector('.rgbbackground');

    if (patternType == 'preselected') {
        setDefaultCount(currentPrecheckedIndex, precheckedElements);
        if (precheckedElements.length > 0) {
            currentPrecheckedIndex = 0;
            scrollToCurrentCountdownElement(currentPrecheckedIndex, precheckedElements);
        } else {
            existingBackground.remove();
            removeCornerBorder(document.body);
        }
    } else if (patternType == 'countdown') {
        setDefaultCount(currentCountdownIndex, countdownElements);
        if (countdownElements.length > 0) {
            currentCountdownIndex = 0;
            scrollToCurrentCountdownElement(currentCountdownIndex, countdownElements);
        } else {
            existingBackground.remove();
            removeCornerBorder(document.body);
        }
    } else if (patternType == 'hidden info') {
        setDefaultCount(currentHiddenIndex, hiddenElements);
        if (hiddenElements.length > 0) {
            currentHiddenIndex= 0;
            scrollToCurrentCountdownElement(currentHiddenIndex, hiddenElements);
        } else {
            existingBackground.remove();
            removeCornerBorder(document.body);
        }
    } else if (patternType == 'stock') {
        setDefaultCount(currentStockIndex, stockElements);
        if (stockElements.length > 0) {
            currentStockIndex = 0;
            scrollToCurrentCountdownElement(currentStockIndex, stockElements);
        } else {
            existingBackground.remove();
            removeCornerBorder(document.body);
        }
    }else {
        setDefaultCount(-1, []);
        existingBackground.remove();
        removeCornerBorder(document.body);
    }
}

function handleRightButtonClick(currentIndex, elements) {
    if (currentIndex < elements.length - 1) {
        currentIndex++;
    } else {
        currentIndex = 0;
    }
    console.log('index: ', currentIndex);
    return currentIndex;
}

function handleRightButtonClickWrapper() {
    if (patternType == 'countdown' && countdownElements.length > 0) {
        currentCountdownIndex = handleRightButtonClick(currentCountdownIndex, countdownElements);
        scrollToCurrentCountdownElement(currentCountdownIndex, countdownElements);
    } else if (patternType == 'preselected' && precheckedElements.length > 0) {
        currentPrecheckedIndex = handleRightButtonClick(currentPrecheckedIndex, precheckedElements);
        scrollToCurrentCountdownElement(currentPrecheckedIndex, precheckedElements);
    } else if (patternType == 'hidden info' && hiddenElements.length > 0) {
        currentHiddenIndex = handleRightButtonClick(currentHiddenIndex, hiddenElements);
        scrollToCurrentCountdownElement(currentHiddenIndex, hiddenElements);
    } else if (patternType == 'stock' && stockElements.length > 0) {
        currentStockIndex = handleRightButtonClick(currentStockIndex, stockElements);
        scrollToCurrentCountdownElement(currentStockIndex, stockElements);
    }
}

function handleLeftButtonClick(currentIndex, elements) {
    if (currentIndex > 0) {
        currentIndex--;
    } else {
        currentIndex = elements.length - 1;
    }
    return currentIndex;
}

function handleLeftButtonClickWrapper() {
    if (patternType == 'countdown' && countdownElements.length > 0) {
        currentCountdownIndex = handleLeftButtonClick(currentCountdownIndex, countdownElements);
        scrollToCurrentCountdownElement(currentCountdownIndex, countdownElements);
    } else if (patternType == 'preselected' && precheckedElements.length > 0) {
        currentPrecheckedIndex = handleLeftButtonClick(currentPrecheckedIndex, precheckedElements);
        scrollToCurrentCountdownElement(currentPrecheckedIndex, precheckedElements);
    } else if (patternType == 'hidden info' && hiddenElements.length > 0) {
        currentHiddenIndex = handleLeftButtonClick(currentHiddenIndex, hiddenElements);
        scrollToCurrentCountdownElement(currentHiddenIndex, hiddenElements);
    } else if (patternType == 'stock' && stockElements.length > 0) {
        currentStockIndex = handleLeftButtonClick(currentStockIndex, stockElements);
        scrollToCurrentCountdownElement(currentStockIndex, stockElements);
    }
}

function scrollToCurrentCountdownElement(currentIndex, elements) {
    const currentElement = elements[currentIndex];

    if (currentElement) {
        currentElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center"
        });

        removeCornerBorder(document.body);
        addBackground();

        setTimeout(() => {
            const backgroundDiv = document.querySelector('.rgbbackground');
            addCornerBorder(currentElement);
            updateClip(backgroundDiv, currentElement);
        }, 1000);

        setDefaultCount(currentIndex, elements);
        console.log('index: ', currentIndex, 'list: ', elements, 'element: ', currentElement, 'length:', elements.length);
    }
}

function addBackground() {
    const existingBackground = document.querySelector('.rgbbackground');
    if (existingBackground) {
        existingBackground.remove();
    }

    const overlayDiv = document.createElement('div');
    overlayDiv.classList.add('rgbbackground');

    // set style
    overlayDiv.style.position = 'fixed';
    overlayDiv.style.top = '0';
    overlayDiv.style.left = '0';
    overlayDiv.style.right = '0';
    overlayDiv.style.bottom = '0';
    overlayDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; 
    overlayDiv.style.zIndex = '9998'; 

    document.body.appendChild(overlayDiv);

    overlayDiv.addEventListener('click', function() {
        overlayDiv.remove();
        removeCornerBorder(document.body);
    });
}

function updateClip(overlayDiv, selectedElement) {
    const selectedElementRect = selectedElement.getBoundingClientRect();
    overlayDiv.style.clipPath = `polygon(
        0% 0%, 
        100% 0%, 
        100% ${selectedElementRect.top}px, 
        ${selectedElementRect.left}px ${selectedElementRect.top}px, 
        ${selectedElementRect.left}px ${selectedElementRect.bottom}px, 
        ${selectedElementRect.right}px ${selectedElementRect.bottom}px, 
        ${selectedElementRect.right}px ${selectedElementRect.top}px, 
        100% ${selectedElementRect.top}px, 
        100% 100%, 
        0% 100%
    )`;
}

function removeBackground() {
    const existingBackground = document.querySelector('.rgbbackground');
    if (existingBackground) {
        existingBackground.remove();
    }
}

// loop through all text nodes
async function traverseDOM(oldNode, node) {
  var children = node.childNodes;
  var oldChildren = oldNode.childNodes;
  
  if(node.tagName === 'STYLE' || node.tagName === 'SCRIPT') {
    return; // Ignore style and script tags
  }

  for(var i = 0; i < children.length; i++) {
    if(children[i].nodeType === 3) { // text node

        // check if the text node is a stock
        if(stockKey.test(children[i].nodeValue)){
            const stockElement = children[i].parentNode;
            stockElement.style.border = '3px solid black';
            if (!stockElements.includes(stockElement)) {
                stockElements.push(stockElement);
                sortElements(stockElements);
            }
            stock_value = stockElements.length;
           
        }

        // check if the text node is a countdown
        if(pureNumber.test(children[i].nodeValue)){
            if(!oldChildren || (oldChildren[i] && children[i].nodeValue !== oldChildren[i].nodeValue)) {
                let aimNode = children[i].parentNode.parentNode;
                let allTexts = extractAllTextNodes(aimNode).join(''); // get all text nodes in the same level
                
                if (countdown.test(allTexts) && !notCountdown.test(allTexts)) {
                    const countdownElement = children[i].parentNode.parentNode;
                    countdownElement.style.border = '3px solid black';
                    if (!countdownElements.includes(countdownElement)) {
                        countdownElements.push(countdownElement);
                        sortElements(countdownElements);
                    }
                    countdown_value = countdownElements.length;
                }
            }
        }
        // Add processed class to mark this element has been processed
        // children[i].classList.add('processed');
    }
    
    // recursively traverse the DOM tree
    if (oldChildren[i]) {
      traverseDOM(oldChildren[i], children[i]);
    }
  }
}

// extract all text nodes in the same level of element
function extractAllTextNodes(element, result = []) {
    let children = element.childNodes;

    for (let i = 0; i < children.length; i++) {
        let child = children[i];

        if (child.nodeType === 3) { // if it is a text node
            result.push(child.nodeValue);
        } else if (child.nodeType === 1) { // if it is an element node
            extractAllTextNodes(child, result);
        }
    }

    return result;
}

async function findHidden(body) {
    for (var i = 0; i < body.childNodes.length; i++) {
        catchHidden(body.childNodes[i]);
    }
}

function catchHidden(node) {
    // This is your current filter processing on node
    let style = window.getComputedStyle(node.parentNode, null)
    let parentStyle = window.getComputedStyle(node.parentNode.parentNode, null)
    let fontSize = style.getPropertyValue('font-size');
    fontSize = parseFloat(fontSize);
    if (fontSize <= 12
        && node.nodeType === 3
        && !isFooter(node)
        && match_hidden(node.nodeValue)
        && node.parentNode.tagName !== 'STYLE' 
        && node.parentNode.tagName !== 'SCRIPT') {
        // node.parentNode.style.color = "red";
        node.parentNode.style.display = "block";
        node.parentNode.style.visibility = "visible";
        // Add black border to hidden text
        // console.log(`Found hidden info, className: ${node.className}, fontSize: ${fontSize}`, node, node.parentNode);
        labelPattern(node);
        const hoverDiv = node.parentNode.querySelector('.tooltip');
        /** 
        if (!hoverDiv) {
            addHoverEffect(node.parentNode,2);
        }**/
        if (!hiddenElements.includes(node.parentNode)) {
            if (currentPageURL.includes('amazon')) {
                if (node.parentNode.className instanceof String
                    && !node.parentNode.className.includes('vjs-modal-dialog-description')) { 
                    // temp condition for AMAZON
                    hiddenElements.push(node.parentNode);
                    sortElements(hiddenElements);
                }
            }
            else {
                hiddenElements.push(node.parentNode);
                sortElements(hiddenElements);
            }
        }
    };
    
    if (style.color && parentStyle.backgroundColor && node.nodeType === 3) {
        let similarity = colorSimilarityNormalized(getRGBArray(parentStyle.backgroundColor), 
            getRGBArray(style.color));
        if (similarity >= 0.9
            && similarity < 1
            && node.parentNode.style.visibility === "visible") {
            // console.log(`Found similar colour, className: ${node.className}, 
            //     fontSize: ${fontSize}, similarity: ${similarity}, ${node}, ${node.parentNode}`);
            // Add black border to hidden text
            labelPattern(node);
            const hoverDiv = node.parentNode.querySelector('.tooltip');
            /**if (!hoverDiv) {
                addHoverEffect(node.parentNode,2);
            }**/
            if (!hiddenElements.includes(node.parentNode)) {
                hiddenElements.push(node.parentNode);
                sortElements(hiddenElements);
            }
        }
    };

    if (node.parentNode.hasAttribute('href')
        && (node.parentNode.getAttribute('href').startsWith('http')
        || node.parentNode.getAttribute('href').includes('.html'))) {
        // console.log(`Found link, className: ${node.className}, fontSize: ${fontSize}`);
    }

    if (node.hasChildNodes()) {
        for(let child of node.childNodes) {
            catchHidden(child);
        }
    }

    malicious_link_count = hiddenElements.length;
};

/////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Start of helper functions
 */

// Helper function to calculate the similarity between two colArrs
function colorSimilarityNormalized(rgb1, rgb2) {
    let rDiff = rgb1[0] - rgb2[0];
    let gDiff = rgb1[1] - rgb2[1];
    let bDiff = rgb1[2] - rgb2[2];
    let maxEuclideanDist = Math.sqrt(Math.pow(255, 2) * 3);
    let dist = Math.sqrt(Math.pow(rDiff,2) + Math.pow(gDiff,2) + Math.pow(bDiff,2));
    // Range of similarity is [0, 1]
    return 1 - (dist / maxEuclideanDist);
}

// Helper function to fetch rgb values from a color string
function getRGBArray(colorStr) {
    // Remove "rgb(", "rgba(", ")" and spaces,
    // then split into an array with the red, green, and blue values
    let colorArr = colorStr.replace(/rgba?\(|\)|\s/g, '').split(',');
    // Convert the color values to numbers
    colorArr = colorArr.map(numStr => Number(numStr));
    // If the colorStr was in "rgba" format, remove the alpha value
    if (colorArr.length > 3) colorArr.pop();
    return colorArr;
}

// Helper function to get formatted iframe from iframe text
function getIframe(textIframe) {
    let parser = new DOMParser();
    let dom = parser.parseFromString(textIframe, 'text/html');
    return dom.querySelector('iframe');
}

// Fetch the nearest parent className
function checkClassName(element, keywords) {
    if (element === null) {
        return false;
    }

    let className = element.className;
    if (className !== null && className instanceof String && keywords.some(keyword => className.includes(keyword))) {
        return true;
    }

    // Recursively check the parent element
    return checkClassName(element.parentElement);
}

// Check if the node is in the footer (Unable to catch Temu since its className is a mess)
function isFooter(node) {
    if (node.parentNode 
        && node.parentNode.parentNode
        && (node.parentNode.tagName === 'UL' || node.parentNode.tagName === 'LI' || node.parentNode.parentNode.tagName === 'UL' || node.parentNode.parentNode.tagName === 'LI')) {
            return true;
    }
    return false;
}

// Standardize the style of border
function labelPattern(childNode) {
    childNode.parentNode.style.border = 'solid black';
    childNode.parentNode.style.borderWidth = '3px';
}

// Standardize the style of highlight
function highlightPattern(childNode) {
    childNode.parentNode.style.backgroundColor = 'yellow';
    childNode.parentNode.style.color = 'red';
}


function match_hidden(nodeValue) {
    let hidden_trigger = ['offer', 'promotion', 'discount', 'forgot', 'voucher', 'tax', 'subscribe', 'subscription', 'cancel', 'pay', 'trial', 'plan'];
    return hidden_trigger.some(function(keyword) {
        let regExp = new RegExp(keyword, "i");
        if (regExp.test(nodeValue.toLowerCase())) {
          return true;
        }
    });
}

function isChild(node, elements) {
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].childNode && elements[i].childNodes.includes(node)) {
            return true;
        }
    }
    return false;
}

let extensionID = chrome.runtime.id;

/**
function addHoverEffect(element,type) {
    if (!element || typeof element.querySelector !== 'function') {
        console.error('Invalid element:', element);
        return;
    }

    element.classList.add('hover-element');
    const tooltip = document.createElement('div');

    tooltip.classList.add('tooltip');
    if (type == 1){
        tooltip.innerHTML = `
        <span class="warning">CAUTION</span>
        This is a countdown element, a dark design often associated with urgency or time pressure
        <a href="https://infs3202-6844f4bb.uqcloud.net/7381/dark" class="copy-link">Copy Link to Learn More</a>
        `;
    }else if (type == 2){
        tooltip.innerHTML = `
        <span class="warning">CAUTION</span>
        This website may contain hidden information, a dark design tactic used to manipulate user perception.
        <a href="https://infs3202-6844f4bb.uqcloud.net/7381/dark" class="copy-link">Copy Link to Learn More</a>
        `;
    }
   

    const link = tooltip.querySelector('.copy-link');
    link.addEventListener('click', function(event) {
        event.preventDefault();
        navigator.clipboard.writeText(event.target.getAttribute('href'))
        .then(() => {
            alert('URL copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
        });
    });

    element.appendChild(tooltip);

    element.addEventListener('mouseenter', function() {
        let rect = element.getBoundingClientRect();
        if (rect.bottom + tooltip.offsetHeight > window.innerHeight) {
            tooltip.style.top = `${-tooltip.offsetHeight}px`;
        } else {
            tooltip.style.top = '100%';
        }
        tooltip.style.display = 'block';
    });

    element.addEventListener('mouseleave', function() {
        tooltip.style.display = 'none';
    });
}
**/

// remove countdown elements when they are removed
function handleRemovedNodes(removedNode){
    const index = countdownElements.indexOf(removedNode);
    if(index !== -1) {
        countdownElements.splice(index, 1);
        countdown_value = countdownElements.length;
        console.log("removed countdown", countdown_value);
    }
    // Check child elements as a removed node might contain multiple child nodes
    for(let child of removedNode.childNodes) {
        if(child.nodeType === Node.ELEMENT_NODE) {
            handleRemovedNodes(child);
        }
    }
}

function addOverlay(element) {
    const existingOverlay = document.querySelector('.overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    overlay.style.zIndex = '9998';
    overlay.style.boxShadow = '0 0 50px rgba(255, 255, 255, 0.5)';

    element.style.position = 'fixed';
    element.style.overflow = 'visible';
    element.style.minHeight = '0 !important';

    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip-red');
    tooltip.style.display = 'block';
    tooltip.innerText = 'This is a Pop-up window! It gets in the way of what you want to do and guides you to take specific actions.';

    overlay.appendChild(tooltip);
    element.appendChild(overlay);

    overlay.addEventListener('click', function() {
        overlay.remove();
    });
}