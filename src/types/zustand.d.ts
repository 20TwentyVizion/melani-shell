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
