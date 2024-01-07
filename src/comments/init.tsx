import { render , ContainerNode} from 'preact';
import {CommentController} from "./CommentController.tsx";

export const initComments = (mainNode: ContainerNode) => {

    render(<CommentController />, mainNode);
}