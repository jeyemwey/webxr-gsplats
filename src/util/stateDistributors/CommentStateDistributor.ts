import AbstractStateDistributor from "./AbstractStateDistributor.ts";

const instance = new class CommentStateDistributor extends AbstractStateDistributor<void> {
}();

export default instance;