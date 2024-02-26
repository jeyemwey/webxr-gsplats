import * as THREE from "three";
import * as YUKA from "yuka";
import {isInDebug} from "./debugMode.ts";

import * as RequestAnimationFrameDispatcher
    from "../../util/animationFrameController/RequestAnimationFrameDispatcher.ts";
import CameraOrientationStateDistributor
    from "../../util/stateDistributors/CameraOrientationStateDistributor/CameraOrientationStateDistributor.ts";
import CanvasSizeStateDistributor from "../../util/stateDistributors/CanvasSizeStateDistributor.ts";
import AnnotationsStateDistributor from "../../util/stateDistributors/AnnotationsStateDistributor.ts";
import MousePositionStateDistributor from "../../util/stateDistributors/MousePositionStateDistributor.ts";

// @ts-ignore
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
// @ts-ignore
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
// @ts-ignore
import {CSS2DObject, CSS2DRenderer} from "three/examples/jsm/renderers/CSS2DRenderer";

import {allAnnotations, Annotation, Id} from "../../comments/annotations-storage.ts";
import {assignThreeVector, getCameraFOV, vec3GsplatToThree} from "../../util/vectorUtils.ts";
import {Camera} from "gsplat";
import {addHelpfulArrow} from "../../GSplatPrograms/prepare-scene.ts";

export async function threeScene(gCameraFuture: Promise<Camera>) {
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
    });
    const canvas = setupCanvas(renderer);
    renderer.setClearColor(0xa3a3a3, 0.1);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    const scene = new THREE.Scene();
    setupSceneLights(scene);
    setupDebugSignals(scene);

    const camera = await setupCamera(gCameraFuture, canvas, scene);
    const labelRenderer = setupLabelRenderer(canvas);
    setupCanvasSizeUpdater(camera, renderer, labelRenderer);

    const entityManager = setupOptionalSunflower(scene);
    const group = setupAnnotationMarkers(scene);
    setupAnnotationRaycaster(camera, group);

    // For each frame, run the following
    const time = new YUKA.Time();
    RequestAnimationFrameDispatcher.setThreeRenderer(renderer);
    RequestAnimationFrameDispatcher.add(() => {
        const delta = time.update().getDelta();
        entityManager.update(delta);
        labelRenderer.render(scene, camera);

        renderer.render(scene, camera);
    });
}

function setupCanvas(renderer: THREE.WebGLRenderer) {
    const canvas = renderer.domElement;
    canvas.className = "over-previous";
    canvas.style.zIndex = "6";
    document.getElementById("three-container")!.appendChild(canvas);
    return canvas;
}

function setupSceneLights(scene: THREE.Scene) {
    [
        new THREE.Vector3(0, 1, 3),
        new THREE.Vector3(-3, -1, -3)
    ].forEach((pos) => {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);

        assignThreeVector(directionalLight.position, pos);
        scene.add(directionalLight);
    });
}

function setupDebugSignals(scene: THREE.Scene) {
    if (isInDebug) {
        const axesHelper = new THREE.AxesHelper(5);
        scene.add(axesHelper);

        const gridHelper = new THREE.GridHelper(100, 100, 0x00ff00, 0x00ff00);
        scene.add(gridHelper);
    }
}

async function setupCamera(gCameraFuture: Promise<Camera>, canvas: HTMLCanvasElement, scene: THREE.Scene) {
    const gCamera = await gCameraFuture;
    console.log(`awaited gcamera, got fov ${getCameraFOV(gCamera)}deg from it.`)

    const camera = new THREE.PerspectiveCamera(
        getCameraFOV(gCamera),
        canvas.clientWidth / canvas.clientHeight,
        .1,
        1000,
    );

    camera.lookAt(scene.position);
    CameraOrientationStateDistributor.addEventListener((newState) => {
        const newPosition = vec3GsplatToThree(newState.position);
        assignThreeVector(camera.position, newPosition);
        camera.lookAt(scene.position);
    });
    return camera;
}

