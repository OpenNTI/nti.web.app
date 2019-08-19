import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Layouts, Loading, Prompt} from '@nti/web-commons';
import {LinkTo, Prompt as RoutePrompt} from '@nti/web-routing';

import TopicWindow from 'legacy/app/forums/components/topic/Window';
import BaseModel from 'legacy/model/Base';

import Registry from '../Registry';

import Styles from './View.css';

const cx = classnames.bind(Styles);

const handles = (obj) => !obj || obj.isTopic;
const {Uncontrolled} = Layouts;

export default
@Registry.register(handles)
class NTIWebCommunityTopic extends React.Component {
	static propTypes = {
		loading: PropTypes.bool,
		topic: PropTypes.object,
		channel: PropTypes.object.isRequired,
		focusComment: PropTypes.bool
	}

	static contextTypes = {
		router: PropTypes.object
	}

	componentDidUpdate (prevProps) {
		const {focusComment} = this.props;
		const {focusComment: prevFocus} = prevProps;

		if (focusComment && !prevFocus) {
			this.doFocusComment();
		}
	}

	doFocusComment () {
		if (this.topicCmp) {
			this.topicCmp.showNewComment();
		}
	}

	addNewTopic (rec) {
	}

	async updateTopic (rec) {
		const {topic} = this.props;

		try {
			const title = rec.get('title');
			const headline = await rec.get('headline').getInterfaceInstance;

			await topic.refresh({
				NTIID: topic.NTIID,
				title,
				headline
			});

			topic.onChange();
		} catch (e) {
			//swallow
		}
	}

	setupTopic = (renderTo) => {
		const {topic, channel, focusComment} = this.props;
		const isNewTopic = topic.isNewTopic;
		const topicModel = isNewTopic ? null : BaseModel.interfaceToModel(topic);
		const forum = channel.backer ? BaseModel.interfaceToModel(channel.backer) : null;

		if (this.topicCmp) {
			this.topicCmp.destroy();
		}

		this.topicCmp = TopicWindow.create({
			renderTo,
			record: topicModel,
			precache: { forum },
			onClose: () => this.onDismiss(),
			doClose: () => this.onDismiss(),
			doNavigate: () => {},
			monitors: {
				afterSave: (rec) => {
					if (isNewTopic) {
						this.addNewTopic(rec);
					} else {
						this.updateTopic(rec);
					}
				}
			}
		});

		if (focusComment) {
			this.doFocusComment();
		}
	}

	tearDownTopic = () => {
		if (this.topicCmp) {
			this.topicCmp.destroy();
			delete this.topicCmp;
		}
	}

	onDismiss = (e) => {
		const {channel} = this.props;

		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}

		return LinkTo.Object.routeTo(this.context.router, channel);
	}


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
	}

	render () {
		const {channel, topic, loading} = this.props;

		return (
			<Prompt.PagingWindow
				onDismiss={this.onDismiss}
				title={channel.title}
			>
				<Loading.Placeholder loading={loading || !topic} fallback={(<Loading.Spinner.Large />)}>
					<Uncontrolled className={cx('topic')} onMount={this.setupTopic} onUnmount={this.tearDownTopic} />
				</Loading.Placeholder>
				<RoutePrompt onRoute={this.onRoute} when />
			</Prompt.PagingWindow>
		);
	}
}