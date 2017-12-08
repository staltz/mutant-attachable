import {Component} from 'react';
const {watch} = require('mutant');

/**
 * Use this interface to make sure your React component can observe mutant
 * streams correctly in order to update the component state.
 *
 * Your React component should `implement MutantAttachable<KEYSGOHERE>` where
 * `KEYSGOHERE` should be a list of mutant streams that will be observed. E.g.
 * `implement MutantAttachable<'name' | 'imageUrl'>`
 * Notice that this list of strings is separated by `|`.
 */
export interface MutantAttachable<K extends keyof P, P = any, S = any> {
  watcherRemovers: {[Key in K]: (() => void) | null};
}

/**
 * Internal interface, you do NOT need to import this.
 */
export type _ComponentWithMutantProps<
  K extends keyof P,
  P = any,
  S = {[Key in K]: any}
> = Component<P, S> & MutantAttachable<K, P, S>;

/**
 * Attach a mutant stream to a React component.
 *
 * Call this function in `componentDidMount` in order to attach the mutant
 * stream that exists in the props. The values from the stream will be written
 * to the React component state.
 *
 * @param that React component instance (`this` keyword, when inside
 * `componentDidMount`)
 * @param key string that identifies the mutant stream to be attached.
 * @param update optional function that takes a value (from the mutant stream)
 * and can call `this.setState` to update the React component state.
 */
export function attachMutant<K extends keyof P, P, S>(
  that: _ComponentWithMutantProps<K, P, S>,
  key: K,
  update?: (val: any) => void,
) {
  const defaultUpdate = (val: any) => {
    that.setState((prev: S) => ({...prev as any, [key]: val}));
  };
  const _update = update || defaultUpdate;

  if ((that.props as P)[key] && !that.watcherRemovers[key]) {
    that.watcherRemovers[key] = watch((that.props as P)[key], _update);
  }
}

/**
 * Detach a mutant stream from a React component.
 *
 * Call this function in `componentWillUnmount` in order to detach the mutant
 * stream from the React component.
 *
 * @param that React component instance (`this` keyword, when inside
 * `componentWillUnmount`)
 * @param key string that identifies the mutant stream to be attached.
 */
export function detachMutant<K extends keyof P, P, S>(
  that: _ComponentWithMutantProps<K, P, S>,
  key: K,
) {
  if (that.watcherRemovers[key]) {
    (that.watcherRemovers[key] as () => void)();
    that.watcherRemovers[key] = null;
  }
}

