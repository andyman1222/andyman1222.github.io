/**
 * gets mouse position relative to target, in a scale of -1 to 1
 * @param {*} evt 
 * @param {*} target 
 */
function getMousePos(evt, target) {
	var rect = target.getBoundingClientRect();
	//(rect)
	return vec2((evt.clientX - rect.right) / (rect.width / 2) + 1, -((evt.clientY - rect.top) / (rect.height / 2) - 1))
}

window.addEventListener("keydown",
	function (e) {
		keys[e.keyCode] = true;
	},
	false);

window.addEventListener('keyup',
	function (e) {
		keys[e.keyCode] = false;
	},
	false);