// 1. Get the current tab name to update the popup UI
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab && tab.url) {
        try {
            const url = new URL(tab.url);
            const domain = url.hostname.replace('www.', '').split('.')[0];
            // Capitalize first letter
            document.getElementById("siteName").innerText = domain.charAt(0).toUpperCase() + domain.slice(1);
        } catch (e) {
            document.getElementById("siteName").innerText = "Current Site";
        }
    }
});

// 2. "Analyze & Guide Me" Button
document.getElementById("startTour").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // Send "start_highlight" message to content.js
        chrome.tabs.sendMessage(tabs[0].id, { action: "start_highlight" });
        window.close(); // Close the popup so the user can see the tour
    });
});

// 3. "Ask Assistant" Button
document.getElementById("openChat").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // Send "open_chat" message to content.js
        chrome.tabs.sendMessage(tabs[0].id, { action: "open_chat" });
        window.close(); // Close the popup so the user can see the chat
    });
});