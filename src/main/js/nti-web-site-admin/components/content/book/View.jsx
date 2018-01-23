import {Router, Route} from 'nti-web-routing';

import Overview from './overview';
import Frame from './Frame';

export default Router.for([
	Route({path: '/', component: Overview, name: 'site-admin.courses.book-overview'})
], {frame: Frame});
