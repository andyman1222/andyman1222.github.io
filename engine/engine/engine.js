function render(time) {
	for (var i = 0; i < cameras.length; i++)
		cameras[i].pushToBuffer();

	requestAnimationFrame(render);
}

function queueNewTick(f) {
	setTimeout(f, 1, Date.now());
}

function tick(prevTime) {
	var delta = Date.now() - prevTime;
	time += delta;
	userTickFunction(delta, time)
	consoleBufferLock = true
	var tmp = [...consoleBuffer]
	consoleBuffer = []
	var r = removedMessages
	removedMessages = 0
	consoleBufferLock = false
	tmp.forEach(function (i) {
		console.log(i)
	})
	if (r > 0) console.log(removedMessages + " messages removed.\n")
	queueNewTick(tick);
}

function initDefaultGraphics(vertexPath, fragmentPath) {
	canvas = document.getElementById("gl-canvas");

	gl = canvas.getContext('webgl2');
	if (!gl) { alert("WebGL 2.0 isn't available"); }

	//  Configure WebGL
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CW)
	gl.colorMask(true, true, true, true);
	gl.enable(gl.BLEND)
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	//  Load shaders and initialize attribute buffers
	var program = initShaders(gl, vertexPath, fragmentPath);
	gl.useProgram(program);

	bData = new buffer(gl, program, "coordinates", "matProperties", "matIndex", "projMatrix", "viewMatrix", "normalMatrix");

	mainCamera = new camera(bData);

	coords = new object({ pos: vec3(0, 0, 0), rot: eulerToQuat(vec3(1, 0, 0), 0), scl: vec3(1, 1, 1) }, [{
		pointIndex: [0, 1, 2, 3, 4, 5], matIndex: [0, 0, 1, 1, 2, 2], texCoords: [vec2(0,0), vec2(1,1), vec2(0,0), vec2(1,1), vec2(0,0), vec2(1,1)], type: gl.LINES}],
	[vec3(-1000000, 0, 0), vec3(1000000, 0, 0), vec3(0, -1000000, 0), vec3(0, 1000000, 0), vec3(0, 0, -1000000), vec3(0, 0, 1000000)],
	[vec4(1, 0, 0, 1), vec4(0, 1, 0, 1), vec4(0, 0, 1, 1)], [new solidColorNoLighting(vec4(1,0,0,1)), new solidColorNoLighting(vec4(0,1,0,1)), new solidColorNoLighting(vec4(0,0,1,1))], "rect", true)
}

function engineInit(userInit, userTick, defaultVertex = "../default-shaders/vertex.glsl", defaultFragment = "../default-shaders/fragment.glsl") {
	userInitFunction = userInit
	userTickFunction = userTick;
	initDefaultGraphics(defaultVertex, defaultFragment);
	userInitFunction();
	queueNewTick(tick);
	render();
}

