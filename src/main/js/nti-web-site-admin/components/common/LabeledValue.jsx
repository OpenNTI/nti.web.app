import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import Card from './Card';

SiteAdminLabeledValue.propTypes = {
	className: PropTypes.string,
	label: PropTypes.node,
	children: PropTypes.node
};
export default function SiteAdminLabeledValue ({className, label, children, ...otherProps}) {
	return (
		<Card className={cx('site-admin-labeled-value', className)} {...otherProps}>
			<div className="label">
				{label}
			</div>
			<div className="value">
				{children}
			</div>
		</Card>
	);
}
