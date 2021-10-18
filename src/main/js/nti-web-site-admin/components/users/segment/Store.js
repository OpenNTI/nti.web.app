import { decodeFromURI } from '@nti/lib-ntiids';
import { getService } from '@nti/web-client';
import { StateStore } from '@nti/web-core/data';

const EmptyFilterSet = {};
export class SegmentStore extends StateStore {
	constructor() {
		super();

		this.addDependentProperty('title', ['segment', 'editedTitle']);
		this.addDependentProperty('filterSet', ['segment', 'editedFilterSet']);
	}

	async load(action) {
		const service = await getService();
		const segment = await service.getObject(
			decodeFromURI(action.store.params.segmentID)
		);

		return { segment };
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
	}

	save = StateStore.Action(async action => {
		const { segment } = action.store.state;

		try {
			const payload = {};

			if (this.title !== segment.title) {
				payload.title = this.title;
			}

			if (this.filterSet !== segment.editedFilterSet) {
				payload.filter_set = this.filterSet;
			}

			await segment.save(payload);

			action.store.update({
				editedTitle: null,
				editedFilterSet: null,
			});
		} catch (e) {
			debugger;
		}
	});
}
