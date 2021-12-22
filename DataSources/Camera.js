import { mat4, vec3 } from '../GLMatrix/index.js';

export const properties = {
    viewMatrix: mat4.create(),
    projectionMatrix: mat4.create(),
    clearColor: vec3.create(),
};
