import React from 'react';
import PropTypes from 'prop-types';
import {Layouts} from '@nti/web-commons';
import classnames from 'classnames/bind';

import Body from './Body';
import Header from './Header';
import Sidebar from './Sidebar';
import styles from './View.css';

const cx = classnames.bind(styles);

const {Aside} = Layouts;

export default
class NTIWebLessonItemsWebinarView extends React.Component {
	static propTypes = {
		location: PropTypes.shape({
			item: PropTypes.object
		}),
		course: PropTypes.object.isRequired
	}

	render () {
		const {course, location} = this.props;
		const {item} = location || {};

		return (
			<div>
				<Aside component={Sidebar} course={course} item={item} />
				<section className={cx('webinar-container')}>
					<Header item={item} />
					<Body item={item} />
				</section>
			</div>
		);
	}
}
