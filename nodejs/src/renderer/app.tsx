import React = require('react');
import {Dispatch} from 'redux';
import {connect} from 'react-redux';

import * as reduxState from '../state';
import DownloadForm from './download-form';
import DownloadList from './download-list';

interface StateProps {
  log: string[],
}

interface DispatchProps {}

interface OwnProps {}

type Props = StateProps & DispatchProps & OwnProps;

interface State {}

class App extends React.Component<Props, State> {
  render() {
    let log = null;

    if (this.props.log.length) {
      log = (
        <div>
          <h2>Log</h2>
          <pre>
            {this.props.log.map((s, i) => <span key={i}>{s}</span>)}
          </pre>
        </div>
      );
    }

    return (
      <div>
        <DownloadForm/>
        <h2>Downloads</h2>
        <DownloadList/>
        {log}
      </div>
    );
  }
}

export default connect<StateProps, DispatchProps, OwnProps>(
  (state: reduxState.State): StateProps => ({
    log: state.log,
  }),

  (dispatch: Dispatch<reduxState.State>): DispatchProps => ({}),
)(App);
