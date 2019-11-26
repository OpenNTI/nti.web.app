import {Stores} from '@nti/lib-store';
import {ObjectUtils} from '@nti/lib-commons';
import {Theme} from '@nti/web-commons';
import {Events} from '@nti/web-session';
import { getService } from '@nti/web-client';

import {
	ASSETS,
	ERROR,
	LOADING,
	MODIFIED,
	SITE_BRAND,
	THEME,
	CAN_EDIT_EMAIL_ASSET,
	MimeTypes,
	AssetTypeMap
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
		this.setBrandProp(`${ASSETS}.${AssetTypeMap[type] || type}`, {
			source,
			href: source,
			filename,
			MimeType: MimeTypes.Image,
		}, true);
	}

	setThemeProp = (path, value) => {
		this.setBrandProp(`theme.${path}`, value);
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

	[RebuildTheme] = (brand = this.get(SITE_BRAND)) => {
		const theme = Theme.buildTheme(this.ThemeProperties);
		theme.setOverrides(Theme.siteBrandToTheme(brand));
		this.set(THEME, theme);
	}

	[Load] = async () => {
		if (this[Loading]) {
			return;
		}

		try {
			this.set({
				[ERROR]: undefined,
				[LOADING]: true,
			});
			const brand = await (this[Loading] = getService()
				.then(s => s.getWorkspace('SiteAdmin'))
				.then(w => w.fetchLinkParsed('SiteBrand')));
	
			delete this[Loading];
			this.set(SITE_BRAND, brand);
			this.set(CAN_EDIT_EMAIL_ASSET, !brand.UneditableEmailImage);
			this.set(MODIFIED, false);
			this.set(CHANGED, undefined);
			this[RebuildTheme](brand);
		}
		catch (e) {
			this.set(ERROR, e);
		}
		finally {
			this.set(LOADING, false);
		}
	}

	cancel = this[Load]

	reset = async () => {
		const brand = this.get(SITE_BRAND);
		try {
			await brand.requestLink('delete', 'delete').then(this[Load]);

			const newBrand = this.get(SITE_BRAND);

			Events.emit(Events.THEME_UPDATED, newBrand);
		}
		catch (e) {
			this.set(ERROR, e);
		}
	}

	save = async (form) => {
		try {
			this.set(LOADING, true);
			const brand = this.get(SITE_BRAND);
			const formData = new FormData();
	
			const assets = form.querySelectorAll('input[type="file"]');
	
			for (let asset of assets) {
				if (asset.files && asset.files.length > 0 && asset.name) {
					formData.append(asset.name, asset.files[0]);
				}
			}
	
			formData.append('__json__', JSON.stringify({
				...(this.get(CHANGED) || {}),
				theme: {...brand.theme}
			}));
	
			const resp = await brand.putToLink('edit', formData);
	
			Events.emit(Events.THEME_UPDATED, resp);

			this.set(MODIFIED, false);

			return resp;
		}
		catch (e) {
			this.set(ERROR, e);
		}
		finally {
			this.set(LOADING, false);
		}
	}
}
