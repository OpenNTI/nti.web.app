
import { DiscretePages } from '@nti/web-core';

import { CourseAdminsStore } from './Store';

export function CourseAdminsFooter() {
	const {
		totalPages,
		currentPage,
		loadPage,
	} = CourseAdminsStore.useProperties();

	return (
		<DiscretePages
			mt="xl"
			total={totalPages}
			selected={currentPage}
			load={loadPage}
		/>
	);
}
