import {Router, Route} from '@nti/web-routing';

import Overview from './overview';
import Reports from './reports';
import Frame from './Frame';

export default Router.for([
	Route({ path: '/reports', component: Reports, name: 'site-admin.courses.book-reprots' }),
	Route({path: '/', component: Overview, name: 'site-admin.courses.book-overview'})
], {frame: Frame});
