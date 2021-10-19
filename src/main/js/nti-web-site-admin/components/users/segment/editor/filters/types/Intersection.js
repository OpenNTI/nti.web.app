import { scoped } from '@nti/lib-locale';

import { FilterSetGroup, FilterSetRegistry } from './common';
import { UnionFilterSet } from './Union';

const t = scoped(
	'nti-web-site-admin.components.users.segment.editor.filters.types.Instersection',
	{
		and: 'AND',
	}
);

export const IntersectionType =
	'application/vnd.nextthought.segments.IntersectionUserFilterSet';

export class IntersectionFilterSet extends FilterSetGroup {
	type = IntersectionType;

	allowedSubFilterSets = [UnionFilterSet];
	joinLabel = t('and');

	getDefaultSubFilterSet() {
		return new UnionFilterSet(this);
	}

	canRemove = true;
	canDuplicate = true;
	canReorder = true;
}

FilterSetRegistry.register(IntersectionType, IntersectionFilterSet);
