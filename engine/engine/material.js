/**
 * Material points to index that defines its functionality in the shader, as well as any necessary arguments, such as specular, diffuse, etc.
 * Default: index 0, parameters=[baseColor=(.5,.5,.5,1), diffuse = (.5,.5,.5,1), specular = (.5,.5,.5,1), ambient = (1,1,1,1), misc = (shininess=1,unused,unused,unused)]
 */

class material{
    index
    parameters
    constructor(index = 1, parameters = [vec4(.5,.5,.5,1), vec4(.5,.5,.5,1), vec4(.5,.5,.5,1), vec4(1,1,1,1), vec4(1,1,1,1)]){
        this.index = index
        this.parameters = parameters
    }
}

class solidColorNoLighting extends material{
    constructor(color){
        super(0, [vec4(color[0], color[1], color[2], color[3]),
        vec4(0, 0, 0, 1),
        vec4(0, 0, 0, 1), 
        vec4(0, 0, 0, 1),
        vec4(0,0,0,0)])
    }
}