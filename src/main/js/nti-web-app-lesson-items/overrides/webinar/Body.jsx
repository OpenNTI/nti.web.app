import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import styles from './Body.css';

const cx = classnames.bind(styles);

export default class WebinarBody extends React.Component {
	static propTypes = {
		item: PropTypes.shape({
			description: PropTypes.any,
			icon: PropTypes.string,
		}).isRequired
	}

	render () {
		const {
			item: {
				description,
				icon,
			}
		} = this.props;

		const hasIcon = icon && icon !== 'null'; // NTI-7752

		return (
			<div className={cx('webinar-body')}>
				{hasIcon && <div className={cx('image')}><img src={icon} /></div>}
				{description && <div className={cx('description')}>{description}</div>}
			</div>
		);
	}
}
