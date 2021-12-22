import * as Camera from '../DataSources/Camera.js';

/**
 * 
 * @param {float} deltaTime 
 * @param {WebGL2RenderingContext} gl 
 * @returns 
 */
export function render(deltaTime, gl) {
    const clearColor = Camera.properties.clearColor;

    // Set clear color to black, fully opaque
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
