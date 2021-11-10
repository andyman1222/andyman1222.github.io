"use strict";

function _getSphere(pos, radius, numFaces, numLayers, type=_gl.TRIANGLES, normFunction=normalize){
	var nl = numLayers+1
	var r = [add(pos, vec3(0,radius[1],0)), subtract(pos,vec3(0,radius[1],0))]
	var p = []
	var tx = []
	var txy, txy2, tyi, ty, ty2
	for(var y = 1; y < nl; y++){
		txy = mix(1, -1, y / nl)
		txy2 = mix(1, -1, (y-1) / nl)
		tyi = Math.cos(radians(txy * 90))
		ty = Math.sin(radians(txy * 90))
		ty2 = Math.sin(radians(txy2 * 90))
		for(var x = 0; x < numFaces; x++){
			var tmpx = ((x / numFaces) * 360)
			var txx = Math.sin(radians(tmpx))
			var txx2 = Math.sin(radians(((((x+1)%numFaces) / numFaces) * 360)))
			r.push(add(pos, mult(radius, vec3(txx*tyi, ty, Math.cos(radians(tmpx))*tyi))))
			if(y == 1){
				p.push(0)
				tx.push(vec2(txx,1))
				p.push((((y*numFaces)+((x+1)%numFaces))+2)-numFaces)
				tx.push(vec2(txx2, ty))
				p.push(((y*numFaces)+x+2)-numFaces)
				tx.push(vec2(txx, ty))
				
				
			}
			else {
				p.push((((y-1)*numFaces)+x+2)-numFaces)
				tx.push(vec2(txx,ty2))
				p.push(((y*numFaces)+x+2)-numFaces)
				tx.push(vec2(txx,ty))
				p.push((((y*numFaces)+((x+1)%numFaces))+2)-numFaces)
				tx.push(vec2(txx2,ty))
				

				p.push((((y*numFaces)+((x+1)%numFaces))+2)-numFaces)
				tx.push(vec2(txx2,ty))
				p.push(((((y-1)*numFaces)+((x+1)%numFaces))+2)-numFaces)
				tx.push(vec2(txx2,ty2))
				p.push((((y-1)*numFaces)+x+2)-numFaces)
				tx.push(vec2(txx,ty2))
				
			}
			
		}
	}
	for(var x = 0; x < numFaces; x++){
		var tmpx = ((x / numFaces) * 360)
		var txx = Math.sin(radians(tmpx))
		var txx2 = Math.sin(radians(((((x+1)%numFaces) / numFaces) * 360)))
		p.push((((nl-1)*numFaces)+x+2)-numFaces)
		tx.push(vec2(txx, ty))
		p.push((((nl-1)*numFaces)+((x+1)%numFaces)+2)-numFaces)
		tx.push(vec2(txx2, ty))
		p.push(1)
		tx.push(vec2(txx, -1))
		
	}

	var norm = normalsFromTriangleVerts(r, p, normFunction)
	var t = tanFromTriangleVerts(r, p, tx, normFunction)
	return{points: r, index: p, texCoords: tx, normals: norm, tangents: t}
}

function _getCylinder(pos, radius, height, numFaces, addDeg = 0, type = _gl.TRIANGLES, normFunction = normalize) {
	var facePoints = []
	for (var i = 0; i < numFaces; i++) {
		var tmp = ((i / numFaces) * 360) + addDeg
		facePoints.push(vec2(Math.sin(radians(tmp)), Math.cos(radians(tmp))))
	}

	var r = []
	var ind = []
	var tx = []
	var m = r.push(pos)//always texcoord (0,0)
	//norm.push(vec3(0, -1, 0))
	var t = r.push(add(pos, vec3(0, height, 0)))//always texcoord (0,0)
	//norm.push(vec3(0, 1, 0))
	var i1, i2, i3, i4
	var oi1, oi2
	for (var i = 0; i < facePoints.length; i++) {

		//note: this lazily calculates the normals, in that it doesn't actually get them based on the edges to the point
		if (i == 0) {
			i1 = r.push(add(vec3(facePoints[i][0] * radius, height, facePoints[i][1] * radius), pos));
			//norm.push(normFunction(vec3(facePoints[i][0], .5, facePoints[i][1])))
			i2 = r.push(add(vec3(facePoints[i][0] * radius, 0, facePoints[i][1] * radius), pos));
			//norm.push(normFunction(vec3(facePoints[i][0], -.5, facePoints[i][1])))
			i3 = r.push(add(vec3(facePoints[(i + 1) % facePoints.length][0] * radius, height, facePoints[(i + 1) % facePoints.length][1] * radius), pos));
			//norm.push(normFunction(vec3(facePoints[(i + 1) % facePoints.length][0], .5, facePoints[(i + 1) % facePoints.length][1])))
			i4 = r.push(add(vec3(facePoints[(i + 1) % facePoints.length][0] * radius, 0, facePoints[(i + 1) % facePoints.length][1] * radius), pos));
			//norm.push(normFunction(vec3(facePoints[(i + 1) % facePoints.length][0], -.5, facePoints[(i + 1) % facePoints.length][1])))
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
				//norm.push(normFunction(vec3(facePoints[(i + 1) % facePoints.length][0], .5, facePoints[(i + 1) % facePoints.length][1])))
				i4 = r.push(add(vec3(facePoints[(i + 1) % facePoints.length][0] * radius, 0, facePoints[(i + 1) % facePoints.length][1] * radius), pos));
				//norm.push(normFunction(vec3(facePoints[(i + 1) % facePoints.length][0], -.5, facePoints[(i + 1) % facePoints.length][1])))
			}

		}
		ind.push(i1, i2, i3,
			i4, i3, i2,
			i2, m, i4,
			i3, t, i1)

		var c = Math.PI*2*radius;
		var d = (c / numFaces)/2;

		tx.push(vec2(-d, height/2), vec2(-d, -(height/2)), vec2(d, height/2),
			vec2(d, -(height/2)), vec2(d, height/2), vec2(-d, -(height/2)),
			facePoints[i]*radius, vec2(0, 0), facePoints[(i + 1) % facePoints.length]*radius,
			facePoints[(i + 1) % facePoints.length]*radius, vec2(0, 0), facePoints[i]*radius)
	}

	var norm = normalsFromTriangleVerts(r, ind, normFunction)
	var t = tanFromTriangleVerts(r, ind, tx, normFunction)
	return { points: r, index: ind, texCoords: tx, normals: norm, tangents: t};
}

