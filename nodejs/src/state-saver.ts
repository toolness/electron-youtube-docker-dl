import * as fs from 'fs';
import {MiddlewareAPI, Dispatch} from 'redux';

import {Action} from './actions';
import {State} from './state';

export class StateSaver {
  readonly filename: string;

  constructor(filename: string) {
    this.filename = filename;
  }

  loadSync(defaultState: State): State {
    if (fs.existsSync(this.filename)) {
      let contents = fs.readFileSync(this.filename, {
        encoding: 'utf-8',
      });
      return JSON.parse(contents) as State;
    }
    return defaultState;
  }

  middleware = (store: MiddlewareAPI<State>) =>
    (next: Dispatch<State>) =>
    (action: Action): Action => {
      const prevState = store.getState();
      const result = next(action);
      const newState = store.getState();

      if (newState !== prevState) {
        const contents = JSON.stringify(newState, null, 2);

        // TODO: Make this asynchronous.
        fs.writeFileSync(this.filename, contents, {encoding: 'utf-8'});

        console.log('wrote state', store.getState());
      }

      return result;
  }
}
