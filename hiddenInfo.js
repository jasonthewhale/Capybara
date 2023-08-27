let oldBody = document.body.cloneNode(true);

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
        
        // Get the current font size
        var parent = children[i].parentNode;
        var fontSize = window.getComputedStyle(children[i].parentNode, null).getPropertyValue('font-size');
        var display = window.getComputedStyle(children[i].parentNode, null).getPropertyValue('display');
        var visibility = window.getComputedStyle(children[i].parentNode, null).getPropertyValue('visibility');
        var bgColor = window.getComputedStyle(children[i].parentNode).getPropertyValue('background-color');

        if (parseInt(fontSize) <= 12 && parent.hasAttribute('href')) {
            console.log(parent.tagName);
        }
  
        // Check if font size is less than a certain size or if text is hidden
        if (parseInt(fontSize) <= 12
        && parent.hasAttribute('href')
        && (parent.getAttribute('href').startsWith('http') || parent.getAttribute('href').includes('.html')) ) 
        {
            // console.log(`Font size is: ${fontSize}`);
            // console.log(`Display is: ${display}`);
            // console.log(`Visibility is: ${visibility}`);
            // console.log(`Info is: ${parent.getAttribute('href')}`);
            // console.log("=====================================");
            children[i].parentNode.style.fontSize = "24px";
            children[i].parentNode.style.backgroundColor = "red";
            children[i].parentNode.style.display = "block";
            children[i].parentNode.style.visibility = "visible";
        }
      }
  
      if (oldChildren[i]) {
        traverseDOM(oldChildren[i], children[i]);
      }
    }
  }

// traverseDOM(oldBody, document.body)