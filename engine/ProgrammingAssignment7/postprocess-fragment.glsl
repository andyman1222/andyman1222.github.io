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
const float scale = 10.;

void main(void){
    vec4 results;
    vec4 t = texture(scene, texCoords);
    vec4 d = texture(depth, texCoords);
    //fColor = vec4(t.rgb, 1);
    if(d.b > minDepth)
        fColor = d;
    else {
        fColor = vec4(1,0,0,1);
        /*for(float x = 0.; x < (d.b+minDepth)/float(scale); x++){
            for(int y = 0; y < samples; y++){
                vec2 tx = vec2(cos((float(y)/float(samples))*2.*3.14)*(x+1.), sin((float(y)/float(samples))*2.*3.14)*(float(x)+1.));
                results = results + texture(scene, tx);
            }
        }
        fColor = results / (((d.b+minDepth)/float(scale))*float(samples));*/
    }
}