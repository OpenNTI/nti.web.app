import React from 'react';
import PropTypes from 'prop-types';

import { Router } from '@nti/web-routing';
import { CalendarEvents, Event, getCourseCalendar } from '@nti/web-calendar';
import { FillToBottom } from '@nti/web-commons';

const SidebarContent = styled(FillToBottom)`
	& :global(.icon-wrapper) {
		display: none;
	}

	& :global(.calendar-day .day-events) {
		padding: 0;
	}
`;
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
				<SidebarContent limit>
					<CalendarEvents calendar={calendar} />
				</SidebarContent>
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
