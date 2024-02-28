import {RenderProgram} from "gsplat";

import loadWasm from "../../../../node_modules/gsplat/dist/wasm/intersect.js";

/**
 * This is mostly a copy of the IntersectionTester from the library respectively
 * its call to the wasm module.
 * We need to adjust the code because the original will only ever return the
 * "splat group" to us, which is great when you want to move a splat object in space,
 * but not great if you want to attach an annotation to a single ellipsoid.
 */
class ExtendedIntersectionTester {
    public static noIntersectionFound = 0xffffffff;

    testPoint: (x: number, y: number) => number | null;

    constructor(renderProgram: RenderProgram) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let wasmModule: any;

        const initWasm = async () => {
            wasmModule = await loadWasm();
        };

        initWasm();

        let allocatedVertexCount: number = 0;
        let allocatedTransformCount: number = 0;

        let viewPtr: number;
        let transformsPtr: number;
        let transformIndicesPtr: number;
        let positionsPtr: number;
        let rotationsPtr: number;
        let scalesPtr: number;
        let depthIndexPtr: number;
        let chunksPtr: number;
        let originPtr: number;
        let directionPtr: number;
        let resultPtr: number;

        const allocateVertices = (vertexCount: number) => {
            if (vertexCount > allocatedVertexCount) {
                if (allocatedVertexCount > 0) {
                    wasmModule._free(viewPtr);
                    wasmModule._free(transformIndicesPtr);
                    wasmModule._free(positionsPtr);
                    wasmModule._free(rotationsPtr);
                    wasmModule._free(scalesPtr);
                    wasmModule._free(depthIndexPtr);
                    wasmModule._free(chunksPtr);
                    wasmModule._free(originPtr);
                    wasmModule._free(directionPtr);
                    wasmModule._free(resultPtr);
                }

                allocatedVertexCount = vertexCount;

                viewPtr = wasmModule._malloc(16 * 4);
                transformIndicesPtr = wasmModule._malloc(allocatedVertexCount * 4);
                positionsPtr = wasmModule._malloc(3 * allocatedVertexCount * 4);
                rotationsPtr = wasmModule._malloc(4 * allocatedVertexCount * 4);
                scalesPtr = wasmModule._malloc(3 * allocatedVertexCount * 4);
                depthIndexPtr = wasmModule._malloc(allocatedVertexCount * 4);
                chunksPtr = wasmModule._malloc(allocatedVertexCount);
                originPtr = wasmModule._malloc(3 * 4);
                directionPtr = wasmModule._malloc(3 * 4);
                resultPtr = wasmModule._malloc(4);
            }
        };

        const allocateTransforms = (transformCount: number) => {
            if (transformCount > allocatedTransformCount) {
                if (allocatedTransformCount > 0) {
                    wasmModule._free(transformsPtr);
                }

                allocatedTransformCount = transformCount;

                transformsPtr = wasmModule._malloc(20 * allocatedTransformCount * 4);
            }
        };

        this.testPoint = (x: number, y: number) => {
            if (!wasmModule) {
                throw new Error("Wasm module not loaded");
            }

            if (!renderProgram.camera) {
                throw new Error("Camera not set");
            }

            if (!renderProgram.renderData || !renderProgram.depthIndex || !renderProgram.chunks) {
                return null;
            }

            const renderData = renderProgram.renderData;
            const depthIndex = renderProgram.depthIndex;
            const chunks = renderProgram.chunks;

            const targetAllocatedVertexCount = Math.pow(2, Math.ceil(Math.log2(renderData.vertexCount)));
            allocateVertices(targetAllocatedVertexCount);

            const targetAllocatedTransformCount = Math.pow(2, Math.ceil(Math.log2(renderData.transforms.length / 20)));
            allocateTransforms(targetAllocatedTransformCount);

            const normalizedX = (x + 1) / 2;
            const normalizedY = (y + 1) / 2;
            const chunk = Math.floor(normalizedX * 15) + Math.floor(normalizedY * 15) * 15;

            const camera = renderProgram.camera;
            const ray = camera.screenPointToRay(x, y);

            wasmModule.HEAPF32.set(camera.data.viewMatrix.buffer, viewPtr / 4);
            wasmModule.HEAPU32.set(renderData.transformIndices, transformIndicesPtr / 4);
            wasmModule.HEAPF32.set(renderData.positions, positionsPtr / 4);
            wasmModule.HEAPF32.set(renderData.rotations, rotationsPtr / 4);
            wasmModule.HEAPF32.set(renderData.scales, scalesPtr / 4);
            wasmModule.HEAPU32.set(depthIndex, depthIndexPtr / 4);
            wasmModule.HEAPU8.set(chunks, chunksPtr);
            wasmModule.HEAPF32.set(camera.position.flat(), originPtr / 4);
            wasmModule.HEAPF32.set(ray.flat(), directionPtr / 4);
            wasmModule.HEAPF32.set(renderData.transforms, transformsPtr / 4);

            wasmModule._evaluate(
                viewPtr,
                transformsPtr,
                transformIndicesPtr,
                positionsPtr,
                rotationsPtr,
                scalesPtr,
                depthIndexPtr,
                chunksPtr,
                renderData.vertexCount,
                chunk,
                originPtr,
                directionPtr,
                resultPtr,
            );

            /**
             * This will return an index of the ellipsoid in the linear splat.
             * You can search through renderData._offsets to check which splat
             * group it belongs to. But you can also use the offsets to grab
             * an ellipsoid and its properties (position, rotation, etc.) from
             * the renderData manually.
             *
             * Attention: The wasm module will return `this.noIntersectionFound`
             * if it cannot find a suitable ellipsoid.
             */
            return wasmModule.HEAPU32[resultPtr / 4] as number;
        };
    }
}

export {ExtendedIntersectionTester};
