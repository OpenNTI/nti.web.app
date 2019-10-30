import Logger from '@nti/util-logger';

import {library, logos, site} from '../constants';

import Library from './library';
import Logos from './logos';
import Site from './site';

const logger = Logger.get('site-admin.branding.sections');

const scopes = {
	[library]: Library,
	[logos]: Logos,
	[site]: Site
};

const warn = scope => () => (logger.warn(`No component for scope '${scope}'`), null);

export default scope => scopes[scope] || warn(scope);
