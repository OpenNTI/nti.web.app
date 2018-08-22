import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CreateCourse from './common/create-course';

export default class AdminToolbar extends Component {
	static propTypes = {
		handleNav: PropTypes.func.isRequired,
		onCourseCreated: PropTypes.func.isRequired,
		onCourseModified: PropTypes.func.isRequired,
		canCreate: PropTypes.bool.isRequired
	};

	goToSiteAdmin = () => {
		this.props.handleNav('Admin', '/siteadmin');
	};

	render () {
		const {
			onCourseCreated,
			onCourseModified,
			handleNav,
			canCreate
		} = this.props;

		return (
			<div className="admin-toolbar">
				<div className="title">Administrator</div>
				<div className="space" />
				<div className="controls">
					<div className="admin-nav" onClick={this.goToSiteAdmin} />
					<CreateCourse
						onCourseCreated={onCourseCreated}
						onCourseModified={onCourseModified}
						handleNav={handleNav}
						canCreate={canCreate}
					/>
				</div>
			</div>
		);
	}
}
