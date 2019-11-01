import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';

import Section from '../Section';

import {libraryTheme} from './prop-types';
import Editor from './Editor';
import Preview from './preview';

const t = scoped('nti-web-app.admin.branding.Library', {
	title: 'Library Styling',
	description: 'Branding can make your site more custom and familiar to your audience.'
});

export default function Library ({theme, onChange}) {
	return (
		<Section text={t}>
			<Preview theme={theme} />
			<Editor theme={theme} onChange={onChange} />
		</Section>
	);
}

Library.propTypes = {
	...libraryTheme,
	onChange: PropTypes.func
};
