import * as SPLAT from "gsplat";
import * as RequestAnimationFrameDispatcher from "./util/animationFrameController/RequestAnimationFrameDispatcher.ts";

import {AxisProgram} from "./GSplatPrograms/AxisProgram.ts";
import {GridProgram} from "./GSplatPrograms/GridProgram.ts";

const canvas = document.getElementById("gsplat-canvas") as HTMLCanvasElement;
const progressContainer = document.getElementById("progress-container") as HTMLDivElement;
const progressIndicator = document.getElementById("progress-indicator") as HTMLProgressElement;

export async function gsplatScene() {
    const renderer = new SPLAT.WebGLRenderer(canvas, []);
    renderer.addProgram(new AxisProgram(renderer, []));
    renderer.addProgram(new GridProgram(renderer, []));

    const camera = new SPLAT.Camera();
    const controls = new SPLAT.OrbitControls(camera, canvas);

    // @ts-ignore
    const scene = await loadScene("./bonsai-7k-raw.splat");

    progressContainer.className = "displayNone";

    const handleResize = () => {
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    RequestAnimationFrameDispatcher.add(() => {
        controls.update();
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

    return scene;
}

gsplatScene();
