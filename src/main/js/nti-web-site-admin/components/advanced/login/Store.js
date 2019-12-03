import {Theme} from '@nti/web-login/shared';

import BrandingStore from '../branding/Store';
import {
	ERROR,
	LOADING,
	MODIFIED,
	THEME,
	SITE_BRAND
} from '../branding/constants';

export default class LoginStore extends BrandingStore {
	static Error = ERROR;
	static Loading = LOADING;
	static Modified = MODIFIED;
	static Theme = THEME;
	static SiteBrand= SITE_BRAND;
	static Save = 'save';
	static Cancel = 'cancel';
	static Reset = 'reset';
	static SetAsset = 'setAsset';
	static SetBrandProp = 'setBrandProp';
	static SetThemeProp = 'setThemeProp';

	ThemeProperties = Theme.Properties

	reset = () => {
		const brand = this.get(SITE_BRAND);

		if (brand.theme) {
			delete brand.theme.login;
		}

		if (brand.assets) {
			delete brand.assets['login_logo'];
			delete brand.assets['login_background'];
			delete brand.assets['login_featured_callout'];

			this.set('assetsToRemove', [
				'login_logo',
				'login_background',
				'login_featured_callout'
			]);
		}

		this.set(BrandingStore.CHANGED, null);
		this.set(MODIFIED, true);

		this.rebuildTheme(brand);
	}
}