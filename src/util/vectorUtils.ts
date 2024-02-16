import {Vector3 as TVector3} from "three";
import {Camera as GCamera, Matrix4, Vector3 as GVector3} from "gsplat";

const gsplatToThree = new Matrix4(
    -1, 0, 0, 0,
    0, -1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1);

export const vec3GsplatToThree = (input: GVector3): TVector3 => {
    const transformed = input.multiply(gsplatToThree);

    return new TVector3(transformed.x, transformed.y, transformed.z);
}

export const assignThreeVector = (base: TVector3, newValues: TVector3): void => {
    base.set(newValues.x, newValues.y, newValues.z);
}

/**
 * Return Field of View of a standard GCamera in degrees.
 *
 * @see https://stackoverflow.com/a/46195462
 **/
export const getCameraFOV = (_camera: GCamera): number =>{
    // const camera_data = camera.data;
    // const fov = 180 - (2* Math.atan((2 * camera_data.fy) / camera_data.height) * 180.0) / Math.PI;
    // return fov;

    // TODO: Replace with real FOV calculation. We had that working, but it is somehow weird now.
    return 41.8;
}