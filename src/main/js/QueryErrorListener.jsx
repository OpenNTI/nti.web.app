import { useEffect, useState } from 'react';

import { Toast, Errors } from '@nti/web-commons';

const useQueryErrorListener = handler => {
	useEffect(() => {
		const e = Errors.getErrorFromLocation(global.location);
		if (e) {
			handler?.(e);
		}
	}, [global.location]);
};

const Listen = ({ handler }) => {
	const [error, setError] = useState();
	useQueryErrorListener(handler || setError);
	return error ? (
		<Toast.ErrorBar error={error} onDismiss={() => setError(null)} />
	) : null;
};

export function QueryErrorListener() {
	return (
		<Listen />
	);
}
