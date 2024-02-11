import {getRandomAuthor} from "./Authors.ts";
import {currentScene} from "../util/currentScene.ts";
import {Vector3 as GVector3} from "gsplat";

export type Id = number;

export type AvailableScenes = "bonsai" | "dead-kris";
export type Annotation = {
    id: Id;
    title: string;
    created_at: Date;
    comments: Comment[];
    position: GVector3;
};

export type Comment = {
    id: Id;
    author: string;
    text: string;
    created_at: Date;
};

type SceneWithName = {
    slug: AvailableScenes;
    name: string;
}

export const scenes: { [K in AvailableScenes]: SceneWithName; }  = {
    "bonsai": {
        slug: "bonsai",
        name: "Bonsai Room",
    },
    "dead-kris": {
        slug: "dead-kris",
        name: "Toter Kris",
    }
};

export const annotationStorage: { [K in AvailableScenes]: Annotation[]; } = {
    "dead-kris": [], // TODO: Add comments
    "bonsai": [
        {
            id: 1,
            title: "Textilfasern",
            created_at: new Date(2023, 11, 12, 13, 56),
            position: new GVector3(-.7, .8, .6),
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
    ]
};

export const allAnnotations = annotationStorage[currentScene];