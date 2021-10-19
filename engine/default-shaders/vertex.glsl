precision lowp float;

attribute vec4 coordinates;
attribute vec4 inColor;
attribute vec2 inTexCoord;
attribute vec3 inNormal;

uniform mat4 viewMatrix;
uniform mat4 projMatrix;
uniform mat4 normalMatrix;

varying vec4 color;
varying vec3 normal;
varying vec2 texCoord;
varying vec3 view;
varying vec3 position;


void main(void) {
    gl_Position = projMatrix * viewMatrix * coordinates;
    vec3 T = normalize((normalMatrix*vec4(aTangent, 0.0)).xyz);
    vec3 B = normalize((normalMatrix*vec4(aBitangent, 0.0)).xyz);
    // aNormal can be calculated from aTangent and a Bitangent
    vec3 N = normalize((normalMatrix*vec4(inNormal, 0.0)).xyz);

    mat3 tsMatrix = transpose(mat3(T, B, N));

    position = tsMatrix*(uModelViewMatrix*aPosition).xyz;
    view = tsMatrix*vec3(0.0, 0.0, 0.0);
    normal = tsMatrix*N;
    color = (inColor);
}