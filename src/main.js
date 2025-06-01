import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

const scene = new THREE.Scene();


const camera = new THREE.PerspectiveCamera(
  75,                                   
  window.innerWidth / window.innerHeight, 
  0.1,                                  
  1000                                
)
camera.position.z = 5;


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const geometry = new THREE.IcosahedronGeometry(); 
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); 
const sun = new THREE.Mesh(geometry, material); 
scene.add(sun); 


function animate() {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01; 
  cube.rotation.y += 0.01;

  renderer.render(scene, camera); 
}
animate();

























































































































