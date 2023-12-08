// @ts-ignore
import type {Navigator} from 'webxr';

export const activateXR = (canvas: HTMLCanvasElement, gl: WebGLRenderingContext) => async () => {
    if (!navigator.xr) {
        console.error("The browser does not have an XR component.");
        return;
    }

    const session = await navigator.xr.requestSession("immersive-ar", {requiredFeatures: []});
    if (!session) {
        return console.error("Unable to create XR session.");
    }
    session.updateRenderState({baseLayer: new XRWebGLLayer(session, gl)});

    const referenceSpace = await session.requestReferenceSpace("local-floor");

    const onXrFrame = (_time: DOMHighResTimeStamp, frame: XRFrame) => {
        // Queue up the next frame
        session.requestAnimationFrame(onXrFrame);
        gl.bindBuffer(gl.FRAMEBUFFER, session.renderState.baseLayer!.framebuffer);

        const pose = frame.getViewerPose(referenceSpace);
        if (pose) {
            // in mobile AR, there is only one view
            const view = pose.views[0];

            fetch("/wurst/" + JSON.stringify(view));
        }


    };
    session.requestAnimationFrame(onXrFrame);
};