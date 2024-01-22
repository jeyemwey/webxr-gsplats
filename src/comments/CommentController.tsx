import {useEffect, useState} from "preact/hooks";
import {DateFormat} from "./DateFormat.tsx";
import {Bubble} from "./Bubble.tsx";
import {NewCommentForm} from "./NewCommentForm.tsx";
import {getRandomAuthor} from "./Authors.ts";

type Id = number;

export type Comment = {
    id: Id;
    author: string;
    text: string;
    created_at: Date;
};
export type Annotation = {
    id: Id;
    title: string;
    created_at: Date;
    comments: Comment[];
    position: { x: number, y: number, z: number };
};

export const allAnnotations: Annotation[] = [
    {
        id: 1,
        title: "Textilfasern",
        created_at: new Date(2023, 11, 12, 13, 56),
        position: {x: -0.7, y: 0.3, z: 0.6},
        comments: [
            {
                id: 1,
                author: getRandomAuthor(),
                text: "Es wurden violette Textilfasern an der Leiche gefunden, die könnten auf diese Tischdecke passen.",
                created_at: new Date(2023, 11, 12, 13, 56)
            },
            {
                id: 2,
                author: "Abby Sciuto",
                text: "Ich habe die beiden Faser-Proben untersucht und sie passen zueinander 🎉",
                created_at: new Date(2023, 11, 14, 18, 3)
            },
            {
                id: 2,
                author: "Jannik Volkland",
                text: "Danke für die Untersuchung 💐",
                created_at: (() => {
                    const d = new Date();
                    d.setHours(10, 14, 0, 0);
                    return d;
                })()
            }
        ]
    }
];

export const CommentController = () => {
    const [activeAnnotationId, setActiveAnnotationId] = useState<Id>(3);
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