export const Authors = [
    // Drei Fragezeichen
    "Justus Jonas",
    "Peter Shaw",
    "Bob Andrews",

    // TKKG
    "Peter Timotheus Carsten",
    "Willi Sauerlich",
    "Karl Vierstein",
    "Gaby Glockner",
    "Emil Glockner",

    // Tatort
    "Freddy Schenk",
    "Karl-Friedrich Boerne",
    "Frank Thiel",
    "Horst Schimanski",
];

export const getRandomAuthor = function () {
    return Authors[Math.floor((Math.random()*Authors.length))];
}