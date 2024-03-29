
/**
 * TODO
 */
class _bufferSet {
	buffer; //WebGL buffer
	inputAttribute; //attrib location
	locationName; //string

	constructor(locationName, gTarget = null, shaderProgram = null){
		this.locationName = locationName;
		if(gTarget != null && shaderProgram != null)
			this.setupBuffer(gTarget, shaderProgram, true)
	}

	/**
	 * Set up a new buffer for an attribute, if possible. Creates
	 * TODO: @params
	 */
	 setupBuffer(gTarget, shaderProgram, createNewBuffer = false){
		if(this.locationName != null){
			if(createNewBuffer) this.buffer = gTarget.createBuffer();
			this.inputAttribute = gTarget.getAttribLocation(shaderProgram.program, this.locationName);
			if(this.inputAttribute == -1) alert(this.locationName + ": unknown/invalid shader location");
		}
	}

	isValid(){
		return this.locationName != null && this.inputAttribute != -1;
	}

	loadBufferData(gTarget, bufferType, drawType, data, size, type, normalized=false, stride=0, offset=0){
		if (this.isValid()) {
			gTarget.bindBuffer(bufferType, this.buffer);
			gTarget.bufferData(bufferType, data, drawType);
			gTarget.vertexAttribPointer(this.inputAttribute, size, type, normalized, stride, offset);
			gTarget.enableVertexAttribArray(this.inputAttribute);
		}
	}
}

/**
 * TODO
 */
class _uniformLocation {
	location;
	name;
	constructor(uniformName, gTarget, shaderProgram){
		this.setLocation(gTarget, shaderProgram, uniformName)
	}

	setLocation(gTarget, shaderProgram, uniformName = null){
		if(uniformName != null) this.name = uniformName;
		if (this.name != null) {
			this.location = gTarget.getUniformLocation(shaderProgram.program, this.name);
			if (this.location == -1) alert(this.name + ": unknown/invalid shader location");
		}
	}

	isValid(){
		return this.name != null && this.location != -1
	}
}

/**
 * buffer _Object representing all data necessary for any output buffer/view
 * A buffer can swap shader programs but expects the shader support all the standard inputs/outputs
 */
class _ScreenBuffer {
	_matParams = []
	_matIndicies = []
	_points = []
	_types = [];
	_offsets = [];
	_texCoords = []
	_normals = []
	_bitangents = [] //NOTE: default shader calculates bitangents
	_tangents = []

	_posBuffer;
	_normBuf;
	_txBuf;
	_tanBuf;
	_biTanBuf;
	_matParamsBufs = [];
	_matIndBuf;

	_inMatIndex
	_inMatParams = [];

	_projMatrix;
	_viewMatrix;
	_normalMatrix;
	_modelMatrix;
	_lightTypeArrayLoc = [];
	_lightLocArrayLoc = [];
	_lightDirArrayLoc = [];
	_lightAngleArrayLoc = [];
	_lightColorArrayLoc = [];
	_lightDiffArrayLoc = [];
	_lightSpecArrayLoc = [];
	_lightShinyArrayLoc = [];
	_lightAttenArrayLoc = [];
	_lightNegativeArrayLoc = [];
	_lightAltNegativeArrayLoc = []
	_lightIndLoc;
	_cameraPosLoc;
	_textureLoc = []
	_cameraSclLoc;

	_timeLoc;
	_frameTimeLoc;

	_postTimeLoc;
	_postFrameTimeLoc;
	
	_currentProgram;
	_postProcessProgram;

	_bufLimit;
	_matParamCount = 0;
	_texCount = 0;
	_postTexCount = 0;
	_bufferMask = 0x1;
	_setup = false;
	_clearColor;

	_outImages = [];
	_postImageLoc = [];
	_postIn = [];
	_postPosBuf;
	_outBuffer;
	_depthBuffer;
	_inSetup = false;

	_drawBuffers = [];

	_lastFrameTime = 0;
	_deltaFrameTime = 0;

