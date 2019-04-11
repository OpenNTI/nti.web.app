import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Loading, Layouts} from '@nti/web-commons';

import ContentViewer from 'legacy/app/contentviewer/Index';

import Registry from '../Registry';

import Styles from './View.css';
import Sidebar from './Sidebar';
import Store from './Store';

const cx = classnames.bind(Styles);

const {Aside, Uncontrolled} = Layouts;

const MIME_TYPES = {
	'application/vnd.nextthought.assessment.discussionassignment': true,
	'application/vnd.nextthought.assessment.timedassignment': true,
	'application/vnd.nextthought.assessment.assignment': true,
	'application/vnd.nextthought.assignmentref': true
};

const handles = (obj) => {
	const {location} = obj || {};
	const {item} = location || {};

	return item && MIME_TYPES[item.MimeType];
};

export default
@Registry.register(handles)
@Store.connect([
	'loading',
	'error',

	'courseModel',
	'assignmentsModel',
	'assignmentModel',
	'historyModel',
	'student',

	'updateHistoryItem'
])
class NTIWebAppLessonItemsAssignment extends React.Component {
	static deriveBindingFromProps (props) {
		const {location = {}} = props;

		return {
			assignment: location.item,
			course: props.course
		};
	}

	static propTypes = {
		location: PropTypes.shape({
			item: PropTypes.object
		}),
		course: PropTypes.object.isRequired,

		handleNavigation: PropTypes.func,

		loading: PropTypes.bool,
		error: PropTypes.any,

		courseModel: PropTypes.object,
		assignmentsModel: PropTypes.object,
		assignmentModel: PropTypes.object,
		historyModel: PropTypes.object,
		student: PropTypes.object,

		updateHistoryItem: PropTypes.func
	}

	state = {}


	setupAssignment = (renderTo) => {
		this.tearDownAssignment();

		const {
			courseModel,
			assignmentModel,
			historyModel,
			student,
			updateHistoryItem
		} = this.props;

		if (!renderTo || !assignmentModel) { return; }

		this.contentViewer = ContentViewer.create({
			renderTo,
			contentOnly: true,
			bundle: courseModel,
			setActiveHistoryItem: (item) => {
				this.setState({activeHistoryItemModel: item});
			},
			showRemainingTime: (time, max, getSubmitFn) => {
				this.setState({
					remainingTime: time,
					maxTime: max,
					getSubmitFn
				});
			},
			handleNavigation: (title, route, precache) => {
				const {handleNavigation} = this.props;

				if (handleNavigation) {
					handleNavigation(title, `/assignment/${route}`, precache);
				}
			},
			onAssignmentSubmitted: async (submittedId, historyItemLink) => {
				const result = await updateHistoryItem(submittedId, historyItemLink);
				const {historyModel:updatedHistory, container} = result || {};

				if (updatedHistory && this.contentViewer) {
					this.contentViewer.updateHistory(updatedHistory, container);
				}
			},
			assignment: assignmentModel,
			historyItem: historyModel,
			student
		});
	}


	tearDownAssignment = () => {
		if (this.contentViewer) {
			this.contentViewer.destroy();
			delete this.contentViewer;
		}
	}

	doStart = () => {
		if (this.contentViewer && this.contentViewer.reader) {
			return this.contentViewer.reader.doStartAssignment();
		}
	}


	render () {
		const {loading, error, assignmentModel} = this.props;
		// const {submitting} = this.state;

		return (
			<div className={cx('assignment-view')}>
				<Aside
					component={Sidebar}
					assignmentModel={assignmentModel}
					doStart={this.doStart}
					{...this.state}
				/>
				{loading && (
					<div>
						<Loading.Spinner.Large />
					</div>
				)}
				{!loading && error && this.renderError()}
				{!loading && !error && this.renderContent()}
			</div>
		);
	}

	renderError () {
		//TODO: figure this out
		return null;
	}


	renderContent () {
		return (
			<Uncontrolled onMount={this.setupAssignment} onUnmount={this.tearDownAssignment} />
		);
	}
}
