import React from 'react';
import PropTypes from 'prop-types';
import {getService} from 'nti-web-client';

import SyncControls from './sync';

export default class View extends React.Component {
	static propTypes = {
		workspace: PropTypes.object.isRequired
	}

	constructor (props) {
		super(props);

		this.state = {};
	}

	componentDidMount () {
		getService().then(service => {
			this.setState({ workspace: service.getWorkspace('SiteAdmin') });
		});
	}

	renderSyncControls () {
		return (<SyncControls workspace={this.state.workspace}/>);
	}

	renderItem (itemFn) {
		return (<div className="advanced-item">{itemFn()}</div>);
	}

	render () {
		if(!this.state.workspace) {
			return null;
		}

		return (<div className="site-admin-advanced">
			{this.renderItem(() => { return this.renderSyncControls(); })}
		</div>);
	}
}
