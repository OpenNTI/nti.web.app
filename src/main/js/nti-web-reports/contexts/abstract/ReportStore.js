import {Stores} from 'nti-lib-store';

export default class ReportStore extends Stores.SimpleStore {
	constructor (rel, context) {
		super();

		this.set('rel', rel);
		this.set('items', [context]);
	}
}
