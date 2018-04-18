import React from 'react';
import {Button} from '@nti/web-commons';
import PropTypes from 'prop-types';

export default class ResourceControls extends React.Component {
	static propTypes = {
		onCreate: PropTypes.func,
		onSearch: PropTypes.func
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
				<Button className="create-resource" onClick={this.onCreate} rounded>
					<span>Create</span>
				</Button>
			</div>
		);
	}
}
