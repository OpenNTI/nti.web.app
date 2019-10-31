import {Stores} from '@nti/lib-store';
import {Theme} from '@nti/web-commons';
import { getService } from '@nti/web-client';

import {theme} from './constants';

const Loading = Symbol('loading');

export default class ThemeEditorStore extends Stores.SimpleStore {

	constructor () {
		super();
		this.load();
	}

	onThemePropsChange = newProps => {
		const th = this.get(theme);
		th.setOverrides({...th.getValues(), ...newProps});
		this.set(theme, th);
	}

	load = async () => {
		if (this[Loading]) {
			return;
		}

		this[Loading] = getService()
			.then(s => s.getWorkspace('SiteAdmin'))
			.then(w => w.fetchLink('SiteBrand'));

		const siteBrand = await this[Loading];
		delete this[Loading];
		this.set('siteBrand', siteBrand);
		this.set(theme, Theme.buildTheme(void 0, (siteBrand || {}).theme || {}));
	}

	save = async () => {
		console.log('store.save');
	}
}
