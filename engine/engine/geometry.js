function getCylinder(pos, radius, height, numFaces, addDeg = 0, type = gl.TRIANGLES) {
	var facePoints = []
	for (var i = 0; i < numFaces; i++) {
		var tmp = ((i / numFaces) * 360) + addDeg
		facePoints.push(vec2(Math.sin(radians(tmp)), Math.cos(radians(tmp))))
	}

	var r = []
	var ind = []
	var tx = []
	var norm = []
	var m = r.push(pos)//always texcoord (0,0)
	norm.push(vec3(0, -1, 0))
	var t = r.push(add(pos, vec3(0, height, 0)))//always texcoord (0,0)
	norm.push(vec3(0, 1, 0))
	var i1, i2, i3, i4
	var oi1, oi2
	for (var i = 0; i < facePoints.length; i++) {

		//note: this lazily calculates the normals, in that it doesn't actually get them based on the edges to the point
		if (i == 0) {
			i1 = r.push(add(vec3(facePoints[i][0] * radius, height, facePoints[i][1] * radius), pos));
			norm.push(normalize(vec3(facePoints[i][0], .5, facePoints[i][1])))
			i2 = r.push(add(vec3(facePoints[i][0] * radius, 0, facePoints[i][1] * radius), pos));
			norm.push(normalize(vec3(facePoints[i][0], -.5, facePoints[i][1])))
			i3 = r.push(add(vec3(facePoints[(i + 1) % facePoints.length][0] * radius, height, facePoints[(i + 1) % facePoints.length][1] * radius), pos));
			norm.push(normalize(vec3(facePoints[(i + 1) % facePoints.length][0], .5, facePoints[(i + 1) % facePoints.length][1])))
			i4 = r.push(add(vec3(facePoints[(i + 1) % facePoints.length][0] * radius, 0, facePoints[(i + 1) % facePoints.length][1] * radius), pos));
			norm.push(normalize(vec3(facePoints[(i + 1) % facePoints.length][0], -.5, facePoints[(i + 1) % facePoints.length][1])))
			oi1 = i1
			oi2 = i2
		}
		else {
			i1 = i3
			i2 = i4
			if (i == facePoints.length - 1) {
				i3 = oi1
				i4 = oi2
			} else {
				i3 = r.push(add(vec3(facePoints[(i + 1) % facePoints.length][0] * radius, height, facePoints[(i + 1) % facePoints.length][1] * radius), pos));
				norm.push(normalize(vec3(facePoints[(i + 1) % facePoints.length][0], .5, facePoints[(i + 1) % facePoints.length][1])))
				i4 = r.push(add(vec3(facePoints[(i + 1) % facePoints.length][0] * radius, 0, facePoints[(i + 1) % facePoints.length][1] * radius), pos));
				norm.push(normalize(vec3(facePoints[(i + 1) % facePoints.length][0], -.5, facePoints[(i + 1) % facePoints.length][1])))
			}

		}
		ind.push(i1, i2, i3,
			i4, i3, i2,
			i2, m, i4,
			i3, t, i1)
		tx.push(vec2(0, 1), vec2(0, 0), vec2(1, 1),
			vec2(1, 0), vec2(1, 1), vec2(0, 0),
			facePoints[i], vec2(0, 0), facePoints[(i + 1) % facePoints.length],
			facePoints[(i + 1) % facePoints.length], vec2(0, 0), facePoints[i])//facePoints points already normalized
	}
	return { points: r, index: ind, texCoords: tx, normals: norm };
}

/**
 * returns line segments corresponding to a wireframe cube, optionally with diagonals
 * @param {vec3} pos center of the rectangle
 * @param {vec3} extent size of the rectangle from center to edge
 */
function getRect(pos, extent) {
	//1
	var blb = vec3(pos[0] - extent[0], pos[1] - extent[1], pos[2] - extent[2])
	//2
	var flb = vec3(pos[0] - extent[0], pos[1] - extent[1], pos[2] + extent[2])
	//3
	var frb = vec3(pos[0] + extent[0], pos[1] - extent[1], pos[2] + extent[2])
	//4
	var frt = vec3(pos[0] + extent[0], pos[1] + extent[1], pos[2] + extent[2])
	//5
	var brt = vec3(pos[0] + extent[0], pos[1] + extent[1], pos[2] - extent[2])
	//6
	var blt = vec3(pos[0] - extent[0], pos[1] + extent[1], pos[2] - extent[2])
	//7
	var brb = vec3(pos[0] + extent[0], pos[1] - extent[1], pos[2] - extent[2])
	//8
	var flt = vec3(pos[0] - extent[0], pos[1] + extent[1], pos[2] + extent[2])

	var ind = []
	var tx = []
	var norm = [normalize(vec3(-1, -1, -1)), normalize(vec3(-1, -1, 1)), normalize(vec3(1, -1, 1)), normalize(vec3(1, 1, 1)), normalize(vec3(1, 1, -1)), normalize(vec3(1, -1, -1)), normalize(vec3(-1, 1, 1))] //again, lazy normals calculation
	var p = [blb, flb, frb, frt, brt, blt, brb, flt]
	var pb = { blb: 0, flb: 1, frb: 2, frt: 3, brt: 4, blt: 5, brb: 6, flt: 7 }
	ind.push(pb[blb], pb[brb], pb[frb],
		pb[frb], pb[flb], pb[blb],

		pb[brt], pb[blt], pb[frt],
		pb[flt], pb[frt], pb[blt],

		pb[brb], pb[blb], pb[brt],
		pb[blt], pb[brt], pb[blb],

		pb[flb], pb[frb], pb[frt],
		pb[frt], pb[flt], pb[flb],

		pb[blt], pb[blb], pb[flt],
		pb[flb], pb[flt], pb[blb],

		pb[brb], pb[brt], pb[frt],
		pb[frt], pb[frb], pb[brb]) //intended for TRIANGLES. I'm no longer supporting LINE_LOOP or anything else fancy like that
	tx.push(vec2(1, 1), vec2(0, 1), vec2(0, 0),
		vec2(0, 0), vec2(1, 0), vec2(1, 1),

		vec2(1, 0), vec2(0, 0), vec2(1, 1),
		vec2(0, 1), vec2(1, 1), vec2(0, 0),

		vec2(1, 0), vec2(0, 0), vec2(1, 1),
		vec2(0, 1), vec2(1, 1), vec2(0, 0),

		vec2(1, 0), vec2(0, 0), vec2(0, 1),
		vec2(0, 1), vec2(1, 1), vec2(1, 0),

		vec2(1, 1), vec2(1, 0), vec2(0, 1),
		vec2(0, 0), vec2(0, 1), vec2(1, 0),

		vec2(0, 0), vec2(0, 1), vec2(1, 1),
		vec2(1, 1), vec2(1, 0), vec2(0, 0))
	return { points: p, index: ind, texCoords: tx, normals: norm }
}