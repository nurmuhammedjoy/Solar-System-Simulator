import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Setup scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 20, 50);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Create Sun
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Create Earth
const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
const earthMaterial = new THREE.MeshStandardMaterial({color: 0x0000ff});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.position.set(15, 0, 0);
scene.add(earth);

// Light for Earth to be visible
const light = new THREE.PointLight(0xffffff, 1.5);
light.position.set(0, 0, 0); // at sun position
scene.add(light);

// Helper function to create labels
function createLabel(text) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = '30px Arial';
  context.fillStyle = 'white';
  context.fillText(text, 0, 30);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  const labelMaterial = new THREE.SpriteMaterial({map: texture, transparent: true});
  const sprite = new THREE.Sprite(labelMaterial);
  sprite.scale.set(5, 2.5, 1);
  return sprite;
}

// Create labels
const sunLabel = createLabel('Sun');
sunLabel.position.set(0, 6, 0);
sun.add(sunLabel);

const earthLabel = createLabel('Earth');
earthLabel.position.set(0, 2, 0);
earth.add(earthLabel);

// 2D icons for zoomed out view
const earthIconTexture = new THREE.TextureLoader().load('textures/earth_icon.png'); // small 2D icon
const earthIcon = new THREE.Sprite(new THREE.SpriteMaterial({map: earthIconTexture}));
earthIcon.position.copy(earth.position);
earthIcon.scale.set(3, 3, 1);
scene.add(earthIcon);

const sunIconTexture = new THREE.TextureLoader().load('textures/sun_icon.png'); // small 2D icon
const sunIcon = new THREE.Sprite(new THREE.SpriteMaterial({map: sunIconTexture}));
sunIcon.position.copy(sun.position);
sunIcon.scale.set(5, 5, 1);
scene.add(sunIcon);

// Initially hide icons (show 3D spheres)
earthIcon.visible = false;
sunIcon.visible = false;

const ZOOM_THRESHOLD = 30; // distance threshold

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate earth around sun
  const time = Date.now() * 0.001;
  earth.position.set(Math.cos(time) * 15, 0, Math.sin(time) * 15);

  // Labels stay attached to planets
  earthLabel.position.set(0, 2, 0);
  sunLabel.position.set(0, 6, 0);

  // Toggle between 3D and 2D icons based on camera distance
  const distance = camera.position.length();
  const show3D = distance < ZOOM_THRESHOLD;

  earth.visible = show3D;
  sun.visible = show3D;

  earthLabel.visible = show3D;
  sunLabel.visible = show3D;

  earthIcon.visible = !show3D;
  sunIcon.visible = !show3D;

  // Keep icons at planet positions
  earthIcon.position.copy(earth.position);
  sunIcon.position.copy(sun.position);

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

