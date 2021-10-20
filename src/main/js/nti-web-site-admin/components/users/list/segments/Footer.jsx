import { DiscretePages } from '@nti/web-core';

import { UserSegmentsStore } from './Store';

export function UserSegmentsFooter() {
	const { totalPages, currentPage, loadPage } =
		UserSegmentsStore.useProperties();

	return (
		<DiscretePages
			mt="xl"
			total={totalPages}
			selected={currentPage}
			load={loadPage}
		/>
	);
}
