#version 300 es

precision mediump float;
in vec2 texCoord;

in vec3 normal;
in vec3 position;
in vec3 t;
in vec3 bt;

uniform int matIndex;

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
	int negativeHandlerAlt; //same as negative handler but applies to specular only
};

uniform light lights[64];
uniform int maxLightIndex;
uniform vec3 cameraPos;

uniform vec4 matProp1;
uniform vec4 matProp2;
uniform vec4 matProp3;
uniform vec4 matProp4;
uniform vec4 matProp5;

uniform sampler2D baseImage;
uniform sampler2D normalMap;
uniform sampler2D depthMap;
uniform sampler2D diffuseMap;//light multiplier
uniform sampler2D specularMap;//light multiplier

//uniform sampler2D miscTextures[11];

vec2 parallax(vec2 TexCoord, vec3 viewDir, float minLayers, float maxLayers, float heightScale)
{
	float minl=8.;
	if(minLayers>0) minl=minLayers;

	float maxl = 32.;
	if(maxLayers>0) malx=maxLayers;

	mix(maxl, minl, max(dot(vec3(0.0, 0.0, 1.0), viewDir), 0.0));

	float layerDepth=1./nl;
	float currentLayerDepth=0.;
	vec2 P=viewDir.xy*heightScale;
	vec2 deltaTexCoord=P/nl;
	vec2 currentTexCoords=TexCoord;
	
	float currentDepthMapValue=texture(depthMap,curTexCoord).r;
	
	while(currentLayerDepth<currentDepthMapValue)
	{
		// shift texture coordinates along direction of P
		currentTexCoords-=deltaTexCoords;
		// get depthmap value at current texture coordinates
		currentDepthMapValue=texture(depthMap,currentTexCoords).r;
		// get depth of next layer
		currentLayerDepth+=layerDepth;
	}
	
	vec2 prevTexCoord=currentTexCoords+deltaTexCoord;
	float next=currentDepthMapValue-currentLayerDepth;
	float prev=texture(depthMap,prevTexCoord).r-currentLayerDepth+layerDepth;
	float weight=next/(next-prev);
	return mix(currentTexCoords,prevTexCoord,weight);
}

struct sMat{
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
};

