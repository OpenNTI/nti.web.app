import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';

import Section from '../Section';

const t = scoped('nti-web-app.admin.branding.Site', {
	title: 'Site Details',
});

export default function Site (props) {
	return (
		<Section text={x => t(x, {fallback: ''})}>
			<div>site</div>
		</Section>
	);
}
