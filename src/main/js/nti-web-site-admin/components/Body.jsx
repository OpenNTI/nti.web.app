import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'nti-web-course';

import Advanced from './advanced';

export default class AdminBody extends React.Component {
	static propTypes = {
		workspace: PropTypes.object.isRequired
	}

	constructor (props) {
		super(props);
		this.state = {};
	}

	renderAdvancedTab () {
		return (<Advanced workspace={this.props.workspace}/>);
	}

	render () {
		return (<div className="site-admin-content">
			<Switch.Panel active="Course">
				<Switch.Controls className="admin-menu">
					<Switch.Trigger className="admin-menu-item" item="Course">Course</Switch.Trigger>
					<Switch.Trigger className="admin-menu-item" item="Advanced">Advanced</Switch.Trigger>
				</Switch.Controls>
				<Switch.Container>
					<Switch.Item className="admin-component" name="Course" component="div">Course stuff goes here</Switch.Item>
					<Switch.Item className="admin-component" name="Advanced" component={Advanced} workspace={this.props.workspace}/>
				</Switch.Container>
			</Switch.Panel>
		</div>);
	}
}
