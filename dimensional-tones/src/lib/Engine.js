import * as THREE from 'three';

import { DragControls } from './DragControls'
import { OrbitControls } from './OrbitControls'
import anime from 'animejs/lib/anime.es.js';
import * as Tone from 'tone'


let container;
let camera, scene, renderer;
let orbitControls, dragControls;
const tonalBoxes = [];
let xPlane, yPlane, zPlane;
let alternatingTimeline, concurrentTimeline;
let planePosition = {
  xPlane: -500,
  zPlane: -500,
  yPlane: 0,
}
const tonalBoxRadius = 50;
const fullLoopDuration = 4 * 1000;


function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 5000);
  camera.position.z = 1500 + 30;
  camera.position.y = 1500;
  camera.position.x = 1500 - 100;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  initLighting()
  initBoundingBox()
  initTonalBoxes()
  initGridHelper()
  initPlaybackPlanes()
  initAlternatingTimeline()
  initConcurrentTimeline()

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  container.appendChild(renderer.domElement);

  orbitControls = new OrbitControls(camera, renderer.domElement);

  dragControls = new DragControls(tonalBoxes, camera, renderer.domElement);
  dragControls.addEventListener('dragstart', function () { orbitControls.enabled = false; });
  dragControls.addEventListener('dragend', function () { orbitControls.enabled = true; })
  dragControls.addEventListener('drag', function (event) { ensureInsideBoundingBox(event.object); });

  window.addEventListener('resize', onWindowResize);
}

function initPlaybackPlanes() {
  xPlane = new THREE.Mesh(new THREE.BoxGeometry(10, 1000, 1000), new THREE.MeshLambertMaterial({ color: 0x2d6a4f, transparent: true, opacity: 0.3 }));
  xPlane.position.x = -500;
  xPlane.position.y = 500;
  xPlane.visible = false;
  scene.add(xPlane)

  yPlane = new THREE.Mesh(new THREE.BoxGeometry(1000, 10, 1000), new THREE.MeshLambertMaterial({ color: 0x2d6a4f, transparent: true, opacity: 0.3 }));
  yPlane.visible = false;
  scene.add(yPlane)

  zPlane = new THREE.Mesh(new THREE.BoxGeometry(1000, 1000, 10), new THREE.MeshLambertMaterial({ color: 0x2d6a4f, transparent: true, opacity: 0.3 }));
  zPlane.position.y = 500;
  zPlane.position.z = -500;
  zPlane.visible = false;
  scene.add(zPlane)
}

function onTimelineUpdate() {
  xPlane.position.x = planePosition.xPlane
  zPlane.position.z = planePosition.zPlane
  yPlane.position.y = planePosition.yPlane
  detectTonalBoxesIntersection()
}

function initTonalBoxesForPlayback() {
  for (let i = 0; i < tonalBoxes.length; i++) {
    tonalBoxes[i].material = tonalBoxes[i].offMaterial;
    tonalBoxes[i].isOn = false;    
  }
}

function initAlternatingTimeline() {
  alternatingTimeline = anime.timeline({
    autoplay: false,
    loop: true,
    easing: 'linear',
    update: onTimelineUpdate
  });
  alternatingTimeline
  .add({
    targets: planePosition,
    xPlane: 500,
    duration: fullLoopDuration / 3,
    changeBegin: function (_anim) { xPlane.visible = true; },
    changeComplete: function (_anim) { xPlane.visible = false; },
  })
  .add({
    targets: planePosition,
    zPlane: 500,
    duration: fullLoopDuration / 3,
    changeBegin: function (_anim) { zPlane.visible = true; },
    changeComplete: function (_anim) { zPlane.visible = false; },
  })
  .add({
    targets: planePosition,
    yPlane: 1000,
    duration: fullLoopDuration / 3,
    changeBegin: function (_anim) { yPlane.visible = true; },
    changeComplete: function (_anim) { yPlane.visible = false; },
  })
}

function initConcurrentTimeline() {
  concurrentTimeline = anime.timeline({
    autoplay: false,
    loop: true,
    easing: 'linear',
    update: onTimelineUpdate
  });
  concurrentTimeline
    .add({
      targets: planePosition,
      xPlane: 500,
      zPlane: 500,
      yPlane: 1000,
      duration: fullLoopDuration,
      changeBegin: function (_anim) {
        xPlane.visible = true;
        yPlane.visible = true;
        zPlane.visible = true;
      },
      changeComplete: function (_anim) {
        xPlane.visible = false;
        yPlane.visible = false;
        zPlane.visible = false;
      },
    })
}

