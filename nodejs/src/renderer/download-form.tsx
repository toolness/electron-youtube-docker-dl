import React = require('react');
import {Dispatch} from 'redux';
import {connect} from 'react-redux';

import * as actions from '../actions';
import * as reduxState from '../state';

interface StateProps {}

interface DispatchProps {
  enqueueDownload: (url: string) => void;
}

interface OwnProps {}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  url: string;
}

class DownloadForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      url: '',
    };
  }

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.props.enqueueDownload(this.state.url);
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

export default connect<StateProps, DispatchProps, OwnProps>(
  (state: reduxState.State): StateProps => ({}),

  (dispatch: Dispatch<reduxState.State>): DispatchProps => ({
    enqueueDownload: (url: string) => dispatch(actions.enqueueDownload(url)),
  }),
)(DownloadForm);
