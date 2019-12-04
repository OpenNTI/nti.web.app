import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {Input, List, Theme} from '@nti/web-commons';
import classnames from 'classnames/bind';

import {BRAND_NAME} from '../../constants';
import {Title, Description} from '../../ParameterText';
import Section from '../Section';

import styles from './View.css';

const cx = classnames.bind(styles);

const t = scoped('nti-web-app.admin.branding.Site', {
	title: 'Site Details',
	siteName: {
		title: 'Site Name',
		description: 'This will impact automated emails, messaging, and tab name.',
	}
});

export default function Site ({onChange}) {
	const brandName = Theme.useThemeProperty('brandName'); // 'brandName' in theme, 'brand_name' in SiteBrand
	const changeHandler = fieldName => v => onChange(fieldName, v);
	return (
		<Section className={cx('site-params')} title={t('title')}>
			<List.Unadorned>
				<li>
					<div>
						<Title>{t(['siteName', 'title'])}</Title>
						<Description>{t(['siteName', 'description'])}</Description>
					</div>
					<Input.Text value={brandName} onChange={changeHandler(BRAND_NAME)} />
				</li>
			</List.Unadorned>
		</Section>
	);
}

Site.propTypes = {
	onChange: PropTypes.func.isRequired,
};
