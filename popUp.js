chrome.windows.onCreated.addListener(function (window) {
    console.log(`New window is opened. ID:${window.id}`);
});