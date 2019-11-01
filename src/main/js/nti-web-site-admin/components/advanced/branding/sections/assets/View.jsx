import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';

import Section from '../Section';

import AssetItem from './AssetItem';

const t = scoped('nti-web-app.admin.branding.logo', {
	title: 'Logo Assets',
	types: {
		square: {
			title: 'Square Format',
			description: 'We recommend this asset be close to a square in proportion.'
		},
		wide: {
			title: 'Wide Format',
			description: 'The wider orientation has space for your icon and company name.'
		},
		email: {
			title: 'Email Header',
			description: 'The email template is flexibile enough to accomodate various lockups.'
		},
		favicon: {
			title: 'Favicon',
			description: 'This square asset helps users identify your site among their open browser tabs.'
		},
		login: {
			title: 'Login Image',
			description: 'Welcome people back with an image that speaks to your brand.'
		},
	}
});

const types = ['square', 'wide', 'email', 'favicon', 'login'];

export default function Logo ({assets = {}, onChange}) {

	const changeHandler = type => item => onChange(item);
	const getSrc = type => (assets[type] || {}).source;

	return (
		<Section text={t}>
			{
				types.map(type => (
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
