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
 * Load a buffer into WebGL.
 * @param {WebGL2RenderingContext} gl 
 * @param {number[]} data 
 * @param {number} bufferType
 * 
 * @returns {WebGLBuffer}
 */
export function loadBuffer(gl, data, bufferType) {
    let buffer = gl.createBuffer();
    if (buffer === null) {
        throw new Error("Failed to create WebGL buffer");
    }

    gl.bindBuffer(bufferType, buffer);
    gl.bufferData(bufferType, data, gl.STATIC_DRAW);
    gl.bindBuffer(bufferType, null);

    return buffer;
}

/**
 * Create a vertex array object for WebGL.
 * @param {WebGL2RenderingContext} gl 
 * @param {WebGLBuffer} elementBuffer 
 * @param {{
 *  vertexBuffer: WebGLBuffer;
 *  stride: number;
 *  attribPointers: {
 *      index: number;
 *      size: number;
 *      offset: number;
 *      divisor?: number;
 *  }[];
 * }[]} vertexAttributes 
 * 
 * @returns {WebGLVertexArrayObject}
 */
export function loadVertexArray(gl, elementBuffer, vertexAttributes) {
    let vao = gl.createVertexArray();
    if (vao === null) {
        throw new Error("Failed to create WebGL vertex array");
    }

    gl.bindVertexArray(vao)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);

    for (let vertexBufferAttributes of vertexAttributes) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferAttributes.vertexBuffer);
        for (let attribPointer of vertexBufferAttributes.attribPointers) {
            gl.vertexAttribPointer(
                attribPointer.index,
                attribPointer.size,
                gl.FLOAT,
                false,
                vertexBufferAttributes.stride * 4,
                attribPointer.offset * 4
            );
            if (attribPointer.divisor !== undefined) {
                gl.vertexAttribDivisor(attribPointer.index, attribPointer.divisor);
            }
            gl.enableVertexAttribArray(attribPointer.index);
        }
    }

    gl.bindVertexArray(null);
    return vao;
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

    let vbo = loadBuffer(gl, vertices, gl.ARRAY_BUFFER);
    let ebo = loadBuffer(gl, indices, gl.ELEMENT_ARRAY_BUFFER);

    let vao = loadVertexArray(gl, ebo, [
        {
            vertexBuffer: vbo,
            stride: 8,
            attribPointers: [
                {
                    index: 0,
                    size: 3,
                    offset: 0
                },
                {
                    index: 1,
                    size: 3,
                    offset: 3
                },
                {
                    index: 2,
                    size: 2,
                    offset: 6
                },
            ]
        }
    ]);

    return {
        vao: vao,
        vbo: vbo,
        ebo: ebo,
        numIndices: indices.length,
    };
}
