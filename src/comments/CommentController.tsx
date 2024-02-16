import {useEffect, useState} from "preact/hooks";
import {DateFormat} from "./DateFormat.tsx";
import {Bubble} from "./Bubble.tsx";
import {NewCommentForm} from "./NewCommentForm.tsx";
import {allAnnotations, Comment, Id} from "./annotations-storage.ts";

export const CommentController = () => {
    const [activeAnnotationId, setActiveAnnotationId] = useState<Id>(Number.MAX_VALUE);
    const [forceRerender, setForceRerender] = useState(0);
    const rerender = () => setForceRerender(forceRerender + 1);

    // @ts-ignore
    window.setActiveAnnotationId = setActiveAnnotationId;

    const active = allAnnotations.find(a => a.id === activeAnnotationId);

    useEffect(() => {
        const mainNode = document.getElementById("main-node")!;

        if (active) {
            mainNode.className = "has-open-comment-section";
        } else {
            mainNode.className = "has-closed-comment-section";
        }
    }, [activeAnnotationId]);

    if (!active) {
        return <></>;
    }

    const addCommentToAnnotation = (comment: Comment) => {
        active.comments.push(comment);
        rerender();

        console.log(comment);
    }

    const hideCommentController = () => {
        setActiveAnnotationId(0);
    }

    return (<>
        <header>
            <div>
                <h2>{active.title}</h2>
                <p>Erstellt am: <DateFormat d={active.created_at}/></p>
            </div>
            <button onClick={hideCommentController}>&times;</button>
        </header>
        <section>
            <ul>{active.comments.map(comment => <Bubble comment={comment}/>)}</ul>
        </section>
        <NewCommentForm addCommentToAnnotation={addCommentToAnnotation}/>
    </>);
}