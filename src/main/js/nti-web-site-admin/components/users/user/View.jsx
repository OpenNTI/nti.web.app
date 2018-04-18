import {Router, Route} from '@nti/web-routing';// eslint-disable-line
import {encodeForURI} from '@nti/lib-ntiids';

import UserCourseEnrollment from '../../user-course-enrollment';

import Overview from './overview';
import Reports from './reports';
import Transcript from './transcript';
import Frame from './Frame';

export default Router.for([
	Route({
		path: '/transcript/:enrollmentID',
		component: UserCourseEnrollment,
		props: {userContext: true},
		frameless: true,
		getRouteFor (obj, context) {
			if (obj.MimeType === 'application/vnd.nextthought.courseware.courseinstanceenrollment' && context === 'site-admin.users.user-transcipt.list') {
				return `/transcript/${encodeForURI(obj.getID())}`;
			}

			return null;
		}
	}),
	Route({path: '/transcript', component: Transcript, name: 'site-admin.users.user-transcript'}),
	Route({path: '/reports', component: Reports, name: 'site-admin.users.user-overview'}),
	Route({path: '/', component: Overview, name: 'site-admin.users.user-overview'})
], {frame: Frame});
