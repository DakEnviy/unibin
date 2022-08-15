import type { IStates } from './types';

export class FiniteStateMachine<TStateKeys extends string, TContext> {
    private readonly states: IStates<TStateKeys, TContext>;
    private readonly endStateKey: TStateKeys;

    private currentStateKey: TStateKeys;

    constructor(states: IStates<TStateKeys, TContext>, startStateKey: TStateKeys, endStateKey: TStateKeys) {
        this.states = states;
        this.currentStateKey = startStateKey;
        this.endStateKey = endStateKey;
    }

    next(context: TContext) {
        const currentState = this.states[this.currentStateKey];
        const nextStateKey = currentState.next(context);

        if (!nextStateKey) {
            // TODO(DakEnviy): Make error
            throw 'Undefined behavior';
        }

        if (nextStateKey !== this.currentStateKey) {
            currentState.onExit?.(context);
            this.states[nextStateKey].onJoin?.(context);
        }

        this.currentStateKey = nextStateKey;

        return this.isEnd();
    }

    isEnd() {
        return this.currentStateKey === this.endStateKey;
    }
}
