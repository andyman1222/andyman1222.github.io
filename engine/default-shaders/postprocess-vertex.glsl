#version 300 es

precision highp float;

in vec3 inPointsL;
out vec2 texCoords;

void main(void){
    gl_Position = vec4(inPointsL, 1);
    texCoords = (inPointsL.xy/vec2(2,2))+vec2(.5,.5);
}