// Query the background script for data of the active tab
chrome.runtime.sendMessage({ action: 'getActiveTabData' }, (response) => {
    if (response) {
      updatePopup(response);
    }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // console.log(message.countdown_value, message.malicious_link_count, message.prechecked_value, message.popup_value);
});
  
// Update popup function
function updatePopup(data) {
    let countdown_value = data.countdown_value;
    let malicious_link_value = data.malicious_link_count;
    let prechecked_value = data.prechecked_value;
    let popup_value = data.popup_value;
    let darkpatterns = [
        {name:'countdown', value: countdown_value},
        {name:'hidden info', value: malicious_link_value},
        {name:'preselected', value: prechecked_value},
        {name:'popup', value: popup_value}
    ]
    darkpatterns.sort((a, b) => b.value - a.value);

    // updateColumnData function
    function updateColumnData(columnId, title, description) {
        let column = document.getElementById(columnId);
        if(column) {
            let columnTitle = column.querySelector('.column-title');
            let columnDescription = column.querySelector('.column-description');

            if(columnTitle) columnTitle.textContent = title;
            if(columnDescription) columnDescription.textContent = description;

            // Set the height based on conditions for columns 0 to 2
            let titleValue = parseInt(title, 10);
            if(columnId === "column0" || columnId === "column1" || columnId === "column2") {
                if(titleValue > 15) {
                    column.style.height = '100px';
                } else if(titleValue > 8) {
                    column.style.height = '85px';
                } else if(titleValue > 5) {
                    column.style.height = '75px';
                } else if(titleValue > 3) {
                    column.style.height = '65px';
                }
            }
        }
    }

    // loop through the darkpatterns array
    darkpatterns.forEach((item, index) => {
        let columnId = "column" + (index + 1);
        updateColumnData(columnId, item.value, item.name);
    });

    const riskImageElement = document.getElementById('riskImage');
    const riskElement = document.getElementById('riskLevel');
    const colorElement = document.querySelector('.gradient-bg');
    const riskDesp = document.getElementById('riskDesp');

  
    // Set risk level
    if ((countdown_value + malicious_link_value + prechecked_value) > 50) {
        riskImageElement.src = 'src/alien.png';
        riskElement.textContent = "Dangerous";
        riskDesp.textContent = "This website has been flagged as dangerous. It poses significant risks to your online safety.";
        colorElement.style.background = 'linear-gradient(to bottom, #ff914d,#ff3131)';
        changeGradientBgColor('ff914d','ff3131');
      
    } else if ((countdown_value + malicious_link_value + prechecked_value) > 5) {
        riskImageElement.src = 'src/star.png';
        riskElement.textContent = "Attention";
        riskDesp.textContent = "This website has been evaluated as risky. Be mindful of sharing sensitive information.";
        changeGradientBgColor('FFDE59', 'FF914D');
    
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
    document.getElementById('toggleButton').addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { command: "toggleFloatingButton" });
        });
    });
});


document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            const targetId = e.currentTarget.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);

            // Remove active class from all buttons and content divs
            document.querySelectorAll('.tab-button, .container').forEach(function(el) {
                el.classList.remove('active');
            });

            // Add active class to the clicked button and its associated content
            e.currentTarget.classList.add('active');
            targetContent.classList.add('active');
        });
    });

    // Column switching
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        column.addEventListener('click', function() {
            columns.forEach(col => col.classList.remove('gradient-bg'));
            this.classList.add('gradient-bg');
            let description = this.querySelector('.column-description').textContent;
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { type: description });
            });
        });
    });
    // Default to first column
    columns[0].classList.add('gradient-bg');


    // Learn more link
    let extensionID = chrome.runtime.id;
    document.getElementById('learnMoreLink').href = `chrome-extension://${extensionID}/website/html/index.html`;
});