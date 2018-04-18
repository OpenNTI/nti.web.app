import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {DateTime, Loading} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';

import LabeledValue from './LabeledValue';

const DEFAULT_STRINGS = {
	'noDate': 'Never'
};

const t = scoped('nti-web-site-admin.components.common.datevalue', DEFAULT_STRINGS);

SiteAdminDateValue.propTypes = {
	className: PropTypes.string,
	date: PropTypes.any,
	format: PropTypes.string,
	loading: PropTypes.bool
};
export default function SiteAdminDateValue ({className, date, format, loading, ...otherProps}) {
	return (
		<LabeledValue className={cx('site-admin-date-value', className)} {...otherProps}>
			{
				loading ? (<Loading.Mask/>)
					: date ?
						(<DateTime className="date" date={date} format={format} />) :
						(<div className="no-date">{t('noDate')}</div>)
			}
		</LabeledValue>
	);
}
