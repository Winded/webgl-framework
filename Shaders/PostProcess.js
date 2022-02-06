export const VertexShader = `#version 300 es
precision highp float;

layout (location = 0) in vec2 position;
layout (location = 1) in vec2 uv;

out vec2 fragUV;

void main()
{
    gl_Position = vec4(position, 0.0, 1.0);
    fragUV = uv;
}
`;

export const FragmentShader = `#version 300 es
precision highp float;

uniform sampler2D screen_texture;

in vec2 fragUV;

out vec4 frag_color;

void main()
{
    frag_color = vec4(texture(screen_texture, fragUV).rgb, 1.0);
}
`;
