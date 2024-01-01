/**
 * There can only be one call to `window.requestAnimationFrame/1` at a time,
 * because the callback `/1` will call itself. To resolve conflicts with
 * multiple renderers, this utility keeps track of all render functions and
 * calls them after another (because it's JavaScript, there is no parallelism
 * anyway).
 *
 * You can push a rendering callback function (type of FrameRequestCallback) to
 * the list by calling `add/1`.
 *
 * The function `setThreeRenderer` can also set the `THREE.WebGLRenderer` which
 * is required for the THREE-scenes, since it will add THREE magic. If that
 * renderer is not set, a `StubAnimationLoopHolder` is used which is just a
 * wrapper to `window.requestAnimationFrame/1` that adheres to THREE's
 * `setAnimationLoop` API.
 */

import {WebGLRenderer} from "three";
import {AnimationLoopHolder, StubAnimationLoopHolder} from "./AnimationLoopHolder.ts";

const callbacks: FrameRequestCallback[] = [];

let dispatcherIsRunning = false;
let renderer: AnimationLoopHolder = new StubAnimationLoopHolder();

export const setThreeRenderer = (r: WebGLRenderer) => {
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
