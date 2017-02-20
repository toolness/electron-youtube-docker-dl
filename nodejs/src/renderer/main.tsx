import React = require('react');
import ReactDOM = require('react-dom');
import {ipcRenderer} from 'electron';
import {createStore} from 'redux';

import {State} from '../state';
import * as actions from '../actions';
import {downloaderApp} from '../reducers';

interface AppProps {
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
    ipcRenderer.send('action', actions.enqueueDownload(this.state.url));
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
  const store = createStore<State>(downloaderApp, state);
  console.log('wooot hello', state);

  ipcRenderer.on('action', (event, action: actions.Action) => {
    store.dispatch(action);
    console.log('got action', action, store.getState());
  });

  ReactDOM.render(
    <App/>,
    document.getElementById('app')
  );
});
