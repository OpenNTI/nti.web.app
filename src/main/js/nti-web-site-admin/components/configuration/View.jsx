import { Router, Route } from '@nti/web-routing';

import Transcripts from './transcripts';
import Integrations from './integrations';
import Branding from './branding';
import Login from './login';
import { Catalog } from './catalog/View.jsx';
import { Webhooks } from './webhooks/View.jsx';
import Frame from './Frame';

export default Router.for(
	[
		Route({
			path: '/integrations',
			component: Integrations,
			name: 'site-admin.advanced.integrations',
		}),
		Route({
			path: '/transcripts',
			component: Transcripts,
			name: 'site-admin.transcripts',
		}),
		Route({
			path: '/login',
			component: Login,
			name: 'site-admin.advanced.login',
		}),
		Route({
			path: '/catalog',
			component: Catalog,
			name: 'site-admin.advanced.catalog',
		}),
		Route({
			path: '/webhooks',
			component: Webhooks,
			name: 'site-admin.advanced.webhooks',
		}),
		Route({
			path: '/',
			component: Branding,
			name: 'site-admin.advanced.branding',
		}),
	],
	{ frame: Frame, title: 'Advanced' }
);
