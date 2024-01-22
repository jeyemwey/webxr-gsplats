type CommentStateEventListener = () => void;

const listener: CommentStateEventListener[] = [];

export const addEventListener = (l: CommentStateEventListener) => listener.push(l);

export const dispatch = () => {
    listener.forEach(l => l());
}
