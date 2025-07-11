import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { getFresnelMat } from './getFresnelMat.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { getFresnelMatMars } from './getFresnelMatMars.js';

    
const urlParams = new URLSearchParams(window.location.search);
const planet = urlParams.get("planet");


const fpsDisplay = document.createElement('div');
fpsDisplay.style.position = 'absolute';
fpsDisplay.style.top = '0';
fpsDisplay.style.left = '0';
fpsDisplay.style.color = 'lime';
fpsDisplay.style.fontFamily = 'monospace';
fpsDisplay.style.background = 'rgba(0,0,0,0.5)';
fpsDisplay.style.padding = '5px';
document.body.appendChild(fpsDisplay);

let lastTime = performance.now();
let frames = 0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 0, 300);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

scene.add(new THREE.AmbientLight(0xffffff, 0.03));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(500, 0, 67);
scene.add(dirLight);

function addStars({
  count = 8000,
  range = 2000,
  size = 0.7,
  sizeVariation = 0.5,
  colors = [0xffffff, 0xfff9c4, 0xcfd8dc],
  twinkle = true,
  animate = true
} = {}) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const sizes = [];
  const starColors = [];

  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * range;
    const y = (Math.random() - 0.5) * range;
    const z = (Math.random() - 0.5) * range;
    positions.push(x, y, z);

    sizes.push(size + Math.random() * sizeVariation);

    color.setHex(colors[Math.floor(Math.random() * colors.length)]);
    starColors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

  const material = new THREE.PointsMaterial({
    vertexColors: true,
    size: size,
    transparent: true,
    opacity: 0.9,
    depthWrite: false
  });

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);

  if (twinkle && animate) {
    const originalOpacities = new Float32Array(count).fill(1).map(() => Math.random() * 0.5 + 0.5);

    function updateTwinkle() {
      stars.material.opacity = 0.7 + Math.sin(Date.now() * 0.001) * 0.3;
      requestAnimationFrame(updateTwinkle);
    }

    updateTwinkle();
  }
}

addStars();const textures = {
  Earth: '/texture/8081_earthmap4k.jpg',
  Mars: '/texture/mars_1k_color.jpg',
  earthNight: '/texture/8081_earthlights4k.jpg',
  earthCloudtxt: 'texture/8081_earthhiresclouds4K.png',
  moonTxt: 'texture/moonmap4k.jpg',
  moonBumptxt: 'texture/07_moonbump4k.jpg',
  mercury: 'texture/mercury.jpg',
  venus: 'texture/8k_venus_surface.jpg',
  venusatmosphere: 'texture/4k_venus_atmosphere.jpg',
  mars: 'texture/8k_mars.jpg',
  jupiter: '/texture/8k_jupiter.jpg',
  uranus: '/texture/2k_uranus.jpg',
  neptune: '/texture/2k_neptune.jpg'
  
};

const objectInfo = new Map([
  ['Earth', {
    title: 'Earth',
    description: 'Earth is the third planet from the Sun and the only astronomical object known to harbor life. This is enabled by Earth being an ocean world, the only one in the Solar System sustaining liquid surface water. Almost all of Earths water is contained in its global ocean, covering 70.8% of Earths crust. The remaining 29.2% of Earths crust is land, most of which is located in the form of continental landmasses within Earths land hemisphere.'
  }],
  ['Moon', {
    title: 'Moon',
    description: 'The Moon is Earths only natural satellite. It orbits around Earth at an average distance of 384399 km (238,854 mi about 30 times Earths diameter). The Moon is tidally locked to Earth in synchronous rotation. This means that its rotation period (lunar day) and its orbital period (lunar month) are the same (29.5 Earth days)'
  }],
  ['Mercury', {
    title: 'Mercury',
    description: 'Mercury is the first planet from the Sun. It is a rocky planet with a trace atmosphere.'
  }],
  ['Venus', {
    title: 'Venus',
    description: 'Venus is the second planet from the Sun. It is a rocky planet with a dense, toxic atmosphere.'
  }],
  ['Mars', {
    title: 'Mars',
    description: 'Mars is the fourth planet from the Sun. It’s known as the Red Planet and may have once supported life.'
  }],
   ['jupiter', {
    title: 'jupiter',
    description: 'Mars is the fourth planet from the Sun. It’s known as the Red Planet and may have once supported life.'
  }],
  
]);

