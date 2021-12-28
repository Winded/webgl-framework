import { mat4, vec3 } from '../GLMatrix/index.js';

export default class Camera {
    viewMatrix = mat4.create();
    projectionMatrix = mat4.create();
    clearColor = vec3.create();
}
