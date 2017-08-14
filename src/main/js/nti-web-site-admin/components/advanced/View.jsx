import React from 'react';
import PropTypes from 'prop-types';

import SyncControls from './sync';

export default class View extends React.Component {
	static propTypes = {
		workspace: PropTypes.object.isRequired
	}

	renderSyncControls () {
		return (<SyncControls workspace={this.props.workspace}/>);
	}

	renderItem (itemFn) {
		return (<div className="advanced-item">{itemFn()}</div>);
	}

	render () {
		return (<div className="site-admin-advanced">
			{this.renderItem(() => { return this.renderSyncControls(); })}
		</div>);
	}
}
