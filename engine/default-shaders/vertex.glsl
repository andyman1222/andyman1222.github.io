#version 300 es

precision mediump float;

in vec4 coordinates;
in vec3 inNormal;
in vec2 inTexCoord;
in vec3 inTangent;
//in vec3 inBiTangent;
//attribute vec3 inNormal;
in int inMatIndex;
in vec4 inMatProp0;
in vec4 inMatProp1;
in vec4 inMatProp2;
in vec4 inMatProp3;
in vec4 inMatProp4;
in vec4 inMatProp5;

uniform mat4 viewMatrix;
uniform mat4 projMatrix;
uniform mat4 normalMatrix;



//varying vec3 normal;
out vec2 texCoord;
//varying vec3 view;
//varying vec3 position;
out vec3 normal;
out vec3 position;
out mat3 TBN;
flat out int matIndex;
out vec4 matProp[6];


void main(void) {
    gl_Position = projMatrix * viewMatrix * coordinates;
    vec3 T = normalize((normalMatrix*vec4(inTangent, 0.0)).xyz);
    
    // aNormal can be calculated from aTangent and a Bitangent
    vec3 N = normalize((normalMatrix*vec4(inNormal, 0.0)).xyz);

    T=normalize(T - dot(T, N) * N);
    vec3 B = cross(N, T);

    TBN = mat3(T, B, N);

    //position = tsMatrix*(uModelViewMatrix*aPosition).xyz;
    //view = tsMatrix*vec3(0.0, 0.0, 0.0);
    //normal = tsMatrix*N;

    position = coordinates.xyz;
    //normal = normalize((normalMatrix*vec4(inNormal, 0.0)).xyz);
    normal = inNormal;

    matProp[0] = inMatProp0;
    matProp[1] = inMatProp1;
    matProp[2] = inMatProp2;
    matProp[3] = inMatProp3;
    matProp[4] = inMatProp4;
    matProp[5] = inMatProp5;

    matIndex = inMatIndex;

    texCoord = inTexCoord;
}