import React from 'react';

import Registry from '../Registry';

import View from './view';

const MIME_TYPES = {
	'application/vnd.nextthought.assessment.discussionassignment': true,
	'application/vnd.nextthought.assessment.timedassignment': true,
	'application/vnd.nextthought.assessment.assignment': true,
	'application/vnd.nextthought.assignmentref': true
};

const handles = (obj) => {
	const {location} = obj || {};
	const {item} = location || {};

	return item && MIME_TYPES[item.MimeType];
};

export default
@Registry.register(handles)
class NTIWebAppLessonItemsAssignment extends React.Component {
	render () {
		return (
			<View {...this.props} />
		);
	}
}
