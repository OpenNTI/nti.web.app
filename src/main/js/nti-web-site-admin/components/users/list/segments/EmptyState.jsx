import { EmptyState as Empty, Text } from '@nti/web-core';
import { scoped } from '@nti/lib-locale';

import { CreateSegmentButton } from './CreateButton';

const T = Text.Translator(
	scoped('nti-site-admin.users.list.segments.EmptyState', {
		message: 'There are no segments yet',
		callToAction: 'Go %(create)s some...',
	})
);

export function EmptyState() {
	return (
		<Empty
			header={<T localeKey="message" />}
			subHeader={
				<T
					localeKey="callToAction"
					with={{
						create: <CreateSegmentButton variant="link" />,
					}}
				/>
			}
		/>
	);
}
