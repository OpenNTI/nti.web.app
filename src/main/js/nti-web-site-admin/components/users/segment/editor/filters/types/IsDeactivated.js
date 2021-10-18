import { scoped } from '@nti/lib-locale';

import { FilterSetRule, FilterSetRegistry } from './common';

const t = scoped(
	'nti-web-site-admin.components.users.segment.editor.filters.types.IsDeactivated',
	{
		isDeactivated: 'Is Deactivated',
		isActive: 'Is Active',
	}
);

const Type = 'application/vnd.nextthought.segments.isdeactivatedfilterset';

export class IsDeactivatedFilterSet extends FilterSetRule {
	static Rules = {
		isdeactivated: {
			input: null,
			label: t('isDeactivated'),
			FilterSet: IsDeactivatedFilterSet,
		},
		isactive: {
			input: null,
			label: t('isActive'),
			FilterSet: IsDeactivatedFilterSet,
		},
	};

	type = Type;

	getActiveRule() {
		const { Deactivated } = this.data;

		return Deactivated ? 'isdeactivated' : 'isactive';
	}

	setActiveRule(rule) {
		this.setData({
			Deactivated: rule !== IsDeactivatedFilterSet.Rules.isactive,
		});
	}
}

FilterSetRegistry.register(Type, IsDeactivatedFilterSet);
