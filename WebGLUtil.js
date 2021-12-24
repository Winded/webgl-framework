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
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[i]);
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
 * @param {HTMLImageElement} texture 
 * @param {number} filterMode 
 * @returns {WebGLTexture} texture
 */
export function loadTexture(gl, texture, filterMode) {
    if (!filterMode) {
        filterMode = gl.LINEAR;
    }

    let tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filterMode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filterMode);
    gl.bindTexture(gl.TEXTURE_2D, null);

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

/**
 * Load standard vertices and indices into WebGL buffers. Creates a vertex array object.
 * Standard vertex array format is:
 * x, y, z, xnormal, ynormal, znormal, u, v
 * all values are float numbers
 * @param {WebGL2RenderingContext} gl 
 * @param {number[]} vertices 
 * @param {number[]} indices 
 * @returns vao, vbo and ebo in an object
 */
export function loadStandardVertexBuffer(gl, vertices, indices) {
    vertices = new Float32Array(vertices);
    indices = new Uint32Array(indices);

    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    let ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 8 * 4, 0);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 8 * 4, 3 * 4);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 8 * 4, 6 * 4);
    gl.enableVertexAttribArray(2);
    gl.bindVertexArray(null);

    return {
        vao: vao,
        vbo: vbo,
        ebo: ebo,
        numIndices: indices.length,
    };
}
