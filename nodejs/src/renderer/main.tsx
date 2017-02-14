import React = require('react');
import ReactDOM = require('react-dom');
import {ipcRenderer} from 'electron';

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
    ipcRenderer.send('download', this.state.url);
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

ReactDOM.render(
  <App/>,
  document.getElementById('app')
);
