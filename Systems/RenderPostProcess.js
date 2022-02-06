import Framebuffers from '../DataSources/Framebuffers.js';
import { loadShader } from '../WebGLUtil.js';
import Paths from '../DataSources/Paths.js';
import { VertexShader as PostProcessVertex, FragmentShader as PostProcessFragment } from '../Shaders/PostProcess.js';
import Viewport from '../DataSources/Viewport.js';

export default class RenderPostProcess {
    temporaryFramebuffer = {
        fbo: null,
        colorTexture: null,
    };

    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {Framebuffers} framebuffers 
     * @param {Paths} paths 
     * @param {Viewport} viewport
     * @param {Array} postProcessEffects
     */
    constructor(gl, framebuffers, paths, viewport, postProcessEffects) {
        this.gl = gl;
        this.framebuffers = framebuffers;
        this.paths = paths;
        this.viewport = viewport;
        this.postProcessEffects = postProcessEffects;
    }

    onStart() {
        // Setup temporary framebuffer
        {
            const buffers = this.temporaryFramebuffer;
            const res = this.viewport;

            buffers.fbo = this.gl.createFramebuffer();
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, buffers.fbo);
        
            buffers.colorTexture = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, buffers.colorTexture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, res.width, res.height, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, null);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, buffers.colorTexture, 0);
        
            if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) != this.gl.FRAMEBUFFER_COMPLETE) {
                console.error("Failed to setup framebuffer");
            }
        
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        }
    
        this.shader = loadShader(this.gl, PostProcessVertex, PostProcessFragment);
    }

    onRender() {
        if (!this.framebuffers.colorTexture) {
            return;
        }
    
        // Disable the features we don't need in post-process rendering
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.CULL_FACE);
        this.gl.disable(this.gl.BLEND);

        if ((this.postProcessEffects?.length ?? 0) > 0) {
            // Apply post processing effects in a loop
            this.postProcessEffects.forEach(effect => {
                this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.temporaryFramebuffer.fbo);

                effect.onPostProcessRender();
    
                // Copy resulting color buffer back to input framebuffer
                this.#copyFramebuffer(this.temporaryFramebuffer.fbo, this.framebuffers.fbo);
            });
        } else {
            // If there are no effects, just copy the framebuffer to output framebuffer
            this.#copyFramebuffer(this.framebuffers.fbo, this.temporaryFramebuffer.fbo);
        }
    
        {
            // Finally, render output framebuffer to default framebuffer.
            // This is done because blitFramebuffer does not work with the default framebuffer

            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    
            this.gl.useProgram(this.shader);
            this.gl.bindVertexArray(this.framebuffers.normalizedQuad.vao);
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.temporaryFramebuffer.colorTexture);
            this.gl.uniform1i(this.gl.getUniformLocation(this.shader, "screen_texture"), 0);
        
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        }
    }

    /**
     * 
     * @param {WebGLFramebuffer} from 
     * @param {WebGLFramebuffer} to 
     */
    #copyFramebuffer(from, to) {
        this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, from);
        this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, to);
        this.gl.blitFramebuffer(
            0, 0, this.viewport.width, this.viewport.height,
            0, 0, this.viewport.width, this.viewport.height,
            this.gl.COLOR_BUFFER_BIT, this.gl.NEAREST
        );
    }
}
