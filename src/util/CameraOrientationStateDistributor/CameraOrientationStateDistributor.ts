import {Quaternion, Vector3} from "gsplat";

type CameraState = {
    position: Vector3;
    rotationQuaternion: Quaternion;
};

type CameraStateEventListener = (newState: CameraState) => void;

const listener: CameraStateEventListener[] = [];

export const addEventListener = (l: CameraStateEventListener) => listener.push(l);

export const dispatch = (state: CameraState) => {
    listener.forEach(l => l(state));
}
