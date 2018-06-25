import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Flyout } from '@nti/web-commons';
import { Editor, Templates } from '@nti/web-course';
import { encodeForURI } from '@nti/lib-ntiids';

import Option from './Option';

export default class CreateCourse extends Component {
	static propTypes = {
		onCourseCreated: PropTypes.func.isRequired,
		canCreate: PropTypes.bool.isRequired,
		onCourseModified: PropTypes.func,
		handleNav: PropTypes.func,
	};

	attachFlyoutRef = x => (this.flyout = x);

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
						title="New Course"
						description=""
						onClick={() => this.launchCourseWizard(Templates.Blank)}
					/>
					<Option
						className="import-course"
						title="Import a Course"
						description="Use content from a previous course."
						onClick={() => this.launchCourseWizard(Templates.Import)}
					/>
					<Option
						className="import-scorm-package"
						title="Import a SCORM Package"
						description="Use content from external services."
						onClick={() => this.launchCourseWizard(Templates.Scorm)}
					/>
				</React.Fragment>
			</Flyout.Triggered>
		);
	}
}
