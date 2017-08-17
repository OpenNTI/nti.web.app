import React from 'react';
import { Prompt } from 'nti-web-commons';
import { CourseWizard, CourseListing } from 'nti-web-course';

export default class View extends React.Component {
	constructor (props) {
		super(props);
		this.state = {};
	}

	onCancel = () => {
		this.setState({ createInProgress: false });

		this.modalDialog && this.modalDialog.dismiss && this.modalDialog.dismiss();

		delete this.modalDialog;
	};

	onFinish = () => {
		this.setState({ createInProgress: false });

		this.modalDialog && this.modalDialog.dismiss && this.modalDialog.dismiss();

		delete this.modalDialog;
	};

	launch = () => {
		this.setState({ createInProgress: true });

		this.modalDialog = Prompt.modal(<CourseWizard title="Create a New Course" onCancel={this.onCancel} onFinish={this.onFinish}/>,
			'course-panel-wizard');
	};

	renderCreateButton () {
		return (<div className="create-course-button" onClick={this.launch}>Create New Course</div>);
	}

	renderListing () {
		return this.state.createInProgress ? null : (<CourseListing/>);
	}

	render () {
		return (<div className="course-admin">
			{this.renderCreateButton()}
			{this.renderListing()}
		</div>);
	}
}
