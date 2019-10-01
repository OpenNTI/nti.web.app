import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {getScrollParent} from '@nti/lib-dom';
import {Layouts, Loading, Prompt, Decorators} from '@nti/web-commons';
import {LinkTo, Prompt as RoutePrompt} from '@nti/web-routing';

import NoteWindow from 'legacy/app/annotations/note/Window';
import BaseModel from 'legacy/model/Base';
import ContextStateStore from 'legacy/app/context/StateStore';

import Registry from '../Registry';

import Styles from './View.css';

const cx = classnames.bind(Styles);
const handles = (obj) => obj &&  obj.isNote;
const {Uncontrolled} = Layouts;
const t = scoped('nti-web-community-overrides.note.View', {
	title: 'Posted in %(channelName)s',
	deletedChannel: 'Deleted Item'
});

export default
@Registry.register(handles)
@Decorators.addClassToRoot('community-content-open')
class NTIWebCommunityNote extends React.Component {
	static propTypes = {
		loading: PropTypes.bool,
		topic: PropTypes.object.isRequired,
		channel: PropTypes.object.isRequired,
		selectedComment: PropTypes.string,
		focusNewComment: PropTypes.bool
	}

	static contextTypes = {
		router: PropTypes.object
	}

	componentDidUpdate (prevProps) {
		const {focusNewComment, selectedComment} = this.props;
		const {focusNewComment: prevFocus, selectedComment: prevComment} = prevProps;

		if (focusNewComment && !prevFocus) {
			this.doFocusNewComment();
		}

		if (selectedComment !== prevComment) {
			this.doSelectComment(selectedComment);
		}
	}

	doFocusNewComment () {
		if (this.noteCmp) {
			this.noteCmp.showNewReply();
		}
	}

	async doSelectComment (comment) {
		if (!this.noteCmp) { return; }

		try {
			const cmp = await this.noteCmp.getReplyCmp(comment);

			if (cmp && cmp.el && cmp.el.dom) {
				const scroll = getScrollParent(this.noteCmp.el.dom);

				cmp.el.scrollCompletelyIntoView(Ext.get(scroll));//eslint-disable-line
			}
		} catch (e) {
			//swallow
		}
	}

	setupNote = (renderTo) => {
		const {topic, focusNewComment, selectedComment} = this.props;
		const noteModel = BaseModel.interfaceToModel(topic);

		if (this.noteCmp) {
			this.noteCmp.destroy();
		}

		this.noteCmp = NoteWindow.create({
			renderTo,
			record: noteModel,
			doClose: () => this.onDismiss(),
			doNavigate: (obj) => {
				const store = ContextStateStore.getInstance();
				const context = store.getContext();
				const parts = context.reverse();

				for (let part of parts) {
					if (part.cmp && part.cmp.navigateToObject) {
						return part.cmp.navigateToObject(obj);
					}
				}
			}
		});

		if (focusNewComment) {
			this.doFocusNewComment();
		}

		if (selectedComment) {
			this.doSelectComment(selectedComment);
		}
	}

	tearDownNote = () => {
		if (this.noteCmp) {
			this.noteCmp.destroy();
			delete this.noteCmp;
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
		if (!this.noteCmp || !this.noteCmp.allowNavigation) {
			cont();
			return;
		}

		try {
			await this.noteCmp.allowNavigation();
			cont();
		} catch (e) {
			stop();
		}
	}

	render () {
		const {topic, loading} = this.props;
		const title = topic ? t('title', {channelName: topic.ContainerTitle || t('deletedChannel')}) : '';

		return (
			<Prompt.PagingWindow
				onDismiss={this.onDismiss}
				title={title}
			>
				<Loading.Placeholder loading={loading || !topic} fallback={(<Loading.Spinner.Large />)}>
					<Uncontrolled className={cx('note')} onMount={this.setupNote} onUnmount={this.tearDownNote} />
				</Loading.Placeholder>
				<RoutePrompt onRoute={this.onRoute} when />
			</Prompt.PagingWindow>
		);
	}
}