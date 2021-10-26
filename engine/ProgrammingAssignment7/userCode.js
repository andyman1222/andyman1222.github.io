var keys = []
var pointerLocked = false;
var mouseMove = false
var mouseInRect = false
var mouseReleased = true

var mazeX = 10, mazeY = 10

var xSpeed = 0, ySpeed = 0
var maxSpeed = 1

var cameraTime = 1000, cameraTargetPos = vec3(0, 50, -50), cameraTargetRot = eulerToQuat(vec3(1, 1, 0), 0), currentCameraTime = 0, prevCameraPos = null, prevCameraRot = null

var altCamera;

var directLight;

function switchCamera() {
	if (_mainCamera.enabled) {
		_mainCamera.enabled = false
		altCamera.enabled = true
	} else {
		_mainCamera.enabled = true
		altCamera.enabled = false
	}
}

function userKeyEvent(e) {
	switch (e.type) {
		case "keydown":
			keys[e.keyCode] = true;
			break;
		case "keyup":
			keys[e.keyCode] = false;
			break;
	}
}

function userMouseEvent(e) {
	switch (e.type) {
		case "mousemove":
			if (mouseInRect && !mouseReleased) {
				mouseMove = true

				xSpeed = e.movementX * maxSpeed
				ySpeed = e.movementY * maxSpeed
				if (_mainCamera.enabled) {
					_mainCamera.transform.rot = addRotation(_mainCamera.transform.rot, eulerToQuat(vec3(0, 1, 0), -xSpeed))
					_mainCamera.transform.rot = addRotation(_mainCamera.transform.rot, eulerToQuat(right(_mainCamera.transform.rot), ySpeed))
				}
				else {
					altCamera.transform.rot = addRotation(altCamera.transform.rot, eulerToQuat(vec3(0, 1, 0), -xSpeed))
					altCamera.transform.rot = addRotation(altCamera.transform.rot, eulerToQuat(right(altCamera.transform.rot), ySpeed))
				}
				canvas.requestPointerLock();
				pointerLocked = true;
			}
			break;
		case "mousedown":
			if (e.button == 0) {
				var pos = _getMousePos(e, canvas)
				if (pos[0] > -1 && pos[0] < 1 && pos[1] > -1 && pos[1] < 1) {
					mouseReleased = false
					mouseInRect = true
				}
				else mouseInRect = false
			}
			break;
		case "mouseup":
			if (e.button == 0) {
				rClick = 0;
				document.exitPointerLock();
				pointerLocked = false;
				if (!mouseMove) {

					var pos = _getMousePos(e, canvas)
					if (pos[0] > -1 && pos[0] < 1 && pos[1] > -1 && pos[1] < 1) {
						//var M = mult(_mainCamera.getProjMat(), _mainCamera.getViewMat())
						_mainCamera._clearDebug()
						var mousePos = _getScreenPosInWorldSpace(_mainCamera, pos)
						var intersect = linearIntersect(getPlane(vec3(0, 1, 0), vec3(1, 1, 0), vec3(1, 1, 1)), [mousePos, _mainCamera.getWorldTransform().pos])
					}
					rClick = 1;
				}
				else {

					mouseMove = false
				}
				mouseReleased = true
			}
			break;
	}
}


