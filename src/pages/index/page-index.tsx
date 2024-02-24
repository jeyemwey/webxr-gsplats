import {render} from "preact";
import {FC} from "react";
import {annotationStorage, AvailableScenes, sceneNames} from "../../comments/annotations-storage.ts";

const Overview: FC = () => {
    const openPage = (slug: string) => () => {
        window.location.href = `./scene-show.html?slug=${slug}`;
    };
    return <ul id={"catalogue"}>
        {/*@ts-ignore*/}
        {Object.entries(sceneNames).map(([slug, name]: [AvailableScenes, string]) => <li onClick={openPage(slug)}>
            <img
                alt={`` /* The image does not convey more information than already present in "card". The alt text is therefore left blank intentionally so Screen Readers will skip it. */}
                src={`scenes/${slug}/cover.png`}/>
            <aside>
                <h4>{name}</h4>
                <small>{annotationStorage[slug].length} {`Annotation${annotationStorage[slug].length == 1 ? "" : "s"}`}</small>
            </aside>
        </li>)}
    </ul>;
};

render(<Overview/>, document.getElementById("main-node")!);
