import {Stores} from '@nti/lib-store';
import {Theme} from '@nti/web-commons';

import {theme} from './constants';

export default class ThemeEditorStore extends Stores.BoundStore {
	load = () => {
		this.set(theme, Theme.getGlobalTheme());
	}
}
