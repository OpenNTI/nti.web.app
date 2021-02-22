import { Theme } from '@nti/web-login/shared';

import BrandingStore from '../branding/Store';
import {
	ERROR,
	LOADING,
	MODIFIED,
	THEME,
	SITE_BRAND,
	CAN_RESET,
} from '../branding/constants';

export default class LoginStore extends BrandingStore {
	static Error = ERROR;
	static Loading = LOADING;
	static Modified = MODIFIED;
	static Theme = THEME;
	static SiteBrand = SITE_BRAND;
	static CanReset = CAN_RESET;
	static Save = 'save';
	static Cancel = 'cancel';
	static Reset = 'reset';
	static SetAsset = 'setAsset';
	static SetBrandProp = 'setBrandProp';
	static SetThemeProp = 'setThemeProp';

	ThemeProperties = Theme.Properties;
}
