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
    let output = null;
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

    if (d.log.length) {
      output = (
        <details className="output">
          <summary>Output</summary>
          <pre>{d.log.map((s, i) => <span key={i}>{s}</span>)}</pre>
        </details>
      );
    }

    return (
      <li>
        <div className={`status status-${d.state}`}>{d.state}</div>
        <div className="details">
          <a href={d.url} onClick={this.handleUrlClick}>{name}</a>
        </div>
        {d.videoInfo ? <div className="thumbnail">
                         <img src={d.videoInfo.thumbnail}/>
                       </div> : null}
        {output}
        <ul className="actions">
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
