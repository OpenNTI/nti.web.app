import { Suspense } from 'react';

import { useObject, useLink, Text } from '@nti/web-core';
import { decodeFromURI } from '@nti/lib-ntiids';

import { Labeled } from '../parts/Labeled';
import { ErrorBoundary } from '../ErrorBoundary';
import t from '../strings';

import { DeliveryAttemptMeta } from './Meta';

export function DeliveryAttemptDetail({ id }) {
	const attempt = useObject(decodeFromURI(id));

	return (
		<>
			<Text as="h1">{t('attempt')}</Text>
			<DeliveryAttemptMeta item={attempt} />
			<Data item={attempt} link="delivery_request" title="Request" />
			<Data item={attempt} link="delivery_response" title="Response" />
		</>
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
			<Pre>{d && JSON.stringify(d, null, 2)}</Pre>
		</Labeled>
	);
}

function Oops({ error }) {
	return !error ? null : <div>{error.message}</div>;
}
