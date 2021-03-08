import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { Loading, Layouts } from '@nti/web-commons';
import { decorate, rawContent } from '@nti/lib-commons';
import { scoped } from '@nti/lib-locale';
import TopicViewer from 'internal/legacy/app/forums/components/topic/Window';

import Registry from '../Registry';

import Styles from './View.css';
import Store from './Store';
import ActiveUsers from './ActiveUsers';

const cx = classnames.bind(Styles);
const t = scoped('NTIWebAppLessonItems.overrides.topic', {
	unavailable: 'This topic is unavailable',
});

const { Aside } = Layouts;

const DATA_ATTR = 'data-topic-content-placeholder';
const PLACEHOLDER_TPL = `<div ${DATA_ATTR}></div>`;

const MIME_TYPES = {
	'application/vnd.nextthought.discussionref': true,
	'application/vnd.nextthought.discussion': true,
};
const handles = obj => {
	const { location } = obj || {};
	const { item } = location || {};

	return item && MIME_TYPES[item.MimeType];
};

class NTIWebAppLessonItemsTopic extends React.Component {
	static deriveBindingFromProps(props) {
		const { location = {} } = props;

		return {
			topicRef: location.item,
			course: props.course,
		};
	}

	static propTypes = {
		location: PropTypes.shape({
			item: PropTypes.object,
		}),
		course: PropTypes.object,

		loading: PropTypes.bool,
		error: PropTypes.any,
		topicModel: PropTypes.object,
		topicRef: PropTypes.object,
		activeUsers: PropTypes.array,
	};

	attachTopicRef = node => {
		if (!this.node && node) {
			this.node = node;
			this.setupTopic();
		} else if (this.node && !node) {
			this.node = null;
			this.tearDownTopic();
		}
	};

	componentDidUpdate(prev) {
		const { topicModel } = this.props;
		const { topicModel: prevTopic } = prev;

		if (topicModel !== prevTopic) {
			this.setupTopic();
		}
	}

	componentWillUnmount() {
		this.tearDownTopic();
	}

	setupTopic() {
		this.tearDownTopic();

		const { topicModel } = this.props;
		const renderTo = this.node && this.node.querySelector(`[${DATA_ATTR}]`);

		if (!topicModel || !renderTo) {
			return;
		}

		this.topicViewer = TopicViewer.create({
			record: topicModel,
			precache: {},
			hideHeader: true,
			renderTo,
			doClose: () => {},
			doNavigate: () => {},
		});
	}

	tearDownTopic() {
		if (this.topicViewer) {
			this.topicViewer.destroy();
			delete this.topicViewer;
		}
	}

	render() {
		const { loading, activeUsers, error } = this.props;

		return (
			<div className={cx('topic-view')}>
				<Aside component={ActiveUsers} activeUsers={activeUsers} />
				{error
					? this.renderError()
					: loading
					? this.renderLoading()
					: this.renderTopic()}
			</div>
		);
	}

	renderLoading() {
		return (
			<div className={cx('loading-container')}>
				<Loading.Spinner.Large />
			</div>
		);
	}

	renderError() {
		const { error, topicRef: { icon, title } = {} } = this.props;
		const is404 = error && error.statusCode === 404;

		return (
			<div className={cx('error', { 'is-404': is404 })}>
				{icon && (
					<div
						className={cx('icon')}
						style={{ backgroundImage: `url(${icon})` }}
					/>
				)}
				{title && <div className={cx('title')}>{title}</div>}
				<div className={cx('message')}>{t('unavailable')}</div>
			</div>
		);
	}

	renderTopic() {
		return (
			<div ref={this.attachTopicRef} {...rawContent(PLACEHOLDER_TPL)} />
		);
	}
}

export default decorate(NTIWebAppLessonItemsTopic, [
	Registry.register(handles),
	Store.connect([
		'loading',
		'error',
		'topicModel',
		'topicRef',
		'activeUsers',
	]),
]);
