import {Vector3, WebGLRenderer} from "gsplat";
import {ExtendedIntersectionTester} from "./newAnnotationRaycaster/ExtendedIntersectionTester.ts";
import AnnotationsStateDistributor from "../../util/stateDistributors/AnnotationsStateDistributor.ts";
import {allAnnotations, Annotation} from "../../comments/annotations-storage.ts";

const EVENT_TYPE = "dblclick";

var raycastActive = false;

export const setupNewAnnotationRaycaster = (renderer: WebGLRenderer, canvas: HTMLCanvasElement) => {
    console.time("intersectionTester init");
    const intersectionTester = new ExtendedIntersectionTester(renderer.renderProgram);
    console.timeEnd("intersectionTester init");

    canvas.addEventListener(EVENT_TYPE, function (event) {
        console.log("Canvas double clicked!");

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

        console.time("intersectionTester testPoint");
        const intersectedSplatIndex = intersectionTester.testPoint(x, y);
        console.timeEnd("intersectionTester testPoint");

        if (!intersectedSplatIndex || intersectedSplatIndex === ExtendedIntersectionTester.noIntersectionFound) {
            console.log(`Unable to find ray target, ExtendedIntersectionTester returned index ${intersectedSplatIndex}`);
            return;
        }

        console.log(intersectedSplatIndex);

        let intersectedSplatPosition = new Vector3(renderer.renderProgram.renderData?.positions[intersectedSplatIndex] || 0,
            renderer.renderProgram.renderData?.positions[intersectedSplatIndex + 1] || 0,
            renderer.renderProgram.renderData?.positions[intersectedSplatIndex + 2] || 0);

        const ann: Annotation = {
            comments: [],
            position: intersectedSplatPosition,
            id: allAnnotations.length + 1,
            created_at: new Date(),
            title
        };

        allAnnotations.push(ann);
        AnnotationsStateDistributor.dispatch();
    });
}