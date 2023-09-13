// calculate the sum of every dark pattern
let countdown_value = 0;
let poup_value = 0;
let malicious_link_count = 0;
let display_count_down_count = 0;

// clone the body of the page
let oldBody = document.body.cloneNode(true);
const pureNumber = /^\d+$/;
// regex for countdown
const countdown = /(?:\d{1,2}\s*:\s*){1,3}\d{1,2}|(?:\d{1,2}\s*(?:days?|hours?|minutes?|seconds?|[a-zA-Z]{1,3}\.?)\s*){2,4}/gi;
// regex for not countdown
const notCountdown = /(?:\d{1,2}\s*:\s*){4,}\d{1,2}|(?:\d{1,2}\s*(?:days?|hours?|minutes?|seconds?|[a-zA-Z]{1,3}\.?)\s*){5,}/gi;

window.onload = function() {
    // Get the current URL
    const currentPageURL = window.location.href;
    const countdownValues = {}; 
    countdownValues[currentPageURL] = 0;

    // List of keywords to check for
    const keywords = ['offer', 'offers', 'promotion', 'promotions', 'discount', 'discounts', 'forgot', 'receive', 'voucher'];

    // Get all form inputs (checkboxes and radio buttons)
    const formInputs = document.querySelectorAll('input');

    // Iterate through form inputs
    formInputs.forEach(input => {
    if (input.checked) {
        // Highlight the preselected input label
        const label = document.querySelector(`label[for="${input.id}"]`);
        console.log(input);
        if (label) {
            label.style.backgroundColor = 'yellow';
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


    // Create a new MutationObserver instance
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Check each added node in the mutation
                mutation.addedNodes.forEach(function(node) {
                    analyzeNodeForPopUp(node);
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
                    analyzeNodeForPopUp(target);
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

        chrome.runtime.sendMessage({countdown_value: countdown_value, malicious_link_count: malicious_link_count}, function(response) {
            console.log("checked ", countdown_value, malicious_link_count);
        });
    });

    // Configuration for the observer (observe changes to attributes)
    const config = { attributes: true, attributeOldValue: true, childList: true, subtree: true, attributeFilter: ['style', 'class'] };

    // Start observing the DOM with the given configuration
    observer.observe(document.body, config);

    function analyzeNodeForPopUp(node) {
        if (node instanceof HTMLElement) {
            var textContent = node.textContent.toLowerCase();
            const foundKeyword = keywords.find(keyword => textContent.includes(keyword));
            var includesImg;

            if (node instanceof HTMLIFrameElement) {
                node.addEventListener('DOMContentLoaded', function() {
                    const iframeBody = node.contentWindow.document.body;

                    console.log(iframeBody, iframeBody.firstChild);      
                });

            }

            // Check for overlay behavior
            if(isElementOverlaying(node) && (foundKeyword || includesImg)) {
                console.log('Potential pop-up behavior: overlaying', node);
                centeredPopupFound = false;
                findCenteredPopup(node);
            };

            // Check if the node manipulates cookies or local storage
            // if (node instanceof HTMLElement) {
            //     const attributes = node.attributes;
            //     for (let i = 0; i < attributes.length; i++) {
            //         const attributeName = attributes[i].name.toLowerCase();
            //         if (attributeName.includes('cookie') || attributeName.includes('localStorage')) {
            //             console.log('Node with potential cookie-related behavior:', node);
            //         }
            //     }
            // }
        }
    };


    function isElementOverlaying(element) {
        const rect = element.getBoundingClientRect();
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    
        // Define a threshold for overlap (e.g., 50% of the viewport)
        const overlapThreshold = 0.5;
    
        // Calculate the area of intersection with the viewport
        const intersectionArea = Math.max(0, Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0)) *
            Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
    
        // Calculate the area of the element
        const elementArea = rect.width * rect.height;
    
        // Determine if the element covers a significant portion of the viewport
        return rect.width >= viewportWidth && rect.height >= viewportHeight && intersectionArea / elementArea >= overlapThreshold;
    }


    function getDisplayValue(styleString, classString) {
        const styleMatch = styleString && styleString.match(/(?:^|\s)display:\s*([^;]*)(?:;|$)/i);
        const classMatch = classString && classString.match(/(?:^|\s)display:\s*([^;]*)(?:;|$)/i);
        
        return styleMatch ? styleMatch[1] : classMatch ? classMatch[1] : null;
    }

    let centeredPopupFound = false; // Add a flag to track if a centered popup has been found
    function findCenteredPopup(element) {
        if (centeredPopupFound) return; 

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
            boundingBox.width < viewportWidth * 0.7
        ) {
            console.log('centered popup:', element);

            //element.style.border = '5px outset blue';

            const cornerSize = '5px solid black';

            const cornerOffset = '0px';
        
            const cornerStyle = `
                position: absolute;
                width: 10px;
                height: 10px;
                z-index: 9999999;
                !important;
            `;
        
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
        
            element.appendChild(topLeftCorner);
            element.appendChild(topRightCorner);
            element.appendChild(bottomLeftCorner);
            element.appendChild(bottomRightCorner);

            centeredPopupFound = true;
            return;
        }
    
        // Recursively iterate through child div elements
        const childDivs = element.querySelectorAll('div');
        for (const childDiv of childDivs) {
            findCenteredPopup(childDiv);
        }
    }  
    
};


// pop up button
function toggleFloatingButton() {
    const existingButton = document.querySelector('.floating-button');

    if (existingButton) {
        existingButton.remove();
    } else {
        const button = document.createElement('button');
        button.classList.add('floating-button');
        button.textContent = 'Floating';

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
    if(children[i].nodeType === 3 ) { // text node

        let fontSize = window.getComputedStyle(children[i].parentNode, null).getPropertyValue('font-size');
        if (parseInt(fontSize) <= 12
        && children[i].parentNode.hasAttribute('href')
        && (children[i].parentNode.getAttribute('href').startsWith('http') || children[i].parentNode.getAttribute('href').includes('.html'))) {
          children[i].parentNode.style.fontSize = "24px";
          children[i].parentNode.style.backgroundColor = "red";
          children[i].parentNode.style.display = "block";
          children[i].parentNode.style.visibility = "visible";
          console.log("found link", children[i].parentNode.getAttribute('href'));
          malicious_link_count ++;
        }
        
        // check if the text node is a countdown
        if(pureNumber.test(children[i].nodeValue)){
            if(!oldChildren || (oldChildren[i] && children[i].nodeValue !== oldChildren[i].nodeValue)) {
                let aimNode = children[i].parentNode.parentNode;
                let allTexts = extractAllTextNodes(aimNode).join(''); // get all text nodes in the same level
                
                if (countdown.test(allTexts) && !notCountdown.test(allTexts)) {
                    children[i].parentNode.parentNode.style.backgroundColor = "red";
                    console.log("found countdown", allTexts);
                    countdown_value++;
                }
            }
        }
    }
    
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