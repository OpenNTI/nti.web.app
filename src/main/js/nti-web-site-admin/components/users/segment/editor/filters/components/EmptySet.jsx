import React, { useCallback } from 'react';

import { scoped } from '@nti/lib-locale';
import { Button } from '@nti/web-core';

import { EmptyFilterSet } from '../types/Empty';

import { ComponentRegistry } from './Registry';

const t = scoped(
	'nti-web-site-admin.components.users.segment.editor.filters.components.EmptySet',
	{
		addFirstRule: 'Add a Rule to get Started',
	}
);

const Container = styled.div`
	min-height: 200px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

export function EmptyFilter({ filter }) {
	const onClick = useCallback(() => filter.addDefault(), [filter]);

	return (
		<Container>
			<Button onClick={onClick} transparent xlarge rounded>
				{t('addFirstRule')}
			</Button>
		</Container>
	);
}

ComponentRegistry.register(t => t instanceof EmptyFilterSet, EmptyFilter);
