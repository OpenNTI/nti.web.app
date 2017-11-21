import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {DateTime} from 'nti-web-commons';
import {scoped} from 'nti-lib-locale';

import Card from './Card';

const DEFAULT_STRINGS = {
	'noDate': 'Never'
};

const t = scoped('nti-web-site-admin.components.common.datevalue', DEFAULT_STRINGS);

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
			{
				date
					? (<DateTime className="date" date={date} format={format} />)
					: (<div className="no-date">{t('noDate')}</div>)
			}
		</Card>
	);
}
