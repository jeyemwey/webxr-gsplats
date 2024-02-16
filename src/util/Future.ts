type Future<T> = {
    resolve: (value: T) => void;
    future: Promise<T>;
};

/**
 * This function returns a Future with two parts:
 *
 * 1. A resolver function that can be called with the target value.
 * 2. A `Promise` to the target value that someone can `await` for.
 *
 * This is useful when one component of the application computes something _at
 * some point_ that another component may need for its own computations. A
 * central initalizer can now inject the future/its resolver to the components.
 * This both removes the need to rely on top-level/global properties.
 */
export const future = <T>(): Future<T> => {
    var resolve: (value: T) => void;

    const future = new Promise<T>((r) => {
        resolve = r;
    });

    return {
        // @ts-ignore
        resolve,
        future
    };
};