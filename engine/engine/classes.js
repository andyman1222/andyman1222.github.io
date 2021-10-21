/**
 * something in 3D space that can be attached to other primitives
 */
class primitive {
	transform = { pos: vec3(), rot: vec4(), scl: vec3() };
	connectedObjects = new Set()
	parent = null
	prevTransform;

	constructor(transform) {
		this.transform = transform
		this.prevTransform = transform;

	}

	/**
	 * gets transform adjusted by all parents
	 */
	getWorldTransformMat() {

		var newMat = mult(
			mult(translate(this.transform.pos[0], this.transform.pos[1], this.transform.pos[2]),
				scale(this.transform.scl[0], this.transform.scl[1], this.transform.scl[2])),
			quatToMat4(this.transform.rot))
		if (this.parent != null) return mult(this.parent.getWorldTransformMat(), newMat)
		else return newMat
	}

	getWorldTransform() {
		return mat4ToTransform(this.getWorldTransformMat())
	}

	/**
	 * 
	 * @param {*} parent 
	 * @param {*} attachType keepWorld: converts world transform into relative transform and sets own transform; keepRelative: Calculates relative transform based on current transform and parent's 
	 * @param {*} newAttachTransform Optional. Set a relative transform if attachType = "relative". If empty, set to parent transform
	 */
	attachSelfToParent(p, attachType, newAttachTransform = null) {
		this.detach("keepWorld")
		var wt = this.getWorldTransform()
		var pt = p.getWorldTransform()
		var it = mat4ToTransform(inverse4(p.getWorldTransformMat()))
		switch (attachType.pos) {
			case "keepWorld":
				this.transform.pos = rotateAbout(subtract(wt.pos, pt.pos), it.rot)
				console.log(this.transform.pos)
				break
			case "relative":
				if (newAttachTransform == null)
					this.transform.pos = vec3(0, 0, 0)
				else
					this.transform.pos = newAttachTransform.pos
				break
			case "dontChange":
				break
		}

		switch (attachType.rot) {
			case "keepWorld":
				this.transform.rot = addRotation(wt.rot, invQuat(pt.rot))
				break
			case "relative":
				if (newAttachTransform == null)
					this.transform.rot = eulerToQuat(vec3(1, 0, 0), 0)
				else
					this.transform.rot = newAttachTransform.rot
				break
			case "dontChange":
				break
		}

		switch (attachType.scl) {
			case "keepWorld":
				this.transform.scl = vec3(wt.scl[0] / pt.scl[0], wt.scl[1] / pt.scl[1], wt.scl[2] / pt.scl[2])
				break
			case "relative":
				if (newAttachTransform == null)
					this.transform.scl = vec3(1, 1, 1)
				else
					this.transform.scl = newAttachTransform.scl
				break
			case "dontChange":
				break
		}
		this.parent = p
		//console.log(p.connectedObjects)
		p.connectedObjects.add(this)

	}

	attachChildToSelf(child, attachType, newAttachTransform = null) {
		child.attachSelfToParent(this, attachType, newAttachTransform)
	}

	detach(detachType) {
		if (this.parent == null) return
		var newTransform = this.transform
		var wt = this.getWorldTransform()
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
		this.transform = newTransform
		this.parent.connectedObjects.delete(this)
		parent = null
	}
}

/**
 * buffer object representing all data necessary for any output buffer/view
 */

//TODO: increase the number of material parameters from 4 vec4s to 8 if possible
class buffer {
	matParams1 = []
	matParams2 = []
	matParams3 = []
	matParams4 = []
	matIndicies = []
	points = []
	types = []
	offsets = []
	posBuffer;
	indBuffer;
	matBuf1;
	matBuf2;
	matBuf3;
	matBuf4;
	matIndBuf;
	projMatrix;
	viewMatrix;
	normalMatrix;
	inPos;
	inMat1;
	inMat2;
	inMat3;
	inMat4;
	inMatIndex;
	inTexCoord;
	inNormal;
	normBuf;
	txBuf;
	lightTypeArrayLoc = [];
	lightLocArrayLoc = [];
	lightDirArrayLoc = [];
	lightAngleArrayLoc = [];
	lightColorArrayLoc = [];
	lightDiffArrayLoc = [];
	lightSpecArrayLoc = [];
	lightShinyArrayLoc = [];
	lightAttenArrayLoc = [];
	lightIndLoc;
	cameraPosLoc;

