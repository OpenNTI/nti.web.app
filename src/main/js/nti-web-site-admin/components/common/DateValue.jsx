import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {DateTime} from 'nti-web-commons';

import Card from './Card';

SiteAdminDateValue.propTypes = {
	className: PropTypes.string,
	label: PropTypes.string,
	date: PropTypes.any,
	format: PropTypes.string
};
export default function SiteAdminDateValue ({className, label, date, format}) {
	return (
		<Card className={cx('site-admin-date-value', className)}>
			<div className="label">
				{label}
			</div>
			<DateTime className="date" date={date} format={format} />
		</Card>
	);
}
