import PropTypes from 'prop-types';

import { scoped } from '@nti/lib-locale';

import Section from '../Section';

import Editor from './Editor';
import Preview from './preview';

const t = scoped('nti-web-app.admin.branding.Library', {
	title: 'Library Styling',
	description:
		'Branding can make your site more custom and familiar to your audience.',
});

export default function Library({ onChange }) {
	return (
		<Section text={t}>
			<Preview />
			<Editor onChange={onChange} />
		</Section>
	);
}

Library.propTypes = {
	onChange: PropTypes.func,
	onColorChange: PropTypes.func,
};
