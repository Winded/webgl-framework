import * as Framebuffers from '../DataSources/Framebuffers.js';
import * as Viewport from '../DataSources/Viewport.js';

let setupDone = false;

/**
 * 
 * @param {WebGL2RenderingContext} gl 
 */
function setup(gl) {
    const res = Viewport.resolution;
    let buffers = Framebuffers.renderFramebuffer;

    buffers.fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffers.fbo);

    buffers.colorTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, buffers.colorTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, res.width, res.height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, buffers.colorTexture, 0);

    buffers.depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, buffers.depthTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH24_STENCIL8, res.width, res.height, 0, gl.DEPTH_STENCIL, gl.UNSIGNED_INT_24_8, null);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.TEXTURE_2D, buffers.depthTexture, 0);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
        console.error("Failed to setup framebuffer");
    }

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    setupDone = true;
}

/**
 * 
 * @param {float} deltaTime 
 * @param {WebGL2RenderingContext} gl 
 */
export function render(deltaTime, gl) {
    if (!setupDone) {
        setup(gl);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, Framebuffers.renderFramebuffer.fbo);
}
