import Logger from '@nti/util-logger';

import {library, assets, site} from '../constants';

import Library from './library';
import Assets from './assets';
import Site from './site';

const logger = Logger.get('site-admin.branding.sections');

const scopes = {
	[library]: Library,
	[site]: Site,
	[assets]: Assets,
};

const warn = scope => () => (logger.warn(`No component for scope '${scope}'`), null);

export {
	Library,
	Assets,
	Site,
};

export default scope => scopes[scope] || warn(scope);
