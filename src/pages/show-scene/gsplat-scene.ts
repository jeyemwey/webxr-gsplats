import * as SPLAT from "gsplat";
import * as RequestAnimationFrameDispatcher
    from "../../util/animationFrameController/RequestAnimationFrameDispatcher.ts";
import CameraOrientationStateDistributor
    from "../../util/stateDistributors/CameraOrientationStateDistributor/CameraOrientationStateDistributor.ts";
import CanvasSizeStateDistributor from "../../util/stateDistributors/CanvasSizeStateDistributor.ts";
import MousePositionStateDistributor from "../../util/stateDistributors/MousePositionStateDistributor.ts";
import {AxisProgram} from "../../GSplatPrograms/AxisProgram.ts";
import {GridProgram} from "../../GSplatPrograms/GridProgram.ts";
import {isInDebug} from "./debugMode.ts";
import {setupNewAnnotationRaycaster} from "./raycastController.ts";
import {currentScene} from "../../util/currentScene.ts";
import {scenePreparations} from "../../GSplatPrograms/prepare-scene.ts";

const canvas = document.getElementById("gsplat-canvas") as HTMLCanvasElement;
const progressContainer = document.getElementById("progress-container") as HTMLDivElement;
const progressIndicator = document.getElementById("progress-indicator") as HTMLProgressElement;

export async function gsplatScene(resolveGCameraFuture: (value: SPLAT.Camera) => void) {
    const renderer = new SPLAT.WebGLRenderer(canvas, []);

    setupDebugSignals(renderer);

    const camera = new SPLAT.Camera();
    const controls = new SPLAT.OrbitControls(camera, canvas);

    setupResizeObserver(renderer);
    resolveGCameraFuture(camera);
    dispatchCameraOrientationState(camera);

    setupMouseMovementDispatcher();
    setupNewAnnotationRaycaster(canvas, camera);

    const scene = await loadScene(`./scenes/${currentScene}/scene.splat`);

    RequestAnimationFrameDispatcher.add(() => {
        controls.update();
        dispatchCameraOrientationState(camera);

        renderer.render(scene, camera);
    });
}

async function loadScene(url: string): Promise<SPLAT.Scene> {
    const scene = new SPLAT.Scene();
    await SPLAT.Loader.LoadAsync(
        url,
        scene,
        (progress) => (progressIndicator.value = progress * 100),
        false);

    scenePreparations[currentScene](scene);

    progressContainer.className = "displayNone";
    return scene;
}

function setupDebugSignals(renderer: SPLAT.WebGLRenderer) {
    if (isInDebug) {
        renderer.addProgram(new AxisProgram(renderer, []));
        renderer.addProgram(new GridProgram(renderer, []));
    }
}

function setupResizeObserver(renderer: SPLAT.WebGLRenderer) {
    const resizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
            let width = entry.contentRect.width;
            let height = width * 9 / 16;
            renderer.setSize(width, height);
            CanvasSizeStateDistributor.dispatch({
                width, height
            });
        });
    });
    resizeObserver.observe(document.getElementById("play-area")!);

    const handleResize = () => {
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
}

function dispatchCameraOrientationState(camera: SPLAT.Camera) {
    CameraOrientationStateDistributor.dispatch({
        position: camera.position,
        rotationQuaternion: camera.rotation,
    });
}

function setupMouseMovementDispatcher() {
    canvas.addEventListener("mousemove", function (event) {
        var rect = canvas.getBoundingClientRect();
        var mouseX = event.clientX - rect.left;
        var mouseY = event.clientY - rect.top;

        // Calculate the transformed values in the range [-1, 1]
        const x = (mouseX / canvas.width) * 2 - 1;
        const y = -(mouseY / canvas.height) * 2 + 1;

        MousePositionStateDistributor.dispatch({x, y});
    });
}
