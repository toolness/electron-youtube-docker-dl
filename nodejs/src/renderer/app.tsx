import React = require('react');
import {Dispatch} from 'redux';
import {connect} from 'react-redux';

import * as reduxState from '../state';
import DownloadForm from './download-form';

interface StateProps {}

interface DispatchProps {}

interface OwnProps {}

type Props = StateProps & DispatchProps & OwnProps;

interface State {}

class App extends React.Component<Props, State> {
  render() {
    return (
      <div>
        <DownloadForm/>
      </div>
    );
  }
}

export default connect<StateProps, DispatchProps, OwnProps>(
  (state: reduxState.State): StateProps => ({}),

  (dispatch: Dispatch<reduxState.State>): DispatchProps => ({}),
)(App);
