import {threeScene} from "./three-scene.ts";
import {gsplatScene} from "./gsplat-scene.ts";
import {isInDebug} from "./debugMode.ts";
import {initPositionDisplay} from "../../util/stateDistributors/CameraOrientationStateDistributor/positionDisplay.ts";
import {initComments} from "../../comments/init.tsx";
import {future} from "../../util/Future.ts";

import {Camera as GCamera} from "gsplat";

const {resolve: resolveGCamera, future: gCameraFuture} = future<GCamera>();

gsplatScene(resolveGCamera)
threeScene(gCameraFuture)
initPositionDisplay()
initComments(document.getElementById("comment-section")!)

console.log({isInDebug});