import { loadShader, loadCubemap } from '../WebGLUtil.js';
import { mat4, quat } from '../GLMatrix/index.js';
import { requestImage, requestText } from '../Ajax.js';
import * as Camera from '../DataSources/Camera.js';
import { config as pathConfig } from '../DataSources/Paths.js';

let ready = false;

let viewMatrix = mat4.create();
let cameraRot = quat.create();

const skyboxVertices = [
    // positions          
    -1.0,  1.0, -1.0,
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
    -1.0,  1.0, -1.0,

    -1.0, -1.0,  1.0,
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
    -1.0, -1.0,  1.0,

     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,

    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0
];

let mesh = {
    vao: null,
    vbo: null,
    numVertices: 0,
};

let texture = null;

let shader = null;

async function loadShaders(gl) {
    let vert = await requestText(pathConfig.pathPrefix + '/Shaders/Skybox.vert');
    let frag = await requestText(pathConfig.pathPrefix + '/Shaders/Skybox.frag');
    shader = loadShader(gl, vert, frag);
}

async function loadTextures(gl) {
    let textureImages = []
    for (let path of pathConfig.skyboxTexturePaths) {
        textureImages.push(await requestImage(path));
    }
    console.log(textureImages);
    texture = loadCubemap(gl, textureImages);
}

/**
 * 
 * @param {WebGL2RenderingContext} gl 
 */
function loadMeshes(gl) {
    let vertices = new Float32Array(skyboxVertices);

    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);
    gl.enableVertexAttribArray(0);
    gl.bindVertexArray(null);

    mesh.vao = vao;
    mesh.vbo = vbo;
    mesh.numVertices = skyboxVertices.length;
}

async function setupRender(gl) {
    if (!pathConfig.skyboxTexturePaths) {
        return;
    }

    await loadShaders(gl);
    await loadTextures(gl);
    loadMeshes(gl);
    ready = true;
}

/**
 * 
 * @param {WebGL2RenderingContext} gl 
 */
export function start(gl) {
    setupRender(gl);
}

/**
 * 
 * @param {float} deltaTime 
 * @param {WebGL2RenderingContext} gl 
 */
export function render(deltaTime, gl) {
    if (!ready) {
        return;
    }

    mat4.getRotation(cameraRot, Camera.properties.viewMatrix);
    mat4.fromQuat(viewMatrix, cameraRot);

    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.depthFunc(gl.LEQUAL);

    gl.useProgram(shader);
    gl.uniformMatrix4fv(gl.getUniformLocation(shader, "projection"), false, Camera.properties.projectionMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(shader, "view"), false, viewMatrix);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.bindVertexArray(mesh.vao);

    gl.drawArrays(gl.TRIANGLES, 0, mesh.numVertices);
}
