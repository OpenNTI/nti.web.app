import React from 'react';

import InvalidRows from './InvalidRows';
import Unknown from './Unknown';

const TYPES = [
	InvalidRows,
	Unknown
];

export default function getError (error) {
	if (!error || typeof error === 'string') {
		return error;
	}

	const Cmp = TYPES.find(t => t.handles(error));

	return !Cmp ? null : <Cmp error={error} />;
}
