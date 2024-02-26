import AbstractStateDistributor from "./AbstractStateDistributor.ts";

const instance = new class AnnotationsStateDistributor extends AbstractStateDistributor<void> {
}();

export default instance;