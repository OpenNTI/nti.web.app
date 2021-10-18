import { decodeFromURI } from '@nti/lib-ntiids';
import { getService } from '@nti/web-client';
import { StateStore } from '@nti/web-core/data';

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
		return (
			this.getProperty('editedFilterSet') ??
			this.getProperty('segment')?.filterSet
		);
	}

	setFilterSet(filterSet) {
		console.log('New Filter Set: ', filterSet);
		this.updateState({ editedFilterSet: filterSet });
	}
}
