export interface IState<TStateKeys extends string, TContext> {
    next: (context: TContext) => TStateKeys | void;
    onJoin?: (context: TContext) => void;
    onExit?: (context: TContext) => void;
}

export type IStates<TStateKeys extends string, TContext> = {
    [P in TStateKeys]: IState<TStateKeys, TContext>;
};
