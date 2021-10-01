import React from 'react';

import { LinkTo } from '@nti/web-routing';
import { useObject, useLink } from '@nti/web-core';


import {DeliveryAttemptListItem} from './DeliveryAttemptListItem';
import {Labeled} from './Labeled';

const useDeliveryAttemptDetail = id => {
	const attempt = useObject(id);
	const request = useLink(attempt, 'delivery_request');
	const response = useLink(attempt, 'delivery_response');
	return { attempt, request, response };
}

const Pre = styled('pre')`
	overflow: auto;
	padding: var(--padding-lg, 1em);
	background: var(--panel-background-alt);
	font-size: 0.875rem;
`

export function DeliveryAttemptDetail ({id}) {
	const { attempt, request, response } = useDeliveryAttemptDetail(id);

	return (
		<div>
			<LinkTo.Path to="./">
				<Labeled label="Delivery Attempt">
					<DeliveryAttemptListItem item={attempt} />
				</Labeled>
			</LinkTo.Path>
			<Jsonified title="Request" object={request} />
			<Jsonified title="Response" object={response} />
		</div>
	);
}

const Jsonified = ({object, title}) => !object ? null : (
	<Labeled label={title}>
		<Pre>{JSON.stringify(object, null, 2)}</Pre>
	</Labeled>
);
