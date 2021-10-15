import { Suspense } from 'react';

import { LinkTo } from '@nti/web-routing';
import { useObject, useLink } from '@nti/web-core';

import { Labeled } from '../parts/Labeled';
import { ErrorBoundary } from '../ErrorBoundary';

import { DeliveryAttemptListItem } from './DeliveryAttemptListItem';

export function DeliveryAttemptDetail({ id }) {
	const attempt = useObject(id);

	return (
		<div>
			<LinkTo.Path to="./">
				<Labeled label="Delivery Attempt">
					<DeliveryAttemptListItem item={attempt} />
				</Labeled>
			</LinkTo.Path>
			<Data item={attempt} link="delivery_request" title="Request" />
			<Data item={attempt} link="delivery_response" title="Response" />
			<Data item={attempt} link="test_no_link_in_alpha" title="Ignore" />
		</div>
	);
}

const Pre = styled('pre')`
	overflow: auto;
	padding: var(--padding-lg, 1em);
	background: var(--panel-background-alt);
	font-size: 0.875rem;
`;

function Data(props) {
	return (
		<ErrorBoundary fallback={<Oops />}>
			<Suspense fallback={<div />}>
				<Load {...props} />
			</Suspense>
		</ErrorBoundary>
	);
}

function Load({ item, link, title }) {
	const d = useLink(item, link);
	return (
		<Labeled label={title}>
			<Pre>{JSON.stringify(d, null, 2)}</Pre>
		</Labeled>
	);
}

function Oops({ error }) {
	return !error ? null : <div>{error.message}</div>;
}
