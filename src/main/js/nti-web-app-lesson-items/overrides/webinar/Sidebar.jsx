import React from 'react';
// import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import styles from './Sidebar.css';

const cx = classnames.bind(styles);

export default class WebinarSidebar extends React.Component {
	render () {
		return (
			<div className={cx('webinar-sidebar')}>(webinar sidebar)</div>
		);
	}
}
