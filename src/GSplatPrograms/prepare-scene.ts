import * as SPLAT from "gsplat";
import {AvailableScenes} from "../comments/annotations-storage.ts";
import {Quaternion, Vector3} from "gsplat";
import {vec3GsplatToThree} from "../util/vectorUtils.ts";
import * as THREE from "three";

const DEG2RAD = Math.PI / 180;

type SceneTranslation = (scene: SPLAT.Scene) => any;

const identity = <T>(x: T) => /* NOP */ x;

/**
 * We observe that scenes may not be presented correctly initially. To prevent
 * this, we have a list of modifiers that transform the scene before
 * displaying it.
 */
export const scenePreparations: { [K in AvailableScenes]: SceneTranslation; } = {
    bonsai: identity,
    wohnzimmerAntimatter15: (scene: SPLAT.Scene): void => {
        scene.objects[0].rotation = Quaternion.FromAxisAngle(new Vector3(1, 0, 0), DEG2RAD * 87);
        scene.objects[0].applyRotation();
        scene.objects[0].rotation = Quaternion.FromAxisAngle(new Vector3(0, 0, 1), DEG2RAD * 10);
        scene.objects[0].applyRotation();
        scene.objects[0].rotation = Quaternion.FromAxisAngle(new Vector3(0, 1, 0), DEG2RAD * 70);
    },
    wohnzimmerPolycam: (scene: SPLAT.Scene): void => {
        scene.objects[0].rotation = Quaternion.FromAxisAngle(new Vector3(0, 0, 1), DEG2RAD * 10);
        scene.objects[0].applyRotation();
        scene.objects[0].rotation = Quaternion.FromAxisAngle(new Vector3(0, 1, 0), DEG2RAD * 70);
    },
    garden: (scene: SPLAT.Scene): void => {
        scene.objects[0].rotation = Quaternion.FromAxisAngle(new Vector3(1, 0, 0), DEG2RAD * -30);
        scene.objects[0].position = scene.objects[0].position.add(new Vector3(-0.5, -2.75, 0));
    },
    bicycle: (scene: SPLAT.Scene): void => {
        scene.objects[0].rotation = Quaternion.FromAxisAngle(new Vector3(1, -.2, 0), DEG2RAD * -14);
        scene.objects[0].position = scene.objects[0].position.add(new Vector3(0, -1, 0));
    }
};

type PositionModification = (vec: Vector3) => Vector3;

export const splatPositionModification: { [K in AvailableScenes]: PositionModification; } = {
    bonsai: identity,
    wohnzimmerAntimatter15: (vec) => {
        let tmp = Quaternion.FromAxisAngle(new Vector3(1, 0, 0), DEG2RAD * 87).apply(vec);
        tmp = Quaternion.FromAxisAngle(new Vector3(0, 0, 1), DEG2RAD * 10).apply(tmp);
        return Quaternion.FromAxisAngle(new Vector3(0, 1, 0), DEG2RAD * 70).apply(tmp);
    },
    wohnzimmerPolycam: (vec) => {
        let tmp = Quaternion.FromAxisAngle(new Vector3(0, 0, 1), DEG2RAD * 10).apply(vec);
        return Quaternion.FromAxisAngle(new Vector3(0, 1, 0), DEG2RAD * 70).apply(tmp);
    },
    garden: (vec) => {
        return Quaternion
            .FromAxisAngle(new Vector3(1, 0, 0), DEG2RAD * -30)
            .apply(vec)
            .add(new Vector3(-0.5, -2.75, 0));
    },
    bicycle: (vec) => {
        return Quaternion
            .FromAxisAngle(new Vector3(1, -.2, 0), DEG2RAD * -14)
            .apply(vec)
            .add(new Vector3(0, -1, 0));
    },
}

/**
 * Use this function to add a helpful arrow to the scene which will denote the
 * axis angle or whatever.
 */
export const addHelpfulArrow = (scene: THREE.Scene) => {
    const isActive = false;

    if (!isActive) {
        return;
    }

    const direction = vec3GsplatToThree(new Vector3(1, -.2, 0)).normalize();
    const arrow = new THREE.ArrowHelper(direction, new THREE.Vector3(0, 0, 0), 1);
    scene.add(arrow);
}
