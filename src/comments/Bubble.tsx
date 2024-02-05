import {DateFormat} from "./DateFormat.tsx";
import {Comment} from "./annotations-storage.tsx";

export const Bubble = ({comment}: {comment: Comment}) => {
  return <li className={`bubble ${comment.author === "Jannik Volkland" ? " authored-by-user": ""}`}>
      <h6>{comment.author}</h6>
      <p>{comment.text}</p>
      <DateFormat d={comment.created_at} hideDateIfToday />
  </li>
}