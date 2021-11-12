"use strict";

/**
 * something in 3D space that can be attached to other primitives
 */
class _Primitive {
	_transform = { pos: vec3(), rot: Quaternion(0, 1, 0, 0), scl: vec3() };
	_connectedObjects = new Set()
	_prevParent
	_addRemoveObjects = []
	_parent = null
	_prevTransform;
	_updated;
	_customTickFunc = function(delta, time) {}
	_customPreTick = function(delta, time) {}
	_customPostTick = function(delta, time) {}

	_cameraMask = 0x1;
	_bufferMask = 0x1;
	_lightMask = 0x1;

	constructor(transform, bufferMask= 0x1, cameraMask= 0x1, lightMask= 0x1) {
		this._transform = transform
		this._bufferMask = bufferMask
		this._cameraMask = cameraMask
		this._lightMask = lightMask

	}

	/**
	 * gets transform adjusted by all parents
	 */

	_getWorldTransform(flipZ = false) {
		if(this._parent != null){
			var p = this._parent._getWorldTransform(flipZ)
			return {pos: add(rotateAbout(mult(this._transform.pos, vec3(1,1,1)), p.rot), p.pos),
				rot: addRotation(p.rot, this._transform.rot),
				scl: mult(p.scl, this._transform.scl)}
		}
		return {pos: mult(this._transform.pos, vec3(1,1,1)), rot: this._transform.rot, scl: this._transform.scl}
	}

	_getModelMat(flipZ = false) {
		var t = this._getWorldTransform(flipZ);
		//var tmpf = mult(forward(this._transform.rot),vec3(1,1,flipZ?-1:1)), tmpu = mult(up(this._transform.rot), vec3(1,1,flipZ?-1:1))
		
		return mult(
			mult(translate(t.pos[0], t.pos[1], -t.pos[2]),
				scale(t.scl[0], t.scl[1], t.scl[2])),
				quatToMat4(t.rot))
	}

	/**
	 * 
	 * @param {*} parent 
	 * @param {*} attachType keepWorld: converts world transform into relative transform and sets own transform; keepRelative: Calculates relative transform based on current transform and parent's 
	 * @param {*} newAttachTransform Optional. Set a relative transform if attachType = "relative". If empty, set to parent transform
	 */
	_attachSelfToParent(p, attachType, newAttachTransform = null) {
		this._detach("keepWorld")
		var wt = this._getWorldTransform()
		var pt = p._getWorldTransform()
		var it = mat4ToTransform(inverse4(p._getModelMat()))
		switch (attachType.pos) {
			case "keepWorld":
				this._transform.pos = rotateAbout(subtract(wt.pos, pt.pos), it.rot)
				console.log(this._transform.pos)
				break
			case "relative":
				if (newAttachTransform == null)
					this._transform.pos = vec3(0, 0, 0)
				else
					this._transform.pos = newAttachTransform.pos
				break
			case "dontChange":
				break
		}

		switch (attachType.rot) {
			case "keepWorld":
				this._transform.rot = addRotation(wt.rot, invQuat(pt.rot))
				break
			case "relative":
				if (newAttachTransform == null)
					this._transform.rot = eulerToQuat(vec3(1, 0, 0), 0)
				else
					this._transform.rot = newAttachTransform.rot
				break
			case "dontChange":
				break
		}

		switch (attachType.scl) {
			case "keepWorld":
				this._transform.scl = vec3(wt.scl[0] / pt.scl[0], wt.scl[1] / pt.scl[1], wt.scl[2] / pt.scl[2])
				break
			case "relative":
				if (newAttachTransform == null)
					this._transform.scl = vec3(1, 1, 1)
				else
					this._transform.scl = newAttachTransform.scl
				break
			case "dontChange":
				break
		}
		this._parent = p
		//console.log(p.connectedObjects)
		this._parent._addRemoveObjects.push(this)
		p._connectedObjects.add(this)
		this._updated = true
		p._updated = true

	}