	_setupInfo = {
		coordStr: null, matStr: null, matParamCount: null, matIndStr: null, texStr: null, texCount: null, postTexStr: null, postTexCount: null, projMatrixStr: null,
		viewMatrixStr: null, normalMatrixStr: null, modelMatrixStr: null, lightsArrayStr: null, lightsIndexStr: null,
		normalStr: null, tanStr: null, biTanStr: null, texCoordStr: null, cameraPosStr: null, cameraScaleStr: null,
		customSetupFunction: null
	}

	_customClearFunction = (gTarget, program) => { }
	_customBeginRenderFunction = (gTarget, program) => { }
	_customPreRenderFunction = (gTarget, program) => { }
	_customRenderFunction = (gTarget, program) => { }
	_customPostRenderFunction = (gTarget, program) => { }

	_getUniform(loc) {
		return this._gTarget.getUniform(this._program, loc)
	}

	constructor(gTarget, program, postProcessProgram, clearColor = vec4(0, 0, 0, 1),
		coordStr = "inPointsL", matStr = "inMatProp", matParamCount = 7, matIndStr = "inMatIndex",
		texStr = ["baseImage", "normalMap", "depthMap", "diffuseMap", "specularMap", "emissiveImage"],
		texCount = 6, postTexStr =
			["scene", "depth", "normal", "position", "color", "diffuse", "specular", "emissive"],
		postTexCount = 8, projMatrixStr = "projMatrix", viewMatrixStr = "viewMatrix", normalMatrixStr = "normalMatrix",
		modelMatrixStr = "modelMatrix", lightsArrayStr = "lights", lightsIndexStr = "maxLightIndex",
		normalStr = "inNormalL", tanStr = "inTangentL", biTanStr = null, texCoordStr = "inTexCoord",
		cameraPosStr = "inCameraPosW", cameraScaleStr = "inCameraScale",
		timeStr = "time", frameTimeStr = "frameTime",
		postTimeStr = "time", postFrameTimeStr = "frameTime",
		customSetupFunction = function (gTarget, program) { },
		bufferMask = 0x1) {
		this._gTarget = gTarget;
		this._program = program;
		this._bufferMask = bufferMask;
		this._clearColor = clearColor;
		this._postProcessProgram = postProcessProgram;

		this._setupInfo = {
			coordStr: coordStr, matStr: matStr, matParamCount: matParamCount, matIndStr: matIndStr, texStr: texStr, texCount: texCount, postTexStr: postTexStr, postTexCount: postTexCount,
			projMatrixStr: projMatrixStr, viewMatrixStr: viewMatrixStr, normalMatrixStr: normalMatrixStr, modelMatrixStr: modelMatrixStr,
			lightsArrayStr: lightsArrayStr, lightsIndexStr: lightsIndexStr, normalStr: normalStr, tanStr: tanStr, biTanStr: biTanStr, texCoordStr: texCoordStr,
			cameraPosStr: cameraPosStr, cameraScaleStr: cameraScaleStr, timeStr: timeStr, frameTimeStr: frameTimeStr, postTimeStr: postTimeStr, postFrameTimeStr: postFrameTimeStr, customSetupFunction: customSetupFunction
		}

		_buffers.push(this);

	}

	switchShaderPrograms(newProgram){
		this._gTarget.useProgram(newProgram.program)
		this._currentProgram = newProgram;
		return this._currentProgram.program;
	}

	getWGLProgram(){
		return this._currentProgram.program;
	}

