import React = require('react');
import ReactDOM = require('react-dom');
import {ipcRenderer} from 'electron';
import {createStore, applyMiddleware,
        MiddlewareAPI, Dispatch} from 'redux';

import {State} from '../state';
import * as actions from '../actions';
import {downloaderApp} from '../reducers';

interface AppProps {
  dispatch: Dispatch<State>;
}

interface AppState {
  url: string;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      url: '',
    };
  }

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.props.dispatch(actions.enqueueDownload(this.state.url));
    this.setState({
      url: '',
    });
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      url: e.target.value,
    });
  }

  render() {
    const id = 'url';

    return (
      <form onSubmit={this.handleSubmit}>
        <label htmlFor={id}>URL</label>
        <input id={id} type="url" value={this.state.url}
               onChange={this.handleChange} />
        <button type="submit">Download</button>
      </form>
    );
  }
}

ipcRenderer.on('currentState', (event, state: State) => {
  const syncActionsToMainMiddleware =
    (store: MiddlewareAPI<State>) =>
    (next: Dispatch<State>) =>
    (action: actions.Action): actions.Action => {
      const result = next(action);

      if (action.origin !== 'main') {
        ipcRenderer.send('action', action);
      }

      return result;
  };
  const store = createStore<State>(
    downloaderApp,
    state,
    applyMiddleware(syncActionsToMainMiddleware)
  );
  console.log('wooot hello', state);

  ipcRenderer.on('action', (event, action: actions.SyncableAction) => {
    action.origin = 'main';
    store.dispatch(action);
    console.log('got action', action, store.getState());
  });

  ReactDOM.render(
    <App dispatch={store.dispatch}/>,
    document.getElementById('app')
  );
});
