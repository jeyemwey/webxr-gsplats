// @ts-ignore
import type {Navigator} from 'webxr';

import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export const activateXR = (canvas: HTMLCanvasElement, gl: WebGL2RenderingContext) => async () => {
    if (!navigator.xr) {
        console.error("The browser does not have an XR component.");
        return;
    }

    const session = await navigator.xr.requestSession("immersive-ar", {requiredFeatures: ["hit-test"]});
    if (!session) {
        return console.error("Unable to create XR session.");
    }
    await session.updateRenderState({baseLayer: new XRWebGLLayer(session, gl)});

    const referenceSpace = await session.requestReferenceSpace("local");

    if (!session.requestHitTestSource) {
        return console.error("Unable to create XR session because the HitTestSource is not defined.");
    }
    const hitTestSource = await session.requestHitTestSource({space: await session.requestReferenceSpace("viewer")});
    if (!hitTestSource) {
        return console.error("Unable to get hitTestSource.");
    }

    // Create a Scene
    const scene = new THREE.Scene();
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(10, 15, 10);
    scene.add(directionalLight);

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

    // Load flower and add to scene, so we can check if scene magic works
    const loader = new GLTFLoader();
    loader.load("https://immersive-web.github.io/webxr-samples/media/gltf/sunflower/sunflower.gltf",
        (result) => scene.add(result.scene),
        undefined,
        (error) => console.log(`Unable to load Sunflower. ${error}`));

    let reticle: THREE.Group;
    loader.load("https://immersive-web.github.io/webxr-samples/media/gltf/reticle/reticle.gltf",
        (result) => {
            reticle = result.scene;
            reticle.visible = false;
            scene.add(reticle);
        },
        undefined,
        (error) => console.log(`Unable to load Reticle. ${error}`));

    let i = 0;
    const onXrFrame = (_time: DOMHighResTimeStamp, frame: XRFrame) => {
        // Queue up the next frame
        session.requestAnimationFrame(onXrFrame);
        gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer!.framebuffer);

        const pose = frame.getViewerPose(referenceSpace);
        if (pose) {
            // in mobile AR, there is only one view
            const view = pose.views[0];

            // Update viewport
            const viewport = session.renderState.baseLayer!.getViewport(view);
            if (viewport) {
                renderer.setSize(viewport.width, viewport.height);
            } else {
                console.error("Unable to get viewport.");
            }

            // Log out the view every hundreds frame
            if (i++ % 100 === 0) {
                console.log(view);
            }

            // Work with Hit Test Results
            const hitTestResults = frame.getHitTestResults(hitTestSource);
            if (hitTestResults.length && reticle) {
                const hitpose = hitTestResults[0].getPose(referenceSpace)!;
                reticle.visible = true;
                reticle.position.set(hitpose.transform.position.x, hitpose.transform.position.y, hitpose.transform.position.z);
                reticle.updateMatrixWorld(true);
            }

            // Update the Camera
            camera.matrix.fromArray(view.transform.matrix);
            camera.projectionMatrix.fromArray(view.projectionMatrix);
            camera.updateMatrixWorld(true);

            renderer.render(scene, camera);
        } else {
            console.debug("Unable to find pose, dropping frame");
        }
    };
    session.requestAnimationFrame(onXrFrame);
};