import * as THREE from "three";
import { EffectComposer } from "/node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "/node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";

// renderer
let scene, camera, renderer;
const canvas = document.querySelector("canvas");
scene = new THREE.Scene();
const fov = 60;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000;
camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 0, 8);
scene.add(camera);
renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});

const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;      
// controls.dampingFactor = 0.05;
controls.enablePan = true;


renderer.autoClear = false;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setClearColor(0x000000, 0.0);

// 
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4, 
  0.85 
);
bloomPass.threshold = 0;
bloomPass.strength = 2;
bloomPass.radius = 0;

const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

// Sun 
const sunColor = new THREE.Color("#fffae6");
const sunGeometry = new THREE.IcosahedronGeometry(1, 15);
const sunMaterial = new THREE.MeshStandardMaterial({
  color: sunColor,
  emissive: sunColor,
  emissiveIntensity: 5,
});
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.position.set(0, 0, 0);
sunMesh.layers.set(1); 
scene.add(sunMesh);


const pointLight = new THREE.PointLight(0xffcc66, 1.5, 50);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// const textureLoader = new THREE.TextureLoader();
// const galaxyTexture = textureLoader.load("texture/galaxy1.png");
// const galaxyGeometry = new THREE.SphereGeometry(80, 64, 64);
// const galaxyMaterial = new THREE.MeshBasicMaterial({
//   map: galaxyTexture,
//   side: THREE.BackSide,
//   transparent: true,
// });
// const galaxyMesh = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
// galaxyMesh.layers.set(1); 
// scene.add(galaxyMesh);


const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);


window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  bloomComposer.setSize(window.innerWidth, window.innerHeight);
});


function animate() {
  requestAnimationFrame(animate);
  // galaxyMesh.rotation.y += 0.001;
  controls.update();
  camera.layers.set(1); 
  bloomComposer.render();
}

animate();



