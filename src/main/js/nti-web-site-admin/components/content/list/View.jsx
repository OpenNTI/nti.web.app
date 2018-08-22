import {Router, Route} from '@nti/web-routing';// eslint-disable-line

import CoursesTable from './table/CoursesTable';
import BooksTable from './table/BooksTable';
import Frame from './Frame';
import FilterableContentList from './FilterableContentList';

const f = (global.$AppConfig || {}).features || {};
const USE_NEW = Boolean(f['use-new-user-list']);

export default Router.for([
	Route({path: '/books', component: BooksTable, name: 'site-admin.content.content-list-books'}),
	Route({path: '/', component: CoursesTable, name: 'site-admin.content.content-list-courses'}),
], {frame: USE_NEW ? Frame : FilterableContentList});
