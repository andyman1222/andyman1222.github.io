#version 300 es

precision highp float;

uniform sampler2D scene;
uniform sampler2D depth; 
uniform sampler2D normal;
uniform sampler2D position;
uniform sampler2D lAmbient;
uniform sampler2D lDiffuse;
uniform sampler2D lSpecular;
uniform sampler2D color;
uniform sampler2D ambient;
uniform sampler2D diffuse;
uniform sampler2D specular;
uniform sampler2D misc;
uniform sampler2D texInfo;
uniform sampler2D cameraPos;
uniform sampler2D parallaxDepth;

//uniform sampler2D cameraAngle;

in vec2 texCoords;
out vec4 fColor;

void main(void){
    vec4 t = texture(parallaxDepth, texCoords);
    //fColor = vec4(t.rgb, 1);
    fColor = t;
}