	_attachChildToSelf(child, attachType, newAttachTransform = null) {
		child._attachSelfToParent(this, attachType, newAttachTransform)
	}

	_detach(detachType) {
		if (this._parent == null) return
		var newTransform = this._transform
		var wt = this._getWorldTransform()
		switch (detachType.pos) {
			case "keepWorld":
				newTransform.pos = wt.pos
		}
		switch (detachType.rot) {
			case "keepWorld":
				newTransform.rot = wt.rot
		}
		switch (detachType.scl) {
			case "keepWorld":
				newTransform.scl = wt.scl
		}
		this._transform = newTransform
		this._parent._updated = true
		this._parent._addRemoveObjects.push(this)
		this._parent._connectedObjects.delete(this)
		this._parent = null
		this._updated = true
	}

	_preTick(delta, time) {
		if ((this._prevTransform == null) || (!equal(this._transform.pos, this._prevTransform.pos) || !quatEqual(this._transform.rot, this._prevTransform.rot) || !equal(this._transform.scl, this._prevTransform.scl)))
			this._updated = true
		this._customPreTick(delta, time)
	}

	_onTick(delta, time){
		this._customTickFunc(delta, time)
	}

	_postTick(delta, time) {
		if (this._updated) {
			this._updated = false
			this._prevTransform = this._transform
			this._prevParent = this._parent
			this._addRemoveObjects = []
		}
		this._customPostTick(delta, time)
	}
}

/**
 * buffer _Object representing all data necessary for any output buffer/view
 */

//TODO: increase the number of material parameters from 4 vec4s to 8 if possible
class _Buffer {
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
	_frameBuf;
	_renderBuf;

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

	_bufLimit;
	_matParamCount = 0;
	_texCount = 0;
	_isFrameBuffer;
	_isRenderbuffer;
	_bufferMask = 0x1;
	_setup = false;

	_setupInfo = {
		coordStr: null, matStr: null, matParamCount: null, matIndStr: null, texStr: null, texCount: null, projMatrixStr: null, 
		viewMatrixStr: null, normalMatrixStr: null, modelMatrixStr: null, lightsArrayStr: null, lightsIndexStr: null, 
		normalStr: null, tanStr: null, biTanStr: null, texCoordStr: null, cameraPosStr: null, cameraScaleStr: null,
		customSetupFunction: null
	}
	
	_customClearFunction = (gTarget, program) => {}
	_customBeginRenderFunction = (gTarget, program) => {}
	_customPreRenderFunction = (gTarget, program) => {}
	_customRenderFunction = (gTarget, program) => {}
	_customPostRenderFunction = (gTarget, program) => {}

	_getUniform(loc) {
		return this._gTarget.getUniform(this._program, loc)
	}
	
	constructor(gTarget, program, isFrameBuffer=false, isRenderBuffer=false,
		coordStr="inPointsL", matStr="inMatProp", matParamCount=6, matIndStr="inMatIndex", 
		texStr=["baseImage", "normalMap", "depthMap", "diffuseMap", "specularMap"], 
		texCount=5, projMatrixStr="projMatrix", viewMatrixStr="viewMatrix", normalMatrixStr="normalMatrix",
		modelMatrixStr="modelMatrix", lightsArrayStr="lights", lightsIndexStr="maxLightIndex", 
		normalStr="inNormalL", tanStr="inTangentL", biTanStr=null, texCoordStr="inTexCoord",
		cameraPosStr="inCameraPosW", cameraScaleStr="inCameraScale", customSetupFunction=function(gTarget, program) {},
		bufferMask = 0x1) {
		this._gTarget = gTarget;
		this._program = program;
		this._bufferMask = bufferMask;
		this._isFrameBuffer = isFrameBuffer;
		this._isRenderbuffer = isRenderBuffer;

		this._setupInfo = {
			coordStr: coordStr, matStr: matStr, matParamCount: matParamCount, matIndStr: matIndStr, texStr: texStr, texCount: texCount,
			projMatrixStr: projMatrixStr, viewMatrixStr: viewMatrixStr, normalMatrixStr: normalMatrixStr, modelMatrixStr: modelMatrixStr,
			lightsArrayStr: lightsArrayStr, lightsIndexStr: lightsIndexStr, normalStr:normalStr, tanStr:tanStr, biTanStr:biTanStr, texCoordStr:texCoordStr,
			cameraPosStr: cameraPosStr, cameraScaleStr: cameraScaleStr, customSetupFunction: customSetupFunction
		}

		_buffers.push(this);

	}

