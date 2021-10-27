#version 300 es

precision mediump float;
in vec2 texCoord;

in vec3 normal;
in vec3 position;
//in mat3 TBN;

flat in int matIndex;
in vec4 matProp[6];

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

uniform sampler2D baseImage;
uniform sampler2D normalMap;
uniform sampler2D depthMap;
uniform sampler2D diffuseMap;//light multiplier
uniform sampler2D roughnessMap;//light multiplier

//uniform sampler2D miscTextures[11];

vec2 parallax(vec2 TexCoord, vec3 viewDir, float minLayers, float maxLayers, float heightScale)
{
	float minl=8.;
	if(minLayers>0.) minl=minLayers;

	float maxl = 32.;
	if(maxLayers>0.) maxl=maxLayers;

	float hs = 1.;
	if(heightScale>0.) hs=heightScale;

	float nl = mix(maxl, minl, max(dot(vec3(0.0, 0.0, 1.0), viewDir), 0.0));

	float layerDepth=1./nl;
	float currentLayerDepth=0.;
	vec2 P=viewDir.xy*hs;
	vec2 deltaTexCoord=P/nl;
	vec2 currentTexCoords=TexCoord;
	
	float currentDepthMapValue=texture(depthMap,currentTexCoords).r;
	
	while(currentLayerDepth<currentDepthMapValue)
	{
		// shift texture coordinates along direction of P
		currentTexCoords-=deltaTexCoord;
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
	r.ambient=vec4(0.,0.,0.,1.);
	r.diffuse=vec4(0.,0.,0.,1.);
	r.specular=vec4(0.,0.,0.,1.);
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
			vec3 v_surfaceToLight=(lights[x].location*vec3(1.,1.,-1.)-position);
			vec3 v_surfaceToView=(cameraPos*vec3(1.,1.,-1.)-position);
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

vec4 standardMaterial(vec4 mp[6], vec3 norm, vec3 pos){
	sMat mat = getStandardMaterial(mp[4], norm, pos);
	vec4 tmp=vec4(((mat.ambient*mp[3]*mp[0])+(mat.diffuse*mp[1]*mp[0])+(mat.specular*mp[2])).rgb,mat.ambient.a*mp[3].a*mp[0].a*mat.diffuse.a*mp[1].a*mp[0].a*mat.specular.a*mp[2].a);
	return vec4(max(tmp.r,0.),max(tmp.g,0.),max(tmp.b,0.),clamp(tmp.a,0.,1.));
}

//with parallax
//There's some sort of error I have no idea about so for now it's disabled
/*
vec4 standardImageFull(vec4 mp[6], vec3 pos, vec2 tx, vec3 viewdir, float min, float max, float scale){
	vec2 txp = parallax((tx*vec2(mp[5][0], mp[5][1]))+vec2(mp[5][2], mp[5][3]), viewdir, min, max, scale);
	vec3 norm = -1. * normalize(texture(normalMap, txp).rgb*2.-1.);
	sMat mat = getStandardMaterial(mp[4], norm, pos);
	vec4 txDiff = texture(diffuseMap, txp);
	vec4 txSpec = texture(roughnessMap, txp);
	//vec4 txSpec = vec4(vec3(1.,1.,1.)-txRough.rgb,txRough.a);
	vec4 txBase = texture(baseImage, txp);
	vec4 tmp=vec4(((mat.ambient*mp[3]*mp[0]*txBase)+(mat.diffuse*mp[1]*mp[0]*txDiff*txBase)+(mat.specular*mp[2]*txSpec)).rgb,txBase.a*mat.ambient.a*mp[3].a*mp[0].a*mat.diffuse.a*mp[1].a*mp[0].a*mat.specular.a*mp[2].a);
	return vec4(max(tmp.r,0.),max(tmp.g,0.),max(tmp.b,0.),clamp(tmp.a,0.,1.));
	//return tmp;
}*/

//no parallax
vec4 standardImage(vec4 mp[6], vec3 pos, vec2 tx){
	vec2 txCoords = (tx*vec2(mp[5][0], mp[5][1]))+vec2(mp[5][2], mp[5][3]);
	vec3 norm = -1.*normal * normalize(texture(normalMap, txCoords).rgb*2.-1.);
	sMat mat = getStandardMaterial(mp[4], norm, pos);
	vec4 txDiff = texture(diffuseMap, txCoords);
	vec4 txSpec = texture(roughnessMap, txCoords);
	//vec4 txSpec = vec4(vec3(1.,1.,1.)-txRough.rgb,txRough.a);
	vec4 txBase = texture(baseImage, txCoords);
	vec4 tmp=vec4(((mat.ambient*mp[3]*mp[0]*txBase*txDiff)+(mat.diffuse*mp[1]*mp[0]*txBase)+(mat.specular*mp[2]*txSpec)).rgb,txBase.a*mat.ambient.a*mp[3].a*mp[0].a*mat.diffuse.a*mp[1].a*mp[0].a*mat.specular.a*mp[2].a);
	return vec4(max(tmp.r,0.),max(tmp.g,0.),max(tmp.b,0.),clamp(tmp.a,0.,1.));
}

void main(void){

switch(matIndex){
	case -1: //nodraw
	return;

	case 1: //no texture
	fColor=standardMaterial(matProp,normal,position);
	break;

	case 2: //parallaxed texture (temp: unparallaxed texture)
	//fColor = standardImageFull(matProp,position,texCoord,(cameraPos*vec3(1.,1.,-1.)-position),-1.,-1.,-1.);
	//break;

	case 3: //texture, no parallax
	fColor = standardImage(matProp, position, texCoord);
	break;

	case 4: //unlit texture, no parallax
	fColor = texture(baseImage, (texCoord*vec2(matProp[5][0], matProp[5][1]))+vec2(matProp[5][2], matProp[5][3])) * matProp[0];
	break;

	case 0: default: //solid color
	fColor=matProp[0];
	break;
	}
}