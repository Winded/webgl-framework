import Framebuffers from '../DataSources/Framebuffers.js';
import Viewport from '../DataSources/Viewport.js';

const quad = [
    -1.0, 1.0, 0.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
    1.0, -1.0, 1.0, 0.0,

    -1.0, 1.0, 0.0, 1.0,
    1.0, -1.0, 1.0, 0.0,
    -1.0, -1.0, 0.0, 0.0,
];

export default class RenderPreProcess {
    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {Framebuffers} framebuffers 
     * @param {Viewport} viewport 
     */
    constructor(gl, framebuffers, viewport) {
        this.gl = gl;
        this.framebuffers = framebuffers;
        this.viewport = viewport;

        this.ready = false;
    }

    async setup() {
        const res = {
            width: this.viewport.width,
            height: this.viewport.height,
        };
        let buffers = this.framebuffers;
    
        buffers.fbo = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, buffers.fbo);
    
        buffers.colorTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, buffers.colorTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, res.width, res.height, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, null);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, buffers.colorTexture, 0);
    
        buffers.brightTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, buffers.brightTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, res.width, res.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT1, this.gl.TEXTURE_2D, buffers.brightTexture, 0);
    
        buffers.depthTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, buffers.depthTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.DEPTH24_STENCIL8, res.width, res.height, 0, this.gl.DEPTH_STENCIL, this.gl.UNSIGNED_INT_24_8, null);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_STENCIL_ATTACHMENT, this.gl.TEXTURE_2D, buffers.depthTexture, 0);
    
        if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) != this.gl.FRAMEBUFFER_COMPLETE) {
            console.error("Failed to setup framebuffer");
        }
    
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        {
            // Normalized quad buffer and vertex array
            const normalizedQuad = buffers.normalizedQuad;

            normalizedQuad.vbo = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalizedQuad.vbo);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(quad), this.gl.STATIC_DRAW);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        
            normalizedQuad.vao = this.gl.createVertexArray();
            this.gl.bindVertexArray(normalizedQuad.vao);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalizedQuad.vbo);
            this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 4 * 4, 0);
            this.gl.enableVertexAttribArray(0);
            this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 4 * 4, 2 * 4);
            this.gl.enableVertexAttribArray(1);
            this.gl.bindVertexArray(null);
        }

        this.ready = true;
    }

    onStart() {
        this.setup();
    }

    onRender() {
        if (!this.ready) {
            return;
        }
    
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffers.fbo);
    }
}
