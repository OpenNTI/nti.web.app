import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
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
	title: 'Posted in %(channelName)s'
});

export default
@Registry.register(handles)
@Decorators.addClassToRoot('community-content-open')
class NTIWebCommunityNote extends React.Component {
	static propTypes = {
		loading: PropTypes.bool,
		topic: PropTypes.object.isRequired,
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
		if (this.noteCmp) {
			this.noteCmp.showNewReply();
		}
	}

	setupNote = (renderTo) => {
		const {topic, focusComment} = this.props;
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

		if (focusComment) {
			this.doFocusComment();
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
		const title = topic ? t('title', {channelName: topic.ContainerTitle}) : '';

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