import React from 'react';
import PropTypes from 'prop-types';
import {Prompt} from 'nti-web-commons';

import Store from './Store';
import {loadInstructors, resetStore} from './Actions';
import {LOADED} from './Constants';

export default class InstructorManager extends React.Component {
	static show (course) {
		return new Promise((fulfill, reject) => {
			Prompt.modal(
				<InstructorManager
					course={course}
					onSelect={fulfill}
					onCancel={reject}
				/>,
				'course-instructor-manager-container'
			);
		});
	}

	static propTypes = {
		course: PropTypes.object
	}

	state = {}

	componentDidMount () {
		const {course} = this.props;

		loadInstructors(course);

		Store.addChangeListener(this.onStoreChange);
	}

	componentWillUnmount () {
		Store.removeChangeListener(this.onStoreChange);
		resetStore();
	}

	onStoreChange = (data) => {
		if (data.type === LOADED) {
			this.onInstructorsLoaded();
		}
	}

	onInstructorsLoaded () {
		this.setState({
			instructors: Store.instructors
		});
	}

	render () {
		const {instructors} = this.state;

		let ins = instructors || [];

		return (
			<div>
				<span>Instructor Manager</span>

				{ins.map((x, key) => (<span key={key}>{x.alias}</span>))}
			</div>
		);
	}
}