function userTick(delta, time) {
	directLight.transform.rot = addRotation(directLight.transform.rot, eulerToQuat(vec3(0, 1, 0), delta * .1))
	for (var i = 0; i < keys.length; i++)
		if (keys[i]) {
			if (_mainCamera.enabled) {
				var f = forward(_mainCamera.transform.rot), r = right(_mainCamera.transform.rot)
				if ((i == 87) || (i == 119)) {//w
					var n = add(_mainCamera.transform.pos, mult(.01 * delta, vec3(f[0], 0, f[2])))
					if (positionValid(vec3(n[0], 0, n[2]), vec3(.2, 0, .2)))
						_mainCamera.transform.pos = n
				}

				if ((i == 65) || (i == 97)) {//a
					var n = add(_mainCamera.transform.pos, mult(-.01 * delta, vec3(r[0], 0, r[2])))
					if (positionValid(vec3(n[0], 0, n[2]), vec3(.2, 0, .2)))
						_mainCamera.transform.pos = n
				}

				if ((i == 83) || (i == 115)) {//s
					var n = add(_mainCamera.transform.pos, mult(-.01 * delta, vec3(f[0], 0, f[2])))
					if (positionValid(vec3(n[0], 0, n[2]), vec3(.2, 0, .2)))
						_mainCamera.transform.pos = n
				}

				if ((i == 68) || (i == 100)) {//d
					var n = add(_mainCamera.transform.pos, mult(.01 * delta, vec3(r[0], 0, r[2])))
					if (positionValid(vec3(n[0], 0, n[2]), vec3(.2, 0, .2)))
						_mainCamera.transform.pos = n
				}
			}
			else {
				if ((i == 87) || (i == 119)) //w
					altCamera.transform.pos = add(altCamera.transform.pos, mult(.1 * delta, forward(altCamera.transform.rot)))

				if ((i == 65) || (i == 97))//a
					altCamera.transform.pos = add(altCamera.transform.pos, mult(-.1 * delta, right(altCamera.transform.rot)))
				if ((i == 83) || (i == 115))//s
					altCamera.transform.pos = add(altCamera.transform.pos, mult(-.1 * delta, forward(altCamera.transform.rot)))

				if ((i == 68) || (i == 100))//d
					altCamera.transform.pos = add(altCamera.transform.pos, mult(.1 * delta, right(altCamera.transform.rot)))
				if ((i == 81))//q
					altCamera.transform.pos = add(altCamera.transform.pos, mult(-.1 * delta, up(altCamera.transform.rot)))

				if ((i == 69))//e
					altCamera.transform.pos = add(altCamera.transform.pos, mult(.1 * delta, up(altCamera.transform.rot)))
			}



			if (i == 27) {//escape
				document.exitPointerLock();
				pointerLocked = false;
				mouseReleased = true
				mouseMove = false
			}
		}

	/*if(!pointerLocked){
		_mainCamera.transform.rot = addRotation(_mainCamera.transform.rot, eulerToQuat(vec3(0, 1, 0), -xSpeed))
		_mainCamera.transform.rot = addRotation(_mainCamera.transform.rot, eulerToQuat(right(_mainCamera.transform.rot), ySpeed))
		if(Math.abs(xSpeed) > .1)
			xSpeed -= Math.sign(xSpeed)*delta*(maxSpeed*.001)
		else xSpeed = 0

		if(Math.abs(ySpeed) > .1)
			ySpeed -= Math.sign(ySpeed)*delta*(maxSpeed*.001)
		else ySpeed = 0
	}*/
}

var prevPos = 0
var rClick = 0


function init() {
	altCamera = new _Camera(_bData, vec3(0, 20, 0), eulerToQuat(vec3(1, 0, 0), 90), vec3(1, 1, 1))
	altCamera.enabled = false
	_mainCamera.transform.pos = vec3(-20, 5, -20)
	new _AmbientLight(vec4(.2, .2, .2, 1), null)
	directLight = new _DirectionalLight({ pos: vec3(0, 0, 0), rot: eulerToQuat(vec3(.5, .5, .5), 90), scl: vec3(1, 1, 1) }, vec4(1, 1, 1, 1), null)
	var playerLight = new _PointLight({ pos: vec3(0, 0, 0), rot: eulerToQuat(vec3(1, 0, 0), 0), scl: vec3(1, 1, 1) }, vec4(.5, .5, 0, 1), null, 1)
	_mainCamera.attachChildToSelf(playerLight, "relative")
	altCamera.renderEngine = false
	generateMaze_()
	var tmp = _getRect(vec3(0, 0, 0), vec3(100, 1, 100))
	new _Object({ pos: vec3(0, 0, 0), rot: eulerToQuat(vec3(0, 0, 1), 0), scl: vec3(1, 1, 1) }, [
		{ pointIndex: tmp.index, matIndex: [1], texCoords: tmp.texCoords, type: _gl.TRIANGLES, normals: tmp.normals }]
		, tmp.points, [new _SolidColorNoLighting(vec4(.5, .5, .5, 1)), new _Material()], _Bounds.RECT)
}

window.onload = function () {
	this._engineInit("gl-canvas", init, userTick, userKeyEvent, userMouseEvent)
}