export default class SystemCollection {
    #systems = [];
    
    constructor() {
    }

    addSystems(systems) {
        this.#systems.push(...systems);
    }

    #invokeCallback(callbackName, ...args) {
        this.#systems.forEach(system => {
            if (system[callbackName]) {
                system[callbackName](...args);
            }
        });
    }

    onStart() {
        this.#invokeCallback("onStart");
    }

    onUpdate(deltaTime) {
        this.#invokeCallback("onUpdate", deltaTime);
    }

    onRender() {
        this.#invokeCallback("onRender");
    }

    onMouseDown(event) {
        this.#invokeCallback("onMouseDown", event);
    }

    onMouseUp(event) {
        this.#invokeCallback("onMouseUp", event);
    }

    onMouseMove(event) {
        this.#invokeCallback("onMouseMove", event);
    }

    onWheel(event) {
        this.#invokeCallback("onWheel", event);
    }
}
