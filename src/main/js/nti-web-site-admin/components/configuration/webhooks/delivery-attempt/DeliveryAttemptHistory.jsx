import { Suspense, useState } from 'react';

import {
	useLink,
	Table,
	TablePlaceholder,
	Text,
	DiscretePages,
} from '@nti/web-core';
import { EmptyState } from '@nti/web-commons';
import { encodeForURI } from '@nti/lib-ntiids';

import { HISTORY_COLUMNS } from '../parts/columns';
import { useHistoryPush } from '../hooks';
import t from '../strings';

/** @typedef {import('@nti/lib-interfaces').Batch} Batch */

export function DeliveryAttemptHistory({ item }) {
	return (
		<>
			<Text as="h3">{t('history')}</Text>
			<Suspense
				fallback={
					<TablePlaceholder rows={3} columns={HISTORY_COLUMNS} />
				}
			>
				<Activity item={item} />
			</Suspense>
		</>
	);
}

function Activity({ item }) {
	const [page, setPage] = useState({});
	/** @type {Batch} */
	const batch = useLink(item, 'delivery_history', {
		mode: 'batch',
		...page,
	});

	const empty = !batch?.count;
	const push = useHistoryPush();

	return empty ? (
		<EmptyState header="No Activity Yet." />
	) : (
		<>
			<Table
				ruled
				items={batch}
				columns={HISTORY_COLUMNS}
				onRowClick={item => push(encodeForURI(item.getID()))}
			/>
			{batch.pageCount > 1 && (
				<DiscretePages
					mt="xl"
					total={batch.pageCount}
					selected={batch.currentPage}
					load={x => setPage(batch.getParamsForPage(x))}
				/>
			)}
		</>
	);
}
