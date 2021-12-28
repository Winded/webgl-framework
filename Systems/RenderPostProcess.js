import Framebuffers from '../DataSources/Framebuffers.js';
import { loadShader } from '../WebGLUtil.js';
import { requestText } from '../Ajax.js';
import Paths from '../DataSources/Paths.js';

const quad = [
    -1.0, 1.0, 0.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
    1.0, -1.0, 1.0, 0.0,

    -1.0, 1.0, 0.0, 1.0,
    1.0, -1.0, 1.0, 0.0,
    -1.0, -1.0, 0.0, 0.0,
];

export default class RenderPostProcess {
    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {Framebuffers} framebuffers 
     * @param {Paths} paths 
     */
    constructor(gl, framebuffers, paths) {
        this.gl = gl;
        this.framebuffers = framebuffers;
        this.paths = paths;

        this.ready = false;
    }

    async setup() {
        this.vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(quad), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    
        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
        this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 4 * 4, 0);
        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 4 * 4, 2 * 4);
        this.gl.enableVertexAttribArray(1);
        this.gl.bindVertexArray(null);
    
        let vert = await requestText(this.paths.pathPrefix + '/Shaders/PostProcess.vert');
        let frag = await requestText(this.paths.pathPrefix + '/Shaders/PostProcess.frag');
        this.shader = loadShader(this.gl, vert, frag);
    
        this.ready = true;
    }

    onStart() {
        this.setup();
    }

    onRender() {
        if (!this.ready) {
            return;
        }

        if (!this.framebuffers.colorTexture) {
            return;
        }
    
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.CULL_FACE);
        this.gl.disable(this.gl.BLEND);
    
        this.gl.useProgram(this.shader);
        this.gl.bindVertexArray(this.vao);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.framebuffers.colorTexture);
    
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
}
