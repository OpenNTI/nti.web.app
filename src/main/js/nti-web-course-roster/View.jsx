import React from 'react';
import PropTypes from 'prop-types';
import {Prompt} from 'nti-web-commons';

import {
	LOADING,
	LOADED
} from './Constants';
import {loadInstructors} from './Actions';
import Store from './Store';


export default class CourseRoster extends React.Component {
	static show (course) {
		return new Promise((fulfill, reject) => {
			Prompt.modal(
				<CourseRoster
					course={course}
					onSelect={fulfill}
					onCancel={reject}
				/>,
				'course-roster-container'
			);
		});
	}

	static propTypes = {
		course: PropTypes.object
	}


	state = {}

	componentDidMount () {
		const {course} = this.props;

		Store.addChangeListener(this.onStoreChange);
		loadInstructors(course);
	}

	componentWillUnmount () {
		Store.removeChangeListener(this.onStoreChange);
	}

	onStoreChange = (data) => {
		if (data.type === LOADING) {
			this.setState({loading: true});
		} else if (data.type === LOADED) {
			this.onStoreLoaded();
		}
	}


	onStoreLoaded () {
		//TODO: read whatever the active tab is from the store
		this.setState({
			loading: false,
			batch: Store.instructors
		});
	}


	render () {
		const {loading, batch} = this.state;
		const {Items:items} = batch || {Items: []};

		return (
			<div>
				{loading && (<span>Loading</span>)}
				{items.map((x, key) => (<span key={key}>{x.alias}</span>))}
			</div>
		);
	}
}
