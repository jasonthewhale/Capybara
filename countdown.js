let oldBody = document.body.cloneNode(true);
const pureNumber = /^\d+$/;
const countdown = /(?:\d{1,2}\s*:\s*){1,3}\d{1,2}|(?:\d{1,2}\s*(?:days?|hours?|minutes?|seconds?|[a-zA-Z]{1,3}\.?)\s*){2,4}/gi;
const notCountdown = /(?:\d{1,2}\s*:\s*){4,}\d{1,2}|(?:\d{1,2}\s*(?:days?|hours?|minutes?|seconds?|[a-zA-Z]{1,3}\.?)\s*){5,}/gi;
let countdown_value = 0;
let malicious_link_count = 0;
let display_count_down_count = 0;

setInterval(() => {
  countdown_value = 0;

  traverseDOM(oldBody, document.body);
  if (display_count_down_count >= countdown_value) {
    countdown_value = display_count_down_count;
  }
  display_count_down_count = countdown_value;

  chrome.runtime.sendMessage({countdown_value: countdown_value, malicious_link_count: malicious_link_count}, function(response) {
    console.log("checked ", countdown_value, malicious_link_count);
  });

}, 5000);  // check every 5s

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

        if(pureNumber.test(children[i].nodeValue)){
            if(!oldChildren || children[i].nodeValue !== oldChildren[i].nodeValue) {
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

traverseDOM(document.body);


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
        button.style.bottom = '20px';  // Adjust bottom position
        button.style.right = '20px';   // Adjust right position
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
