import * as THREE from 'three';
import * as YUKA from 'yuka';

import * as RequestAnimationFrameDispatcher from "./RequestAnimationFrameDispatcher";

// @ts-ignore
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
// @ts-ignore
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
// @ts-ignore
import {CSS2DObject, CSS2DRenderer} from "three/examples/jsm/renderers/CSS2DRenderer";


const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
renderer.setClearColor(0xA3A3A3, 0);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// Add debugging
const axesHelper = new THREE.AxesHelper(5);
axesHelper.position.add(new THREE.Vector3(0,1,0));
scene.add(axesHelper);
const gridHelper = new THREE.GridHelper(100, 100, 0xFF0000, 0x808080);
scene.add(gridHelper);

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 10, 15);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0";
labelRenderer.domElement.style.pointerEvents = "none";
labelRenderer.domElement.id = "overlay-labelRenderer";
document.body.append(labelRenderer.domElement);

// const ambientLight = new THREE.AmbientLight(0x333333);
// scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

const vehicle = new YUKA.Vehicle();

// @ts-ignore
vehicle.position.set(0, 0, 0);

vehicle.maxSpeed = 3;


const entityManager = new YUKA.EntityManager();
entityManager.add(vehicle);

// @ts-ignore
function createCpointMesh(name, x, y, z) {
    const geo = new THREE.SphereGeometry(0.1);
    const mat = new THREE.MeshBasicMaterial({color: 0xFF0000});
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
window.addEventListener("mousemove", function (e) {
    mousePos.x = (e.clientX / this.window.innerWidth) * 2 - 1;
    mousePos.y = -(e.clientY / this.window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePos, camera);
    const intersects = raycaster.intersectObject(group);
    if (intersects.length > 0) {
        p.className = "tooltip show";
        p.textContent = intersects[0].object.name;
        const {x, y, z} = intersects[0].object.position;
        cPointLabel.position.set(x, y + 1, z);
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
loader.load('./SUV.glb', function (glb) {
    const model = glb.scene;
    //model.scale.set(0.5, 0.5, 0.5);
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

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});