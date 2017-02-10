import React from 'react';

export default class List extends React.Component {
	static propTypes = {
		course: React.PropTypes.object,
		gotoResource: React.PropTypes.func
	}

	render () {
		return (
			<div>
				<span>Reading List</span>
			</div>
		);
	}
}
