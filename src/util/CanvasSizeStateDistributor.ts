import AbstractStateDistributor from "./AbstractStateDistributor.ts";

type CanvasSize = { width: number, height: number };

const instance = new class CanvasSizeStateDistributor extends AbstractStateDistributor<CanvasSize> {
}();

export default instance;