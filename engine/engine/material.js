/**
 * Material points to index that defines its functionality in the shader, as well as any necessary arguments, such as specular, diffuse, etc.
 * Default: index 0, parameters=[baseColor=(.5,.5,.5,1), diffuse = (.5,.5,.5,.5), specular = (.5,.5,.5,.5), ambient = (1,1,1,1)]
 */

class material{
    index
    parameters
    constructor(index = 0, parameters = [vec4(.5,.5,.5,1), vec4(.5,.5,.5,.5), vec4(.5,.5,.5,.5), vec4(1,1,1,1)]){
        this.index = index
        this.parameters = parameters
    }
}

class solidColorNoLighting extends material{
    constructor(color){
        super(-1, [color])
    }
}