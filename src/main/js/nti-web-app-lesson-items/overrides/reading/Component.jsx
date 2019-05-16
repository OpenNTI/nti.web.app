import React from 'react';
import PropTypes from 'prop-types';

import Registry from '../Registry';

import Editor from './editor';
import View from './view';

const MIME_TYPES = {
	'application/vnd.nextthought.ltiexternaltoolasset': true,
	'application/vnd.nextthought.relatedworkref': true,
	'application/vnd.nextthought.questionsetref': true,
	'application/vnd.nextthought.naquestionset': true,
	'application/vnd.nextthought.surveyref': true
};

const handles = (obj) => {
	const {location} = obj || {};
	const {item} = location || {};

	if (item && item.isTableOfContentsNode && item.isTopic()) {
		return true;
	}

	return item && MIME_TYPES[item.MimeType] ;
};

export default
@Registry.register(handles)
class NTIWebAppLessonItemsReading extends React.Component {
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
