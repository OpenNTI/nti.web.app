import { FilterSetGroup } from './common';
import { IntersectionFilterSet } from './Intersection';
import { UnionFilterSet } from './Union';

export class EmptyFilterSet extends FilterSetGroup {
	addDefault() {
		this.setData({
			sets: [
				new IntersectionFilterSet(this, {
					sets: [new UnionFilterSet(this, { sets: [] })],
				}),
			],
		});
	}

	getFilterSet() {
		return this.data?.sets?.[0]?.getFilterSet(true) ?? null;
	}
}
