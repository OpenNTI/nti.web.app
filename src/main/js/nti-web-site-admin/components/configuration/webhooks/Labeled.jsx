import React from 'react';

import {LabeledValue} from '@nti/web-commons';

const Container = styled.div`
	padding: var(--padding-md, 0.5em) 0;
	margin-bottom: var(--padding-md, 0.5em);

	&:not(:last-child) {
		border-bottom: 1px solid var(--color-outline-light);
	}
`

export function Labeled (props) {
	return (
		<Container>
			<LabeledValue {...props} />
		</Container>
	);
}
