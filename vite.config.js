import {defineConfig} from 'vite';

/** @type {import('vite').UserConfig} */
export default defineConfig({
    base: "https://jeyemwey.github.io/webxr-gsplats/", build: {
        lib: {
            entry: [
                "./index.html",
                "./scene-show.html"
            ]
        }
    }
})