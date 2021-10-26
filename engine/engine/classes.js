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

	constructor(transform) {
		this._transform = transform

	}

	/**
	 * gets transform adjusted by all parents
	 */
	_getWorldTransformMat() {

		var newMat = mult(
			mult(translate(this._transform.pos[0], this._transform.pos[1], this._transform.pos[2]),
				scale(this._transform.scl[0], this._transform.scl[1], this._transform.scl[2])),
			quatToMat4(this._transform.rot))
		if (this._parent != null) return mult(this._parent._getWorldTransformMat(), newMat)
		else return newMat
	}

	_getWorldTransform() {
		return mat4ToTransform(this._getWorldTransformMat())
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
		var it = mat4ToTransform(inverse4(p._getWorldTransformMat()))
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

	_onTick(delta, time) {
		if (!equal(this._transform.pos, this._prevTransform.pos) || !quatEqual(this._transform.rot, this._prevTransform.rot) || !equal(this._transform.scl, this._prevTransform.scl))
			this._updated = true
	}

	_postTick(delta, time) {
		if (this._updated) {
			this._updated = false
			this._prevTransform = this._transform
			this._prevParent = this._parent
			this._addRemoveObjects = []
		}
	}
}

/**
 * buffer _Object representing all data necessary for any output buffer/view
 */

//TODO: increase the number of material parameters from 4 vec4s to 8 if possible
class _Buffer {
	_matParams = []
	_matIndex;
	_points = []
	_type;
	_offset;
	_texCoords = []
	_normals = []

	_posBuffer;
	_normBuf;
	_txBuf;
	_tanBuf;
	_bitanBuf;

	_inPos;
	_inTexCoord;
	_inNormal;
	_inBitan;
	_inTan;

	_projMatrix;
	_viewMatrix;
	_normalMatrix;
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
	_matIndLoc;
	_matParamsLoc = [];

	_bufLimit;
	_matParamCount;

	_getUniform(loc) {
		return this._gTarget.getUniform(this._program, loc)
	}

	constructor(gTarget, program, coordStr, matStr, matParamCount, matIndStr, projMatrixStr, viewMatrixStr, normalMatrixStr, lightsArrayStr, lightsIndexStr, normalStr, texCoordStr, cameraPosStr) {
		this._gTarget = gTarget;
		this._program = program;
		this._posBuffer = this._gTarget.createBuffer();
		this._normBuf = this._gTarget.createBuffer();
		this._txBuf = this._gTarget.createBuffer();
		this._tanBuf = this._gTarget.createBuffer();
		this._bitanBuf = this._gTarget.createBuffer();
		this._inPos = this._gTarget.getAttribLocation(this._program, coordStr);

		this._matParamCount = matParamCount;
		for (var i = 0; i < matParamCount; i++) {
			this._matParamsLoc.push(this._gTarget.getUniformLocation(this._program, matStr + "" + i));
		}

		this._inMatIndex = this._gTarget.getUniformLocation(this._program, matIndStr);
		this._projMatrix = this._gTarget.getUniformLocation(this._program, projMatrixStr);
		this._viewMatrix = this._gTarget.getUniformLocation(this._program, viewMatrixStr);
		this._normalMatrix = this._gTarget.getUniformLocation(this._program, normalMatrixStr);
		this._lightIndLoc = this._gTarget.getUniformLocation(this._program, lightsIndexStr);
		this._inNormal = this._gTarget.getAttribLocation(this._program, normalStr);
		this._inTexCoord = this._gTarget.getAttribLocation(this._program, texCoordStr);
		this._cameraPosLoc = this._gTarget.getUniformLocation(this._program, cameraPosStr);

		for (var i = 0; i < _maxLightCount; i++) {
			this._lightTypeArrayLoc.push(this._gTarget.getUniformLocation(this._program, lightsArrayStr + "[" + i + "].type"))
			this._lightLocArrayLoc.push(this._gTarget.getUniformLocation(this._program, lightsArrayStr + "[" + i + "].location"))
			this._lightDirArrayLoc.push(this._gTarget.getUniformLocation(this._program, lightsArrayStr + "[" + i + "].direction"))
			this._lightAngleArrayLoc.push(this._gTarget.getUniformLocation(this._program, lightsArrayStr + "[" + i + "].angle"))
			this._lightAttenArrayLoc.push(this._gTarget.getUniformLocation(this._program, lightsArrayStr + "[" + i + "].attenuation"))
			this._lightColorArrayLoc.push(this._gTarget.getUniformLocation(this._program, lightsArrayStr + "[" + i + "].color"))
			this._lightDiffArrayLoc.push(this._gTarget.getUniformLocation(this._program, lightsArrayStr + "[" + i + "].diffuseMultiply"))
			this._lightSpecArrayLoc.push(this._gTarget.getUniformLocation(this._program, lightsArrayStr + "[" + i + "].specularMultiply"))
			this._lightShinyArrayLoc.push(this._gTarget.getUniformLocation(this._program, lightsArrayStr + "[" + i + "].shininess"))
			this._lightNegativeArrayLoc.push(this._gTarget.getUniformLocation(this._program, lightsArrayStr + "[" + i + "].negativeHandler"))
			this._lightAltNegativeArrayLoc.push(this._gTarget.getUniformLocation(this._program, lightsArrayStr + "[" + i + "].negativeHandlerAlt"))
			//this._lightsTypeArrayLoc.push(this._gTarget.getUniformLocation(this._program, lightsArrayStr+"["+i+"].lightmask"))
		}
		this._bufLimit = (this._gTarget.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS > this._gTarget.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS ?
			this._gTarget.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS :
			this._gTarget.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS)
		_buffers.push(this);
	}

