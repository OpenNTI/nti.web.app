import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';

import Section from '../Section';

const t = scoped('nti-web-app.admin.branding.Logo', {
	title: 'Logo Assets',
});

export default function Logo (props) {
	return (
		<Section text={t}>
			<div>logo</div>
		</Section>
	);
}