	getUniform(loc) {
		return this.gTarget.getUniform(this.program, loc)
	}

	constructor(gTarget, program, coordStr, matStr1, matStr2, matStr3, matStr4, matIndStr, projMatrixStr, viewMatrixStr, normalMatrixStr, lightsArrayStr, lightsIndexStr, normalStr, texCoordStr, cameraPosStr) {
		this.gTarget = gTarget;
		this.program = program;
		this.posBuffer = this.gTarget.createBuffer();
		this.indBuffer = this.gTarget.createBuffer();
		this.matIndBuf = this.gTarget.createBuffer();
		this.matBuf1 = this.gTarget.createBuffer();
		this.matBuf2 = this.gTarget.createBuffer();
		this.matBuf3 = this.gTarget.createBuffer();
		this.matBuf4 = this.gTarget.createBuffer();
		this.normBuf = this.gTarget.createBuffer();
		this.txBuf = this.gTarget.createBuffer();
		this.inPos = this.gTarget.getAttribLocation(this.program, coordStr);
		this.inMat1 = this.gTarget.getAttribLocation(this.program, matStr1);
		this.inMat2 = this.gTarget.getAttribLocation(this.program, matStr2);
		this.inMat3 = this.gTarget.getAttribLocation(this.program, matStr3);
		this.inMat4 = this.gTarget.getAttribLocation(this.program, matStr4);
		this.inMatIndex = this.gTarget.getAttribLocation(this.program, matIndStr);
		this.projMatrix = this.gTarget.getUniformLocation(this.program, projMatrixStr);
		this.viewMatrix = this.gTarget.getUniformLocation(this.program, viewMatrixStr);
		this.normalMatrix = this.gTarget.getUniformLocation(this.program, normalMatrixStr);
		this.lightIndLoc = this.gTarget.getUniformLocation(this.program, lightsIndexStr);
		this.inNormal = this.gTarget.getAttribLocation(this.program, normalStr);
		this.inTexCoord = this.gTarget.getAttribLocation(this.program, texCoordStr);
		this.cameraPosLoc = this.gTarget.getUniformLocation(this.program, cameraPosStr);
		for (var i = 0; i < maxLightCount; i++) {
			this.lightTypeArrayLoc.push(this.gTarget.getUniformLocation(this.program, lightsArrayStr + "[" + i + "].type"))
			this.lightLocArrayLoc.push(this.gTarget.getUniformLocation(this.program, lightsArrayStr + "[" + i + "].location"))
			this.lightDirArrayLoc.push(this.gTarget.getUniformLocation(this.program, lightsArrayStr + "[" + i + "].direction"))
			this.lightAngleArrayLoc.push(this.gTarget.getUniformLocation(this.program, lightsArrayStr + "[" + i + "].angle"))
			this.lightAttenArrayLoc.push(this.gTarget.getUniformLocation(this.program, lightsArrayStr + "[" + i + "].attenuation"))
			this.lightColorArrayLoc.push(this.gTarget.getUniformLocation(this.program, lightsArrayStr + "[" + i + "].color"))
			this.lightDiffArrayLoc.push(this.gTarget.getUniformLocation(this.program, lightsArrayStr + "[" + i + "].diffuseMultiply"))
			this.lightSpecArrayLoc.push(this.gTarget.getUniformLocation(this.program, lightsArrayStr + "[" + i + "].specularMultiply"))
			this.lightShinyArrayLoc.push(this.gTarget.getUniformLocation(this.program, lightsArrayStr + "[" + i + "].shininess"))
			//this.lightsTypeArrayLoc.push(this.gTarget.getUniformLocation(this.program, lightsArrayStr+"["+i+"].lightmask"))
		}

		buffers.push(this);
	}

	clearBuffers() {
		this.matParams1 = []
		this.matParams2 = []
		this.matParams3 = []
		this.matParams4 = []
		this.points = []
		this.types = []
		this.offsets = []
		this.matIndicies = []
	}

	setViewMatrix(v, p) {
		this.gTarget.uniformMatrix4fv(this.viewMatrix, false, flatten(v));
		this.gTarget.uniformMatrix4fv(this.normalMatrix, false, flatten(inverse(transpose(v))))
		this.gTarget.uniform3fv(this.cameraPosLoc, flatten(p))
	}