sMat getStandardMaterial(vec4 mp5, vec3 norm, vec3 pos){
	sMat r;
	r.ambient=vec4(0,0,0,1);
	r.diffuse=vec4(0,0,0,1);
	r.specular=vec4(0,0,0,1);
	vec3 N=normalize(norm);
	
	for(int x=0;x<=maxLightIndex;x++){
		switch(lights[x].type){
			case 1://ambient
			switch(lights[x].negativeHandler){
				case 1:
				r.ambient=vec4(r.ambient.r+max(0.,lights[x].color.r),
				r.ambient.g+max(0.,lights[x].color.g),
				r.ambient.b+max(0.,lights[x].color.b),
				r.ambient.a*lights[x].color.a);
				break;
				case 2:
				r.ambient=vec4(r.ambient.r+min(0.,lights[x].color.r),
				r.ambient.g+min(0.,lights[x].color.g),
				r.ambient.b+min(0.,lights[x].color.b),
				r.ambient.a*lights[x].color.a);
				break;
				case 3:
				r.ambient=vec4(r.ambient.r+abs(lights[x].color.r),
				r.ambient.g+abs(lights[x].color.g),
				r.ambient.b+abs(lights[x].color.b),
				r.ambient.a*lights[x].color.a);
				break;
				case 0:default:
				r.ambient=vec4(r.ambient.rgb+lights[x].color.rgb,r.ambient.a*lights[x].color.a);
			}
			break;

			case 2://directional
			float NdotL=dot(-1.*lights[x].direction,N);
			vec4 c=NdotL*(lights[x].color);
			switch(lights[x].negativeHandler){
				case 1:
				r.diffuse=vec4(r.diffuse.r+max(0.,c.r),
				r.diffuse.g+max(0.,c.g),
				r.diffuse.b+max(0.,c.b),
				mix(r.diffuse.a,r.diffuse.a*lights[x].color.a,max(0.,NdotL)));
				break;
				case 2:
				r.diffuse=vec4(r.diffuse.r+min(0.,c.r),
				r.diffuse.g+min(0.,c.g),
				r.diffuse.b+min(0.,c.b),
				mix(r.diffuse.a,r.diffuse.a*lights[x].color.a,min(0.,NdotL)));
				break;
				case 3:
				r.diffuse=vec4(r.diffuse.r+abs(c.r),
				r.diffuse.g+abs(c.g),
				r.diffuse.b+abs(c.b),
				mix(r.diffuse.a,r.diffuse.a*lights[x].color.a,abs(NdotL)));
				break;
				case 0:default:
				r.diffuse=vec4(r.diffuse.rgb+c.rgb,mix(r.diffuse.a,r.diffuse.a*lights[x].color.a,NdotL));
			}
			break;

			case 4://spot
			//TODO: implement? For now just use point light implementation
			case 3://point
			vec3 v_surfaceToLight=(lights[x].location*vec3(1,1,-1)-position);
			vec3 v_surfaceToView=(cameraPos*vec3(1,1,-1)-position);
			vec3 surfaceToLightDirection=normalize(v_surfaceToLight);
			vec3 surfaceToViewDirection=normalize(v_surfaceToView);
			vec3 halfVector=normalize(surfaceToLightDirection+surfaceToViewDirection);

			float diffuse=dot(N,surfaceToLightDirection);
			float specular=0.;

			if((diffuse>0.&&lights[x].negativeHandler==1)||(diffuse<0.&&lights[x].negativeHandler==2)||(lights[x].negativeHandler!=2&&lights[x].negativeHandler!=1)){
				
				switch(lights[x].negativeHandlerAlt){
					case 1:
					specular=max(dot(N,halfVector),0.);
					break;
					case 2:
					specular=min(dot(N,halfVector),0.);
					break;
					case 3:
					specular=abs(dot(N,halfVector));
					break;
					case 0:default:
					specular=dot(N,halfVector);
				}
				specular=pow(specular,lights[x].shininess*mp5.r);
			}

			vec4 tmpDiff=(1./(length(v_surfaceToLight)*(1./lights[x].attenuation)))*(lights[x].color*lights[x].diffuseMultiply*diffuse);
			vec4 tmpSpec=(1./(length(v_surfaceToLight)*(1./lights[x].attenuation)))*(specular*lights[x].color*lights[x].specularMultiply);

			switch(lights[x].negativeHandler){
				case 1:
				r.diffuse=vec4(max(0.,tmpDiff.r)+r.diffuse.r,
				max(0.,tmpDiff.g)+r.diffuse.g,
				max(0.,tmpDiff.b)+r.diffuse.b,
				mix(r.diffuse.a,lights[x].color.a*lights[x].diffuseMultiply.a*r.diffuse.a,max(0.,diffuse)));
				
				break;
				case 2:
				r.diffuse=vec4(min(0.,tmpDiff.r)+r.diffuse.r,
				min(0.,tmpDiff.g)+r.diffuse.g,
				min(0.,tmpDiff.b)+r.diffuse.b,
				mix(r.diffuse.a,lights[x].color.a*lights[x].diffuseMultiply.a*r.diffuse.a,min(0.,diffuse)));
				
				break;
				case 3:
				r.diffuse=vec4(abs(tmpDiff.r)+r.diffuse.r,
				abs(tmpDiff.g)+r.diffuse.g,
				abs(tmpDiff.b)+r.diffuse.b,
				mix(r.diffuse.a,lights[x].color.a*lights[x].diffuseMultiply.a*r.diffuse.a,abs(diffuse)));
				
				case 0:default:
				r.diffuse=vec4(tmpDiff.rgb+r.diffuse.rgb,mix(r.diffuse.a,lights[x].color.a*lights[x].diffuseMultiply.a*r.diffuse.a,diffuse));
				
			}

			switch(lights[x].negativeHandlerAlt){
				case 1:
				r.specular=vec4(max(0.,tmpSpec.r)+r.specular.r,
				max(0.,tmpSpec.g)+r.specular.g,
				max(0.,tmpSpec.b)+r.specular.b,
				mix(r.specular.a,lights[x].color.a*lights[x].specularMultiply.a*r.specular.a,max(0.,specular)));
				break;
				case 2:
				r.specular=vec4(min(0.,tmpSpec.r)+r.specular.r,
				min(0.,tmpSpec.g)+r.specular.g,
				min(0.,tmpSpec.b)+r.specular.b,
				mix(r.specular.a,lights[x].color.a*lights[x].specularMultiply.a*r.specular.a,min(0.,specular)));
				break;
				case 3:
				r.specular=vec4(abs(tmpSpec.r)+r.specular.r,
				abs(tmpSpec.g)+r.specular.g,
				abs(tmpSpec.b)+r.specular.b,
				mix(r.specular.a,lights[x].color.a*lights[x].specularMultiply.a*r.specular.a,abs(specular)));
				break;
				case 0: default:
				r.specular=vec4(tmpSpec.rgb+r.specular.rgb,mix(r.specular.a,lights[x].color.a*lights[x].specularMultiply.a*r.specular.a,specular));

			}

			default:
			break;
		}
	}
	return r;
}

vec4 standardMaterial(vec4 mp1,vec4 mp2,vec4 mp3,vec4 mp4,vec4 mp5,vec3 norm,vec3 pos){
	sMat mat = getStandardMaterial(mp5, norm, pos);
	vec4 tmp=vec4(((mat.ambient*mp4*mp1)+(mat.diffuse*mp2*mp1)+(mat.specular*mp3)).rgb,mat.ambient.a*mp4.a*mp1.a*mat.diffuse.a*mp2.a*mp1.a*mat.specular.a*mp3.a);
	return vec4(max(tmp.r,0.),max(tmp.g,0.),max(tmp.b,0.),clamp(tmp.a,0.,1.));
}

vec4 standardImage(vec4 mp1, vec4 mp2, vec4 mp3, vec4 mp4, vec4 mp5, vec3 pos){
	sMat base = getStandardMaterial(mp5, norm, pos);
	
}

void main(void){

switch(matIndex){
	case -1: //nodraw
	return;

	case 1:
	fColor=standardMaterial(matProp1,matProp2,matProp3,matProp4,matProp5,normal,position);
	break;

	case 2:
	fColor = standardImage(matProp1,matProp2,matProp3,matProp4,matProp5,normal,position);
	break;

	case 0: default:
	fColor=matProp1;
	break;
	}
}