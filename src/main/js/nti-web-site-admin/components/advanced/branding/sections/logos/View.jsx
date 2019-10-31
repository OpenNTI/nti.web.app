import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';

import Section from '../Section';

import AssetItem from './AssetItem';

const t = scoped('nti-web-app.admin.branding.Logo', {
	title: 'Logo Assets',
});

const types = ['square', 'wide', 'email', 'favicon', 'login'];

export default function Logo ({onChange}) {
	const changeHandler = type => v => console.log(type, v);

	return (
		<Section text={t}>
			{
				types.map(type => (
					<AssetItem key={type} name={type} onChange={changeHandler(type)} />
				))
			}
			<div>logo</div>
		</Section>
	);
}
