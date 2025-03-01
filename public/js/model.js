import * as THREE from 'three';
import { gsap } from 'gsap';

// Canvas and Scene Setup
const canvas = document.querySelector('canvas.webgl-secondary');
const scene = new THREE.Scene();

// Galaxy Parameters
const parameters = {
    count: 400000,
    size: 0.005,
    radius: 8,
    branches: 5,
    spin: 1,
    randomness: 0.3,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984'
};

// Generate Galaxy
let galaxyGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(parameters.count * 3);
const colors = new Float32Array(parameters.count * 3);
const insideColor = new THREE.Color(parameters.insideColor);
const outsideColor = new THREE.Color(parameters.outsideColor);

for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;
    const radius = Math.sqrt(Math.random()) * parameters.radius;
    const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;
    const spinAngle = radius * parameters.spin * 0.5;
    const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
    const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
    const mixedColor = insideColor.clone();
    mixedColor.lerp(outsideColor, radius / parameters.radius);
    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
}

galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
const galaxyMaterial = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
});
const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
scene.add(galaxy);

// Sphere Object with Per-Vertex Colors
// Sphere Object with Per-Vertex Colors
const sphereGeometry = new THREE.SphereGeometry(1, 64, 18);
const sphereColors = new Float32Array(sphereGeometry.attributes.position.count * 3); // Create color buffer

// Assign random colors per vertex
for (let i = 0; i < sphereGeometry.attributes.position.count; i++) {
    const t = Math.random(); // Random blend factor between 0 (orange) and 1 (blue)

    // Blend between orange (ff6030) and blue (1b3984)
    const orange = new THREE.Color(0xff6030);
    const blue = new THREE.Color(0x1b3984);
    const mixedColor = orange.clone().lerp(blue, t); // Smooth transition between the two

    sphereColors[i * 3] = mixedColor.r;     // Red component
    sphereColors[i * 3 + 1] = mixedColor.g; // Green component
    sphereColors[i * 3 + 2] = mixedColor.b; // Blue component
}

// Apply per-vertex colors
sphereGeometry.setAttribute('color', new THREE.Float32BufferAttribute(sphereColors, 3));

// Change to `MeshBasicMaterial` instead of `PointsMaterial`
const sphereMaterial = new THREE.MeshBasicMaterial({
    vertexColors: true,  // Enable per-vertex coloring
    wireframe: true      // Keep it looking like your current effect
});

const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(0, 1, 0);
scene.add(sphere);


// Light Setup
const light = new THREE.PointLight('#ffffff', 1, 100);
light.position.set(2, 3, 4);
scene.add(light);

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3, 6);
camera.lookAt(0, 1, 0);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Create Popup Container for Image and Text
const popupContainer = document.createElement('div');
popupContainer.style.position = 'fixed';
popupContainer.style.top = '50%';
popupContainer.style.left = '50%';
popupContainer.style.transform = 'translate(-50%, -50%)';
popupContainer.style.padding = '15px';
popupContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'; // Dark background
popupContainer.style.border = '2px solid white';
popupContainer.style.borderRadius = '10px';
popupContainer.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
popupContainer.style.display = 'none'; // Hidden initially
popupContainer.style.textAlign = 'center';
popupContainer.style.zIndex = '9999';

// Create Image Element
const popupImage = document.createElement('img');
popupImage.src = 'images/galaxy.png'; // Replace with your image path
popupImage.style.width = '300px'; // Adjust size as needed
popupImage.style.display = 'block'; 
popupImage.style.marginBottom = '10px';
popupImage.style.borderRadius = '5px';
popupImage.style.cursor = 'pointer'; // Make it clear the image is clickable

// Create Text Element
const popupText = document.createElement('p');
popupText.innerText = 'Click the image to visit the website!'; // Change this text as needed
popupText.style.color = 'white';
popupText.style.fontSize = '18px';
popupText.style.fontFamily = 'Arial, sans-serif';
popupText.style.margin = '0';

// Append Image and Text to Container
popupContainer.appendChild(popupImage);
popupContainer.appendChild(popupText);
document.body.appendChild(popupContainer);

// Click Event to Show Popup and Hide Sphere
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

canvas.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(sphere);

    if (intersects.length > 0) {
        gsap.to(sphere.scale, { x: 2, y: 2, z: 2, duration: 0.5, onComplete: () => {
            sphere.visible = false; // Hide sphere when popup appears
            popupContainer.style.display = 'block'; // Show popup
        }});
    }
});

// Redirect to website when clicking image
popupImage.addEventListener('click', () => {
    window.open('https://solarsystem-jw5cfcps4-javvvvvvvvvvvva.vercel.app/?fbclid=PAZXh0bgNhZW0CMTEAAaZNBPuqiEUjUQ3C_adnkUT6ZQtm0Iz7NagviLiaAYGeFiMb7oYTab2jx2I_aem_tG9dIarT3Zg_jNA58265oA', '_blank');
});


// Global Click Event to Detect Clicks Outside the Image
document.addEventListener('click', (event) => {
    // If popup is visible and the click is not on the image, close the popup
    if (popupContainer.style.display === 'block' && event.target !== popupImage) {
        popupContainer.style.display = 'none';

        // Reset sphere scale before making it visible again
        sphere.scale.set(1, 1, 1);
        sphere.visible = true;
    }
});
 
// Animation Loop
const clock = new THREE.Clock();
const animate = () => {
    requestAnimationFrame(animate);
    galaxy.rotation.y += 0.001;
    sphere.rotation.y += 0.01;
    renderer.render(scene, camera);
};
animate();

// Resize Handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

