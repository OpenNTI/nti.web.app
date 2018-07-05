import {Router, Route} from '@nti/web-routing';// eslint-disable-line

import Overview from './overview';
import Reports from './reports';
import Frame from './Frame';

export default Router.for([
	Route({path: '/reports', component: Reports, name: 'site-admin.users.user-book.reports'}),
	Route({path: '/', component: Overview, name: 'site-admin.users.user-book.overview'})
], {frame: Frame});
