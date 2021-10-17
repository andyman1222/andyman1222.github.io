class directionalLight{
    color;
    transform;
    lightmask;

    /**
     * 
     * @param {*} t transform of light (directional only accounts rotation)
     * @param {*} b brightness/color of light
     * @param {*} m bitwise mask indicating how many channels the light casts onto (up to 256)
     */
    constructor(t, c, m){
        this.transform = t
        this.color = c
        this.lightmask = m
    }


}


class pointLight{
    color;
    transform;
    lightmask;
    attenuation;
    /**
     * 
     * @param {*} t transform of light (scale not accounted)
     * @param {*} b brightness/color of light
     * @param {*} m bitwise mask indicating how many channels the light casts onto (up to 256)
     * @param {*} a linear attenuation of light
     */
    constructor(t, c, m, a){
        this.transform = t
        this.color = c
        this.lightmask = m
        this.attenuation = a
    }
}

class spotLight{
    color;
    transform;
    lightmask;
    attenuation;
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
        this.transform = t
        this.color = c
        this.lightmask = m
        this.attenuation = a
        this.angle = h
    }
}