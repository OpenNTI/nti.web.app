import {Router, Route} from '@nti/web-routing';

import UserBookEnrollment from '../../user-book-enrollment';

import Overview from './overview';
import Reports from './reports';
import Roster from './roster';
import Frame from './Frame';

export default Router.for([
	Route({
		path: '/roster/:userID',
		component: UserBookEnrollment,
		props: {courseContext: true},
		frameless: true,
		getRouteFor (obj, context) {
			if (obj.MimeType === 'application/vnd.nextthought.userbundlerecord' && context === 'site-admin.courses.book-roster.list') {
				return `/roster/${obj.User.getID()}`;
			}

			return null;
		}
	}),
	Route({ path: '/reports', component: Reports, name: 'site-admin.courses.book-reprots' }),
	Route({ path: '/roster', component: Roster, name: 'site-admin.courses.book-roster' }),
	Route({path: '/', component: Overview, name: 'site-admin.courses.book-overview'})
], {frame: Frame});
