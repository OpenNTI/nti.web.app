import {Router, Route} from 'nti-web-routing';// eslint-disable-line
import {encodeForURI} from 'nti-lib-ntiids';

import List from './list';
import Info from './info';
import BookInfo from './book';

const MIME_TYPE = 'application/vnd.nextthought.courseware.courseinstanceadministrativerole';

export default Router.for([
	Route({
		path: '/course/:courseID',
		component: Info,
		getRouteFor: (obj, context) => {
			if(obj.MimeType === MIME_TYPE && context === 'site-admin.course-list-item') {
				return `/course/${encodeForURI(obj.getCourseID())}`;
			}
		}
	}),
	Route({
		path: '/book/:bookID',
		component: BookInfo,
		getRouteFor: (obj, context) => {
			if (obj.MimeType === 'application/vnd.nextthought.contentpackagebundle' && context === 'site-admin.book-list-item') {
				return `/book/${encodeForURI(obj.getID())}`;
			}

			return null;
		}
	}),
	Route({path: '/', component: List, name: 'site-admin.courses'})
]);
