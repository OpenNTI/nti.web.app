import { scoped } from '@nti/lib-locale';

import { FilterSetGroup, FilterSetRegistry } from './common';
import { UnionFilterSet } from './Union';

const t = scoped(
	'nti-web-site-admin.components.users.segment.editor.filters.types.Instersection',
	{
		and: 'And',
	}
);

export const IntersectionType = 'filterset.intersection';

export class IntersectionFilterSet extends FilterSetGroup {
	type = IntersectionType;

	allowedSubSets = [UnionFilterSet];
	joinLabel = t('and');

	canRemove = true;
}

FilterSetRegistry.register(IntersectionType, IntersectionFilterSet);
