let oldBody = document.body.cloneNode(true);
const pureNumber = /^\d+$/;
const countdown = /(?:\d{1,2}\s*:\s*){1,3}\d{1,2}|(?:\d{1,2}\s*(?:days?|hours?|minutes?|seconds?|[a-zA-Z]{1,3}\.?)\s*){2,4}/gi;
const notCountdown = /(?:\d{1,2}\s*:\s*){4,}\d{1,2}|(?:\d{1,2}\s*(?:days?|hours?|minutes?|seconds?|[a-zA-Z]{1,3}\.?)\s*){5,}/gi;
let countdown_value = 0;

setInterval(() => {
  countdown_value = 0;
  traverseDOM(oldBody, document.body);

  console.log("countdown_value", countdown_value);

  const riskElement = document.getElementById('riskLevel');
  const riskImageElement = document.getElementById('riskImage');
  const hiddenRisk = document.getElementById('hiddenSum');
  const checkboxRisk = document.getElementById('checkboxSum');
  
  hiddenRisk.textContent = "sum: " + hidden_count;
  checkboxRisk.textContent = "sum: " + checkbox_count;
  
  if (countdown_value > 15) {
    riskImageElement.src = 'high-risk.jpg';
    riskElement.style.color = '#d81e06';
    riskElement.textContent = "High Risk";
  }else if (countdown_value > 5) {
    riskImageElement.src = 'middle-risk.jpg';
    riskElement.style.color = '#f4ea2a';
    riskElement.textContent = "Moderate Risk";
  }
}, 5000);  // check every 5s

function traverseDOM(oldNode, node) {
  var children = node.childNodes;
  var oldChildren = oldNode.childNodes;
  
  if(node.tagName === 'STYLE' || node.tagName === 'SCRIPT') {
    return; // Ignore style and script tags
  }

  for(var i = 0; i < children.length; i++) {
    if(children[i].nodeType === 3 ) { // text node

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