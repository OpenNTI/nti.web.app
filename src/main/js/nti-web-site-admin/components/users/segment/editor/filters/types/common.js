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

		if (this.data.sets) {
			this.data.sets = this.data.sets
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
	}

	allowedSubFilterSets = [];
	joinLabel = '';

	get sets() {
		return this.data.sets;
	}

	isEmpty() {
		return !this.data.sets || this.data.sets.length === 0;
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
			this.setData({
				sets: [...this.sets, filterSet],
			});
		}
	}

	replaceFilterSet(target, replacement) {
		this.setData({
			sets: this.sets.map(s => (s === target ? replacement : s)),
		});
	}

	canRemove = false;

	removeFilterSet(target) {
		this.setData({
			sets: this.sets.filter(s => s !== target),
		});

		if (this.sets.length === 0 && this.parent.removeFilterSet) {
			this.parent.removeFilterSet(this);
		}
	}

	toJSON() {
		const payload = super.toJSON();

		payload.sets = (payload.sets ?? [])
			.map(s => s?.toJSON())
			.filter(Boolean);

		if (payload.sets.length === 0) {
			return null;
		}

		return payload;
	}
}
