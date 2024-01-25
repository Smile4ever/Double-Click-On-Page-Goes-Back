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
let fired = false;

let navigationListener = async function(details) {
	if (tabId == -1) return;
	if (initialUrl == null) return;
	if (details.tabId !== tabId) return;

	fired = true;
	navigateToPreviousUrl = details.url;

	browser.webNavigation.onBeforeNavigate.removeListener(navigationListener);
	closeTabIfPossible(initialUrl, navigateToPreviousUrl);
};

async function goBackOrClose() {
	let activeTabs = await browser.tabs.query({ currentWindow: true, active: true });
	let activeTab = activeTabs[0];
	tabId = activeTab.id;
	initialUrl = activeTab.url;
	fired = false;

	// Listen for navigation events
	browser.webNavigation.onBeforeNavigate.addListener(navigationListener);

	// Navigate back
	await browser.tabs.goBack();

	// We are unpatient and only wait 300 milliseconds = 0.3 seconds
	await wait(300);
	
	if(!fired){
		browser.webNavigation.onBeforeNavigate.removeListener(navigationListener);
		
		let newActiveTabs = await browser.tabs.query({ currentWindow: true, active: true });
		let newActiveTab = newActiveTabs[0];
		if(newActiveTab.url == initialUrl){
			await closeTabIfPossible(initialUrl, newActiveTab.url);
		}
	}
}

async function wait(ms) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
}

async function closeTabIfPossible(initialUrl, navigateToPreviousUrl){
	let canCloseTab = initialUrl === navigateToPreviousUrl ||
		navigateToPreviousUrl.startsWith("moz-extension://") ||
		navigateToPreviousUrl.startsWith("about:blank") ||
		navigateToPreviousUrl.startsWith("about:home");

	if (canCloseTab) {
		await closeTab();
		initialUrl = null;
		tabId = -1;
	}
}

async function closeTab() {
	let activeTabs = await browser.tabs.query({ currentWindow: true, active: true });
	let activeTab = activeTabs[0];
	browser.tabs.remove(activeTab.id);
}
