import React from 'react';
import {Button} from 'nti-web-commons';

export default class ResourceControls extends React.Component {
	static propTypes = {
		onClick: React.PropTypes.func,
		onSearch: React.PropTypes.func
	}

	render () {
		return (
			<div className="resource-controls">
				<Button className="create-resource" onClick={this.onCreate}>
					<span>Create</span>
				</Button>
			</div>
		);
	}
}
