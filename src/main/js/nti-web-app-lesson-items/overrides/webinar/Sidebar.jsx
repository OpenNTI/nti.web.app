import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Overview} from '@nti/web-course';

const Button = Overview.Items.Webinar.RegistrationButton;

import styles from './Sidebar.css';

const cx = classnames.bind(styles);

export default class WebinarSidebar extends React.Component {

	static propTypes = {
		item: PropTypes.object.isRequired
	}

	render () {
		const {item: {webinar}} = this.props;

		return (
			<div className={cx('webinar-sidebar')}>
				<Button webinar={webinar} />
			</div>
		);
	}
}
