import restart from 'vite-plugin-restart';
import glsl from 'vite-plugin-glsl';

export default {
    root: 'public/',  // Set correct root directory
    publicDir: '../static/',  // Keep this if static assets are separate
    base: './',
    server: {
        host: true,  // Open to local network
        open: true   // Automatically open the browser
    },
    build: {
        outDir: '../dist',  // Keep this if using "dist/" as the build folder
        emptyOutDir: true,   // Clean before building
        sourcemap: true
    },
    plugins: [
        restart({ restart: ['../static/**'] }),  // Restart on static file changes
        glsl()  // GLSL shader support
    ]
};