	setProjMatrix(p) {
		this.gTarget.uniformMatrix4fv(this.projMatrix, false, flatten(p));
	}

	pushMaterial(m) {
		this.matParams1.push(m[0])
		this.matParams2.push(m[1])
		this.matParams3.push(m[2])
		this.matParams4.push(m[3])
	}

	updateLights() {
		var x = -1
		this.gTarget.uniform1iv(this.lightIndLoc, new Int32Array([x]))
		lights.forEach((l) => {
			if (l != null && x < maxLightCount - 1) {
				x++;
				this.gTarget.uniform1iv(this.lightIndLoc, new Int32Array([x]))
				this.gTarget.uniform1iv(this.lightTypeArrayLoc[x], new Int32Array([l.type]))
				switch (l.type) {
					case 4:
						this.gTarget.uniform1fv(this.lightAngleArrayLoc[x], new Float32Array([l.angle]))
					case 3:
						this.gTarget.uniform1fv(this.lightAttenArrayLoc[x], new Float32Array([l.attenuation]))
						this.gTarget.uniform4fv(this.lightDiffArrayLoc[x], flatten(l.diffuseMultiply))
						this.gTarget.uniform4fv(this.lightSpecArrayLoc[x], flatten(l.specularMultiply))
					case 2:
						var t = l.getWorldTransform()
						this.gTarget.uniform3fv(this.lightDirArrayLoc[x], flatten(mult(vec3(1,1,-1),forward(t.rot))))
						this.gTarget.uniform3fv(this.lightLocArrayLoc[x], flatten(t.pos))
					case 1:
						this.gTarget.uniform4fv(this.lightColorArrayLoc[x], flatten(l.color));
						break;

				}
			} else if (l != null) {
				bufferedConsoleLog("WARNING: More than " + maxLightCount + " used, light witih ID " + l.id + " will not be visible.")
			}
		})
		for (x++; x < maxLightCount; x++)
			this.gTarget.uniform1iv(this.lightTypeArrayLoc[x], new Int32Array([0]))
	}

	beginRender() {
		//("Rendering")
		//load new buffer data
		this.updateLights();
		this.gTarget.clear(this.gTarget.COLOR_BUFFER_BIT);
	}

