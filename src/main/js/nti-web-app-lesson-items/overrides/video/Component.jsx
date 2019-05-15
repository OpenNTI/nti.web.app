import React from 'react';

import Registry from '../Registry';

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
	render () {
		return (
			<View {...this.props} />
		);
	}
}
