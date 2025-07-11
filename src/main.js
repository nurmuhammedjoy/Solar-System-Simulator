import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { getFresnelMat } from './getFresnelMat';
import { getVenusFresnelMat } from './getVenusFresnelMat';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';


// const canvas = document.getElementById('canvas');
// const ctx = canvas.getContext('2d');
// let animationId;
// let isPaused = false;
// let time = 0;
        
function int (){
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
let frames = null;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 100, 300);


    function createSun(radius = 2) {
      const sunGeometry = new THREE.SphereGeometry(radius, 64, 64);
      const sunMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color1: { value: new THREE.Color(0xff4500) },
          color2: { value: new THREE.Color(0xffff00) },
          color3: { value: new THREE.Color(0xff8c00) }
        },
        vertexShader: `
          uniform float time;
          varying vec3 vNormal;
          varying vec3 vPosition;
          varying vec2 vUv;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            vUv = uv;
            vec3 pos = position;
            float noise = sin(pos.x * 5.0 + time) * cos(pos.y * 5.0 + time) * sin(pos.z * 5.0 + time);
            pos += normal * noise * 0.05;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 color1, color2, color3;
          varying vec3 vNormal, vPosition;
          varying vec2 vUv;
          void main() {
            float p1 = sin(vPosition.x * 10.0 + time * 2.0) * cos(vPosition.y * 10.0 + time * 1.5);
            float p2 = sin(vPosition.z * 8.0 + time * 3.0) * cos(vPosition.x * 6.0 + time * 2.5);
            float intensity = (p1 + p2) * 0.5 + 0.5;
            vec3 baseColor = mix(color1, color2, intensity);
            vec3 finalColor = mix(baseColor, color3, sin(time + intensity * 3.14) * 0.5 + 0.5);
            float rim = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
            finalColor += vec3(1.0, 0.8, 0.3) * rim * 0.5;
            float pulse = sin(time * 4.0) * 0.1 + 0.9;
            gl_FragColor = vec4(finalColor * pulse, 1.0);
          }
        `
      });
      const sun = new THREE.Mesh(sunGeometry, sunMaterial);

      const coronaGeometry = new THREE.SphereGeometry(radius, 32, 32);
      const coronaMaterial = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
          uniform float time;
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec3 pos = position * 1.2;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          varying vec3 vNormal;
          void main() {
            float intensity = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
            float glow = sin(time * 2.0) * 0.3 + 0.7;
            vec3 glowColor = vec3(1.0, 0.6, 0.2);
            gl_FragColor = vec4(glowColor, intensity * glow * 0.3);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
      });
      const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);

      return { sun, corona, update: (time) => {
        sunMaterial.uniforms.time.value = time;
        coronaMaterial.uniforms.time.value = time;
      }};
    }


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

scene.add(new THREE.AmbientLight(0xffffff, 0.05));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(500, 0, 67);
scene.add(dirLight);
function addStars(count = 4000, range = 2000) {
  const geometry = new THREE.BufferGeometry();
  const positions = Array.from({ length: count * 3 }, () => (Math.random() - 0.5) * range);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
  scene.add(new THREE.Points(geometry, material));
}
addStars();


// const sunGeo = new THREE.SphereGeometry(10, 64, 64);
// const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); 
// const sun = new THREE.Mesh(sunGeo, sunMat);
// scene.add(sun);
// sun.position.set(500, 0, 67);
// sun.layers.set(BLOOM_LAYER); 
// const renderScene = new RenderPass(scene, camera);
// const bloomPass = new UnrealBloomPass(
//   new THREE.Vector2(window.innerWidth, window.innerHeight),
//   0.7,  
//   1,  
//   0.0
// );
// const composer = new EffectComposer(renderer);
// composer.addPass(renderScene);
// composer.addPass(bloomPass);


// function darkenNonBloomed(obj) {
//   if (obj.isMesh && obj.layers.test(camera.layers) === false) {
//     materials[obj.uuid] = obj.material;
//     obj.material = darkMaterial;
//   }
// }

