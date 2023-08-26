let oldBody = document.body.cloneNode(true);

setInterval(() => {
    traverseDOM(oldBody, document.body);
  }, 5000);  // check every 1s


  function colorSimilarityNormalized(rgb1, rgb2) {
    let rDiff = rgb1[0] - rgb2[0];
    let gDiff = rgb1[1] - rgb2[1];
    let bDiff = rgb1[2] - rgb2[2];
    let maxEuclideanDist = Math.sqrt(Math.pow(255, 2) * 3);
    let dist = Math.sqrt(Math.pow(rDiff,2) + Math.pow(gDiff,2) + Math.pow(bDiff,2));
    return 1 - (dist / maxEuclideanDist);
}


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


function traverseLink() {
    let links = document.getElementsByTagName('a');
    for(let i = 0; i < links.length; i++) {
        let linkColor = window.getComputedStyle(links[i]).getPropertyValue('color');
        let bgColor = window.getComputedStyle(links[i].parentNode).getPropertyValue('background-color');
        let linkRGB = getRGBArray(linkColor);
        let bgRGB = getRGBArray(bgColor);
        let similarity = colorSimilarityNormalized(linkRGB, bgRGB)
        if (similarity > 0.5) {
            console.log(`Link color is: ${linkColor}`);
            console.log(`Background color is: ${bgRGB}`);
            console.log(colorSimilarityNormalized(linkRGB, bgRGB));
            console.log(links[i]);
        }
        
        if(linkColor === bgColor) {
            //Apply some styling to make it visible
            links[i].style.color = 'red';
        }
    }
}


function traverseDOM(oldNode, node) {
    var children = node.childNodes;
    var oldChildren = oldNode.childNodes;

    console.log('traversing DOM')

    if(node.tagName === 'STYLE' || node.tagName === 'SCRIPT') {
      return; // Ignore style and script tags
    }

  
    for(var i = 0; i < children.length; i++) {
        if (children[i].nodeType === 3) {
        // Get the current font size
        var parent = children[i].parentNode;
        // var fontSize = window.getComputedStyle(children[i].parentNode, null).getPropertyValue('font-size');
        // var display = window.getComputedStyle(children[i].parentNode, null).getPropertyValue('display');
        // var visibility = window.getComputedStyle(children[i].parentNode, null).getPropertyValue('visibility');
        var colour = window.getComputedStyle(children[i].parentNode, null).getPropertyValue('color');
        var bgColor = window.getComputedStyle(children[i].parentNode, null).getPropertyValue('background-color');
        console.log(colour)
        console.log(bgColor)

        let similarity = colorSimilarityNormalized(getRGBArray(colour), getRGBArray(bgColor));
        if (similarity > 0.5 && children[i].nodeType === 3) {
            console.log(`Link color is: ${colour}`);
            console.log(`Background color is: ${bgColor}`);
            console.log(children[i].nodeType);
        }

  
      if (oldChildren[i]) {
        traverseDOM(oldChildren[i], children[i]);
      }
    }
    }
}
