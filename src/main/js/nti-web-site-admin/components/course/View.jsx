import React from 'react';
import { Editor, CourseListing } from 'nti-web-course';
import {scoped} from 'nti-lib-locale';

const DEFAULT_TEXT = {
	createSuccess: 'Course was successfully created'
};

const t = scoped('ADMIN_COURSES', DEFAULT_TEXT);

export default class View extends React.Component {
	constructor (props) {
		super(props);
		this.state = {};
	}

	launch = () => {
		Editor.createCourse()
			.then(() => {
				// course created
				this.setState({createInProgress: true});

				setTimeout(() => { this.setState({createInProgress: false}); }, 1500);
			});
	};

	renderCreateButton () {
		return (<div className="create-course-button" onClick={this.launch}>Create New Course</div>);
	}

	renderCreateMessage () {
		return (<div className="course-create-message">{t('createSuccess')}</div>);
	}

	renderListing () {
		return this.state.createInProgress ? this.renderCreateMessage() : (<CourseListing/>);
	}

	render () {
		return (<div className="course-admin">
			{this.renderCreateButton()}
			{this.renderListing()}
		</div>);
	}
}
