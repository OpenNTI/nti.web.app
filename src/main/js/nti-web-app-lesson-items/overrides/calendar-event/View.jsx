import React from 'react';
import PropTypes from 'prop-types';

import { Event } from '@nti/web-calendar';
import { decorate } from '@nti/lib-commons';
import { Layouts } from '@nti/web-commons';

import TypeRegistry from '../Registry';

import Sidebar from './Sidebar';

const View = styled(Event.View)`
	& :global(.calendar-event-editor) {
		width: auto;
	}
`;

const MIME_TYPES = {
	'application/vnd.nextthought.nticalendareventref': true,
};

const handles = obj => {
	const { location } = obj || {};
	const { item } = location || {};

	return item && MIME_TYPES[item.MimeType];
};

class CourseContentViewerRendererCalendarEvent extends React.Component {
	static propTypes = {
		location: PropTypes.shape({
			item: PropTypes.object,
		}),
		course: PropTypes.object.isRequired,
	};

	render() {
		const { course, location } = this.props;
		const { item: { CalendarEvent: event } = {} } = location || {};

		if (!event) {
			return null;
		}

		return (
			<div>
				<Layouts.Aside component={Sidebar} course={course} />
				<View event={event} dialog={false} controls={false} />
			</div>
		);
	}
}

export default decorate(CourseContentViewerRendererCalendarEvent, [
	TypeRegistry.register(handles),
]);
