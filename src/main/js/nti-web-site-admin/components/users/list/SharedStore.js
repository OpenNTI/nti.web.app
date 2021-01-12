import {Stores} from '@nti/lib-store';
import {getService} from '@nti/web-client';

export default class SharedUserStore extends Stores.SimpleStore {
	static Singleton = true;

	static markDirty () {
		this.getStore().SeatLimits = null;
	}

	#SeatLimits = null;

	async loadSeatLimits () {
		const REL = 'SeatLimit';
		try {
			const workspace = (await getService()).getWorkspace('Global');

			if (!workspace || !workspace.hasLink(REL)) { throw new Error('No Seat Limit'); }

			const resp = await workspace.fetchLink(REL);

			this.#SeatLimits = {
				maxSeats: resp['max_seats'],
				usedSeats: resp['used_seats'],
			};
		} catch {
			this.#SeatLimits = false;
		} finally {
			this.emit('change', {type: 'SeatLimits'});
		}
	}

	get SeatLimits () {
		if (this.#SeatLimits == null) {
			this.#SeatLimits = this.loadSeatLimits();
		}
		return this.#SeatLimits instanceof Promise ? null : this.#SeatLimits;
	}

	set SeatLimits (v) {
		this.#SeatLimits = null;
		this.emit('change', {type: 'SeatLimits'});
	}

}
