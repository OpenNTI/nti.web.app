import { LinkTo } from '@nti/web-routing';
import { User, EmptyState, List } from '@nti/web-commons';
import { scoped } from '@nti/lib-locale';

import styles from './ActiveUsers.css';

const t = scoped('NTIWebAppLessonItems.overrides.topic.ActiveUsers', {
	heading: 'Active People',
	empty: 'There are no active people.',
});

export default function ActiveUsers({ activeUsers }) {
	const empty = activeUsers?.length === 0;

	return !activeUsers ? null : (
		<div className={styles.container}>
			{empty ? (
				<EmptyState subHeader={t('empty')} />
			) : (
				<>
					<div className={styles.heading}>{t('heading')}</div>
					<List.Unadorned className={styles.list}>
						{activeUsers.map((user, index) => (
							<li key={index}>
								<LinkTo.Object
									className={styles.item}
									object={user}
								>
									<User.Avatar
										className={styles.avatar}
										user={user}
									/>
									<User.DisplayName
										className={styles.name}
										user={user}
									/>
								</LinkTo.Object>
							</li>
						))}
					</List.Unadorned>
				</>
			)}
		</div>
	);
}
