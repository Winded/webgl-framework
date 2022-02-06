export default class Framebuffers {
    /** @type {WebGLVertexArrayObject} */
    fbo = null;
    /** @type {WebGLTexture} */
    colorTexture = null;
    /** @type {WebGLTexture} */
    brightTexture = null;
    /** @type {WebGLTexture} */
    depthTexture = null;

    normalizedQuad = {
        /** @type {WebGLBuffer} */
        vbo: null,
        /** @type {WebGLVertexArrayObject} */
        vao: null,
    };
}
