import {threeScene} from "./three-scene.ts";
import {gsplatScene} from "./gsplat-scene.ts";
import {isInDebug} from "./debugMode.ts";
import {initPositionDisplay} from "./util/CameraOrientationStateDistributor/positionDisplay.ts";
import {initComments} from "./comments/init.tsx";

threeScene()
gsplatScene()
initPositionDisplay()
initComments(document.getElementById("comment-section")!)

console.log({isInDebug});