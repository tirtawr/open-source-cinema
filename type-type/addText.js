let camera3D, scene, renderer, cube;
let texts = [];
let in_front_of_you;
let font;

function loadFont() {

    const loader = new THREE.FontLoader();
    loader.load('helvetiker.typeface.json', function (response) {
        font = response;
    });
}

loadFont();
init3D();

function init3D() {
    scene = new THREE.Scene();
    camera3D = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    ///document.body.appendChild(renderer.domElement);

    //this puts the three.js stuff in a particular div
    document.getElementById('container').appendChild(renderer.domElement)


    let bgGeometery = new THREE.SphereGeometry(1000, 60, 40);
    // let bgGeometery = new THREE.CylinderGeometry(725, 725, 1000, 10, 10, true)
    bgGeometery.scale(-1, 1, 1);
    // has to be power of 2 like (4096 x 2048) or(8192x4096).  i think it goes upside down because texture is not right size
    let panotexture = new THREE.TextureLoader().load("itp.jpg");
    // var material = new THREE.MeshBasicMaterial({ map: panotexture, transparent: true,   alphaTest: 0.02,opacity: 0.3});
    let backMaterial = new THREE.MeshBasicMaterial({ map: panotexture });

    let back = new THREE.Mesh(bgGeometery, backMaterial);
    scene.add(back);

    //tiny little dot (could be invisible) for placing things in front of you
    var geometryFront = new THREE.BoxGeometry(1, 1, 1);
    var materialFront = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    in_front_of_you = new THREE.Mesh(geometryFront, materialFront);
    camera3D.add(in_front_of_you); // then add in front of the camera so it follow it
    in_front_of_you.position.set(0, 0, -600);

    //convenience function for getting coordinates

    moveCameraWithMouse();

    camera3D.position.z = 0;
    animate();
}


function animate() {
    requestAnimationFrame(animate);
    for (var i = 0; i < texts.length; i++) {
        texts[i].texture.needsUpdate = true;
    }
    driftTexts()
    renderer.render(scene, camera3D);
}

var textInput = document.getElementById("text");  //get a hold of something in the DOM
textInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {  //checks whether the pressed key is "Enter"
        createNewText(textInput.value);
        textInput.value = ''
    }
});

function createNewText(text_msg) {
    console.log("Created New Text");
    var canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    var fontSize = Math.max(camera3D.fov / 2, 72);
    context.font = fontSize + "pt Arial";
    context.textAlign = "center";
    // const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`
    // context.fillStyle = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    context.fillStyle = "white";
    context.fillText(text_msg, canvas.width / 2, canvas.height / 2);
    var textTexture = new THREE.Texture(canvas);
    textTexture.needsUpdate = true;
    var material = new THREE.MeshBasicMaterial({ map: textTexture, transparent: false });
    const height = 20,
        size = 70,
        curveSegments = 4,
        bevelThickness = 2,
        bevelSize = 1.5;
    var textGeo = new THREE.TextGeometry(text_msg, {
        font: font,
        size: size,
        height: height,
        curveSegments: curveSegments,
        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelEnabled: false

    });
    var textMesh = new THREE.Mesh(textGeo, material);

    const posInWorld = new THREE.Vector3();
    //remember we attached a tiny to the  front of the camera in init, now we are asking for its position

    in_front_of_you.position.set(0, 0, -(1400 - camera3D.fov * 7));  //base the the z position on camera field of view
    in_front_of_you.getWorldPosition(posInWorld);
    textMesh.position.x = posInWorld.x;
    textMesh.position.y = posInWorld.y;
    textMesh.position.z = posInWorld.z;
    console.log(posInWorld);
    textMesh.lookAt(0, 0, 0);
    textMesh.scale.set(1, 1, 1);
    scene.add(textMesh);
    texts.push({ "object": textMesh, "texture": textTexture, "text": text_msg });
}

function getRandomOffset() {
    let offset = Math.random();
    offset -= 0.5;
    return offset / 200
}

function driftTexts() {
    if (texts.length == 0) return;

    texts.forEach((currText) => {
        //imagine a circle looking down on the world and do High School math
        let currPos = new THREE.Spherical();
        currPos.setFromVector3(currText.object.position);
        currText.object.position.setFromSphericalCoords(currPos.radius, currPos.phi + getRandomOffset(), currPos.theta + 0.01)
        currText.object.lookAt(0, 0, 0);

    });

}



/////MOUSE STUFF

function onDocumentKeyDown(event) {
    //console.log(event.key);
    // if (event.key == " ") {
    //     
    // }
}


var onMouseDownMouseX = 0, onMouseDownMouseY = 0;
var onPointerDownPointerX = 0, onPointerDownPointerY = 0;
var lon = -90, onMouseDownLon = 0;
var lat = 0, onMouseDownLat = 0;
var isUserInteracting = false;


function moveCameraWithMouse() {
    //document.addEventListener('keydown', onDocumentKeyDown, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('wheel', onDocumentMouseWheel, false);
    window.addEventListener('resize', onWindowResize, false);
    camera3D.target = new THREE.Vector3(0, 0, 0);
}


function onDocumentMouseDown(event) {
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
    isUserInteracting = true;
}

function onDocumentMouseMove(event) {
    if (isUserInteracting) {
        lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
        lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
        computeCameraOrientation();
    }
}

function onDocumentMouseUp(event) {
    isUserInteracting = false;
}

function onDocumentMouseWheel(event) {
    camera3D.fov += event.deltaY * 0.05;
    camera3D.updateProjectionMatrix();
}

function computeCameraOrientation() {
    lat = Math.max(- 30, Math.min(30, lat));  //restrict movement
    let phi = THREE.Math.degToRad(90 - lat);  //restrict movement
    let theta = THREE.Math.degToRad(lon);
    camera3D.target.x = 100 * Math.sin(phi) * Math.cos(theta);
    camera3D.target.y = 100 * Math.cos(phi);
    camera3D.target.z = 100 * Math.sin(phi) * Math.sin(theta);
    camera3D.lookAt(camera3D.target);
}


function onWindowResize() {
    camera3D.aspect = window.innerWidth / window.innerHeight;
    camera3D.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log('Resized');
}