	_init(shaderProgram, postShaderProgram) {
		this._inSetup = true
		this._gTarget.useProgram(shaderProgram.program)
		this._currentProgram = shaderProgram;

		//set up buffers, get attribute locations
		this._posBuffer = new _bufferSet(this._setupInfo.coordStr, this._gTarget, shaderProgram);
		this._normBuf = new _bufferSet(this._setupInfo.normalStr, this._gTarget, shaderProgram);
		this._txBuf = new _bufferSet(this._setupInfo.texCoordStr, this._gTarget, shaderProgram);
		this._tanBuf = new _bufferSet(this._setupInfo.tanStr, this._gTarget, shaderProgram);
		this._biTanBuf = new _bufferSet(this._setupInfo.biTanStr, this._gTarget, shaderProgram);
		
		//TODO: cleanup lines 160-197?
		if (this._setupInfo.matStr != null) {
			this._matIndBuf = this._gTarget.createBuffer();
			this._matParamCount = this._setupInfo.matParamCount;
			for (var i = 0; i < this._setupInfo.matParamCount; i++) {
				this._matParamsBufs.push(this._gTarget.createBuffer())
				if (!(this._setupInfo.matStr instanceof Array)) {
					this._inMatParams.push(this._gTarget.getAttribLocation(shaderProgram.program, this._setupInfo.matStr + "" + i));
					if (this._inMatParams[this._inMatParams.length - 1] == -1) alert(this._setupInfo.matStr + "" + i + ": unknown/invalid shader location");
				}
				else {
					this._inMatParams.push(this._gTarget.getAttribLocation(shaderProgram.program, this._setupInfo.matStr[i]));
					if (this._inMatParams[this._inMatParams.length - 1] == -1) alert(this._setupInfo.matStr[i] + ": unknown/invalid shader location");
				}

			}
		}

		

		if (this._setupInfo.texStr != null) {
			this._texCount = this._setupInfo.texCount;
			for (var i = 0; i < this._setupInfo.texCount; i++) {
				if (!(this._setupInfo.texStr instanceof Array)) {
					this._textureLoc.push(this._gTarget.getUniformLocation(shaderProgram.program, this._setupInfo.texStr + "[" + i + "]"));
					if (this._textureLoc[this._textureLoc.length - 1] == -1) alert(this._setupInfo.texStr + "[" + i + "]" + ": unknown/invalid shader location");
				}
				else {
					this._textureLoc.push(this._gTarget.getUniformLocation(shaderProgram.program, this._setupInfo.texStr[i]));
					if (this._textureLoc[this._textureLoc.length - 1] == -1) alert(this._setupInfo.texStr[i] + ": unknown/invalid shader location");
				}
			}
		}

		if (this._setupInfo.matIndStr != null) {
			this._inMatIndex = this._gTarget.getAttribLocation(shaderProgram.program, this._setupInfo.matIndStr);
			if (this._inMatIndex == -1) alert(this._setupInfo.matIndStr + ": unknown/invalid shader location");
		}

		//get uniform locations

		this._projMatrix = new _uniformLocation(this._setupInfo.projMatrixStr, this._gTarget, shaderProgram);
		this._viewMatrix = new _uniformLocation(this._setupInfo.viewMatrixStr, this._gTarget, shaderProgram);
		this._normalMatrix = new _uniformLocation(this._setupInfo.normalMatrixStr, this._gTarget, shaderProgram);
		this._modelMatrix = new _uniformLocation(this._setupInfo.modelMatrixStr, this._gTarget, shaderProgram);
		this._lightIndLoc = new _uniformLocation(this._setupInfo.lightsIndexStr, this._gTarget, shaderProgram);
		this._cameraPosLoc = new _uniformLocation(this._setupInfo.cameraPosStr, this._gTarget, shaderProgram);
		this._cameraSclLoc = new _uniformLocation(this._setupInfo.cameraScaleStr, this._gTarget, shaderProgram);
		this._timeLoc = new _uniformLocation(this._setupInfo.timeStr, this._gTarget, shaderProgram);
		this._frameTimeLoc = new _uniformLocation(this._setupInfo.frameTimeStr, this._gTarget, shaderProgram);

		//TODO: cleanup
		if (this._setupInfo.lightsArrayStr != null)
			for (var i = 0; i < _maxLightCount; i++) {
				this._lightTypeArrayLoc.push(this._gTarget.getUniformLocation(shaderProgram.program, this._setupInfo.lightsArrayStr + "[" + i + "].type"))
				if (this._lightTypeArrayLoc == -1) alert(this._setupInfo.lightsArrayStr + ": unknown/invalid shader location (check that this points to an array of lights containing the necessary fields.)");
				this._lightLocArrayLoc.push(this._gTarget.getUniformLocation(shaderProgram.program, this._setupInfo.lightsArrayStr + "[" + i + "].locationW"))
				this._lightDirArrayLoc.push(this._gTarget.getUniformLocation(shaderProgram.program, this._setupInfo.lightsArrayStr + "[" + i + "].directionW"))
				this._lightAngleArrayLoc.push(this._gTarget.getUniformLocation(shaderProgram.program, this._setupInfo.lightsArrayStr + "[" + i + "].angle"))
				this._lightAttenArrayLoc.push(this._gTarget.getUniformLocation(shaderProgram.program, this._setupInfo.lightsArrayStr + "[" + i + "].attenuation"))
				this._lightColorArrayLoc.push(this._gTarget.getUniformLocation(shaderProgram.program, this._setupInfo.lightsArrayStr + "[" + i + "].color"))
				this._lightDiffArrayLoc.push(this._gTarget.getUniformLocation(shaderProgram.program, this._setupInfo.lightsArrayStr + "[" + i + "].diffuseMultiply"))
				this._lightSpecArrayLoc.push(this._gTarget.getUniformLocation(shaderProgram.program, this._setupInfo.lightsArrayStr + "[" + i + "].specularMultiply"))
				this._lightShinyArrayLoc.push(this._gTarget.getUniformLocation(shaderProgram.program, this._setupInfo.lightsArrayStr + "[" + i + "].shininess"))
				this._lightNegativeArrayLoc.push(this._gTarget.getUniformLocation(shaderProgram.program, this._setupInfo.lightsArrayStr + "[" + i + "].negativeHandler"))
				this._lightAltNegativeArrayLoc.push(this._gTarget.getUniformLocation(shaderProgram.program, this._setupInfo.lightsArrayStr + "[" + i + "].negativeHandlerAlt"))
				//this._lightsTypeArrayLoc.push(this._gTarget.getUniformLocation(shaderProgram.program, lightsArrayStr+"["+i+"].lightmask"))
			}
		
		//finalize initial buffer stup
		this._bufLimit = (this._gTarget.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS > this._gTarget.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS ?
			this._gTarget.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS :
			this._gTarget.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS)

		this._setupInfo.customSetupFunction(this._gTarget, shaderProgram.program);

		//setup postprocess buffers
		this._gTarget.useProgram(postShaderProgram.program)
		this._currentProgram = postShaderProgram;
		this._outBuffer = this._gTarget.createFramebuffer();

		//setup post shader locations
		this._postTimeLoc = new _uniformLocation(this._setupInfo.postTimeStr, this._gTarget, postShaderProgram);
		this._postFrameTimeLoc = new _uniformLocation(this._setupInfo.postFrameTimeStr, this._gTarget, postShaderProgram);

		if (this._setupInfo.postTexStr != null) {
			this._postTexCount = this._setupInfo.postTexCount;
			for (var i = 0; i < this._setupInfo.postTexCount; i++) {
				this._outImages.push(this._gTarget.createTexture());
				this._gTarget.activeTexture(this._gTarget.TEXTURE0+i);
				this._gTarget.bindTexture(this._gTarget.TEXTURE_2D, this._outImages[i]);
				this._gTarget.texStorage2D(this._gTarget.TEXTURE_2D,
					1,
					(_FLOATING_EXT && _FLOATING_BUF_EXT ? this._gTarget.RGBA32F : this._gTarget.RGBA),
					this._gTarget.canvas.clientWidth,
					this._gTarget.canvas.clientHeight)
				/*this._gTarget.texImage2D(this._gTarget.TEXTURE_2D,
					0,
					(_FLOATING_EXT && _FLOATING_BUF_EXT ? this._gTarget.RGBA32F : this._gTarget.RGBA),
					this._gTarget.canvas.clientWidth,
					this._gTarget.canvas.clientHeight,
					0,
					this._gTarget.RGBA,
					(_FLOATING_EXT && _FLOATING_BUF_EXT ? this._gTarget.FLOAT : this._gTarget.UNSIGNED_BYTE),
					null);*/ //all postprocess textures will support floating point if possible
				// Mipmapping seems to cause problems in at least some cases
				//this._gTarget.generateMipmap(this._gTarget.TEXTURE_2D);
				this._gTarget.texParameteri(this._gTarget.TEXTURE_2D, this._gTarget.TEXTURE_MIN_FILTER, this._gTarget.NEAREST);
				this._gTarget.texParameteri(this._gTarget.TEXTURE_2D, this._gTarget.TEXTURE_MAG_FILTER, this._gTarget.NEAREST);
				this._gTarget.texParameteri(this._gTarget.TEXTURE_2D, this._gTarget.TEXTURE_WRAP_S, this._gTarget.CLAMP_TO_EDGE)
				this._gTarget.texParameteri(this._gTarget.TEXTURE_2D, this._gTarget.TEXTURE_WRAP_T, this._gTarget.CLAMP_TO_EDGE)
				this._gTarget.bindTexture(this._gTarget.TEXTURE_2D, null);

				if (!(this._setupInfo.texStr instanceof Array)) {
					this._postImageLoc.push(this._gTarget.getUniformLocation(postShaderProgram.program, this._setupInfo.postTexStr + "[" + i + "]"));
					if (this._postImageLoc[i] == -1) alert(this._setupInfo.postTexStr + "[" + i + "]" + ": unknown/invalid shader location");
				}
				else {
					this._postImageLoc.push(this._gTarget.getUniformLocation(postShaderProgram.program, this._setupInfo.postTexStr[i]));
					if (this._postImageLoc[i] == -1) alert(this._setupInfo.postTexStr[i] + ": unknown/invalid shader location");
				}
			}

			if (this._setupInfo.coordStr != null) {
				this._postPosBuf = this._gTarget.createBuffer();
				this._postPosIn = this._gTarget.getAttribLocation(postShaderProgram.program, this._setupInfo.coordStr);
			}
	
			this._depthBuffer = this._gTarget.createRenderbuffer();
	
			this._gTarget.bindFramebuffer(this._gTarget.FRAMEBUFFER, this._outBuffer);
			for (var i = 0; i < this._setupInfo.postTexCount; i++) {
				this._gTarget.framebufferTexture2D(this._gTarget.FRAMEBUFFER, this._gTarget.COLOR_ATTACHMENT0+i, this._gTarget.TEXTURE_2D,
					this._outImages[i], 0);
			}
	
			this._gTarget.bindRenderbuffer(this._gTarget.RENDERBUFFER, this._depthBuffer);
			this._gTarget.renderbufferStorage(this._gTarget.RENDERBUFFER, this._gTarget.DEPTH_COMPONENT16, this._gTarget.canvas.clientWidth, this._gTarget.canvas.clientHeight);
	
			this._gTarget.framebufferRenderbuffer(this._gTarget.FRAMEBUFFER, this._gTarget.DEPTH_ATTACHMENT, this._gTarget.RENDERBUFFER,
				this._depthBuffer);
	
			this._gTarget.bindFramebuffer(this._gTarget.FRAMEBUFFER, null);
			for(var i = 0; i < this._texCount; i++){
				this._gTarget.activeTexture(this._gTarget.TEXTURE0 + i);
				this._gTarget.bindTexture(this._gTarget.TEXTURE_2D, null);
			}
			this._gTarget.bindRenderbuffer(this._gTarget.RENDERBUFFER, null);
	
			for (var i = 0; i < this._setupInfo.postTexCount; i++) {
				this._gTarget.uniform1i(this._postImageLoc[i], i);
			}
	
			for(var i = 0; i < this._postTexCount; i++) this._drawBuffers.push(this._gTarget.COLOR_ATTACHMENT0+i)
		}

		//complete setup
		this._gTarget.useProgram(this._program.program)
		this._currentProgram = shaderProgram;
		this._setup = true
		this._inSetup = false
	}

