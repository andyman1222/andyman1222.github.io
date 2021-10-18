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
		console.log(p.connectedObjects)
		p.connectedObjects.add(this)

	}

	attachChildToSelf(child, attachType, newAttachTransform = null) {
		child.attachSelfToParent(self, attachType, newAttachTransform)
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
class buffer {
	colors = []
	points = []
	types = []
	offsets = []
	posBuffer;
	colorBuffer;
	projMatrix;
	viewMatrix;
	inPos;
	inColor;
	constructor(gTarget, program, coordStr, colorStr, projMatrixStr, viewMatrixStr) {
		this.gTarget = gTarget;
		this.program = program;
		this.posBuffer = this.gTarget.createBuffer();
		this.colorBuffer = this.gTarget.createBuffer();
		this.inPos = this.gTarget.getAttribLocation(this.program, coordStr);
		this.inColor = this.gTarget.getAttribLocation(this.program, colorStr);
		this.projMatrix = this.gTarget.getUniformLocation(this.program, projMatrixStr);
		this.viewMatrix = this.gTarget.getUniformLocation(this.program, viewMatrixStr);

		buffers.push(this);
	}

	clearBuffers() {
		this.colors = []
		this.points = []
		this.types = []
		this.offsets = []
	}

	setViewMatrix(v) {
		this.gTarget.uniformMatrix4fv(this.viewMatrix, false, flatten(v));

	}

	setProjMatrix(p) {
		this.gTarget.uniformMatrix4fv(this.projMatrix, false, flatten(p));
	}

	render() {
		//("Rendering")
		//load new buffer data
		if (this.points.length > 0) {
			this.gTarget.bindBuffer(this.gTarget.ARRAY_BUFFER, this.posBuffer);
			this.gTarget.bufferData(this.gTarget.ARRAY_BUFFER, flatten(this.points), this.gTarget.STATIC_DRAW);
			this.gTarget.vertexAttribPointer(this.inPos, 3, this.gTarget.FLOAT, false, 0, 0);
			this.gTarget.enableVertexAttribArray(this.inPos);

			//load colors
			this.gTarget.bindBuffer(this.gTarget.ARRAY_BUFFER, this.colorBuffer);
			this.gTarget.bufferData(this.gTarget.ARRAY_BUFFER, flatten(this.colors), this.gTarget.STATIC_DRAW);
			this.gTarget.vertexAttribPointer(this.inColor, 4, this.gTarget.FLOAT, false, 0, 0);
			this.gTarget.enableVertexAttribArray(this.inColor);

		}
		//draw
		this.gTarget.clear(this.gTarget.COLOR_BUFFER_BIT);
		var offset = 0;
		for (var i = 0; i < this.types.length; i++) {
			this.gTarget.drawArrays(this.types[i], offset, this.offsets[i]);
			offset += this.offsets[i];
		}
	}
}

/**
 * extremely rough class representing visibility bounds for an object
 */
class bounds {
	constructor(drawInfo, type) {
		this.type = type;

		//get center of all points rendered
		this.pos = vec3()
		if (drawInfo.length > 0) {
			var min = vec3(drawInfo[0].points[0][0], drawInfo[0].points[0][1], drawInfo[0].points[0][2]) //POINTERS PLS
			var max = vec3(drawInfo[0].points[0][0], drawInfo[0].points[0][1], drawInfo[0].points[0][2])
			//get min and max x, y, z values
			for (var g = 0; g < drawInfo.length; g++)
				for (var i = 0; i < drawInfo[g].points.length; i++) {
					for (var ii = 0; ii < drawInfo[g].points[i].length; ii++) {
						if (drawInfo[g].points[i][ii] > max[ii]) { max[ii] = drawInfo[g].points[i][ii] }
						if (drawInfo[g].points[i][ii] < min[ii]) { min[ii] = drawInfo[g].points[i][ii] }
					}
				}

			this.pos = mult(.5, add(min, max))
			//(this.pos)

			if (type == "sphere") {
				//get furthest point from points rendered
				this.radius = subtract(drawInfo[0].points[0], this.pos)
				for (var g = 0; g < drawInfo.length; g++)
					for (var i = 1; i < drawInfo[g].points.length; i++) {
						var tmp = subtract(drawInfo[g].points[i], this.pos)
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
			r.points[i] = vec4to3(mult(multMat, vec3to4(r.points[i])))
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

			//adding objects
			objects.forEach(function (o) {
				if ((this.renderEngine && o.isEngine) || !o.isEngine) {
					var current = o.localToWorld();
					if (o.visible) {
						for (var g = 0; g < current.points.length; g++) {
							var p = current.points[g]
							var c = current.colors[g]
							var t = current.types[g]
							this.buf.offsets.push(p.length);
							if (!this.wireframe)
								this.buf.types.push(t);
							else this.buf.types.push(this.buf.gTarget.LINE_LOOP);
							for (var ii = 0; ii < p.length; ii++) {
								this.buf.points.push(mult(p[ii], vec3(1, 1, -1)))
								this.buf.colors.push(c[ii % c.length])
							}

						}
						if (this.showBounds && !o.isEngine) {
							//(c)
							this.buf.types.push(this.buf.gTarget.LINE_LOOP);
							var l = 0
							for (var i = 0; i < current.bounds.length; i++) {
								this.buf.points.push(mult(current.bounds[i], vec3(1, 1, -1)))
								this.buf.colors.push(current.boundColors[i % current.boundColors.length]);
							}
							this.buf.offsets.push(current.bounds.length)
						}
					}
				}
			}.bind(this))

			var x = 0
			for (var o = 0; o < this.debugOffsets.length; o++) {
				this.buf.types.push(this.debugTypes[o])
				this.buf.offsets.push(this.debugOffsets[o])
				for (var i = 0; i < this.debugOffsets[o]; i++) {
					this.buf.points.push(mult(this.debugPoints[i + x], vec3(1, 1, -1)))
					this.buf.colors.push(this.debugColors[i % this.debugColors.length])
				}
				x += this.debugOffsets[o]
			}

			//get uniform matrix

			//var rotMat = mult(mult(rotateZ(this.transform.rot[2]), rotateY(-(this.transform.rot[1] - 90))), rotateX(-this.transform.rot[0]))//this may look wrong, and it most definately is, but it works


			this.buf.setViewMatrix(this.getViewMat())

			if (this.renderAfter)
				this.buf.render()
		}
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
		this.fov = fov;
		this.aspect = aspect;
		this.ortho = orthographic;
		this.range = range;
		this.buf = targetBuffer
		this.enabled = enabled
		this.renderEngine = renderEngine
		if (aspect < 0)
			this.aspect = this.buf.gTarget.canvas.clientWidth / this.buf.gTarget.canvas.clientHeight
		else this.aspect = aspect;
		this.buf.setProjMatrix(this.getProjMat());
		cameras.push(this);
	}
}


/**
 * 3D primitive containing material data, coordinate data, and bounds
 */
class object extends primitive {
	/**
	 * 
	 * @param {transform} startTransform
	 * @param {drawInfo} drawInfo array of [{pointIndex[], matIndex[]}]
	 * @param {enum} drawType 
	 */
	constructor(startTransform, drawInfo, pointInfo, matInfo, boundsType, isEngine = false, visible = true) {
		//if(startTransform.rot.length != 4) throw "Rotations must be quaternions!"
		super(startTransform)
		this.id = newID();
		this.drawInfo = drawInfo;
		this.bounds = new bounds(drawInfo, boundsType);
		this.isEngine = isEngine
		this.matInfo = matInfo
		this.pointInfo = pointInfo
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

		//(newMat)
		/*var sclMat = mat4(
			obj.transform.scl.x, 0, 0,
			0, obj.transform,scl.y, 0,
			0, 0, obj.transform.scl.z
		)
		var transMat = vec4(obj.transform.pos.x + obj.transform.pos.y + obj.transform.pos.z)*/
		var ret = { points: [], types: [], mats: [], bounds: [], boundColors: [], boundsType: this.bounds.type, visible: this.visible }

		for (var g = 0; g < this.drawInfo.length; g++) {

			ret.points.push(new Array())
			ret.mats.push(new Array())
			ret.types.push(this.drawInfo[g].type)
			for (var i = 0; i < this.drawInfo[g].points.length; i++) {
				var tmp = mult(newMat, vec3to4(this.drawInfo[g].points[i]))
				//if(i == 0) bufferedConsoleLog(newMat)
				ret.points[g].push(vec4to3(tmp));
				//(this.drawInfo[g].colors[i % this.drawInfo[g].colors.length])
				ret.mats[g].push(this.matGroup[this.drawInfo[g].matIndex[i % this.drawInfo[g].matIndex.length]])
			}
		}

		var c = this.bounds.getRect(newMat)
		for (var i = 0; i < c.points.length; i++) {
			ret.bounds.push(c.points[i])
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