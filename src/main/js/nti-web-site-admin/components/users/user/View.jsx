import {Router, Route} from 'nti-web-routing';// eslint-disable-line

import Overview from './overview';
import Reports from './reports';
import Transcript from './transcript';
import Frame from './Frame';

export default Router.for([
	Route({path: '/transcript', component: Transcript, name: 'site-admin.users.user-transcript'}),
	Route({path: '/reports', component: Reports, name: 'site-admin.users.user-overview'}),
	Route({path: '/', component: Overview, name: 'site-admin.users.user-overview'})
], Frame);
