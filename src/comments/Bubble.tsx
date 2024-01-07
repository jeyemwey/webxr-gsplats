import {Comment} from "./CommentController.tsx";
import {DateFormat} from "./DateFormat.tsx";

export const Bubble = ({comment}: {comment: Comment}) => {
  return <li className={`bubble ${comment.author === "Jannik Volkland" ? " authored-by-user": ""}`}>
      <h6>{comment.author}</h6>
      <p>{comment.text}</p>
      <DateFormat d={comment.created_at} hideDateIfToday />
  </li>
}