	_init(){
		if(this._isFrameBuffer)
			this._frameBuf = this._gTarget.createFrameBuffer();

		
		if(this._isRenderBuffer)
			this._renderBuf = this._gTarget.createRenderBuffer();

		if(this._setupInfo.coordStr != null){
			this._posBuffer = this._gTarget.createBuffer();
			this._inPos = this._gTarget.getAttribLocation(this._program, this._setupInfo.coordStr);
			if (this._inPos == -1) alert(this._setupInfo.coordStr + ": unknown/invalid shader location");
		}

		if(this._setupInfo.normalStr != null){
			this._normBuf = this._gTarget.createBuffer();
			this._inNormal = this._gTarget.getAttribLocation(this._program, this._setupInfo.normalStr);
			if (this._inNormal == -1) alert(this._setupInfo.normalStr + ": unknown/invalid shader location");
		}
		
		if(this._setupInfo.texCoordStr != null){
			this._txBuf = this._gTarget.createBuffer();
			this._inTexCoord = this._gTarget.getAttribLocation(this._program, this._setupInfo.texCoordStr);
			if (this._inTexCoord == -1) alert(this._setupInfo.texCoordStr + ": unknown/invalid shader location");
		}

		if(this._setupInfo.tanStr != null){
			this._tanBuf = this._gTarget.createBuffer();
			this._inTan = this._gTarget.getAttribLocation(this._program, this._setupInfo.tanStr);
			if (this._inTan == -1) alert(this._setupInfo.tanStr + ": unknown/invalid shader location");
		}

		if(this._setupInfo.biTanStr != null){
			this._biTanBuf = this._gTarget.createBuffer();
			this._inBiTan = this._gTarget.getAttribLocation(this._program, this._setupInfo.biTanStr);
			if (this._inBiTan == -1) alert(this._setupInfo.biTanStr + ": unknown/invalid shader location");
		}

		if(this._setupInfo.matStr != null){
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

		if(this._setupInfo.texStr != null){
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

		if(this._setupInfo.matIndStr != null){
			this._inMatIndex = this._gTarget.getAttribLocation(this._program, this._setupInfo.matIndStr);
			if (this._inMatIndex == -1) alert(this._setupInfo.matIndStr + ": unknown/invalid shader location");
		}

		if(this._setupInfo.projMatrixStr != null){
			this._projMatrix = this._gTarget.getUniformLocation(this._program, this._setupInfo.projMatrixStr);
			if (this._projMatrix == -1) alert(this._setupInfo.projMatrixStr + ": unknown/invalid shader location");
		}

		if(this._setupInfo.viewMatrixStr != null){
			this._viewMatrix = this._gTarget.getUniformLocation(this._program, this._setupInfo.viewMatrixStr);
			if (this._viewMatrix == -1) alert(this._setupInfo.viewMatrixStr + ": unknown/invalid shader location");
		}
		if(this._setupInfo.normalMatrixStr != null){
			this._normalMatrix = this._gTarget.getUniformLocation(this._program, this._setupInfo.normalMatrixStr);
			if (this._normalMatrix == -1) alert(this._setupInfo.normalMatrixStr + ": unknown/invalid shader location");
		}
		
		if(this._setupInfo.modelMatrixStr != null){
			this._modelMatrix = this._gTarget.getUniformLocation(this._program, this._setupInfo.modelMatrixStr);
			if (this._modelMatrix == -1) alert(this._setupInfo.modelMatrixStr + ": unknown/invalid shader location");
		}
		
		if(this._setupInfo.lightsIndexStr != null){
			this._lightIndLoc = this._gTarget.getUniformLocation(this._program, this._setupInfo.lightsIndexStr);
			if (this._lightIndLoc == -1) alert(this._setupInfo.lightsIndexStr + ": unknown/invalid shader location");
		}
		
		if(this._setupInfo.cameraPosStr != null){
			this._cameraPosLoc = this._gTarget.getUniformLocation(this._program, this._setupInfo.cameraPosStr);
			if (this._cameraPosLoc == -1) alert(this._setupInfo.cameraPosStr + ": unknown/invalid shader location");
		}
		
		if(this._setupInfo.cameraScaleStr != null){
			this._cameraSclLoc = this._gTarget.getUniformLocation(this._program, this._setupInfo.cameraScaleStr);
			if (this._cameraSclLoc == -1) alert(this._setupInfo.cameraScaleStr + ": unknown/invalid shader location");
		}

		if(this._setupInfo.lightsArrayStr != null)
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

		this._setup = true
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
		if (this.cameraSclLoc != null) this._gTarget.uniform3fv(this._cameraSclLoc, flatten(s))
	}

	_setModelMatrix(m) {
		if(this._modelMatrix != null) this._gTarget.uniformMatrix4fv(this._modelMatrix, false, flatten(m))
		if(this._normalMatrix != null) this._gTarget.uniformMatrix4fv(this._normalMatrix, true, flatten(inverse(m)))
	}

	_setProjMatrix(p) {
		if(this._projMatrix != null) this._gTarget.uniformMatrix4fv(this._projMatrix, false, flatten(p));
	}

	_updateLights() {
		var x = -1
		if(this._lightIndLoc != null){
			this._gTarget.uniform1iv(this._lightIndLoc, new Int32Array([x]))
			_lights.forEach((l) => {
				if (l != null && x < _maxLightCount - 1 && l._enabled && this._lightTypeArrayLoc.length-1 > x && ((l._lightMask & this._bufferMask) != 0)) {
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
				} else if(l._lightMask & this._bufferMask == 0){
					this._gTarget.uniform1iv(this._lightTypeArrayLoc[x], new Int32Array([0]))
				}
			})
			for (x++; x < _maxLightCount && x < this._lightTypeArrayLoc.length; x++)
				this._gTarget.uniform1iv(this._lightTypeArrayLoc[x], new Int32Array([0]))
		}
	}

	_loadMaterial(m, hasTexture = false, noLighting = false) {
		if (!noLighting) {
			this._matIndicies.push(m._index)
		}
		else {
			if (hasTexture)
				if (m._index == 2) this._matIndicies.push(4)
				else this._matIndicies.push(5)
			else this._matIndicies.push(0)
		}
		for (var i = 0; i < this._matParamCount; i++)
			this._matParams[i].push(m._parameters[i % m._parameters.length])
	}

	_loadTexture(t, cameraMask) {
		if(this._textureLoc.length > 0) t._applyTexture(this._textureLoc, this._bufferMask, cameraMask)
	}

	_beginRender() {
		//("Rendering")
		//load new buffer data
		this._gTarget.useProgram(this._program)
		if(!this._setup) this._init();
		this._customBeginRenderFunction(this._gTarget, this._program)
		this._updateLights();
		//this._gTarget.useProgram(this._program);
		this._gTarget.clear(this._gTarget.COLOR_BUFFER_BIT);
		this._clearBuffers();
	}

	_renderData() {
		if (this._points.length > 0) {
			this._customPreRenderFunction(this._gTarget, this._program);

			if(this._posBuffer != null){
				this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._posBuffer);
				this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, flatten(this._points), this._gTarget.STATIC_DRAW);
				this._gTarget.vertexAttribPointer(this._inPos, 3, this._gTarget.FLOAT, false, 0, 0);
				this._gTarget.enableVertexAttribArray(this._inPos);
			}

			if(this._matIndBuf != null){
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

			if(this._normBuf != null){
				this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._normBuf);
				this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, flatten(this._normals), this._gTarget.STATIC_DRAW);
				this._gTarget.vertexAttribPointer(this._inNormal, 3, this._gTarget.FLOAT, true, 0, 0);
				this._gTarget.enableVertexAttribArray(this._inNormal);
			}

			if(this._tanBuf != null){
				this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._tanBuf);
				this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, flatten(this._tangents), this._gTarget.STATIC_DRAW);
				this._gTarget.vertexAttribPointer(this._inTan, 3, this._gTarget.FLOAT, true, 0, 0);
				this._gTarget.enableVertexAttribArray(this._inTan);
			}

			if(this._biTanBuf != null){
				this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._biTanBuf);
				this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, flatten(this._bitangents), this._gTarget.STATIC_DRAW);
				this._gTarget.vertexAttribPointer(this._inBiTan, 3, this._gTarget.FLOAT, true, 0, 0);
				this._gTarget.enableVertexAttribArray(this._inBiTan);
			}

			if(this._txBuf != null){
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
}

