import * as SPLAT from "gsplat";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const progressDialog = document.getElementById(
  "progress-dialog",
) as HTMLDialogElement;

async function main() {
  const renderer = new SPLAT.WebGLRenderer(canvas);

  const camera = new SPLAT.Camera();
  const controls = new SPLAT.OrbitControls(camera, canvas);

  // @ts-ignore
  const largeScene = await loadScene("./bonsai-7k-raw.splat");
  const object = await loadScene("./bonsai-7k-mini.splat");

  object.translate(new SPLAT.Vector3(0, 1, 5));

  progressDialog.close();

  const handleResize = () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  };

  const frame = () => {
    controls.update();
    renderer.render(object, camera);

    requestAnimationFrame(frame);
  };

  handleResize();
  window.addEventListener("resize", handleResize);

  requestAnimationFrame(frame);
}

async function loadScene(url: string): Promise<SPLAT.Scene> {
  const largeScene = new SPLAT.Scene();
  await SPLAT.Loader.LoadAsync(url, largeScene, () => null, true);

  return largeScene;
}

main();
