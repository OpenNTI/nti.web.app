import { useLink, Table, Text } from '@nti/web-core';
import { EmptyState } from '@nti/web-commons';
import { encodeForURI } from '@nti/lib-ntiids';

import { HISTORY_COLUMNS } from '../parts/columns';
import { useHistoryPush } from '../hooks';
import t from '../strings';

export function DeliveryAttemptHistory({ item }) {
	const { Items: attempts } = useLink(item, 'delivery_history');
	const empty = !attempts?.length;
	const push = useHistoryPush();

	return (
		<>
			<Text as="h3">{t('history')}</Text>

			{empty ? (
				<EmptyState header="No Activity Yet." />
			) : (
				<Table
					ruled
					items={attempts}
					columns={HISTORY_COLUMNS}
					onRowClick={item => push(encodeForURI(item.getID()))}
				/>
			)}
		</>
	);
}
