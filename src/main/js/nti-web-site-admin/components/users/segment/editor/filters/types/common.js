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

	getFilterSet() {
		if (!this.type) {
			throw new Error('Cannot get payload for filterset without a type.');
		}

		return {
			...this.data,
			MimeType: this.type,
		};
	}
}

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

	get sets() {
		return this.data.sets;
	}

	getFilterSet(allowEmpty) {
		if (this.sets.length === 0 && !allowEmpty) {
			return null;
		}

		const payload = super.getFilterSet();

		payload.sets = payload.sets.map(s => s.getFilterSet(allowEmpty));

		return payload;
	}
}
