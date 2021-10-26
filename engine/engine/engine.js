"use strict";

function _render(time) {
	for(var i = 0; i < _buffers.length; i++)
		_buffers[i].beginRender();
	for (var i = 0; i < _cameras.length; i++)
		_cameras[i].pushToBuffer();

	requestAnimationFrame(_render);
}

function _queueNewTick(f) {
	setTimeout(f, 1, Date.now());
}

function _postTickFunction(delta, time){
	_userPostTickFunction(delta, time)
	_lights.forEach((o) => (o._postTick(delta, time)))
	_objects.forEach((o) => (o._postTick(delta, time)))
	_cameras.forEach((o) => (o._postTick(delta, time)))
}

function _tick(prevTime) {
	var delta = Date.now() - prevTime;
	time += delta;
	_userTickFunction(delta, time)
	_lights.forEach((o) => (o._onTick(delta, time)))
	_objects.forEach((o) => (o._onTick(delta, time)))
	_cameras.forEach((o) => (o._onTick(delta, time)))
	
	_consoleBufferLock = true
	var tmp = [..._consoleBuffer]
	_consoleBuffer = []
	var r = _removedMessages
	_removedMessages = 0
	_consoleBufferLock = false
	tmp.forEach(function (i) {
		console.log(i)
	})
	if (r > 0) console.log(r + " messages removed.\n")

	postTickFunction(delta, time)
	queueNewTick(_tick);
}

function _initDefaultGraphics(defaultCanvas, vertexPath, fragmentPath) {
	_canvas = document.getElementById(defaultCanvas);

	_gl = _canvas.getContext('webgl2');
	if (!_gl) { alert("WebGL 2.0 isn't available"); }

	//  Configure WebGL
	_gl.viewport(0, 0, _canvas.width, _canvas.height);
	_gl.clearColor(0.0, 0.0, 0.0, 1.0);
	_gl.enable(_gl.DEPTH_TEST);
	_gl.enable(_gl.CULL_FACE);
	_gl.frontFace(_gl.CW)
	_gl.colorMask(true, true, true, true);
	_gl.enable(_gl.BLEND)
	_gl.blendFunc(_gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA);

	//  Load shaders and initialize attribute buffers
	_program = initShaders(_gl, vertexPath, fragmentPath);
	_gl.useProgram(_program);

	_bData = new _Buffer(_gl, _program, 
		"coordinates",
		"inMatProp",
		5,
		"inMatIndex",
		"projMatrix",
		"viewMatrix",
		"normalMatrix",
		"lights",
		"maxLightIndex",
		"inNormal",
		"inTexCoord",
		"cameraPos");

	_mainCamera = new _Camera(_bData);
	
	_coords = new _Object({ pos: vec3(0, 0, 0), rot: eulerToQuat(vec3(1, 0, 0), 0), scl: vec3(1, 1, 1) }, [{
		pointIndex: [0, 1, 2, 3, 4, 5], matIndex: [0, 0, 1, 1, 2, 2], texCoords: [vec2(0,0), vec2(1,1), vec2(0,0), vec2(1,1), vec2(0,0), vec2(1,1)], type: _gl.LINES, normals: [vec3(-1, 0, 0), vec3(1, 0, 0), vec3(0, -1, 0), vec3(0, 1, 0), vec3(0, 0, -1), vec3(0, 0, 1)]}],
	[vec3(-1000000, 0, 0), vec3(1000000, 0, 0), vec3(0, -1000000, 0), vec3(0, 1000000, 0), vec3(0, 0, -1000000), vec3(0, 0, 1000000)],
	[new _SolidColorNoLighting(vec4(1,0,0,1)), new _SolidColorNoLighting(vec4(0,1,0,1)), new _SolidColorNoLighting(vec4(0,0,1,1))], _Bounds._RECT, true)
}

function _engineInit(defaultCanvas, userInit, userTick, userKey = function(e) {}, userMouse = function(e) {}, userPostTick = function(delta, time) {}, defaultVertex = "https://andyman1222.github.io/engine/default-shaders/vertex.glsl", defaultFragment = "https://andyman1222.github.io/engine/default-shaders/fragment.glsl") {
	_userInitFunction = userInit
	_userTickFunction = userTick;
	_userKeyFunction = userKey;
	_userMouseFunction = userMouse;
	_userPostTickFunction = userPostTick;
	_initDefaultGraphics(defaultCanvas, defaultVertex, defaultFragment);
	_userInitFunction();
	_queueNewTick(_userTickFunction);
	_render();
}

