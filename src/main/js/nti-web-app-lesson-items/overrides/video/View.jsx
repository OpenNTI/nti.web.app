import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {decorate} from '@nti/lib-commons';
import {TranscriptedVideo} from '@nti/web-content';
import {Router} from '@nti/web-routing';
import {Layouts} from '@nti/web-commons';
import {getViewportWidth} from '@nti/lib-dom';

import DiscussionEditor from 'legacy/app/contentviewer/components/editor/DiscussionEditor';
import UserDataActions from 'legacy/app/userdata/Actions';
import SharingUtils from 'legacy/util/Sharing';
import DomUtils from 'legacy/util/Dom';
import BaseModel from 'legacy/model/Base';
import SearchStore from 'legacy/app/search/StateStore';

import Registry from '../Registry';

import Styles from './View.css';

const cx = classnames.bind(Styles);

const MIME_TYPES = {
	'application/vnd.nextthought.ntivideo': true
};

const handles = (obj) => {
	const {location} = obj || {};
	const {item} = location || {};

	return item && MIME_TYPES[item.MimeType];
};

class NTIWebLessonItemsVideo extends React.Component {
	static propTypes = {
		location: PropTypes.shape({
			item: PropTypes.object
		}),
		activeObjectId: PropTypes.string,
		course: PropTypes.object,
		lessonInfo: PropTypes.object,
		firstSelection: PropTypes.bool
	}

	state = {}

	attachRef = x => this.node = x;

	getRouteFor = (obj) => {
		if (obj.isNote && !obj.NTIID) {
			return (e) => {
				this.setState({
					newNote: obj,
					alignTo: e.target.getBoundingClientRect()
				});
			};
		}
	}

	showEditor = (renderTo) => {
		const {course, location} = this.props;
		const {newNote} = this.state;

		const courseModel = BaseModel.interfaceToModel(course);
		const page = location?.item ? BaseModel.interfaceToModel(location.item) : null;

		const clear = () => this.setState({newNote: null, alignTo: null});

		if (!this.editor) {
			this.editor = DiscussionEditor.create({
				renderTo: renderTo,
				htmlCls: 'inline-note-editor',
				location: {
					currentBundle: courseModel,
					pageInfo: page
				},
				applicableRange: newNote.applicableRange,
				rangeInfo: {
					containerId: newNote.ContainerId,
					toString: () => newNote.selectedText
				},

				afterSave: clear,
				onCancel: clear
			}).addCls('in-gutter');
		}

		this.realignEditor();

		this.editor.show();
		this.editor.toFront();
	}


	hideEditor = () => {
		if (this.editor) {
			document.removeEventListener('scroll', this.realignEditor, true);
			this.editor.destroy();
			delete this.editor;
		}
	}


	realignEditor = () => {
		if (!this.node) {
			return;
		}

		const offsets = this.node.getBoundingClientRect();
		const {alignTo, newNote} = this.state;
		const editorWidth = this?.editor?.getWidth() ?? 400;
		const viewWidth = getViewportWidth();

		let left = alignTo.left;
		let top = alignTo.top;

		try {
			top = newNote.getYPositionInTranscript();
		} catch (e) {
			//swallow
		}

		if (left + editorWidth + 10 > viewWidth) {
			left = viewWidth - 20 - editorWidth;
		}

		const mark = this.editor.renderTo;

		mark.style.top = `${top - offsets.top + 50}px`;
		mark.style.left = `${left - offsets.left + 20}px`;

		// this.editor.showAt(left, top);
	}


	async saveEditor (editor, record, value) {
		const {newNote} = this.state;
		const {applicableRange, ContainerId, selectedText} = newNote;
		const style = 'suppressed';

		const {body, title} = value;
		const sharing = value.sharingInfo ? SharingUtils.sharedWithForSharingInfo(value.sharingInfo) : [];

		//Avoid saving empty notes or just returns.
		if (DomUtils.isEmpty(body)) {
			this.editor.markError(this.editor.el.down('.content'), 'Please enter text before you save');
			return false;
		}

		this.editor.el.mask('Saving...');

		this.userDataActions = this.userDataActions || UserDataActions.create();

		try {
			await this.userDataActions.__saveNote(applicableRange, body, title, ContainerId, sharing, selectedText, style);

			this.editor.el.unmask();
			this.setState({
				newNote: null,
				alignTo: null
			});
		} catch (e) {
			alert('There was an error saving your note.');
			this.editor.el.unmask();
		}

	}


	getAnalyticsData = () => {
		const {course, lessonInfo} = this.props;

		return {
			context: [course.getID(), lessonInfo.id]
		};
	}


	getSearchHit = (video) => {
		this.SearchStore = this.SearchStore || SearchStore.getInstance();

		const {hit} = this.SearchStore.getHitForContainer(video.getID()) || {};
		return hit;
	}


	onNewNote = () => {
		const videoId = this?.props?.location?.item?.getID();
		const alignTo = this?.node?.querySelector('[data-anchor-id] h1');

		if (!alignTo || !videoId) { return; }

		const rect = alignTo.getBoundingClientRect();

		this.setState({
			alignTo: {
				top: rect.top,
				left: rect.right + 36,
				right: rect.right + 53,
				bottom: rect.top + 53
			},
			newNote: {
				MimeType: 'application/vnd.nextthought.note',
				isNote: true,
				NTIID: null,
				body: null,
				title: '',
				selectedText: '',
				ContainerId: videoId,
				applicableRange: {Class: 'ContentRangeDescription'}
			}
		});
	}


	render () {
		const {newNote} = this.state;
		const {location, course, firstSelection, activeObjectId} = this.props;
		const {item} = location || {};
		const hit = this.getSearchHit(item);
		const startTime = hit && hit.get('StartMilliSecs');

		if (!item) { return null; }

		return (
			<Router.RouteForProvider getRouteFor={this.getRouteFor} >
				<div className="nti-web-lesson-items-video" ref={this.attachRef}>
					<TranscriptedVideo
						course={course}
						videoId={item.getID()}
						scrolledTo={activeObjectId}
						disableNoteCreation={!!newNote}
						autoPlay={firstSelection}
						analyticsData={this.getAnalyticsData()}
						startTime={(startTime || 0) / 1000}
						onNewNote={this.onNewNote}
					/>
					{newNote && (
						<Layouts.Uncontrolled
							onMount={this.showEditor}
							onUnmount={this.hideEditor}
							attributes={{class: cx('note-editor-wrapper')}}
						/>
					)}
				</div>
			</Router.RouteForProvider>
		);
	}
}

export default decorate(NTIWebLessonItemsVideo, [
	Registry.register(handles)
]);
