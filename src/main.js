import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { getFresnelMat } from './getFresnelMat';

const textures = {
  Earth: '/texture/8081_earthmap4k.jpg',
  Mars: '/texture/mars_1k_color.jpg',
  earthNight: '/texture/8081_earthlights4k.jpg',
  earthCloudtxt: 'texture/8081_earthhiresclouds4K.png',
  moonTxt: 'texture/moonmap4k.jpg'
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 100, 300);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.near = 0.5;
pointLight.shadow.camera.far = 500;
pointLight.shadow.camera.left = -50;
pointLight.shadow.camera.right = 50;
pointLight.shadow.camera.top = 50;
pointLight.shadow.camera.bottom = -50;
scene.add(pointLight);

function loadSpace() {
  const starGeo = new THREE.BufferGeometry();
  const starCount = 4000;
  const starPos = [];
  for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starPos.push(x, y, z);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  const matStar = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, sizeAttenuation: true });
  const stars = new THREE.Points(starGeo, matStar);
  scene.add(stars);
}
loadSpace();

const raycaster = new THREE.Raycaster();
const raycastableObjects = [];
let earthGroup;

function earth() {
  if (earthGroup) return;

  earthGroup = new THREE.Group();
  const textureLoader = new THREE.TextureLoader();
  const earthTexture = textureLoader.load(textures.Earth);
  const geometry = new THREE.IcosahedronGeometry(7, 16);

  const earth = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map: earthTexture }));
  earth.position.set(0, 0, 0);
  earth.castShadow = true;
  earth.receiveShadow = true;

  const earthCitylight = textureLoader.load(textures.earthNight);
  const cityLighting = new THREE.MeshStandardMaterial({ map: earthCitylight, blending: THREE.AdditiveBlending });
  const cityLightingMesh = new THREE.Mesh(geometry.clone(), cityLighting);
  earthGroup.add(cityLightingMesh);

  const earthCloudtxt = textureLoader.load(textures.earthCloudtxt);
  const earthCloud = new THREE.MeshStandardMaterial({ map: earthCloudtxt, blending: THREE.AdditiveBlending });
  const earthCloudMesh = new THREE.Mesh(geometry.clone(), earthCloud);
  earthGroup.add(earthCloudMesh);

  const earthGlow = getFresnelMat();
  const earthGlowMesh = new THREE.Mesh(geometry.clone(), earthGlow);
  earthGlowMesh.scale.set(1.01, 1.01, 1.01);
  earthGroup.add(earthGlowMesh);

  const earthLabelDiv = document.createElement('div');
  earthLabelDiv.className = 'label';
  earthLabelDiv.textContent = 'Earth';
  earthLabelDiv.style.marginTop = '-1em';
  earthLabelDiv.style.color = 'white';
  earthLabelDiv.style.padding = '2px 6px';
  earthLabelDiv.style.borderRadius = '4px';
  earthLabelDiv.style.fontFamily = 'Arial, sans-serif';
  earthLabelDiv.style.fontSize = '14px';
  const earthLabel = new CSS2DObject(earthLabelDiv);
  earthLabel.position.set(-5, 11, 0);
  earth.add(earthLabel);

  earthGroup.rotation.z = -23.4 * Math.PI / 180;
  earthGroup.add(earth);
  scene.add(earthGroup);

  const moonOrbitGroup = new THREE.Group();
  earthGroup.add(moonOrbitGroup);

  const moonTexture = textureLoader.load(textures.moonTxt);
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(2, 32, 32),
    new THREE.MeshStandardMaterial({ map: moonTexture })
  );
  moon.position.set(50, 0, 0);
  moon.castShadow = true;
  moon.receiveShadow = true;

  const moonLabelDiv = document.createElement('div');
  moonLabelDiv.className = 'label';
  moonLabelDiv.textContent = 'Moon';
  moonLabelDiv.style.marginTop = '-1em';
  moonLabelDiv.style.color = 'white';
  moonLabelDiv.style.padding = '2px 6px';
  moonLabelDiv.style.borderRadius = '4px';
  moonLabelDiv.style.fontFamily = 'Arial, sans-serif';
  moonLabelDiv.style.fontSize = '14px';
  const moonLabel = new CSS2DObject(moonLabelDiv);
  moonLabel.position.set(0, 3, 0);
  moon.add(moonLabel);

  moonOrbitGroup.add(moon);

  const orbitRadius = 50;
  const orbitSegments = 64;
  const orbitGeometry = new THREE.BufferGeometry();
  const orbitVertices = [];
  for (let i = 0; i <= orbitSegments; i++) {
    const theta = (i / orbitSegments) * 2 * Math.PI;
    orbitVertices.push(
      Math.cos(theta) * orbitRadius, 0, Math.sin(theta) * orbitRadius
    );
  }
  orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitVertices, 3));
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xfffdf7, opacity: 0.1 });
  const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
  earthGroup.add(orbitLine);

  raycastableObjects.push(earth, moon);
}
earth();

document.getElementById('load-earth').addEventListener('click', earth);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

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
  }
}

function focusOnObject(object) {
  const targetPosition = new THREE.Vector3();
  object.getWorldPosition(targetPosition);
  const direction = new THREE.Vector3().subVectors(camera.position, targetPosition).normalize();
  const newCameraPos = targetPosition.clone().add(direction.multiplyScalar(50));
  camera.position.copy(newCameraPos);
  controls.target.copy(targetPosition);
  controls.update();
}

renderer.domElement.addEventListener('mousedown', (e) => {
  handleRaycast(e.clientX, e.clientY);
});

window.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    const touch = e.touches[0];
    handleRaycast(touch.clientX, touch.clientY);
  }
});

function animate() {
  requestAnimationFrame(animate);
  if (earthGroup) {
    earthGroup.rotation.y += 0.0002;
    const moonOrbitGroup = earthGroup.children.find(child => child instanceof THREE.Group);
    if (moonOrbitGroup) {
      moonOrbitGroup.rotation.y += 0.0001;
    }
  }
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

animate();
