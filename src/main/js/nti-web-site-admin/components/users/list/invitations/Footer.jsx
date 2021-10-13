
import { DiscretePages } from '@nti/web-core';

import { InvitationsStore } from './Store';

export function InvitationsFooter() {
	const { totalPages, currentPage, loadPage } =
		InvitationsStore.useProperties();

	return (
		<DiscretePages
			mt="xl"
			total={totalPages}
			selected={currentPage}
			load={loadPage}
		/>
	);
}
