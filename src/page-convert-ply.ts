import * as SPLAT from "gsplat";

const scene = new SPLAT.Scene();

function appendToLog(line: string) {
    const log = document.getElementById("log");

    const elem = document.createElement("li");
    elem.textContent = line;
    log?.appendChild(elem);
}

async function main() {
    const fileElem = document.getElementById("file") as HTMLInputElement;
    const polycamElem = document.getElementById("isPolycam") as HTMLInputElement;

    fileElem?.addEventListener("change", async function () {
        if (fileElem.files) {
            const [file] = fileElem.files;
            appendToLog(`Converting ${file.name}...`);

            await SPLAT.PLYLoader.LoadFromFileAsync(
                file,
                scene,
                (progress: number) => {
                    appendToLog("Loading PLY file into memory: " + progress);
                },
                polycamElem.checked ? "polycam" : "",
            );

            appendToLog(`Converted ${file.name}. Preparing for Download...`);

            scene.saveToFile(file.name.replace(".ply", ".splat"));
            appendToLog("File Downloaded");
        }
    });
}

main()