import CameraOrientationStateDistributor from "./CameraOrientationStateDistributor.ts";
import {isInDebug} from "../../../pages/show-scene/debugMode.ts";
import {vec3GsplatToThree} from "../../vectorUtils.ts";

export const initPositionDisplay = () => {
    if (!isInDebug) {
        return;
    }

    document.getElementById("debug-information")!.className = "";

    const debugPosGsplatX = document.getElementById("debug-pos-gsplat-x")!;
    const debugPosGsplatY = document.getElementById("debug-pos-gsplat-y")!;
    const debugPosGsplatZ = document.getElementById("debug-pos-gsplat-z")!;

    const debugPosThreeX = document.getElementById("debug-pos-three-x")!;
    const debugPosThreeY = document.getElementById("debug-pos-three-y")!;
    const debugPosThreeZ = document.getElementById("debug-pos-three-z")!

    let positionUpdateCount = 0;
    CameraOrientationStateDistributor.addEventListener((state) => {
        if (positionUpdateCount % 1000 == 0) {
            debugPosGsplatX.textContent = state.position.x.toFixed(3);
            debugPosGsplatY.textContent = state.position.y.toFixed(3);
            debugPosGsplatZ.textContent = state.position.z.toFixed(3);

            const [threeX, threeY, threeZ] = vec3GsplatToThree(state.position).toArray();
            debugPosThreeX.textContent = threeX.toFixed(3);
            debugPosThreeY.textContent = threeY.toFixed(3);
            debugPosThreeZ.textContent = threeZ.toFixed(3);

            console.table(state);
        }
        positionUpdateCount++;
    });
}