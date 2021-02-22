import { Router, Route } from '@nti/web-routing';
import { encodeForURI } from '@nti/lib-ntiids';

import UserCourseEnrollment from '../../user-course-enrollment';
import UserBookEnrollment from '../../user-book-enrollment';

import Overview from './overview';
import Reports from './reports';
import Courses from './courses';
import Books from './books';
import Transcript from './transcript';
import Frame from './Frame';

export default Router.for([
	Route({
		path: '/transcript/:enrollmentID',
		component: UserCourseEnrollment,
		props: { userContext: true },
		getRouteFor(obj, context) {
			if (
				obj.MimeType ===
					'application/vnd.nextthought.courseware.courseinstanceenrollment' &&
				context === 'site-admin.users.user-transcript.list'
			) {
				return `/transcript/${encodeForURI(obj.getID())}`;
			}

			return null;
		},
	}),
	Route({
		path: '/book/:bookID',
		component: UserBookEnrollment,
		props: { userContext: true },
		getRouteFor(obj, context) {
			if (
				obj.MimeType ===
					'application/vnd.nextthought.userbundlerecord' &&
				context === 'site-admin.users.user-books.list'
			) {
				return `/book/${encodeForURI(obj.Bundle.getID())}`;
			}

			return null;
		},
	}),
	Route({
		path: '/',
		component: Router.for(
			[
				Route({
					path: '/books',
					component: Books,
					name: 'site-admin.users.user-books',
				}),
				Route({
					path: '/courses',
					component: Courses,
					name: 'site-admin.users.user-courses',
				}),
				Route({
					path: '/transcript',
					component: Transcript,
					name: 'site-admin.users.user-transcript',
				}),
				Route({
					path: '/reports',
					component: Reports,
					name: 'site-admin.users.user-overview',
				}),
				Route({
					path: '/',
					component: Overview,
					name: 'site-admin.users.user-overview',
				}),
			],
			{ frame: Frame }
		),
	}),
]);
