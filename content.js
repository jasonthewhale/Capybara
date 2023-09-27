// calculate the sum of every dark pattern
let countdown_value = 0;
let popup_value = 0;
let malicious_link_count = 0;
let display_count_down_count = 0;
let prechecked_value = 0;

// clone the body of the page
let oldBody = document.body.cloneNode(true);
const pureNumber = /^\d+$/;
// regex for countdown
const countdown = /(?:\d{1,2}\s*:\s*){1,3}\d{1,2}|(?:\d{1,2}\s*(?:days?|hours?|minutes?|seconds?|[a-zA-Z]{1,3}\.?)\s*){2,4}/gi;
// regex for not countdown
const notCountdown = /(?:\d{1,2}\s*:\s*){4,}\d{1,2}|(?:\d{1,2}\s*(?:days?|hours?|minutes?|seconds?|[a-zA-Z]{1,3}\.?)\s*){5,}/gi;

// Get the current URL
const currentPageURL = window.location.href;
const countdownValues = {}; 
countdownValues[currentPageURL] = 0;

// List of keywords to check for
const keywords = ['offer', 'offers', 'promotion', 'promotions', 'discount', 'discounts', 'forgot', 'receive', 'voucher', 'reward', 'rewards'];

// Add a flag to track if a centered popup has been found
let centeredPopupFound = false; 

var imageUrl = chrome.runtime.getURL('images/floating_background.png');

window.onload = function() {
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
        console.log(input, rect);
        prechecked_value++;
        if (label) {
            addCornerBorder(label);
        }
    }

    // check every 5s
    // setInterval(() => {
    //     countdown_value = 0;
      
    //     traverseDOM(oldBody, document.body);
    //     if (display_count_down_count >= countdown_value) {
    //       countdown_value = display_count_down_count;
    //     }
    //     display_count_down_count = countdown_value;
      
    //     chrome.runtime.sendMessage({countdown_value: countdown_value, malicious_link_count: malicious_link_count}, function(response) {
    //       console.log("checked ", countdown_value, malicious_link_count);
    //     });
      
    // }, 5000);  

    });

    handleOverlaying(document.body);
    
    // Create a new MutationObserver instance
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Check each added node in the mutation
                mutation.addedNodes.forEach(function(node) {
                   handleOverlaying(node);
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
                    handleOverlaying(target);
                }
            }
        });

        // Check countdown after every mutation
        countdown_value = 0;
        traverseDOM(oldBody, document.body);

        if (display_count_down_count >= countdown_value) {
            countdown_value = display_count_down_count;
        }
        display_count_down_count = countdown_value;

        chrome.runtime.sendMessage({countdown_value: countdown_value, malicious_link_count: malicious_link_count, prechecked_value: prechecked_value}, function(response) {
            console.log("checked ", countdown_value, malicious_link_count, prechecked_value);
        });
    });

    // Configuration for the observer (observe changes to attributes)
    const config = { attributes: true, attributeOldValue: true, childList: true, subtree: true, attributeFilter: ['style', 'class'] };

    // Start observing the DOM with the given configuration
    observer.observe(document.body, config); 
    
};

