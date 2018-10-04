import {Router, Route} from '@nti/web-routing';// eslint-disable-line

import CoursesTable from './table/CoursesTable';
import BooksTable from './table/BooksTable';
import Frame from './Frame';

export default Router.for([
	Route({path: '/books', component: BooksTable, name: 'site-admin.content.content-list-books'}),
	Route({path: '/', component: CoursesTable, name: 'site-admin.content.content-list-courses'}),
], {frame: Frame});
