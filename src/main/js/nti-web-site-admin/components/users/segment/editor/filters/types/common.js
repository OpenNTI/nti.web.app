import EventEmitter from 'events';

import { Registry } from '@nti/lib-commons';

export class FilterSetRegistry extends Registry.Map {}

export class FilterSet extends EventEmitter {
	type = '';

	constructor(parent, data) {
		super();

		this.parent = parent;
		this.data = data ?? {};
	}

	get depth() {
		if (this.parent) {
			return this.parent.depth + 1;
		}

		return 0;
	}

	isEmpty() {
		return false;
	}

	setData(data) {
		this.data = { ...(this.data ?? {}), ...data };
		this.onChange();
	}

	onChange() {
		this.emit('change', this);
		this.parent?.onChange();
	}

	subscribe(fn) {
		this.addListener('change', fn);

		return () => this.removeListener('change', fn);
	}

	toJSON() {
		if (!this.type) {
			throw new Error('Cannot get payload for filterset without a type.');
		}

		return {
			...this.data,
			MimeType: this.type,
		};
	}

	getErrors() {
		return [];
	}
}

export class FilterSetRule extends FilterSet {
	static getRules() {
		return this.Rules;
	}

	getActiveRule() {}
}

const EmptyType = 'filterset.emptyrule';
export class EmptyFilterSetRule extends FilterSetRule {
	type = EmptyType;

	toJSON() {
		return null;
	}
}

FilterSetRegistry.register(EmptyType, EmptyFilterSetRule);

export class FilterSetGroup extends FilterSet {
	constructor(...args) {
		super(...args);

		this.data['filter_sets'] = (this.data['filter_sets'] ?? [])
			.map(subSet => {
				if (subSet instanceof FilterSet) {
					subSet.parent = this;
					return subSet;
				}

				const Type = FilterSetRegistry.getInstance().getItem(
					subSet.MimeType
				);

				if (!Type) {
					return null;
				}

				return new Type(this, subSet);
			})
			.filter(Boolean);
	}

	allowedSubFilterSets = [];
	joinLabel = '';

	get filterSets() {
		return this.data['filter_sets'];
	}

	set filterSets(sets) {
		this.setData({
			filter_sets: sets,
		});
	}

	isEmpty() {
		return (
			!this.filterSets ||
			this.filterSets === 0 ||
			this.filterSets.every(s => s.isEmpty())
		);
	}

	canAdd() {
		return true;
	}

	getDefaultSubFilterSet() {
		return null;
	}

	appendFilterSet(filterSet) {
		filterSet = filterSet ?? this.getDefaultSubFilterSet();

		if (filterSet) {
			filterSet.parent = this;

			this.filterSets = [...this.filterSets, filterSet];
		}
	}

	replaceFilterSet(target, replacement) {
		replacement.parent = this;

		this.filterSets = this.filterSets.map(s =>
			s === target ? replacement : s
		);
	}

	canRemove = false;

	removeFilterSet(target) {
		this.filterSets = this.filterSets.filter(s => s !== target);

		if (this.filterSets.length === 0 && this.parent?.removeFilterSet) {
			this.parent.removeFilterSet(this);
		}
	}

	toJSON() {
		const payload = super.toJSON();

		payload['filter_sets'] = (payload['filter_sets'] ?? [])
			.map(s => s?.toJSON())
			.filter(Boolean);

		if (payload['filter_sets'].length === 0) {
			return null;
		}

		return payload;
	}
}
