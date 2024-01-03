import * as CameraOrientationStateDistributor from "./CameraOrientationStateDistributor.ts";
import {isInDebug} from "./debugMode.ts";

export const initPositionDisplay = () => {
    if (!isInDebug) {
        return;
    }

    document.getElementById("debug-information")!.className = "";

    const debugPosX = document.getElementById("debug-pos-x")!;
    const debugPosY = document.getElementById("debug-pos-y")!;
    const debugPosZ = document.getElementById("debug-pos-z")!;

    let positionUpdateCount = 0;
    CameraOrientationStateDistributor.addEventListener((state) => {
        if (positionUpdateCount % 30 == 0) {
            debugPosX.textContent = state.position.x.toFixed(3);
            debugPosY.textContent = state.position.y.toFixed(3);
            debugPosZ.textContent = state.position.z.toFixed(3);

            console.log(state.position);
        }
        positionUpdateCount++;
    });
}