attribute vec4 coordinates;
attribute vec4 inColor;

uniform mat4 viewMatrix;
uniform mat4 projMatrix;

varying vec4 color;

void main(void) {
    gl_Position = projMatrix * viewMatrix * coordinates;
    color = (inColor);
}