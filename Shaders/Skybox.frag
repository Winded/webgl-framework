#version 300 es
precision highp float;

uniform samplerCube skybox;

in vec3 texCoords;

out vec4 frag_color;

void main()
{
    frag_color = texture(skybox, texCoords);
}