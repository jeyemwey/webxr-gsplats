import {defineConfig} from 'vite';
import {resolve} from "path";
import handlebars from "vite-plugin-handlebars";

/** @type {import('vite').UserConfig} */
export default defineConfig({
    base: "https://jeyemwey.github.io/webxr-gsplats/", build: {
        lib: {
            entry: [
                "./index.html",
                "./scene-show.html",
                "./convert-ply.html"
            ],
            formats: ["es"]
        }
    },
    plugins: [handlebars({partialDirectory: resolve(__dirname, "partials")})]
})