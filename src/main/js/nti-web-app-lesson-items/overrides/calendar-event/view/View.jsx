import React from 'react';
import PropTypes from 'prop-types';
import {Event} from '@nti/web-calendar';
import {Layouts} from '@nti/web-commons';
import classnames from 'classnames/bind';

import Sidebar from './Sidebar';
import styles from './View.css';

const cx = classnames.bind(styles);

const {Aside} = Layouts;

export default
class CourseContentViewerRendererCalendarEventView extends React.Component {
	static propTypes = {
		location: PropTypes.shape({
			item: PropTypes.object
		}),
		course: PropTypes.object.isRequired
	}

	render () {
		const {course, location} = this.props;
		const {item: {CalendarEvent: event} = {}} = location || {};

		if (!event) { return null; }

		return (
			<div>
				<Aside component={Sidebar} course={course} />
				<Event.View event={event} className={cx('lesson-event-view')} nonDialog noControls />
			</div>
		);
	}
}
