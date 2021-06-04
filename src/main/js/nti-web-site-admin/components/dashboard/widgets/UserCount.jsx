import { useEffect, useReducer } from 'react';

import { NumericValue } from '@nti/web-charts';
import { scoped } from '@nti/lib-locale';
import { useService } from '@nti/web-commons';

const t = scoped('nti-web-site-admin.components.dashboard.widgets.UserCount', {
	label: 'Total Users',
});

const useWorkspaceLinkValue = (rel, params) => {
	const [state, dispatch] = useReducer(
		(previousState, action) => ({ ...previousState, ...action }),
		{}
	);
	const service = useService();
	let abort = false;

	useEffect(() => {
		const fetchValue = async () => {
			dispatch({ loading: true, value: undefined });
			try {
				const workspace = service.Items.find(w => w.hasLink(rel));
				if (workspace) {
					const value = await workspace.fetchLink(rel, params);
					if (!abort) {
						dispatch({ value, loading: false, error: undefined });
					}
				}
			} catch (error) {
				dispatch({ error, loading: false, value: undefined });
			}
		};
		fetchValue();
		return () => void (abort = true);
	}, [rel, service]);

	return state;
};

export function UserCount(props) {
	const { value } = useWorkspaceLinkValue('SiteUsers', { batchSize: 1 });
	return value ? (
		<NumericValue label={t('label')} value={value.TotalItemCount} />
	) : null;
}