	renderData(points, matIndicies, matParams1, matParams2, matParams3, matParams4, normals, texCoords, types, offsets) {
		if (points.length > 0) {
			this.gTarget.bindBuffer(this.gTarget.ARRAY_BUFFER, this.posBuffer);
			this.gTarget.bufferData(this.gTarget.ARRAY_BUFFER, flatten(points), this.gTarget.STATIC_DRAW);
			this.gTarget.vertexAttribPointer(this.inPos, 4, this.gTarget.FLOAT, false, 0, 0);
			this.gTarget.enableVertexAttribArray(this.inPos);
			//load materials

			this.gTarget.bindBuffer(this.gTarget.ARRAY_BUFFER, this.matIndBuf);
			this.gTarget.bufferData(this.gTarget.ARRAY_BUFFER, new Int16Array(matIndicies), this.gTarget.STATIC_DRAW);
			this.gTarget.vertexAttribIPointer(this.inMatIndex, 1, this.gTarget.SHORT, 0, 0);
			this.gTarget.enableVertexAttribArray(this.inMatIndex);

			this.gTarget.bindBuffer(this.gTarget.ARRAY_BUFFER, this.matBuf1);
			this.gTarget.bufferData(this.gTarget.ARRAY_BUFFER, flatten(matParams1), this.gTarget.STATIC_DRAW);
			this.gTarget.vertexAttribPointer(this.inMat1, 4, this.gTarget.FLOAT, false, 0, 0);
			this.gTarget.enableVertexAttribArray(this.inMat1);

			this.gTarget.bindBuffer(this.gTarget.ARRAY_BUFFER, this.matBuf2);
			this.gTarget.bufferData(this.gTarget.ARRAY_BUFFER, flatten(matParams2), this.gTarget.STATIC_DRAW);
			this.gTarget.vertexAttribPointer(this.inMat2, 4, this.gTarget.FLOAT, false, 0, 0);
			this.gTarget.enableVertexAttribArray(this.inMat2);

			this.gTarget.bindBuffer(this.gTarget.ARRAY_BUFFER, this.matBuf3);
			this.gTarget.bufferData(this.gTarget.ARRAY_BUFFER, flatten(matParams3), this.gTarget.STATIC_DRAW);
			this.gTarget.vertexAttribPointer(this.inMat3, 4, this.gTarget.FLOAT, false, 0, 0);
			this.gTarget.enableVertexAttribArray(this.inMat3);

			this.gTarget.bindBuffer(this.gTarget.ARRAY_BUFFER, this.matBuf4);
			this.gTarget.bufferData(this.gTarget.ARRAY_BUFFER, flatten(matParams4), this.gTarget.STATIC_DRAW);
			this.gTarget.vertexAttribPointer(this.inMat4, 4, this.gTarget.FLOAT, false, 0, 0);
			this.gTarget.enableVertexAttribArray(this.inMat4);

			this.gTarget.bindBuffer(this.gTarget.ARRAY_BUFFER, this.normBuf);
			this.gTarget.bufferData(this.gTarget.ARRAY_BUFFER, flatten(normals), this.gTarget.STATIC_DRAW);
			this.gTarget.vertexAttribPointer(this.inNormal, 3, this.gTarget.FLOAT, true, 0, 0);
			this.gTarget.enableVertexAttribArray(this.inNormal);

			this.gTarget.bindBuffer(this.gTarget.ARRAY_BUFFER, this.txBuf);
			this.gTarget.bufferData(this.gTarget.ARRAY_BUFFER, flatten(texCoords), this.gTarget.STATIC_DRAW);
			this.gTarget.vertexAttribPointer(this.inTexCoord, 2, this.gTarget.FLOAT, false, 0, 0);
			this.gTarget.enableVertexAttribArray(this.inTexCoord);

			//draw
			var offset = 0;
			for (var i = 0; i < types.length; i++) {
				this.gTarget.drawArrays(types[i], offset, offsets[i]);
				offset += offsets[i];
			}
		}



		/*var tmp = this.gTarget.getError()
		if (tmp != this.gTarget.NO_ERROR) {
			switch (tmp) {
				case this.gTarget.INVALID_OPERATION:
				case this.gTarget.INVALID_FRAMEBUFFER_OPERATION:
				case this.gTarget.OUT_OF_MEMORY:
					alert("WebGL error " + tmp + "; Make sure hardware acceleration is enabled in your web browser.")
				default:
					alert("WebGL error " + tmp)
			}
		}*/
	}
}

/**
 * extremely rough class representing visibility bounds for an object
 */
class bounds {
	constructor(pointInfo, type) {
		this.type = type;

		//get center of all points rendered
		this.pos = vec3()
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

			this.pos = mult(.5, add(min, max))
			//(this.pos)

			if (type == "sphere") {
				//get furthest point from points rendered
				this.radius = subtract(pointInfo[0], this.pos)
				for (var i = 1; i < pointInfo.length; i++) {
					var tmp = subtract(pointInfo[i], this.pos)
					if (length(tmp) > length(this.radius)) this.radius = tmp
				}
			} else if (type == "rect") {

				this.extent = mult(.5, subtract(max, min));

				//set pos to the middle of the min and max points

			} else throw "Only bounds types supported now are 'rect' and 'sphere'"
		} else {
			this.radius = 0
			this.extent = vec3(0, 0, 0)
		}
	}

	//defines points to draw bounds, manually
	getRect(multMat = vec3(1, 1, 1), boundsColor = vec4(1, 1, 0, 1)) {
		var r = { points: [], colors: [] }
		r.colors.push(boundsColor)
		if (this.type == "rect") { //sphere TBD
			r.points = getRect(this.pos, this.extent);
		}
		for (var i = 0; i < r.points.length; i++)
			r.points[i] = mult(multMat, vec3to4(r.points[i]))
		return r
	}
}

/**
 * representation of a view, targeting an (optional) buffer
 */
class camera extends primitive {

	debugPoints = []
	debugColors = []
	debugTypes = []
	debugOffsets = []
	wireframe = false
	showBounds = false
	renderEngine = false
	renderAfter = true
	enabled = true
	clearDebug() {
		this.debugPoints = []
		this.debugColors = []
		this.debugTypes = []
		this.debugOffsets = []
	}

	getProjMat() {
		return this.ortho ? ortho(-this.fov / 2, this.fov / 2, -(this.fov / 2) * this.aspect, (this.fov / 2) * this.aspect, this.range[0], this.range[1]) : perspective(this.fov, this.aspect, this.range[0], this.range[1])
	}

