// main.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { getFresnelMat } from './getFresnelMat';

const textures = {
  Earth: '/texture/8081_earthmap4k.jpg',
  Mars: '/texture/mars_1k_color.jpg',
  earthNight: '/texture/8081_earthlights4k.jpg',
  earthCloudtxt: 'texture/8081_earthhiresclouds4K.png',
  moonTxt: 'texture/moonmap4k.jpg',
  moonBumptxt: 'texture/07_moonbump4k.jpg'
};

const objectInfoMap = new Map([
  ['Earth', {
    title: 'Earth',
    description: 'Earth is the third planet from the Sun and the only astronomical object known to harbor life.'
  }],
  ['Moon', {
    title: 'Moon',
    description: 'The Moon is Earth\'s only natural satellite and the fifth largest satellite in the Solar System.'
  }]
]);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 100, 300);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

scene.add(new THREE.AmbientLight(0xffffff, 0.02));
const pointLight = new THREE.DirectionalLight(0xffffff, 0.7);
pointLight.position.set(1, -0.5, 0);
pointLight.castShadow = true;
scene.add(pointLight);

function loadStars() {
  const starGeo = new THREE.BufferGeometry();
  const starCount = 4000;
  const starPos = [];
  for (let i = 0; i < starCount; i++) {
    starPos.push((Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 }));
  scene.add(stars);
}
loadStars();

const raycaster = new THREE.Raycaster();
const raycastableObjects = [];
let earthGroup;

function addAxisLabel(labelText, position) {
  const labelDiv = document.createElement('div');
  labelDiv.textContent = labelText;
  labelDiv.style.color = 'white';
  labelDiv.style.fontSize = '12px';
  const label = new CSS2DObject(labelDiv);
  label.position.copy(position);
  scene.add(label);
}

function earth() {
  if (earthGroup) return;

  earthGroup = new THREE.Group();
  const loader = new THREE.TextureLoader();
  const geometry = new THREE.IcosahedronGeometry(7, 16);

  const earthMesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map: loader.load(textures.Earth) }));
  earthMesh.name = 'Earth';
  earthMesh.castShadow = true;
  earthMesh.receiveShadow = true;

  const cityMesh = new THREE.Mesh(geometry.clone(), new THREE.MeshStandardMaterial({
    map: loader.load(textures.earthNight), blending: THREE.AdditiveBlending, transparent: true
  }));

  const cloudMesh = new THREE.Mesh(geometry.clone(), new THREE.MeshStandardMaterial({
    map: loader.load(textures.earthCloudtxt), blending: THREE.AdditiveBlending, transparent: true
  }));

  const glowMesh = new THREE.Mesh(geometry.clone(), getFresnelMat());
  glowMesh.scale.set(1.01, 1.01, 1.01);

  const labelDiv = document.createElement('div');
  labelDiv.textContent = 'Earth';
  labelDiv.style.color = 'white';
  const label = new CSS2DObject(labelDiv);
  label.position.set(-5, 11, 0);
  earthMesh.add(label);

  earthGroup.rotation.z = -23.4 * Math.PI / 180; // Tilt
  earthGroup.add(earthMesh, cityMesh, cloudMesh, glowMesh);
  scene.add(earthGroup);

  const moonGroup = new THREE.Group();
  earthGroup.add(moonGroup);

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(2, 32, 32),
    new THREE.MeshStandardMaterial({
      map: loader.load(textures.moonTxt),
      bumpMap: loader.load(textures.moonBumptxt), bumpScale: 0.5
    })
  );
  moon.name = 'Moon';
  moon.position.set(50, 0, 0);
  moon.castShadow = true;
  moon.receiveShadow = true;

  const moonLabel = new CSS2DObject(document.createElement('div'));
  moonLabel.element.textContent = 'Moon';
  moonLabel.element.style.color = 'white';
  moonLabel.position.set(0, 3, 0);
  moon.add(moonLabel);

  moonGroup.add(moon);

  const orbitGeo = new THREE.BufferGeometry();
  const orbitPoints = [];
  const r = 100, segments = 64;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * 2 * Math.PI;
    orbitPoints.push(Math.cos(theta) * r, 0, Math.sin(theta) * r);
  }
  orbitGeo.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
  moonGroup.add(new THREE.Line(orbitGeo, new THREE.LineBasicMaterial({ color: 0xffffff })));

  raycastableObjects.push(earthMesh, moon);
}
earth();

// addAxisLabel('X', new THREE.Vector3(20, 0, 0));
// addAxisLabel('Y', new THREE.Vector3(0, 20, 0));
// addAxisLabel('Z', new THREE.Vector3(0, 0, 20));

// function handleRaycast(x, y) {
//   const coords = new THREE.Vector2((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
//   raycaster.setFromCamera(coords, camera);
//   const intersects = raycaster.intersectObjects(raycastableObjects, true);
//   if (intersects.length > 0) focusOnObject(intersects[0].object);
//   else document.getElementById('info-panel').style.display = 'none';
// }

let hidePanelTimeout = null;

function handleRaycast(x, y) {
  const coords = new THREE.Vector2(
    (x / renderer.domElement.clientWidth) * 2 - 1,
    -(y / renderer.domElement.clientHeight) * 2 + 1
  );
  raycaster.setFromCamera(coords, camera);
  const intersections = raycaster.intersectObjects(raycastableObjects, true);

  if (intersections.length > 0) {
    const selected = intersections[0].object;
    focusOnObject(selected);

    // If object has info, clear the timeout to avoid premature hiding
    const name = selected.name || selected.parent?.name;
    if (objectInfoMap.has(name)) {
      clearTimeout(hidePanelTimeout);
    }
  } else {
    // Delay hiding the info panel for 10 seconds
    clearTimeout(hidePanelTimeout);
    hidePanelTimeout = setTimeout(() => {
      document.getElementById('info-panel').style.display = 'none';
    }, 5000);
  }
}


function focusOnObject(object) {
  const target = new THREE.Vector3();
  object.getWorldPosition(target);
  const direction = new THREE.Vector3().subVectors(camera.position, target).normalize();
  const newPos = target.clone().add(direction.multiplyScalar(50));
  camera.position.copy(newPos);
  controls.target.copy(target);
  controls.update();

  const name = object.name || object.parent?.name;
  const info = objectInfoMap.get(name);
  if (info) {
    document.getElementById('info-title').textContent = info.title;
    document.getElementById('info-description').textContent = info.description;
    document.getElementById('info-panel').style.display = 'block';
  }
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) handleRaycast(e.touches[0].clientX, e.touches[0].clientY);
});
window.addEventListener('click', (e) => {
  handleRaycast(e.clientX, e.clientY);
});
const infoPanel = document.createElement('div');
infoPanel.id = 'info-panel';
// infoPanel.style = 'position:absolute;top:20px;right:20px;background:rgba(0,0,0,0.8);color:white;padding:10px;border-radius:10px;max-width:250px;font-family:sans-serif;display:none;z-index:999;';
// infoPanel.innerHTML = '<h3 id="info-title"></h3><p id="info-description"></p>';
document.body.appendChild(infoPanel);

function animate() {
  requestAnimationFrame(animate);
  if (earthGroup) {
    earthGroup.rotation.y += 0.0002;
    const moon = earthGroup.getObjectByName('Moon');
    if (moon) {
    const time = Date.now() * 0.00001; // Speed of orbit
    const radius = 100;
    moon.position.set(
    Math.cos(time) * radius,
    0,
    Math.sin(time) * radius
  );
}
  }
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
animate();