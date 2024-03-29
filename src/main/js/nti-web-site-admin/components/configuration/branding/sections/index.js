import Logger from '@nti/util-logger';

import { LIBRARY, ASSETS, SITE } from '../constants';

import Library from './library';
import Assets from './assets';
import Site from './site';

const logger = Logger.get('site-admin.branding.sections');

const scopes = {
	[LIBRARY]: Library,
	[SITE]: Site,
	[ASSETS]: Assets,
};

const warn = scope => () => {
	logger.warn(`No component for scope '${scope}'`);
	return null;
};

export { Library, Assets, Site };

export default scope => scopes[scope] || warn(scope);