	_clearBuffers() {
		this._customClearFunction(this._gTarget, this._currentProgram)
		for (var i = 0; i < this._matParamCount; i++)
			this._matParams[i] = []
		this._matIndicies = []
		this._points = []
		this._types = [];
		this._offsets = [];
		this._texCoords = []
		this._normals = []
		//this._bitangents = []
		this._tangents = []
		this._deltaFrameTime = _time - this._lastFrameTime;
		this._lastFrameTime = _time;
	}

	_setViewMatrix(v, p, s) {
		if (this._viewMatrix.location != null) this._gTarget.uniformMatrix4fv(this._viewMatrix.location, false, flatten(v));
		if (this._cameraPosLoc.location != null) this._gTarget.uniform3fv(this._cameraPosLoc.location, flatten(p))
		if (this._cameraSclLoc.location != null) this._gTarget.uniform3fv(this._cameraSclLoc.location, flatten(s))
	}

	_setModelMatrix(m) {
		if (this._modelMatrix.location != null) this._gTarget.uniformMatrix4fv(this._modelMatrix.location, false, flatten(m))
		if (this._normalMatrix.location != null) this._gTarget.uniformMatrix4fv(this._normalMatrix.location, true, flatten(inverse(m)))
	}

	_setProjMatrix(p) {
		if (this._projMatrix.location != null) this._gTarget.uniformMatrix4fv(this._projMatrix.location, false, flatten(p));
	}

