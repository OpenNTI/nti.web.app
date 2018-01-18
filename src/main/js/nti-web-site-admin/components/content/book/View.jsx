import {Router, Route} from 'nti-web-routing';

import Overview from '../info/overview';
import Reports from '../info/reports';

import Frame from './Frame';

export default Router.for([
	Route({path: '/reports', component: Reports, name: 'site-admin.courses.book-reports'}),
	Route({path: '/', component: Overview, name: 'site-admin.courses.book-overview'})
], {frame: Frame});
