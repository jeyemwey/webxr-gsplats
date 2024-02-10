import {Vector3 as TVector3} from "three";
import {Matrix4, Vector3 as GVector3} from "gsplat";

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