	_updateLights() {
		var x = -1
		if (this._lightIndLoc.isValid) {
			this._gTarget.uniform1iv(this._lightIndLoc.location, new Int32Array([x]))
			_lights.forEach((l) => {
				if (l != null && x < _maxLightCount - 1 && l._enabled && this._lightTypeArrayLoc.length - 1 > x && ((l._lightMask & this._bufferMask) != 0)) {
					x++;
					this._gTarget.uniform1iv(this._lightIndLoc.location, new Int32Array([x]))
					this._gTarget.uniform1iv(this._lightTypeArrayLoc[x], new Int32Array([l._type]))
					switch (l._type) {
						case 4:
							this._gTarget.uniform1fv(this._lightAngleArrayLoc[x], new Float32Array([l._angle]))
						case 3:
							this._gTarget.uniform1fv(this._lightAttenArrayLoc[x], new Float32Array([l._attenuation]))
							this._gTarget.uniform4fv(this._lightDiffArrayLoc[x], flatten(l._diffuseMultiply))
							this._gTarget.uniform4fv(this._lightSpecArrayLoc[x], flatten(l._specularMultiply))
							this._gTarget.uniform1fv(this._lightShinyArrayLoc[x], new Float32Array([l._shininess]))
							this._gTarget.uniform1iv(this._lightAltNegativeArrayLoc[x], new Int32Array([l._handleNegativeAlt]))
						case 2:
							var t = l._getWorldTransform(true)
							this._gTarget.uniform3fv(this._lightDirArrayLoc[x], flatten(forward(t.rot)))
							this._gTarget.uniform3fv(this._lightLocArrayLoc[x], flatten(t.pos))
						case 1:
							this._gTarget.uniform4fv(this._lightColorArrayLoc[x], flatten(l._color));
							break;

					}
					this._gTarget.uniform1iv(this._lightNegativeArrayLoc[x], new Int32Array([l._handleNegative]))
				} else if (x >= _maxLightCount - 1 && l != null && l._enabled) {
					_bufferedConsoleLog("WARNING: More than " + _maxLightCount + " used, light with ID " + l._id + " will not be visible.")
				} else if (l._lightMask & this._bufferMask == 0) {
					this._gTarget.uniform1iv(this._lightTypeArrayLoc[x], new Int32Array([0]))
				}
			})
			for (x++; x < _maxLightCount && x < this._lightTypeArrayLoc.length; x++)
				this._gTarget.uniform1iv(this._lightTypeArrayLoc[x], new Int32Array([0]))
		}
	}

