import * as THREE from "three";
import { GLTFLoader } from "./lib/GLTFLoader.js";

import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
} from "postprocessing";

const canvReference = document.getElementById("renderer");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 2000);
const rendererHeight = document.getElementById("renderer").offsetHeight;
const rendererWidth = document.getElementById("renderer").offsetHeight;
var rVal = 0;
var gVal = 0.5;
var bVal = 1;
var color2 = new THREE.Color("#23a6d5");
var colorsPick = ["#23d5ab", "#b4c62d", "#ee7752", "#23a6d5"];
var devMode = false;

// Select the canvas from the document
const renderer = new THREE.WebGLRenderer({
  canvas: canvReference,
  antialias: true,
  alpha: true,
});

// Set size of render window and scale properly based on screen size
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(rendererWidth, rendererHeight);

// Renderer and Composer
const composer = new EffectComposer(renderer);
const renderScene = new RenderPass(scene, camera);
composer.setSize(rendererWidth, rendererHeight);
composer.addPass(renderScene);

// Bloom Pass
composer.addPass(
  new EffectPass(
    camera,
    new BloomEffect({
      luminanceThreshold: 0.1,
      luminanceSmoothing: 0.01,
      resolutionScale: 1,
      intensity: 1,
      mipmapBlur: true,
      radius: 0.3,
    })
  )
);

// Add basic material
const material = new THREE.MeshBasicMaterial({
  color: color2,
  wireframe: true,
  vertexColors: false,
});

// Load model and set position
const loader = new GLTFLoader();
var model = new THREE.Object3D();
const light = new THREE.PointLight(0xff0000, 1, 100);
light.position.set(50, 50, 50);
scene.add(light);

loader.load(
  "assets/model.glb",
  function (gltf) {
    model = gltf.scene;
    model.traverse((child) => {
      if (child.isMesh) {
        gltf.scene.scale.set(30, 30, 30);
        child.material = material;
      }
    });
    model.rotation.x = 0; // Set rotation here
    model.rotation.y = -2.7;
    model.rotation.z = -0.4;
    model.position.y = -1.3;
    scene.add(gltf.scene);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

if (devMode) {
  console.log(model);
}

// set camera position
camera.position.z = 20;
model.material = material;

// Main animation call to step frame
function animate() {
  if (!down) {
    model.rotation.y += 0.003;
  }
  composer.render();
  requestAnimationFrame(animate);
}

animate();

if (devMode) {
  console.log(colorsPick[getRandomInt(0, 4)]);
}

// Loading screen
THREE.DefaultLoadingManager.onLoad = function () {
  console.log("Loading Complete!");
  canvReference.classList.add("fade-in");
};

function cycleColorsOld() {
  if (rVal <= 1) {
    rVal += 0.01;
  } else {
    rVal = 0;
  }
  if (gVal <= 1) {
    gVal += 0.01;
  } else {
    gVal = 0;
  }
  if (bVal <= 1) {
    bVal += 0.01;
  } else {
    bVal = 0;
  }
}

let currentColor = new THREE.Color("#0080ff");
let targetColor = new THREE.Color(0xfff80f);

var onKeyDown = function (event) {
  if (event.keyCode == 67 && devMode) {
    console.log(model);
  }
};
document.addEventListener("keydown", onKeyDown, false);

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function lerpColor() {
  if (devMode) {
    console.log("lerpColor started");
  }
  currentColor.lerp(targetColor, 0.05);
  model.traverse((child) => {
    if (child.isMesh) {
      child.material.color.copy(currentColor);
    }
  });
}

function transitionColor() {
  if (devMode) {
    console.log("transitionColor started");
  }
  return new Promise((resolve) => {
    var i = 0;
    setInterval(() => {
      if (i <= 150) {
        lerpColor();
        i++;
      } else {
        resolve("resolved");
      }
    }, 20);
  });
}

async function cycleColors() {
  if (devMode) {
    console.log("cycleColors started");
  }
  currentColor = new THREE.Color("#0080ff");
  targetColor = new THREE.Color(colorsPick[0]);
  await transitionColor();

  currentColor = new THREE.Color("#" + getCurrentColor());
  targetColor = new THREE.Color(colorsPick[1]);
  await transitionColor();

  currentColor = new THREE.Color("#" + getCurrentColor());
  targetColor = new THREE.Color(colorsPick[2]);
  await transitionColor();

  currentColor = new THREE.Color("#" + getCurrentColor());
  targetColor = new THREE.Color(colorsPick[3]);
  await transitionColor();

  if (devMode) {
    console.log("here we go again");
  }
  cycleColors();
}

cycleColors();

function getCurrentColor() {
  let currentHexColor = "";
  model.traverse((child) => {
    if (child.isMesh) {
      currentHexColor = child.material.color.getHexString();
    }
  });
  return currentHexColor;
}

var down = false;

canvReference.addEventListener("mouseover", () => {
  // Change the button's background color
  down = true;
});

// Add a mouseout event listener
canvReference.addEventListener("mouseout", () => {
  // Change the button's background color back to its original color
  down = false;
});

canvReference.addEventListener("mousemove", (event) => {
  if (down) {
    model.rotation.y = event.clientX / window.innerWidth - 2.5;
    model.rotation.x = event.clientY / window.innerHeight - 0.2;
  }
});

console.log("is it just me or is it a bit too quiet in here...");
