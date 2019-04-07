import React from 'react';
import PropTypes from 'prop-types';
import {CalendarEvents, getAvailableCalendars} from '@nti/web-calendar';
import {FillToBottom} from '@nti/web-commons';
import classnames from 'classnames/bind';

import styles from './Sidebar.css';

const cx = classnames.bind(styles);

export default class CalendarEventSidebar extends React.Component {

	static propTypes = {
		course: PropTypes.object.isRequired
	}

	state = {}

	constructor (props) {
		super(props);
		this.setUp();
	}

	setUp = async () => {
		const calendar = await this.getCalendar();
		this.setState({calendar});
	}

	async getCalendar () {
		const {course} = this.props;
		const courseId = course && course.getID();

		return !courseId ? null : await getAvailableCalendars()
			.then(calendars => calendars.find(c => (c.CatalogEntry || {}).CourseNTIID === courseId));
	}

	render () {
		const {calendar} = this.state;

		return !calendar ? null : (
			<FillToBottom limit className={cx('calendar-event-sidebar')}>
				<CalendarEvents calendar={calendar} />
			</FillToBottom>
		);
	}
}
