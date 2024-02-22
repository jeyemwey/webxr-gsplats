import AbstractStateDistributor from "./AbstractStateDistributor.ts";

type MousePosition = { x: number, y: number };

const instance = new class MousePositionStateDistributor extends AbstractStateDistributor<MousePosition> {
}();

export default instance;