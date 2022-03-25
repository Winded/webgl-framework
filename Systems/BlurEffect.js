import Framebuffers from "../DataSources/Framebuffers.js";
import { FragmentShader, VertexShader } from "../Shaders/PostProcessBlur.js";
import { loadShader } from "../WebGLUtil.js";

export default class BlurEffect {
    /**
     * 
     * @param {WebGL2RenderingContext} gl
     * @param {Framebuffers} framebuffers 
     * @param {boolean} vertical True if blur is done vertically, horizontally otherwise
     */
    constructor(gl, framebuffers, vertical) {
        this.gl = gl;
        this.framebuffers = framebuffers;
        this.vertical = vertical;
    }

    onStart() {
        this.shader = loadShader(this.gl, VertexShader, FragmentShader);
    }

    onPostProcessRender() {
        if (!this.shader) {
            return;
        }

        this.gl.useProgram(this.shader);
        this.gl.bindVertexArray(this.framebuffers.normalizedQuad.vao);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.framebuffers.colorTexture);
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.framebuffers.brightTexture);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.uniform1i(this.gl.getUniformLocation(this.shader, "screen_texture"), 0);
        this.gl.uniform1i(this.gl.getUniformLocation(this.shader, "bright_texture"), 1);
        this.gl.uniform1i(this.gl.getUniformLocation(this.shader, "vertical"), this.vertical);
    
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
}