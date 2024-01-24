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
let previousUrl = null;
let tabId = -1;

let navigationListener = async function(details) {
	if(tabId == -1) return;
	if(previousUrl == null) return;
	if(details.tabId != tabId) return;
		
	const navigateToUrl = details.url;

	let canCloseTab = previousUrl == navigateToUrl || 
		navigateToUrl.startsWith("moz-extension://") || 
		navigateToUrl.startsWith("about:blank") || 
		navigateToUrl.startsWith("about:home");
	
	if (canCloseTab) {
		browser.webNavigation.onCommitted.removeListener(navigationListener);

		await closeTab();
		previousUrl = null;
		tabId = -1;
	}

	previousUrl = navigateToUrl;
};

async function goBackOrClose(){
	let activeTabs = await browser.tabs.query({currentWindow: true, active: true});
	let activeTab = activeTabs[0];
	tabId = activeTab.id;
	previousUrl = activeTab.url;
	
	// Listen for navigation events
	browser.webNavigation.onCommitted.addListener(navigationListener);
	
	// Navigate
	await browser.tabs.goBack();
}

async function closeTab(){
	let activeTabs = await browser.tabs.query({currentWindow: true, active: true});
	let activeTab = activeTabs[0];
	browser.tabs.remove(activeTab.id);
}
