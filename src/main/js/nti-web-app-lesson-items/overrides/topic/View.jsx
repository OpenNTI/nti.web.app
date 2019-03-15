import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Loading, Layouts} from '@nti/web-commons';
import {rawContent} from '@nti/lib-commons';

import TopicViewer from 'legacy/app/forums/components/topic/Window';

import Registry from '../Registry';

import Styles from './View.css';
import Store from './Store';
import ActiveUsers from './ActiveUsers';

const cx = classnames.bind(Styles);

const {Aside} = Layouts;

const DATA_ATTR = 'data-topic-content-placeholder';
const PLACEHOLDER_TPL = `<div ${DATA_ATTR}></div>`;

const MIME_TYPES = {
	'application/vnd.nextthought.discussionref': true,
	'application/vnd.nextthought.discussion': true
};
const handles = (obj) => {
	const {location} = obj || {};
	const {item} = location || {};

	return item && MIME_TYPES[item.MimeType];
};

export default
@Registry.register(handles)
@Store.connect(['loading', 'error', 'topicModel', 'activeUsers'])
class NTIWebAppLessonItemsTopic extends React.Component {
	static deriveBindingFromProps (props) {
		const {location = {}} = props;

		return {
			topic: location.item,
			course: props.course
		};
	}

	static propTypes = {
		location: PropTypes.shape({
			item: PropTypes.object
		}),
		course: PropTypes.object,

		loading: PropTypes.bool,
		error: PropTypes.any,
		topicModel: PropTypes.object,
		activeUsers: PropTypes.array
	}


	attachTopicRef = (node) => {
		if (!this.node && node) {
			this.node = node;
			this.setupTopic();
		} else if (this.node && !node) {
			this.node = null;
			this.tearDownTopic();
		}
	}


	componentDidUpdate (prev) {
		const {topicModel} = this.props;
		const {topicModel: prevTopic} = prev;

		if (topicModel !==  prevTopic) {
			this.setupTopic();
		}
	}

	componentWillUnmount () {
		this.tearDownTopic();
	}


	setupTopic () {
		this.tearDownTopic();

		const {topicModel} = this.props;
		const renderTo = this.node && this.node.querySelector(`[${DATA_ATTR}]`);

		if (!topicModel || !renderTo) { return; }

		this.topicViewer = TopicViewer.create({
			record: topicModel,
			precache: {},
			hideHeader: true,
			renderTo,
			doClose: () => {},
			doNavigate: () => {}
		});
	}


	tearDownTopic () {
		if (this.topicViewer) {
			this.topicViewer.destroy();
			delete this.topicViewer;
		}
	}

	render () {
		const {loading, activeUsers} = this.props;

		return (
			<div className={cx('topic-viewe')}>
				<Aside component={ActiveUsers} activeUsers={activeUsers} />
				{loading && (
					<div className={cx('loading-container')}>
						<Loading.Spinner.Large />
					</div>
				)}
				{!loading && this.renderTopic()}
			</div>
		);
	}


	renderTopic () {
		return (
			<div
				ref={this.attachTopicRef}
				{...rawContent(PLACEHOLDER_TPL)}
			/>
		);
	}
}
