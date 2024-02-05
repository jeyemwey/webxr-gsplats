import {render} from "preact";
import {FC} from "react";
import {annotationStorage, scenes} from "./comments/annotations-storage.tsx";

const Overview: FC = () => {
    const openPage = (slug: string) => () => {
        window.location.href = `./scene-show.html?slug=${slug}`;
    };
    return <ul id={"catalogue"}>
        {scenes.map(scene => <li onClick={openPage(scene.slug)}>
            <img src={`scenes/${scene.slug}/cover.png`}/>
            <aside>
                <h4>{scene.name}</h4>
                <small>{annotationStorage[scene.slug].length} {`Annotation${annotationStorage[scene.slug].length == 1 ? "" : "s"}`}</small>
            </aside>
        </li>)}
    </ul>;
};

render(<Overview/>, document.getElementById("main-node")!);
