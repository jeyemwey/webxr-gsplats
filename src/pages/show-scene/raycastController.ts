import {Camera} from "gsplat";
import AnnotationsStateDistributor from "../../util/stateDistributors/AnnotationsStateDistributor.ts";
import {allAnnotations, Annotation} from "../../comments/annotations-storage.ts";

const EVENT_TYPE = "dblclick";

var raycastActive = false;

export const setupNewAnnotationRaycaster = (canvas: HTMLCanvasElement, camera: Camera) => {
    canvas.addEventListener(EVENT_TYPE, function (event) {
        const title = prompt("Title of the annotation?", 'New Annotation');
        if (!title) {
            console.log("New annotation aborted by user.")
            return;
        }

        if (raycastActive) {
            return;
        }
        raycastActive = true;
        setTimeout(() => raycastActive = false, 500);

        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Calculate the transformed values in the range [-1, 1]
        const x = (mouseX / canvas.width) * 2 - 1;
        const y = -(mouseY / canvas.height) * 2 + 1;

        // TODO: Fix Raycast since screenPointToRay will always produce a normed vector (would be shorter if not normed)
        const rayTarget = camera.screenPointToRay(x, y);
        console.log(rayTarget);

        const ann: Annotation = {
            comments: [],
            position: rayTarget,
            id: allAnnotations.length + 1,
            created_at: new Date(),
            title
        };

        allAnnotations.push(ann);
        AnnotationsStateDistributor.dispatch();
    });
}