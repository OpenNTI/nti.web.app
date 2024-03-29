import { FilterSetRegistry } from './common';
import { EmptyFilterSet } from './Empty';

import './CourseMembership';
import './Intersection';
import './IsDeactivated';
import './ProfileProperty';
import './Union';

//NOTE: for now filterSet should either be null or an intersection set.
export const getType = filterSet => {
	if (!filterSet) {
		return new EmptyFilterSet();
	}

	const Type = FilterSetRegistry.getItem(filterSet.MimeType);

	return new Type(null, filterSet);
};
