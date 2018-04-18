import {Router, Route} from '@nti/web-routing';// eslint-disable-line

import Overview from './overview';
import Reports from './reports';
import Progress from './progress';
import Frame from './Frame';

export default Router.for([
	Route({path: '/reports', component: Reports, name: 'site-admin.users.user-course-enrollment.reports'}),
	Route({path: '/progress', component: Progress, name: 'site-admin.users.user-course-enrollment.progress'}),
	Route({path: '/', component: Overview, name: 'site-admin.users.user-course-enrollment.overview'})
], {frame: Frame});
