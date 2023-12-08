import {activateXR} from "./activateXR.ts";

async function main() {
    const canvas = document.getElementById("canvas");
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        console.error("Unable to find canvas in document.");
        return;
    }

    const gl = canvas.getContext("webgl", {xrCompatible: true});
    if (!gl) {
        console.error("Unable to get WebGL context");
        return;
    }

    console.log("ready to play xr.");

    const startButton = document.getElementById("start-xr-button");
    if (!startButton) {
        console.error("Unable to find Start-XR-Button.");
        return;
    }
    startButton.addEventListener("click", activateXR(canvas, gl));

}

main();
