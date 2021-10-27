import { useCallback } from 'react';

import { Button } from '@nti/web-core';
import { Router } from '@nti/web-routing';

import { UserSegmentsStore } from './Store';
import t from './strings';

export function CreateSegmentButton({ text, ...props }) {
	const router = Router.useRouter();

	const { createSegment, canCreateSegment } =
		UserSegmentsStore.useProperties();

	const doCreate = useCallback(async () => {
		const newSegment = await createSegment();

		router.routeTo.object(newSegment);
	}, [createSegment]);

	return (
		<Button
			rounded
			{...props}
			disabled={!canCreateSegment}
			busy={createSegment.running}
			onClick={doCreate}
		>
			{text ?? t('createSegment')}
		</Button>
	);
}