/**
 * extremely rough class representing visibility _Bounds for an _Object
 */
class _Bounds {
	static _RECT = "rect"
	static _SPHERE = "sphere"
	_type;
	_pos;
	_extent;
	_parentObject;
	_shape;


	constructor(pointInfo, type, parentObject) {
		this._type = type;
		this._parentObject = parentObject;
		this._updateBounds(pointInfo);
		//get center of all points rendered
		
	}

	_updateBounds(pointInfo){
		this._pos = vec3(0,0,0)
		if (pointInfo.length > 0) {
			var min = vec3(pointInfo[0][0], pointInfo[0][1], pointInfo[0][2]) //POINTERS PLS
			var max = vec3(pointInfo[0][0], pointInfo[0][1], pointInfo[0][2])
			//get min and max x, y, z values
			for (var i = 0; i < pointInfo.length; i++) {
				for (var ii = 0; ii < pointInfo[i].length; ii++) {
					if (pointInfo[i][ii] > max[ii]) { max[ii] = pointInfo[i][ii] }
					if (pointInfo[i][ii] < min[ii]) { min[ii] = pointInfo[i][ii] }
				}
			}

			this._pos = mult(.5, add(min, max))
			//(this._pos)
			this._extent = mult(.5, subtract(max, min));
			if (this._type == _Bounds._SPHERE) {
				//get furthest point from points rendered
				
				this._shape = _getSphere(this._pos, this._extent, 5, 5)
				
			} else if (this._type == _Bounds._RECT) {
				this._shape = _getRect(this._pos, this._extent);
				//set pos to the middle of the min and max points

			} else throw "Only _Bounds types supported now are RECT and SPHERE"
		} else {
			this._extent = vec3(0, 0, 0)
		}
	}

