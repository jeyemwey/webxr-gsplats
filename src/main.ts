import {car} from "./car.ts";
import {gsplatScene} from "./gsplat-scene.ts";
import {isInDebug} from "./debugMode.ts";
import {initPositionDisplay} from "./util/CameraOrientationStateDistributor/positionDisplay.ts";

car()
gsplatScene()
initPositionDisplay()

console.log({isInDebug});