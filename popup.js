// Query the background script for data of the active tab
chrome.runtime.sendMessage({ action: 'getActiveTabData' }, (response) => {
    if (response) {
      updatePopup(response);
    }
});
  
// Update popup function
function updatePopup(data) {
    const riskElement = document.getElementById('riskLevel');
    const riskImageElement = document.getElementById('riskImage');
    const countdownElement = document.getElementById('countdownSum');
    const hiddenRisk = document.getElementById('hiddenSum');
    const precheckedElement = document.getElementById('checkboxSum');
  
    // Set sum text and value
    countdownElement.textContent = "sum: " + data.countdown_value;
    hiddenRisk.textContent = "sum: " + data.malicious_link_count;
    precheckedElement.textContent = "sum: " + data.prechecked_value;
  
    // Set risk level
    if ((data.countdown_value + data.malicious_link_count + data.prechecked_value) > 50) {
      riskImageElement.src = 'src/high-risk.png';
      riskElement.style.color = '#d81e06';
      riskElement.textContent = "High Risk";
    } else if ((data.countdown_value + data.malicious_link_count + data.prechecked_value) > 5) {
      riskImageElement.src = 'src/middle-risk.png';
      riskElement.style.color = '#f4ea2a';
      riskElement.textContent = "Moderate Risk";
    }
}
  
// add click event to toggle floating
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('toggleButton').addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { command: "toggleFloatingButton" });
        });
    });
});