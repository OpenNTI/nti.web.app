import { decodeFromURI } from '@nti/lib-ntiids';
import { getService } from '@nti/web-client';
import { StateStore } from '@nti/web-core/data';

const EmptyFilterSet = {};
export class SegmentStore extends StateStore {
	constructor() {
		super();

		this.addDependentProperty('title', ['segment', 'editedTitle']);
		this.addDependentProperty('filterSet', ['segment', 'editedFilterSet']);
		this.addDependentProperty('hasChange', ['title', 'filterSet']);
	}

	async load(action) {
		const service = await getService();
		const segment = await service.getObject(
			decodeFromURI(action.store.params.segmentID)
		);

		return { segment };
	}

	get hasChanges() {
		const segment = this.getProperty('segment');

		return (
			segment.title !== this.title || segment.filterSet !== this.filterSet
		);
	}

	get title() {
		return (
			this.getProperty('editedTitle') ??
			this.getProperty('segment')?.title ??
			''
		);
	}

	setTitle(title) {
		this.updateState({ editedTitle: title });
		this.save.clearError();
	}

	get filterSet() {
		const edited = this.getProperty('editedFilterSet');

		if (edited === EmptyFilterSet) {
			return null;
		}

		return edited ?? this.getProperty('segment')?.filterSet;
	}

	setFilterSet(filterSet) {
		this.updateState({ editedFilterSet: filterSet ?? EmptyFilterSet });
		this.save.clearError();
	}

	save = StateStore.Action(async action => {
		const { segment } = action.store.state;

		const payload = {};

		if (this.title !== segment.title) {
			payload.title = this.title;
		}

		if (this.filterSet !== segment.filterSet) {
			payload.filter_set = this.filterSet;
		}

		if (Object.keys(payload).length === 0) {
			return;
		}

		await segment.save(payload);

		action.store.update({
			editedTitle: null,
			editedFilterSet: null,
		});
	});

	destroy = StateStore.Action(async action => {
		const { segment } = action.store.state;
		const { afterDestroy } = action.store.params;

		await segment.delete();

		afterDestroy?.();
	});

	discard = StateStore.Action(async action => {
		action.store.update({
			editedFilterSet: null,
			editedTitle: null,
		});
	});
}
