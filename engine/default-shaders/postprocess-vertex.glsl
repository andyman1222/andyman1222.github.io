#version 300 es

precision highp float;

in vec2 inPointsL;
out vec2 texCoords;

uniform int time; //total time since level load
uniform int frameTime; //time between current and previous frame; delta time

void main(void){
    gl_Position = vec4(inPointsL, -1, 1);
    texCoords = (inPointsL/vec2(2,2))+vec2(.5,.5);
}