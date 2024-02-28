# Gaussian Splat Annotations and Viewer

This repository contains the working changes for the `Gaussian Splat Annotations and Viewer` that was a Master Project in Media Technology M.Sc. in Winter Term 2023/2024 at TH Köln.

There is a working [🚀 live version of current main branch 🚀](https://jeyemwey.github.io/webxr-gsplats/) which is deployed to GitHub Pages.

## Run locally

To run the application yourself, you need [NodeJS](https://nodejs.org/en) on your Computer and available in your `PATH` environment.
In the root folder (the one with this Readme), run `npm install` to get the dependencies that were defined in `package.json`. This will also install the `devDependencies` which are needed to compile the project. 

Now, you can download the splat files which contain the scene data.
Download the splat models to the respective folders in `public/scenes` and rename them to `scene.splat` each:

* https://photos.volkland.de/gsplats/bonsai-7k-raw.splat
* https://photos.volkland.de/gsplats/bicycle-7k.splat
* https://photos.volkland.de/gsplats/garden-7k.splat
* https://photos.volkland.de/gsplats/teekuecheAntimatter15-converted.splat
* https://photos.volkland.de/gsplats/teekuechePolycam-converted.splat
* https://photos.volkland.de/gsplats/wohnzimmerAntimatter15-converted.splat
* https://photos.volkland.de/gsplats/wohnzimmerPolycam-converted.splat

You can also use the following [curl](https://curl.se) commands in a terminal:

```shell
curl -o public/scenes/bicycle/scene.splat "https://photos.volkland.de/gsplats/bicycle-7k.splat"
curl -o public/scenes/bonsai/scene.splat "https://photos.volkland.de/gsplats/bonsai-7k-raw.splat"
curl -o public/scenes/garden/scene.splat "https://photos.volkland.de/gsplats/garden-7k.splat"
curl -o public/scenes/wohnzimmer/scene.splat "https://photos.volkland.de/gsplats/wohnzimmer-converted.splat"
curl -o public/scenes/teekuecheAntimatter15/scene.splat "https://photos.volkland.de/gsplats/teekuecheAntimatter15-converted.splat"
curl -o public/scenes/teekuechePolycam/scene.splat "https://photos.volkland.de/gsplats/teekuechePolycam-converted.splat"
curl -o public/scenes/wohnzimmerAntimatter15/scene.splat "https://photos.volkland.de/gsplats/wohnzimmerAntimatter15-converted.splat"
curl -o public/scenes/wohnzimmerPolycam/scene.splat "https://photos.volkland.de/gsplats/wohnzimmerPolycam-converted.splat"
```

With limited space or bandwidth, you can also just download a subset of the scenes and expect a broken page when opening the other scenes. 

Now that everything is ready, you can run a webserver and open the provided link. It will respond to code changes by reloading (parts of) the page:

```shell
npm run dev
```

You can also create a static build of the application to include in your website. The build will use a base url from which it will derive all subpaths, so you probably want to change it in `vite.config.js`. To create a static build, run `npm run build` and copy the files in the `dist` folder to their place on the web server.

## Adding a new scene

1. Think of a slug for your scene. It will be visible to viewers of the webpage in the URL and can not contain spaces. 
2. Extend `src/comments/annotations-storage.ts`:
   1. `type AvailableScenes` with the new slug.
   2. Set a human-readable name in `const sceneNames`.
   3. Define the annotations to the scenes in `const annotationStorage`. This can also be an empty array, but it can not be undefined.
3. Add the `.splat` file of your scene to `public/scenes/$slug/scene.splat`.
   * If you only have a ply file, you can use the converter that is linked in the footer navigation of the webpage.
   * `.splat` files are ignored by git since they are too large and in a binary format. Save the file on some web space and update the readme section and your deployment script (i.e. `.github/workflows/vite-deploy.yml`).
4. Add a screenshot of your scene to `public/scenes/$slug/cover.png`. It should have sufficient resolution to look good in the catalogue view.
5. Extend `src/GSplatPrograms/prepare-scene.ts`:
   1. Define scene modifications in `const scenePreparations`. This can be empty in the beginning or a reference to `identity`.
   2. Translate the scene modification to a positional modification in `const splatPositionModification`. This can be a reference to `identity`. This is important to translate the position of a splat to its world coordinates, i.e. when attaching an annotation to it. It is not necessary to scale the vector.
   3. If you want to, you can add a helpful arrow (i.e. to define a rotation axis) to the scene. Use the function `helpfulArrow` for this and fill it with your own data.

After extending the `type` definition, the application will not build until you extend the rest of the items. This is expected and here to help you.

## Debug Mode

There is a debug mode which you can activate in the Scene-Detail-Page by clicking the link on the top right of the canvas. It comes with the following features:

* The current Camera Position in gsplat.js and three.js world coordinate spaces are noted in the bottom of the page.
* A grid along the "floor" of both renderers is inserted. The `gsplat` renderer creates a red grid, the `three.js` renderer creates a green grid. The green grid is moved a little bit down so its easier to see both grids.
* The primary axes (1 in each direction) are rendered. These can be a little hidden, its recommended to uncomment the grid calls when you need the axis information.
* A sunflower is added to the three.js scene to have a more interesting, visual object in the scene. The sunflower will "look" at positive X in gsplat.js coordinates, so negative X in three.js coordinates.

## Attributions

* Sunflower Polygon: "[Sunflower](https://poly.google.com/view/ce4GXw3VYE5)" by Poly by Google, licensed under [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/legalcode).

---
Masterprojekt im Studiengang Medientechnologie M.Sc. an der TH K&ouml;ln. Contact: <jvolklan@th-koeln.de>.