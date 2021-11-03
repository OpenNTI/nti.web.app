import { scoped } from '@nti/lib-locale';

import {
	EmptyFilterSetRule,
	FilterSetGroup,
	FilterSetRegistry,
} from './common';
import { CourseMembershipFilterSet } from './CourseMembership';
import { IsDeactivatedFilterSet } from './IsDeactivated';
import { ProfilePropertyFilterSet } from './ProfileProperty';

const t = scoped(
	'nti-web-site-admin.components.users.segment.editor.filters.types.Union',
	{
		or: 'OR',
	}
);

const Type = 'application/vnd.nextthought.segments.unionuserfilterset';

export class UnionFilterSet extends FilterSetGroup {
	type = Type;

	constructor(...args) {
		super(...args);

		if (
			!this.data['filter_sets'] ||
			this.data['filter_sets'].length === 0
		) {
			this.data['filter_sets'] = [new EmptyFilterSetRule(this)];
		}
	}

	allowedSubFilterSets = [
		IsDeactivatedFilterSet,
		CourseMembershipFilterSet,
		ProfilePropertyFilterSet,
	];
	joinLabel = t('or');

	getDefaultSubFilterSet() {
		return new EmptyFilterSetRule(this);
	}

	canRemove = true;
}

FilterSetRegistry.register(Type, UnionFilterSet);
