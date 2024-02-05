import {AvailableScenes, scenes} from "../comments/annotations-storage.tsx";

const urlParams = new URLSearchParams(window.location.search);

export const currentScene: AvailableScenes = urlParams.get("slug") as AvailableScenes || "bonsai";

window.onload = () => {
    const breadcrumbElement = document.getElementById("current-scene");
    if (breadcrumbElement) {
        breadcrumbElement!.textContent = scenes.find((s) => s.slug === currentScene)!.name;
    }
};