// The rest of your scene setup and animation code stays the same — just stripped `//` lines.



const raycaster = new THREE.Raycaster();
const raycastable = [];
let earthGroup;

function createLabel(text, offset) {
 const div = document.createElement('div');
 div.textContent = text;
 div.style.color = 'white';
 const label = new CSS2DObject(div);
 label.position.copy(offset);
 return label;
}


function createEarth() {
  if (earthGroup) return;
  const loader = new THREE.TextureLoader();
  const geometry = new THREE.IcosahedronGeometry(7, 16);
  const earthMat = new THREE.MeshStandardMaterial({ map: loader.load(textures.Earth) });
  const cityMat = new THREE.MeshStandardMaterial({ map: loader.load(textures.earthNight), blending: THREE.AdditiveBlending, transparent: true });
  const cloudMat = new THREE.MeshStandardMaterial({ map: loader.load(textures.earthCloudtxt), blending: THREE.AdditiveBlending, transparent: true });

  const earth = new THREE.Mesh(geometry, earthMat);
  earth.name = 'Earth';
  const city = new THREE.Mesh(geometry.clone(), cityMat);
  const clouds = new THREE.Mesh(geometry.clone(), cloudMat);
  const glow = new THREE.Mesh(geometry.clone(), getFresnelMat());
  glow.scale.setScalar(1.01);

  earth.add(createLabel('Earth', new THREE.Vector3(-5, 10, 0)));
  raycastable.push(earth);

  earthGroup = new THREE.Group();
  earthGroup.rotation.z = -23.4 * Math.PI / 180;
  earthGroup.add(earth, city, clouds, glow);
  scene.add(earthGroup);

  const moonGroup = new THREE.Group();
  earthGroup.add(moonGroup);

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(2, 32, 32),
    new THREE.MeshStandardMaterial({
      map: loader.load(textures.moonTxt),
      bumpMap: loader.load(textures.moonBumptxt),
      bumpScale: 0.5
    })
  );
  moon.name = 'Moon';
  moon.position.set(50, 0, 0);
  moon.add(createLabel('Moon', new THREE.Vector3(0, 3, 0)));
  moonGroup.add(moon);
  raycastable.push(moon);

  const orbitPoints = [], a = 100, b = 90, seg = 200;
  for (let i = 0; i <= seg; i++) {
    const t = (i / seg) * Math.PI * 2;
    orbitPoints.push(a * Math.cos(t), 0, b * Math.sin(t));
  }
  const orbitGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
  moonGroup.add(new THREE.Line(orbitGeo, new THREE.LineBasicMaterial({ 
    color: 0xffffff,
    linewidth: 3,
    opacity: 0.1,
    transparent: true
  })));
}

//createEarth()
let mercury;

function createMercury() {
 const loader = new THREE.TextureLoader();
 const geometry = new THREE.IcosahedronGeometry(10, 16);
 const mercuryMat = new THREE.MeshStandardMaterial({ map: loader.load(textures.mercury) });

 mercury = new THREE.Mesh(geometry, mercuryMat);
 mercury.name = 'Mercury';
 mercury.position.set(-0, 0, 0);
 mercury.add(createLabel('Mercury', new THREE.Vector3(0, 12, 0)));

 raycastable.push(mercury);
 scene.add(mercury);
}
//createMercury()

let jupiter;

function createJupiter() {
 const loader = new THREE.TextureLoader();
 const geometry = new THREE.IcosahedronGeometry(10, 16);
 const jupiterMat = new THREE.MeshStandardMaterial({ map: loader.load(textures.jupiter) });

 jupiter = new THREE.Mesh(geometry, jupiterMat);
 jupiter.name = 'jupiter';
 jupiter.position.set(-0, 0, 0);
 jupiter.add(createLabel('jupiter', new THREE.Vector3(0, 12, 0)));

 raycastable.push(jupiter);
 scene.add(jupiter);
}
createJupiter()

