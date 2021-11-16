"use strict";

var keys = []
var pointerLocked = false;
var mouseMove = false
var mouseInRect = false
var mouseReleased = true

var mazeX = 10, mazeY = 10

var xSpeed = 0, ySpeed = 0
var maxSpeed = 1

var cameraTime = 1000, cameraTargetPos = vec3(0, 50, -50), cameraTargetRot = eulerToQuat(vec3(1, 1, 0), 0), currentCameraTime = 0, prevCameraPos = null, prevCameraRot = null

var directLight;

function switchCamera() {
	if (_mainCamera._enabled) {
		_mainCamera._enabled = false
	} else {
		_mainCamera._enabled = true
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
				if (_mainCamera._enabled) {
					_mainCamera._transform.rot = addRotation(_mainCamera._transform.rot, eulerToQuat(vec3(0, 1, 0), -xSpeed))
					_mainCamera._transform.rot = addRotation(_mainCamera._transform.rot, eulerToQuat(right(_mainCamera._transform.rot), ySpeed))
				}
				else {
				}
				_canvas.requestPointerLock();
				pointerLocked = true;
			}
			break;
		case "mousedown":
			if (e.button == 0) {
				var pos = _getMousePos(e, _canvas)
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

					var pos = _getMousePos(e, _canvas)
					if (pos[0] > -1 && pos[0] < 1 && pos[1] > -1 && pos[1] < 1) {
						//var M = mult(_mainCamera.getProjMat(), _mainCamera.getViewMat())
						_mainCamera._clearDebug()
						//var mousePos = _getScreenPosInWorldSpace(_mainCamera, pos)
						//var intersect = linearIntersect(getPlane(vec3(0, 1, 0), vec3(1, 1, 0), vec3(1, 1, 1), fastNorm), [mousePos, _mainCamera._getWorldTransform().pos])
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
	for (var i = 0; i < keys.length; i++)
		if (keys[i]) {
			if (_mainCamera._enabled) {
				var d = vec3(0,0,0)
				var f = forward(_mainCamera._transform.rot), r = right(_mainCamera._transform.rot)
				if ((i == 87) || (i == 119)) {//w
					var n = add(_mainCamera._transform.pos, mult(.01 * delta, fastNorm(vec3(f[0], 0, f[2]))))
					if (positionValid(vec3(n[0], 0, n[2]), vec3(.5, 0, .5)))
						_mainCamera._transform.pos = n
				}

				if ((i == 65) || (i == 97)) {//a
					var n = add(_mainCamera._transform.pos, mult(-.01 * delta, fastNorm(vec3(r[0], 0, r[2]))))
					if (positionValid(vec3(n[0], 0, n[2]), vec3(.5, 0, .5)))
						_mainCamera._transform.pos = n
				}

				if ((i == 83) || (i == 115)) {//s
					var n = add(_mainCamera._transform.pos, mult(-.01 * delta, fastNorm(vec3(f[0], 0, f[2]))))
					if (positionValid(vec3(n[0], 0, n[2]), vec3(.5, 0, .5)))
						_mainCamera._transform.pos = n
				}

				if ((i == 68) || (i == 100)) {//d
					var n = add(_mainCamera._transform.pos, mult(.01 * delta, fastNorm(vec3(r[0], 0, r[2]))))
					if (positionValid(vec3(n[0], 0, n[2]), vec3(.5, 0, .5)))
						_mainCamera._transform.pos = n
				}
			}
			else {
				
			}



			if (i == 27) {//escape
				document.exitPointerLock();
				pointerLocked = false;
				mouseReleased = true
				mouseMove = false
			}
		}
}

var prevPos = 0
var rClick = 0

class candle{

}

function init() {
	_mainCamera._transform.pos = vec3(0, 5, -15)
	var tmp = _getRect(vec3(0, 0, 0), vec3(100, 1, 100))
	new _Object({ pos: vec3(0, 0, 0), rot: eulerToQuat(vec3(0, 0, 1), 0), scl: vec3(1, 1, 1) }, [
		{ pointIndex: tmp.index, matIndex: 
			[1, 1, 1, 1, 1, 1,//bottom
			0, 0, 0, 0, 0, 0, //top
			1, 1, 1, 1, 1, 1,
			1, 1, 1, 1, 1, 1,
			1, 1, 1, 1, 1, 1,
			1, 1, 1, 1, 1, 1], texCoords: tmp.texCoords, type: _gl.TRIANGLES, normals: tmp.normals, tangents: tmp.tangents, textureIndex: -1}]
		, tmp.points, [new _BasicMaterial(vec4(.5,.5,.5,.5), vec4(0,0,0,1), vec4(1,1,1,1), vec4(1,1,1,1), 10), new _Material(-1)], _Bounds._RECT)
	var cake = _getCylinder(vec3(0,0,0),vec3(10, 1, 10), 20)
	new _Object({pos: vec3(0,1,0), rot: eulerToQuat(vec3(0,0,1),0), scl: vec3(1,1,1)}, [_DrawInfo(
		cake.index, [0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1], cake.texCoords, cake.normals, cake.tangents)],
		cake.points, [new _BasicMaterial(vec4(.8, .8, .8, 1), vec4(1, 1, 1, 1), vec4(.2, .2, .2, 1), vec4(1, 1, 1, 1), 1),
			new _BasicMaterial(vec4(0.90, 0.76, 0.42, 1), vec4(1, 1, 1, 1), vec4(.2, .2, .2, 1), vec4(1, 1, 1, 1), 1)],
		_Bounds._SPHERE)
}

window.onload = function () {
	this._engineInit("gl-canvas", init, userTick, userKeyEvent, userMouseEvent)
}