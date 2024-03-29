import { Stores } from '@nti/lib-store';
import { ObjectUtils } from '@nti/lib-commons';
import { Theme } from '@nti/web-commons';
import { Events } from '@nti/web-session';
import { getService } from '@nti/web-client';

import {
	ASSETS,
	ERROR,
	LOADING,
	MODIFIED,
	SITE_BRAND,
	THEME,
	CAN_EDIT_EMAIL_ASSET,
	CAN_RESET,
	MimeTypes,
	AssetTypeMap,
} from './constants';

const CHANGED = '_changed';
const Load = Symbol('load');
const Loading = Symbol('loading');
const RebuildTheme = Symbol('rebuild theme');
const DeletedAssets = Symbol('deleted assets');

export default class ThemeEditorStore extends Stores.SimpleStore {
	constructor() {
		super();
		this[Load]();
	}

	/**
	 * Sets a site asset for previewing
	 *
	 * @param {string} type - One of: 'email', 'favicon', 'full_logo', 'icon', 'logo'
	 * @param {Object} item - An object representing the asset
	 * @param {string} item.source - Source image in 'data:image/png;base64' format
	 * @param {string} item.filename - The filename to associate with the image
	 * @returns {undefined}
	 */
	setAsset = (type, item) => {
		const { source, filename, file } = item || {};
		const track = !!file;

		if (this[DeletedAssets]?.[type]) {
			delete this[DeletedAssets][type];
		}

		this.setBrandProp(
			`${ASSETS}.${AssetTypeMap[type] || type}`,
			{
				source,
				file,
				href: source,
				filename,
				MimeType: MimeTypes.Image,
			},
			track
		);
	};

	clearAsset = type => {
		this[DeletedAssets] = this[DeletedAssets] || {};
		this[DeletedAssets][type] = true;

		this.setBrandProp(`${ASSETS}.${AssetTypeMap[type] || type}`, {
			source: null,
			file: null,
			href: null,
			filename: null,
			MimeType: MimeTypes.Image,
		});
	};

	setThemeProp = (path, value) => {
		this.setBrandProp(`theme.${path}`, value);
	};

	setBrandProp = (path, value, trackChange = true) => {
		const brand = this.get(SITE_BRAND);
		ObjectUtils.set(brand, path, value);
		this.set(MODIFIED, true);

		if (trackChange) {
			this.set(
				CHANGED,
				ObjectUtils.set(this.get(CHANGED) || {}, path, value)
			);
		}

		this[RebuildTheme]();
	};

	[RebuildTheme] = (brand = this.get(SITE_BRAND)) => {
		const theme = Theme.buildTheme(this.ThemeProperties);
		theme.setOverrides(Theme.siteBrandToTheme(brand));
		this.set(THEME, theme);
		this.set(ERROR, null);
	};

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
				.then(w => w.fetchLink('SiteBrand')));

			delete this[Loading];
			this.set(SITE_BRAND, brand);
			this.set(CAN_EDIT_EMAIL_ASSET, !brand.UneditableEmailImage);
			this.set(MODIFIED, false);
			this.set(CHANGED, undefined);
			this[RebuildTheme](brand);
		} catch (e) {
			this.set(ERROR, e);
		} finally {
			this.set(LOADING, false);
		}
	};

	get [CAN_RESET]() {
		const brand = this.get(SITE_BRAND);

		return brand && brand.hasLink('delete');
	}

	cancel = this[Load];

	reset = async () => {
		const brand = this.get(SITE_BRAND);
		try {
			await brand.deleteLink('delete').then(this[Load]);

			const newBrand = this.get(SITE_BRAND);

			Events.emit(Events.THEME_UPDATED, newBrand);
		} catch (e) {
			this.set(ERROR, e);
		}
	};

	getFormData() {
		const brand = this.get(SITE_BRAND);
		const formData = new FormData();
		let data = {
			...this.get(CHANGED),
			theme: { ...brand.theme },
		};

		const fileFilter = (key, value) => {
			const { file, filename, ...v } = value || {};
			const deleted = this[DeletedAssets]?.[key];

			//If its not an image don't filter it
			if (file === undefined || v.MimeType !== MimeTypes.Image) {
				return value;
			}

			//if the asset was deleted append null
			if (deleted) {
				formData.append(key, '');
			} else {
				formData.append(key, file, filename);
			}
		};

		data = ObjectUtils.filter(data, fileFilter, true);

		formData.append('__json__', JSON.stringify(data));

		return formData;
	}

	save = async form => {
		try {
			this.set(LOADING, true);
			const brand = this.get(SITE_BRAND);
			const formData = this.getFormData();

			const resp = await brand.putToLink('edit', formData);

			Events.emit(Events.THEME_UPDATED, resp);

			this.set(MODIFIED, false);

			return resp;
		} catch (e) {
			this.set(ERROR, e);
		} finally {
			this.set(LOADING, false);
		}
	};
}
