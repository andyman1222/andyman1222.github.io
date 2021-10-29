#version 300 es

precision mediump float;

const int LIGHT_COUNT=64;
const int MAT_PROP_COUNT=6;

in vec3 coordinates;
in vec3 inNormal;
in vec2 inTexCoord;
in vec3 inTangent;
//in vec3 inBiTangent;
//attribute vec3 inNormal;
in int inMatIndex;
in vec4 inMatProp0;//screw GLSL ES not supporting in attribute arrays
in vec4 inMatProp1;
in vec4 inMatProp2;
in vec4 inMatProp3;
in vec4 inMatProp4;
in vec4 inMatProp5;

uniform mat4 viewMatrix;
uniform mat4 projMatrix;
uniform mat4 normalMatrix;
uniform mat4 modelMatrix;
uniform vec3 inCameraPos;

//varying vec3 normal;
out vec2 texCoord;
//varying vec3 view;
//varying vec3 position;
out vec3 normal;
out vec3 position;
out mat3 TBN;
flat out int matIndex;
out vec4 matProp[MAT_PROP_COUNT];
out vec3 cameraPos;

void main(void) {
    vec4 coords = modelMatrix * vec4(coordinates, 1.);
    gl_Position = projMatrix * viewMatrix * coords;
    vec3 T = normalize((normalMatrix*vec4(inTangent, 0.)).xyz);
    //vec3 T = normalize(inTangent);
    vec3 N = normalize((normalMatrix*vec4(inNormal, 0.)).xyz);
    //vec3 N = normalize(inNormal);
    T=normalize(T - dot(T, N) * N);
    vec3 B = cross(N, T);

    TBN = transpose(mat3(T, B, N));

    //position = tsMatrix*(uModelViewMatrix*aPosition).xyz;
    //view = tsMatrix*vec3(0.0, 0.0, 0.0);
    //normal = tsMatrix*N;
    
    position = coords.xyz;
    //normal = normalize((normalMatrix*vec4(inNormal, 0.0)).xyz);
    normal = TBN*N;

    cameraPos = cameraPos;

    matProp[0] = inMatProp0;
    matProp[1] = inMatProp1;
    matProp[2] = inMatProp2;
    matProp[3] = inMatProp3;
    matProp[4] = inMatProp4;
    matProp[5] = inMatProp5;

    matIndex = inMatIndex;

    texCoord = inTexCoord;

    
}