import { DiscretePages } from '@nti/web-core';

import { Store } from './Store';

export function Pager() {
	const { totalPages, currentPage, loadPage } = Store.useProperties();

	return totalPages <= 1 ? null : (
		<DiscretePages
			mv="xl"
			total={totalPages}
			selected={currentPage}
			load={loadPage}
		/>
	);
}