	getViewMat() {
		var rotMat = null
		var t = this.getWorldTransform()
		//bufferedConsoleLog(t)
		var rotQuat = Quaternion(t.rot.w, t.rot.x, t.rot.y, -t.rot.z)
		rotMat = quatToMat4(rotQuat);
		//(eulerToQuat(vec3(this.transform.rot[0]+90, -(this.transform.rot[1]-90), this.transform.rot[2])));
		rotMat = mult(rotMat, translate(-t.pos[0], -t.pos[1], t.pos[2]))
		rotMat = mult(rotMat, scale(1 / t.scl[0], 1 / t.scl[1], 1 / t.scl[2]))

		return rotMat
	}

	/**
	 * Determines whether or not the points are within the view of the camera, to determine whether or not to acutally include 
	 * @param {*} points 
	 */
	inView(points) {
		//TODO
	}

	/**
	 * Pushes all points in every object in scene to its buffer
	 * @param wireframe if true, display all geometry as gl.LINE_LOOP
	 * @param showBounds if true, show bounds of all geometry
	 * @param renderAfter true if camera should be immediately rendered to its view after pushing data to buffer
	 */
	pushToBuffer() {
		if (this.enabled) {
			this.buf.clearBuffers();
			this.buf.setViewMatrix(this.getViewMat(), this.getWorldTransform().pos)
			if (this.renderAfter)
				this.buf.beginRender();

			//adding objects

			//TODO: implement texcoord, normal, etc.
			objects.forEach(function (o) {
				if ((this.renderEngine && o.isEngine) || !o.isEngine) {
					if (o.visible) {
						var current = o.localToWorld();

						var t = []
						var f = [];
						var mi = []
						var m1 = [], m2 = [], m3 = [], m4 = []
						var p = []
						var tx = []
						var n = []
						for (var g = 0; g < current.indexes.length; g++) {
							var i = current.indexes[g]
							var m = current.mats[g]
							
							f.push(i.length)
							t.push(this.wireframe ? this.buf.gTarget.LINE_LOOP : current.types[g])
							for (var ii = 0; ii < i.length; ii++) {
								if (!this.wireframe) {
									mi.push(m[ii % m.length].index)
								}
								else {
									mi.push(0)
								}
								m1.push(m[ii % m.length].parameters[0])
								m2.push(m[ii % m.length].parameters[1])
								m3.push(m[ii % m.length].parameters[2])
								m4.push(m[ii % m.length].parameters[3])
								p.push(mult(current.points[i[ii]], vec4(1, 1, -1, 1)))
								n.push(mult(current.normals[g][ii], vec3(1, 1, -1)))
								tx.push(current.texCoords[g][ii])
							}
						}
						if (this.showBounds && !o.isEngine) {
							//(c)
							t.push(this.buf.gTarget.LINE_LOOP);
							var l = 0
							for (var i = 0; i < current.bounds.length; i++) {
								p.push(mult(current.bounds[i], vec4(1, 1, -1, 1)))
								var tmp = new solidColorNoLighting(current.boundColors[i % current.boundColors.length]);
								mi.push(tmp.index)
								m1.push(tmp.parameters[0])
								m2.push(tmp.parameters[1])
								m3.push(tmp.parameters[2])
								m4.push(tmp.parameters[3])
								n.push(vec3(1, 0, 0))//bounds have no normals, this is just filler

							}
							tx.push(vec2(0, 0)) //bounds have no textures, again just filler
							f.push(current.bounds.length)
						}
						if (this.renderAfter)
							this.buf.renderData(p, mi, m1, m2, m3, m4, n, tx, t, f)
					}
				}
			}.bind(this))

			var x = 0
			for (var o = 0; o < this.debugOffsets.length; o++) {
				var t = []
				var f = [];
				var mi = []
				var m1 = [], m2 = [], m3 = [], m4 = []
				var p = []
				var tx = []
				var n = []
				t.push(this.debugTypes[o])
				f.push(this.debugOffsets[o])
				for (var i = 0; i < this.debugOffsets[o]; i++) {
					p.push(mult(this.debugPoints[i + x], vec4(1, 1, -1, 1)))
					var tmp = new solidColorNoLighting(this.debugColors[i % this.debugColors.length]);
					mi.push(tmp.index)
					m1.push(tmp.parameters[0])
					m2.push(tmp.parameters[1])
					m3.push(tmp.parameters[2])
					m4.push(tmp.parameters[3])
					n.push(vec3(1, 0, 0))//debug data has no normals, this is just filler
				}
				tx.push(vec2(0, 0)) //bounds have no textures, again just filler
				x += this.debugOffsets[o]
				base += this.debugOffsets[o].length
				if (this.renderAfter)
					this.buf.renderData(p, mi, m1, m2, m3, m4, n, tx, t, f)
			}

			//get uniform matrix

			//var rotMat = mult(mult(rotateZ(this.transform.rot[2]), rotateY(-(this.transform.rot[1] - 90))), rotateX(-this.transform.rot[0]))//this may look wrong, and it most definately is, but it works
		}
	}

