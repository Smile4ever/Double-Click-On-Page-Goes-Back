/// Messages
// Listen for messages from the content script
browser.runtime.onMessage.addListener(function(message) {
	switch (message.action) {
		case "goBackOrClose":
			goBackOrClose();
			break;
		default:
			break;
	}
});

/// Tab functions
let initialUrl = null;
let tabId = -1;
let navigateToPreviousUrl = null;

let navigationListener = async function(details) {
    if (tabId == -1) return;
    if (initialUrl == null) return;
    if (details.tabId !== tabId) return;

    navigateToPreviousUrl = details.url;
    
    let canCloseTab = initialUrl === navigateToPreviousUrl ||
        navigateToPreviousUrl.startsWith("moz-extension://") ||
        navigateToPreviousUrl.startsWith("about:blank") ||
        navigateToPreviousUrl.startsWith("about:home");

    if (canCloseTab) {
        await closeTab();
        initialUrl = null;
        tabId = -1;
    }
    
	browser.webNavigation.onBeforeNavigate.removeListener(navigationListener);
};

async function goBackOrClose() {
    let activeTabs = await browser.tabs.query({ currentWindow: true, active: true });
    let activeTab = activeTabs[0];
    tabId = activeTab.id;
    initialUrl = activeTab.url;

    // Listen for navigation events
    browser.webNavigation.onBeforeNavigate.addListener(navigationListener);

    // Navigate back
    await browser.tabs.goBack();
}

async function closeTab() {
    let activeTabs = await browser.tabs.query({ currentWindow: true, active: true });
    let activeTab = activeTabs[0];
    browser.tabs.remove(activeTab.id);
}