	//defines points to draw _Bounds, manually
	_getDrawBounds(multMat = vec3(1, 1, 1)) {
		var r = []
		var tmp = this._shape;
		for (var i = 0; i < tmp.index.length; i++)
			r.push(mult(multMat, vec3to4(tmp.points[tmp.index[i]])))
		return r
	}

	//defines points to draw _Bounds, manually
	_getGraphicsDrawBounds(boundsColor = vec4(1, 1, 0, 1)) {
		var r = { points: [], colors: [] }
		var tmp = this._shape;
		r.colors.push(boundsColor);
		for (var i = 0; i < tmp.index.length; i++)
			r.points.push(vec3to4(tmp.points[tmp.index[i]]))
		return r
	}
}

/**
 * representation of a view, targeting an (optional) buffer
 */
class _Camera extends _Primitive {

	_debugPoints = []
	_debugColors = []
	_debugTypes = []
	_debugOffsets = []
	_wireframe = false
	_noLighting = false
	_showBounds = false
	_renderEngine = false
	_render = true
	_enabled = true
	_bufs = []
	_currentFov = -1
	_currentAspect = -1
	_currentRange = [-1, -1]
	_currentProjMat = null

	_clearDebug() {
		this._debugPoints = []
		this._debugColors = []
		this._debugTypes = []
		this._debugOffsets = []
	}

