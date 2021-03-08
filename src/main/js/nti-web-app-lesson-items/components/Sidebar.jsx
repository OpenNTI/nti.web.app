import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { FillToBottom } from '@nti/web-commons';

import Styles from './Sidebar.css';

const cx = classnames.bind(Styles);

export default class NTIWebAppLessonItemsSidebar extends React.PureComponent {
	static propTypes = {
		className: PropTypes.string,
	};

	render() {
		const { className, ...otherProps } = this.props;

		return (
			<FillToBottom
				{...otherProps}
				className={cx('sidebar-container', className)}
				limit
			/>
		);
	}
}
