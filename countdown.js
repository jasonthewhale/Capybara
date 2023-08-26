let oldBody = document.body.cloneNode(true);
const pureNumber = /^\d{2,}$/;
const countdown = /(?:\d{1,2}\s*:\s*){1,3}\d{1,2}|(?:\d{1,2}\s*(?:days?|hours?|minutes?|seconds?|tage?|stunden?|minuten?|sekunden?|[a-zA-Z]{1,3}\.?)(?:\s*und)?\s*){2,4}/gi;
const notCountdown = /(?:\d{1,2}\s*:\s*){4,}\d{1,2}|(?:\d{1,2}\s*(?:days?|hours?|minutes?|seconds?|tage?|stunden?|minuten?|sekunden?|[a-zA-Z]{1,3}\.?)(?:\s*und)?\s*){5,}/gi;

setInterval(() => {
  traverseDOM(oldBody, document.body);
}, 5000);  // check every 1s

function traverseDOM(oldNode, node) {
  var children = node.childNodes;
  var oldChildren = oldNode.childNodes;
  
  if(node.tagName === 'STYLE' || node.tagName === 'SCRIPT') {
    return; // Ignore style and script tags
  }

  for(var i = 0; i < children.length; i++) {
    if(children[i].nodeType === 3 ) { // text node

        if((pureNumber.test(children[i].nodeValue) || countdown.test(children[i].nodeValue)) && !notCountdown.test(children[i].nodeValue)) {
            if(children[i].nodeValue !== oldChildren[i].nodeValue) {
            console.log("changed", children[i].nodeValue);
            children[i].parentNode.parentNode.style.backgroundColor = "red";
            }
        }
    }
    
    if (oldChildren[i]) {
      traverseDOM(oldChildren[i], children[i]);
    }
  }
}