import * as Framebuffers from '../DataSources/Framebuffers.js';
import { loadShader } from '../WebGLUtil.js';
import { requestText } from '../Ajax.js';
import { config as pathConfig } from '../DataSources/Paths.js';

const quad = [
    -1.0, 1.0, 0.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
    1.0, -1.0, 1.0, 0.0,

    -1.0, 1.0, 0.0, 1.0,
    1.0, -1.0, 1.0, 0.0,
    -1.0, -1.0, 0.0, 0.0,
];

let vbo = null;
let vao = null;
let shader = null;
let setupDone = false;

/**
 *  
 * @param {WebGL2RenderingContext} gl 
 */
async function setup(gl) {
    vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quad), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 4 * 4, 0);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 4 * 4, 2 * 4);
    gl.enableVertexAttribArray(1);
    gl.bindVertexArray(null);

    let vert = await requestText(pathConfig.pathPrefix + '/Shaders/PostProcess.vert');
    let frag = await requestText(pathConfig.pathPrefix + '/Shaders/PostProcess.frag');
    shader = loadShader(gl, vert, frag);

    setupDone = true;
}

/**
 * 
 * @param {WebGL2RenderingContext} gl 
 */
export function start(gl) {
    setup(gl);
}

/**
 * 
 * @param {float} deltaTime 
 * @param {WebGL2RenderingContext} gl 
 */
export function render(deltaTime, gl) {
    if (!setupDone) {
        return;
    }

    let buffers = Framebuffers.renderFramebuffer;
    if (!buffers.colorTexture) {
        return;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);

    gl.useProgram(shader);
    gl.bindVertexArray(vao);
    gl.bindTexture(gl.TEXTURE_2D, buffers.colorTexture);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}