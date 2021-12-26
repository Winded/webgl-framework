import * as RenderPreProcess from './Systems/RenderPreProcess.js';
import * as ClearCamera from './Systems/ClearCamera.js';
import * as SkyboxRenderer from './Systems/SkyboxRenderer.js';
import * as RenderPostProcess from './Systems/RenderPostProcess.js';
import * as Viewport from './DataSources/Viewport.js';

export function invokeCallback(systemArray, callbackName, ...args) {
    systemArray.forEach(system => {
        if (system[callbackName]) {
            system[callbackName](...args);
        }
    });
}

export const defaultSystems = {
    preUpdate: [
        RenderPreProcess,
        ClearCamera,
    ],
    postUpdate: [
        SkyboxRenderer,
        RenderPostProcess,
    ],
};

export function run(canvasElementId, systems) {
    const canvas = document.getElementById(canvasElementId);
    Viewport.canvas.elementId = canvasElementId;
    Viewport.resolution.width = canvas.width;
    Viewport.resolution.height = canvas.height;
    const gl = canvas.getContext("webgl2");
  
    if (gl === null) {
        return false;
    }

    canvas.onmousedown = event => invokeCallback(systems, "onMouseDown", event);
    canvas.onmouseup = event => invokeCallback(systems, "onMouseUp", event);
    canvas.onmousemove = event => invokeCallback(systems, "onMouseMove", event);
    canvas.onwheel = event => invokeCallback(systems, "onWheel", event);

    invokeCallback(systems, "start", gl);
 
    let then = 0;
    function render(now) {
        now *= 0.001;
        const deltaTime = now - then;
        then = now;

        invokeCallback(systems, "update", deltaTime);
        invokeCallback(systems, "render", deltaTime, gl);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    return true;
}
