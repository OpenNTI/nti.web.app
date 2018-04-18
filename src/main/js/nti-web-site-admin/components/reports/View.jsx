import React from 'react';
import {getService} from '@nti/web-client';
import {List} from '@nti/web-reports';

export default class View extends React.Component {
	constructor (props) {
		super(props);
		this.state = {};

		this.initState();
	}

	async initState () {
		const service = await getService();

		this.setState({context: service});
	}

	renderContent () {
		const { context } = this.state;

		if(context) {
			return (<List context={context}/>);
		}
	}

	render () {
		return (
			<div className="admin-reports">
				{this.renderContent()}
			</div>
		);
	}
}
