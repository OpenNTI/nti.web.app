import React from 'react';

export default class View extends React.Component {
	constructor (props) {
		super(props);
		this.state = {};
	}

	renderContent () {
		return (<div>Reports go here</div>);
	}

	render () {
		return (<div className="admin-reports">
			{this.renderContent()}
		</div>);
	}
}