	updateCameraView(fov = 90, aspect = -1, orthographic = false, range = [.1, 200000]) {
		this.fov = fov;
		this.ortho = orthographic;
		this.range = range;
		if (aspect < 0)
			this.aspect = this.buf.gTarget.canvas.clientWidth / this.buf.gTarget.canvas.clientHeight
		else this.aspect = aspect;
		this.buf.setProjMatrix(this.getProjMat());
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
		this.buf = targetBuffer
		this.enabled = enabled
		this.renderEngine = renderEngine
		this.updateCameraView(fov, aspect, orthographic, range)
		cameras.push(this);
	}
}


/**
 * 3D primitive containing material data, coordinate data, and bounds
 * Note: For attached primitives to object, if you want to attach a primitive to a point, you must set the primitive's transform to the point location manually.
 */
class object extends primitive {

	/**To be called whenever individual points are adjusted */
	reevaluateBounds(pointInfo, boundsType) {
		this.bounds = new bounds(pointInfo, boundsType);
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
		this.id = newID();
		this.drawInfo = drawInfo;
		this.pointInfo = pointInfo
		this.reevaluateBounds(pointInfo, boundsType)
		this.isEngine = isEngine
		this.matInfo = matInfo
		this.visible = visible
		objects[this.id] = this
	}


	/**
	 * Returns points array and bounding box relative to world coordinates
	 */
	localToWorld() {

		//mat4 generates matrix by cols, then rows
		//equation from Wikipedia
		var newMat = this.getWorldTransformMat()
		var newTrans = mat4ToTransform(newMat)

		//(newMat)
		/*var sclMat = mat4(
			obj.transform.scl.x, 0, 0,
			0, obj.transform,scl.y, 0,
			0, 0, obj.transform.scl.z
		)
		var transMat = vec4(obj.transform.pos.x + obj.transform.pos.y + obj.transform.pos.z)*/
		var ret = { points: [], indexes: [], types: [], mats: [], texCoords: [], normals: [], bounds: [], boundsIndex: [], boundColors: [], boundsType: this.bounds.type, visible: this.visible }

		for (var i = 0; i < this.pointInfo.length; i++) {
			var tmp = mult(newMat, vec3to4(this.pointInfo[i]))
			ret.points.push(tmp);
		}

		for (var g = 0; g < this.drawInfo.length; g++) {

			ret.indexes.push(new Array())
			ret.mats.push(new Array())
			ret.types.push(this.drawInfo[g].type)
			ret.normals.push(new Array())
			ret.texCoords.push(new Array())

			for (var i = 0; i < this.drawInfo[g].pointIndex.length; i++) {
				//if(i == 0) bufferedConsoleLog(newMat)
				ret.indexes[g].push(this.drawInfo[g].pointIndex[i])
				switch(this.drawInfo[g].type){
					case gl.TRIANGLES:
						ret.normals[g].push(rotateAbout(this.drawInfo[g].normals[Math.floor(i/3)], newTrans.rot)) //push 3 for each vert
						break;
					default:
						ret.normals[g].push(rotateAbout(this.drawInfo[g].normals[i], newTrans.rot))
				}
				
				ret.texCoords[g].push(this.drawInfo[g].texCoords[i])
				//(this.drawInfo[g].colors[i % this.drawInfo[g].colors.length])
				ret.mats[g].push(this.matInfo[this.drawInfo[g].matIndex[i % this.drawInfo[g].matIndex.length]])
			}
		}

		var c = this.bounds.getRect(newMat)
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
		if (this.transform.pos != this.prevTransform.pos ||
			this.transform.rot != this.prevTransform.rot ||
			this.transform.scl != this.prevTransform.scl)
			
	}*/
}