	_clearBuffers() {
		for (var i = 0; i < this._matParamCount; i++)
			this._matParams[i] = vec4(0, 0, 0, 0)
		this._points = []
		this._type = null
		this._offset = 0
		this._matIndex = -1
		this._texCoords = []
		this._normals = []
	}

	_setViewMatrix(v, p) {
		this._gTarget.uniformMatrix4fv(this._viewMatrix, false, flatten(v));
		this._gTarget.uniformMatrix4fv(this._normalMatrix, false, flatten(inverse(transpose(v))))
		this._gTarget.uniform3fv(this._cameraPosLoc, flatten(p))
	}

	_setProjMatrix(p) {
		this._gTarget.uniformMatrix4fv(this._projMatrix, false, flatten(p));
	}

	_updateLights() {
		var x = -1
		this._gTarget.uniform1iv(this._lightIndLoc, new Int32Array([x]))
		_lights.forEach((l) => {
			if (l != null && x < _maxLightCount - 1 && l._enabled) {
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
						var t = l._getWorldTransform()
						this._gTarget.uniform3fv(this._lightDirArrayLoc[x], flatten(mult(vec3(1, 1, -1), forward(t.rot))))
						this._gTarget.uniform3fv(this._lightLocArrayLoc[x], flatten(t.pos))
					case 1:
						this._gTarget.uniform4fv(this._lightColorArrayLoc[x], flatten(l._color));
						break;

				}
				this._gTarget.uniform1iv(this._lightNegativeArrayLoc[x], new Int32Array([l._handleNegative]))
			} else if (x >= maxLightCount - 1 && l != null && l._enabled) {
				_bufferedConsoleLog("WARNING: More than " + _maxLightCount + " used, light witih ID " + l._id + " will not be visible.")
			}
		})
		for (x++; x < _maxLightCount; x++)
			this._gTarget.uniform1iv(this._lightTypeArrayLoc[x], new Int32Array([0]))
	}

	_setMaterial(m){

	}

	_beginRender() {
		//("Rendering")
		//load new buffer data
		this._updateLights();
		this._gTarget.clear(this._gTarget.COLOR_BUFFER_BIT);
		this._clearBuffers();
	}

	_setBuffers(indArr, g, wireframe, current) {
		if (indArr.length + points.length > bufLimit)
			this._renderData();


		//this._buf._offsets.push(i.length)
		types.push(wireframe ? this._gTarget.LINE_LOOP : current.types[g])
		for (var ii = 0; ii < indArr.length; ii++) {
			/*if (!wireframe) {
				matIndicies.push(m[ii % m.length].index)
			}
			else {
				matIndicies.push(0)
			}
			this._buf._matParams1.push(m[ii % m.length].parameters[0])
			this._buf._matParams2.push(m[ii % m.length].parameters[1])
			this._buf._matParams3.push(m[ii % m.length].parameters[2])
			this._buf._matParams4.push(m[ii % m.length].parameters[3])
			this._buf._matParams5.push(m[ii % m.length].parameters[4])*/
			points.push(mult(current.points[indArr[ii]], vec4(1, 1, -1, 1)))
			normals.push(mult(current.normals[g][ii], vec3(1, 1, -1)))
			texCoords.push(current.texCoords[g][ii])
		}
	}

	_renderData() {
		if (this._points.length > 0) {
			this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._posBuffer);
			this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, flatten(this._points), this._gTarget.STATIC_DRAW);
			this._gTarget.vertexAttribPointer(this._inPos, 4, this._gTarget.FLOAT, false, 0, 0);
			this._gTarget.enableVertexAttribArray(this._inPos);
			//load materials

			/*this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._matIndBuf);
			this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, new Int16Array(this._matIndicies), this._gTarget.STATIC_DRAW);
			this._gTarget.vertexAttribIPointer(this._inMatIndex, 1, this._gTarget.SHORT, 0, 0);
			this._gTarget.enableVertexAttribArray(this._inMatIndex);
	
			this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._matBuf1);
			this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, flatten(this._matParams1), this._gTarget.STATIC_DRAW);
			this._gTarget.vertexAttribPointer(this._inMat1, 4, this._gTarget.FLOAT, false, 0, 0);
			this._gTarget.enableVertexAttribArray(this._inMat1);
	
			this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._matBuf2);
			this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, flatten(this._matParams2), this._gTarget.STATIC_DRAW);
			this._gTarget.vertexAttribPointer(this._inMat2, 4, this._gTarget.FLOAT, false, 0, 0);
			this._gTarget.enableVertexAttribArray(this._inMat2);
	
			this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._matBuf3);
			this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, flatten(this._matParams3), this._gTarget.STATIC_DRAW);
			this._gTarget.vertexAttribPointer(this._inMat3, 4, this._gTarget.FLOAT, false, 0, 0);
			this._gTarget.enableVertexAttribArray(this._inMat3);
	
			this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._matBuf4);
			this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, flatten(this._matParams4), this._gTarget.STATIC_DRAW);
			this._gTarget.vertexAttribPointer(this._inMat4, 4, this._gTarget.FLOAT, false, 0, 0);
			this._gTarget.enableVertexAttribArray(this._inMat4);
	
			this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._matBuf5);
			this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, flatten(this._matParams5), this._gTarget.STATIC_DRAW);
			this._gTarget.vertexAttribPointer(this._inMat5, 4, this._gTarget.FLOAT, false, 0, 0);
			this._gTarget.enableVertexAttribArray(this._inMat5);*/

			this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._normBuf);
			this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, flatten(this._normals), this._gTarget.STATIC_DRAW);
			this._gTarget.vertexAttribPointer(this._inNormal, 3, this._gTarget.FLOAT, true, 0, 0);
			this._gTarget.enableVertexAttribArray(this._inNormal);

			this._gTarget.bindBuffer(this._gTarget.ARRAY_BUFFER, this._txBuf);
			this._gTarget.bufferData(this._gTarget.ARRAY_BUFFER, flatten(this._texCoords), this._gTarget.STATIC_DRAW);
			this._gTarget.vertexAttribPointer(this._inTexCoord, 2, this._gTarget.FLOAT, false, 0, 0);
			this._gTarget.enableVertexAttribArray(this._inTexCoord);

			//draw
			var offset = 0;
			for (var i = 0; i < this._types.length; i++) {
				this._gTarget.drawArrays(this._types[i], offset, this._offsets[i]);
				offset += this._offsets[i];
			}
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
	_radius;

	constructor(pointInfo, type) {
		this._type = type;

		//get center of all points rendered
		this._pos = vec3()
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

			if (type == _Bounds._SPHERE) {
				//get furthest point from points rendered
				this._radius = subtract(pointInfo[0], this._pos)
				for (var i = 1; i < pointInfo.length; i++) {
					var tmp = subtract(pointInfo[i], this._pos)
					if (length(tmp) > length(this._radius)) this._radius = tmp
				}
			} else if (type == _Bounds._RECT) {

				this._extent = mult(.5, subtract(max, min));

				//set pos to the middle of the min and max points

			} else throw "Only _Bounds types supported now are RECT and SPHERE"
		} else {
			this._radius = 0
			this._extent = vec3(0, 0, 0)
		}
	}

	//defines points to draw _Bounds, manually
	_getRect(multMat = vec3(1, 1, 1), boundsColor = vec4(1, 1, 0, 1)) {
		var r = { points: [], colors: [] }
		r.colors.push(boundsColor)
		if (this._type == _Bounds._RECT) { //sphere TBD
			r.points = getRect(this._pos, this._extent);
		}
		for (var i = 0; i < r.points.length; i++)
			r.points[i] = mult(multMat, vec3to4(r.points[i]))
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
	_showBounds = false
	_renderEngine = false
	_renderAfter = true
	_enabled = true
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
		var rotMat = null
		var t = this._getWorldTransform()
		//bufferedConsoleLog(t)
		var rotQuat = Quaternion(t.rot.w, t.rot.x, t.rot.y, -t.rot.z)
		rotMat = quatToMat4(rotQuat);
		//(eulerToQuat(vec3(this._transform.rot[0]+90, -(this._transform.rot[1]-90), this._transform.rot[2])));
		rotMat = mult(rotMat, translate(-t.pos[0], -t.pos[1], t.pos[2]))
		rotMat = mult(rotMat, scale(1 / t.scl[0], 1 / t.scl[1], 1 / t.scl[2]))

		return rotMat
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
	_pushToBuffer() {
		if (this._enabled) {
			this._buf._clearBuffers();
			this._buf._setViewMatrix(this._getViewMat(), this._getWorldTransform().pos)

			//adding objects

			//TODO: implement texcoord, normal, etc.
			objects.forEach((o) => {
				if ((this._renderEngine && o.isEngine) || !o.isEngine) {
					if (o.visible) {
						var current = o._localToWorld();

						for (var g = 0; g < current.indexes.length; g++) {
							var i = current.indexes[g]

							if (i.length > this._buf._bufLimit)
								console.error("Unable to load data to GPU. Too many points. Length: " + i.length + "; Object: " + o);
							else {
								var m = current.mats[g]
								if (i.length + this._buf._points.length > this._buf._bufLimit)
									this.buf.renderData();


								this._buf._offsets.push(i.length)
								this._buf._types.push(this.wireframe ? this._buf._gTarget.LINE_LOOP : current.types[g])
								this._buf._matParams1.push(m[ii % m.length].parameters[0])
								this._buf._matParams2.push(m[ii % m.length].parameters[1])
								this._buf._matParams3.push(m[ii % m.length].parameters[2])
								this._buf._matParams4.push(m[ii % m.length].parameters[3])
								this._buf._matParams5.push(m[ii % m.length].parameters[4])
								if (!this._wireframe) {
									this._buf._matIndicies.push(m[ii % m.length].index)
								}
								else {
									this._buf._matIndicies.push(0)
								}
								for (var ii = 0; ii < i.length; ii++) {
									this._buf._points.push(mult(current.points[i[ii]], vec4(1, 1, -1, 1)))
									this._buf._normals.push(mult(current.normals[g][ii], vec3(1, 1, -1)))
									this._buf._texCoords.push(current.texCoords[g][ii])
								}

								this.buf.renderData();
							}
						}
						if (this._showBounds && !o.isEngine) {
							//(c)
							this._buf._types.push(this._buf._gTarget.LINE_LOOP);
							for (var i = 0; i < current.bounds.length; i++) {
								this._buf._points.push(mult(current.bounds[i], vec4(1, 1, -1, 1)))
								var tmp = new _SolidColorNoLighting(current.boundColors[i % current.boundColors.length]);
								this._buf._matIndicies.push(tmp._index)
								this._buf._matParams1.push(tmp._parameters[0])
								this._buf._matParams2.push(tmp._parameters[1])
								this._buf._matParams3.push(tmp._parameters[2])
								this._buf._matParams4.push(tmp._parameters[3])
								this._buf._matParams5.push(tmp._parameters[4])
								this._buf._normals.push(vec3(1, 0, 0))//_Bounds have no normals, this is just filler

							}
							this._buf._texCoords.push(vec2(0, 0)) //_Bounds have no textures, again just filler
							this._buf._offsets.push(current.bounds.length)
						}
					}
				}
			});
		}

		var x = 0
		for (var o = 0; o < this._debugOffsets.length; o++) {
			this._buf._types.push(this._debugTypes[o])
			this._buf._offsets.push(this._debugOffsets[o])
			for (var i = 0; i < this._debugOffsets[o]; i++) {
				this._buf._points.push(mult(this._debugPoints[i + x], vec4(1, 1, -1, 1)))
				var tmp = new _SolidColorNoLighting(this._debugColors[i % this._debugColors.length]);
				this._buf._matIndicies.push(tmp._index)
				this._buf._matParams1.push(tmp._parameters[0])
				this._buf._matParams2.push(tmp._parameters[1])
				this._buf._matParams3.push(tmp._parameters[2])
				this._buf._matParams4.push(tmp._parameters[3])
				this._buf._matParams5.push(tmp._parameters[4])
				this._buf._normals.push(vec3(1, 0, 0))//debug data has no normals, this is just filler
			}
			this._buf._texCoords.push(vec2(0, 0)) //_Bounds have no textures, again just filler
			x += this._debugOffsets[o]
			base += this._debugOffsets[o].length
		}
		//render any remaining data
		if (this._enabled)
			this._buf._renderData()
		//get uniform matrix

		//var rotMat = mult(mult(rotateZ(this._transform.rot[2]), rotateY(-(this._transform.rot[1] - 90))), rotateX(-this._transform.rot[0]))//this may look wrong, and it most definately is, but it works
	}

	_updateCameraView(fov = 90, aspect = -1, orthographic = false, range = [.1, 200000]) {
		this._fov = fov;
		this._ortho = orthographic;
		this._range = range;
		if (aspect < 0)
			this._aspect = this._buf._gTarget.canvas.clientWidth / this._buf._gTarget.canvas.clientHeight
		else this._aspect = aspect;
		this._buf._setProjMatrix(this._getProjMat());
	}

	/**
	 * 
	 * @param {vec3} pos 
	 * @param {vec3} rot 
	 * @param {vec3} scl 
	 * @param {*} fov 
	 * @param {*} ortho 
	 * @param {*} targetBuffer 
	 */
	constructor(targetBuffer, pos = vec3(0, 0, 0), rot = eulerToQuat(vec3(1, 0, 0), 0), scl = vec3(1, 1, 1), fov = 90, aspect = -1, orthographic = false, range = [.1, 200000], enabled = true, renderEngine = false) {
		//if(rot.length != 4) throw "Rotations must be quaternions!"
		super({ pos: pos, rot: rot, scl: scl })
		this._buf = targetBuffer
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
	constructor(startTransform, drawInfo, pointInfo, matInfo, boundsType, isEngine = false, visible = true) {
		//if(startTransform.rot.length != 4) throw "Rotations must be quaternions!"
		super(startTransform)
		this._id = _newID();
		this._drawInfo = drawInfo;
		this._pointInfo = pointInfo
		this._reevaluateBounds(pointInfo, boundsType)
		this._isEngine = isEngine
		this._matInfo = matInfo
		this._visible = visible
		_objects[this._id] = this
	}


	/**
	 * Returns points array and bounding box relative to world coordinates
	 */
	_localToWorld() {

		//mat4 generates matrix by cols, then rows
		//equation from Wikipedia
		var newMat = this._getWorldTransformMat()
		var newTrans = mat4ToTransform(newMat)

		//(newMat)
		/*var sclMat = mat4(
			obj.transform.scl.x, 0, 0,
			0, obj.transform,scl.y, 0,
			0, 0, obj.transform.scl.z
		)
		var transMat = vec4(obj.transform.pos.x + obj.transform.pos.y + obj.transform.pos.z)*/
		var ret = { points: [], indexes: [], types: [], mats: [], texCoords: [], normals: [], bounds: [], boundsIndex: [], boundColors: [], boundsType: this._bounds.type, visible: this._visible }

		for (var i = 0; i < this._pointInfo.length; i++) {
			var tmp = mult(newMat, vec3to4(this._pointInfo[i]))
			ret.points.push(tmp);
		}
		var rind = -1;
		for (var g = 0; g < this._drawInfo.length; g++) {


			var prevMatIndex = null
			for (var i = 0; i < this._drawInfo[g].pointIndex.length; i++) {
				//if(i == 0) bufferedConsoleLog(newMat)
				if (this._drawInfo[g].matIndex[i % this._drawInfo[g].matIndex.length] != prevMatIndex) {
					ret.indexes.push(new Array())
					ret.mats.push(new Array())
					ret.types.push(this._drawInfo[g].type)
					ret.normals.push(new Array())
					ret.texCoords.push(new Array())
					rind++;
					prevMatIndex = this._drawInfo[g].matIndex[i % this._drawInfo[g].matIndex.length]
				}
				ret.indexes[rind].push(this._drawInfo[g].pointIndex[i])
				switch (this._drawInfo[g].type) {
					case _gl.TRIANGLES:
						ret.normals[rind].push(rotateAbout(this._drawInfo[g].normals[Math.floor(i / 3)], newTrans.rot)) //push 3 for each vert
						break;
					default:
						ret.normals[rind].push(rotateAbout(this._drawInfo[g].normals[i], newTrans.rot))
				}

				ret.texCoords[rind].push(this._drawInfo[g].texCoords[i])
				//(this._drawInfo[g].colors[i % this._drawInfo[g].colors.length])
				ret.mats[rind].push(this._matInfo[this._drawInfo[g].matIndex[i % this._drawInfo[g].matIndex.length]])
			}
		}

		var c = this._bounds._getRect(newMat)
		for (var i = 0; i < c.points.length; i++) {
			ret.bounds.push(c.points[i])
			ret.boundsIndex.push(i)
		}
		for (var i = 0; i < c.colors.length; i++) {
			ret.boundColors.push(c.colors[i])
		}
		return ret;
	}

	/*TODO
	update() {
		if (this._transform.pos != this._prevTransform.pos ||
			this._transform.rot != this._prevTransform.rot ||
			this._transform.scl != this._prevTransform.scl)
			
	}*/
}