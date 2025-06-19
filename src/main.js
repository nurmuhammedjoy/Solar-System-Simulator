import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let sun, corona, particles;
let animationSpeed = 1;
let glowIntensity = 1.5;
let coronaSize = 1.8;

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
  star: 'texture/circle.png'
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 30);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

function createSun() {
  const geometry = new THREE.SphereGeometry(2, 64, 64);

  const sunMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      glowIntensity: { value: glowIntensity }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      uniform float time;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        vUv = uv;

        vec3 pos = position;
        float noise = sin(pos.x * 3.0 + time) * cos(pos.y * 3.0 + time * 0.7) * sin(pos.z * 3.0 + time * 0.3) * 0.05;
        pos += normal * noise;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      uniform float time;
      uniform float glowIntensity;

      void main() {
        vec3 sunColor = vec3(1.0, 0.6, 0.1);
        vec3 hotColor = vec3(1.0, 0.9, 0.3);

        float pattern = sin(vUv.x * 20.0 + time) * cos(vUv.y * 15.0 + time * 0.7);
        pattern += sin(vUv.x * 30.0 - time * 0.5) * cos(vUv.y * 25.0 - time * 0.3) * 0.5;
        pattern = pattern * 0.3 + 0.7;

        vec3 finalColor = mix(sunColor, hotColor, pattern);

        float fresnel = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
        fresnel = pow(fresnel, 2.0);
        finalColor += vec3(1.0, 0.5, 0.0) * fresnel * glowIntensity;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  });

  sun = new THREE.Mesh(geometry, sunMaterial);
  scene.add(sun);
}

function createCorona() {
  const geometry = new THREE.SphereGeometry(2 * coronaSize, 32, 32);

  const coronaMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      glowIntensity: { value: glowIntensity }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float time;
      uniform float glowIntensity;

      void main() {
        vec3 coronaColor = vec3(1.0, 0.4, 0.0);

        float fresnel = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
        fresnel = pow(fresnel, 3.0);

        float opacity = fresnel * 0.3 * glowIntensity;
        opacity *= (sin(time * 2.0) * 0.2 + 0.8);

        gl_FragColor = vec4(coronaColor, opacity);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });

  corona = new THREE.Mesh(geometry, coronaMaterial);
  scene.add(corona);
}

function createParticles() {
  const particleCount = 1000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    const radius = Math.random() * 20 + 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    colors[i3] = 1.0;
    colors[i3 + 1] = Math.random() * 0.5 + 0.3;
    colors[i3 + 2] = Math.random() * 0.3;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

const sunLight = new THREE.PointLight(0xffffff, 500, 200);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const earthGeo = new THREE.SphereGeometry(1, 32, 32);
const earthMat = new THREE.MeshStandardMaterial({ color: 0x3D9BE9 });
const earth = new THREE.Mesh(earthGeo, earthMat);

const earthOrbit = new THREE.Object3D();
earth.position.x = 15;
earthOrbit.add(earth);
scene.add(earthOrbit);

function getStarfield(numStars = 5000) {
  function randomSpherePoint() {
    const radius = Math.random() * 50 + 50;
    const theta = 5 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    return new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    );
  }

  const verts = [];
  const colors = [];

  for (let i = 0; i < numStars; i++) {
    const pos = randomSpherePoint();
    verts.push(pos.x, pos.y, pos.z);
    const col = new THREE.Color().setHSL(0.6, 0.2, Math.random());
    colors.push(col.r, col.g, col.b);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(textures.star, (starTexture) => {
    const mat = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      map: starTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const stars = new THREE.Points(geo, mat);
    scene.add(stars);
  });
}

getStarfield(1000);
createSun();
createCorona();
createParticles();

function animate() {
  requestAnimationFrame(animate);
  earth.rotation.y += 0.02;
  earthOrbit.rotation.y += 0.005;
  if (sun && sun.material.uniforms.time) sun.material.uniforms.time.value += 0.01 * animationSpeed;
  if (corona && corona.material.uniforms.time) corona.material.uniforms.time.value += 0.01 * animationSpeed;
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});