import React from 'react';

import Registry from '../Registry';

import View from './view';

const MIME_TYPE = 'application/vnd.nextthought.ntitimeline';
const handles = (obj) => {
	const {location} = obj || {};
	const {item} = location || {};

	return item && item.MimeType === MIME_TYPE;
};

export default
@Registry.register(handles)
class NTIWebAppLessonItemsTimeline extends React.Component {
	render () {
		return (
			<View {...this.props} />
		);
	}
}
