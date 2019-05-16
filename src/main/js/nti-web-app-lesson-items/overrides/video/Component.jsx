import React from 'react';
import PropTypes from 'prop-types';

import Registry from '../Registry';

import Editor from './editor';
import View from './view';

const MIME_TYPES = {
	'application/vnd.nextthought.ntivideo': true
};

const handles = (obj) => {
	const {location} = obj || {};
	const {item} = location || {};

	return item && MIME_TYPES[item.MimeType];
};

export default
@Registry.register(handles)
class NTIWebLessonItemsVideo extends React.Component {
	static propTypes = {
		editing: PropTypes.bool
	}

	render () {
		const {editing} = this.props;
		const Cmp = editing ? Editor : View;

		return (
			<Cmp {...this.props} />
		);
	}
}
