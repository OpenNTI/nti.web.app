import './View.scss';
// import React from 'react';
import {Router, Route} from '@nti/web-routing';

import Frame from './Frame';
import Configuration from './configuration';
import Content from './content';
import Dashboard from './dashboard';
import Reports from './reports';
import Users from './users';

export default Router.for([
	Route({path: '/dashboard', component: Dashboard}),
	Route({path: '/content', component: Content}),
	Route({path: '/users', component: Users}),
	Route({path: '/people', component: Users}),
	Route({path: '/reports', component: Reports}),
	Route({path: '/configuration', component: Configuration}),
	Route({path: '/', component: Dashboard})
], {title: 'Site Administration', frame: Frame});
