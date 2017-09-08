import React from 'react';
import PropTypes from 'prop-types';
import { Flyout, Prompt} from 'nti-web-commons';
import { CourseWizard } from 'nti-web-course';

export default class AdminToolbar extends React.Component {
	static propTypes = {
		handleNav: PropTypes.func.isRequired
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

	onCancel = () => {
		this.modalDialog && this.modalDialog.dismiss && this.modalDialog.dismiss();

		delete this.modalDialog;
	}

	onFinish = () => {
		this.modalDialog && this.modalDialog.dismiss && this.modalDialog.dismiss();

		delete this.modalDialog;
	}

	launchCourseWizard = () => {
		this.flyout && this.flyout.dismiss();

		this.modalDialog = Prompt.modal(<CourseWizard title="Create a New Course" onCancel={this.onCancel} onFinish={this.onFinish}/>,
			'course-panel-wizard');
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
		return (<Flyout.Triggered
			className="admin-create-options"
			trigger={this.renderCreateTrigger()}
			horizontalAlign={Flyout.ALIGNMENTS.LEFT}
			sizing={Flyout.SIZES.MATCH_SIDE}
			ref={this.attachFlyoutRef}
		>
			<div>
				<div className="create-item" onClick={this.launchCourseWizard}>Course</div>
			</div>
		</Flyout.Triggered>);
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
