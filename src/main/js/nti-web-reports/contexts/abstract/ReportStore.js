import {Stores} from 'nti-lib-store';

export default class ReportStore extends Stores.SimpleStore {
	constructor (report) {
		super();

		this.set('items', [report]);
	}
}