function playAlternating() {
  initTonalBoxesForPlayback()
  alternatingTimeline.play()
}

function playConcurrent() {
  initTonalBoxesForPlayback()
  concurrentTimeline.play()
}

function resetPlayback() {
  alternatingTimeline.pause()
  alternatingTimeline.seek(alternatingTimeline.duration * 0)
  concurrentTimeline.pause()
  concurrentTimeline.seek(concurrentTimeline.duration * 0)
  for (let i = 0; i < tonalBoxes.length; i++) {
    tonalBoxes[i].material = tonalBoxes[i].onMaterial;
  }
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
  const geometry = new THREE.BoxGeometry(tonalBoxRadius * 2, tonalBoxRadius * 2, tonalBoxRadius * 2);

  const params = [
    // [color, note],
    [0xef476f, "C2"],
    [0xffd166, "C3"],
    [0xe29578, "C4"],
    [0x118ab2, "C5"],
    [0x073b4c, "C6"],
  ]

  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    const onMaterial = new THREE.MeshLambertMaterial({ color: param[0] })
    const offMaterial = new THREE.MeshBasicMaterial({ color: param[0], wireframe: true })
    const object = new THREE.Mesh(geometry, onMaterial);
    
    // custom fields
    object.note = param[1]
    object.onMaterial = onMaterial
    object.offMaterial = offMaterial
    object.isOn = false

    //Perfect positioning
    object.position.x = 0;
    object.position.y = (i + 1) * (1000 / 6);
    object.position.z = 500 - ((i + 1) * (1000 / 6));


    object.scale.x = 1;
    object.scale.y = 1;
    object.scale.z = 1;

    object.castShadow = true;
    object.receiveShadow = true;

    ensureInsideBoundingBox(object)
    scene.add(object);
    tonalBoxes.push(object);
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

function ensureInsideBoundingBox(object) {
  const offset = tonalBoxRadius + 2;
  if (object.position.x > 500 - offset) object.position.x = 500 - offset;
  if (object.position.z > 500 - offset) object.position.z = 500 - offset;
  if (object.position.y > 1000 - offset) object.position.y = 1000 - offset;
  if (object.position.x < -500 + offset) object.position.x = -500 + offset;
  if (object.position.z < -500 + offset) object.position.z = -500 + offset;
  if (object.position.y < 0 + offset) object.position.y = 0 + offset;
}

function detectTonalBoxesIntersection() {
  for (let i = 0; i < tonalBoxes.length; i++) {
    const position = tonalBoxes[i].position;
    const intersectXPlane = xPlane.position.x >= position.x - tonalBoxRadius && xPlane.position.x <= position.x + tonalBoxRadius
    const intersectYPlane = yPlane.position.y >= position.y - tonalBoxRadius && yPlane.position.y <= position.y + tonalBoxRadius
    const intersectZPlane = zPlane.position.z >= position.z - tonalBoxRadius && zPlane.position.z <= position.z + tonalBoxRadius
    const prevIsOn = tonalBoxes[i].isOn
    const newIsOn = (intersectXPlane || intersectYPlane || intersectZPlane)
    if (prevIsOn !== newIsOn) {
      tonalBoxes[i].isOn = newIsOn;
      if (tonalBoxes[i].isOn) {
        tonalBoxes[i].material = tonalBoxes[i].onMaterial;
      } else {
        tonalBoxes[i].material = tonalBoxes[i].offMaterial;
      }
      if (!prevIsOn && newIsOn) {
        const synth = new Tone.Synth().toDestination();
        synth.triggerAttackRelease(tonalBoxes[i].note, '8n', Tone.now())
      }
    }
  }
}

function randomizeTonalBoxesPosition() {
  for (let i = 0; i < tonalBoxes.length; i++) {
    tonalBoxes[i].position.x = Math.floor(Math.random() * 1000) - 500;
    tonalBoxes[i].position.y = Math.floor(Math.random() * 500);
    tonalBoxes[i].position.z = Math.floor(Math.random() * 1000) - 500;
  }

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

const exports = { init, animate, playAlternating, playConcurrent, resetPlayback, randomizeTonalBoxesPosition }

export default exports;