let activeTabId = null; // ID of the currently active tab
let tabData = {}; // Object to store data for each tab

// Listen for changes to the active tab
chrome.tabs.onActivated.addListener((activeInfo) => {
  activeTabId = activeInfo.tabId;
  updateBadgeForActiveTab();
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (sender.tab) {
    const tabId = sender.tab.id;
    
    // Store data for each tab
    tabData[tabId] = {
      countdown_value: request.countdown_value || 0,
      malicious_link_count: request.malicious_link_count || 0,
      prechecked_value: request.prechecked_value || 0,
      popup_value: request.popup_value || 0,
      stock_value: request.stock_value || 0,
      image_value: request.image_value || 0,
    };

    // Update the badge if this is the current active tab
    if (tabId === activeTabId) {
      updateBadgeForActiveTab();
    }
    sendResponse({ success: true });
  }

  if (request.action === 'getActiveTabData') {
    if (activeTabId !== null && tabData.hasOwnProperty(activeTabId)) {
      sendResponse(tabData[activeTabId]);
    } else {
      sendResponse(null);
    }
  }
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.msg == "capture") {
        chrome.tabs.captureVisibleTab(
          null,
          {},
          function(dataUrl)
          {
              // chrome.downloads.download({
              //     url: dataUrl,
              //     filename: "screenshot.png"
              // });
            sendResponse({imgSrc:dataUrl});
          }
        );
      }
    return true;
  }
);

// Update the badge text for the active tab
function updateBadgeForActiveTab() {
  if (activeTabId !== null && tabData.hasOwnProperty(activeTabId)) {
    const total = tabData[activeTabId].stock_value + tabData[activeTabId].countdown_value + tabData[activeTabId].malicious_link_count + tabData[activeTabId].prechecked_value + tabData[activeTabId].popup_value + tabData[activeTabId].image_value;
    chrome.action.setBadgeText({ text: total.toString() });
    // Set the badge background color
    if (total == 0) {
      chrome.action.setBadgeBackgroundColor({ color: "green" });
    } else {
      chrome.action.setBadgeBackgroundColor({ color: "red" });
    }
  } else {
    chrome.action.setBadgeText({ text: "0" });
    chrome.action.setBadgeBackgroundColor({ color: "green" });
  }
}
