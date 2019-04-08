import React from 'react';
import PropTypes from 'prop-types';
import {Calendar, Layouts} from '@nti/web-commons';
import classnames from 'classnames/bind';

import TypeRegistry from '../Registry';

import Sidebar from './Sidebar';
import styles from './View.css';

const cx = classnames.bind(styles);

const {Aside} = Layouts;
const MIME_TYPES = {
	'application/vnd.nextthought.webinarasset': true
};

const handles = (obj) => {
	const {location} = obj || {};
	const {item} = location || {};

	return item && MIME_TYPES[item.MimeType];
};

export default
@TypeRegistry.register(handles)
class NTIWebLessonItemsWebinar extends React.Component {
	static propTypes = {
		location: PropTypes.shape({
			item: PropTypes.object
		}),
		course: PropTypes.object.isRequired
	}

	render () {
		const {course, location} = this.props;
		const {item, item: {webinar}} = location || {};
		const nearestSession = webinar.getNearestSession();
		const startTime = nearestSession.getStartTime();

		return (
			<div>
				<Aside component={Sidebar} course={course} />
				<section className={cx('webinar-container')}>
					<header className={cx('header')}>
						<Calendar.DateIcon minimal date={startTime} className={cx('start-date')}/>
						<h1 className={cx('title')}>{item.title}</h1>
					</header>
				</section>
			</div>
		);
	}
}