// function restoreMaterials(obj) {
//   if (materials[obj.uuid]) {
//     obj.material = materials[obj.uuid];
//     delete materials[obj.uuid];
//   }
// }

const textures = {
  Earth: '/texture/8081_earthmap4k.jpg',
  Mars: '/texture/mars_1k_color.jpg',
  earthNight: '/texture/8081_earthlights4k.jpg',
  earthCloudtxt: 'texture/8081_earthhiresclouds4K.png',
  moonTxt: 'texture/moonmap4k.jpg',
  moonBumptxt: 'texture/07_moonbump4k.jpg',
  mercury: 'texture/mercury.jpg',
  venus: 'texture/8k_venus_surface.jpg',
  venusatmosphere: 'texture/4k_venus_atmosphere.jpg',
  mars: 'texture/8k_mars.jpg'
};

const objectInfo = new Map([
  ['Earth', {
    title: 'Earth',
    description: 'Earth is the third planet from the Sun and the only astronomical object known to harbor life.'
  }],
  ['Moon', {
    title: 'Moon',
    description: 'The Moon is Earth\'s only natural satellite and the fifth largest satellite in the Solar System.'
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
]);

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

  earth.add(createLabel('Earth', new THREE.Vector3(-5, 11, 0)));
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

  const orbitPoints = [], a = 100, b = 80, seg = 200;
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
// createEarth();


let mercury;

function createMercury() {
  const loader = new THREE.TextureLoader();
  const geometry = new THREE.IcosahedronGeometry(3, 16);
  const mercuryMat = new THREE.MeshStandardMaterial({ map: loader.load(textures.mercury) });

  mercury = new THREE.Mesh(geometry, mercuryMat);
  mercury.name = 'Mercury';
  mercury.position.set(-40, 0, 0);
  mercury.add(createLabel('Mercury', new THREE.Vector3(0, 5, 0)));

  raycastable.push(mercury);
  scene.add(mercury);
}

let venus;

function createVenus() {
  const loader = new THREE.TextureLoader();
  const geometry = new THREE.IcosahedronGeometry(3, 16);
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

  const venusGroup = new THREE.Group();
  venusGroup.add(venus, atmosphere);
  venusGroup.rotation.z = THREE.MathUtils.degToRad(177.4);
  venus.add(createLabel('Venus', new THREE.Vector3(0, -4, 0)));

  raycastable.push(venus);
  scene.add(venusGroup);
}

//createVenus();
let mars;

function createMars() {
  const loader = new THREE.TextureLoader();
  const geometry = new THREE.IcosahedronGeometry(10, 16);
  const marsMet = new THREE.MeshStandardMaterial({ map: loader.load(textures.mars) });

  mars = new THREE.Mesh(geometry, marsMet);
  mars.name = 'Mars';
  mars.position.set(0, 0, 0);
  mars.add(createLabel('Mars', new THREE.Vector3(0, 5, 0)));

  raycastable.push(mars);
  scene.add(mars);
}

createMars()

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
  camera.position.copy(pos.clone().add(dir.multiplyScalar(50)));
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
infoPanel.style = 'position:absolute;top:20px;right:20px;background:rgba(0,0,0,0.8);color:white;padding:10px;border-radius:10px;max-width:250px;font-family:sans-serif;display:none;z-index:999;';
infoPanel.innerHTML = '<h3 id="info-title"></h3><p id="info-description"></p>';
document.body.appendChild(infoPanel);




function animate() {
  requestAnimationFrame(animate);

  if (earthGroup) {
    earthGroup.rotation.y += 0.00001;
    const moon = earthGroup.getObjectByName('Moon');
    if (moon) {
      const time = Date.now() * 0.0000005;
      const a = 100, b = 80;
      moon.position.set(a * Math.cos(time), 0, b * Math.sin(time));
    }
  }

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
}
int()