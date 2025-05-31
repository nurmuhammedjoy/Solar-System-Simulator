
import * as THREE from 'three';


// camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// test 
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// requestAnimatior
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();

const planetData = [
{ name: 'Sun', mass: 1989000, radius: 696340, distance: 0, period: 0, color: 0xffff00, emission: 0xffaa00 },
 { name: 'Mercury', mass: 0.330, radius: 2439, distance: 0.387, period: 88, color: 0x8c7853 },
 { name: 'Venus', mass: 4.87, radius: 6052, distance: 0.723, period: 225, color: 0xffa500 },
 { name: 'Earth', mass: 5.97, radius: 6371, distance: 1.0, period: 365, color: 0x4169e1 },
 { name: 'Mars', mass: 0.642, radius: 3390, distance: 1.524, period: 687, color: 0xcd5c5c },
 { name: 'Jupiter', mass: 1898, radius: 69911, distance: 5.203, period: 4333, color: 0xd2691e },
 { name: 'Saturn', mass: 568, radius: 58232, distance: 9.537, period: 10759, color: 0xffd700 },
 { name: 'Uranus', mass: 86.8, radius: 25362, distance: 19.191, period: 30687, color: 0x4fd0e7 },
 { name: 'Neptune', mass: 102, radius: 24622, distance: 30.069, period: 60190, color: 0x4169e1 }
];

















