declare module 'zustand' {
  import { UseBoundStore, StateCreator } from 'zustand/vanilla';
  
  export function create<T>(initializer: StateCreator<T>): UseBoundStore<T>;
  export function createStore<T>(initializer: StateCreator<T>): UseBoundStore<T>;
}

declare module 'zustand/middleware' {
  import { StateCreator } from 'zustand/vanilla';

  export function persist<T>(
    config: StateCreator<T>,
    options: {
      name: string;
      storage?: Storage;
      partialize?: (state: T) => any;
      merge?: (persistedState: any, currentState: T) => T;
      version?: number;
      migrate?: (persistedState: any, version: number) => any;
    }
  ): StateCreator<T>;

  export function devtools<T>(
    config: StateCreator<T>,
    options?: {
      name?: string;
      enabled?: boolean;
    }
  ): StateCreator<T>;
}

declare module 'zustand/vanilla' {
  export type StateCreator<T> = (set: SetState<T>, get: GetState<T>, api: StoreApi<T>) => T;
  
  export interface SetState<T> {
    (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean): void;
  }
  
  export interface GetState<T> {
    (): T;
  }
  
  export interface StoreApi<T> {
    setState: SetState<T>;
    getState: GetState<T>;
    subscribe: (listener: (state: T) => void) => () => void;
    destroy: () => void;
  }
  
  export interface UseBoundStore<T> {
    (): T;
    <U>(selector: (state: T) => U): U;
    getState: GetState<T>;
    setState: SetState<T>;
    subscribe: StoreApi<T>['subscribe'];
    destroy: StoreApi<T>['destroy'];
  }
}

declare module 'zustand' {
  import { StoreMutatorIdentifier } from './zustand/vanilla';

  export type EqualityChecker<T> = (state: T, newState: T) => boolean;

  export interface ZustandHookSelectors<TState> {
    getInitialState: () => TState;
  }

  type ExtractState<S> = S extends { getState: () => infer T } ? T : never;

  type ReadonlyStoreApi<T> = Pick<StoreApi<T>, 'getState' | 'subscribe'>;

  export interface StoreApi<T> {
    setState: (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => void;
    getState: () => T;
    subscribe: (listener: (state: T, prevState: T) => void) => () => void;
    destroy: () => void;
  }

  export function useStore<TState, StateSlice = TState>(
    api: WithReact<StoreApi<TState>>,
    selector?: (state: TState) => StateSlice,
    equalityFn?: (a: StateSlice, b: StateSlice) => boolean
  ): StateSlice;

  export interface UseStore<S extends StoreApi<unknown>> {
    (): ExtractState<S>;
    <U>(selector: (state: ExtractState<S>) => U, equals?: (a: U, b: U) => boolean): U;
  }

  export interface WithReact<S extends StoreApi<unknown>> {
    (): ExtractState<S>;
    <U>(selector: (state: ExtractState<S>) => U, equals?: (a: U, b: U) => boolean): U;
  }

  type ReactDeps = Array<unknown> | Record<string, unknown>;

  interface CreateImpl {
    <T>(initializer: StateCreator<T, [], []>): WithReact<StoreApi<T>>;
    <T>(
      initializer: StateCreator<T, [], []>,
      devtools: true
    ): WithReact<StoreApi<T>>;
  }

  export interface StoreMutators<S, A> {
    setState: {}
    getState: {}
    subscribe: {}
    destroy: {}
  }

  export type StateCreator<
    T,
    Mis extends [StoreMutatorIdentifier, unknown][] = [],
    Mos extends [StoreMutatorIdentifier, unknown][] = [],
    U = T
  > = ((set: StoreApi<T>['setState'], get: StoreApi<T>['getState'], api: StoreApi<T>) => U)

  export type Create = CreateImpl & {
    <T, Mps extends [StoreMutatorIdentifier, unknown][] = [], Mcs extends [StoreMutatorIdentifier, unknown][] = []>(
      initializer: StateCreator<T, [], []>,
      devtools: true
    ): WithReact<StoreApi<T>> & Mutate<StoreApi<T>, Mps> & CreateAPIMutations<Mcs>;
  };

  type Mutate<S, Ms> = Ms extends [infer Mi, ...infer Mrs]
    ? Mi extends StoreMutatorIdentifier
      ? Mutate<S, Mrs>
      : never
    : S;

  type NamedSet<T> = T extends unknown
    ? {}
    : never;

  export type Get<T, K, F> = K extends keyof T ? T[K] : F;

  type CreateAPIMutations<Ms> = Ms extends [infer Mi, ...infer Mrs]
    ? (Mi extends [StoreMutatorIdentifier, infer Mc] ? Mc : never) & CreateAPIMutations<Mrs>
    : unknown;

  export interface UseStoreApi<T> {
    getState: StoreApi<T>['getState'];
    setState: StoreApi<T>['setState'];
    subscribe: StoreApi<T>['subscribe'];
    destroy: StoreApi<T>['destroy'];
  }
  
  export type __private_ZustandStoreCreator = <
    T extends object,
    Mos extends [StoreMutatorIdentifier, unknown][] = []
  >(
    initializer: StateCreator<T, [], Mos>,
    name?: string
  ) => Omit<StoreApi<T>, "destroy">;
  
  export const create: <T>(stateCreator: StateCreator<T>) => {
    <U>(selector: (state: T) => U, equals?: (a: U, b: U) => boolean): U;
    getState: () => T;
    setState: (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => void;
    subscribe: (listener: (state: T, prevState: T) => void) => () => void;
  }
}
