side_by_side = {
    on: true,
    setOn: function (on) {
        side_by_side.on = on;
        if(side_by_side.isOn()) {
            chrome.browserAction.setBadgeText({text: 'on'});
			chrome.browserAction.setBadgeBackgroundColor({color: "green"});
        } else {
            chrome.browserAction.setBadgeText({text: 'off'});
			chrome.browserAction.setBadgeBackgroundColor({color: "gray"});
        }
    },
    isOn: function () {
        return side_by_side.on;
    },
    toggle: function () {
        side_by_side.setOn(!side_by_side.isOn());
    },
    current_id: null,
    current_index: null
}

chrome.browserAction.onClicked.addListener(function (){
    side_by_side.toggle();
});

var selectedTabs = {};

chrome.tabs.onHighlighted.addListener(function (highlightedInfo) {
	selectedTabs[highlightedInfo.windowId] = highlightedInfo.tabIds;
});

var ports = {};
var focus_tab_id = '';


chrome.extension.onConnect.addListener(function (port) {
	console.assert(port.name === 'side_by_side');
	var tab_id = port.sender.tab.id;
	ports[tab_id] = port;
	console.log('port is connected from tabId:' + tab_id);
	port.onMessage.addListener(function emit(msg) {
		if (!side_by_side.isOn()) {
			return;
		}

		switch(msg.type) {
			case 'scroll':
				var x = msg.window_scrollX;
				var y = msg.window_scrollY;
				sendToSelectedTabs(port, msg);
			  break;
			case 'click':
				var cx = msg.window_clickX;
				var cy = msg.window_clickY;
				sendToSelectedTabs(port, msg);
			  break;
			case 'focus':
				focus_tab_id = tab_id;
			  break;
			case 'load':
				if(focus_tab_id == tab_id){
					msg.type = 'setfocus';
					sendToTab(tab_id, port, msg);
				}
			  break;
			case 'doCompare':
				console.log('START COMPARE');
			  break;
			default:
			  console.log('Unhandeled: '+ msg.type);
		}
	});
});

function selectedTabIds() {
	var tabIds = [],
		window_id;
	for (window_id in selectedTabs) {
		if (selectedTabs.hasOwnProperty(window_id)) {
			tabIds.push(selectedTabs[window_id]);
		}
	}
	console.log('Selected tab ids: '+tabIds.join(','));
	return tabIds;
}

function sendToSelectedTabs(port, msg) {
	var tabIds = selectedTabIds(),i;
	for (i = 0; i < tabIds.length; i++) {
		var tab_id = tabIds[i];
		if (ports[tab_id] && ports[tab_id] !== port) {
			ports[tab_id].postMessage(msg);
		}
	}
}

function sendToTab(tab_id, port, msg) {
	if (ports[tab_id]) {
		ports[tab_id].postMessage(msg);
	}
}

side_by_side.setOn(true);