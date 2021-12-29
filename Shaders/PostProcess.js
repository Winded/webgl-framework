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

const int BlurSamplesRadius = 10;

uniform sampler2D screen_texture;
uniform sampler2D bright_texture;

in vec2 fragUV;

out vec4 frag_color;

void main()
{
    vec2 offsets[9];
    offsets[0] = vec2(-1.0,  1.0);
    offsets[1] = vec2( 0.0,  1.0);
    offsets[2] = vec2( 1.0,  1.0);
    offsets[3] = vec2(-1.0,  0.0);
    offsets[4] = vec2( 0.0,  0.0);
    offsets[5] = vec2( 1.0,  0.0),
    offsets[6] = vec2(-1.0, -1.0);
    offsets[7] = vec2( 0.0, -1.0);
    offsets[8] = vec2( 1.0, -1.0);

    vec2 tex_offset = 1.0 / vec2(textureSize(bright_texture, 0));
    vec4 bright_color = texture(bright_texture, fragUV);
    for (int x = 1; x < BlurSamplesRadius; x++) {
        for (int y = 1; y < BlurSamplesRadius; y++) {
            bright_color += texture(bright_texture, vec2(
                fragUV.x + tex_offset.x * float(x),
                fragUV.y + tex_offset.y * float(y)
            ));
            bright_color += texture(bright_texture, vec2(
                fragUV.x + tex_offset.x * float(x),
                fragUV.y - tex_offset.y * float(y)
            ));
            bright_color += texture(bright_texture, vec2(
                fragUV.x - tex_offset.x * float(x),
                fragUV.y - tex_offset.y * float(y)
            ));
            bright_color += texture(bright_texture, vec2(
                fragUV.x - tex_offset.x * float(x),
                fragUV.y + tex_offset.y * float(y)
            ));
        }
    }
    bright_color /= float(BlurSamplesRadius * BlurSamplesRadius);

    frag_color = vec4(mix(texture(screen_texture, fragUV).rgb, bright_color.rgb, bright_color.a), 1.0);
}
`;
