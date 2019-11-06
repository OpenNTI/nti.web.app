import {Stores} from '@nti/lib-store';
import {Theme} from '@nti/web-commons';
import {Events} from '@nti/web-session';
import { getService } from '@nti/web-client';

import {
	ASSETS,
	BRAND_COLOR,
	BRAND_NAME,
	SITE_BRAND,
	THEME,
	MimeTypes,
} from './constants';

const CHANGED = '_changed';
const Load = Symbol('load');
const Loading = Symbol('loading');
const RebuildTheme = Symbol('rebuild theme');

export default class ThemeEditorStore extends Stores.SimpleStore {

	constructor () {
		super();
		this[Load]();
	}

	/**
	 * Sets a site asset for previewing
	 * @param {String} type - One of: 'email', 'favicon', 'full_logo', 'icon', 'logo'
	 * @param {Object} item - An object representing the asset
	 * @param {String} item.source - Source image in 'data:image/png;base64' format
	 * @param {String} item.filename - The filename to associate with the image
	 * @returns {undefined}
	 */
	setAsset = (type, item) => {
		const {source, filename} = item || {};
		this.set(ASSETS, {
			MimeType: MimeTypes.Assets,
			...(this.get(ASSETS) || {}),
			[type]: {
				source,
				filename,
				MimeType: MimeTypes.Image,
			}
		});
	}

	setBrandProp = (prop, value) => {
		const brand = this.get(SITE_BRAND);
		brand[prop] = value;
		this.set(CHANGED, {
			...(this.get(CHANGED) || {}),
			[prop]: value,
		});
		this[RebuildTheme]();
	}

	/**
	 * Set the brand color
	 * @param {String} color - the new brand color as a CSS string
	 * @returns {undefined}
	 */
	setBrandColor = color => this.setBrandProp(BRAND_COLOR, color)

	/**
	 * Set the brand name
	 * @param {String} name - the new brand name
	 * @returns {undefined}
	 */
	setBrandName = name => this.setBrandProp(BRAND_NAME, name)

	/**
	 * Merges the specified object into the theme
	 * @param {Object} newProps - The object to merge
	 * @return {undefined}
	 */
	setThemeProps = newProps => {
		const {theme} = this.get(SITE_BRAND) || {};
		this.setBrandProp(THEME, {
			...theme,
			...newProps
		});
	}

	[RebuildTheme] = (brand = this.get(SITE_BRAND)) => {
		const theme = Theme.buildTheme();
		theme.setOverrides(Theme.siteBrandToTheme(brand));
		this.set(THEME, theme);
	}

	[Load] = async () => {
		if (this[Loading]) {
			return;
		}

		const brand = await (this[Loading] = getService()
			.then(s => s.getWorkspace('SiteAdmin'))
			.then(w => w.fetchLinkParsed('SiteBrand')));

		delete this[Loading];
		this.set(SITE_BRAND, brand);
		this[RebuildTheme](brand);
	}

	save = async (form) => {
		const brand = this.get(SITE_BRAND);
		if (!brand) {
			throw new Error('Unable to save.'); // no link
		}

		const formData = new FormData(form);
		formData.append('__json__', JSON.stringify({
			...(this.get(THEME) || {}),
			...(this.get(CHANGED) || {})
		}));

		const resp = await brand.putToLink('edit', formData);

		Events.emit(Events.THEME_UPDATED, resp);

		return resp;
	}
}
