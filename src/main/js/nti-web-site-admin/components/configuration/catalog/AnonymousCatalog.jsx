import React from 'react';

import { Input, useService, Hooks } from '@nti/web-commons';

const useCourseCatalog = () => {
	const s = useService();
	const collection = s.getCollection('Courses', 'Catalog');
	return collection.CourseCatalog;
};

export function AnonymousCatalog({ label }) {
	const courseCatalog = useCourseCatalog();
	Hooks.useChanges(courseCatalog);

	const disabled = !courseCatalog?.canEdit?.();
	const { anonymouslyAccessible } = courseCatalog || {};
	const onChange = disabled
		? null
		: value => courseCatalog.setAnonymousAccess(value);

	return (
		<Input.Label label={label}>
			<Input.Toggle
				disabled={disabled}
				value={anonymouslyAccessible}
				onChange={onChange}
			/>
		</Input.Label>
	);
}
