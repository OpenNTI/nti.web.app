/*globals createStoryJS*/
import React from 'react';
import PropTypes from 'prop-types';
import {rawContent} from '@nti/lib-commons';

import AnalyticsUtil from 'legacy/util/Analytics';

import Registry from '../Registry';

const ASPECT_RATIO = 1.333;//4:3

const MIME_TYPE = 'application/vnd.nextthought.ntitimeline';
const handles = (obj) => {
	const {location} = obj || {};
	const {item} = location || {};

	return item && item.MimeType === MIME_TYPE;
};

const DATA_ATTR = 'data-timeline-placeholder';
const PLACEHOLDER_TPL = (item) => {
	return `<div id="${item.getID()}-placeholder-element" ${DATA_ATTR}></div>`;
};

export default
@Registry.register(handles)
class NTIWebAppLessonItemsTimeline extends React.Component {
	static propTypes = {
		location: PropTypes.shape({
			item: PropTypes.object
		})
	}

	attachContainer = (node) => {
		setTimeout(() => {
			if (!this.node && node) {
				this.node = node;
				this.setupTimeline();
			} else if (this.node && !node) {
				delete this.node;
				this.teardownTimeline();
			}
		}, 1);
	}


	setupTimeline () {
		const {location} = this.props;
		const {item} = location || {};
		const renderTo = this.node.querySelector(`[${DATA_ATTR}]`);

		if (!item || !renderTo) { return null; }

		const width = renderTo.clientWidth;
		const height = width / ASPECT_RATIO;
		const id = renderTo.id;

		createStoryJS({
			source: item.href,
			'embed_id': id,
			height
		});

		AnalyticsUtil.startEvent(item.NTIID, 'ResourceView');
	}


	teardownTimeline () {
		const {location} = this.props;
		const {item}  = location || {};

		if (!item) { return; }

		AnalyticsUtil.stopEvent(item.NTIID, 'ResourceView');
	}


	render () {
		const {location} = this.props;
		const {item} = location || {};

		if (!item) { return null;}

		return (
			<div ref={this.attachContainer} {...rawContent(PLACEHOLDER_TPL(item))} />
		);
	}
}
