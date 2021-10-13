import React from 'react';

import { Input } from '@nti/web-commons';

import { SegmentStore } from '../Store';

const Container = styled.div`
	padding: 20px 30px 10px;
`;

const Title = styled(Input.Text)`
	&:global(.nti-text-input) {
		display: block;
		height: auto;
		padding: 0 0.625rem;
		border: none;
		font-size: 2rem;
		box-shadow: 0 1px 0 0 var(--border-grey-light);
	}
`;

export function Header() {
	const { title, setTitle } = SegmentStore.useProperties();

	return (
		<Container>
			<Title value={title} onChange={setTitle} />
		</Container>
	);
}
