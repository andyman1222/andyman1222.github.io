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
const float scale = 10.;

void main(void){
    vec4 results;
    vec4 t = texture(scene, texCoords);
    vec4 d = texture(depth, texCoords);
    //fColor = vec4(t.rgb, 1);
    if(d.b > minDepth)
        fColor = t;
    else if (d.b > 0.){
        //fColor = vec4(1,0,0,1);
        fColor = mix(t, texture(scene, texCoords/vec2(5, 5)), (minDepth-d.b)/minDepth);
        /*for(int x = 1; x < samples; x++){
            for(int y = 0; y < samples; y++){
                vec2 tx = texCoords+vec2(cos((float(y)/float(samples))*2.*3.14)*dist*(float(x)/float(samples)), sin((float(y)/float(samples))*2.*3.14)*dist*(float(x)/float(samples)));
                results = results + texture(scene, tx);
            }
        }
        fColor = results / (float(samples)*float(samples));*/
        //fColor = mix(t, results / (float(samples)*float(samples)), (d.b-minDepth)/scale);
    }
}