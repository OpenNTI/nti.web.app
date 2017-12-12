import {Router, Route} from 'nti-web-routing';

import Overview from './overview';
import Reports from './reports';
import Roster from './roster';
import Frame from './Frame';

export default Router.for([
	Route({path: '/roster', component: Roster, name: 'site-admin.courses.course-roster'}),
	Route({path: '/reports', component: Reports, name: 'site-admin.courses.course-rerpots'}),
	Route({path: '/', component: Overview, name: 'site-admin.courses.course-overview'})
], {frame: Frame});

