import path from 'path';

import { useCallback } from 'react';

import { useHistory, useLocation } from '@nti/web-routing';
export function useHistoryPush() {
	const { pathname } = useLocation();
	const { push } = useHistory();
	return useCallback(relativePath => push(path.join(pathname, relativePath)));
}
