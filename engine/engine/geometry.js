function getCylinder(pos, radius, height, numFaces, addDeg = 0, type = gl.TRIANGLES) {
	var facePoints = []
	for (var i = 0; i < numFaces; i++) {
		var tmp = ((i / numFaces) * 360) + addDeg
		facePoints.push(vec2(Math.sin(radians(tmp)), Math.cos(radians(tmp))))
	}

	var r = []
	for (var i = 0; i < facePoints.length; i++) {
		r.push(add(vec3(facePoints[i][0] * radius, height, facePoints[i][1] * radius), pos));
		r.push(add(vec3(facePoints[i][0] * radius, 0, facePoints[i][1] * radius), pos));
		r.push(add(vec3(facePoints[(i + 1) % facePoints.length][0] * radius, height, facePoints[(i + 1) % facePoints.length][1] * radius), pos));

		r.push(add(vec3(facePoints[(i + 1) % facePoints.length][0] * radius, 0, facePoints[(i + 1) % facePoints.length][1] * radius), pos));
		r.push(add(vec3(facePoints[(i + 1) % facePoints.length][0] * radius, height, facePoints[(i + 1) % facePoints.length][1] * radius), pos));
		r.push(add(vec3(facePoints[i][0] * radius, 0, facePoints[i][1] * radius), pos));

		r.push(add(vec3(facePoints[i][0] * radius, 0, facePoints[i][1] * radius), pos));
		r.push(pos)
		r.push(add(vec3(facePoints[(i + 1) % facePoints.length][0] * radius, 0, facePoints[(i + 1) % facePoints.length][1] * radius), pos));

		r.push(add(vec3(facePoints[(i + 1) % facePoints.length][0] * radius, height, facePoints[(i + 1) % facePoints.length][1] * radius), pos));
		r.push(add(pos, vec3(0, height, 0)))
		r.push(add(vec3(facePoints[i][0] * radius, height, facePoints[i][1] * radius), pos));
	}
	return r;
}

/**
 * returns line segments corresponding to a wireframe cube, optionally with diagonals
 * @param {vec3} pos center of the rectangle
 * @param {vec3} extent size of the rectangle from center to edge
 */
function getRect(pos, extent, type = gl.TRIANGLES) {
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

	if (type == gl.LINE_LOOP) return [blb, brb, frb, flb, blb, frb, frt, flt, flb, frt, brt, brb, frt, blt, blb, flt, blt, brt]
	else return [blb, brb, frb,
		frb, flb, blb,
		brt, blt, frt,
		flt, frt, blt,
		brb, blb, brt,
		blt, brt, blb,
		flb, frb, frt,
		frt, flt, flb,
		blt, blb, flt,
		flb, flt, blb,
		brb, brt, frt,
		frt, frb, brb] //intended for TRIANGLES
}