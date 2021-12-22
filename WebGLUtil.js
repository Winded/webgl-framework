/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {HTMLImageElement[]} textures 
 * @returns {WebGLTexture} cubemap
 */
export function loadCubemap(gl, textures) {
    let tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);

    for (let i = 0; i < textures.length; i++) {
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texData[i]);
    }

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

    return tex;
}

/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {string} vertexCode 
 * @param {string} fragmentCode 
 */
export function loadShader(gl, vertexCode, fragmentCode) {
    let vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vertexCode);
    gl.compileShader(vs);

    let success = gl.getShaderParameter(vs, gl.COMPILE_STATUS);
    if (!success) {
        console.error(gl.getShaderInfoLog(vs));
    }

    let fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fragmentCode);
    gl.compileShader(fs);

    success = gl.getShaderParameter(fs, gl.COMPILE_STATUS);
    if (!success) {
        console.error(gl.getShaderInfoLog(fs));
    }

    let program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    return program;
}
