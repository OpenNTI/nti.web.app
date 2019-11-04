import {Stores} from '@nti/lib-store';
import {Theme} from '@nti/web-commons';
import { getService } from '@nti/web-client';

import {
	assets,
	brandColor,
	siteBrand,
	theme,
	MimeTypes,
} from './constants';

const Load = Symbol('load');
const Loading = Symbol('loading');

export default class ThemeEditorStore extends Stores.SimpleStore {

	constructor () {
		super();
		this[Load]();
	}

	/**
	 * Sets a site asset
	 * @param {String} type - One of: 'email', 'favicon', 'full_logo', 'icon', 'logo'
	 * @param {Object} item - An object representing the asset
	 * @param {String} item.source - Source image in 'data:image/png;base64' format
	 * @param {String} item.filename - The filename to associate with the image
	 * @returns {undefined}
	 */
	setAsset = (type, item) => {
		const {source, filename} = item || {};
		this.set(assets, {
			MimeType: MimeTypes.Assets,
			...(this.get(assets) || {}),
			[type]: {
				source,
				filename,
				MimeType: MimeTypes.Image,
			}
		});
	}

	/**
	 * Set the brand color
	 * @param {String} color - the new brand color as a CSS string
	 * @returns {undefined}
	 */
	setBrandColor = color => {
		this.set(siteBrand, {
			...(this.get(siteBrand) || {}),
			[brandColor]: color
		});
	}

	/**
	 * Merges the specified object into the theme
	 * @param {Object} newProps - The object to merge
	 * @return {undefined}
	 */
	setThemeProps = newProps => {
		const th = this.get(theme);
		th.setOverrides(newProps);
		this.set(theme, th);
	}

	[Load] = async () => {
		if (this[Loading]) {
			return;
		}

		const brand = await (this[Loading] = getService()
			.then(s => s.getWorkspace('SiteAdmin'))
			.then(w => w.fetchLinkParsed('SiteBrand')));

		delete this[Loading];
		this.set(siteBrand, brand);
		this.set(assets, (brand || {}).assets);
		this.set(theme, Theme.buildTheme(void 0, (brand || {}).theme || {}));
	}

	save = async () => {
		const brand = this.get(siteBrand);
		if (!brand) {
			throw new Error('Unable to save.'); // no link
		}
		const payload = {
			assets: this.get(assets),
			theme: this.get(theme)
		};

		return brand.putToLink('edit', payload);
	}
}
