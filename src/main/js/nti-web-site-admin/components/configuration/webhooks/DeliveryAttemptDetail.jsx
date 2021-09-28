import React from 'react';

import { useObject, useLink, Typography } from '@nti/web-core';

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
	const { request, response } = useDeliveryAttemptDetail(id);

	return (
		<div>
			<div>AttemptDetail {id}</div>
			<Jsonified title="Request" object={request} />
			<Jsonified title="Response" object={response} />
		</div>
	);
}

const Jsonified = ({object, title}) => !object ? null : (
	<article>
		{title && <Typography type="header-one-alt">{title}</Typography>}
		<Pre>{JSON.stringify(object, null, 2)}</Pre>
	</article>
);
