class shaderProgram{

    program;

    constructor(gl, vShader, fShader){
        this.compileShaders(gl, vShader, fShader);
    }

    getProgram(){
        return this.program;
    }

    //initially from common files
    compileShaders(gl, vShaderName, fShaderName) {
        function getShader(gl, shaderName, type) {
            var shader = gl.createShader(type),
                shaderScript = loadFileAJAX(shaderName);
            if (!shaderScript) {
                alert("Could not find shader source: "+shaderName);
            }
            gl.shaderSource(shader, shaderScript);
            gl.compileShader(shader);
    
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert(gl.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        }
        var vertexShader = getShader(gl, vShaderName, gl.VERTEX_SHADER),
            fragmentShader = getShader(gl, fShaderName, gl.FRAGMENT_SHADER);
        this.program = gl.createProgram();
    
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
    
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            alert("Could not initialise shaders The error log is: " + gl.getProgramInfoLog( program ));
            console.error("Could not initialise shaders The error log is: " + gl.getProgramInfoLog( program ));
            return null;
        }
    };
}


