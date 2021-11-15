#version 300 es

precision highp float;

const int MAT_PROP_COUNT=7;

//For the sake of simplicity, the names of these vars are reused from the main shaders.
//They can be used however you want.
uniform sampler2D baseImage;
uniform sampler2D normalMap;
uniform sampler2D depthMap;
uniform sampler2D diffuseMap;
uniform sampler2D roughnessMap;

in vec2 texCoords;
out vec4 fColor;

flat in int matIndex;
in vec4 matProp[MAT_PROP_COUNT];

void main(void){
    vec4 t = texture(baseImage, texCoords);
    fColor = t;
}