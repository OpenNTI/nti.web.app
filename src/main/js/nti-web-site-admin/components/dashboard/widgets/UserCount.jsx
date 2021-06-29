import { NumericValue } from '@nti/web-charts';
import { scoped } from '@nti/lib-locale';

import Store from '../../users/list/SharedStore';

const t = scoped('nti-web-site-admin.components.dashboard.widgets.UserCount', {
	label: 'Users Total',
});

function UserCountCmp({ getStyles }) {
	const { SeatLimits } = Store.useValue();
	const usedSeats = SeatLimits?.usedSeats;

	return usedSeats != null ? (
		<NumericValue
			label={t('label')}
			value={usedSeats}
			classes={getStyles?.(usedSeats)}
		/>
	) : null;
}

export const UserCount = Store.compose(UserCountCmp);
