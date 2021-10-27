"use strict";

/**
 * Material points to index that defines its functionality in the shader, as well as any necessary arguments, such as specular, diffuse, etc.
 * Default: index 0, parameters=[baseColor=(.5,.5,.5,1), diffuse = (.5,.5,.5,1), specular = (.5,.5,.5,1), ambient = (1,1,1,1), misc = (shininess=1,unused,unused,unused)]
 */

class _Material {
    _index
    _parameters
    _prevIndex
    _prevParameters
    _updated
    _hasTextures
    constructor(index = 1, parameters = [vec4(.5, .5, .5, 1), vec4(.5, .5, .5, 1), vec4(.5, .5, .5, 1), vec4(1, 1, 1, 1), vec4(1, 1, 1, 1)], hasTextures = false) {
        this._index = index
        this._parameters = parameters
        this._hasTextures = hasTextures
    }

    _onTick(gl) {
        if (this._index != this._prevIndex)
            this._updated = true
    }
}

class _NoDraw extends _Material {
    constructor() {
        super(-1)
    }
}

class _SolidColorNoLighting extends _Material {
    constructor(color) {
        super(0, [vec4(color[0], color[1], color[2], color[3]),
        vec4(0, 0, 0, 1),
        vec4(0, 0, 0, 1),
        vec4(0, 0, 0, 1),
        vec4(0, 0, 0, 0)])
    }
}

/**
 * Representation of a texture with a base color, normal, displacement, AO (diffuse) and roughness (specular) images
 */
class _ComplexTexture {
    _images = []

    _texs = []

    _gl;
    _sw;
    _tw;
    _fm;
    _generateMip;

    constructor(gl, urls, generateMip = true, sWrap = null, tWrap = null, filterMode = null) {
        this.sw = sWrap
        if (sWrap == null) this.sw = gl.REPEAT;
        this.tw = tWrap
        if (tWrap == null) this.tw = gl.REPEAT;
        this.fm = filterMode
        if (filterMode == null) this.fm = gl.NEAREST_MIPMAP_LINEAR;
        this._generateMip = generateMip;
        this._gl = gl;

        for(var x = 0; x < urls.length; x++){
            var i = this._texs.push(_gl.createTexture())-1;
            this._gl.bindTexture(this._gl.TEXTURE_2D, this._texs[i]);
            this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA,
                1, 1, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE,
                new Uint8Array([255, 255, 255, 255]));
            var a = this._images.push(new Image())-1
            this._images[a].onload = () => {
                this._gl.bindTexture(this._gl.TEXTURE_2D, this._texs[i]);
                this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA,
                    this._gl.RGBA, this._gl.UNSIGNED_BYTE, this._images[a]);
                if (this._generateMip) this._gl.generateMipmap(this._gl.TEXTURE_2D);
                this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, sw);
                this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, tw);
                this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, fm);
            };
            this._images[a].src = urls[x];
        }
    }

    _applyTexture(locations){
        for(var x = 0; x < this._texs.length; x++){
            this._gl.activeTexture(this._gl.TEXTURE0+x);
            this._gl.bindTexture(this._gl.TEXTURE_2D, this._texs[x]);
            this._gl.uniform1i(locations[x], x);
        }
    }
}