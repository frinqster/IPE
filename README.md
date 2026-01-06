# INTERACTIVE PARTICLE ENGINE [IPE] v1.2

![Project Banner](Assets/Logo/social-preview.jpg)

> **A Gesture-Controlled 3D Interface.**  
> Control up to 32,000 particles with your hands directly in the browser using WebGL and Computer Vision.

[![License: MIT](https://img.shields.io/badge/License-MIT-00ffcc.svg)](https://opensource.org/licenses/MIT)
[![Three.js](https://img.shields.io/badge/Powered%20by-Three.js-white.svg)](https://threejs.org/)
[![MediaPipe](https://img.shields.io/badge/AI-MediaPipe-blue.svg)](https://google.github.io/mediapipe/)

---

## 📑 TABLE OF CONTENTS
1. [System Overview](#system-overview)
2. [Live Demo](#live-demo)
3. [Documentation](#documentation)
4. [Gesture Controls](#gesture-controls)
5. [Tech Stack](#tech-stack)
6. [Installation & Setup](#installation-setup)
7. [Configuration](#configuration)
8. [Troubleshooting](#troubleshooting)
9. [Author](#author)

---

## <a id="system-overview"></a>⚡ SYSTEM OVERVIEW

The **Interactive Particle Engine (IPE)** is an advanced experiment in spatial UI and generative art. It leverages **Three.js** for high-performance WebGL rendering and **MediaPipe** for real-time, client-side hand and face tracking.

The system maps physical movements to a digital particle cloud, allowing users to manipulate 3D geometry, control time, and visualize audio frequencies without touching a mouse or keyboard.

### ✨ KEY FEATURES
*   **Real-time AI Tracking:** Detects hands and face landmarks instantly.
*   **32,000+ Particles:** GPU-accelerated simulation with custom shaders.
*   **Post-Processing Stack:** Cinematic visuals with Unreal Bloom and Motion Blur (Afterimage).
*   **Audio Reactive:** 
    *   **Microphone Mode:** Visualize your voice or ambient sound.
    *   **File Mode:** Drag & drop MP3/WAV files for custom frequency analysis.
*   **Face Geometry Mapping:** Morph particles into a 3D scan of your face.
*   **Stealth & Supernova Modes:** Special physics interactions.
*   **Privacy Focused:** All processing is done **locally** on your device. No video is sent to the cloud.

---

## <a id="live-demo"></a>🌐 LIVE DEMO

*   **Primary Link:** [project-ipe.netlify.app](https://project-ipe.netlify.app/)
*   **Alternative Link:** [frinqster.github.io/IPE](https://frinqster.github.io/IPE)

*(Note: Requires Camera & Microphone access)*

---

## <a id="documentation"></a>📄 DOCUMENTATION

For a deep dive into the system architecture, mathematical models, and operational logic, please refer to the official technical documentation included in the repository:

[**📥 Download Technical Specification (PDF)**](Docs/IPE%20Documentation.pdf)

---

## <a id="gesture-controls"></a>🎮 GESTURE CONTROLS

The system is controlled entirely by hand movements. Ensure your hand is visible and the lighting is good.

<table>
  <thead>
    <tr>
      <th align="left">Gesture</th>
      <th align="left">Action</th>
      <th align="left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td valign="middle"><strong>✊ FIST</strong></td>
      <td valign="middle"><strong>RESET / IDLE</strong></td>
      <td valign="middle">Resets the system to default state. Exits any active mode.</td>
    </tr>
    <tr>
      <td valign="middle"><strong>🖐 OPEN HAND</strong></td>
      <td valign="middle"><strong>ROTATE CAMERA</strong></td>
      <td valign="middle">Move your hand to look around the 3D scene.</td>
    </tr>
    <tr>
      <td valign="middle"><strong>👐 TWO HANDS</strong></td>
      <td valign="middle"><strong>ZOOM</strong></td>
      <td valign="middle">Move hands apart to zoom in, close to zoom out.</td>
    </tr>
    <tr>
      <td valign="middle"><strong>✌️ PEACE SIGN</strong></td>
      <td valign="middle"><strong>NEXT SHAPE</strong></td>
      <td valign="middle">Cycles through 3D forms (Sphere, Cube, Galaxy, Human, etc.).</td>
    </tr>
    <tr>
      <td valign="middle"><strong><img src="Assets/Emojis/3_finger_emoji.png" height="23" valign="middle"> 3-FINGER</strong></td>
      <td valign="middle"><strong>TIME FREEZE</strong></td>
      <td valign="middle">Pauses particle movement. (Play/Pause in File Mode).</td>
    </tr>
    <tr>
      <td valign="middle"><strong><img src="Assets/Emojis/pinch_emoji.png" height="20" valign="middle"> PINCH</strong></td>
      <td valign="middle"><strong>IMPLODE</strong></td>
      <td valign="middle">Collapses particles to the center.</td>
    </tr>
    <tr>
      <td valign="middle"><strong>🤘 ROCK ON</strong></td>
      <td valign="middle"><strong>EXPLODE</strong></td>
      <td valign="middle">Scatters particles chaotically.</td>
    </tr>
    <tr>
      <td valign="middle"><strong><img src="Assets/Emojis/pinch_emoji.png" height="20" valign="middle"> PINCH (HOLD)</strong></td>
      <td valign="middle"><strong>SUPERNOVA</strong></td>
      <td valign="middle">Charge up for 4 seconds to trigger a massive explosion.</td>
    </tr>
    <tr>
      <td valign="middle"><strong>🤫 INDEX TO LIP</strong></td>
      <td valign="middle"><strong>STEALTH MODE</strong></td>
      <td valign="middle">Dims lights and activates pulsing silent mode.</td>
    </tr>
    <tr>
      <td valign="middle"><strong><img src="Assets/Emojis/fist_to_mouth_emoji.png" height="23" valign="middle"> FIST TO MOUTH</strong></td>
      <td valign="middle"><strong>MIC VISUALIZER</strong></td>
      <td valign="middle">Activates microphone-based frequency bars.</td>
    </tr>
    <tr>
      <td valign="middle"><strong>👍 THUMBS UP</strong></td>
      <td valign="middle"><strong>FACE SCAN</strong></td>
      <td valign="middle">Maps the particle cloud to your face geometry.</td>
    </tr>
  </tbody>
</table>

> **ℹ️ NOTE:** For visual references and more detailed explanations of each interaction, please consult the **SYSTEM MANUAL** located inside the **HELP** modal overlay on the website.

---


## <a id="tech-stack"></a>🛠 TECH STACK

*   **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+)
*   **Rendering Engine:** [Three.js (r128)](https://threejs.org/)
*   **Computer Vision:** [MediaPipe Hands & FaceMesh](https://google.github.io/mediapipe/)
*   **Shaders:** Custom GLSL (Vertex & Fragment)
*   **Effects:** EffectComposer (UnrealBloom, AfterimagePass)

---

## <a id="installation-setup"></a>🚀 INSTALLATION & SETUP

To run this project locally on your machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/frinqster/IPE.git
    cd IPE
    ```

2.  **Run a Local Server:**
    Due to browser security policies regarding Camera/Microphone access (`getUserMedia`), this project **cannot** be run simply by double-clicking `index.html`. You must serve it.

    *   **VS Code (Recommended):** Install the "Live Server" extension, right-click `index.html`, and select "Open with Live Server".
    *   **Python:**
        ```bash
        # Python 3.x
        python -m http.server 8000
        ```
    *   **Node/NPM:**
        ```bash
        npx serve .
        ```

3.  **Open in Browser:**
    Navigate to `http://localhost:5500` (or the port specified by your server).

---

## <a id="configuration"></a>⚙️ CONFIGURATION

The system includes a built-in **Neural Calibration Menu** (Click the ⚙️ Gear icon in the bottom right).

*   **System Core:** Adjust Performance Mode (Particle Count 6k-32k), Rotation Speed, and Explosion Force.
*   **Visual Aesthetics:** Customize particle colors (HSV/RGB Picker) and Motion Blur intensity.
*   **Audio Link:** Upload local audio files and adjust Visualizer sensitivity/smoothing.
*   **Special Protocols:** Configure "Supernova" vibration/charge time and "Stealth Mode" pulse speed.
*   **Face Geometry:** Calibrate the 3D mask offset and scale to match your camera position.

---

## <a id="troubleshooting"></a>⚠️ TROUBLESHOOTING

*   **"Permission Denied":** Ensure you have allowed Camera and Microphone access in your browser settings.
*   **Low FPS:** Open the settings menu and switch Performance Mode to "Low" or "Medium". Turn off Motion Blur.
*   **Gestures Not Working:** Ensure your hand is well-lit and your palm is facing the camera.
*   **More FAQs:** For a complete list of common issues and detailed solutions, please consult the **SYSTEM MANUAL** located in the **HELP** modal overlay of the live website.

---

## <a id="author"></a>👨‍💻 AUTHOR

**Syed Faiq Hussain**

*   **GitHub:** [@frinqster](https://github.com/frinqster)
*   **Email:** faiqsyed594@gmail.com

---

**© 2026 Interactive Particle Engine. All Rights Reserved.**
