import Camera from '../DataSources/Camera.js';

export default class {
    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {Camera} camera
     */
    constructor(gl, camera) {
        this.gl = gl;
        this.camera = camera;
    }

    onRender() {
        const clearColor = this.camera.clearColor;
        this.gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
};
