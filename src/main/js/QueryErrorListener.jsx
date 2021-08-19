import { useEffect, useState } from 'react';

import { Router, useLocation } from '@nti/web-routing';
import { Toast } from '@nti/web-commons';

const getError = location => {
	return !location?.search
		? null
		: new URLSearchParams(location.search).get('error');
};

const useQueryErrorListener = handler => {
	const location = useLocation();
	useEffect(() => {
		const e = getError(location);
		if (e) {
			handler?.(e);
		}
	}, [location.search]);
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
		<Router>
			<Listen />
		</Router>
	);
}
