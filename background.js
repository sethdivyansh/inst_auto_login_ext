// Background script for handling tab closure
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'closeTab') {
        console.log('Background: Received request to close tab', sender.tab.id);

        chrome.tabs.remove(sender.tab.id, () => {
            if (chrome.runtime.lastError) {
                console.error('Background: Error closing tab:', chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
                console.log('Background: Tab closed successfully');
                sendResponse({ success: true });
            }
        });

        // Return true to indicate we'll send a response asynchronously
        return true;
    }
});
