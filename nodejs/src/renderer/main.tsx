import React = require('react');
import ReactDOM = require('react-dom');

interface AppProps {
}

interface AppState {
}

class App extends React.Component<AppProps, AppState> {
  render() {
    return <div>SUP.</div>;
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById('app')
);
