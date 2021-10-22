#version 300 es

precision mediump float;

in vec4 coordinates;
in vec4 inMatProp1;
in vec4 inMatProp2;
in vec4 inMatProp3;
in vec4 inMatProp4;
in vec4 inMatProp5;
in vec3 inNormal;
in int inMatIndex;
in vec2 inTexCoord;
//attribute vec3 inNormal;

uniform mat4 viewMatrix;
uniform mat4 projMatrix;
uniform mat4 normalMatrix;

//varying vec3 normal;
out vec2 texCoord;
//varying vec3 view;
//varying vec3 position;
out vec4 matProp1;
out vec4 matProp2;
out vec4 matProp3;
out vec4 matProp4;
out vec4 matProp5;
flat out int matIndex;
out vec3 normal;
out vec3 position;


void main(void) {
    gl_Position = projMatrix * viewMatrix * coordinates;
    //vec3 T = normalize((normalMatrix*vec4(aTangent, 0.0)).xyz);
    //vec3 B = normalize((normalMatrix*vec4(aBitangent, 0.0)).xyz);
    // aNormal can be calculated from aTangent and a Bitangent
    //vec3 N = normalize((normalMatrix*vec4(inNormal, 0.0)).xyz);

    //mat3 tsMatrix = transpose(mat3(T, B, N));

    //position = tsMatrix*(uModelViewMatrix*aPosition).xyz;
    //view = tsMatrix*vec3(0.0, 0.0, 0.0);
    //normal = tsMatrix*N;

    texCoord = inTexCoord;
    matProp1 = inMatProp1;
    matProp2 = inMatProp2;
    matProp3 = inMatProp3;
    matProp4 = inMatProp4;
    matIndex = inMatIndex;
    position = (vec4(1.,1.,-1., 1.)*coordinates).xyz;
    //normal = normalize((normalMatrix*vec4(inNormal, 0.0)).xyz);
    normal = inNormal;
}