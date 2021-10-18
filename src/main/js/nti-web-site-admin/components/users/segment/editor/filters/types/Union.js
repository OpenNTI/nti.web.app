import { scoped } from '@nti/lib-locale';

import {
	EmptyFilterSetRule,
	FilterSetGroup,
	FilterSetRegistry,
} from './common';
import { IsDeactivatedFilterSet } from './IsDeactivated';

const t = scoped(
	'nti-web-site-admin.components.users.segment.editor.filters.types.Union',
	{
		or: 'OR',
	}
);

export const UnionType = 'filterset.union';

export class UnionFilterSet extends FilterSetGroup {
	type = UnionType;

	constructor(...args) {
		super(...args);

		if (!this.data.sets || this.data.sets.length === 0) {
			this.data.sets = [new EmptyFilterSetRule(this)];
		}
	}

	allowedSubFilterSets = [IsDeactivatedFilterSet];
	joinLabel = t('or');

	getDefaultSubFilterSet() {
		return new EmptyFilterSetRule(this);
	}

	canRemove = true;
}

FilterSetRegistry.register(UnionType, UnionFilterSet);
