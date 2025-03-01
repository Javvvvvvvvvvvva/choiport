import * as THREE from 'three';
import { gsap } from 'gsap'; // Ensure gsap is installed

// Canvas and Scene Setup
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

// Parameters for the galaxy
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

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
    if (points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const insideColor = new THREE.Color(parameters.insideColor);
    const outsideColor = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;
        const radius = Math.sqrt(Math.random()) * parameters.radius; // ✅ Fixes star density
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;
        const spinAngle = radius * parameters.spin * 0.5; // ✅ Prevents exaggerated spirals

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

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);
};

generateGalaxy();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1, 8);
camera.lookAt(0, 0, 0);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ✅ Define Camera Settings for Different Sections
const sectionCameraSettings = [
    { position: { x: 0, y: 1, z: 8 }, fov: 75 }, // Section 1
    { position: { x: 2, y: 1, z: 6 }, fov: 65 }, // Section 2
    { position: { x: -2, y: 1, z: 5 }, fov: 60 } // Section 3
];

// ✅ Smoothly update camera settings
const updateCamera = (settings) => {
    gsap.to(camera.position, {
        x: settings.position.x,
        y: settings.position.y,
        z: settings.position.z,
        duration: 1.2,
        ease: "power2.out"
    });

    gsap.to(camera, {
        fov: settings.fov,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => camera.updateProjectionMatrix()
    });
};

// ✅ Optimize Scroll Event Handling
let lastScrollY = 0;
let ticking = false;

const handleScroll = () => {
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;

    const sectionIndex = Math.min(
        Math.floor((scrollY / maxScroll) * sectionCameraSettings.length),
        sectionCameraSettings.length - 1
    );

    updateCamera(sectionCameraSettings[sectionIndex]);

    ticking = false;
};

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
    }
});

// Animation Loop
const clock = new THREE.Clock();

const animate = () => {
    requestAnimationFrame(animate);

    if (points) { // ✅ Check before updating rotation
        points.rotation.y += 0.001;
    }

    renderer.render(scene, camera);
};

animate();

// Resize Handling
window.addEventListener('scroll', () => {
    const aboutMeSection = document.getElementById("about-me");
    const aboutOverlay = document.querySelector(".about-overlay");
    const sectionTop = aboutMeSection.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (sectionTop < windowHeight * 0.8) { // When section enters view
        aboutOverlay.style.right = "0"; // Slide in
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Copy email to clipboard when email icon is clicked
    const emailCard = document.querySelector('.contact-card img[alt="Email"]');
    emailCard.addEventListener('click', function() {
        const email = "javacoding2022@gmail.com";
        navigator.clipboard.writeText(email).then(() => {
            alert("Email copied to clipboard: " + email);
        }).catch(err => {
            console.error("Failed to copy email:", err);
        });
    });

    // Open LinkedIn profile when LinkedIn icon is clicked
    const linkedInCard = document.querySelector('.contact-card img[alt="LinkedIn"]');
    linkedInCard.addEventListener('click', function() {
        window.open("https://www.linkedin.com/in/choi-yoonseo-7850b8251/", "_blank");
    });

    // Open GitHub profile when GitHub icon is clicked
    const githubCard = document.querySelector('.contact-card img[alt="GitHub"]');
    githubCard.addEventListener('click', function() {
        window.open("https://github.com/Javvvvvvvvvvvva", "_blank");
    });
});
