import { scoped } from '@nti/lib-locale';

import { FilterSet, FilterSetRegistry } from './common';

const t = scoped(
	'nti-web-site-admin.components.users.segment.editor.filters.types.IsDeactivated',
	{
		isDeactivated: 'Is Deactivated',
		isActive: 'Is Active',
	}
);

const Type = 'application/vnd.nextthought.segments.isdeactivatedfilterset';

export class IsDeactivatedFilterSet extends FilterSet {
	type = Type;

	getTypes() {
		return [
			{
				input: null,
				label: t('isDeactivated'),
				payload: () => {},
			},
			{
				input: null,
				label: t('isActive'),
				payload: () => {},
			},
		];
	}
}

FilterSetRegistry.register(Type, IsDeactivatedFilterSet);
