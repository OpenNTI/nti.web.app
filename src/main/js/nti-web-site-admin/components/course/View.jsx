import React from 'react';
import { Editor, CourseListing } from 'nti-web-course';

export default class View extends React.Component {
	constructor (props) {
		super(props);
		this.state = {};
	}

	onCancel = () => {
		this.setState({ createInProgress: false });
	};

	onFinish = () => {
		this.setState({ createInProgress: false });
	};

	launch = () => {
		Editor.createCourse();
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
