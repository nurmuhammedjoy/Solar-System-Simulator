# 🌌 Solar System Simulator (Three.js + Vite)

This is a simple 3D Solar System Simulator built with **Three.js** and **Vite**.  
Currently under development and optimized for low-resource environments like **Termux** on Android.

## 🚀 Features

- Basic 3D solar system scene
- Four planets added for performance (Mercury, Venus, Earth, Mars)
- Clickable planets (planned: focus/zoom + info panel)
- OrbitControls for smooth camera movement

## ⚙️ Technologies Used

- [Three.js](https://threejs.org/) – for rendering the 3D scene
- [Vite](https://vitejs.dev/) – for fast development server and bundling
- Native Termux + proot (optional)

## ⚠️ Issues

- ❗ **Vite server keeps crashing**  
  Unsure if this is due to:
  - Running in **Termux**, which may have limitations (especially around filesystem, Node.js, or networking).
  - **Three.js** being a large/heavy library and hitting memory or CPU constraints.
  

## 🛠️ Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# OR build and preview
npm run build
npm run preview
