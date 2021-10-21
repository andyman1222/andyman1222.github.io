#version 300 es

precision mediump float;
in vec2 texCoord;
in vec4 matProp1;
in vec4 matProp2;
in vec4 matProp3;
in vec4 matProp4;
in vec3 normal;
in vec3 position;
in float matIndex;

out vec4 fColor;

//attribute int matIndex; //default = 0, constant values; 1 = texture, constant values; -1 = unlit solid color

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
};

uniform light lights[64];
uniform int maxLightIndex;
/*vec2 parallax(vec2 TexCoord, vec3 V)
{
	float layer_depth = 1.0/32.0;
	float cur_layer_depth = 0.0;
	vec2 deltaTexCoord = V.xy*0.1/(V.z*32.0);
	vec2 curTexCoord = TexCoord;
	
	float depth_from_tex = texture(uDepthMap, curTexCoord).r;
	
	for (int i=0; i<32; i++) {
		cur_layer_depth += layer_depth;
		curTexCoord -= deltaTexCoord;
		depth_from_tex = texture(uDepthMap, curTexCoord).r;
		if (depth_from_tex < cur_layer_depth) {
			break;
		}
	}
	
	vec2 prevTexCoord = curTexCoord + deltaTexCoord;
	float next = depth_from_tex - cur_layer_depth;
	float prev = texture(uDepthMap, prevTexCoord).r - cur_layer_depth
	+ layer_depth;
	float weight = next/(next-prev);
	return mix(curTexCoord, prevTexCoord, weight);
	//return curTexCoord;
}*/

void main(void){
	int i = int(floor(matIndex));
	fColor = vec4(i, 0, 0, 1);
	/*
	switch(i){
		case 0:
		fColor=matProp1;
		break;
		
		case 1:
		fColor = vec4(1,0,0,1);
		break;

		default:
		fColor = vec4(matIndex, matIndex, matIndex, 1);
		/*vec4 sumAmbient;
		vec4 sumDiffuse;
		vec4 sumSpecular;
		vec3 N=normalize(normal);
		vec3 V=-normalize(position);
		
		for(int x=0;x<=maxLightIndex;x++){
			switch(lights[x].type){
				case 1://ambient
				sumAmbient=vec4(sumAmbient.rgb+lights[x].color.rgb,sumAmbient.a*lights[x].color.a);
				break;
				
				case 2://directional
				float NdotL=dot(lights[x].direction,N);
				sumDiffuse=vec4((NdotL*lights[x].color).rgb+sumDiffuse.rgb,(NdotL*lights[x].color).a*sumDiffuse.a);
				break;
				
				case 4://spot
				//TODO: implement? For now just use point light implementation
				case 3://point
				vec3 L=normalize(lights[x].location-lights[x].attenuation*position);
				float Kd=dot(L,N);
				
				vec3 R=reflect(-L,N);
				float Ks=pow(dot(V,R),lights[x].shininess);
				
				vec4 tmpDiff=(Kd*lights[x].color*lights[x].diffuseMultiply);
				vec4 tmpSpec=(Ks*lights[x].color*lights[x].specularMultiply);
				if(dot(L,N)<0.){
					tmpSpec=vec4(0.,0.,0.,1);
				}
				sumDiffuse=vec4(tmpDiff.rgb+sumDiffuse.rgb,tmpDiff.a*sumDiffuse.a);
				sumSpecular=vec4(tmpSpec.rgb+sumSpecular.rgb,tmpSpec.a*sumSpecular.a);
				
				default:
				break;
			}
		}
		
		vec4 tmp=(sumAmbient*matProp4*matProp1)+(sumDiffuse*matProp2*matProp1)+(sumSpecular*matProp3);
		fColor=vec4(max(tmp.r,0.),max(tmp.g,0.),max(tmp.b,0.),clamp(tmp.a,0.,1.));
		break;
	}*/
}