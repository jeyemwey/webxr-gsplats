type CameraState = {
    position: { x: number, y: number, z: number };
    rotationQuaternion: number[]; // xyzw
};

type CameraStateEventListener = (newState: CameraState) => void;

const listener: CameraStateEventListener[] = [];

export const addEventListener = (l: CameraStateEventListener) => listener.push(l);

export const dispatch = (state: CameraState) => {
    listener.forEach(l => l(state));
}
