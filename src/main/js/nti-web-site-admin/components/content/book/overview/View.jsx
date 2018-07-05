import React from 'react';
import PropTypes from 'prop-types';
import { Widgets } from '@nti/web-reports';

const { ActiveDays, ActiveUsers, ActiveTimes } = Widgets;

export default class SiteAdminBookOverview extends React.Component {
	static propTypes = {
		course: PropTypes.object
	}

	state = {}

	componentDidMount () {
		const {course} = this.props;

		if(!this.state.resp && course && course.hasLink('users')) {
			course.fetchLink('users').then(resp => {
				this.setState({resp});
			});
		}
	}

	render () {
		const {course} = this.props;

		return (
			<div className="site-admin-book-overview">
				<div className="site-admin-row">
					<div className="active-users">
						<ActiveUsers entity={course}/>
					</div>
				</div>
				<div className="active-days">
					<ActiveDays entity={course}/>
				</div>
				<div className="active-times">
					<ActiveTimes course={course}/>
				</div>
			</div>
		);
	}
}
