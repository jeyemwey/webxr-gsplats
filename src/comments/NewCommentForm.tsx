import {useState} from "preact/hooks";
import {getRandomAuthor} from "./Authors.ts";
import {Comment} from "./annotations-storage.tsx";

type Props = {
    addCommentToAnnotation: (comment: Comment) => void;
}

export const NewCommentForm = (props: Props) => {
    const [text, setText] = useState<string>("");

    const pushMessage = () => {
        const comment: Comment = {
            id: Math.floor((Math.random()*200000)),
            text: text,
            created_at: new Date(),
            author: getRandomAuthor()
        };
        props.addCommentToAnnotation(comment);
        setText("");
    };

    return <form onSubmit={pushMessage}>
        {/* @ts-ignore */}
        <input id={"new-comment"} value={text} type={"text"} onChange={event => setText(event.target.value)}/>
        <input type={"submit"}>Senden</input>
    </form>;
}