/**
 * buffer _Object representing all data necessary for any output buffer/view
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

	_inPos;
	_inTexCoord;
	_inNormal;
	_inBitan;
	_inTan;
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
	_program;
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
		cameraPosStr = "inCameraPosW", cameraScaleStr = "inCameraScale", customSetupFunction = function (gTarget, program) { },
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
			cameraPosStr: cameraPosStr, cameraScaleStr: cameraScaleStr, customSetupFunction: customSetupFunction
		}

		_buffers.push(this);

	}

	_init() {
		this._inSetup = true
		this._gTarget.useProgram(this._program)
		if (this._setupInfo.coordStr != null) {
			this._posBuffer = this._gTarget.createBuffer();
			this._inPos = this._gTarget.getAttribLocation(this._program, this._setupInfo.coordStr);
			if (this._inPos == -1) alert(this._setupInfo.coordStr + ": unknown/invalid shader location");
		}

		if (this._setupInfo.normalStr != null) {
			this._normBuf = this._gTarget.createBuffer();
			this._inNormal = this._gTarget.getAttribLocation(this._program, this._setupInfo.normalStr);
			if (this._inNormal == -1) alert(this._setupInfo.normalStr + ": unknown/invalid shader location");
		}

		if (this._setupInfo.texCoordStr != null) {
			this._txBuf = this._gTarget.createBuffer();
			this._inTexCoord = this._gTarget.getAttribLocation(this._program, this._setupInfo.texCoordStr);
			if (this._inTexCoord == -1) alert(this._setupInfo.texCoordStr + ": unknown/invalid shader location");
		}

		if (this._setupInfo.tanStr != null) {
			this._tanBuf = this._gTarget.createBuffer();
			this._inTan = this._gTarget.getAttribLocation(this._program, this._setupInfo.tanStr);
			if (this._inTan == -1) alert(this._setupInfo.tanStr + ": unknown/invalid shader location");
		}

		if (this._setupInfo.biTanStr != null) {
			this._biTanBuf = this._gTarget.createBuffer();
			this._inBiTan = this._gTarget.getAttribLocation(this._program, this._setupInfo.biTanStr);
			if (this._inBiTan == -1) alert(this._setupInfo.biTanStr + ": unknown/invalid shader location");
		}

		if (this._setupInfo.matStr != null) {
			this._matIndBuf = this._gTarget.createBuffer();
			this._matParamCount = this._setupInfo.matParamCount;
			for (var i = 0; i < this._setupInfo.matParamCount; i++) {
				this._matParamsBufs.push(this._gTarget.createBuffer())
				if (!(this._setupInfo.matStr instanceof Array)) {
					this._inMatParams.push(this._gTarget.getAttribLocation(this._program, this._setupInfo.matStr + "" + i));
					if (this._inMatParams[this._inMatParams.length - 1] == -1) alert(this._setupInfo.matStr + "" + i + ": unknown/invalid shader location");
				}
				else {
					this._inMatParams.push(this._gTarget.getAttribLocation(this._program, this._setupInfo.matStr[i]));
					if (this._inMatParams[this._inMatParams.length - 1] == -1) alert(this._setupInfo.matStr[i] + ": unknown/invalid shader location");
				}

			}
		}

		if (this._setupInfo.texStr != null) {
			this._texCount = this._setupInfo.texCount;
			for (var i = 0; i < this._setupInfo.texCount; i++) {
				if (!(this._setupInfo.texStr instanceof Array)) {
					this._textureLoc.push(this._gTarget.getUniformLocation(this._program, this._setupInfo.texStr + "[" + i + "]"));
					if (this._textureLoc[this._textureLoc.length - 1] == -1) alert(this._setupInfo.texStr + "[" + i + "]" + ": unknown/invalid shader location");
				}
				else {
					this._textureLoc.push(this._gTarget.getUniformLocation(this._program, this._setupInfo.texStr[i]));
					if (this._textureLoc[this._textureLoc.length - 1] == -1) alert(this._setupInfo.texStr[i] + ": unknown/invalid shader location");
				}
			}
		}

		if (this._setupInfo.matIndStr != null) {
			this._inMatIndex = this._gTarget.getAttribLocation(this._program, this._setupInfo.matIndStr);
			if (this._inMatIndex == -1) alert(this._setupInfo.matIndStr + ": unknown/invalid shader location");
		}

		if (this._setupInfo.projMatrixStr != null) {
			this._projMatrix = this._gTarget.getUniformLocation(this._program, this._setupInfo.projMatrixStr);
			if (this._projMatrix == -1) alert(this._setupInfo.projMatrixStr + ": unknown/invalid shader location");
		}

		if (this._setupInfo.viewMatrixStr != null) {
			this._viewMatrix = this._gTarget.getUniformLocation(this._program, this._setupInfo.viewMatrixStr);
			if (this._viewMatrix == -1) alert(this._setupInfo.viewMatrixStr + ": unknown/invalid shader location");
		}
		if (this._setupInfo.normalMatrixStr != null) {
			this._normalMatrix = this._gTarget.getUniformLocation(this._program, this._setupInfo.normalMatrixStr);
			if (this._normalMatrix == -1) alert(this._setupInfo.normalMatrixStr + ": unknown/invalid shader location");
		}

		if (this._setupInfo.modelMatrixStr != null) {
			this._modelMatrix = this._gTarget.getUniformLocation(this._program, this._setupInfo.modelMatrixStr);
			if (this._modelMatrix == -1) alert(this._setupInfo.modelMatrixStr + ": unknown/invalid shader location");
		}

		if (this._setupInfo.lightsIndexStr != null) {
			this._lightIndLoc = this._gTarget.getUniformLocation(this._program, this._setupInfo.lightsIndexStr);
			if (this._lightIndLoc == -1) alert(this._setupInfo.lightsIndexStr + ": unknown/invalid shader location");
		}

		if (this._setupInfo.cameraPosStr != null) {
			this._cameraPosLoc = this._gTarget.getUniformLocation(this._program, this._setupInfo.cameraPosStr);
			if (this._cameraPosLoc == -1) alert(this._setupInfo.cameraPosStr + ": unknown/invalid shader location");
		}

		if (this._setupInfo.cameraScaleStr != null) {
			this._cameraSclLoc = this._gTarget.getUniformLocation(this._program, this._setupInfo.cameraScaleStr);
			if (this._cameraSclLoc == -1) alert(this._setupInfo.cameraScaleStr + ": unknown/invalid shader location");
		}

		if (this._setupInfo.lightsArrayStr != null)
			for (var i = 0; i < _maxLightCount; i++) {
				this._lightTypeArrayLoc.push(this._gTarget.getUniformLocation(this._program, this._setupInfo.lightsArrayStr + "[" + i + "].type"))
				if (this._lightTypeArrayLoc == -1) alert(this._setupInfo.lightsArrayStr + ": unknown/invalid shader location (check that this points to an array of lights containing the necessary fields.)");
				this._lightLocArrayLoc.push(this._gTarget.getUniformLocation(this._program, this._setupInfo.lightsArrayStr + "[" + i + "].locationW"))
				this._lightDirArrayLoc.push(this._gTarget.getUniformLocation(this._program, this._setupInfo.lightsArrayStr + "[" + i + "].directionW"))
				this._lightAngleArrayLoc.push(this._gTarget.getUniformLocation(this._program, this._setupInfo.lightsArrayStr + "[" + i + "].angle"))
				this._lightAttenArrayLoc.push(this._gTarget.getUniformLocation(this._program, this._setupInfo.lightsArrayStr + "[" + i + "].attenuation"))
				this._lightColorArrayLoc.push(this._gTarget.getUniformLocation(this._program, this._setupInfo.lightsArrayStr + "[" + i + "].color"))
				this._lightDiffArrayLoc.push(this._gTarget.getUniformLocation(this._program, this._setupInfo.lightsArrayStr + "[" + i + "].diffuseMultiply"))
				this._lightSpecArrayLoc.push(this._gTarget.getUniformLocation(this._program, this._setupInfo.lightsArrayStr + "[" + i + "].specularMultiply"))
				this._lightShinyArrayLoc.push(this._gTarget.getUniformLocation(this._program, this._setupInfo.lightsArrayStr + "[" + i + "].shininess"))
				this._lightNegativeArrayLoc.push(this._gTarget.getUniformLocation(this._program, this._setupInfo.lightsArrayStr + "[" + i + "].negativeHandler"))
				this._lightAltNegativeArrayLoc.push(this._gTarget.getUniformLocation(this._program, this._setupInfo.lightsArrayStr + "[" + i + "].negativeHandlerAlt"))
				//this._lightsTypeArrayLoc.push(this._gTarget.getUniformLocation(this._program, lightsArrayStr+"["+i+"].lightmask"))
			}

		this._bufLimit = (this._gTarget.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS > this._gTarget.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS ?
			this._gTarget.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS :
			this._gTarget.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS)

		this._setupInfo.customSetupFunction(this._gTarget, this._program);

		this._gTarget.useProgram(this._postProcessProgram)
		this._outBuffer = this._gTarget.createFramebuffer();

		if (this._setupInfo.postTexStr != null) {
			this._postTexCount = this._setupInfo.postTexCount;
			for (var i = 0; i < this._setupInfo.postTexCount; i++) {
				this._outImages.push(this._gTarget.createTexture());
				this._gTarget.activeTexture(this._gTarget.TEXTURE0+i);
				this._gTarget.bindTexture(this._gTarget.TEXTURE_2D, this._outImages[i]);
				this._gTarget.texImage2D(this._gTarget.TEXTURE_2D, 0, this._gTarget.RGBA, this._gTarget.canvas.clientWidth, this._gTarget.canvas.clientHeight, 0,
					this._gTarget.RGBA, this._gTarget.UNSIGNED_BYTE, null);
				// Mipmapping seems to cause problems in at least some cases
				//this._gTarget.generateMipmap(this._gTarget.TEXTURE_2D);
				this._gTarget.texParameteri(this._gTarget.TEXTURE_2D, this._gTarget.TEXTURE_MIN_FILTER, this._gTarget.NEAREST);
				this._gTarget.texParameteri(this._gTarget.TEXTURE_2D, this._gTarget.TEXTURE_MAG_FILTER, this._gTarget.NEAREST);
				this._gTarget.bindTexture(this._gTarget.TEXTURE_2D, null);

				if (!(this._setupInfo.texStr instanceof Array)) {
					this._postImageLoc.push(this._gTarget.getUniformLocation(this._postProcessProgram, this._setupInfo.postTexStr + "[" + i + "]"));
					if (this._postImageLoc[i] == -1) alert(this._setupInfo.postTexStr + "[" + i + "]" + ": unknown/invalid shader location");
				}
				else {
					this._postImageLoc.push(this._gTarget.getUniformLocation(this._postProcessProgram, this._setupInfo.postTexStr[i]));
					if (this._postImageLoc[i] == -1) alert(this._setupInfo.postTexStr[i] + ": unknown/invalid shader location");
				}
			}

			if (this._setupInfo.coordStr != null) {
				this._postPosBuf = this._gTarget.createBuffer();
				this._postPosIn = this._gTarget.getAttribLocation(this._postProcessProgram, this._setupInfo.coordStr);
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
			this._gTarget.bindTexture(this._gTarget.TEXTURE_2D, null);
			this._gTarget.bindRenderbuffer(this._gTarget.RENDERBUFFER, null);
	
			for (var i = 0; i < this._setupInfo.postTexCount; i++) {
				this._gTarget.uniform1i(this._postImageLoc[i], i);
			}
	
			for(var i = 0; i < this._postTexCount; i++) this._drawBuffers.push(this._gTarget.COLOR_ATTACHMENT0+i)
		}

		this._gTarget.useProgram(this._program)
		this._setup = true
		this._inSetup = false
	}

	_clearBuffers() {
		this._customClearFunction(this._gTarget, this._program)
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
	}

	_setViewMatrix(v, p, s) {
		if (this._viewMatrix != null) this._gTarget.uniformMatrix4fv(this._viewMatrix, false, flatten(v));
		if (this._cameraPosLoc != null) this._gTarget.uniform3fv(this._cameraPosLoc, flatten(p))
		if (this._cameraSclLoc != null) this._gTarget.uniform3fv(this._cameraSclLoc, flatten(s))
	}

	_setModelMatrix(m) {
		if (this._modelMatrix != null) this._gTarget.uniformMatrix4fv(this._modelMatrix, false, flatten(m))
		if (this._normalMatrix != null) this._gTarget.uniformMatrix4fv(this._normalMatrix, true, flatten(inverse(m)))
	}

	_setProjMatrix(p) {
		if (this._projMatrix != null) this._gTarget.uniformMatrix4fv(this._projMatrix, false, flatten(p));
	}

	_updateLights() {
		var x = -1
		if (this._lightIndLoc != null) {
			this._gTarget.uniform1iv(this._lightIndLoc, new Int32Array([x]))
			_lights.forEach((l) => {
				if (l != null && x < _maxLightCount - 1 && l._enabled && this._lightTypeArrayLoc.length - 1 > x && ((l._lightMask & this._bufferMask) != 0)) {
					x++;
					this._gTarget.uniform1iv(this._lightIndLoc, new Int32Array([x]))
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
		if (!noLighting) {
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
		this._gTarget.useProgram(this._program)
		this._gTarget.viewport(0, 0, _canvas.width, _canvas.height);
		this._gTarget.enable(this._gTarget.DEPTH_TEST);
		this._gTarget.enable(this._gTarget.CULL_FACE);
		this._gTarget.colorMask(true, true, true, true);
		this._gTarget.enable(this._gTarget.BLEND)
		this._gTarget.blendFunc(this._gTarget.SRC_ALPHA, this._gTarget.ONE_MINUS_SRC_ALPHA);
		this._gTarget.frontFace(this._gTarget.CW);
		this._gTarget.depthFunc(this._gTarget.LESS)

		if (!this._inSetup) {
			if (!this._setup) this._init();

			this._customBeginRenderFunction(this._gTarget, this._program)
			this._updateLights();
			this._gTarget.bindTexture(this._gTarget.TEXTURE_2D, null);

			this._gTarget.bindFramebuffer(this._gTarget.FRAMEBUFFER, this._outBuffer);
			for (var i = 0; i < this._setupInfo.postTexCount; i++) {
				this._gTarget.framebufferTexture2D(this._gTarget.FRAMEBUFFER, this._gTarget.COLOR_ATTACHMENT0+i, this._gTarget.TEXTURE_2D,
					this._outImages[i], 0);
			}

			this._gTarget.drawBuffers(this._drawBuffers);
			//this._gTarget.useProgram(this._program);
			this._gTarget.clearColor(0, 0, 0, 0)
			this._gTarget.clear(this._gTarget.COLOR_BUFFER_BIT | this._gTarget.DEPTH_BUFFER_BIT);
			this._clearBuffers();
		}
	}

	_renderData() {
		if (this._points.length > 0) {
			this._customPreRenderFunction(this._gTarget, this._program);

			if (this._posBuffer != null) {
				this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._posBuffer);
				this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, flatten(this._points), this._gTarget.STATIC_DRAW);
				this._gTarget.vertexAttribPointer(this._inPos, 3, this._gTarget.FLOAT, false, 0, 0);
				this._gTarget.enableVertexAttribArray(this._inPos);
			}

			if (this._matIndBuf != null) {
				this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._matIndBuf);
				this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, new Int16Array(this._matIndicies), this._gTarget.STATIC_DRAW);
				this._gTarget.vertexAttribIPointer(this._inMatIndex, 1, this._gTarget.SHORT, 0, 0);
				this._gTarget.enableVertexAttribArray(this._inMatIndex);
			}

			//load materials
			for (var i = 0; i < this._matParamCount; i++) {
				this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._matParamsBufs[i]);
				this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, flatten(this._matParams[i]), this._gTarget.STATIC_DRAW);
				this._gTarget.vertexAttribPointer(this._inMatParams[i], 4, this._gTarget.FLOAT, false, 0, 0);
				this._gTarget.enableVertexAttribArray(this._inMatParams[i]);
			}

			if (this._normBuf != null) {
				this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._normBuf);
				this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, flatten(this._normals), this._gTarget.STATIC_DRAW);
				this._gTarget.vertexAttribPointer(this._inNormal, 3, this._gTarget.FLOAT, true, 0, 0);
				this._gTarget.enableVertexAttribArray(this._inNormal);
			}

			if (this._tanBuf != null) {
				this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._tanBuf);
				this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, flatten(this._tangents), this._gTarget.STATIC_DRAW);
				this._gTarget.vertexAttribPointer(this._inTan, 3, this._gTarget.FLOAT, true, 0, 0);
				this._gTarget.enableVertexAttribArray(this._inTan);
			}

			if (this._biTanBuf != null) {
				this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._biTanBuf);
				this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, flatten(this._bitangents), this._gTarget.STATIC_DRAW);
				this._gTarget.vertexAttribPointer(this._inBiTan, 3, this._gTarget.FLOAT, true, 0, 0);
				this._gTarget.enableVertexAttribArray(this._inBiTan);
			}

			if (this._txBuf != null) {
				this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._txBuf);
				this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, flatten(this._texCoords), this._gTarget.STATIC_DRAW);
				this._gTarget.vertexAttribPointer(this._inTexCoord, 2, this._gTarget.FLOAT, false, 0, 0);
				this._gTarget.enableVertexAttribArray(this._inTexCoord);
			}

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

	_applyPostProcessToScene() {

		//this._gTarget.drawBuffers([this._gTarget.NONE, this._gTarget.NONE]);
		this._gTarget.useProgram(this._postProcessProgram)
		this._gTarget.depthFunc(this._gTarget.LESS)
		this._gTarget.bindFramebuffer(this._gTarget.FRAMEBUFFER, null);

		for(var i = 0; i < this.postTexCount; i++){
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