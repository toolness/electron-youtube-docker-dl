import React = require('react');
import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {shell} from 'electron';
import * as path from 'path';

import {DOWNLOAD_DIR} from '../constants';
import * as reduxState from '../state';
import * as actions from '../actions';
import DownloadForm from './download-form';

interface StateProps {}

interface DispatchProps {
  cancel: () => void;
  retry: () => void;
}

interface OwnProps {
  download: reduxState.Download
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {}

class DownloadListItem extends React.Component<Props, State> {
  handleUrlClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    shell.openExternal(this.props.download.url);
  }

  handleShowInFinder = () => {
    if (this.props.download.state === 'finished') {
      const filename = this.props.download.videoInfo._filename;
      shell.showItemInFolder(path.join(DOWNLOAD_DIR, filename));
    }
  }

  render() {
    const d = this.props.download;
    let name = d.url;
    let showInFinderBtn = null;
    let retryBtn = null;
    const cancelOrDeleteBtn = (
      <li>
        <button onClick={this.props.cancel}>
          {d.state === 'finished' ? 'Delete' : 'Cancel'}
        </button>
      </li>
    );

    if (d.videoInfo) {
      name = d.videoInfo.title;
    }

    if (d.state === 'errored') {
      retryBtn = (
        <li>
          <button onClick={this.props.retry}>Retry</button>
        </li>
      );
    }

    if (d.state === 'finished') {
      showInFinderBtn = (
        <li>
          <button onClick={this.handleShowInFinder}>
            Show in Finder
          </button>
        </li>
      );
    }

    return (
      <li>
        <code>{d.state}</code>
        <br/>
        <a href={d.url} onClick={this.handleUrlClick}>{name}</a>
        <ul>
          {showInFinderBtn}
          {retryBtn}
          {cancelOrDeleteBtn}
        </ul>
      </li>
    );
  }
}

export default connect<StateProps, DispatchProps, OwnProps>(
  (state: reduxState.State): StateProps => ({}),

  (dispatch: Dispatch<reduxState.State>, ownProps: OwnProps): DispatchProps => ({
    cancel: () => dispatch(actions.cancelDownload(ownProps.download.url)),
    retry: () => dispatch(actions.retryDownload(ownProps.download.url))
  }),
)(DownloadListItem);
