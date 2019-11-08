import {Stores} from '@nti/lib-store';
import {ObjectUtils} from '@nti/lib-commons';
import {Theme} from '@nti/web-commons';
import {Events} from '@nti/web-session';
import { getService } from '@nti/web-client';

import {
	ASSETS,
	SITE_BRAND,
	THEME,
	MimeTypes,
	AssetTypeMap
} from './constants';

const CHANGED = '_changed';
const MODIFIED = '_modified';
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
		this.setBrandProp(`${ASSETS}.${AssetTypeMap[type] || type}`, {
			source,
			href: source,
			filename,
			MimeType: MimeTypes.Image,
		}, true);
	}

	setBrandProp = (path, value, doNotTrackChange) => {
		const brand = this.get(SITE_BRAND);
		ObjectUtils.set(brand, path, value);
		this.set(MODIFIED, true);

		if (!doNotTrackChange) {
			this.set(CHANGED, ObjectUtils.set(this.get(CHANGED) || {}, path, value));
		}

		this[RebuildTheme]();
	}

	get hasChanges () {
		return !!this.get(MODIFIED);
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
		this.set(MODIFIED, false);
		this.set(CHANGED, undefined);
		this[RebuildTheme](brand);
	}

	cancel = this[Load]

	reset = async () => {
		const brand = this.get(SITE_BRAND);

		if (!brand) {
			throw new Error('Unable to reset.'); // no link
		}

		return brand.requestLink('delete', 'delete').then(this[Load]);
	}

	save = async (form) => {
		const brand = this.get(SITE_BRAND);
		if (!brand) {
			throw new Error('Unable to save.'); // no link
		}

		const formData = new FormData();

		const assets = form.querySelectorAll('input[type="file"]');

		for (let asset of assets) {
			if (asset.files && asset.files.length > 0 && asset.name) {
				formData.append(asset.name, asset.files[0]);
			}
		}

		formData.append('__json__', JSON.stringify({
			...(this.get(CHANGED) || {}),
			...(this.get(THEME) || {})
		}));

		const resp = await brand.putToLink('edit', formData);

		Events.emit(Events.THEME_UPDATED, resp);

		return resp;
	}
}
