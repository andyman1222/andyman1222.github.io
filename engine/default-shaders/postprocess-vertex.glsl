#version 300 es

precision highp float;

const int MAT_PROP_COUNT=7;
in vec2 inPointsL;
out vec2 texCoords;

in int inMatIndex;
in vec4 inMatProp0;//screw GLSL ES not supporting in attribute arrays
in vec4 inMatProp1;
in vec4 inMatProp2;
in vec4 inMatProp3;
in vec4 inMatProp4;
in vec4 inMatProp5;
in vec4 inMatProp6;

flat out int matIndex;
out vec4 matProp[MAT_PROP_COUNT];

void main(void){
    gl_Position = vec4(inPointsL/vec2(2,2))+vec2(1,1), 0, 1)
    texCoords = inPointsL
}