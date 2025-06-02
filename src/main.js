import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const textures = {
  Earth: '/texture/8081_earthmap2k.jpg',
  Mars: '/texture/mars_1k_color.jpg'
};

const planetData = [
  { name: 'Earth', radius: 6.371, orbit: 150, orbitSpeed: 0.0001, rotationSpeed: 0.005, day: 24 },
  { name: 'Mars', radius: 3.389, orbit: 228, orbitSpeed: 0.0008, rotationSpeed: 0.004, day: 24.6 }
];

export function init() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
  camera.position.set(0, 100, 300);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Lighting
scene.add(new THREE.AmbientLight(0xffffff, 1.5));
const sunLight = new THREE.PointLight(0xffffff, 5, 1000);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(1, 1, 1
);
scene.add(directionalLight
);


  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(20, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0xffff00, emissive: 0xffff00 })
  );
  sun.castShadow = false;
sun.receiveShadow = false;

  scene.add(sun);

  // Planets    
  const loader = new THREE.TextureLoader();
  const meshes = [];
  const angles = [];

  planetData.forEach(data => {
    const texture = loader.load(textures[data.name]);
    const geometry = new THREE.SphereGeometry(data.radius * 2, 64, 64);
    const material = new THREE.MeshPhongMaterial({ map: texture });
    const planet = new THREE.Mesh(geometry, material);
    planet.name = data.name;
    planet.userData = data;
    scene.add(planet);
    meshes.push(planet);
    angles.push(Math.random() * Math.PI * 2);
    const orbit = new THREE.RingGeometry(data.orbit - 0.1, data.orbit + 0.1, 64);
    const orbitMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.15 });
    const ring = new THREE.Mesh(orbit, orbitMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
  });

  // Interaction
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let target = null;
  const offset = new THREE.Vector3(0, 10, 30);
  const panel = document.getElementById('infoPanel');

  function showInfo(planet) {
    const { name, radius, orbit, day } = planet.userData;
    panel.innerHTML = `
      <strong>${name}</strong><br>
      Radius: ${radius} km<br>
      Distance from Sun: ${orbit}M km<br>
      Day length: ${day} hrs
    `;
    panel.style.display = 'block';
  }

  function hideInfo() {
    panel.style.display = 'none';
  }

  window.addEventListener('click', e => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects(meshes)[0];
    if (hit) {
      target = hit.object;
      showInfo(target);
    }
  });

  window.addEventListener('dblclick', () => { target = null; hideInfo(); });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') { target = null; hideInfo(); } });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    meshes.forEach((planet, i) => {
      const { orbit, orbitSpeed, rotationSpeed } = planet.userData;
      angles[i] += orbitSpeed;
      planet.position.set(
        Math.cos(angles[i]) * orbit,
        0,
        Math.sin(angles[i]) * orbit
      );
      planet.rotation.y += rotationSpeed;
    });

    if (target) {
      camera.position.lerp(target.position.clone().add(offset), 1);
      controls.target.lerp(target.position, 1);
    }

    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
