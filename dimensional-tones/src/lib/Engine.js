import * as THREE from 'three';

import { DragControls } from './DragControls'
import { OrbitControls } from './OrbitControls'

let container;
let camera, scene, renderer;
let orbitControls, dragControls;
const objects = [];

function init() {

  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 5000);
  camera.position.z = 1000;
  camera.position.y = 1000;
  camera.position.x = 1000;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);


  initLighting()
  initBoundingBox()
  initTonalBoxes()
  initGridHelper()


  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  container.appendChild(renderer.domElement);

  orbitControls = new OrbitControls(camera, renderer.domElement);

  dragControls = new DragControls(objects, camera, renderer.domElement);
  dragControls.addEventListener('dragstart', function () { orbitControls.enabled = false; });
  dragControls.addEventListener('dragend', function () { orbitControls.enabled = true; })
  dragControls.addEventListener('drag', function (event) { ensureInsideBoundingBox(event.object); });

  window.addEventListener('resize', onWindowResize);
}

function ensureInsideBoundingBox(object) {
  const offset = 50; // half of tonal box size
  if (object.position.x > 500 - offset) object.position.x = 500 - offset;
  if (object.position.z > 500 - offset) object.position.z = 500 - offset;
  if (object.position.y > 1000 - offset) object.position.y = 1000 - offset;
  if (object.position.x < -500 + offset) object.position.x = -500 + offset;
  if (object.position.z < -500 + offset) object.position.z = -500 + offset;
  if (object.position.y < 0 + offset) object.position.y = 0 + offset;
}

function initLighting() {
  scene.add(new THREE.AmbientLight(0xffffff));
  const light = new THREE.SpotLight(0xffffff, 1.5);
  light.position.set(0, 500, 2000);
  light.angle = Math.PI / 9;
  light.castShadow = true;
  light.shadow.camera.near = 1000;
  light.shadow.camera.far = 4000;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;

  scene.add(light);
}

function initTonalBoxes() {
  const geometry = new THREE.BoxGeometry(100, 100, 100);

  const params = [
    // [color],
    [0xef476f],
    [0xffd166],
    [0xe29578],
    [0x118ab2],
    [0x073b4c],
  ]

  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: param[0] }));

    object.position.x = Math.floor(Math.random() * 1000) - 500;
    object.position.y = Math.floor(Math.random() * 500);
    object.position.z = Math.floor(Math.random() * 1000) - 500;

    object.scale.x = 1;
    object.scale.y = 1;
    object.scale.z = 1;

    object.castShadow = true;
    object.receiveShadow = true;

    ensureInsideBoundingBox(object)
    scene.add(object);
    objects.push(object);
  }
}

function initBoundingBox() {
  const boundingLines = []
  const params = [
    // [lenX, lenY, lenZ, posX, posY, posZ]
    [10, 10, 1000, 500, 0, 0],
    [10, 10, 1000, -500, 0, 0],
    [10, 10, 1000, 500, 1000, 0],
    [10, 10, 1000, -500, 1000, 0],
    [1000, 10, 10, 0, 0, 500],
    [1000, 10, 10, 0, 0, -500],
    [1000, 10, 10, 0, 1000, 500],
    [1000, 10, 10, 0, 1000, -500],
    [10, 1000, 10, 500, 500, 500],
    [10, 1000, 10, 500, 500, -500],
    [10, 1000, 10, -500, 500, 500],
    [10, 1000, 10, -500, 500, -500],
  ]

  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    const object = new THREE.Mesh(new THREE.BoxGeometry(param[0], param[1], param[2]), new THREE.MeshLambertMaterial({ color: 0x2d6a4f }));
    object.position.x = param[3]
    object.position.y = param[4]
    object.position.z = param[5]
    boundingLines.push(object)
  }

  for (let i = 0; i < boundingLines.length; i++) {
    const boundingLine = boundingLines[i];
    boundingLine.scale.x = 1;
    boundingLine.scale.y = 1;
    boundingLine.scale.z = 1;
    boundingLine.castShadow = false;
    boundingLine.receiveShadow = true;
    scene.add(boundingLine)
  }  
}

function initGridHelper() {
  const gridHelper = new THREE.GridHelper(1000, 20);
  gridHelper.position.y = - 1;
  scene.add(gridHelper);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

}

const exports = { init, animate }

export default exports;