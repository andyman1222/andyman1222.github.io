#version 300 es

precision mediump float;

const int LIGHT_COUNT=64;
const int MAT_PROP_COUNT=6;

in vec4 coordinates;
in vec3 inNormal;
in vec2 inTexCoord;
in vec3 inTangent;
//in vec3 inBiTangent;
//attribute vec3 inNormal;
in int inMatIndex;
in vec4 inMatProp[MAT_PROP_COUNT];

uniform mat4 viewMatrix;
uniform mat4 projMatrix;
uniform mat4 normalMatrix;
uniform vec3 cameraPos;

//varying vec3 normal;
out vec2 texCoord;
//varying vec3 view;
//varying vec3 position;
out vec3 normal;
out vec3 position;
out mat3 TBN;
flat out int matIndex;
out vec4 matProp[MAT_PROP_COUNT];
out vec3 adjCameraPos;
out vec3 lightPosAdj[LIGHT_COUNT];

struct light
{
	int type;//0=empty (default),  1=ambient, 2=directional, 3=point, 4=spot
	vec3 location,direction;//direction ignored if not spotlight; location ignored if ambient or directional
	float angle;//spotlight only
	float attenuation;//ignored on ambient
	//bool lightmask[10];
	vec4 color;
	vec4 diffuseMultiply;//ignored on ambient
	vec4 specularMultiply;//ignored on ambient
	float shininess;//ignored on ambient
	int negativeHandler; //0=no change (allow negatives), 1=clamp (min 0), 2=clamp negative (max 0), 3=absolute value
	int negativeHandlerAlt; //same as negative handler but applies to specular only
};

uniform light lights[64];
uniform int maxLightIndex;

void main(void) {
    gl_Position = projMatrix * viewMatrix * coordinates;
    vec3 T = normalize(inTangent);
    //vec3 T = normalize(inTangent);
    vec3 N = normalize(inNormal);
    //vec3 N = normalize(inNormal);
    T=normalize(T - dot(T, N) * N);
    vec3 B = cross(N, T);

    TBN = transpose(mat3(T, B, N));

    //position = tsMatrix*(uModelViewMatrix*aPosition).xyz;
    //view = tsMatrix*vec3(0.0, 0.0, 0.0);
    //normal = tsMatrix*N;
    
    position = viewMatrix * coordinates.xyz;
    //normal = normalize((normalMatrix*vec4(inNormal, 0.0)).xyz);
    normal = N;

    for(int i = 0; i < MAT_PROP_COUNT; i++)
        matProp[i] = inMatProp[i];

    for(int i = 0; i < LIGHT_COUNT; i++)
        lightPosAdj[i] = TBN*lights[i].location;

    matIndex = inMatIndex;

    texCoord = inTexCoord;

    adjCameraPos = TBN*(vec4(cameraPos, 1.)).xyz;
}