	_loadMaterial(m, hasTexture = false, noLighting = false, noParallax = false) {
		if(m._index < 0) this._matIndicies.push(m._index)

		else if (!noLighting) {
			if (!hasTexture) {
				if (m._index == 2 || m._index == 3) this._matIndicies.push(1)
				else if (m._index == 4 || m._index == 5) this._matIndicies.push(0)
				else this._matIndicies.push(m._index)
			}
			else if (noParallax) {
				if (m._index == 2) this._matIndicies.push(3)
				else if (m._index == 4) this._matIndicies.push(5)
				else this._matIndicies.push(m._index)
			}

			else this._matIndicies.push(m._index)
		}
		else {
			if (hasTexture)
				if (m._index == 2 && !noParallax) this._matIndicies.push(4)
				else this._matIndicies.push(5)
			else this._matIndicies.push(0)
		}
		for (var i = 0; i < this._matParamCount; i++)
			this._matParams[i].push(m._parameters[i % m._parameters.length])
	}

	_loadTexture(t, cameraMask) {
		if (this._textureLoc.length > 0) t._applyTexture(this._textureLoc, this._bufferMask, cameraMask)
	}

	_beginRender() {
		//("Rendering")
		//load new buffer data
		//TODO: modify for custom programs
		this.switchShaderPrograms(this._program)
		this._gTarget.viewport(0, 0, _canvas.width, _canvas.height);
		this._gTarget.enable(this._gTarget.DEPTH_TEST);
		this._gTarget.enable(this._gTarget.CULL_FACE);
		//this._gTarget.enable(this._gTarget.DEPTH_CLAMP); //not supported in WebGL
		this._gTarget.colorMask(true, true, true, true);
		this._gTarget.enable(this._gTarget.BLEND)
		this._gTarget.blendFunc(this._gTarget.SRC_ALPHA, this._gTarget.ONE_MINUS_SRC_ALPHA);
		this._gTarget.frontFace(this._gTarget.CW);
		this._gTarget.depthFunc(this._gTarget.LESS);

		if (!this._inSetup) {
			if (!this._setup) this._init(this._program, this._postProcessProgram);

			this._customBeginRenderFunction(this._gTarget, this._program)
			this._updateLights();

			for(var i = 0; i < this._texCount; i++){
				this._gTarget.activeTexture(this._gTarget.TEXTURE0 + i);
				this._gTarget.bindTexture(this._gTarget.TEXTURE_2D, null);
			}

			this._gTarget.bindFramebuffer(this._gTarget.FRAMEBUFFER, this._outBuffer);
			for (var i = 0; i < this._setupInfo.postTexCount; i++) {
				this._gTarget.framebufferTexture2D(this._gTarget.FRAMEBUFFER, this._gTarget.COLOR_ATTACHMENT0+i, this._gTarget.TEXTURE_2D,
					this._outImages[i], 0);
			}

			this._gTarget.drawBuffers(this._drawBuffers);
			//this._gTarget.useProgram(this._program.program);
			this._gTarget.clearColor(0, 0, 0, 0)
			this._gTarget.clear(this._gTarget.COLOR_BUFFER_BIT | this._gTarget.DEPTH_BUFFER_BIT);
			this._clearBuffers();
		}
	}

