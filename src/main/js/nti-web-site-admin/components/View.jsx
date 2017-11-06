// import React from 'react';
import {Router, Route} from 'nti-web-routing';// eslint-disable-line

import Advanced from'./advanced';
import Course from './course';
import Dashboard from './dashboard';
import Reports from './reports';
import Users from './users';

export default Router.for(
	Route({path: '/dashboard', component: Dashboard}),
	Route({path: '/course', component: Course}),
	Route({path: '/users', component: Users}),
	Route({path: '/reports', component: Reports}),
	Route({path: '/advanced', component: Advanced})
);


// import React from 'react';
// import PropTypes from 'prop-types';
// import { Switch } from 'nti-web-commons';

// import Advanced from './advanced';
// import CourseAdmin from './course';

// export default class AdminBody extends React.Component {
// 	static propTypes = {
// 		workspace: PropTypes.object.isRequired
// 	}

// 	constructor (props) {
// 		super(props);
// 		this.state = {};
// 	}

// 	renderAdvancedTab () {
// 		return (<Advanced workspace={this.props.workspace}/>);
// 	}

// 	render () {
// 		return (<div className="site-admin-content">
// 			<Switch.Panel active="Course">
// 				<Switch.Controls className="admin-menu">
// 					<Switch.Trigger className="admin-menu-item" item="Course">Course</Switch.Trigger>
// 					<Switch.Trigger className="admin-menu-item" item="Advanced">Advanced</Switch.Trigger>
// 				</Switch.Controls>
// 				<Switch.Container>
// 					<Switch.Item className="admin-component" name="Course" component={CourseAdmin}/>
// 					<Switch.Item className="admin-component" name="Advanced" component={Advanced} workspace={this.props.workspace}/>
// 				</Switch.Container>
// 			</Switch.Panel>
// 		</div>);
// 	}
// }
