import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import { decorate } from '@nti/lib-commons';
import { scoped } from '@nti/lib-locale';
import { Layouts, Loading, Prompt, Decorators } from '@nti/web-commons';
import { LinkTo, Prompt as RoutePrompt } from '@nti/web-routing';
import BlogWindow from 'legacy/app/forums/components/blog/Window';

import BaseModel from 'legacy/model/Base';

import Registry from '../Registry';

import Styles from './View.css';

const cx = classnames.bind(Styles);
const t = scoped('nti-web-community-overrides.topic.View', {
	title: {
		newTopic: 'Posting in %(channelName)s',
		existingTopic: 'Posted in %(channelName)s',
	},
});

const handles = obj => obj && obj.isBlogEntry;
const { Uncontrolled } = Layouts;

class NTIWebCommunityTopic extends React.Component {
	static propTypes = {
		loading: PropTypes.bool,
		topic: PropTypes.object,
		channel: PropTypes.object.isRequired,
		selectedComment: PropTypes.string,
		focusNewComment: PropTypes.bool,
	};

	static contextTypes = {
		router: PropTypes.object,
	};

	componentDidUpdate(prevProps) {
		const { focusNewComment, selectedComment } = this.props;
		const {
			focusNewComment: prevFocus,
			selectedComment: prevComment,
		} = prevProps;

		if (focusNewComment && !prevFocus) {
			this.doFocusNewComment();
		}

		if (selectedComment !== prevComment) {
			this.doSelectComment(selectedComment);
		}
	}

	doFocusNewComment() {
		if (this.topicCmp) {
			this.topicCmp.showNewComment();
		}
	}

	async doSelectComment(comment) {
		if (!this.topicCmp) {
			return;
		}

		this.selectingComment = comment;

		try {
			const commentModel = await Service.getObject(comment); //eslint-disable-line

			if (this.selectingComment !== comment) {
				return;
			}
			if (this.topicCmp) {
				this.topicCmp.selectComment(commentModel);
			}
		} catch (e) {
			//swallow
		}
	}

	setupTopic = renderTo => {
		const { topic, focusNewComment, selectedComment } = this.props;
		const topicModel = BaseModel.interfaceToModel(topic);

		if (this.topicCmp) {
			this.topicCmp.destroy();
		}

		this.topicCmp = BlogWindow.create({
			renderTo,
			record: topicModel,
			hideHeader: true,
			onClose: () => this.onDismiss(),
			doClose: () => this.onDismiss(),
			doNavigate: () => {},
		});

		if (focusNewComment) {
			this.doFocusNewComment();
		}

		if (selectedComment) {
			this.doSelectComment(selectedComment);
		}
	};

	tearDownTopic = () => {
		if (this.topicCmp) {
			this.topicCmp.destroy();
			delete this.topicCmp;
		}
	};

	onDismiss = e => {
		const { channel } = this.props;

		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}

		return LinkTo.Object.routeTo(this.context.router, channel);
	};

	onRoute = async (cont, stop) => {
		if (!this.topicCmp || !this.topicCmp.allowNavigation) {
			cont();
			return;
		}

		try {
			await this.topicCmp.allowNavigation();
			cont();
		} catch (e) {
			stop();
		}
	};

	getTitle() {
		const { topic, channel } = this.props;

		if (!topic) {
			return '';
		}

		return topic.isNewTopic
			? t('title.newTopic', { channelName: channel.title })
			: t('title.existingTopic', { channelName: topic.ContainerTitle });
	}

	render() {
		const { topic, loading } = this.props;
		const title = this.getTitle();

		return (
			<Prompt.PagingWindow onDismiss={this.onDismiss} title={title}>
				<Loading.Placeholder
					loading={loading || !topic}
					fallback={<Loading.Spinner.Large />}
				>
					<Uncontrolled
						className={cx('topic')}
						onMount={this.setupTopic}
						onUnmount={this.tearDownTopic}
					/>
				</Loading.Placeholder>
				<RoutePrompt onRoute={this.onRoute} when />
			</Prompt.PagingWindow>
		);
	}
}

export default decorate(NTIWebCommunityTopic, [
	Registry.register(handles),
	Decorators.addClassToRoot('community-content-open'),
]);
