type CameraState = {
    position: { x: Number, y: Number, z: Number };
};

type CameraStateEventListener = (newState: CameraState) => void;

const listener: CameraStateEventListener[] = [];

export const addEventListener = (l: CameraStateEventListener) => listener.push(l);

export const dispatch = (state: CameraState) => {
    listener.forEach(l => l(state));
}