function setupLabelRenderer(canvas: HTMLCanvasElement) {
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
    labelRenderer.domElement.id = "overlay-labelRenderer";
    document.getElementById("three-container")!.append(labelRenderer.domElement);
    return labelRenderer;
}

function setupCanvasSizeUpdater(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, labelRenderer: CSS2DRenderer) {
    CanvasSizeStateDistributor.addEventListener(({width, height}) => {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        labelRenderer.setSize(width, height);
    });
}

function setupOptionalSunflower(scene: THREE.Scene) {
    const entityManager = new YUKA.EntityManager();
    if (isInDebug) {
        const sunflower = new YUKA.Vehicle();
        const bonsaiP = document.createElement("p");
        bonsaiP.className = "tooltip show";
        bonsaiP.textContent = `Bonsai`;
        const bonsaiLabel = new CSS2DObject(bonsaiP);
        bonsaiLabel.position.set(0, 0.75, 0);

        const loader = new GLTFLoader();
        // @ts-ignore
        loader.load("./sunflower.gltf", function (glb) {
            const model = glb.scene;
            scene.add(model);
            model.matrixAutoUpdate = false;

            // @ts-ignore
            sunflower.position.set(0, 0, 0);
            sunflower.scale = new YUKA.Vector3(2, 2, 2);
            sunflower.rotateTo(new YUKA.Vector3(-1, 0, 0), Math.PI);

            sunflower.setRenderComponent(model, function (entity, renderComponent) {
                renderComponent.matrix.copy(entity.worldMatrix);
            });
            entityManager.add(sunflower);

            model.add(bonsaiLabel);
        });
    }
    return entityManager;
}

function setupAnnotationMarkers(scene: THREE.Scene) {
    function createSphere(name: Id | string, position: THREE.Vector3) {
        const geo = new THREE.SphereGeometry(0.1);
        const mat = new THREE.MeshBasicMaterial({color: 0xff0000});
        const mesh = new THREE.Mesh(geo, mat);
        assignThreeVector(mesh.position, position);
        mesh.name = `${name}`;
        return mesh;
    }

    const group = new THREE.Group();
    scene.add(group);

    const tooltipYOffset = new THREE.Vector3(0, 0.3, 0);
    const addAnnotationsToCanvas = (allAnnotations: Annotation[]) => {
        allAnnotations.forEach(a => {
            let position = vec3GsplatToThree(a.position);
            group.add(createSphere(a.id, position));

            const tooltip = document.createElement("p");
            tooltip.className = "tooltip show";
            tooltip.textContent = a.title;
            const tooltip2dObject = new CSS2DObject(tooltip);

            assignThreeVector(tooltip2dObject.position, position.clone().add(tooltipYOffset));
            scene.add(tooltip2dObject);
        });
    };

    addAnnotationsToCanvas(allAnnotations);
    addHelpfulArrow(scene);

    AnnotationsStateDistributor.addEventListener(() => {
        group.clear();
        addAnnotationsToCanvas(allAnnotations);
    });
    return group;
}

function setupAnnotationRaycaster(camera: THREE.PerspectiveCamera, group: THREE.Group<THREE.Object3DEventMap>) {
    const mousePos = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    MousePositionStateDistributor.addEventListener(({x, y}) => {
        mousePos.x = x;
        mousePos.y = y;

        raycaster.setFromCamera(mousePos, camera);
        const intersects = raycaster.intersectObject(group);
        if (intersects.length > 0) {
            console.log(`intersected with annotation #${intersects[0].object.name}`);
            const maybeAnnotation = allAnnotations.find((a) => a.id.toString() == intersects[0].object.name);
            if (maybeAnnotation) {
                // @ts-ignore
                window.setActiveAnnotationId(maybeAnnotation.id);
            }
        }
    });
}
