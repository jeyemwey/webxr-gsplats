import {Quaternion, Vector3} from "gsplat";
import AbstractStateDistributor from "../AbstractStateDistributor.ts";

type CameraState = {
    position: Vector3;
    rotationQuaternion: Quaternion;
};

const instance = new class CameraOrientationStateDistributor extends AbstractStateDistributor<CameraState> {
}();

export default instance;