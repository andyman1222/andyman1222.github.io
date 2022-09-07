#version 300 es

precision highp float;

uniform sampler2D scene;
uniform sampler2D depth; 
uniform sampler2D normal;
uniform sampler2D position;
uniform sampler2D color;
uniform sampler2D diffuse;
uniform sampler2D specular;
uniform sampler2D emissive;

//uniform sampler2D cameraAngle;

in vec2 texCoords;
out vec4 fColor;

const int samples = 4;
const float minDepth = .1;
const float dist = 3.;
const float scale = 50.;
const vec4 fogColor = vec4(1., 0., 0., 1.);

void main(void){
    vec4 results;
    //fColor = texture(scene, mix(round(texCoords*vec2(scale, scale))/vec2(scale,scale),texCoords, length(texture(depth, round(texCoords*vec2(scale, scale))/vec2(scale,scale)))));
    //fColor = mix(fogColor, texture(scene, texCoords), clamp(((texture(depth, texCoords)))*((texture(position, texCoords).y)),0.,1.));
    fColor = mix(fogColor, texture(scene, texCoords), clamp(((texture(position, texCoords).y-1.)),0.,1.));
    //fColor = texture(position, texCoords);
    /*//fColor = vec4(t.rgb, 1);
    if(d.b > minDepth)
        fColor = t;
    else{
        //fColor = vec4(1,0,0,1);
        fColor = mix(t, texture(scene, round(texCoords/vec2(5, 5))*vec2(5,5)), (minDepth-d.b)/minDepth);
        /*for(int x = 1; x < samples; x++){
            for(int y = 0; y < samples; y++){
                vec2 tx = texCoords+vec2(cos((float(y)/float(samples))*2.*3.14)*dist*(float(x)/float(samples)), sin((float(y)/float(samples))*2.*3.14)*dist*(float(x)/float(samples)));
                results = results + texture(scene, tx);
            }
        }
        fColor = results / (float(samples)*float(samples));
        //fColor = mix(t, results / (float(samples)*float(samples)), (d.b-minDepth)/scale);
    }*/
}