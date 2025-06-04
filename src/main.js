import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

const textures = {
  Earth: '/texture/8081_earthmap4k.jpg',
  Mars: '/texture/mars_1k_color.jpg'
};

// export function init() {
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

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.05));
  const pointLight = new THREE.DirectionalLight(0xffffff, 1);
  pointLight.position.set(100, 0, 50);
  pointLight.castShadow = true;
  pointLight.shadow.mapSize.height = 1024;
  pointLight.shadow.camera.near = 0.5;
  pointLight.shadow.camera.far = 500;
  pointLight.shadow.camera.left = -50;
  pointLight.shadow.camera.right = 50;
  pointLight.shadow.camera.top = 50;
  pointLight.shadow.camera.bottom = -50;
  scene.add(pointLight);

  // Stars
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

  let earthGroup;

  function earth() {
    earthGroup = new THREE.Group();
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(textures.Earth);
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(10, 32, 32),
      new THREE.MeshStandardMaterial({ map: earthTexture })
    );
    earth.position.set(0, 0, 0);
    earth.castShadow = true;
    earth.receiveShadow = true;
    const earthLabelDiv = document.createElement('div');
    earthLabelDiv.className = 'label';
    earthLabelDiv.textContent = 'Earth';
    earthLabelDiv.style.marginTop = '-1em';
    earthLabelDiv.style.color = 'white';
    // earthLabelDiv.style.background = 'rgba(0, 0, 0, 0.5)';
    earthLabelDiv.style.padding = '2px 6px';
    earthLabelDiv.style.borderRadius = '4px';
    earthLabelDiv.style.fontFamily = 'Arial, sans-serif';
    earthLabelDiv.style.fontSize = '14px';
    const earthLabel = new CSS2DObject(earthLabelDiv);
    earthLabel.position.set(-5, 11, 0);
    earth.add(earthLabel);
    // b~~~
    earthGroup.rotation.z = -23.4 * Math.PI / 180;
    earthGroup.add(earth);
    scene.add(earthGroup);
  }
  document.getElementById('load-earth').addEventListener('click', earth);

  // earth();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    if (earthGroup) {
    earthGroup.rotation.y += 0.002;
   }
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}


  animate();
// }
