import * as THREE from "three";
import * as YUKA from "yuka";
import {isInDebug} from "./debugMode.ts";

import * as CameraOrientationStateDistributor
    from "./util/CameraOrientationStateDistributor/CameraOrientationStateDistributor.ts";
import * as RequestAnimationFrameDispatcher from "./util/animationFrameController/RequestAnimationFrameDispatcher.ts";
import * as CommentStateDistributor from "./util/CommentStateDistributor.ts";

// @ts-ignore
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
// @ts-ignore
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
// @ts-ignore
import {CSS2DObject, CSS2DRenderer} from "three/examples/jsm/renderers/CSS2DRenderer";

import {allAnnotations, Annotation} from "./comments/annotations-storage.ts";
import {assignThreeVector, getCameraFOV, vec3GsplatToThree} from "./util/vectorUtils.ts";
import {Camera} from "gsplat";
import {addHelpfulArrow} from "./GSplatPrograms/prepare-scene.ts";

export async function threeScene(gCameraFuture: Promise<Camera>) {
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
    });

    const canvas = renderer.domElement;
    canvas.className = "over-previous";
    canvas.style.zIndex = "6";
    document.getElementById("three-container")!.appendChild(canvas);

    renderer.setClearColor(0xa3a3a3, 0.1);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    const scene = new THREE.Scene();

    if (isInDebug) {
        const axesHelper = new THREE.AxesHelper(5);
        axesHelper.position.add(new THREE.Vector3(0.0, 0.0, 0.0));
        scene.add(axesHelper);

        const gridHelper = new THREE.GridHelper(100, 100, 0x00ff00, 0x00ff00);
        gridHelper.position.add(new THREE.Vector3(0.0, 0.2, 0.0));
        scene.add(gridHelper);
    }

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

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
    labelRenderer.domElement.id = "overlay-labelRenderer";
    document.getElementById("three-container")!.append(labelRenderer.domElement);

    const resizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
            labelRenderer.setSize(entry.contentRect.width, entry.contentRect.width * 9 / 16);
            renderer.setSize(entry.contentRect.width, entry.contentRect.width * 9 / 16, false);
        });
    });
    resizeObserver.observe(document.getElementById("play-area")!);


    {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 1, 3);
        scene.add(directionalLight);
    }

    {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
        directionalLight.position.set(-3, -1, -3);
        scene.add(directionalLight);
    }

    const sunflower = new YUKA.Vehicle();
    // @ts-ignore
    sunflower.position.set(0, 0, 0);

    const entityManager = new YUKA.EntityManager();
    entityManager.add(sunflower);

    // @ts-ignore
    function createCpointMesh(name: Id | string, position: THREE.Vector3) {
        const geo = new THREE.SphereGeometry(0.1);
        const mat = new THREE.MeshBasicMaterial({color: 0xff0000});
        const mesh = new THREE.Mesh(geo, mat);
        assignThreeVector(mesh.position, position);
        mesh.name = name;
        return mesh;
    }

    const group = new THREE.Group();
    scene.add(group);

    const tooltipYOffset = new THREE.Vector3(0, 0.3, 0);
    const addAnnotationsToCanvas = (allAnnotations: Annotation[]) => {
        allAnnotations.forEach(a => {
            let position = vec3GsplatToThree(a.position);
            group.add(createCpointMesh(a.id, position));

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

    CommentStateDistributor.addEventListener(() => {
        group.clear();
        addAnnotationsToCanvas(allAnnotations);
    });

    const p = document.createElement("p");
    p.className = "tooltip";
    const pContainer = document.createElement("div");
    pContainer.append(p);
    const cPointLabel = new CSS2DObject(p);
    scene.add(cPointLabel);

    const mousePos = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    canvas.addEventListener("mousemove", function (event) {
        var rect = canvas.getBoundingClientRect();
        var mouseX = event.clientX - rect.left;
        var mouseY = event.clientY - rect.top;

        // Calculate the transformed values in the range [-1, 1]
        mousePos.x = (mouseX / canvas.width) * 2 - 1;
        mousePos.y = -(mouseY / canvas.height) * 2 + 1;

        raycaster.setFromCamera(mousePos, camera);
        const intersects = raycaster.intersectObject(group);
        if (intersects.length > 0) {
            // p.className = "tooltip show";
            p.textContent = intersects[0].object.name;
            const {x, y, z} = intersects[0].object.position;
            cPointLabel.position.set(x, y + 0.2, z);

            console.log(intersects[0].object.name);

            const maybeAnnotation = allAnnotations.find((a) => a.id.toString() == intersects[0].object.name);
            if (maybeAnnotation) {
                // @ts-ignore
                window.setActiveAnnotationId(maybeAnnotation.id);
            }
        } else {
            p.className = "tooltip hide";
        }
    });

    const bonsaiP = document.createElement("p");
    bonsaiP.className = "tooltip show";
    const bonsaiLabel = new CSS2DObject(bonsaiP);
    bonsaiLabel.position.set(0, 0.75, 0);


    const loader = new GLTFLoader();
    // @ts-ignore
    loader.load("./sunflower.gltf", function (glb) {
        const model = glb.scene;
        scene.add(model);
        model.matrixAutoUpdate = false;
        sunflower.scale = new YUKA.Vector3(2, 2, 2);
        sunflower.rotateTo(new YUKA.Vector3(-1, 0, 0), Math.PI);

        sunflower.setRenderComponent(model, function (entity, renderComponent) {
            renderComponent.matrix.copy(entity.worldMatrix);
        });

        model.add(bonsaiLabel);
    });

    const time = new YUKA.Time();

    RequestAnimationFrameDispatcher.setThreeRenderer(renderer);
    RequestAnimationFrameDispatcher.add(() => {
        const delta = time.update().getDelta();
        entityManager.update(delta);
        labelRenderer.render(scene, camera);

        bonsaiP.textContent = `Bonsai`;
        renderer.render(scene, camera);
    });

    window.addEventListener("resize", function () {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        labelRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
}
