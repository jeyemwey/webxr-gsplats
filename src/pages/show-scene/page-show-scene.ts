import {threeScene} from "./three-scene.ts";
import {gsplatScene} from "./gsplat-scene.ts";
import {isInDebug} from "./debugMode.ts";
import {initPositionDisplay} from "../../util/stateDistributors/CameraOrientationStateDistributor/positionDisplay.ts";
import {initComments} from "../../comments/init.tsx";
import {future} from "../../util/Future.ts";
import {CanvasSize} from "../../util/stateDistributors/CanvasSizeStateDistributor.ts";


const {resolve: resolveCanvasSize, future: canvasSizeFuture} = future<CanvasSize>();

gsplatScene(resolveCanvasSize)
threeScene(canvasSizeFuture)
initPositionDisplay()
initComments(document.getElementById("comment-section")!)

console.log({isInDebug});