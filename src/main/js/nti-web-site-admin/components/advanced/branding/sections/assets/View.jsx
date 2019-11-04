import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';

import Section from '../Section';

import {types} from './constants';
import AssetItem from './AssetItem';

const t = scoped('nti-web-app.admin.branding.logo', {
	title: 'Logo Assets',
	types: {
		[types.icon]: {
			title: 'Square Format',
			description: 'We recommend this asset be close to a square in proportion.'
		},
		[types.logo]: {
			title: 'Logo',
			description: 'The wider orientation has space for your icon and company name.'
		},
		[types.fullLogo]: {
			title: 'Wide Format',
			description: 'The wider orientation has space for your icon and company name.'
		},
		[types.email]: {
			title: 'Email Header',
			description: 'The email template is flexibile enough to accomodate various lockups.'
		},
		[types.favicon]: {
			title: 'Favicon',
			description: 'This square asset helps users identify your site among their open browser tabs.'
		},
		// [types.login]: {
		// 	title: 'Login Image',
		// 	description: 'Welcome people back with an image that speaks to your brand.'
		// },
	}
});

export default function Assets ({assets = {}, onChange}) {

	const changeHandler = type => item => onChange(type, item);
	const getSrc = type => (assets[type] || {}).source;

	return (
		<Section text={t}>
			{
				Object.values(types).map(type => (
					<AssetItem
						key={type}
						name={type}
						src={getSrc(type)}
						onChange={changeHandler(type)}
						getText={k => t(['types', type, k])}
					/>
				))
			}
		</Section>
	);
}

Assets.propTypes = {
	assets: PropTypes.object,
	onChange: PropTypes.func.isRequired
};
