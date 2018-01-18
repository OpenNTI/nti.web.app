import {Router, Route} from 'nti-web-routing';
import {encodeForURI} from 'nti-lib-ntiids';

import UserCourseEnrollment from '../../user-course-enrollment';

import Overview from './overview';
import Reports from './reports';
import Roster from './roster';
import Frame from './Frame';

export default Router.for([
	Route({
		path: '/roster/:enrollmentID',
		component: UserCourseEnrollment,
		props: {courseContext: true},
		frameless: true,
		getRouteFor (obj, context) {
			if (obj.MimeType === 'application/vnd.nextthought.courses.rosterenrollmentsummary' && context === 'site-admin.courses.course-roster.list') {
				return `/roster/${encodeForURI(obj.getID())}`;
			}

			return null;
		}
	}),
	Route({path: '/roster', component: Roster, name: 'site-admin.courses.course-roster'}),
	Route({path: '/reports', component: Reports, name: 'site-admin.courses.course-reports'}),
	Route({path: '/', component: Overview, name: 'site-admin.courses.course-overview'})
], {frame: Frame});

