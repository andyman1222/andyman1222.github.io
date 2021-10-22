#version 300 es

precision mediump float;
in vec2 texCoord;
in vec4 matProp1;
in vec4 matProp2;
in vec4 matProp3;
in vec4 matProp4;
in vec4 matProp5;
in vec3 normal;
in vec3 position;
flat in int matIndex;

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
	int negativeHandler; //0=no change (allow negatives), 1=clamp (min 0), 2=clamp negative (max 0), 3=absolute value
};

uniform light lights[64];
uniform int maxLightIndex;
uniform vec3 cameraPos;
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
	
	switch(matIndex){
		
		case 1:
		vec4 sumAmbient = vec4(0,0,0,1);
		vec4 sumDiffuse = vec4(0,0,0,1);
		vec4 sumSpecular = vec4(0,0,0,1);
		vec3 N=normalize(normal);
		vec3 V=-normalize(position);
		
		for(int x=0;x<=maxLightIndex;x++){
			switch(lights[x].type){
				case 1://ambient
				switch(lights[x].negativeHandler){
					case 1:
						sumAmbient=vec4(sumAmbient.r+max(0., lights[x].color.r),
						sumAmbient.g+max(0., lights[x].color.g),
						sumAmbient.b+max(0., lights[x].color.b),
						sumAmbient.a*lights[x].color.a);
						break;
					case 2:
						sumAmbient=vec4(sumAmbient.r+min(0., lights[x].color.r),
						sumAmbient.g+min(0., lights[x].color.g),
						sumAmbient.b+min(0., lights[x].color.b),
						sumAmbient.a*lights[x].color.a);
						break;
					case 3:
						sumAmbient=vec4(sumAmbient.r+abs(lights[x].color.r),
						sumAmbient.g+abs(lights[x].color.g),
						sumAmbient.b+abs(lights[x].color.b),
						sumAmbient.a*lights[x].color.a);
						break;
					case 0: default:
						sumAmbient=vec4(sumAmbient.rgb+lights[x].color.rgb,sumAmbient.a*lights[x].color.a);
				}
				break;
				
				case 2://directional
				float NdotL=dot(-1.*lights[x].direction,N);
				vec4 c = NdotL*(lights[x].color);
				switch(lights[x].negativeHandler){
					case 1:
						sumDiffuse=vec4(sumDiffuse.r+max(0., c.r),
						sumDiffuse.g+max(0., c.g),
						sumDiffuse.b+max(0., c.b),
						mix(sumDiffuse.a, sumDiffuse.a*lights[x].a, max(0., NdotL)));
						break;
					case 2:
						sumDiffuse=vec4(sumDiffuse.r+min(0., c.r),
						sumDiffuse.g+min(0., c.g),
						sumDiffuse.b+min(0., c.b),
						mix(sumDiffuse.a, sumDiffuse.a*lights[x].a, min(0., NdotL)));
						break;
					case 3:
						sumDiffuse=vec4(sumDiffuse.r+abs(c.r),
						sumDiffuse.g+abs(c.g),
						sumDiffuse.b+abs(c.b),
						mix(sumDiffuse.a, sumDiffuse.a*lights[x].a, abs(NdotL)));
						break;
					case 0: default:
						sumDiffuse=vec4(sumDiffuse.rgb+c.rgb,mix(sumDiffuse.a, sumDiffuse.a*lights[x].a, NdotL));
				}
				break;
				
				case 4://spot
				//TODO: implement? For now just use point light implementation
				case 3://point
				vec3 v_surfaceToLight = (lights[x].location*vec3(1,1,-1) - position);
				vec3 v_surfaceToView = (cameraPos*vec3(1,1,-1) - position);
				vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
  				vec3 surfaceToViewDirection = normalize(v_surfaceToView);
  				vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);
				float diffuse = dot(N, surfaceToLightDirection);
				float specular = 0.;
				if((diffuse<0. && lights[x].negativeHandler == 1) || (diffuse>0. && lights[x].negativeHandler == 2)){
					
					switch(lights[x].negativeHandler){
					case 1:
					specular=max(dot(N,halfVector), 0.);
					break;
					case 2:
					specular = min(dot(N,halfVector), 0.);
					break;
					case 3:
					specular = abs(dot(N,halfVector));
					break;
					case 0: default:
					specular = dot(N,halfVector);
					}
				specular=pow(specular, lights[x].shininess*matProp5.r);
				}

				
				
				vec4 tmpDiff=(1./(length(v_surfaceToLight)*(1./lights[x].attenuation)))*(lights[x].color*lights[x].diffuseMultiply*diffuse);
				vec4 tmpSpec=(specular*lights[x].color*lights[x].specularMultiply);

				
				switch(lights[x].negativeHandler){
					case 1:
					sumDiffuse=vec4(max(0.,tmpDiff.r)+sumDiffuse.r,
						max(0.,tmpDiff.g)+sumDiffuse.g,
						max(0.,tmpDiff.b)+sumDiffuse.b,
						mix(sumDiffuse.a, tmpDiff.a*sumDiffuse.a, max(0., diffuse)));
					sumSpecular=vec4(max(0.,tmpSpec.r)+sumSpecular.r,
						max(0.,tmpSpec.g)+sumSpecular.g,
						max(0.,tmpSpec.b)+sumSpecular.b,
						mix(sumSpecular.a, tmpSpec.a*sumSpecular.a, max(0., specular)));
					break;
					case 2:
					sumDiffuse=vec4(min(0.,tmpDiff.r)+sumDiffuse.r,
						min(0.,tmpDiff.g)+sumDiffuse.g,
						min(0.,tmpDiff.b)+sumDiffuse.b,
						mix(sumDiffuse.a, tmpDiff.a*sumDiffuse.a, min(0., diffuse)));
					sumSpecular=vec4(min(0.,tmpSpec.r)+sumSpecular.r,
						min(0.,tmpSpec.g)+sumSpecular.g,
						min(0.,tmpSpec.b)+sumSpecular.b,
						mix(sumSpecular.a, tmpSpec.a*sumSpecular.a, min(0., specular)));
					break;
					case 3:
					sumDiffuse=vec4(abs(tmpDiff.r)+sumDiffuse.r,
						abs(tmpDiff.g)+sumDiffuse.g,
						abs(tmpDiff.b)+sumDiffuse.b,
						mix(sumDiffuse.a, tmpDiff.a*sumDiffuse.a, abs(diffuse)));
					sumSpecular=vec4(abs(tmpSpec.r)+sumSpecular.r,
						abs(tmpSpec.g)+sumSpecular.g,
						abs(tmpSpec.b)+sumSpecular.b,
						mix(sumSpecular.a, tmpSpec.a*sumSpecular.a, abs(specular)));
					case 0: default:
					sumDiffuse=vec4(tmpDiff.rgb+sumDiffuse.rgb,mix(sumDiffuse.a, tmpDiff.a*sumDiffuse.a, diffuse));
					sumSpecular=vec4(tmpSpec.rgb+sumSpecular.rgb,mix(sumSpecular.a, tmpSpec.a*sumSpecular.a, specular));
				}
				
				default:
				break;
			}
		}
		
		vec4 tmp=(sumAmbient*matProp4*matProp1)+(sumDiffuse*matProp2*matProp1)+(sumSpecular*matProp3);
		fColor=vec4(max(tmp.r,0.),max(tmp.g,0.),max(tmp.b,0.),clamp(tmp.a,0.,1.));
		break;
		
		case 0:default:
		fColor=matProp1;
		break;
	}
}