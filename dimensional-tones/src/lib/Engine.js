import * as THREE from 'three';

import { DragControls } from './DragControls'
import { OrbitControls } from './OrbitControls'


let container;
let camera, scene, renderer;
let orbitControls;
let dragControls, group;
let enableSelection = false;

const objects = [];

const mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster();

function init() {

  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 5000);
  camera.position.z = 1000;

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

  group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.BoxGeometry(50, 50, 50);

  for (let i = 0; i < 5; i++) {

    const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));

    object.position.x = Math.random() * 1000;
    object.position.y = Math.random() * 1000;
    object.position.z = Math.random() * 1000;

    object.rotation.x = Math.PI;
    object.rotation.y = Math.PI;
    object.rotation.z = Math.PI;

    object.scale.x = 1;
    object.scale.y = 1;
    object.scale.z = 1;

    object.castShadow = true;
    object.receiveShadow = true;

    scene.add(object);

    objects.push(object);

  }

  // Init gridHelper
  const gridHelper = new THREE.GridHelper(50 * 1000, 50 * 1000);
  gridHelper.position.y = - 1;
  scene.add(gridHelper);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  container.appendChild(renderer.domElement);

  orbitControls = new OrbitControls(camera, renderer.domElement);
  // dragControls = new DragControls([...objects], camera, renderer.domElement);
  dragControls = new DragControls(objects, camera, renderer.domElement);

  dragControls.addEventListener('dragstart', function () { orbitControls.enabled = false; });
  dragControls.addEventListener('dragend', function () { orbitControls.enabled = true; });
  window.addEventListener('resize', onWindowResize);
  document.addEventListener('click', onClick);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
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

function onKeyDown(event) {

  enableSelection = (event.keyCode === 16) ? true : false;

}

function onKeyUp() {

  enableSelection = false;

}

function onClick(event) {

  event.preventDefault();

  if (enableSelection === true) {

    const draggableObjects = dragControls.getObjects();
    draggableObjects.length = 0;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersections = raycaster.intersectObjects(objects, true);

    if (intersections.length > 0) {

      const object = intersections[0].object;

      if (group.children.includes(object) === true) {

        object.material.emissive.set(0x000000);
        scene.attach(object);

      } else {

        object.material.emissive.set(0xaaaaaa);
        group.attach(object);

      }

      dragControls.transformGroup = true;
      draggableObjects.push(group);

    }

    if (group.children.length === 0) {

      dragControls.transformGroup = false;
      draggableObjects.push(...objects);

    }

  }

}

const exports = { init, animate }

export default exports;