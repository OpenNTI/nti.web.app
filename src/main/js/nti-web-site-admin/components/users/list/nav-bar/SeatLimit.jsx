import './SeatLimit.scss';

import { scoped } from '@nti/lib-locale';
import { Loading } from '@nti/web-commons';

import Store from '../SharedStore';

const t = scoped('nti-site-admin.users.list.navbar.SeatLimit', {
	used: {
		one: '%(count)s Active User',
		other: '%(count)s Active Users',
	},
	max: {
		one: 'Limited to %(count)s user',
		other: 'Limited to %(count)s users',
	},
});

export default function SiteSeatLimit() {
	const { SeatLimits } = Store.useValue();

	const loading = SeatLimits === null;
	const hide = !loading && !SeatLimits;
	const { maxSeats, usedSeats } = SeatLimits || {};

	if (hide) {
		return null;
	}

	return (
		<div className="site-seat-limit">
			{loading ? (
				<Loading.Spinner />
			) : (
				<div className="seats">
					{usedSeats != null && (
						<div className="active">
							{t('used', { count: usedSeats })}
						</div>
					)}
					{maxSeats != null && (
						<div className="limit">
							{t('max', { count: maxSeats })}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
