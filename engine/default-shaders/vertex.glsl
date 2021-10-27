#version 300 es

precision mediump float;

in vec4 coordinates;
in vec3 inNormal;
in vec2 inTexCoord;
in vec3 inTangent;
in vec3 inBiTangent;
//attribute vec3 inNormal;
in int inMatIndex;
in vec4 inMatProp[5];

uniform mat4 viewMatrix;
uniform mat4 projMatrix;
uniform mat4 normalMatrix;



//varying vec3 normal;
out vec2 texCoord;
//varying vec3 view;
//varying vec3 position;
out vec3 normal;
out vec3 position;
out vec3 t;
out vec3 bt;
flat out int matIndex;
out vec4 matProp[5];


void main(void) {
    gl_Position = projMatrix * viewMatrix * coordinates;
    vec3 T = normalize((normalMatrix*vec4(inTangent, 0.0)).xyz);
    vec3 B = normalize((normalMatrix*vec4(inBiTangent, 0.0)).xyz);
    // aNormal can be calculated from aTangent and a Bitangent
    vec3 N = normalize((normalMatrix*vec4(inNormal, 0.0)).xyz);

    mat3 tsMatrix = transpose(mat3(T, B, N));

    //position = tsMatrix*(uModelViewMatrix*aPosition).xyz;
    //view = tsMatrix*vec3(0.0, 0.0, 0.0);
    //normal = tsMatrix*N;

    position = coordinates.xyz;
    //normal = normalize((normalMatrix*vec4(inNormal, 0.0)).xyz);
    normal = inNormal;

    for(int x = 0; x < inMatProp.length; x++){
        matProp[x] = inMatProp[x];
    }
    matIndex = inMatIndex;
}