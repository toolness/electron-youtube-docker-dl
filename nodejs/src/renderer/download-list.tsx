import React = require('react');
import {Dispatch} from 'redux';
import {connect} from 'react-redux';

import * as reduxState from '../state';
import DownloadForm from './download-form';

interface StateProps {
  downloads: reduxState.Download[],
}

interface DispatchProps {}

interface OwnProps {}

type Props = StateProps & DispatchProps & OwnProps;

interface State {}

class DownloadList extends React.Component<Props, State> {
  render() {
    return (
      <ol>
        {this.props.downloads.map(d =>
          <li key={d.url}><code>{d.state}</code> {d.url}</li>
        )}
      </ol>
    );
  }
}

export default connect<StateProps, DispatchProps, OwnProps>(
  (state: reduxState.State): StateProps => ({
    downloads: state.downloads,
  }),

  (dispatch: Dispatch<reduxState.State>): DispatchProps => ({}),
)(DownloadList);
