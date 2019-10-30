import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';

import Section from '../../Section';

const t = scoped('nti-web-app.admin.branding.Library', {
	title: 'Library Styling',
	description: 'Branding can make your site more custom and familiar to your audience.'
});

export default function Library (props) {
	return (
		<Section title={t('title')} description={t('description')}>

		</Section>
	);
}
