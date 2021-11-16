import { scoped } from '@nti/lib-locale';

import { FilterSetRule, FilterSetRegistry } from './common';

const t = scoped(
	'nti-web-site-admin.components.users.segment.editor.filters.type.LastActive',
	{
		active: 'Active',
		notActive: 'Not Active',
	}
);

const Type = 'application/vnd.nextthought.segments.lastactivefilterset';

export class LastActiveFilterSet extends FilterSetRule {
	static Rules = {
		active: {
			input: 'date',
			getValue: () => null,
			setValue: () => null,

			label: t('active'),
			FilterSet: LastActiveFilterSet,
		},
		notActive: {
			input: 'date',
			getValue: () => null,
			setValue: () => null,

			label: t('notActive'),
			FilterSet: LastActiveFilterSet,
		},
	};

	type = Type;
}

FilterSetRegistry.register(Type, LastActiveFilterSet);
