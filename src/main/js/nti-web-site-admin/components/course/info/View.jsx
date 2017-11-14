import React from 'react';
import PropTypes from 'prop-types';
import { Layouts } from 'nti-web-commons';

import Store from './Store';

@Store.connect({course: 'course', loading: 'loading'})
export default class CourseCard extends React.Component {
	static propTypes = {
		match: PropTypes.object.isRequired,
		course: PropTypes.object,
		loading: PropTypes.bool,
		store: PropTypes.object
	}

	get store () {
		return this.props.store;
	}

	getCourseID (props = this.props) {
		const {match} = props;
		const {params} = match || {};
		const {id} = params || {};

		return id;
	}

	componentWillReceiveProps (nextProps) {
		const newID = this.getCourseID(nextProps);
		const oldID = this.getCourseID(this.props);

		if (newID !== oldID) {
			this.store.loadCourse(newID);
		}
	}


	componentDidMount () {
		const id = this.getCourseID();

		this.store.loadCourse(id);
	}


	componentWillUnmount () {
		const {course} = this.props;

		this.store.unloadCourse(course);
	}

	render () {
		if(this.props.loading || !this.props.course) {
			return <div>Loading...</div>;
		}

		return (<div className="course-admin-view">
			<div className="header">
				<div className="title">{this.props.course.title}</div>
			</div>
			<Layouts.NavContent.Container>
				<Layouts.NavContent.Nav>
					<div className="course-menu-item">Course Overview</div>
					<div className="course-menu-item">Roster</div>
					<div className="course-menu-item">Reports</div>
				</Layouts.NavContent.Nav>
				<Layouts.NavContent.Content className="course-admin-content">
					<div>Content goes here</div>
				</Layouts.NavContent.Content>
			</Layouts.NavContent.Container>
		</div>);
	}
}
