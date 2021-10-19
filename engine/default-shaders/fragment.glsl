precision lowp float;
varying vec4 color;

attribute int matIndex; //default = 0, constant values; 1 = texture, constant values

struct light
{
    char type; //0=ambient, 1=point, 2=spot
    vec4 location, direction; //direction ignored if not spotlight; location ignored if ambient
    float angle; //spotlight only
    float attenuation;
    char lightmask;
    vec3 color;
    vec3 diffuseMultiply;
    vec3 specularMultiply;
}



vec2 parallax(vec2 TexCoord, vec3 V)
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
}


void main(void) {
    switch (matIndex){
        default:
            gl_FragColor = color;
    }
}