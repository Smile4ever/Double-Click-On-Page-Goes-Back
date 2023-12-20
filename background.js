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
let previousUrl;
let navigationListener = function(details) {
	const currentUrl = details.url;

	let canCloseTab = (previousUrl && previousUrl == currentUrl) || currentUrl.startsWith("moz-extension://") || currentUrl.startsWith("about:blank") || currentUrl.startsWith("about:home");
	if (canCloseTab) {
		browser.webNavigation.onCommitted.removeListener(navigationListener);

		closeTab();
		previousUrl = null;
	}

	previousUrl = currentUrl;
};

function goBackOrClose(){
	browser.tabs.goBack();

	// Listen for navigation events
	browser.webNavigation.onCommitted.addListener(navigationListener);
}

function closeTab(){
	browser.tabs.query({currentWindow: true, active: true}).then((activeTabs) => {
		let activeTab = activeTabs[0];
		browser.tabs.remove(activeTab.id);
	}, console.error);
}
