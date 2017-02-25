import React = require('react');
import {Dispatch} from 'redux';
import {connect} from 'react-redux';

import * as reduxState from '../state';
import DownloadListItem from './download-list-item';

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
      <ol className="downloads">
        {this.props.downloads.map(d =>
          <DownloadListItem key={d.url} download={d} />
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
