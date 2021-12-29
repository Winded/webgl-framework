import { loadShader, loadCubemap } from '../WebGLUtil.js';
import { mat4, quat } from '../GLMatrix/index.js';
import { requestImage } from '../Ajax.js';
import Camera from '../DataSources/Camera.js';
import Paths from '../DataSources/Paths.js';
import { VertexShader as SkyboxVertex, FragmentShader as SkyboxFragment } from '../Shaders/Skybox.js';

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

export default class SkyboxRenderer {
    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {Camera} camera 
     * @param {Paths} paths 
     */
    constructor(gl, camera, paths) {
        this.gl = gl;
        this.camera = camera;
        this.paths = paths;

        this.viewMatrix = mat4.create();
        this.cameraRot = quat.create();

        this.ready = false;
    }

    async setup() {
        if (!this.paths.skyboxTexturePaths) {
            return;
        }
    
        this.shader = loadShader(this.gl, SkyboxVertex, SkyboxFragment);

        let textureImages = [];
        for (let path of this.paths.skyboxTexturePaths) {
            textureImages.push(await requestImage(path));
        }
        this.texture = loadCubemap(this.gl, textureImages);

        let vertices = new Float32Array(skyboxVertices);
        let vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        let vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(vao);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 3 * 4, 0);
        this.gl.enableVertexAttribArray(0);
        this.gl.bindVertexArray(null);
    
        this.mesh = {
            vao: vao,
            vbo: vbo,
            numVertices: skyboxVertices.length
        };

        this.ready = true;
    }

    onStart() {
        this.setup();
    }

    onRender() {
        if (!this.ready) {
            return;
        }

        mat4.getRotation(this.cameraRot, this.camera.viewMatrix);
        mat4.fromQuat(this.viewMatrix, this.cameraRot);

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.gl.useProgram(this.shader);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shader, "projection"), false, this.camera.projectionMatrix);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shader, "view"), false, this.viewMatrix);
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texture);
        this.gl.bindVertexArray(this.mesh.vao);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.mesh.numVertices);
    }
}
