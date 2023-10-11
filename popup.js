let updateInterval;
let defaultDiscription;

// request data from the active tab and update the popup when the popup is opened
document.addEventListener('DOMContentLoaded', function() {
    requestActiveTabDataAndUpdateUI();

    updateInterval = setInterval(requestActiveTabDataAndUpdateUI, 2500);
    updateOnce();
});

// Clear the update interval when the popup is closed
window.addEventListener('unload', function() {
    clearInterval(updateInterval);
});

function requestActiveTabDataAndUpdateUI() {
    chrome.runtime.sendMessage({ action: 'getActiveTabData' }, (response) => {
        if (response) {
            updatePopup(response);
        }
    });
}

function updateOnce() {
    chrome.runtime.sendMessage({ action: 'getActiveTabData'}, (response) => {
        if (response) {
            updatePopup(response);
            const defaultDiv = document.getElementById('column1');
            defaultDiscription = defaultDiv.querySelector('.column-description').textContent;
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { default: defaultDiscription });
            });
        }
    });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // console.log(message.countdown_value, message.malicious_link_count, message.prechecked_value, message.popup_value);
});
  
// Update popup function
function updatePopup(data) {
    let countdown_value = data.countdown_value;
    let malicious_link_value = data.malicious_link_count;
    let prechecked_value = data.prechecked_value;
    let popup_value = data.popup_value;
    let stock_value = data.stock_value;
    let darkpatterns = [
        {name:'countdown', value: countdown_value, url: 'https://infs3202-6844f4bb.uqcloud.net/7381/countdown'},
        {name:'hidden info', value: malicious_link_value, url: 'https://infs3202-6844f4bb.uqcloud.net/7381/hidden'},
        {name:'preselected', value: prechecked_value,  url: 'https://infs3202-6844f4bb.uqcloud.net/7381/preselection'},
        {name:'popup', value: popup_value, url: 'https://infs3202-6844f4bb.uqcloud.net/7381/popup'},
        {name:'stock', value: stock_value, url: '#'},
        {name:'image', value: 0, url: '#'}
    ]
    darkpatterns.sort((a, b) => b.value - a.value);

    // updateColumnData function
    function updateColumnData(columnId, title, description, url) {
        let column = document.getElementById(columnId);
        if(column) {
            let columnTitle = column.querySelector('.column-title');
            let columnDescription = column.querySelector('.column-description');

            if(columnTitle) columnTitle.textContent = title;
            if (columnDescription) columnDescription.textContent = description;
            if (columnDescription) columnDescription.href = url;

            // Set the height based on conditions for columns 0 to 2
            let titleValue = parseInt(title, 10);
            let columnHead = column.querySelector('.col-head');
            let columnEnd = column.querySelector('.col-end');
            
            if (parseInt(title, 10) === 0 || description === 'popup') {
                columnHead.classList.add('no-click');
                columnEnd.style.color = "#a0a0a0";
            } else {
                columnHead.classList.remove('no-click');
                columnEnd.style.color = "#fff";
            }

            if(columnId === "column0" || columnId === "column1" || columnId === "column2") {
                if(titleValue > 50) {
                    column.style.height = '120px';
                } else {
                    let height = 65 + 1 * titleValue;
                    column.style.height = `${height}px`;
                }
            }
        }
    }

    // loop through the darkpatterns array
    darkpatterns.forEach((item, index) => {
        let columnId = "column" + (index + 1);
        updateColumnData(columnId, item.value, item.name, item.url);
    });

    const riskImageElement = document.getElementById('riskImage');
    const riskElement = document.getElementById('riskLevel');
    const colorElement = document.querySelector('.gradient-bg');
    const riskDesp = document.getElementById('riskDesp');

  
    // Set risk level
    if ((countdown_value + malicious_link_value + prechecked_value + stock_value) > 50) {
        riskImageElement.src = 'src/alien.png';
        riskElement.textContent = "Dangerous";
        riskDesp.textContent = "This website has been flagged as dangerous. It poses significant risks to your online safety.";
        changeGradientBgColor('ff914d','ff3131');
        riskElement.style.animation = 'breathe 1s infinite';
      
    } else if ((countdown_value + malicious_link_value + prechecked_value + stock_value) > 25) {
        riskImageElement.src = 'src/star.png';
        riskElement.textContent = "Attention";
        riskDesp.textContent = "This website has been evaluated as risky. Be mindful of sharing sensitive information.";
        changeGradientBgColor('FFDE59', 'FF914D');
        riskElement.style.animation = 'breathe 2s infinite';
    
    }
}

// change gradient background color
function changeGradientBgColor(colorA,colorB) {
    let style = document.createElement('style');
    style.innerHTML = `
      .gradient-bg {
        background: linear-gradient(to bottom, #${colorA}, #${colorB}) !important;
      }
    `;
    document.head.appendChild(style);
}
  
// add click event to toggle floating
document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { command: "toggleFloatingButton" });
    });
});


document.addEventListener('DOMContentLoaded', function() {
    // Column switching
    const columns = document.querySelectorAll('.column-all');
    const colHeads = document.querySelectorAll('.col-head');

    colHeads.forEach(colHead => {
        colHead.addEventListener('click', function() {
            columns.forEach(column => column.classList.remove('gradient-bg'));

            // column-all
            let parentColumn = colHead.closest('.column-all');
            if (parentColumn) {
                parentColumn.classList.add('gradient-bg');
                let description = parentColumn.querySelector('.column-description').textContent;
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, { type: description });
                });
            }
        });
    });

    // Default to first column
    columns[0].classList.add('gradient-bg');


    // website link button
    document.getElementById('website-button').href = `https://infs3202-6844f4bb.uqcloud.net/7381/`;
});