let venus;
function createVenus() {
  const loader = new THREE.TextureLoader();
  const geometry = new THREE.IcosahedronGeometry(10, 16);
  const venusMat = new THREE.MeshStandardMaterial({ map: loader.load(textures.venus) });

  venus = new THREE.Mesh(geometry, venusMat);
  venus.name = 'Venus';
  venus.position.set(0, 0, 0);

  const atmosphere = new THREE.Mesh(
    geometry.clone(),
    new THREE.MeshStandardMaterial({
      map: loader.load(textures.venusatmosphere),
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  atmosphere.scale.setScalar(1);
  
  const glow = new THREE.Mesh(geometry.clone(), getFresnelMatMars());
  glow.scale.setScalar(1.01);

  const venusGroup = new THREE.Group();
  venusGroup.add(venus, atmosphere, glow);
  venusGroup.rotation.z = THREE.MathUtils.degToRad(9);
  venus.add(createLabel('Venus', new THREE.Vector3(0, 11, 0)));

  raycastable.push(venus);
  scene.add(venusGroup);
}


let mars;
function createMars() {
  const loader = new THREE.TextureLoader();
  const geometry = new THREE.IcosahedronGeometry(10, 16);
  const marsMet = new THREE.MeshStandardMaterial({ map: loader.load(textures.mars) });

  mars = new THREE.Mesh(geometry, marsMet);
  mars.name = 'Mars';
  mars.position.set(0, 0, 0);
  mars.add(createLabel('Mars', new THREE.Vector3(0, 13, 0)));
  const glow = new THREE.Mesh(geometry.clone(), getFresnelMatMars());
  glow.scale.setScalar(1.01);
  mars.add(glow);
  raycastable.push(mars);
  scene.add(mars);
}


//createMars()

let hideInfoTimeout = null;
function handleRaycast(x, y) {
  const mouse = new THREE.Vector2((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(mouse, camera);
  const [hit] = raycaster.intersectObjects(raycastable, true);

  if (hit) {
  focusOn(hit.object);
  clearTimeout(hideInfoTimeout);
  } else {
    clearTimeout(hideInfoTimeout);
    hideInfoTimeout = setTimeout(() => {
    document.getElementById('info-panel').style.display = 'none';
    }, 10000);
  }
}

function focusOn(object) {
 const name = object.name || object.parent?.name;
 const info = objectInfo.get(name);
 if (!info) return;

 const pos = new THREE.Vector3();
 object.getWorldPosition(pos);
 const dir = new THREE.Vector3().subVectors(camera.position, pos).normalize();
 camera.position.copy(pos.clone().add(dir.multiplyScalar(40)));
 controls.target.copy(pos);

 const panel = document.getElementById('info-panel');
 panel.querySelector('#info-title').textContent = info.title;
 panel.querySelector('#info-description').textContent = info.description;
 panel.style.display = 'block';
}

window.addEventListener('resize', () => {
 camera.aspect = window.innerWidth / window.innerHeight;
 camera.updateProjectionMatrix();
 renderer.setSize(window.innerWidth, window.innerHeight);
 labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('click', e => handleRaycast(e.clientX, e.clientY));
window.addEventListener('touchstart', e => handleRaycast(e.touches[0].clientX, e.touches[0].clientY));

const infoPanel = document.createElement('div');
infoPanel.id = 'info-panel';
document.body.appendChild(infoPanel);


function animate() {
  requestAnimationFrame(animate);

  if (earthGroup) {
    earthGroup.rotation.y += 0.00001;
    const moon = earthGroup.getObjectByName('Moon');
    if (moon) {
    const time = Date.now() * 0.0000005;
    const a = 100, b = 90;
    moon.position.set(a * Math.cos(time), 0, b * Math.sin(time));
   }
 }
  labelRenderer.render(scene, camera);
 if (mercury) {
 mercury.rotation.z = THREE.MathUtils.degToRad(0.03);
 }

 if (venus) {
 venus.parent.rotation.y -= 0.0001;
 }

 controls.update();
 renderer.render(scene, camera);
 // scene.traverse(darkenNonBloomed);
 // camera.layers.set(BLOOM_LAYER);
 // bloomComposer.render();
 // camera.layers.set(1);
 // scene.traverse(restoreMaterials);
 const now = performance.now();
 frames++;

 if (now - lastTime >= 1000) {
 fpsDisplay.textContent = `FPS: ${frames}`;
 frames = 0;
 lastTime = now;
 }
}
animate();

