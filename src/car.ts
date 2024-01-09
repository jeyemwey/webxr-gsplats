import * as THREE from "three";
import * as YUKA from "yuka";
import {isInDebug} from "./debugMode.ts";

import * as CameraOrientationStateDistributor
    from "./util/CameraOrientationStateDistributor/CameraOrientationStateDistributor.ts";
import * as RequestAnimationFrameDispatcher from "./util/animationFrameController/RequestAnimationFrameDispatcher.ts";

// @ts-ignore
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
// @ts-ignore
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
// @ts-ignore
import {CSS2DObject, CSS2DRenderer} from "three/examples/jsm/renderers/CSS2DRenderer";
import {Quaternion} from "three";

export async function car() {
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
    });

    const canvas = renderer.domElement;
    canvas.className = "over-previous";
    canvas.style.zIndex = "3";
    document.getElementById("three-container")!.appendChild(canvas);

    renderer.setClearColor(0xa3a3a3, 0.1);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const scene = new THREE.Scene();

    if (isInDebug) {
        const axesHelper = new THREE.AxesHelper(5);
        axesHelper.position.add(new THREE.Vector3(0, 1, 0));
        scene.add(axesHelper);
        const gridHelper = new THREE.GridHelper(100, 100, 0xff0000, 0x808080);
        scene.add(gridHelper);
    }

    const camera = new THREE.PerspectiveCamera(
        45,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000,
    );

    // @ts-ignore
    window.postQuad = () =>{
        const q = new Quaternion();
        q.setFromEuler(camera.rotation);
        console.log(q);
    };

    // camera.position.set(0, 10, 15);
    // camera.lookAt(scene.position);
    CameraOrientationStateDistributor.addEventListener((newState) => {
        camera.position.set(
            -1 * newState.position.x,
            -1 * newState.position.y,
            newState.position.z);

        // {
        //     const [x, y, z, w] = newState.rotationQuaternion;
        //     camera.rotation.setFromQuaternion(new Quaternion(x, -y, z, w));
        // }
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
    labelRenderer.domElement.id = "overlay-labelRenderer";
    document.getElementById("three-container")!.append(labelRenderer.domElement);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);

    const vehicle = new YUKA.Vehicle();
    // @ts-ignore
    vehicle.position.set(0, 0, 0);

    const entityManager = new YUKA.EntityManager();
    entityManager.add(vehicle);

    // @ts-ignore
    function createCpointMesh(name, x, y, z) {
        const geo = new THREE.SphereGeometry(0.1);
        const mat = new THREE.MeshBasicMaterial({color: 0xff0000});
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.name = name;
        return mesh;
    }

    const group = new THREE.Group();
    group.add(createCpointMesh("sphereMesh1", -6, 0, 4));
    group.add(createCpointMesh("sphereMesh2", -12, 0, 0));
    group.add(createCpointMesh("sphereMesh3", -6, 0, -12));
    group.add(createCpointMesh("sphereMesh4", 0, 0, 0));
    group.add(createCpointMesh("sphereMesh5", 8, 0, -8));
    group.add(createCpointMesh("sphereMesh6", 10, 0, 0));
    group.add(createCpointMesh("sphereMesh7", 4, 0, 4));
    group.add(createCpointMesh("sphereMesh8", 0, 0, 6));
    scene.add(group);

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
            p.className = "tooltip show";
            p.textContent = intersects[0].object.name;
            const {x, y, z} = intersects[0].object.position;
            cPointLabel.position.set(x, y + 1, z);

            if (intersects[0].object.name === "sphereMesh8") {
                // @ts-ignore
                window.setActiveAnnotationId(1);
            }
        } else {
            p.className = "tooltip hide";
        }
    });

    const carP = document.createElement("p");
    carP.className = "tooltip show";
    const carLabel = new CSS2DObject(carP);
    carLabel.position.set(0, 4, 0);

    const loader = new GLTFLoader();
    // @ts-ignore
    loader.load("./SUV.glb", function (glb) {
        const model = glb.scene;
        scene.add(model);
        model.matrixAutoUpdate = false;
        vehicle.scale = new YUKA.Vector3(0.5, 0.5, 0.5);
        vehicle.setRenderComponent(model, function (entity, renderComponent) {
            renderComponent.matrix.copy(entity.worldMatrix);
        });

        model.add(carLabel);
    });

    const time = new YUKA.Time();

    RequestAnimationFrameDispatcher.setThreeRenderer(renderer);
    RequestAnimationFrameDispatcher.add(() => {
        const delta = time.update().getDelta();
        entityManager.update(delta);
        labelRenderer.render(scene, camera);

        carP.textContent = `The car`;
        renderer.render(scene, camera);
    });

    window.addEventListener("resize", function () {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        labelRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
}
