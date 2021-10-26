/**
 * Material points to index that defines its functionality in the shader, as well as any necessary arguments, such as specular, diffuse, etc.
 * Default: index 0, parameters=[baseColor=(.5,.5,.5,1), diffuse = (.5,.5,.5,1), specular = (.5,.5,.5,1), ambient = (1,1,1,1), misc = (shininess=1,unused,unused,unused)]
 */

class _Material{
    _index
    _parameters
    _prevIndex
    _prevParameters
    _updated
    _hasTextures
    constructor(index = 1, parameters = [vec4(.5,.5,.5,1), vec4(.5,.5,.5,1), vec4(.5,.5,.5,1), vec4(1,1,1,1), vec4(1,1,1,1)], hasTextures = false){
        this._index = index
        this._parameters = parameters
        this._hasTextures = hasTextures
    }

    _onTick(gl){
        if(this._index != this._prevIndex)
            this._updated = true
    }
}

class _NoDraw extends _Material{
    constructor(){
        super(-1)
    }
}

class _SolidColorNoLighting extends _Material{
    constructor(color){
        super(0, [vec4(color[0], color[1], color[2], color[3]),
        vec4(0, 0, 0, 1),
        vec4(0, 0, 0, 1), 
        vec4(0, 0, 0, 1),
        vec4(0,0,0,0)])
    }
}

/**
 * Representation of a texture with a base color, normal, displacement, AO (diffuse) and roughness (specular) images
 */
class _ComplexTexture{
    constructor(){}
}

class _TexturedMaterial extends _Material{
    tex;
    constructor(tex, params){
        super(2, params, true);
        this.tex = tex;
    }
}