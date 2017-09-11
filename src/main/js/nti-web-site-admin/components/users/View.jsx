import React from 'react';

export default class View extends React.Component {
	constructor (props) {
		super(props);
		this.state = {};
	}

	renderContent () {
		return (<div/>);
	}

	render () {
		return (<div className="course-users">
			{this.renderContent()}
		</div>);
	}
}
