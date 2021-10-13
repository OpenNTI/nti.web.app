import { StateStore } from '@nti/web-core/data';

const loadMembersPreview = segment =>
	segment.fetchLink({
		rel: 'members',
		mode: 'batch',
		params: { batchSize: 10, batchStart: 0 },
	});

const loadFilterSetPreview = segment => ({ total: 0, Items: [] });

export class MembersPreviewStore extends StateStore {
	async load(action) {
		const { segment, filterSet } = action.store.params;
		const preview = filterSet
			? await loadFilterSetPreview(segment, filterSet)
			: await loadMembersPreview(segment);

		return {
			total: preview.total,
			Items: preview.Items,
		};
	}
}
