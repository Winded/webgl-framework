import { VertexShader as PostProcessVertexShader } from "./PostProcess.js";

export const VertexShader = PostProcessVertexShader;

export const FragmentShader = `#version 300 es
precision highp float;

const int BlurSamplesRadius = 5;

uniform sampler2D screen_texture;
uniform sampler2D bright_texture;

uniform bool vertical;

in vec2 fragUV;

out vec4 frag_color;

void main()
{
    vec2 tex_offset = 1.0 / vec2(textureSize(bright_texture, 0));
    vec4 bright_color = texture(bright_texture, fragUV);
    for (int i = 1; i < BlurSamplesRadius; i++) {
        if (vertical) {
            bright_color += texture(bright_texture, vec2(
                fragUV.x,
                fragUV.y + tex_offset.y * float(i)
            ));
            bright_color += texture(bright_texture, vec2(
                fragUV.x,
                fragUV.y - tex_offset.y * float(i)
            ));
        } else {
            bright_color += texture(bright_texture, vec2(
                fragUV.x + tex_offset.x * float(i),
                fragUV.y
            ));
            bright_color += texture(bright_texture, vec2(
                fragUV.x - tex_offset.x * float(i),
                fragUV.y
            ));
        }
    }
    bright_color /= float(BlurSamplesRadius);

    frag_color = vec4(mix(texture(screen_texture, fragUV).rgb, bright_color.rgb, bright_color.a), 1.0);
}
`;
