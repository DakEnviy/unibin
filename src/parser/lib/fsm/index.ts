import type { IStates } from './types';

export class FiniteStateMachine<TStateKeys extends string, TContext> {
    private readonly states: IStates<TStateKeys, TContext>;
    private readonly startStateKey: TStateKeys;

    private currentStateKey: TStateKeys;

    constructor(states: IStates<TStateKeys, TContext>, startStateKey: TStateKeys) {
        this.states = states;
        this.startStateKey = startStateKey;

        this.currentStateKey = startStateKey;
    }

    get current() {
        return this.currentStateKey;
    }

    goto(nextStateKey: TStateKeys, context: TContext) {
        const currentState = this.states[this.currentStateKey];

        if (nextStateKey !== this.currentStateKey) {
            currentState.onExit?.(context, nextStateKey);
            this.states[nextStateKey].onJoin?.(context, this.currentStateKey);
        }

        this.currentStateKey = nextStateKey;
    }

    gotoStart(context: TContext) {
        this.goto(this.startStateKey, context);
    }

    next(context: TContext) {
        const nextStateKey = this.states[this.currentStateKey].next(context);

        if (!nextStateKey) {
            return undefined;
        }

        this.goto(nextStateKey, context);

        return this.currentStateKey;
    }
}
