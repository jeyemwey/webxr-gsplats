export interface AnimationLoopHolder {
    setAnimationLoop: (fn: FrameRequestCallback) => void;
}

export class StubAnimationLoopHolder implements AnimationLoopHolder {
    public setAnimationLoop: (fn: FrameRequestCallback) => void;

    private isRunning = false;

    constructor() {
        this.setAnimationLoop = (fn) => {
            if (this.isRunning) {
                throw Error("Loop is already running, cannot ")
            }

            console.assert(!this.isRunning, {msg: "There can only ever be one loop running. First, destroy the old call to `renderer.setAnimationLoop`, then come back."});

            const animateFunction: FrameRequestCallback = (time: DOMHighResTimeStamp) => {
                fn(time);

                window.requestAnimationFrame(animateFunction);
            };

            window.requestAnimationFrame(animateFunction);
        };
    }
}