function findDeepestOverlayingDiv(node) {
    let deepestOverlayingDiv = null;
  
    // iterate all child nodes
    for (let i = 0; i < node.childNodes.length; i++) {
      const childNode = node.childNodes[i];
  
        if (childNode instanceof HTMLElement && !childNode.classList.contains('processed')) {
            if (isElementOverlaying(childNode)) {
                // if current node is overlaying，set it as deepest overlaying div
                deepestOverlayingDiv = childNode;
            }

            const childDeepestOverlayingDiv = findDeepestOverlayingDiv(childNode);

            if (childDeepestOverlayingDiv !== null) {
                // if there is deeper overlaying div，update the deepest overlaying div
                deepestOverlayingDiv = childDeepestOverlayingDiv;
            }

            // Add processed class to mark this element has been processed
            childNode.classList.add('processed');
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
    return rect.width >= viewportWidth && rect.height >= viewportHeight && intersectionArea / viewportArea >= overlapThreshold;
}


function getDisplayValue(styleString, classString) {
    const styleMatch = styleString && styleString.match(/(?:^|\s)display:\s*([^;]*)(?:;|$)/i);
    const classMatch = classString && classString.match(/(?:^|\s)display:\s*([^;]*)(?:;|$)/i);
    
    return styleMatch ? styleMatch[1] : classMatch ? classMatch[1] : null;
}

function handleOverlaying(element) {
    let deepestOverlayingDiv = findDeepestOverlayingDiv(element);
    if (deepestOverlayingDiv !== null) {
        console.log("deepest overlaying: ", deepestOverlayingDiv);
        centeredPopupFound = false;
        findCenteredPopup(deepestOverlayingDiv);
    }
}

function findCenteredPopup(element) {
    if (centeredPopupFound) return; 
    
    var textContent = element.textContent.toLowerCase();
    const foundKeyword = keywords.find(keyword => textContent.includes(keyword));
    var includesImg;

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
        (foundKeyword || includesImg)
    ) {
        console.log('centered popup:', element);

        addCornerBorder(element);
        centeredPopupFound = true;
        popup_value++;
        return;
    }

    // Recursively iterate through child div elements
    const childDivs = element.querySelectorAll('div');
    for (const childDiv of childDivs) {
        findCenteredPopup(childDiv);
    }
} 

// add cornerborder to the corresponding element
function addCornerBorder(element) {
    const cornerSize = '3px solid black';
    const cornerOffset = '0px';

    const cornerStyle = `
        position: absolute;
        width: 8px;
        height: 8px;
        z-index: 9999999;
        !important;
    `;

    const fragment = document.createDocumentFragment();

    const topLeftCorner = document.createElement('div');
    topLeftCorner.style = `
        ${cornerStyle}
        top: ${cornerOffset};
        left: ${cornerOffset};
        border-left: ${cornerSize};
        border-top: ${cornerSize};
    `;

    const topRightCorner = document.createElement('div');
    topRightCorner.style = `
        ${cornerStyle}
        top: ${cornerOffset};
        right: ${cornerOffset};
        border-right: ${cornerSize};
        border-top: ${cornerSize};
    `;

    const bottomLeftCorner = document.createElement('div');
    bottomLeftCorner.style = `
        ${cornerStyle}
        bottom: ${cornerOffset};
        left: ${cornerOffset};
        border-left: ${cornerSize};
        border-bottom: ${cornerSize};
    `;

    const bottomRightCorner = document.createElement('div');
    bottomRightCorner.style = `
        ${cornerStyle}
        bottom: ${cornerOffset};
        right: ${cornerOffset};
        border-right: ${cornerSize};
        border-bottom: ${cornerSize};
    `;

    const detectBackground = document.createElement('div');
    detectBackground.style = `
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        background-color: blue;
        opacity: 1;
        z-index = 999999;
        !important;
    `
    const testElement = document.createElement('div');
    testElement.style = `
        position: absolute;
        height: 30px;
        width: 30px;
        background-color: red;
        top: 300px;
        left: 50px;
        z-index = 999999;
    `
    // document.body.appendChild(detectBackground);
    // detectBackground.appendChild(testElement);
    fragment.appendChild(topLeftCorner);
    fragment.appendChild(topRightCorner);
    fragment.appendChild(bottomLeftCorner);
    fragment.appendChild(bottomRightCorner);

    element.appendChild(fragment);
}

// pop up button
function toggleFloatingButton() {
    const existingButton = document.querySelector('.floating-button');

    if (existingButton) {
        existingButton.remove();
    } else {
        const button = document.createElement('div');
        const leftBtn = document.createElement('button');
        const rightBtn = document.createElement('button');
        const close = document.createElement('button');
        const num = document.createElement('p');
        const type = document.createElement('p');

        leftBtn.classList.add('left-btn');
        rightBtn.classList.add('right-btn');
        num.classList.add('total-count');
        type.classList.add('type');
        close.classList.add('close');

        button.classList.add('floating-button');
        leftBtn.innerText = '22';
        num.innerText = '23';
        rightBtn.innerText = '24';
        type.innerText = 'countdown';

        button.style.position = 'fixed';
        button.style.bottom = '20px'; 
        button.style.right = '20px';  
        button.style.zIndex = '9999';
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

            button.style.right = `${startPosX - offsetX}px`;
            button.style.bottom = `${startPosY - offsetY}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        document.body.appendChild(button);
        button.appendChild(close);
        button.appendChild(num);
        button.appendChild(leftBtn);
        button.appendChild(rightBtn);
        // button.appendChild(type);

        close.addEventListener('click', function() {
            button.remove();
        });
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "toggleFloatingButton") {
        toggleFloatingButton();
    }
});

// loop through all text nodes
function traverseDOM(oldNode, node) {
  var children = node.childNodes;
  var oldChildren = oldNode.childNodes;
  
  if(node.tagName === 'STYLE' || node.tagName === 'SCRIPT') {
    return; // Ignore style and script tags
  }

  for(var i = 0; i < children.length; i++) {

        /**
     * If the node is an element node, the nodeType property will return 1.
     * If the node is an attribute node, the nodeType property will return 2.
     * If the node is a text node, the nodeType property will return 3.
     */

    // const catchHidden = (node) => {
    //     /**
    //      * Some extra conditions to check
    //      * 
    //      * 1. Similarity of color and bgColor:
    //      *      let bgCol = children[i].parentNode.style.backgroundColor;
    //      *      let col = children[i].style.color;
    //      *      let similarity = colorSimilarityNormalized(getRGBArray(bgCol), getRGBArray(col));
    //      * 2. The nearest parent className
    //      *      isFooter(childNode)
    //      * 3. Opacity (threshold as 0.5, [0, 1] => [transparent, opaque])
    //      */
    //     // This is your current filter processing on node
    //     let style = window.getComputedStyle(node.parentNode, null)
    //     let parentStyle = window.getComputedStyle(node.parentNode.parentNode, null)
    //     let fontSize = style.getPropertyValue('font-size');
    //     fontSize = parseFloat(fontSize);
    //     if (fontSize <= 12
    //         && node.nodeType === 3
    //         && match_hidden(node.nodeValue)
    //         && node.parentNode.tagName !== 'STYLE' 
    //         && node.parentNode.tagName !== 'SCRIPT') {
    //         console.log(`Found hidden info, className: ${node.className}, fontSize: ${fontSize}`);
    //         node.parentNode.style.color = "red";
    //         node.parentNode.style.display = "block";
    //         node.parentNode.style.visibility = "visible";
    //         // Add black border to hidden text
    //         labelPattern(node);
    //         // malicious_link_count ++;
    //     };
        
    //     if (style.color && parentStyle.backgroundColor) {
    //         let similarity = colorSimilarityNormalized(getRGBArray(parentStyle.backgroundColor), getRGBArray(style.color));
    //         if (similarity >= 0.9 
    //             && similarity < 1
    //             && node.parentNode.tagName === 'A') {
    //             console.log(`Found similar colour, className: ${node.className}, fontSize: ${fontSize}, similarity: ${similarity}`);
    //             // Add black border to hidden text
    //             labelPattern(node);
    //         }
    //     };

    //     // if (node.parentNode.hasAttribute('href')
    //     //     && (children[i].parentNode.getAttribute('href').startsWith('http')
    //     //     || node.getAttribute('href').includes('.html')))

    //     if (node.hasChildNodes()){
    //         for(let child of node.childNodes){
    //             catchHidden(child);
    //         }
    //     }
    // };
    // catchHidden(children[i])

    if(children[i].nodeType === 3 ) { // text node
        
        // check if the text node is a countdown
        if(pureNumber.test(children[i].nodeValue)){
            if(!oldChildren || (oldChildren[i] && children[i].nodeValue !== oldChildren[i].nodeValue)) {
                let aimNode = children[i].parentNode.parentNode;
                let allTexts = extractAllTextNodes(aimNode).join(''); // get all text nodes in the same level
                
                if (countdown.test(allTexts) && !notCountdown.test(allTexts)) {
                    children[i].parentNode.parentNode.style.backgroundColor = "red";
                    // addCornerBorder(children[i].parentNode.parentNode);
                    console.log("found countdown", allTexts);
                    countdown_value++;
                }
            }
        }
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
function _recurClassNameFinder(childNode) {
    if (childNode.parentNode && childNode.parentNode.className instanceof String && childNode.parentNode.className !== null) {
        return childNode.parentNode.className;
    } else if (childNode.parentNode) {
        return _recurClassNameFinder(childNode.parentNode);
    } else {
        return null;
    }
}

// Check if the node is in the footer (Unable to catch Temu since its className is a mess)
function isFooter(childNode) {
    let className = _recurClassNameFinder(childNode);
    if (className === null) {
        console.log('className is null');
        return false;
    }
    className = className.toLowerCase();
    className = _recurClassNameFinder(childNode).toLowerCase();
    if (typeof className !== 'string') {
        console.log(`${className} is not a string`)
        return true;
    }
    let ftKeyWords = ['ft', 'nav', 'footer'];
    return ftKeyWords.find(keyword => className.includes(keyword));
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
    let hidden_trigger = ['offer', 'promotion', 'discount', 'forgot', 'voucher', 'tax', 'subscribe', 'cancel', 'pay'];
    return hidden_trigger.some(function(keyword) {
        let regExp = new RegExp(keyword, "i");
        if (regExp.test(nodeValue.toLowerCase())) {
          return true;
        }
    });
} 
