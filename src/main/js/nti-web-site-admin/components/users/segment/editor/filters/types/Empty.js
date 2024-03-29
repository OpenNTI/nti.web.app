import { FilterSetGroup } from './common';
import { IntersectionFilterSet } from './Intersection';
import { UnionFilterSet } from './Union';

export class EmptyFilterSet extends FilterSetGroup {
	getDefault() {
		return new IntersectionFilterSet(null, {
			filter_sets: [new UnionFilterSet(this)],
		});
	}

	toJSON() {
		return null;
	}
}
