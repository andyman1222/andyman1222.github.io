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
	_flipZRotation = false;
	_customTickFunc = function (delta, time) { }
	_customPreTick = function (delta, time) { }
	_customPostTick = function (delta, time) { }

	_cameraMask = 0x1;
	_bufferMask = 0x1;
	_lightMask = 0x1;

	constructor(transform, bufferMask = 0x1, cameraMask = 0x1, lightMask = 0x1) {
		this._transform = transform
		this._bufferMask = bufferMask
		this._cameraMask = cameraMask
		this._lightMask = lightMask

	}

	/**
	 * gets transform adjusted by all parents
	 */

	_getWorldTransform(flipZ = false) {
		if (this._parent != null) {
			var p = this._parent._getWorldTransform(flipZ)
			if (this._parent._flipZRotation)
				return {
					pos: add(rotateAbout(mult(this._transform.pos, p.scl), p.rot), p.pos),
					rot: addRotation(p.rot, this._transform.rot),
					scl: mult(p.scl, this._transform.scl)
				}
			else return {
				pos: add(mult(vec3(1, 1, -1), rotateAbout(mult(mult(this._transform.pos, vec3(1, 1, -1)), p.scl), p.rot)), p.pos),
				rot: addRotation(p.rot, this._transform.rot),
				scl: mult(p.scl, this._transform.scl)
			}
		}
		return { pos: mult(this._transform.pos, vec3(1, 1, 1)), rot: this._transform.rot, scl: this._transform.scl }
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
				//console.log(this._transform.pos)
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

	_onTick(delta, time) {
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
	_noDraw = false;


	constructor(pointInfo, type, parentObject) {
		this._type = type;
		this._parentObject = parentObject;
		this._updateBounds(pointInfo);
		//get center of all points rendered

	}

	_updateBounds(pointInfo) {
		this._pos = vec3(0, 0, 0)
		if (pointInfo.length > 0) {
			var min = vec3(pointInfo[0], pointInfo[1], pointInfo[2]) //POINTERS PLS
			var max = vec3(pointInfo[0], pointInfo[1], pointInfo[2])
			//get min and max x, y, z values
			for (var i = 0; i < pointInfo.length; i += 3) {
				if (pointInfo[i] > max[0]) { max[0] = pointInfo[i] }
				if (pointInfo[i] < min[0]) { min[0] = pointInfo[i] }
				if (pointInfo[i + 1] > max[1]) { max[1] = pointInfo[i + 1] }
				if (pointInfo[i + 1] < min[1]) { min[1] = pointInfo[i + 1] }
				if (pointInfo[i + 2] > max[2]) { max[2] = pointInfo[i + 2] }
				if (pointInfo[i + 2] < min[2]) { min[2] = pointInfo[i + 2] }
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
			this._noDraw = true
		}
	}

	//defines points to draw _Bounds, manually
	_getDrawBounds(multMat = vec3(1, 1, 1)) {
		var r = []
		if (!this._noDraw) {
			var tmp = this._shape;
			for (var i = 0; i < tmp.index.length; i++)
				r.push(mult(multMat, vec3to4(tmp.points[tmp.index[i]])))
		}
		return r
	}

	//defines points to draw _Bounds, manually
	_getGraphicsDrawBounds(boundsColor = vec4(1, 1, 0, 1)) {
		var r = { points: [], colors: [] }
		if (!this._noDraw) {
			var tmp = this._shape;
			r.colors.push(boundsColor);
			for (var i = 0; i < tmp.index.length; i++)
				r.points.push(vec3to4(tmp.points[tmp.index[i]]))
		}
		return r
	}
}


/**
 * 3D _Primitive containing material data, coordinate data, and _Bounds
 * Note: For attached primitives to _Object, if you want to attach a _Primitive to a point, you must set the _Primitive's transform to the point location manually.
 */
class _Object extends _Primitive {
	_drawInfo = new Float32Array()
	_pointInfo = []
	_isEngine = false
	_matInfo = []
	_textureInfo = []
	_visible = []
	_id = -1
	_bounds;
	_boundsType;
	_pointsChanged = false


	/**To be called whenever individual points are adjusted */
	_reevaluateBounds(pointInfo, boundsType) {
		this._bounds = new _Bounds(pointInfo, boundsType);
	}

	/**To be called whenever individual points are adjusted. Updates float32arrays  */
	/**
	 * 
	 * @param {transform} startTransform
	 * @param {drawInfo} drawInfo array of [{pointIndex[], matIndex[], texCoords[], type}]
	 * @param {enum} drawType 
	 */
	constructor(startTransform, drawInfo, pointInfo, matInfo, boundsType, textureInfo = [], isEngine = false, visible = true, preTickFunc = function (delta, time) { }) {
		//if(startTransform.rot.length != 4) throw "Rotations must be quaternions!"
		super(startTransform)
		this._id = _newID();
		this._drawInfo = drawInfo;
		this._pointInfo = flatten(pointInfo);
		this._boundsType = boundsType
		this._reevaluateBounds(this._pointInfo, boundsType)
		this._isEngine = isEngine
		this._matInfo = matInfo
		this._textureInfo = textureInfo
		this._visible = visible

		var tmpDPI = [], tmpN = []
		for (var g = 0; g < this._drawInfo.length; g++) {
			var d = this._drawInfo[g]
			d.startInd = tmpDPI.length
			d.pointIndex = new Uint16Array(d.pointIndex)
			d.tangents = flatten(d.tangents)
			d.texCoords = flatten(d.texCoords)
			for (var i = 0; i < d.pointIndex.length; i++) {
				tmpDPI.push(d.pointIndex[i])
				switch (d.type) {
					case _gl.TRIANGLES:
						tmpN.push(d.normals[Math.floor(i / 3)]) //push 3 for each vert
						tmpN.push(d.tangents[Math.floor(i / 3)]) //push 3 for each vert
						break;
					default:
						tmpN.push(d.normals[i])
						tmpN.push(d.tangents[i])

				}
			}
			d.normals = flatten(tmpN)
		}

		this._customPreTick = function (delta, time) {
			if (this._pointsChanged) this._reevaluateBounds(this._pointInfo, this._boundsType)
			preTickFunc(delta, time)
		}
		_objects.set(this._id, this)
	}

	_modifyNormal(newNormal, drawInd, normalInd) {
		var d = this._drawInfo[drawInd]
		d.normals[normalInd * 3] = newNormal[0]
		d.normals[(normalInd * 3) + 1] = newNormal[1]
		d.normals[(normalInd * 3) + 2] = newNormal[2]
		this._updated = true
	}

	_modifyTangent(newTangent, drawInd, tanInd) {
		var d = this._drawInfo[drawInd]
		d.tangents[tanInd * 3] = newTangent[0]
		d.tangents[(tanInd * 3) + 1] = newTangent[1]
		d.tangents[(tanInd * 3) + 2] = newTangent[2]
		this._updated = true
	}

	_modifyTexCoord(newTexCoord, drawInd, txInd) {
		var d = this._drawInfo[drawInd]
		d.texCoords[txInd * 2] = newTexCoord[0]
		d.texCoords[(txInd * 2) + 1] = newTexCoord[1]
		this._updated = true
	}

	_modifyPointInd(newTangent, drawInd, pointInd) {
		var d = this._drawInfo[drawInd]
		d.tangents[pointInd * 3] = newTangent[0]
		d.tangents[(pointInd * 3) + 1] = newTangent[1]
		d.tangents[(pointInd * 3) + 2] = newTangent[2]
		this._updated = true
	}

	_modifyPoint(newPoint, pointInd) {
		this._updated = true
		this._pointsChanged = true
		this._drawInfo[pointInd * 3] = newPoint[0]
		this._drawInfo[(pointInd * 3) + 1] = newPoint[1]
		this._drawInfo[(pointInd * 3) + 2] = newPoint[2]
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
		buf._points = this._pointInfo
		for (var g = 0; g < this._drawInfo.length; g++) {
			var d = this._drawInfo[g]
			var i = d.pointIndex

			if (i.length > buf._bufLimit)
				console.error("Unable to load data to GPU. Too many points. Length: " + i.length + "; Object: " + o);
			else {

				buf._offsets = i.length

				buf._types = camera._wireframe ? buf._gTarget.LINE_LOOP : d.type

				if (d.textureIndex != -1)
					buf._loadTexture(this._textureInfo[d.textureIndex], camera._cameraMask)

				buf._pointIndicies = d.pointIndex

				buf._texCoords = d.texCoords
				buf._normals = d.normals
				buf._tangents = d.tangents
				for (var ii = 0; ii < i.length; ii++) {
					buf._loadMaterial(this._matInfo[d.matIndex[ii % d.matIndex.length]], d.textureIndex != -1 && !camera._noTexture, camera._wireframe || camera._noLighting, camera._noParallax)
					buf._points.push(this._pointInfo[i[ii]])

					//buf._texCoords.push(d.texCoords[ii])
				}
				if (camera._render)
					buf._renderData();
			}
		}
		if (camera._showBounds && !this._isEngine) {
			buf._types = buf._gTarget.LINE_LOOP;
			var b = this._bounds._getGraphicsDrawBounds();
			buf._offsets = b.points.length
			var points = []
			var pointIndicies = []
			var normals = []
			var tangents = []
			var texCoords = []
			for (var i = 0; i < b.points.length; i++) {
				points.push(b.points[i])
				pointIndicies.push(i)
				var tmp = new _SolidColorNoLighting(b.colors[i % b.colors.length]);
				buf._loadMaterial(tmp, false, camera._wireframe || camera._noLighting)
				normals.push(vec3(1, 0, 0))//_Bounds have no normals, this is just filler
				tangents.push(vec3(0, 1, 0))
				texCoords.push(vec2(0, 0)) //_Bounds have no textures, again just filler
			}
			buf._texCoords = flatten(texCoords)
			buf._normals =  flatten(normals)
			buf._tangents =  flatten(tangents)
			buf._points =  flatten(points)
			buf._pointIndicies = new Uint16Array(pointIndicies)
			buf._renderData();
		} //camera will take care of final _renderData for this object
	}

	/*TODO
	update() {
		if (this._transform.pos != this._prevTransform.pos ||
			this._transform.rot != this._prevTransform.rot ||
			this._transform.scl != this._prevTransform.scl)
			
	}*/
}