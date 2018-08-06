import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Flyout } from '@nti/web-commons';
import { Editor, Templates } from '@nti/web-course';
import { encodeForURI } from '@nti/lib-ntiids';
import { getService } from '@nti/web-client';
import { Models } from '@nti/lib-interfaces';

import {getString} from 'legacy/util/Localization';

import Option from './Option';

export default class CreateCourse extends Component {
	static propTypes = {
		onCourseCreated: PropTypes.func.isRequired,
		canCreate: PropTypes.bool.isRequired,
		onCourseModified: PropTypes.func,
		handleNav: PropTypes.func,
	};

	state = {
	}

	attachFlyoutRef = x => (this.flyout = x);

	async componentDidMount () {
		const service = await getService();
		const courseWorkspace = service.getWorkspace('Courses');
		const allCoursesCollection = courseWorkspace && service.getCollection('AllCourses', courseWorkspace.Title);

		if (allCoursesCollection && allCoursesCollection.accepts.includes(Models.courses.scorm.SCORMInstance.MimeType)) {
			this.setState({canCreateScorm: true});
		}
	}

	launchCourseWizard = template => {
		const { onCourseCreated, onCourseModified, handleNav } = this.props;

		if (this.flyout) {
			this.flyout.dismiss();
		}

		Editor.createCourse(onCourseModified, template).then(createdEntry => {
			onCourseCreated(createdEntry);	// course was created, do post processing

			if (handleNav && createdEntry) {
				handleNav(
					createdEntry.Title,
					'/course/' + encodeForURI(createdEntry.CourseNTIID) + '/info'
				);
			}
		});
	};

	renderCreateTrigger () {
		return (
			<div className="admin-create-button">
				<div className="add-container">
					<i className="icon-add" />
				</div>
				<div className="create-label">Create</div>
			</div>
		);
	}

	render () {
		if (!this.props.canCreate) {
			return null;
		}

		return (
			<Flyout.Triggered
				className="admin-create-options"
				trigger={this.renderCreateTrigger()}
				horizontalAlign={Flyout.ALIGNMENTS.RIGHT}
				ref={this.attachFlyoutRef}
			>
				<React.Fragment>
					<Option
						className="new-course"
						title={getString('NextThought.view.courseware.assessment.admin.createCourse.new')}
						description=""
						onClick={() => this.launchCourseWizard(Templates.Blank)}
					/>
					<Option
						className="import-course"
						title={getString('NextThought.view.courseware.assessment.admin.createCourse.import')}
						description={getString('NextThought.view.courseware.assessment.admin.createCourse.import.description')}
						onClick={() => this.launchCourseWizard(Templates.Import)}
					/>
					{this.state.canCreateScorm && (
						<Option
							className="import-scorm-package"
							title="Import a SCORM Package"
							description="Use content from external services."
							onClick={() => this.launchCourseWizard(Templates.Scorm)}
						/>
					)}
				</React.Fragment>
			</Flyout.Triggered>
		);
	}
}
