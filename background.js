chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.countdown_value !== undefined && request.malicious_link_count !== undefined) {
        // Set badge text
        let total = request.countdown_value + request.malicious_link_count;
        chrome.action.setBadgeText({ text: total.toString() });
    }else{
        // Set default badge text
        chrome.action.setBadgeText({ text: "0" });
    }
});

// Set badge color
chrome.action.setBadgeBackgroundColor({ color: "#ff0000" });