class ambientLight extends primitive{
    color;
    lightmask;
    id;
    type = 1
    /**
     * 
     * @param {*} b brightness/color of light
     * @param {*} m bitwise mask indicating how many channels the light casts onto (up to 256)
     */
    constructor(c, m){
        super({pos: vec3(0,0,0), rot: Quaternion(0,1,0,0), scl: vec3(1,1,1)})
        this.color = c
        this.lightmask = m
        var i = 0;
        for(i = 0; lights[i] != null; i++){}
        this.id = i
        lights.push(this)
    }

    destroyLight(){
        lights[this.id] = null;
        delete this;
    }
}

class directionalLight extends ambientLight{

    /**
     * 
     * @param {*} t transform of light (directional only accounts rotation)
     * @param {*} c color of light
     * @param {*} m bitwise mask indicating how many channels the light casts onto (up to 256)
     */
    constructor(t, c, m){
        super(c, m)
        this.transform = t
        this.color = c
        this.lightmask = m
        this.type = 2
    }


}

class pointLight extends ambientLight{
    attenuation;
    diffuseMultiply = vec4(1,1,1,1)
    specularMultiply = vec4(1,1,1,1)
    /**
     * 
     * @param {*} t transform of light (scale not accounted)
     * @param {*} b brightness/color of light
     * @param {*} m bitwise mask indicating how many channels the light casts onto (up to 256)
     * @param {*} a linear attenuation of light
     */
    constructor(t, c, m, a){
        super(c, m)
        this.transform = t
        this.attenuation = a
        this.type = 3
    }
}

class spotLight extends pointLight{
    angle;
    /**
     * 
     * @param {*} t transform of light (scale not accounted)
     * @param {*} b brightness/color of light
     * @param {*} m bitwise mask indicating how many channels the light casts onto (up to 256)
     * @param {*} a linear attenuation of light. If zero, has infinite attenuation
     * @param {*} h angle of spread of the spotlight
     */
    constructor(t, c, m, a, h){
        super(t, c, m, a)
        this.angle = h
        this.type = 4
    }
}