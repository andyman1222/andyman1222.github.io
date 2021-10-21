var pointerLocked = false;
var mouseMove = false
var mouseInRect = false
var mouseReleased = true

var mazeX = 10, mazeY = 10

var xSpeed = 0, ySpeed = 0
var maxSpeed = 1

var cameraTime = 1000, cameraTargetPos = vec3(0, 50, -50), cameraTargetRot = eulerToQuat(vec3(1, 1, 0), 0), currentCameraTime = 0, prevCameraPos = null, prevCameraRot = null

var altCamera;



function switchCamera() {
	if (mainCamera.enabled) {
		mainCamera.enabled = false
		altCamera.enabled = true
	} else {
		mainCamera.enabled = true
		altCamera.enabled = false
	}
}



function userTick(delta, time) {

	for (var i = 0; i < keys.length; i++)
		if (keys[i]) {
			if (mainCamera.enabled) {
				var f = forward(mainCamera.transform.rot), r = right(mainCamera.transform.rot)
				if ((i == 87) || (i == 119)) {//w
					var n = add(mainCamera.transform.pos, mult(.01*delta, vec3(f[0], 0, f[2])))
					if (positionValid(vec3(n[0], 0, n[2]), vec3(.2,0,.2)))
						mainCamera.transform.pos = n
				}

				if ((i == 65) || (i == 97)) {//a
					var n = add(mainCamera.transform.pos, mult(-.01*delta, vec3(r[0], 0, r[2])))
					if (positionValid(vec3(n[0], 0, n[2]), vec3(.2,0,.2)))
						mainCamera.transform.pos = n
				}

				if ((i == 83) || (i == 115)) {//s
					var n = add(mainCamera.transform.pos, mult(-.01*delta, vec3(f[0], 0, f[2])))
					if (positionValid(vec3(n[0], 0, n[2]), vec3(.2,0,.2)))
						mainCamera.transform.pos = n
				}

				if ((i == 68) || (i == 100)) {//d
					var n = add(mainCamera.transform.pos, mult(.01*delta, vec3(r[0], 0, r[2])))
					if (positionValid(vec3(n[0], 0, n[2]), vec3(.2,0,.2)))
						mainCamera.transform.pos = n
				}
			}
			else {
				if ((i == 87) || (i == 119)) //w
					altCamera.transform.pos = add(altCamera.transform.pos, mult(.1*delta, forward(altCamera.transform.rot)))

				if ((i == 65) || (i == 97))//a
					altCamera.transform.pos = add(altCamera.transform.pos, mult(-.1*delta, right(altCamera.transform.rot)))
				if ((i == 83) || (i == 115))//s
					altCamera.transform.pos = add(altCamera.transform.pos, mult(-.1*delta, forward(altCamera.transform.rot)))

				if ((i == 68) || (i == 100))//d
					altCamera.transform.pos = add(altCamera.transform.pos, mult(.1*delta, right(altCamera.transform.rot)))
				if ((i == 81))//q
					altCamera.transform.pos = add(altCamera.transform.pos, mult(-.1*delta, up(altCamera.transform.rot)))

				if ((i == 69))//e
					altCamera.transform.pos = add(altCamera.transform.pos, mult(.1*delta, up(altCamera.transform.rot)))
			}



			if (i == 27) {//escape
				document.exitPointerLock();
				pointerLocked = false;
				mouseReleased = true
				mouseMove = false
			}
		}

	/*if(!pointerLocked){
		mainCamera.transform.rot = addRotation(mainCamera.transform.rot, eulerToQuat(vec3(0, 1, 0), -xSpeed))
		mainCamera.transform.rot = addRotation(mainCamera.transform.rot, eulerToQuat(right(mainCamera.transform.rot), ySpeed))
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


window.addEventListener('mousemove',
	function (e) {

		if (mouseInRect && !mouseReleased) {
			mouseMove = true

			xSpeed = e.movementX * maxSpeed
			ySpeed = e.movementY * maxSpeed
			if (mainCamera.enabled) {
				mainCamera.transform.rot = addRotation(mainCamera.transform.rot, eulerToQuat(vec3(0, 1, 0), -xSpeed))
				mainCamera.transform.rot = addRotation(mainCamera.transform.rot, eulerToQuat(right(mainCamera.transform.rot), ySpeed))
			}
			else {
				altCamera.transform.rot = addRotation(altCamera.transform.rot, eulerToQuat(vec3(0, 1, 0), -xSpeed))
				altCamera.transform.rot = addRotation(altCamera.transform.rot, eulerToQuat(right(altCamera.transform.rot), ySpeed))
			}
			canvas.requestPointerLock();
			pointerLocked = true;
		}
	})

window.addEventListener('mousedown',
	function (e) {
		if (e.button == 0) {
			var pos = getMousePos(e, canvas)
			if (pos[0] > -1 && pos[0] < 1 && pos[1] > -1 && pos[1] < 1) {
				mouseReleased = false
				mouseInRect = true
			}
			else mouseInRect = false
		}
	})

window.addEventListener("mouseup", function (e) {
	if (e.button == 0) {
		rClick = 0;
		document.exitPointerLock();
		pointerLocked = false;
		if (!mouseMove) {

			var pos = getMousePos(e, canvas)
			if (pos[0] > -1 && pos[0] < 1 && pos[1] > -1 && pos[1] < 1) {
				//var M = mult(mainCamera.getProjMat(), mainCamera.getViewMat())
				mainCamera.clearDebug()
				var mousePos = getScreenPosInWorldSpace(mainCamera, pos)
				var intersect = linearIntersect(getPlane(vec3(0, 1, 0), vec3(1, 1, 0), vec3(1, 1, 1)), [mousePos, mainCamera.getWorldTransform().pos])
			}
			rClick = 1;
		}
		else {

			mouseMove = false
		}
		mouseReleased = true
	}
})


function init() {
	altCamera = new camera(bData, vec3(0, 20, 0), eulerToQuat(vec3(1, 0, 0), 90), vec3(1, 1, 1))
	altCamera.enabled = false
	mainCamera.transform.pos = vec3(-20, 2, -20)
	new ambientLight(vec4(.1,.1,.1,1), null)
	new directionalLight({pos: vec3(0,0,0), rot: eulerToQuat(vec3(-.5,-.5,-.5),0), scl: vec3(1,1,1)}, vec4(1,1,1,1), null)
	//mainCamera.renderEngine = true
	generateMaze_()
	var tmp = getRect(vec3(0, 0, 0), vec3(100, 1, 100))
	new object({ pos: vec3(0, 0, 0), rot: eulerToQuat(vec3(0, 0, 1), 0), scl: vec3(1, 1, 1) }, [
		{ pointIndex: tmp.index, matIndex: [0], texCoords: tmp.texCoords, type: gl.TRIANGLES }]
		, tmp.points, [new solidColorNoLighting(vec4(.5,.5,.5,1)), new material()], tmp.normals, "rect")
}

window.onload = function () {
	this.engineInit(init, userTick)
}