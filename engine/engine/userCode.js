//default template for user code

function userTick(delta, time) {
}

function init() {
}

window.onload = function () {
	this._engineInit("gl-canvas", init, userTick)
}