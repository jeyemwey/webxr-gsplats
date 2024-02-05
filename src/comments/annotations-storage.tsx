import {getRandomAuthor} from "./Authors.ts";
import {currentScene} from "../util/currentScene.ts";

export type Id = number;
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

export type AvailableScenes = "bonsai" | "dead-kris";
type SceneAnnotationStorage = {
    [K in AvailableScenes]: Annotation[];
}

export const annotationStorage: SceneAnnotationStorage = {
    "dead-kris": [], // TODO: Add comments
    "bonsai": [
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
    ]
};

export const allAnnotations = annotationStorage[currentScene];


type ScenesWithAnnotations = {
    slug: AvailableScenes;
    name: string;
}
export const scenes: ScenesWithAnnotations[] = [
    {
        slug: "bonsai",
        name: "Bonsai Room",
    },
    {
        slug: "dead-kris",
        name: "Toter Kris",
    },
    {
        slug: "bonsai",
        name: "Bonsai Room",
    },
    {
        slug: "bonsai",
        name: "Bonsai Room",
    },
];