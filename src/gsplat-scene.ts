import * as SPLAT from "gsplat";
import * as RequestAnimationFrameDispatcher from "./util/animationFrameController/RequestAnimationFrameDispatcher.ts";
import CameraOrientationStateDistributor
    from "./util/CameraOrientationStateDistributor/CameraOrientationStateDistributor.ts";
import MousePositionStateDistributor from "./util/MousePositionStateDistributor.ts";
import {AxisProgram} from "./GSplatPrograms/AxisProgram.ts";
import {GridProgram} from "./GSplatPrograms/GridProgram.ts";
import {isInDebug} from "./debugMode.ts";
import {enableRaycastListener} from "./raycastController.ts";
import {currentScene} from "./util/currentScene.ts";
import {scenePreparations} from "./GSplatPrograms/prepare-scene.ts";
import CanvasSizeStateDistributor from "./util/CanvasSizeStateDistributor.ts";

const canvas = document.getElementById("gsplat-canvas") as HTMLCanvasElement;
const progressContainer = document.getElementById("progress-container") as HTMLDivElement;
const progressIndicator = document.getElementById("progress-indicator") as HTMLProgressElement;

export async function gsplatScene(resolveGCamera: (value: SPLAT.Camera) => void) {
    const renderer = new SPLAT.WebGLRenderer(canvas, []);

    if (isInDebug) {
        renderer.addProgram(new AxisProgram(renderer, []));
        renderer.addProgram(new GridProgram(renderer, []));
    }

    const camera = new SPLAT.Camera();
    const controls = new SPLAT.OrbitControls(camera, canvas);

    // @ts-ignore
    const scene = await loadScene(`./scenes/${currentScene}/scene.splat`);
    scenePreparations[currentScene](scene);

    progressContainer.className = "displayNone";

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
    resolveGCamera(camera);

    function dispatchCameraOrientationState() {
        CameraOrientationStateDistributor.dispatch({
            position: camera.position,
            rotationQuaternion: camera.rotation,

        });
    }

    dispatchCameraOrientationState();

    RequestAnimationFrameDispatcher.add(() => {
        controls.update();
        dispatchCameraOrientationState();

        renderer.render(scene, camera);
    });

    enableRaycastListener(canvas, camera);

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

async function loadScene(url: string): Promise<SPLAT.Scene> {
    const scene = new SPLAT.Scene();
    await SPLAT.Loader.LoadAsync(
        url,
        scene,
        (progress) => (progressIndicator.value = progress * 100),
        false);

    return scene;
}