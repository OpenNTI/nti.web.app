import React from 'react';
import {Button} from 'nti-web-commons';

export default class ResourceControls extends React.Component {
	static propTypes = {
		onCreate: React.PropTypes.func,
		onSearch: React.PropTypes.func
	}


	onCreate = () => {
		const {onCreate} = this.props;

		if (onCreate) {
			onCreate();
		}
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
