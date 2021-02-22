export const ASSETS = 'assets';
export const BRAND_COLOR = 'brand_color';
export const BRAND_IMAGE = 'brandImage';
export const BRAND_NAME = 'brand_name';
export const ERROR = 'error';
export const LIBRARY = 'library';
export const LOADING = 'loading';
export const MODIFIED = 'modified';
export const SITE = 'site';
export const SITE_BRAND = 'siteBrand';
export const SITE_INFO = 'siteInfo';
export const THEME = 'theme';
export const CAN_EDIT_EMAIL_ASSET = 'can-edit-email';
export const CAN_RESET = 'can-reset';

export const AssetTypeMap = {
	fullLogo: 'full_logo',
};

export const scopes = [BRAND_COLOR, LIBRARY, ASSETS, SITE];

export const MimeTypes = {
	[SITE_BRAND]: 'application/vnd.nextthought.sitebrand',
	[ASSETS]: 'application/vnd.nextthought.sitebrandassets',
	[BRAND_IMAGE]: 'application/vnd.nextthought.sitebrandimage',
};