	_renderData() {
		if (this._points.length > 0) {
			this._customPreRenderFunction(this._gTarget, this._program);

			if(this._timeLoc.location != null) this._gTarget.uniform1ui(this._timeLoc.location, this._lastFrameTime);
			if(this._frameTimeLoc.location != null) this._gTarget.uniform1ui(this._frameTimeLoc.location, this._deltaFrameTime);

			this._posBuffer.loadBufferData(this._gTarget, 
				this._gTarget.ARRAY_BUFFER, 
				this._gTarget.STATIC_DRAW, 
				flatten(this._points), 
				3, 
				this._gTarget.FLOAT, 
				false, 
				0, 
				0);

			//TODO: update when _matIndBuf is made into custom class
			if (this._matIndBuf != null) {
				this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._matIndBuf);
				this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, new Int16Array(this._matIndicies), this._gTarget.STATIC_DRAW);
				this._gTarget.vertexAttribIPointer(this._inMatIndex, 1, this._gTarget.SHORT, 0, 0);
				this._gTarget.enableVertexAttribArray(this._inMatIndex);
			}

			//load materials
			//TODO: clean this up
			for (var i = 0; i < this._matParamCount; i++) {
				this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._matParamsBufs[i]);
				this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, flatten(this._matParams[i]), this._gTarget.STATIC_DRAW);
				this._gTarget.vertexAttribPointer(this._inMatParams[i], 4, this._gTarget.FLOAT, false, 0, 0);
				this._gTarget.enableVertexAttribArray(this._inMatParams[i]);
			}

			this._normBuf.loadBufferData(this._gTarget, 
				this._gTarget.ARRAY_BUFFER, 
				this._gTarget.STATIC_DRAW, 
				flatten(this._normals), 
				3, 
				this._gTarget.FLOAT, 
				true, 
				0, 
				0);

			this._tanBuf.loadBufferData(this._gTarget, 
				this._gTarget.ARRAY_BUFFER, 
				this._gTarget.STATIC_DRAW, 
				flatten(this._tangents), 
				3, 
				this._gTarget.FLOAT, 
				true, 
				0, 
				0);

			this._biTanBuf.loadBufferData(this._gTarget, 
				this._gTarget.ARRAY_BUFFER, 
				this._gTarget.STATIC_DRAW, 
				flatten(this._bitangents), 
				3, 
				this._gTarget.FLOAT, 
				true, 
				0, 
				0);

			this._txBuf.loadBufferData(this._gTarget, 
				this._gTarget.ARRAY_BUFFER, 
				this._gTarget.STATIC_DRAW, 
				flatten(this._texCoords), 
				2, 
				this._gTarget.FLOAT, 
				false, 
				0, 
				0);

			//draw
			var offset = 0;
			for (var i = 0; i < this._types.length; i++) {
				this._customRenderFunction(this._gTarget, this._program);
				this._gTarget.drawArrays(this._types[i], offset, this._offsets[i]);
				offset += this._offsets[i];
			}
			this._customPostRenderFunction(this._gTarget, this._program);
		}
		/*var tmp = this._gTarget.getError()
		if (tmp != this._gTarget.NO_ERROR) {
			switch (tmp) {
				case this._gTarget.INVALID_OPERATION:
				case this._gTarget.INVALID_FRAMEBUFFER_OPERATION:
				case this._gTarget.OUT_OF_MEMORY:
					alert("WebGL error " + tmp + "; Make sure hardware acceleration is enabled in your web browser.")
				default:
					alert("WebGL error " + tmp)
			}
		}*/
		this._clearBuffers();
	}

	/**
	 * Manually apply final step postprocessing to output image by drawing a rectangle on the entire screen containing the scene image processed via the post process shaders
	 */
	_applyPostProcessToScene() {

		//this._gTarget.drawBuffers([this._gTarget.NONE, this._gTarget.NONE]);
		this._gTarget.useProgram(this._postProcessProgram.program)
		this._gTarget.depthFunc(this._gTarget.LESS)
		this._gTarget.bindFramebuffer(this._gTarget.FRAMEBUFFER, null);

		if(this._postTimeLoc.location != null) this._gTarget.uniform1ui(this._postTimeLoc.location, this._lastFrameTime);
			if(this._postFrameTimeLoc.location != null) this._gTarget.uniform1ui(this._postFrameTimeLoc.location, this._deltaFrameTime);

		for(var i = 0; i < this._postTexCount; i++){
			this._gTarget.activeTexture(this._gTarget.TEXTURE0+i);
			this._gTarget.bindTexture(this._gTarget.TEXTURE_2D, this._outImages[i]);
		}


		this._gTarget.clearColor(this._clearColor[0], this._clearColor[1], this._clearColor[2], this._clearColor[3])
		this._gTarget.clear(this._gTarget.COLOR_BUFFER_BIT | this._gTarget.DEPTH_BUFFER_BIT);
		if (this._postPosBuf != null) {
			this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._postPosBuf);
			this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, new Float32Array([-1, -1,
			-1, 1,
				1, 1,
				1, 1,
				1, -1,
			-1, -1]), this._gTarget.STATIC_DRAW);
			this._gTarget.vertexAttribPointer(this._postPosIn, 2, this._gTarget.FLOAT, false, 0, 0);
			this._gTarget.enableVertexAttribArray(this._postPosIn);
		} else throw "Missing required shader input for vertex location"
		this._gTarget.drawArrays(this._gTarget.TRIANGLES, 0, 6)
	}
}