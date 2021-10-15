import { FilterSetRegistry } from './common';
import { EmptyFilterSet } from './Empty';

import './Intersection';
import './IsDeactivated';
import './Union';

//NOTE: for now filterSet should either be null or an intersection set.
export const getType = filterSet => {
	if (!filterSet) {
		return new EmptyFilterSet();
	}

	const Type = FilterSetRegistry.getItem(filterSet.MimeType);

	return new Type(null, filterSet);
};
