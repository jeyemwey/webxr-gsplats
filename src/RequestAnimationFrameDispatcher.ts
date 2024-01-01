import {WebGLRenderer} from "three";

const callbacks: FrameRequestCallback[] = [];

let dispatcherIsRunning = false;
let renderer: WebGLRenderer;

export const setThreeRenderer = (r: WebGLRenderer)=> {
    renderer = r;
}

export const add = (fn: FrameRequestCallback) => {
    callbacks.push(fn);

    if (!dispatcherIsRunning) {
        renderer.setAnimationLoop(animate);
        dispatcherIsRunning = true;
    }
}


const animate: FrameRequestCallback = (time: DOMHighResTimeStamp) => {
    callbacks.forEach(fn => fn(time));
}
