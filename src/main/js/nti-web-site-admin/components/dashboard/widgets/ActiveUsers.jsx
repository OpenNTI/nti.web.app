import { NumericValue } from '@nti/web-charts';
import { getService } from '@nti/web-client';
import { getLink } from '@nti/lib-interfaces';
import { scoped } from '@nti/lib-locale';
import { useResolver } from '@nti/web-commons';

const SESSIONS = 'Sessions';
const ANALYTICS = 'Analytics';
const ACTIVE_SESSION_COUNT = 'active_session_count';

const t = scoped(
	'nti-web-site-admin.components.dashboard.widgets.ActiveSessions',
	{
		sessionsUnavailable: 'Unable to get active session data',
		activeSessionsLabel: 'Users Online Now',
	}
);

const { isResolved } = useResolver;

export function ActiveUsers() {
	const resolver = useResolver(async () => {
		const service = await getService();

		try {
			const sessionsCollection = service.getCollection(
				SESSIONS,
				ANALYTICS
			);
			const link = getLink(sessionsCollection, ACTIVE_SESSION_COUNT);
			const stats = await service.get(link);

			return { value: stats.Count };
		} catch (e) {
			return {
				value: 0,
				error: <div className="not-available">{t('notAvailable')}</div>,
			};
		}
	});

	return isResolved(resolver) ? (
		<NumericValue label={t('activeSessionsLabel')} value={resolver.value} />
	) : (
		<div />
	);
}
