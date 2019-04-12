import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {TranscriptedVideo} from '@nti/web-content';
import {Router} from '@nti/web-routing';
import {Layouts} from '@nti/web-commons';

import Editor from 'legacy/editor/Editor';
import MediaViewerStore from 'legacy/app/mediaviewer/StateStore';
import UserDataActions from 'legacy/app/userdata/Actions';
import SharingUtils from 'legacy/util/Sharing';
import AnalyticsUtils from 'legacy/util/Analytics';
import DomUtils from 'legacy/util/Dom';
import BaseModel from 'legacy/model/Base';

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

export default
@Registry.register(handles)
class NTIWebLessonItemsVideo extends React.Component {
	static propTypes = {
		location: PropTypes.shape({
			item: PropTypes.object
		}),
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
		const {course} = this.props;
		const {newNote} = this.state;
		const courseModel = BaseModel.interfaceToModel(course);

		if (!this.editor) {
			this.editor = Editor.create({
				renderTo: renderTo,
				enableShareControls: true,
				enableTitle: true,
				enableFileUpload: true,
				width: 325,
				listeners: {
					'no-title-content': () => true,
					save: (...args) => this.saveEditor(...args),
					'canceling-editor': () => {
						this.setState({newNote: null, alignTo: null});
					}
				}
			}).addCls('in-gutter');
		}

		this.mediaStore = this.mediaStore || MediaViewerStore.getInstance();

		this.mediaStore.getSharingPreferences(newNote.ContainerId, courseModel)
			.then((prefs) => {
				const sharing = prefs && prefs.sharing;
				const sharedWith = sharing && sharing.sharedWith;

				return SharingUtils.sharedWithToSharedInfo(SharingUtils.resolveValue(sharedWith), courseModel);
			})
			.then((shareInfo) => {
				if (this.editor) {
					this.editor.setSharedWith(shareInfo);
				}
			});

		this.realignEditor();

		this.editor.activate();
		this.editor.show();
		this.editor.toFront();
		this.editor.focus();
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
		let left = alignTo.left;
		let top = alignTo.top;

		try {
			top = newNote.getYPositionInTranscript();
		} catch (e) {
			//swallow
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


	render () {
		const {newNote} = this.state;
		const {location, course, firstSelection} = this.props;
		const {item} = location || {};

		if (!item) { return null; }

		return (
			<Router.RouteForProvider getRouteFor={this.getRouteFor} >
				<div className="nti-web-lesson-items-video" ref={this.attachRef}>
					<TranscriptedVideo
						course={course}
						videoId={item.getID()}
						disableNoteCreation={!!newNote}
						autoPlay={firstSelection}
						analyticsData={this.getAnalyticsData()}
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
