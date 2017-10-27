import React from 'react';

export default class ActiveSessions extends React.Component {
	constructor (props) {
		super(props);
		this.state = {};
	}

	renderHeader () {
		return (<div className="active-sessions-header">LEARNERS ONLINE NOW</div>);
	}

	renderActive () {
		return (<div className="active-sessions-active">234</div>);
	}

	renderMeta () {
		return (<div className="active-sessions-meta">34%</div>);
	}

	render () {
		return (<div className="active-sessions-widget">
			{this.renderHeader()}
			{this.renderActive()}
			{this.renderMeta()}
		</div>);
	}
}
