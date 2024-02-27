import AbstractStateDistributor from "./AbstractStateDistributor.ts";

export type CanvasSize = { width: number, height: number, fov: number };

const instance = new class CanvasSizeStateDistributor extends AbstractStateDistributor<CanvasSize> {
}();

export default instance;