import React, { useCallback } from 'react';

import { scoped } from '@nti/lib-locale';
import { Typography, Button } from '@nti/web-core';
import { Router } from '@nti/web-routing';

import SearchInfo from '../../../common/SearchInfo';

import { UserSegmentsStore } from './Store';

const t = scoped('nti-web-site-admin.components.users.list.segments', {
	header: 'Segments',
	createSegment: 'Create Segment',
});

const Header = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 20px 30px 10px;
	gap: 0.5rem;

	& > * {
		white-space: nowrap;
	}
`;

export const UserSegmentHeaderPlaceholder = () => (
	<Header>
		<Typography type="header-one-alt">{t('header')}</Typography>
	</Header>
);

export const UserSegmentsHeader = () => {
	const router = Router.useRouter();

	const { createSegment, canCreateSegment, searchParam } =
		UserSegmentsStore.useProperties();

	const doCreate = useCallback(async () => {
		const newSegment = await createSegment();

		router.routeTo.object(newSegment);
	}, [createSegment]);

	return (
		<>
			<Header>
				<Typography type="header-one-alt">{t('header')}</Typography>
				<Button
					rounded
					disabled={!canCreateSegment}
					busy={createSegment.running}
					onClick={doCreate}
				>
					{t('createSegment')}
				</Button>
			</Header>
			<SearchInfo searchTerm={searchParam} />
		</>
	);
};