import {getRandomAuthor} from "./Authors.ts";
import {currentScene} from "../util/currentScene.ts";
import {Vector3 as GVector3} from "gsplat";

export type Id = number;

export type AvailableScenes = "bonsai"
    | "garden"
    | "bicycle"
    | "wohnzimmerAntimatter15"
    | "wohnzimmerPolycam";
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


export const sceneNames: { [K in AvailableScenes]: string; } = {
    "bonsai": "Bonsai Room",
    "garden": "Gartentisch",
    "bicycle": "Fahrrad",
    "wohnzimmerAntimatter15": "Wohnzimmer (converted with Antimatter 15)",
    "wohnzimmerPolycam": "Wohnzimmer (converted with Polycam)"
};

export const annotationStorage: { [K in AvailableScenes]: Annotation[]; } = {
    "wohnzimmerAntimatter15": [],
    "wohnzimmerPolycam": [],
    "garden": [
        {
            id: 1,
            title: "Außenbeleuchtung",
            created_at: new Date(2024, 2, 6, 13, 22),
            position: new GVector3(0.25, 0.5, -1.5),
            comments: []
        },
        {
            id: 2,
            title: "Fußball",
            created_at: new Date(2024, 2, 6, 13, 22),
            position: new GVector3(-0.2, 0.4, 0.8),
            comments: []
        },
        {
            id: 3,
            title: "Milchkanne",
            created_at: new Date(2024, 2, 6, 13, 22),
            position: new GVector3(5, -0.6, -0.3),
            comments: []
        },
    ],
    "bicycle": [
        {
            id: 1,
            title: "Reifenprofil",
            created_at: new Date(2024, 2, 6, 13, 22),
            position: new GVector3(-0.1, -0.1, 1.2),
            comments: [
                {
                    id: 1,
                    author: getRandomAuthor(),
                    text: "Dieses Reifenprofil wurde auf der Poststraße auch gefunden.",
                    created_at: new Date(2024, 3, 23, 13, 56)
                },
                {
                    id: 2,
                    author: getRandomAuthor(),
                    text: "Es scheint sich um Maxxis HookWorm-Reifen zu handeln!",
                    created_at: new Date(2024, 3, 23, 16, 3)
                },
            ]
        },
        {
            id: 2,
            title: "Fahrradschloss",
            created_at: new Date(2024, 2, 2, 13, 22),
            position: new GVector3(0.15, -0.3, 0),
            comments: [
                {
                    id: 1,
                    author:getRandomAuthor(),
                    text: "Schüsselschloss aus dem Baumarkt, keine Aufbruchspuren sichtbar",
                    created_at: new Date(2024,0,12,10,45)
                }
            ]
        },
        {
            id: 3,
            title: "Schuhabdrücke",
            created_at: new Date(2024, 2, 2, 13, 22),
            position: new GVector3(2, 0.8, -2),
            comments: []
        }
    ],
    "bonsai": [
        {
            id: 1,
            title: "Textilfasern",
            created_at: new Date(2023, 11, 12, 13, 56),
            position: new GVector3(-.7, .4, -.6),
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
