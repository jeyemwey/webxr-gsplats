type AbstractStateEventListener<T> = (newState: T) => void;

class AbstractStateDistributor<T> {

    private listener: AbstractStateEventListener<T>[] = [];

    addEventListener = (l: AbstractStateEventListener<T>) => this.listener.push(l);

    dispatch = (state: T) => {
        this.listener.forEach(l => l(state));
    }
}

export default AbstractStateDistributor;