/**
 * returns line segments corresponding to a wireframe cube, optionally with diagonals
 * @param {vec3} pos center of the rectangle
 * @param {vec3} extent size of the rectangle from center to edge
 */
function _getRect(pos, extent, normFunction = normalize) {
	//0
	var blb = vec3(pos[0] - extent[0], pos[1] - extent[1], pos[2] - extent[2])
	//1
	var flb = vec3(pos[0] - extent[0], pos[1] - extent[1], pos[2] + extent[2])
	//2
	var frb = vec3(pos[0] + extent[0], pos[1] - extent[1], pos[2] + extent[2])
	//3
	var frt = vec3(pos[0] + extent[0], pos[1] + extent[1], pos[2] + extent[2])
	//4
	var brt = vec3(pos[0] + extent[0], pos[1] + extent[1], pos[2] - extent[2])
	//5
	var blt = vec3(pos[0] - extent[0], pos[1] + extent[1], pos[2] - extent[2])
	//6
	var brb = vec3(pos[0] + extent[0], pos[1] - extent[1], pos[2] - extent[2])
	//7
	var flt = vec3(pos[0] - extent[0], pos[1] + extent[1], pos[2] + extent[2])
	
	var ind = []
	var tx = []
	var p = [blb, flb, frb, frt, brt, blt, brb, flt]
	ind.push(0, 6, 2,
		2, 1, 0, //bottom face (-y)
		
		4, 5, 3,
		7, 3, 5, //top face (+y)

		6, 0, 4,
		5, 4, 0, //back face (-z)

		1, 2, 3,
		3, 7, 1, //front face (+z)

		5, 0, 7,
		1, 7, 0, //left face (-x)

		6, 4, 3,
		3, 2, 6) //right face (+x)

	tx.push(vec2(-extent[0],extent[2]), vec2(extent[0], extent[2]), vec2(extent[0],-extent[2]),
	vec2(extent[0],-extent[2]), vec2(-extent[0], -extent[2]), vec2(-extent[0],extent[2]),
	
	vec2(extent[0],-extent[2]), vec2(-extent[0], -extent[2]), vec2(extent[0],extent[2]),
	vec2(-extent[0],extent[2]), vec2(extent[0], extent[2]), vec2(-extent[0],-extent[2]),

	vec2(extent[0],-extent[1]), vec2(-extent[0], -extent[1]), vec2(extent[0], extent[1]),
	vec2(-extent[0], extent[1]), vec2(extent[0], extent[1]), vec2(-extent[0], -extent[1]),
	
	vec2(extent[0],-extent[1]), vec2(-extent[0],-extent[1]), vec2(-extent[0],extent[1]),
	vec2(-extent[0],extent[1]), vec2(extent[0],extent[1]), vec2(extent[0],-extent[1]),
	
	vec2(extent[2],extent[1]), vec2(extent[2], -extent[1]), vec2(-extent[2],extent[1]),
	vec2(-extent[2],-extent[1]), vec2(-extent[2], extent[1]), vec2(extent[2],-extent[1]),
	
	vec2(-extent[2],-extent[1]), vec2(-extent[2], extent[1]), vec2(extent[2],extent[1]),
	vec2(extent[2],extent[1]), vec2(extent[2], -extent[1]), vec2(-extent[2],-extent[1]))
	var norm = normalsFromTriangleVerts(p, ind, normFunction)
	var t = tanFromTriangleVerts(p, ind, tx, normFunction)
	return{points: p, index: ind, texCoords: tx, normals: norm, tangents: t}
}