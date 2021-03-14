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

  scene.add(new THREE.AmbientLight(0x505050));

  const light = new THREE.SpotLight(0xffffff, 1.5);
  light.position.set(0, 500, 2000);
  light.angle = Math.PI / 9;

  light.castShadow = true;
  light.shadow.camera.near = 1000;
  light.shadow.camera.far = 4000;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;

  scene.add(light);

  const geometry = new THREE.BoxGeometry(50, 50, 50);
  for (let i = 0; i < 5; i++) {

    const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));

    object.position.x = Math.floor(Math.random() * 1000) - 500;
    object.position.y = Math.floor(Math.random() * 500);
    object.position.z = Math.floor(Math.random() * 1000) - 500;

    object.scale.x = 1;
    object.scale.y = 1;
    object.scale.z = 1;

    object.castShadow = true;
    object.receiveShadow = true;

    scene.add(object);

    objects.push(object);

  }

  // Init gridHelper
  const gridHelper = new THREE.GridHelper(1000, 20);
  gridHelper.position.y = - 1;
  scene.add(gridHelper);

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

  window.addEventListener('resize', onWindowResize);
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