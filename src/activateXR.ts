// @ts-ignore
import type {Navigator} from 'webxr';

import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export const activateXR = (canvas: HTMLCanvasElement, gl: WebGL2RenderingContext) => async () => {
    if (!navigator.xr) {
        console.error("The browser does not have an XR component.");
        return;
    }

    const session = await navigator.xr.requestSession("immersive-ar", {requiredFeatures: []});
    if (!session) {
        return console.error("Unable to create XR session.");
    }
    await session.updateRenderState({baseLayer: new XRWebGLLayer(session, gl)});

    const referenceSpace = await session.requestReferenceSpace("local");

    // Create a Scene
    const scene = new THREE.Scene();

    // Render Session Base Layer with ThreeJS
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        preserveDrawingBuffer: true,
        canvas: canvas,
        context: gl
    });
    renderer.autoClear = false;

    // Set up a perspective Camera
    const camera = new THREE.PerspectiveCamera();
    camera.matrixAutoUpdate = false;


    const onXrFrame = (_time: DOMHighResTimeStamp, frame: XRFrame) => {
        // Queue up the next frame
        session.requestAnimationFrame(onXrFrame);
        gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer!.framebuffer);

        const pose = frame.getViewerPose(referenceSpace);
        if (pose) {
            // in mobile AR, there is only one view
            const view = pose.views[0];

            fetch("/wurst/" + JSON.stringify(view));

            // Update the Camera
            camera.matrix.fromArray(view.transform.matrix);
            camera.projectionMatrix.fromArray(view.projectionMatrix);
            camera.updateMatrixWorld(true);

            renderer.render(scene, camera);
        }


    };
    session.requestAnimationFrame(onXrFrame);
};