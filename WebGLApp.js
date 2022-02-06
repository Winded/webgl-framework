import RenderPreProcess from './Systems/RenderPreProcess.js';
import ClearCamera from './Systems/ClearCamera.js';
import SkyboxRenderer from './Systems/SkyboxRenderer.js';
import RenderPostProcess from './Systems/RenderPostProcess.js';
import Viewport from './DataSources/Viewport.js';
import Paths from './DataSources/Paths.js';
import Framebuffers from './DataSources/Framebuffers.js';
import Camera from './DataSources/Camera.js';
import SystemCollection from './SystemCollection.js';

/**
 * 
 * @param {string} canvasElementId 
 * @param {Paths} paths 
 */
export function createDefaultSystems(canvasElementId, paths) {
    const canvas = document.getElementById(canvasElementId);
    const gl = canvas.getContext("webgl2");

    let viewport = new Viewport();
    viewport.canvasElementId = canvasElementId;
    viewport.width = canvas.width;
    viewport.height = canvas.height;
    let framebuffers = new Framebuffers();
    let camera = new Camera();
    let postProcessEffects = [];

    return {
        data: {
            viewport: viewport,
            framebuffers: framebuffers,
            camera: camera,
            postProcessEffects: postProcessEffects,
        },
        preUpdate: [
            new RenderPreProcess(gl, framebuffers, viewport),
            new ClearCamera(gl, camera),
        ],
        postUpdate: [
            new SkyboxRenderer(gl, camera, paths),
            new RenderPostProcess(gl, framebuffers, paths, viewport, postProcessEffects),
        ]
    };
}

/**
 * 
 * @param {string} canvasElementId 
 * @param {SystemCollection} systems 
 */
export function run(canvasElementId, systems) {
    const canvas = document.getElementById(canvasElementId);

    canvas.onmousedown = event => systems.onMouseDown(event);
    canvas.onmouseup = event => systems.onMouseUp(event);
    canvas.onmousemove = event => systems.onMouseMove(event);
    canvas.onwheel = event => systems.onWheel(event);

    systems.onStart();
 
    let then = 0;
    function render(now) {
        now *= 0.001;
        const deltaTime = now - then;
        then = now;

        systems.onUpdate(deltaTime);
        systems.onRender();

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
