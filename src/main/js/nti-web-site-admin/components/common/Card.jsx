import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

SiteAdminCard.propTypes = {
	className: PropTypes.string
};
export default function SiteAdminCard ({className, ...otherProps}) {
	return (
		<div className={cx('site-admin-card', className)} {...otherProps} />
	);
}
