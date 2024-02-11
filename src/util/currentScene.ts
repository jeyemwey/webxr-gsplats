import {AvailableScenes, scenes} from "../comments/annotations-storage.ts";

const urlParams = new URLSearchParams(window.location.search);

export const currentScene: AvailableScenes = urlParams.get("slug") as AvailableScenes || "bonsai";

window.onload = () => {
    const breadcrumbElement = document.getElementById("current-scene");
    if (breadcrumbElement) {
        breadcrumbElement!.textContent = scenes[currentScene].name;
    }
};