	_getProjMat() {
		return this._ortho ? ortho(-this._fov / 2, this._fov / 2, -(this._fov / 2) * this._aspect, (this._fov / 2) * this._aspect, this._range[0], this._range[1]) : perspective(this._fov, this._aspect, this._range[0], this._range[1])
	}

	_getViewMat() {
		//var rotMat = null
		//var t = this._getModelMat(true)
		/*//bufferedConsoleLog(t)
		var rotQuat = Quaternion(t.rot.w, t.rot.x, t.rot.y, -t.rot.z)
		rotMat = quatToMat4(rotQuat);
		//(eulerToQuat(vec3(this._transform.rot[0]+90, -(this._transform.rot[1]-90), this._transform.rot[2])));
		rotMat = mult(rotMat, scale(1 / t.scl[0], 1 / t.scl[1], 1 / t.scl[2]))
		rotMat = mult(rotMat, translate(-t.pos[0], -t.pos[1], -t.pos[2]))
		

		return rotMat*/
		return lookAt(this._transform.pos, add(this._transform.pos,forward(this._transform.rot)), up(this._transform.rot), true)
	}

	/**
	 * Determines whether or not the points are within the view of the _Camera, to determine whether or not to acutally include 
	 * @param {*} points 
	 */
	_inView(points) {
		//TODO
	}

	/**
	 * Pushes all points in every _Object in scene to its buffer
	 * @param wireframe if true, display all geometry as gl.LINE_LOOP
	 * @param showBounds if true, show _Bounds of all geometry
	 * @param renderAfter true if _Camera should be immediately rendered to its view after pushing data to buffer
	 */
	_pushToBuffers() {
		if (this._enabled) {
			this._bufs.forEach((f) => {
				f._clearBuffers();
				var p = this._getWorldTransform(true);
				f._setViewMatrix(this._getViewMat(), p.pos, p.scl)

				//adding objects

				_objects.forEach((o) => {
					if (((o._bufferMask & o._cameraMask & f._bufferMask & this._cameraMask) != 0) && ((this._renderEngine && o._isEngine) || !o._isEngine)) {
						if (o._visible) {
							o._setGraphicsData(f, this);
							if(this._render) f._renderData();
						}
					}
				});
				var x = 0
				for (var o = 0; o < this._debugOffsets.length; o++) {
					f._types.push(this._debugTypes[o])
					f._offsets.push(this._debugOffsets[o])
					for (var i = 0; i < this._debugOffsets[o]; i++) {
						if (i.length + f._points.length > f._bufLimit)
							f._renderData();
						f._points.push(this._debugPoints[i + x])
						var tmp = new _SolidColorNoLighting(this._debugColors[i % this._debugColors.length]);
						f._clearBuffers();
				var p = this._getWorldTransform(true);
				f._setViewMatrix(this._getViewMat(), p.pos, p.scl)

				//adding objects

				_objects.forEach((o) => {
					if ((this._renderEngine && o._isEngine) || !o._isEngine) {
						if (o._visible) {
							o._setGraphicsData(f, this);
							if(this._render) f._renderData();
						}
					}
				});
				var x = 0
				for (var o = 0; o < this._debugOffsets.length; o++) {
					f._types.push(this._debugTypes[o])
					f._offsets.push(this._debugOffsets[o])
					for (var i = 0; i < this._debugOffsets[o]; i++) {
						if (i.length + f._points.length > f._bufLimit)
							f._renderData();
						f._points.push(this._debugPoints[i + x])
						var tmp = new _SolidColorNoLighting(this._debugColors[i % this._debugColors.length]);
						f._loadMaterial(tmp, false, this._wireframe || this._noLighting)
						f._normals.push(vec3(1, 0, 0))//debug data has no normals, this is just filler
						f._tangents.push(vec3(0, 1, 0))
						//f._bitangents.push(vec3(0, 0, 1))
					}
					f._texCoords.push(vec2(0, 0)) //_Bounds have no textures, again just filler
					x += this._debugOffsets[o]
					base += this._debugOffsets[o].length
				}
				//render any remaining data
				if (this._render)
					f._renderData()._loadMaterial(tmp, false, this._wireframe || this._noLighting)
						f._normals.push(vec3(1, 0, 0))//debug data has no normals, this is just filler
						f._tangents.push(vec3(0, 1, 0))
						//f._bitangents.push(vec3(0, 0, 1))
					}
					f._texCoords.push(vec2(0, 0)) //_Bounds have no textures, again just filler
					x += this._debugOffsets[o]
					base += this._debugOffsets[o].length
				}
				//render any remaining data
				if (this._render)
					f._renderData()
				})
			
		}


		//get uniform matrix

		//var rotMat = mult(mult(rotateZ(this._transform.rot[2]), rotateY(-(this._transform.rot[1] - 90))), rotateX(-this._transform.rot[0]))//this may look wrong, and it most definately is, but it works
	}

