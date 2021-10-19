#version 300 es

precision lowp float;

in vec4 coordinates;
in mat4 inMatProperties;
in mat4 inMatProperties2;
in int inMatIndex;
in vec2 inTexCoord;
//attribute vec3 inNormal;

uniform mat4 viewMatrix;
uniform mat4 projMatrix;
uniform mat4 normalMatrix;

out vec4 color;
//varying vec3 normal;
out vec2 texCoord;
//varying vec3 view;
//varying vec3 position;
out mat4 matProperties;
out mat4 matProperties2;
out int matIndex;


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
    color = inColor;
    texCoord = inTexCoord;
    matProperties = inMatProperties;
    matIndex = inMatIndex;
}