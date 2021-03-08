import React from 'react';

import { Theme } from '@nti/web-commons';

import Library from '../../sections/library/preview/Header';

export default function FullLogo(props) {
	return (
		<Theme.Scope scope="library">
			<Library />
		</Theme.Scope>
	);
}
