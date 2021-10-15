import { scoped } from '@nti/lib-locale';

import { FilterSetGroup, FilterSetRegistry } from './common';
import { IsDeactivatedFilterSet } from './IsDeactivated';

const t = scoped(
	'nti-web-site-admin.components.users.segment.editor.filters.types.Union',
	{
		or: 'Or',
	}
);

export const UnionType = 'filterset.union';

export class UnionFilterSet extends FilterSetGroup {
	type = UnionType;

	allowedSubSets = [IsDeactivatedFilterSet];
	joinLabel = t('or');

	canRemove = true;
}

FilterSetRegistry.register(UnionType, UnionFilterSet);
