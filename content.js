let popup_value = 0;
window.onload = function() {
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
                node.style.border = 'solid red 10px';
                popup_value += 1;
            };

            // Check if the node manipulates cookies or local storage
            if (node instanceof HTMLElement) {
                const attributes = node.attributes;
                for (let i = 0; i < attributes.length; i++) {
                    const attributeName = attributes[i].name.toLowerCase();
                    if (attributeName.includes('cookie') || attributeName.includes('localStorage')) {
                        console.log('Node with potential cookie-related behavior:', node);
                    }
                }
            }
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