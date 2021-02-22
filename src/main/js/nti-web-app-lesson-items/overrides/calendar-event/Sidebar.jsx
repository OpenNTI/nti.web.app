import React from 'react';
import PropTypes from 'prop-types';
import { Router } from '@nti/web-routing';
import { CalendarEvents, Event, getCourseCalendar } from '@nti/web-calendar';
import { FillToBottom } from '@nti/web-commons';
import classnames from 'classnames/bind';

import styles from './Sidebar.css';

const cx = classnames.bind(styles);

export default class CalendarEventSidebar extends React.Component {
	static propTypes = {
		course: PropTypes.object.isRequired,
	};

	state = {};

	constructor(props) {
		super(props);
		this.setUp();
	}

	setUp = async () => {
		const calendar = await this.getCalendar();
		this.setState({ calendar });
	};

	async getCalendar() {
		const { course } = this.props;
		const courseId = course && course.getID();

		return !courseId ? null : await getCourseCalendar(courseId);
	}

	getRouteFor = viewEvent => {
		if (
			(viewEvent || {}).MimeType ===
			'application/vnd.nextthought.courseware.coursecalendarevent'
		) {
			return () => {
				this.setState({ viewEvent });
			};
		}
	};

	dismissViewer = () => this.setState({ viewEvent: undefined });

	render() {
		const { calendar, viewEvent } = this.state;

		return !calendar ? null : (
			<Router.RouteForProvider getRouteFor={this.getRouteFor}>
				<FillToBottom limit className={cx('calendar-event-sidebar')}>
					<CalendarEvents calendar={calendar} />
				</FillToBottom>
				{viewEvent && (
					<Event.View
						event={viewEvent}
						onDismiss={this.dismissViewer}
					/>
				)}
			</Router.RouteForProvider>
		);
	}
}
