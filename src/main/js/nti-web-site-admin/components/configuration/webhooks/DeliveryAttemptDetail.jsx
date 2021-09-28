import React from 'react';

import { useObject, useLink } from '@nti/web-core';

const useDeliveryAttemptDetail = id => {
	const attempt = useObject(id);
	const request = useLink(attempt, 'delivery_request');
	const response = useLink(attempt, 'delivery_response');
	return { attempt, request, response };
}

export function DeliveryAttemptDetail ({id}) {
	const { attempt, request, response } = useDeliveryAttemptDetail(id);

	console.log(request, response, attempt);

	return (
		<div>
			<div>AttemptDetail {id}</div>
			<Request request={request} />
			<Response response={response} />
		</div>
	);
}

const Request = ({request}) => {
	if (!request) {
		return null;
	}

	// const {headers, body, href} = request;

	return (
		<pre>
			{JSON.stringify(request, null, 2)}
		</pre>
	);
}

const Response = ({response}) => {
	if (!response) {
		return null;
	}
	// const { headers } = response;

	return (
	<pre>
		{JSON.stringify(response, null, 2)}
	</pre>
);}
