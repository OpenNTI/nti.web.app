import { scoped } from '@nti/lib-locale';

import { FilterSetRule, FilterSetRegistry } from './common';

const t = scoped(
	'nti-web-site-admin.components.users.segment.editor.filters.types.ProfileProperty',
	{
		role: 'Role',
		location: 'Location',
	}
);

const Type = 'filterset.profile_property';

export class ProfilePropertyFilterSet extends FilterSetRule {
	static Rules = {
		role: {
			input: 'string',
			getValue: filter => filter.getComparison(),
			setValue: (filter, value) => filter.setComparison(value),

			label: t('role'),
			FilterSet: ProfilePropertyFilterSet,
		},
		location: {
			input: 'string',
			getValue: filter => filter.getComparison(),
			setValue: (filter, value) => filter.setComparison(value),

			label: t('location'),
			FilterSet: ProfilePropertyFilterSet,
		},
	};

	type = Type;

	getComparison() {
		return {
			comparator: this.data.comparator,
			value: this.data.value,
		};
	}

	setComparison(comparison) {
		this.setData(comparison);
	}

	getActiveRule() {
		return this.data.property;
	}

	setActiveRule(rule) {
		const property = Object.entries(ProfilePropertyFilterSet.Rules).find(
			([key, value]) => value === rule
		)[0];

		this.setData({
			property,
			comparator: this.comparator ?? 'equal',
		});
	}
}

FilterSetRegistry.register(Type, ProfilePropertyFilterSet);
