import React from 'react';
import PropTypes from 'prop-types';
import { Flyout } from '@nti/web-commons';
import { Editor } from '@nti/web-course';
import { encodeForURI } from '@nti/lib-ntiids';

export default class AdminToolbar extends React.Component {
	static propTypes = {
		handleNav: PropTypes.func.isRequired,
		onCourseCreated: PropTypes.func,
		onCourseModified: PropTypes.func,
		canCreate: PropTypes.bool
	}

	attachFlyoutRef = x => this.flyout = x

	constructor (props) {
		super(props);
		this.state = {};
	}

	renderTitle () {
		return (<div className="title">Administrator</div>);
	}

	goToSiteAdmin = () => {
		this.props.handleNav('Admin', '/siteadmin');
	}

	renderCreateTrigger () {
		return (
			<div className="create-button">
				<div className="add-container"><i className="icon-add"/></div>
				<div className="create-label">Create</div>
			</div>
		);
	}

	launchCourseWizard = () => {
		const { onCourseCreated, onCourseModified } = this.props;

		this.flyout && this.flyout.dismiss();

		Editor.createCourse(onCourseModified).then((createdEntry) => {
			// course was created, do post processing
			onCourseCreated && onCourseCreated();

			this.props.handleNav(createdEntry.Title, '/course/' + encodeForURI(createdEntry.CourseNTIID) + '/info');
		});
	}

	// these endpoints aren't available yet

	// launchCommunityCreation = () => {
	// 	this.flyout && this.flyout.dismiss();
	// }
	//
	// launchBookCreation = () => {
	// 	this.flyout && this.flyout.dismiss();
	// }

	renderCreateButton () {
		const { canCreate } = this.props;

		if(!canCreate) {
			return null;
		}

		return (
			<Flyout.Triggered
				className="admin-create-options"
				trigger={this.renderCreateTrigger()}
				horizontalAlign={Flyout.ALIGNMENTS.LEFT}
				sizing={Flyout.SIZES.MATCH_SIDE}
				ref={this.attachFlyoutRef}
			>
				<div>
					<div className="create-item" onClick={this.launchCourseWizard}>Course</div>
				</div>
			</Flyout.Triggered>
		);
	}

	renderSiteAdminButton () {
		return (<div className="admin-nav" onClick={this.goToSiteAdmin}/>);
	}

	renderOptions () {
		// hide for now
		//return (<div className="gear-button"><i className="icon-settings"/></div>);

		return null;
	}

	renderControls () {
		return (
			<div className="controls">
				{this.renderSiteAdminButton()}
				{this.renderOptions()}
				{this.renderCreateButton()}
			</div>
		);
	}

	render () {
		return (
			<div className="admin-toolbar">
				{this.renderTitle()}
				<div className="space"/>
				{this.renderControls()}
			</div>
		);
	}
}