	_updateCameraView(fov = 90, aspect = -1, orthographic = false, range = [.1, 200000], targetBuf = null, width=null, height=null) {
		var b = targetBuf
		var w = width
		var h = height
		var a = aspect
		
		if (b == null) b = this._bufs[0]
		if(w == null) w = b._gTarget.canvas.clientWidth;
		if(h == null) h = b._gTarget.canvas.clientHeight;
		if (a < 0) a = w / h

		var changed = false;
		if(this._fov != fov){
			this._fov = fov;
			changed = true;
		}
		if(this._ortho != orthographic){
			this._ortho = orthographic;
			changed = true
		}
		
		if(this._range != range){
			this._range = range;
			changed = true
		}
		
		
		if (a != this._aspect) {
			this._aspect =a
			changed = true
		}

		if(changed || this._currentProjMat == null)
			this._currentProjMat = this._getProjMat()
		b._setProjMatrix(this._currentProjMat);
	}

	/**
	 * 
	 * @param {vec3} pos 
	 * @param {vec3} rot 
	 * @param {vec3} scl 
	 * @param {*} fov 
	 * @param {*} ortho 
	 * @param {*} targetBuffers
	 */
	constructor(targetBuffers, pos = vec3(0, 0, 0), rot = eulerToQuat(vec3(1, 0, 0), 0), scl = vec3(1, 1, 1), fov = 90, aspect = -1, orthographic = false, range = [.1, 200000], enabled = true, renderEngine = false) {
		//if(rot.length != 4) throw "Rotations must be quaternions!"
		super({ pos: pos, rot: rot, scl: scl })
		if(targetBuffers instanceof Array) this._bufs = targetBuffers
		else this._bufs = [targetBuffers]
		this._enabled = enabled
		this._renderEngine = renderEngine
		this._updateCameraView(fov, aspect, orthographic, range)
		_cameras.push(this);
	}
}


/**
 * 3D _Primitive containing material data, coordinate data, and _Bounds
 * Note: For attached primitives to _Object, if you want to attach a _Primitive to a point, you must set the _Primitive's transform to the point location manually.
 */
class _Object extends _Primitive {
	_drawInfo = []
	_pointInfo = []
	_isEngine = false
	_matInfo = []
	_textureInfo = []
	_visible = []
	_id = -1

	/**To be called whenever individual points are adjusted */
	_reevaluateBounds(pointInfo, boundsType) {
		this._bounds = new _Bounds(pointInfo, boundsType);
	}


