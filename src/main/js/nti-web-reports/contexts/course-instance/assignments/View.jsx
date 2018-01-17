import React from 'react';
import PropTypes from 'prop-types';

import ViewerRegistry from '../../ViewerRegistry';

import Store from './Store';

@ViewerRegistry.register('course-assignments')
@Store.connect()
export default class CourseAssignments extends React.Component {
	static propTypes = {
		context: PropTypes.object,
		rel: PropTypes.string,
		onSelectReport: PropTypes.object,

		store: PropTypes.object,
		loading: PropTypes.bool,
		assignments: PropTypes.array
	}

	componentDidMount () {
		const {context, store} = this.props;

		store.loadCourse(context);
	}


	componentWillReceiveProps (nextProps) {
		const {context: nextContext, store} = nextProps; // the store should never change
		const {context:oldContext} = this.props;

		if (nextContext !== oldContext) {
			store.loadCourse(nextContext);
		}
	}

	render () {
		return (
			<div>
				Course Assignments
			</div>
		);
	}
}
