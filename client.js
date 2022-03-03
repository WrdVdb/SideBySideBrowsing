side_by_side = {
	port: chrome.extension.connect({name: "side_by_side"}),
	focused: true,
	tab_id:0
}

side_by_side.port.onMessage.addListener(function (msg) {
	if(!side_by_side.focused){
		if (msg.type == 'scroll') {
			var x = msg.window_scrollX;
			var y = msg.window_scrollY;
			window.scroll(x, y);
		}else if (msg.type == 'click') {
			var cx = msg.window_clickX;
			var cy = msg.window_clickY;
			doClick(cx,cy);
		}else if (msg.type == 'setfocus') {
			side_by_side.focused = true;
		}
	}
});

window.addEventListener('load', () => {
	side_by_side.focused = false;
	side_by_side.port.postMessage({
		type:'load'
	});
});

window.addEventListener('scroll', function () {
	if(!side_by_side.focused) {return;}
	var x = window.scrollX;
	var y = window.scrollY;
	side_by_side.port.postMessage({
		type:'scroll',
		window_scrollX: x,
		window_scrollY: y
	});
});

window.addEventListener('click', function (event) {
	if(!side_by_side.focused) {return;}
	var cx = event.clientX;
	var cy = event.clientY;

	side_by_side.port.postMessage({
		type:'click',
		window_clickX: cx,
		window_clickY: cy
	});
	
});

window.addEventListener('focus', function () {
	side_by_side.focused = true;
	side_by_side.port.postMessage({type:'focus'});
});

window.addEventListener('blur', function () {
	side_by_side.focused = false;
	side_by_side.port.postMessage({type:'blur'});
});

function doClick(x,y){
    var ev = document.createEvent("MouseEvent");
    var el = document.elementFromPoint(x,y);
    ev.initMouseEvent(
        "click",
        true, true,
        window, null,
        x, y, 0, 0,
        false, false, false, false,
        0, null
    );
    el.dispatchEvent(ev);
}
