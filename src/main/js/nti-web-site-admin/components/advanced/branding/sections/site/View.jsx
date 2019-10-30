import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';

import Section from '../Section';

const t = scoped('nti-web-app.admin.branding.Site', {
	title: 'Site Assets',
});

export default function Site (props) {
	return (
		<Section text={t}>
			<div>site</div>
		</Section>
	);
}
