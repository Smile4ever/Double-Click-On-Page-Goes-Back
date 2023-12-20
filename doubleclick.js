let DEBUG = false;

function init(){
	assignCorrectEventListeners(window);
}
init();

// Send messages to the background script
function sendMessage(action, data){
	browser.runtime.sendMessage({"action": action, "data": data});
}

function eventHandler(e) {
	let forbidden = ["INPUT", "TEXTAREA", "VIDEO", "AUDIO"];
	for(let f of forbidden){
		if(e.target.tagName == f){
			return; // don't do this please, this usually provides a dropdown in a text area
		}
	}

	// VK.com videoplayer (fix bug #3)
	if(e.target.querySelector('video') != null){
		return;
	}
	
	e.preventDefault();
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();

	sendMessage("goBackOrClose");
}

function assignCorrectEventListeners(w){
	w.removeEventListener("dblclick", eventHandler);
	w.addEventListener("dblclick", eventHandler);
}

function assignCorrectEventListenersIframe(){
	let id = 0;
	let i = 0;
	let identifiers = ["iframe", "frame"];
	for(id = 0; id < identifiers.length; id++){
		let iframes = document.getElementsByTagName(identifiers[id]);
		for(i = 0; i < iframes.length; i++){
			try{
				assignCorrectEventListeners(iframes[i].contentWindow);
			}catch(ex){
				// Cross-origin domain security violation (controlled by CORS)
				// https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
				if(DEBUG) console.error(ex);
			}
		}
	}
}

// Needed for WebCite and others
document.addEventListener("DOMContentLoaded", assignCorrectEventListenersIframe);
