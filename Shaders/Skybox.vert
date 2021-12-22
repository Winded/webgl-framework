#version 300 es
precision highp float;

uniform mat4 projection;
uniform mat4 view;

layout (location = 0) in vec3 position;

out vec3 texCoords;

void main()
{
    texCoords = position;
    vec4 glPosition = projection * view * vec4(position, 1.0);
    gl_Position = glPosition.xyww;
}
