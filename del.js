let body = document.body.cloneNode(true);
console.log(body);

console.log(body.tagName)

let childNodes = body.childNodes;

for(var i = 0; i < childNodes.length; i++) {
    if (childNodes[i].tagName === 'STYLE' || childNodes[i].tagName === 'SCRIPT') {
        console.log('ignoring style or script tag');
    }
    else {
        console.log(childNodes[i]);
    }
}