	/**
	 * 
	 * @param {transform} startTransform
	 * @param {drawInfo} drawInfo array of [{pointIndex[], matIndex[], texCoords[], type}]
	 * @param {enum} drawType 
	 */
	constructor(startTransform, drawInfo, pointInfo, matInfo, boundsType, textureInfo = [], isEngine = false, visible = true) {
		//if(startTransform.rot.length != 4) throw "Rotations must be quaternions!"
		super(startTransform)
		this._id = _newID();
		this._drawInfo = drawInfo;
		this._pointInfo = pointInfo
		this._reevaluateBounds(pointInfo, boundsType)
		this._isEngine = isEngine
		this._matInfo = matInfo
		this._textureInfo = textureInfo
		this._visible = visible
		_objects.set(this._id, this)
	}


	/**
	 * Returns points array and bounding box relative to world coordinates
	 */
	_setGraphicsData(buf, camera) {

		//mat4 generates matrix by cols, then rows
		//equation from Wikipedia
		var newMat = this._getModelMat(true)
		//var newTrans = mat4ToTransform(newMat)
		var b = this._bounds._getGraphicsDrawBounds()

		buf._setModelMatrix(newMat)
		
		for (var g = 0; g < this._drawInfo.length; g++) {
			var d = this._drawInfo[g]
			var i = d.pointIndex

			if (i.length > buf._bufLimit)
				console.error("Unable to load data to GPU. Too many points. Length: " + i.length + "; Object: " + o);
			else {

				if (((i.length + buf._points.length > buf._bufLimit) || d.textureIndex != -1) && camera._render)
					buf._renderData();


				buf._offsets.push(i.length)
				buf._types.push(camera._wireframe ? buf._gTarget.LINE_LOOP : d.type)

				if (d.textureIndex != -1)
					buf._loadTexture(this._textureInfo[d.textureIndex], camera._cameraMask)

				for (var ii = 0; ii < i.length; ii++) {
					buf._loadMaterial(this._matInfo[d.matIndex[ii%d.matIndex.length]], d.textureIndex != -1, camera._wireframe || camera._noLighting)
					buf._points.push(mult(this._pointInfo[i[ii]], vec3(1,-1,-1)))
					switch (d.type) {
						case _gl.TRIANGLES:
						buf._normals.push(d.normals[Math.floor(ii / 3)]) //push 3 for each vert
						buf._tangents.push(d.tangents[Math.floor(ii / 3)]) //push 3 for each vert
						break;
					default:
						buf._normals.push(d.normals[ii])
						buf._tangents.push(d.tangents[ii])
						
					}
					buf._texCoords.push(d.texCoords[ii])
				}

				if ((d.textureIndex != -1 || camera._showNormalTangents) && camera._render)
					buf._renderData();
			}
		}
		if (camera._showBounds && !o._isEngine) {
			if (camera._render)
				buf._renderData();
			buf._types.push(buf._gTarget.LINE_LOOP);
			
			buf._offsets.push(current.bounds.length)
			for (var i = 0; i < b.points.length; i++) {
				buf._points.push(b.points[i])
				var tmp = new _SolidColorNoLighting(b.colors[i % b.colors.length]);
				buf._loadMaterial(tmp, false, camera._wireframe || camera._noLighting)
				buf._normals.push(vec3(1, 0, 0))//_Bounds have no normals, this is just filler
				buf._tangents.push(vec3(0, 1, 0))
				buf._texCoords.push(vec2(0, 0)) //_Bounds have no textures, again just filler
				//buf_bitangents.push(vec3(0, 0, 1))
			}
		} //camera will take care of final _renderData for this object
	}

	/*TODO
	update() {
		if (this._transform.pos != this._prevTransform.pos ||
			this._transform.rot != this._prevTransform.rot ||
			this._transform.scl != this._prevTransform.scl)
			
	}*/
}